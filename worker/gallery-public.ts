import type { Env } from "./types";
import { projects, images, galleryReady } from "./gallery-store";
import { storedVariants } from "./gallery-images";
import {
  projectTypes,
  type Project,
  type ProjectImage,
} from "../src/lib/gallery";
const origin = "https://drenazoirengimas.lt";
export const escapeHtml = (v: unknown) =>
  String(v ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ]!,
  );
function imageHtml(
  image: ProjectImage,
  title: string,
  priority = false,
  card = false,
) {
  const variants = storedVariants(image.variants),
    big = variants[2],
    src = `/projektu-nuotraukos/${image.id}/960.webp`;
  return `<img src="${src}" srcset="${variants
    .map((v) => `/projektu-nuotraukos/${image.id}/${v.slot}.webp ${v.width}w`)
    .filter(
      (v, i, a) =>
        a.findIndex((x) => x.split(" ").at(-1) === v.split(" ").at(-1)) === i,
    )
    .join(
      ", ",
    )}" sizes="(max-width: 600px) 90vw, (max-width: 1024px) 45vw, ${card ? "420px" : "760px"}" width="${big.width}" height="${big.height}" alt="${escapeHtml(image.alt_text || title)}" loading="${priority ? "eager" : "lazy"}" decoding="async">`;
}
async function fillHtml(
  request: Request,
  env: Env,
  content: string,
  p?: Project,
  cover?: ProjectImage,
) {
  const shell = await env.ASSETS.fetch(
    new Request(new URL("/projektai/", request.url)),
  );
  let html = await shell.text();
  const pathname = p ? `/projektai/${p.slug}/` : "/projektai/";
  const title = p ? p.title : "Įgyvendinti projektai",
    fullTitle = title + " | drenazoirengimas.lt";
  const description = p
    ? (p.title + ". " + p.description).replace(/\s+/g, " ").slice(0, 155)
    : "Atlikti drenažo ir lietaus vandens nuvedimo darbai: situacija, sprendimas ir projektų nuotraukos.";
  const canonical = origin + pathname,
    og = cover
      ? `${origin}/projektu-nuotraukos/${cover.id}/1600.webp`
      : `${origin}/images/og.jpg`;
  const indexable =
    env.SEO_INDEXABLE === "true" &&
    html.includes('data-gallery-production="true"') &&
    new URL(request.url).hostname === "drenazoirengimas.lt";
  html = html
    .replace(/<!--gallery:start-->[\s\S]*?<!--gallery:end-->/, content)
    .replace(/<h1[\s\S]*?<\/h1>/, `<h1>${escapeHtml(title)}</h1>`)
    .replace(
      /<title>[\s\S]*?<\/title>/,
      `<title>${escapeHtml(fullTitle)}</title>`,
    )
    .replace(
      /<link rel="canonical"[^>]*>/,
      `<link rel="canonical" href="${canonical}">`,
    )
    .replace(
      /<meta name="description"[^>]*>/,
      `<meta name="description" content="${escapeHtml(description)}">`,
    )
    .replace(
      /<meta name="robots"[^>]*>/,
      `<meta name="robots" content="${indexable ? "index, follow" : "noindex, follow"}">`,
    );
  for (const [name, value] of Object.entries({
    "og:title": fullTitle,
    "og:description": description,
    "og:url": canonical,
    "og:image": og,
    "og:image:alt": cover?.alt_text || title,
    "twitter:title": fullTitle,
    "twitter:description": description,
    "twitter:image": og,
  })) {
    html = html.replace(
      new RegExp(`<meta (?:property|name)="${name}"[^>]*>`),
      `<meta ${name.startsWith("og:") ? "property" : "name"}="${name}" content="${escapeHtml(value)}">`,
    );
  }
  html = html.replace(/<meta property="og:image:(?:width|height)"[^>]*>/g, "");
  const crumbs = [
    { name: "Pradžia", item: origin + "/" },
    { name: "Projektai", item: origin + "/projektai/" },
  ];
  if (p) crumbs.push({ name: p.title, item: canonical });
  html = html.replace(
    /<nav class="breadcrumbs"[\s\S]*?<\/nav>/,
    `<nav class="breadcrumbs" aria-label="Puslapio vieta">${crumbs.map((c, i) => (i === crumbs.length - 1 ? `<span>${escapeHtml(c.name)}</span>` : `<a href="${new URL(c.item).pathname}">${escapeHtml(c.name)}</a><span aria-hidden="true">›</span>`)).join("")}</nav>`,
  );
  const schema = [
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "@id": origin + "/#website",
      name: "Drenažo įrengimas",
      url: origin + "/",
      inLanguage: "lt-LT",
    },
    {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "@id": canonical + "#webpage",
      name: fullTitle,
      url: canonical,
      description,
      inLanguage: "lt-LT",
      isPartOf: { "@id": origin + "/#website" },
      ...(p
        ? {
            dateModified: new Date(p.updated_at).toISOString(),
            primaryImageOfPage: {
              "@type": "ImageObject",
              url: og,
              width: cover?.width,
              height: cover?.height,
            },
          }
        : {}),
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: crumbs.map((c, i) => ({
        "@type": "ListItem",
        position: i + 1,
        ...c,
      })),
    },
  ];
  html = html.replace(
    /<script type="application\/ld\+json">[\s\S]*?<\/script>/g,
    "",
  );
  html = html.replace(
    "</head>",
    schema
      .map(
        (s) =>
          `<script type="application/ld+json">${JSON.stringify(s).replace(/</g, "\\u003c")}</script>`,
      )
      .join("") + "</head>",
  );
  return new Response(request.method === "HEAD" ? null : html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
      ...(!indexable ? { "X-Robots-Tag": "noindex, follow" } : {}),
    },
  });
}
export async function galleryPublic(
  request: Request,
  env: Env,
): Promise<Response | null> {
  const url = new URL(request.url),
    listing = url.pathname === "/projektai/" || url.pathname === "/projektai";
  if (!galleryReady(env)) return listing ? null : null;
  try {
    if (listing) {
      const rows = await projects(env);
      if (!rows.length) return null;
      const cards = [];
      const covers = (
        await env.DB.prepare(
          "SELECT i.* FROM gallery_images i JOIN gallery_projects p ON p.cover_image_id=i.id WHERE p.status='published'",
        ).all<ProjectImage>()
      ).results;
      for (const p of rows) {
        const cover = covers.find((im) => im.id === p.cover_image_id);
        if (!cover) continue;
        cards.push(
          `<a class="project-card" href="/projektai/${p.slug}/">${imageHtml(cover, p.title, cards.length === 0, true)}<div>${p.project_type ? `<span class="eyebrow">${projectTypes[p.project_type]}</span>` : ""}<h2>${escapeHtml(p.title)}</h2>${p.location ? `<p class="small">${escapeHtml(p.location)}</p>` : ""}<p>${escapeHtml(p.description.slice(0, 190))}</p><span class="text-link">Peržiūrėti projektą →</span></div></a>`,
        );
      }
      return fillHtml(
        request,
        env,
        `<div class="public-project-grid">${cards.join("")}</div>`,
        undefined,
        undefined,
      );
    }
    const match = url.pathname.match(/^\/projektai\/([a-z0-9-]+)\/$/);
    if (!match) return null;
    const p = await env.DB.prepare(
      "SELECT * FROM gallery_projects WHERE slug=? AND status='published'",
    )
      .bind(match[1])
      .first<Project>();
    if (!p) return null;
    const photos = await images(env, p.id),
      cover = photos.find((im) => im.id === p.cover_image_id);
    if (!cover) return null;
    const ordered = [cover, ...photos.filter((im) => im.id !== cover.id)];
    const meta = [
      p.project_type ? projectTypes[p.project_type] : "",
      p.location || "",
      p.completion_date || "",
    ].filter(Boolean);
    const content = `${meta.length ? `<p class="project-meta">${meta.map(escapeHtml).join(" · ")}</p>` : ""}<div class="project-description">${escapeHtml(
      p.description,
    )
      .split(/\n+/)
      .filter(Boolean)
      .map((t) => `<p>${t}</p>`)
      .join(
        "",
      )}</div><div class="project-photos">${ordered.map((im, i) => `<figure>${imageHtml(im, p.title, i === 0)}</figure>`).join("")}</div><h2>Turite panašią problemą?</h2><p>Aprašykite savo situaciją ir objekto vietą.</p><a class="button" href="/gauti-pasiulyma/" data-event="primary_cta_click">Gauti pasiūlymą →</a>`;
    return fillHtml(request, env, content, p, cover);
  } catch {
    return listing
      ? null
      : new Response(
          "Šiuo metu projekto parodyti nepavyko. Pabandykite vėliau.",
          {
            status: 503,
            headers: {
              "Content-Type": "text/plain; charset=utf-8",
              "Cache-Control": "no-store",
              "Retry-After": "60",
            },
          },
        );
  }
}
export async function gallerySitemap(
  request: Request,
  env: Env,
): Promise<Response> {
  const base = await env.ASSETS.fetch(
    new Request(new URL("/sitemap.xml", request.url)),
  );
  let xml = await base.text();
  if (!xml.includes("<loc>") || !galleryReady(env))
    return new Response(xml, {
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "no-store",
      },
    });
  try {
    const rows = await projects(env);
    if (rows.length)
      xml = xml.replace(
        "</urlset>",
        `<url><loc>${origin}/projektai/</loc></url>` +
          rows
            .map(
              (p) =>
                `<url><loc>${origin}/projektai/${escapeHtml(p.slug)}/</loc><lastmod>${new Date(p.updated_at).toISOString()}</lastmod></url>`,
            )
            .join("") +
          "</urlset>",
      );
  } catch {
    return new Response("Sitemap laikinai nepasiekiamas.", {
      status: 503,
      headers: { "Cache-Control": "no-store", "Retry-After": "60" },
    });
  }
  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}
