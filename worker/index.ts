import { cmsAuth } from "./cms-auth";
import { runtimeSettings } from "../shared/site-config";
import type { Env } from "./types";
import { receiveLead, json } from "./leads";
import { handleLeadhub } from "./leadhub";
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
  settings = runtimeSettings(env as unknown as Record<string, unknown>),
): Promise<Response> {
  const url = new URL(request.url);
  const preview =
    url.hostname !== new URL(settings.origin).hostname ||
    !settings.indexingEnabled;
  let response: Response;
  if (
    url.hostname === "www." + new URL(settings.origin).hostname ||
    (url.hostname === new URL(settings.origin).hostname &&
      url.protocol === "http:")
  ) {
    url.protocol = "https:";
    url.hostname = new URL(settings.origin).hostname;
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
  const cmsPath = /^\/admin(?:\/|$)/.test(decodedPath);
  const authPath = ["/auth", "/callback"].includes(decodedPath);
  const manager = /^\/gallery-manager(?:\/|\.html|$)/.test(decodedPath);
  const galleryApiPath = /^\/api\/gallery(?:\/|$)/.test(decodedPath);
  if (authPath) response = await cmsAuth(request, env);
  else if (cmsPath && url.origin !== settings.origin)
    response = json({ error: "Puslapis nerastas." }, 404);
  else if (manager || galleryApiPath)
    response = json({ error: "Puslapis nerastas." }, 404);
  else if (preview && url.pathname === "/robots.txt")
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
  else if (url.pathname.startsWith("/api/leadhub/") || url.pathname.startsWith("/leadhub/gallery/"))
    response = (await handleLeadhub(request, env, ctx)) ?? json({ error: "Puslapis nerastas." }, 404);
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
    response = await env.ASSETS.fetch(request);
    if (url.pathname === "/404.html" && response.status === 200)
      response = new Response(response.body, {
        status: 404,
        headers: response.headers,
      });
  }
  const headers = new Headers(response.headers);
  for (const [key, value] of Object.entries(securityHeaders))
    if (!(authPath && headers.has(key))) headers.set(key, value);
  // Decap configuration templates require JavaScript evaluation. Keep this
  // exception scoped to the isolated admin shell; never public pages or OAuth.
  if (cmsPath) {
    headers.set("Cache-Control", "no-store");
    headers.set(
      "Content-Security-Policy",
      "default-src 'self'; script-src 'self' 'unsafe-eval' https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https://avatars.githubusercontent.com https://raw.githubusercontent.com https://user-images.githubusercontent.com; font-src 'self' data:; connect-src 'self' https://api.github.com https://raw.githubusercontent.com https://www.netlifystatus.com; frame-src blob:; worker-src 'self' blob:; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'",
    );
  }
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
    cmsPath ||
    authPath ||
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
export default { fetch: handleRequest };
