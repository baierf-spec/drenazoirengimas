import type { APIRoute } from "astro";
import { site } from "../data/site";
export const GET: APIRoute = () =>
  new Response(
    site.production
      ? `User-agent: *\nAllow: /\nDisallow: /api/\nDisallow: /admin/\nDisallow: /auth\nDisallow: /callback\nDisallow: /gallery-manager\nSitemap: ${site.origin}/sitemap.xml\n`
      : "User-agent: *\nDisallow: /\n",
    { headers: { "Content-Type": "text/plain; charset=utf-8" } },
  );
