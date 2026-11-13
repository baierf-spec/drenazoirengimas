// Sitemap with images and change frequency, as before the move.
import { PAGES } from "../content/pages.mjs";
import { SITE } from "../content/site.mjs";
type P = { path: string; noSitemap?: boolean; noindex?: boolean; priority?: number };
export function GET() {
  const PRIO: Record<string, number> = { '/': 1.0, '/paslaugos/': 0.9, '/kaina/': 0.9, '/vilnius/': 0.8, '/kaunas/': 0.8, '/uzklausa/': 0.6 };
  const listed = (PAGES as P[]).filter((p) => !p.noSitemap && !p.noindex);
  const urls = listed.map((p) => `  <url>\n    <loc>${SITE.url}${p.path}</loc>\n    <lastmod>${SITE.updated}</lastmod>\n    <changefreq>${p.path === '/kaina/' ? 'weekly' : 'monthly'}</changefreq>\n    <priority>${(p.priority ?? PRIO[p.path] ?? 0.5).toFixed(1)}</priority>${p.path === '/' ? `\n    <image:image><image:loc>${SITE.url}/og.png</image:loc></image:image>` : ''}\n  </url>`);
  return new Response(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n${urls.join('\n')}\n</urlset>\n`, { headers: { "Content-Type": "application/xml; charset=utf-8" } });
}
