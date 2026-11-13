import type { APIRoute } from "astro";
import { site } from "../data/site";
import { indexablePaths } from "../data/pages";
export const GET: APIRoute = () =>
  new Response(
    `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${(site.production ? indexablePaths() : []).map((path) => `<url><loc>${site.origin}${path}</loc></url>`).join("")}</urlset>`,
    { headers: { "Content-Type": "application/xml; charset=utf-8" } },
  );
