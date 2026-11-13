// The whole site as plain text for AI search engines (GEO).
import { PAGES } from "../content/pages.mjs";
import { SITE } from "../content/site.mjs";
type P = { path: string; title: string; description: string; body: string; noSitemap?: boolean; noindex?: boolean };
const toText = (html: string) => html
  .replace(/<svg[\s\S]*?<\/svg>/g, ' ')
  .replace(/<(script|style|form|select|figure)[\s\S]*?<\/\1>/g, ' ')
  .replace(/<h1[^>]*>/g, '\n# ').replace(/<h2[^>]*>/g, '\n\n## ').replace(/<h3[^>]*>/g, '\n### ')
  .replace(/<(summary)[^>]*>/g, '\n**').replace(/<\/summary>/g, '**\n')
  .replace(/<(li|dt)[^>]*>/g, '\n- ').replace(/<(p|div|dd|tr|section)[^>]*>/g, '\n')
  .replace(/<td[^>]*>/g, ' | ')
  .replace(/<[^>]+>/g, ' ')
  .replace(/&amp;/g, '&').replace(/&nbsp;/g, ' ')
  .replace(/[ \t]+/g, ' ').replace(/ *\n */g, '\n').replace(/\n{3,}/g, '\n\n').trim();
export function GET() {
  const listed = (PAGES as P[]).filter((p) => !p.noSitemap && !p.noindex);
  const full = listed.filter((p) => p.path !== '/privatumo-politika/').map((p) => `URL: ${SITE.url}${p.path}\nPavadinimas: ${p.title}\nAprašymas: ${p.description}\n\n${toText(p.body)}`);
return new Response(`# sklypolyginimas.lt – visas turinys\n\nAtnaujinta: ${SITE.updated}\n\n` + full.join('\n\n---\n\n') + '\n', { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
