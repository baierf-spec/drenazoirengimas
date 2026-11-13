import { afterEach, expect, it, vi } from "vitest";
import { pages, indexablePaths } from "../src/data/pages";
import { reviewedLocationArticles } from "../src/data/locations";
import { handleRequest } from "../worker";
import { runtimeSettings } from "../shared/site-config";
import { fixture } from "./fixtures";
afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
});
it("keeps preview robots closed to crawlers", async () => {
  vi.stubEnv("SITE_AUDIT_MODE", "preview");
  vi.resetModules();
  const { GET } = await import("../src/pages/robots.txt");
  expect(await (await GET({} as never)).text()).toContain("Disallow: /\n");
});
it("keeps preview sitemap empty because every page is noindex", async () => {
  vi.stubEnv("SITE_AUDIT_MODE", "preview");
  vi.resetModules();
  const { GET } = await import("../src/pages/sitemap.xml");
  expect(await (await GET({} as never)).text()).not.toContain("<loc>");
});
it("opens production robots without hiding noindex directives behind crawl blocks", async () => {
  vi.stubEnv("SITE_AUDIT_MODE", "production");
  vi.resetModules();
  const { GET } = await import("../src/pages/robots.txt");
  const text = await (await GET({} as never)).text();
  expect(text).toContain("Allow: /");
  expect(text).toContain("Disallow: /api/");
  expect(text).not.toContain("Disallow: /aciu/");
  expect(text).toContain("Sitemap: https://drenazoirengimas.lt/sitemap.xml");
});
it("publishes exactly the canonical indexable URLs in production sitemap", async () => {
  vi.stubEnv("SITE_AUDIT_MODE", "production");
  vi.resetModules();
  const { GET } = await import("../src/pages/sitemap.xml");
  const text = await (await GET({} as never)).text();
  const urls = [...text.matchAll(/<loc>(.*?)<\/loc>/g)].map((m) => m[1]);
  expect(urls).toEqual(
    indexablePaths().map((path) => "https://drenazoirengimas.lt" + path),
  );
  expect(new Set(urls).size).toBe(urls.length);
  for (const route of [
    "/aciu/",
    "/404.html",
    "/projektai/",
    "/gauti-pasiulyma/",
    "/diagnostika/",
    "/drenazo-irengimas-vilniuje/",
  ])
    expect(urls).not.toContain("https://drenazoirengimas.lt" + route);
});
it("has unique page titles and descriptions without temporary origins", () => {
  expect(new Set(pages.map((p) => p.title)).size).toBe(pages.length);
  expect(new Set(pages.map((p) => p.description)).size).toBe(pages.length);
  expect(JSON.stringify(pages)).not.toMatch(/chatgpt\.site|localhost/);
});
it("does not generate unverified city pages", () => {
  expect(reviewedLocationArticles()).toEqual([]);
  expect(() =>
    reviewedLocationArticles([
      { slug: "drenazo-irengimas-vilniuje", coverageConfirmed: false },
    ]),
  ).toThrow();
});
it("decouples disabling lead intake from canonical-host indexing", async () => {
  const f = fixture();
  const settings = {
    ...runtimeSettings(f.env as unknown as Record<string, unknown>),
    indexingEnabled: true,
    leadsEnabled: false,
  };
  const response = await handleRequest(
    new Request("https://drenazoirengimas.lt/pamatu-drenazas/"),
    f.env,
    f.ctx,
    settings,
  );
  expect(response.headers.get("X-Robots-Tag")).toBeNull();
});
it("keeps a temporary host noindex even when production indexing is enabled", async () => {
  const f = fixture();
  const settings = {
    ...runtimeSettings(f.env as unknown as Record<string, unknown>),
    indexingEnabled: true,
  };
  const r = await handleRequest(
    new Request("https://review.example.test/robots.txt"),
    f.env,
    f.ctx,
    settings,
  );
  expect(await r.text()).toContain("Disallow: /");
  expect(r.headers.get("X-Robots-Tag")).toBe("noindex, nofollow");
  const sitemap = await handleRequest(
    new Request("https://review.example.test/sitemap.xml"),
    f.env,
    f.ctx,
    settings,
  );
  expect(await sitemap.text()).not.toContain("<loc>");
});
