import { galleryRestoreSql } from "../scripts/gallery-backup.mjs";
import { describe, it, expect, vi, beforeAll } from "vitest";
import { readFileSync } from "node:fs";
import sharp from "sharp";
import { generateKeyPair, exportJWK, SignJWT } from "jose";
import { fixture } from "./fixtures";
import { galleryApi } from "../worker/gallery-api";
import { handleRequest } from "../worker";
import { galleryPublic, gallerySitemap } from "../worker/gallery-public";
import { galleryAccess } from "../worker/gallery-access";
import { cleanWebp } from "../worker/gallery-images";
import { projectInput } from "../src/lib/gallery";
let privateKey: CryptoKey, jwk: Record<string, unknown>;
beforeAll(async () => {
  const pair = await generateKeyPair("RS256");
  privateKey = pair.privateKey;
  jwk = {
    ...(await exportJWK(pair.publicKey)),
    kid: "gallery-test",
    alg: "RS256",
    use: "sig",
  };
});
function setup() {
  const f = fixture();
  f.sqlite.exec(readFileSync("migrations/0002_gallery.sql", "utf8"));
  f.env.GALLERY_ENABLED = "true";
  f.env.ACCESS_TEAM_DOMAIN = "gallery-test.cloudflareaccess.com";
  f.env.ACCESS_AUD = "gallery-app";
  f.env.GALLERY_OWNER_EMAILS = "owner@example.test";
  f.env.SEO_INDEXABLE = "true";
  f.env.ASSETS = {
    fetch: async (req: Request) => {
      const path = new URL(req.url).pathname;
      return new Response(
        readFileSync(
          path === "/sitemap.xml"
            ? ".audit-production/sitemap.xml"
            : ".audit-production/projektai/index.html",
          "utf8",
        ),
        {
          headers: {
            "Content-Type":
              path === "/sitemap.xml" ? "application/xml" : "text/html",
          },
        },
      );
    },
  } as unknown as Fetcher;
  return f;
}
function req(path: string, method = "GET", data?: unknown) {
  return new Request("https://drenazoirengimas.lt/api/gallery" + path, {
    method,
    headers: {
      Origin: "https://drenazoirengimas.lt",
      ...(data ? { "Content-Type": "application/json" } : {}),
    },
    body: data ? JSON.stringify(data) : undefined,
  });
}
const input = {
  title: "Tik testų projektas",
  description: "Automatinio testo duomenys. Viešai nepublikuojami.",
  location: null,
  project_type: "plot",
  completion_date: "2026",
  status: "draft",
  cover_image_id: null,
};
async function create(f: ReturnType<typeof setup>) {
  const r = await galleryApi(req("/projects", "POST", input), f.env);
  expect(r.status).toBe(201);
  return r.json();
}
async function photo(
  f: ReturnType<typeof setup>,
  id: string,
  imageId = crypto.randomUUID(),
) {
  const data = new FormData();
  data.set("id", imageId);
  for (const slot of [480, 960, 1600]) {
    const bytes = await sharp({
      create: { width: 48, height: 32, channels: 3, background: "#587a90" },
    })
      .webp()
      .toBuffer();
    data.set(
      String(slot),
      new File([new Uint8Array(bytes)], `${slot}.webp`, { type: "image/webp" }),
    );
  }
  const r = await galleryApi(
    new Request(
      `https://drenazoirengimas.lt/api/gallery/projects/${id}/photos`,
      {
        method: "POST",
        headers: { Origin: "https://drenazoirengimas.lt" },
        body: data,
      },
    ),
    f.env,
  );
  expect([200, 201]).toContain(r.status);
  return r.json();
}
async function change(
  f: ReturnType<typeof setup>,
  p: Record<string, unknown>,
  status: string,
) {
  const r = await galleryApi(
    req("/projects/" + p.id, "PATCH", {
      ...input,
      title: p.title,
      description: p.description,
      cover_image_id: p.cover_image_id,
      status,
      version: p.updated_at,
    }),
    f.env,
  );
  expect(r.status).toBe(200);
  return r.json();
}
describe("gallery validation, storage and public SSR", () => {
  it("rejects duplicate published titles so project SEO remains distinct", async () => {
    const f = setup();
    let a = await create(f);
    a = await photo(f, a.id);
    await change(f, a, "published");
    let b = await create(f);
    b = await photo(f, b.id);
    const r = await galleryApi(
      req("/projects/" + b.id, "PATCH", {
        ...input,
        status: "published",
        cover_image_id: b.cover_image_id,
        version: b.updated_at,
      }),
      f.env,
    );
    expect(r.status).toBe(422);
  });
  it("reorders projects/photos and retries failed object deletion", async () => {
    const f = setup();
    let a = await create(f);
    a = await photo(f, a.id);
    a = await photo(f, a.id);
    const b = await create(f);
    const ids = a.images.map((im: { id: string }) => im.id).reverse();
    const reordered = await galleryApi(
      req("/projects/" + a.id + "/reorder", "POST", { ids }),
      f.env,
    );
    expect(
      (await reordered.json()).images.map((im: { id: string }) => im.id),
    ).toEqual(ids);
    expect(
      (await galleryApi(req("/reorder", "POST", { ids: [a.id, b.id] }), f.env))
        .status,
    ).toBe(200);
    expect(
      (await (await galleryApi(req("/projects"), f.env)).json()).projects.map(
        (p: { id: string }) => p.id,
      ),
    ).toEqual([a.id, b.id]);
    vi.spyOn(f.env.PHOTOS, "delete").mockRejectedValueOnce(new Error("retry"));
    expect(
      (await galleryApi(req("/projects/" + a.id, "DELETE"), f.env)).status,
    ).toBe(200);
    expect(
      f.sqlite.prepare("SELECT count(*) AS n FROM gallery_deletions").get()!.n,
    ).toBe(1);
    const { drainGalleryDeletions } = await import("../worker/gallery-store");
    await drainGalleryDeletions(f.env);
    expect(f.objects.size).toBe(0);
  });
  it("restores gallery metadata without changing published slugs, IDs or photo keys", async () => {
    const f = setup();
    let p = await create(f);
    p = await photo(f, p.id);
    await change(f, p, "published");
    const backup = {
      format: 1,
      projects: f.sqlite.prepare("SELECT * FROM gallery_projects").all(),
      images: f.sqlite.prepare("SELECT * FROM gallery_images").all(),
    };
    const destination = setup();
    destination.sqlite.exec(galleryRestoreSql(backup));
    expect(
      destination.sqlite.prepare("SELECT * FROM gallery_projects").all(),
    ).toEqual(backup.projects);
    expect(
      destination.sqlite.prepare("SELECT * FROM gallery_images").all(),
    ).toEqual(backup.images);
  });
  it("validates project content and real calendar dates", () => {
    expect(projectInput.safeParse({ ...input, title: "x" }).success).toBe(
      false,
    );
    expect(
      projectInput.safeParse({ ...input, completion_date: "2026-02-31" })
        .success,
    ).toBe(false);
    expect(projectInput.safeParse(input).success).toBe(true);
  });
  it("creates only drafts and blocks publishing without a cover and description", async () => {
    const f = setup(),
      p = await create(f);
    expect(p.status).toBe("draft");
    const r = await galleryApi(
      req("/projects/" + p.id, "PATCH", {
        ...input,
        status: "published",
        version: p.updated_at,
      }),
      f.env,
    );
    expect(r.status).toBe(422);
    expect(
      await galleryPublic(
        new Request("https://drenazoirengimas.lt/projektai/" + p.slug + "/"),
        f.env,
      ),
    ).toBeNull();
  });
  it("publishes real stored photos, renders SSR metadata and adds only published URLs to sitemap", async () => {
    const f = setup();
    let p = await create(f);
    p = await photo(f, p.id);
    p = await change(f, p, "published");
    const detail = await galleryPublic(
      new Request(`https://drenazoirengimas.lt/projektai/${p.slug}/`),
      f.env,
    );
    expect(detail?.status).toBe(200);
    const html = await detail!.text();
    expect(html).toContain(`<h1>${p.title}</h1>`);
    expect(html).toContain(
      `href="https://drenazoirengimas.lt/projektai/${p.slug}/"`,
    );
    expect(html).toContain("srcset=");
    expect(html).toContain("BreadcrumbList");
    expect(html).not.toContain('content="noindex, follow"');
    expect(html).toContain(
      "/projektu-nuotraukos/" + p.cover_image_id + "/1600.webp",
    );
    const publishedImage = await handleRequest(
      new Request(
        `https://drenazoirengimas.lt/projektu-nuotraukos/${p.cover_image_id}/480.webp`,
      ),
      f.env,
      f.ctx,
    );
    expect(publishedImage.status).toBe(200);
    expect(publishedImage.headers.get("Cache-Control")).toBe("no-store");
    const listing = await galleryPublic(
      new Request("https://drenazoirengimas.lt/projektai/"),
      f.env,
    );
    expect(await listing!.text()).toContain(p.title);
    let xml = await (
      await gallerySitemap(
        new Request("https://drenazoirengimas.lt/sitemap.xml"),
        f.env,
      )
    ).text();
    expect(xml).toContain("/projektai/" + p.slug + "/");
    expect(xml).toContain("<lastmod>");
    const oldSlug = p.slug;
    p = await change(
      f,
      { ...p, title: "Pakeistas tik testo pavadinimas" },
      "published",
    );
    expect(p.slug).toBe(oldSlug);
    p = await change(f, p, "draft");
    xml = await (
      await gallerySitemap(
        new Request("https://drenazoirengimas.lt/sitemap.xml"),
        f.env,
      )
    ).text();
    expect(xml).not.toContain("/projektai/" + p.slug + "/");
    expect(
      await galleryPublic(
        new Request(`https://drenazoirengimas.lt/projektai/${p.slug}/`),
        f.env,
      ),
    ).toBeNull();
    const image = await handleRequest(
      new Request(
        `https://drenazoirengimas.lt/projektu-nuotraukos/${p.cover_image_id}/480.webp`,
      ),
      f.env,
      f.ctx,
    );
    expect(image.status).toBe(404);
  });
  it("handles optional-backend fallback without exposing errors", async () => {
    const f = setup();
    f.env.GALLERY_ENABLED = "false";
    expect(
      await galleryPublic(
        new Request("https://drenazoirengimas.lt/projektai/"),
        f.env,
      ),
    ).toBeNull();
    expect(
      (
        await handleRequest(
          new Request("https://drenazoirengimas.lt/gallery-manager/"),
          f.env,
          f.ctx,
        )
      ).status,
    ).toBe(503);
  });
  it("rejects cross-origin writes and optimistic edit conflicts", async () => {
    const f = setup(),
      p = await create(f);
    const r = req("/projects", "POST", input);
    r.headers.set("Origin", "https://evil.test");
    expect((await galleryApi(r, f.env)).status).toBe(403);
    expect(
      (
        await galleryApi(
          req("/projects/" + p.id, "PATCH", { ...input, version: 1 }),
          f.env,
        )
      ).status,
    ).toBe(409);
  });
  it("uploads idempotently and deletes photos and projects", async () => {
    const f = setup();
    let p = await create(f);
    const id = crypto.randomUUID();
    p = await photo(f, p.id, id);
    await photo(f, p.id, id);
    expect(f.objects.size).toBe(3);
    await change(f, p, "published");
    const r = await galleryApi(req("/images/" + id, "DELETE"), f.env);
    expect(r.status).toBe(200);
    p = await r.json();
    expect(p.status).toBe("draft");
    expect(p.cover_image_id).toBeNull();
    expect(f.objects.size).toBe(0);
    expect(
      (await galleryApi(req("/projects/" + p.id, "DELETE"), f.env)).status,
    ).toBe(200);
    expect(
      f.sqlite.prepare("SELECT count(*) AS n FROM gallery_projects").get()!.n,
    ).toBe(0);
  });
  it("rejects invalid images and strips EXIF chunks", async () => {
    expect(() =>
      cleanWebp(new TextEncoder().encode("<script>bad</script>")),
    ).toThrow();
    const original = await sharp({
      create: { width: 48, height: 32, channels: 3, background: "blue" },
    })
      .webp()
      .toBuffer();
    const chunk = Buffer.concat([
      Buffer.from("EXIF"),
      Buffer.from([4, 0, 0, 0]),
      Buffer.from("GPS!"),
    ]);
    const withExif = Buffer.concat([original, chunk]);
    withExif.writeUInt32LE(withExif.length - 8, 4);
    const clean = cleanWebp(withExif);
    expect(new TextDecoder().decode(clean.bytes)).not.toContain("GPS!");
    expect(clean.width).toBe(48);
    expect(clean.bytes.length).toBe(original.length);
  });
  it("escapes project content and keeps draft images private even with guessed URLs", async () => {
    const f = setup();
    let p = await create(f);
    p = await photo(f, p.id);
    p = await change(
      f,
      { ...p, title: "<script>alert(1)</script>" },
      "published",
    );
    const html = await (await galleryPublic(
      new Request("https://drenazoirengimas.lt/projektai/" + p.slug + "/"),
      f.env,
    ))!.text();
    expect(html).toContain("&lt;script&gt;");
    expect(html).not.toContain("<h1><script>");
  });
});
describe("Cloudflare Access token authorization", () => {
  async function token(
    email = "owner@example.test",
    aud = "gallery-app",
    expired = false,
  ) {
    return new SignJWT({ email })
      .setProtectedHeader({ alg: "RS256", kid: "gallery-test" })
      .setIssuer("https://gallery-test.cloudflareaccess.com")
      .setAudience(aud)
      .setIssuedAt()
      .setExpirationTime(expired ? "30 seconds ago" : "1h")
      .sign(privateKey);
  }
  it("fails closed for missing/spoofed tokens and every manager/API alias", async () => {
    const f = setup();
    for (const path of [
      "/gallery-manager/",
      "/gallery-manager.html",
      "/%67allery-manager/",
      "/api/gallery/projects",
    ]) {
      const r = new Request("https://drenazoirengimas.lt" + path, {
        headers: { "Cf-Access-Authenticated-User-Email": "owner@example.test" },
      });
      expect((await handleRequest(r, f.env, f.ctx)).status).toBe(401);
    }
    expect(
      await galleryAccess(
        new Request("https://drenazoirengimas.lt/gallery-manager/", {
          headers: { "Cf-Access-Jwt-Assertion": "fake" },
        }),
        f.env,
      ),
    ).toBe(401);
  });
  it("cryptographically verifies audience, issuer, expiry and exact owner email", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => Response.json({ keys: [jwk] })),
    );
    const f = setup(),
      request = async (email?: string, aud?: string, expired?: boolean) =>
        new Request("https://drenazoirengimas.lt/gallery-manager/", {
          headers: {
            "Cf-Access-Jwt-Assertion": await token(email, aud, expired),
          },
        });
    expect(await galleryAccess(await request(), f.env)).toBe(200);
    expect(
      await galleryAccess(await request("other@example.test"), f.env),
    ).toBe(403);
    expect(await galleryAccess(await request(undefined, "wrong"), f.env)).toBe(
      401,
    );
    expect(
      await galleryAccess(await request(undefined, undefined, true), f.env),
    ).toBe(401);
  });
});
