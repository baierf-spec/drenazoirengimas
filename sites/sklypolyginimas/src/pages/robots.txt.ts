// Search engines and AI assistants may index all public content (previews get "Disallow: /" from the Worker).
import { SITE } from "../content/site.mjs";
const AI = ["GPTBot", "OAI-SearchBot", "ChatGPT-User", "ClaudeBot", "Claude-SearchBot", "Claude-User", "PerplexityBot", "Perplexity-User", "Google-Extended", "Applebot", "Applebot-Extended", "Bingbot", "DuckAssistBot", "meta-externalagent", "MistralAI-User", "cohere-ai", "YouBot"];
export function GET() {
  const rules = "Allow: /\nDisallow: /api/\nDisallow: /rangovams/\n";
  const body = `# sklypolyginimas.lt – paieškos ir AI asistentai kviečiami indeksuoti visą viešą turinį\n# Content-Signal: search=yes, ai-input=yes, ai-train=yes\n\nUser-agent: *\nContent-Signal: search=yes, ai-input=yes, ai-train=yes\n${rules}\n` +
    AI.map((b) => `User-agent: ${b}\n${rules}`).join("\n") +
    `\nSitemap: ${SITE.url}/sitemap.xml\n\n# Santrauka AI sistemoms: ${SITE.url}/llms.txt\n# Visas turinys: ${SITE.url}/llms-full.txt\n`;
  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
