import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";
import assert from "node:assert/strict";
import { load } from "cheerio";
const root = path.resolve("dist/client");
const configuredGa4 = JSON.parse(await readFile("site.config.json", "utf8"))
  .analytics.ga4Id;
const pages = [];
async function walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory() && entry.name !== "admin") await walk(p);
    else if (p.endsWith(".html")) pages.push(p);
  }
}
await walk(root);
let links = 0;
let images = 0;
let schema = 0;
for (const file of pages) {
  const html = await readFile(file, "utf8");
  const $ = load(html);
  assert.equal($("html").attr("lang"), "lt", file);
  assert.equal(
    JSON.parse($("#analytics-config").text()).ga4,
    configuredGa4,
    "GA4 config on " + file,
  );
  assert.equal(
    $('script[src*="googletagmanager.com"]').length,
    configuredGa4 ? 1 : 0,
    "Exactly one shared Google tag: " + file,
  );
  if (configuredGa4) {
    assert.equal(
      $('head > script[src*="googletagmanager.com"]').attr("src"),
      "https://www.googletagmanager.com/gtag/js?id=" + configuredGa4,
    );
    assert.ok(
      $("head > script")
        .toArray()
        .some((el) =>
          $(el)
            .text()
            .includes("gtag('config', " + JSON.stringify(configuredGa4) + ")"),
        ),
    );
  }
  assert.equal($("head > title").length, 1);
  assert.equal($("h1").length, 1, file + " requires one h1");
  assert.ok($("head > title").text().length > 10, file);
  assert.ok($('meta[name="description"]').attr("content")?.length > 30, file);
  assert.ok(
    $('link[rel="canonical"]')
      .attr("href")
      ?.startsWith("https://drenazoirengimas.lt/"),
    file,
  );
  assert.ok($('meta[property="og:image"]').length, file);
  assert.ok($('meta[name="viewport"]').length, file);
  for (const el of $('script[type="application/ld+json"]').toArray()) {
    const data = JSON.parse($(el).text());
    assert.equal(data["@context"], "https://schema.org");
    assert.ok(data["@type"]);
    assert.ok(!JSON.stringify(data).includes("AggregateRating"));
    schema++;
  }
  for (const el of $("img").toArray()) {
    assert.ok($(el).attr("alt") !== undefined, file);
    assert.ok($(el).attr("width") && $(el).attr("height"), file);
    images++;
  }
  const canonical = $('link[rel="canonical"]').attr("href");
  if (file.endsWith("/aciu/index.html") || file.endsWith("/404.html"))
    assert.ok($('meta[name="robots"]').attr("content").includes("noindex"));
  for (const el of $(
    "a[href],img[src],img[srcset],source[srcset],script[src],link[href]",
  ).toArray()) {
    const values = [
      $(el).attr("href"),
      $(el).attr("src"),
      ...($(el).attr("srcset") || "")
        .split(",")
        .map((candidate) => candidate.trim().split(/\s+/)[0]),
    ].filter(Boolean);
    for (const value of values) {
      if (
        (!value.startsWith("/") && !value.startsWith("#")) ||
        value.startsWith("//")
      )
        continue;
      const url = new URL(value, canonical);
      let target = value.startsWith("#")
        ? file
        : path.join(root, decodeURIComponent(url.pathname));
      try {
        const info = await stat(target);
        if (info.isDirectory()) target = path.join(target, "index.html");
        await stat(target);
      } catch {
        throw new Error(`${file}: broken internal resource ${value}`);
      }
      if (url.hash) {
        const targetPage = load(await readFile(target, "utf8"));
        assert.ok(
          targetPage(`[id="${decodeURIComponent(url.hash.slice(1))}"]`).length,
          `${file}: missing anchor ${value}`,
        );
      }
      links++;
    }
  }

  assert.ok(canonical);
}
const sitemap = await readFile(path.join(root, "sitemap.xml"), "utf8");
assert.ok(sitemap.includes("<urlset"));
assert.ok(!sitemap.includes("/aciu/"));
const robots = await readFile(path.join(root, "robots.txt"), "utf8");
assert.ok(robots.includes("User-agent: *"));
const js = (await readdir(path.join(root, "_astro"))).filter((f) =>
  f.endsWith(".js"),
);
let bytes = 0;
for (const f of js) bytes += (await stat(path.join(root, "_astro", f))).size;
console.log(
  JSON.stringify(
    {
      pages: pages.length,
      checkedInternalLinksAndAssets: links,
      images,
      schemaObjects: schema,
      clientJsBytesAllRoutes: bytes,
      robots: true,
      sitemap: true,
    },
    null,
    2,
  ),
);

// The CMS is a separate app shell, deliberately excluded from public article SEO assertions.
const admin = load(await readFile(path.join(root, "admin/index.html"), "utf8"));
assert.ok(admin('meta[name="robots"]').attr("content").includes("noindex"));
assert.ok(admin('script[src*="decap-cms@3.17.1"]').attr("integrity"));
assert.ok(admin('script[src="/admin/init.js"]').length);
assert.ok(!sitemap.includes("/admin/"));
const cmsConfig = JSON.parse(
  await readFile(path.join(root, "admin/config.json"), "utf8"),
);
assert.equal(cmsConfig.backend.repo, "baierf-spec/drenazoirengimas");
assert.ok(!JSON.stringify(cmsConfig).includes("GITHUB_CLIENT_SECRET"));
// Smoke the actual packaged Sites Worker in-process without opening a preview server.
const { default: packaged } = await import("../dist/server/index.js");
const context = { waitUntil() {} };
for (const [route, expected] of [
  ["/", 200],
  ["/pamatu-drenazas/", 200],
  ["/no-such-page/", 404],
  ["/projektai/neegzistuojantis-projektas/", 404],
  ["/404.html", 404],
  ["/robots.txt", 200],
  ["/sitemap.xml", 200],
]) {
  const response = await packaged.fetch(
    new Request("https://review.example.test" + route),
    {},
    context,
  );
  assert.equal(response.status, expected, "Packaged Worker " + route);
  assert.equal(response.headers.get("X-Robots-Tag"), "noindex, nofollow");
}
const denied = await packaged.fetch(
  new Request("https://drenazoirengimas.lt/api/leads", {
    method: "POST",
    headers: { Origin: "https://drenazoirengimas.lt" },
  }),
  {},
  context,
);
assert.equal(denied.status, 503, "Unconfigured intake must fail closed");
console.log(
  "Packaged Worker smoke passed: content, 404, robots, sitemap, noindex, disabled intake.",
);
