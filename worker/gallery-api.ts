import type { Env } from "./types";
import {
  projectInput,
  slugify,
  type ProjectImage,
  type Variant,
} from "../src/lib/gallery";
import { boundedBody, readVariants, storedVariants } from "./gallery-images";
import { projects, project, drainGalleryDeletions } from "./gallery-store";
export function galleryJson(data: unknown, status = 200) {
  return Response.json(data, {
    status,
    headers: {
      "Cache-Control": "no-store",
      "X-Robots-Tag": "noindex, nofollow",
    },
  });
}
async function jsonBody(req: Request) {
  if (!req.headers.get("content-type")?.startsWith("application/json"))
    throw new Error("Tikimasi JSON duomenų.");
  return JSON.parse(new TextDecoder().decode(await boundedBody(req, 16384)));
}
const validId = (s: string) => /^[0-9a-f]{8}-[0-9a-f-]{27}$/.test(s);
const deletion = (env: Env, key: string) =>
  env.DB.prepare(
    "INSERT OR IGNORE INTO gallery_deletions(storage_key) VALUES(?)",
  ).bind(key);
export async function galleryApi(
  request: Request,
  env: Env,
): Promise<Response> {
  const url = new URL(request.url),
    path = url.pathname.replace(/\/$/, "");
  if (
    !["GET", "HEAD"].includes(request.method) &&
    request.headers.get("Origin") !== url.origin
  )
    return galleryJson({ error: "Neleistina užklausos kilmė." }, 403);
  try {
    if (path === "/api/gallery/projects") {
      if (request.method === "GET")
        return galleryJson({ projects: await projects(env, false) });
      if (request.method === "POST") {
        const value = projectInput.parse(await jsonBody(request));
        if (value.status !== "draft")
          return galleryJson(
            { error: "Pirmiausia išsaugokite juodraštį." },
            422,
          );
        const id = crypto.randomUUID(),
          now = Date.now();
        await env.DB.prepare(
          "INSERT INTO gallery_projects(id,slug,title,location,project_type,description,completion_date,status,sort_order,created_at,updated_at) VALUES(?,?,?,?,?,?,?,'draft',?, ?,?)",
        )
          .bind(
            id,
            slugify(value.title) + "-" + id.slice(0, 8),
            value.title,
            value.location,
            value.project_type,
            value.description,
            value.completion_date,
            -now,
            now,
            now,
          )
          .run();
        return galleryJson(await project(env, id), 201);
      }
    }
    if (path === "/api/gallery/reorder" && request.method === "POST") {
      const data = (await jsonBody(request)) as { ids?: unknown };
      if (
        !Array.isArray(data.ids) ||
        !data.ids.every((v) => typeof v === "string" && validId(v))
      )
        throw new Error("Netinkama projektų tvarka.");
      const rows = await projects(env, false);
      const ids = data.ids as string[];
      if (
        ids.length !== rows.length ||
        new Set(ids).size !== ids.length ||
        rows.some((p) => !ids.includes(p.id))
      )
        return galleryJson(
          { error: "Sąrašas pasikeitė. Atnaujinkite puslapį." },
          409,
        );
      await env.DB.batch(
        ids.map((id, i) =>
          env.DB.prepare(
            "UPDATE gallery_projects SET sort_order=?,updated_at=MAX(updated_at+1,?) WHERE id=?",
          ).bind(i, Date.now(), id),
        ),
      );
      return galleryJson({ ok: true });
    }
    const imageMatch = path.match(
      /^\/api\/gallery\/images\/([0-9a-f-]{36})(?:\/(480|960|1600)\.webp)?$/,
    );
    if (imageMatch) {
      const image = await env.DB.prepare(
        "SELECT * FROM gallery_images WHERE id=?",
      )
        .bind(imageMatch[1])
        .first<ProjectImage>();
      if (!image) return galleryJson({ error: "Nuotrauka nerasta." }, 404);
      if (imageMatch[2] && ["GET", "HEAD"].includes(request.method))
        return photoResponse(request, env, image, Number(imageMatch[2]));
      if (request.method === "DELETE") {
        await env.DB.batch([
          ...storedVariants(image.variants).map((v) => deletion(env, v.key)),
          env.DB.prepare("DELETE FROM gallery_images WHERE id=?").bind(
            image.id,
          ),
          env.DB.prepare(
            "UPDATE gallery_projects SET updated_at=MAX(updated_at+1,?) WHERE id=?",
          ).bind(Date.now(), image.project_id),
        ]);
        await drainGalleryDeletions(env);
        return galleryJson(await project(env, image.project_id));
      }
      if (request.method === "PATCH") {
        const value = (await jsonBody(request)) as { alt_text?: unknown };
        if (typeof value.alt_text !== "string" || value.alt_text.length > 250)
          throw new Error("Aprašymas gali būti iki 250 simbolių.");
        await env.DB.batch([
          env.DB.prepare(
            "UPDATE gallery_images SET alt_text=? WHERE id=?",
          ).bind(value.alt_text.trim(), image.id),
          env.DB.prepare(
            "UPDATE gallery_projects SET updated_at=MAX(updated_at+1,?) WHERE id=?",
          ).bind(Date.now(), image.project_id),
        ]);
        return galleryJson({ ok: true });
      }
    }
    const match = path.match(
      /^\/api\/gallery\/projects\/([0-9a-f-]{36})(?:\/(photos|reorder))?$/,
    );
    if (match) {
      const p = await project(env, match[1]);
      if (!p) return galleryJson({ error: "Projektas nerastas." }, 404);
      if (!match[2] && request.method === "GET") return galleryJson(p);
      if (!match[2] && request.method === "PATCH") {
        const v = projectInput.parse(await jsonBody(request));
        if (v.version !== p.updated_at)
          return galleryJson(
            {
              error:
                "Projektas pasikeitė kitame lange. Atnaujinkite prieš išsaugodami.",
            },
            409,
          );
        if (
          v.status === "published" &&
          (v.title === "Naujas projektas" ||
            v.description.length < 20 ||
            !p.images.some((im) => im.id === v.cover_image_id))
        )
          return galleryJson(
            {
              error:
                "Publikavimui reikia pavadinimo, bent 20 simbolių aprašymo ir viršelio nuotraukos.",
            },
            422,
          );
        if (
          v.status === "published" &&
          (await env.DB.prepare(
            "SELECT id FROM gallery_projects WHERE status='published' AND lower(title)=lower(?) AND id<>?",
          )
            .bind(v.title, p.id)
            .first())
        )
          return galleryJson(
            {
              error:
                "Toks projekto pavadinimas jau naudojamas. Patikslinkite pavadinimą.",
            },
            422,
          );
        const now = Math.max(Date.now(), p.updated_at + 1),
          slug = p.published_at
            ? p.slug
            : slugify(v.title) + "-" + p.id.slice(0, 8);
        const r = await env.DB.prepare(
          "UPDATE gallery_projects SET slug=?,title=?,location=?,project_type=?,description=?,completion_date=?,cover_image_id=?,status=?,published_at=?,updated_at=? WHERE id=? AND updated_at=?",
        )
          .bind(
            slug,
            v.title,
            v.location,
            v.project_type,
            v.description,
            v.completion_date,
            v.cover_image_id,
            v.status,
            p.published_at || (v.status === "published" ? now : null),
            now,
            p.id,
            v.version,
          )
          .run();
        if (!r.meta.changes)
          return galleryJson(
            { error: "Projektas pasikeitė. Atnaujinkite puslapį." },
            409,
          );
        return galleryJson(await project(env, p.id));
      }
      if (!match[2] && request.method === "DELETE") {
        await env.DB.batch([
          ...p.images.flatMap((im) =>
            storedVariants(im.variants).map((v) => deletion(env, v.key)),
          ),
          env.DB.prepare("DELETE FROM gallery_projects WHERE id=?").bind(p.id),
        ]);
        await drainGalleryDeletions(env);
        return galleryJson({ ok: true });
      }
      if (match[2] === "reorder" && request.method === "POST") {
        const v = (await jsonBody(request)) as { ids?: unknown };
        if (
          !Array.isArray(v.ids) ||
          !v.ids.every((id) => typeof id === "string") ||
          v.ids.length !== p.images.length ||
          new Set(v.ids).size !== v.ids.length ||
          p.images.some((im) => !(v.ids as string[]).includes(im.id))
        )
          return galleryJson(
            { error: "Nuotraukų sąrašas pasikeitė. Atnaujinkite puslapį." },
            409,
          );
        const ids = v.ids as string[];
        await env.DB.batch([
          ...ids.map((id, i) =>
            env.DB.prepare(
              "UPDATE gallery_images SET sort_order=? WHERE id=? AND project_id=?",
            ).bind(i, id, p.id),
          ),
          env.DB.prepare(
            "UPDATE gallery_projects SET updated_at=MAX(updated_at+1,?) WHERE id=?",
          ).bind(Date.now(), p.id),
        ]);
        return galleryJson(await project(env, p.id));
      }
      if (match[2] === "photos" && request.method === "POST") {
        if (p.images.length >= 20)
          return galleryJson(
            { error: "Vienam projektui galima pridėti iki 20 nuotraukų." },
            422,
          );
        const input = await readVariants(request);
        const previous = await env.DB.prepare(
          "SELECT * FROM gallery_images WHERE id=?",
        )
          .bind(input.id)
          .first<ProjectImage>();
        if (previous)
          return previous.project_id === p.id &&
            previous.fingerprint === input.fingerprint
            ? galleryJson(await project(env, p.id))
            : galleryJson({ error: "Nuotraukos ID jau naudojamas." }, 409);
        const prefix = `gallery/${p.id}/${input.id}/${crypto.randomUUID()}`;
        const variants: Variant[] = input.variants.map((v) => ({
          slot: v.slot,
          width: v.width,
          height: v.height,
          key: `${prefix}/${v.slot}.webp`,
        }));
        const written: string[] = [];
        try {
          for (let i = 0; i < variants.length; i++) {
            await env.PHOTOS.put(variants[i].key, input.variants[i].bytes, {
              httpMetadata: { contentType: "image/webp" },
            });
            written.push(variants[i].key);
          }
          const big = input.variants[2],
            now = Date.now();
          await env.DB.batch([
            env.DB.prepare(
              "INSERT INTO gallery_images(id,project_id,storage_key,variants,fingerprint,alt_text,sort_order,width,height,created_at) VALUES(?,?,?,?,?,NULL,?,?,?,?)",
            ).bind(
              input.id,
              p.id,
              prefix,
              JSON.stringify(variants),
              input.fingerprint,
              now,
              big.width,
              big.height,
              now,
            ),
            env.DB.prepare(
              "UPDATE gallery_projects SET cover_image_id=COALESCE(cover_image_id,?),updated_at=MAX(updated_at+1,?) WHERE id=?",
            ).bind(input.id, now, p.id),
          ]);
        } catch {
          await Promise.all(
            written.map(async (key) => {
              try {
                await env.PHOTOS.delete(key);
              } catch {
                await deletion(env, key).run();
              }
            }),
          );
          const winner = await env.DB.prepare(
            "SELECT * FROM gallery_images WHERE id=?",
          )
            .bind(input.id)
            .first<ProjectImage>();
          if (
            winner?.project_id === p.id &&
            winner.fingerprint === input.fingerprint
          )
            return galleryJson(await project(env, p.id));
          return galleryJson(
            { error: "Nuotraukos nepavyko išsaugoti. Bandykite dar kartą." },
            409,
          );
        }
        return galleryJson(await project(env, p.id), 201);
      }
    }
    return galleryJson(
      { error: "Veiksmas nerastas arba metodas neleidžiamas." },
      405,
    );
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.includes("gallery_published_title")
    )
      return galleryJson(
        {
          error:
            "Toks projekto pavadinimas jau naudojamas. Patikslinkite pavadinimą.",
        },
        409,
      );
    if (
      error instanceof SyntaxError ||
      (error instanceof Error &&
        ("issues" in error ||
          /nuotrauk|duomen|WebP|matmen|variant|JSON/i.test(error.message)))
    )
      return galleryJson(
        {
          error:
            "Patikrinkite įrašytus duomenis ir nuotraukų formatą bei dydį.",
        },
        422,
      );
    return galleryJson(
      { error: "Nepavyko išsaugoti. Pabandykite dar kartą." },
      503,
    );
  }
}
export async function photoResponse(
  req: Request,
  env: Env,
  image: ProjectImage,
  slot: number,
) {
  const variant = storedVariants(image.variants).find((v) => v.slot === slot);
  if (!variant) return new Response("Nerasta", { status: 404 });
  const object = await env.PHOTOS.get(variant.key);
  if (!object) return new Response("Nerasta", { status: 404 });
  return new Response(req.method === "HEAD" ? null : object.body, {
    headers: {
      "Content-Type": "image/webp",
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
export async function publicPhoto(
  request: Request,
  env: Env,
): Promise<Response> {
  const match = new URL(request.url).pathname.match(
    /^\/projektu-nuotraukos\/([0-9a-f-]{36})\/(480|960|1600)\.webp$/,
  );
  if (!match || !["GET", "HEAD"].includes(request.method))
    return new Response("Nerasta", { status: 404 });
  const image = await env.DB.prepare(
    "SELECT i.* FROM gallery_images i JOIN gallery_projects p ON p.id=i.project_id WHERE i.id=? AND p.status='published'",
  )
    .bind(match[1])
    .first<ProjectImage>();
  return image
    ? photoResponse(request, env, image, Number(match[2]))
    : new Response("Nerasta", { status: 404 });
}
