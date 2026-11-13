import { CITIES_DATA } from "@/data/citiesData";
import { contentNavigation } from "@/lib/content-navigation";
import { SITE } from "@/lib/site";
export function GET() {
  const urls = [
    { loc: `${SITE.url}/`, priority: "1.0" },
    { loc: `${SITE.url}/privatumo-politika`, priority: "0.2" },
    ...contentNavigation().map((p) => ({ loc: `${SITE.url}/${p.slug}`, priority: "0.7" })),
    ...Object.keys(CITIES_DATA).map((slug) => ({ loc: `${SITE.url}/miestas/${slug}`, priority: "0.8" })),
  ];
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${u.loc}</loc><priority>${u.priority}</priority></url>`).join("\n")}
</urlset>`;
  return new Response(xml, { headers: { "Content-Type": "application/xml; charset=utf-8" } });
}
