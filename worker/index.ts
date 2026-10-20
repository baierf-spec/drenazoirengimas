import { galleryAccess } from "./gallery-access";
import { galleryApi, galleryJson, publicPhoto } from "./gallery-api";
import { galleryPublic, gallerySitemap } from "./gallery-public";
import { galleryReady, drainGalleryDeletions } from "./gallery-store";
import type { Env, LeadRecord } from "./types";
import { receiveLead, json } from "./leads";
import { constantEqual, sign } from "./security";
import { deliverLead } from "./email";
const securityHeaders: Record<string, string> = {
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "X-Frame-Options": "DENY",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
  "Content-Security-Policy":
    "default-src 'self'; script-src 'self' 'unsafe-inline' https://challenges.cloudflare.com https://www.googletagmanager.com https://static.cloudflareinsights.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https://*.google-analytics.com; font-src 'self'; connect-src 'self' https://challenges.cloudflare.com https://*.google-analytics.com https://*.analytics.google.com https://cloudflareinsights.com; frame-src https://challenges.cloudflare.com; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'",
};
export async function handleRequest(
  request: Request,
  env: Env,
  ctx: Pick<ExecutionContext, "waitUntil">,
): Promise<Response> {
  const url = new URL(request.url);
  const preview =
    url.hostname !== "drenazoirengimas.lt" || env.SEO_INDEXABLE !== "true";
  let response: Response;
  if (
    url.hostname === "www.drenazoirengimas.lt" ||
    (url.hostname === "drenazoirengimas.lt" && url.protocol === "http:")
  ) {
    url.protocol = "https:";
    url.hostname = "drenazoirengimas.lt";
    return Response.redirect(url.href, 301);
  }
  let decodedPath: string;
  try {
    decodedPath = decodeURIComponent(url.pathname)
      .replaceAll("\\", "/")
      .replace(/\/+/g, "/");
  } catch {
    return new Response("Nerasta", { status: 404 });
  }
  const manager = /^\/gallery-manager(?:\/|\.html|$)/.test(decodedPath);
  const galleryApiPath = /^\/api\/gallery(?:\/|$)/.test(decodedPath);
  if (manager || galleryApiPath) {
    const access = await galleryAccess(request, env);
    if (access !== 200)
      response = galleryJson(
        {
          error:
            access === 503
              ? "Galerijos valdymas dar neaktyvuotas."
              : "Prisijunkite su svetainės savininko paskyra.",
        },
        access,
      );
    else if (galleryApiPath) response = await galleryApi(request, env);
    else if (!["GET", "HEAD"].includes(request.method))
      response = galleryJson({ error: "Metodas neleidžiamas." }, 405);
    else
      response = await env.ASSETS.fetch(
        new Request(new URL("/gallery-manager/", request.url)),
      );
  } else if (!preview && url.pathname === "/sitemap.xml")
    response = await gallerySitemap(request, env);
  else if (url.pathname.startsWith("/projektu-nuotraukos/")) {
    try {
      response = galleryReady(env)
        ? await publicPhoto(request, env)
        : new Response("Nerasta", { status: 404 });
    } catch {
      response = new Response("Laikinai nepasiekiama", { status: 503 });
    }
  } else if (preview && url.pathname === "/robots.txt")
    response = new Response("User-agent: *\nDisallow: /\n", {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  else if (preview && url.pathname === "/sitemap.xml")
    response = new Response(
      '<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>',
      { headers: { "Content-Type": "application/xml; charset=utf-8" } },
    );
  else if (url.pathname === "/api/leads")
    response = await receiveLead(request, env, ctx);
  else if (url.pathname === "/api/photo")
    response = await getPhoto(request, env);
  else if (url.pathname.startsWith("/api/"))
    response = json({ error: "Puslapis nerastas." }, 404);
  else {
    if (!["GET", "HEAD"].includes(request.method))
      return json({ error: "Metodas neleidžiamas." }, 405, {
        Allow: "GET, HEAD",
      });
    if (url.pathname.endsWith("/index.html")) {
      url.pathname = url.pathname.slice(0, -10);
      return Response.redirect(url.href, 301);
    }
    if (url.pathname.endsWith(".html") && url.pathname !== "/404.html") {
      url.pathname = url.pathname.slice(0, -5) + "/";
      return Response.redirect(url.href, 301);
    }
    // ASSETS handles clean paths and a genuine 404; no SPA fallback.
    const publicGallery =
      url.pathname.startsWith("/projektai/") &&
      ["GET", "HEAD"].includes(request.method)
        ? await galleryPublic(request, env)
        : null;
    response = publicGallery || (await env.ASSETS.fetch(request));
    if (url.pathname === "/404.html" && response.status === 200)
      response = new Response(response.body, {
        status: 404,
        headers: response.headers,
      });
  }
  const headers = new Headers(response.headers);
  for (const [key, value] of Object.entries(securityHeaders))
    headers.set(key, value);
  if (url.protocol === "https:")
    headers.set("Strict-Transport-Security", "max-age=31536000");
  if (manager || galleryApiPath) {
    headers.set("Cache-Control", "no-store");
    headers.set("X-Robots-Tag", "noindex, nofollow");
    if (manager)
      headers.set(
        "Content-Security-Policy",
        securityHeaders["Content-Security-Policy"].replace(
          "script-src 'self'",
          "script-src 'self' 'wasm-unsafe-eval'",
        ) + "; worker-src 'self' blob:",
      );
  }
  if (
    preview ||
    manager ||
    url.pathname.startsWith("/api/") ||
    response.status >= 400
  )
    headers.set("X-Robots-Tag", "noindex, nofollow");
  if (
    !url.pathname.startsWith("/api/") &&
    !url.pathname.startsWith("/projektu-nuotraukos/") &&
    url.pathname.match(/\.(?:avif|webp|jpg|woff2)$/)
  )
    headers.set(
      "Cache-Control",
      url.pathname.startsWith("/_astro/")
        ? "public, max-age=31536000, immutable"
        : "public, max-age=86400",
    );
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}
export async function getPhoto(request: Request, env: Env): Promise<Response> {
  if (!["GET", "HEAD"].includes(request.method))
    return json({ error: "Metodas neleidžiamas." }, 405, {
      Allow: "GET, HEAD",
    });
  const url = new URL(request.url);
  const key = url.searchParams.get("key") || "";
  const expires = Number(url.searchParams.get("expires"));
  const sig = url.searchParams.get("sig") || "";
  if (
    !env.PHOTO_SIGNING_SECRET ||
    !env.PHOTOS ||
    !/^leads\/[a-f0-9-]{36}\/[a-f0-9-]{36}\.(jpg|png|webp)$/.test(key) ||
    !Number.isFinite(expires) ||
    expires < Date.now() ||
    expires > Date.now() + 7 * 864e5 + 60000 ||
    !constantEqual(
      await sign(`${key}:${expires}`, env.PHOTO_SIGNING_SECRET),
      sig,
    )
  )
    return json({ error: "Nuoroda netinkama arba nebegalioja." }, 403);
  const object = await env.PHOTOS.get(key);
  if (!object) return json({ error: "Nuotrauka nerasta." }, 404);
  return new Response(request.method === "HEAD" ? null : object.body, {
    headers: {
      "Content-Type":
        object.httpMetadata?.contentType || "application/octet-stream",
      "Content-Disposition":
        'attachment; filename="objekto-nuotrauka.' + key.split(".").pop() + '"',
      "Cache-Control": "private, no-store",
      "Referrer-Policy": "no-referrer",
      "X-Content-Type-Options": "nosniff",
      "X-Robots-Tag": "noindex, nofollow",
    },
  });
}
export async function maintenance(env: Env) {
  if (galleryReady(env)) {
    try {
      await drainGalleryDeletions(env);
    } catch {
      /* Gallery can be enabled after migration. */
    }
  }
  const now = Date.now();
  const stale = await env.DB.prepare(
    "SELECT * FROM drainage_leads WHERE created_at<? LIMIT 50",
  )
    .bind(now - 90 * 864e5)
    .all<LeadRecord>();
  for (const row of stale.results) {
    await Promise.all(
      (JSON.parse(row.photos) as string[]).map((key) => env.PHOTOS.delete(key)),
    );
    await env.DB.prepare("DELETE FROM drainage_leads WHERE id=?")
      .bind(row.id)
      .run();
  }
  await env.DB.prepare("DELETE FROM drainage_rate_limits WHERE expires_at<?")
    .bind(now)
    .run();
  if (env.LEADS_ENABLED !== "true") return;
  const pending = await env.DB.prepare(
    "SELECT * FROM drainage_leads WHERE (admin_sent=0 OR customer_sent=0) AND next_attempt<=? AND lease_until<? ORDER BY created_at ASC LIMIT 10",
  )
    .bind(now, now)
    .all<LeadRecord>();
  for (const row of pending.results) await deliverLead(row, env);
}
export default {
  fetch: handleRequest,
  scheduled: (
    _controller: ScheduledController,
    env: Env,
    ctx: ExecutionContext,
  ) => ctx.waitUntil(maintenance(env)),
};
