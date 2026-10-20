import { execFileSync } from "node:child_process";
import { readFile, writeFile, mkdir, readdir } from "node:fs/promises";
import path from "node:path";
import assert from "node:assert/strict";
import { load } from "cheerio";
// Isolated raw production-mode build for SEO inspection only. No credentials, deployment or intake activation.
const root = path.resolve(".audit-production");
execFileSync(
  path.resolve("node_modules/.bin/astro"),
  ["build", "--outDir", root],
  { stdio: "inherit", env: { ...process.env, SITE_AUDIT_MODE: "production" } },
);
const files = [];
async function walk(dir) {
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const f = path.join(dir, e.name);
    if (e.isDirectory() && e.name !== "admin") await walk(f);
    else if (e.name.endsWith(".html")) files.push(f);
  }
}
await walk(root);
const sitemap = load(await readFile(path.join(root, "sitemap.xml"), "utf8"), {
  xmlMode: true,
});
const urls = sitemap("loc")
  .map((_, el) => sitemap(el).text())
  .get();
assert.equal(new Set(urls).size, urls.length);
const titleSet = new Set(),
  descriptionSet = new Set();
const rows = [];
for (const file of files) {
  const $ = load(await readFile(file, "utf8"));
  const relative = path.relative(root, file).replaceAll(path.sep, "/");
  const route =
    relative === "index.html"
      ? "/"
      : relative.endsWith("/index.html")
        ? "/" + relative.slice(0, -10)
        : "/" + relative;
  const canonical = "https://drenazoirengimas.lt" + route;
  assert.equal($('link[rel="canonical"]').attr("href"), canonical);
  assert.equal($('meta[property="og:url"]').attr("content"), canonical);
  assert.equal($("head > title").length, 1);
  assert.equal($("h1").length, 1);
  let previousHeading = 0;
  for (const el of $("h1,h2,h3,h4,h5,h6").toArray()) {
    const level = Number(el.tagName.slice(1));
    assert.ok(level <= previousHeading + 1, "Skipped heading level " + route);
    previousHeading = level;
  }
  const title = $("head > title").text(),
    description = $('meta[name="description"]').attr("content"),
    robots = $('meta[name="robots"]').attr("content");
  const indexable = !robots.includes("noindex");
  assert.ok(!titleSet.has(title), "Duplicate title " + route);
  assert.ok(!descriptionSet.has(description), "Duplicate description " + route);
  titleSet.add(title);
  descriptionSet.add(description);
  assert.equal(
    urls.includes(canonical),
    indexable,
    "Sitemap/indexability mismatch " + route,
  );
  const schemas = $('script[type="application/ld+json"]')
    .toArray()
    .map((el) => JSON.parse($(el).text()));
  for (const data of schemas) {
    assert.equal(data["@context"], "https://schema.org");
    assert.ok(
      !["LocalBusiness", "AggregateRating", "Review", "Organization"].includes(
        data["@type"],
      ),
      "Unverified entity " + route,
    );
    if (data.url)
      assert.equal(new URL(data.url).origin, "https://drenazoirengimas.lt");
    if (data["@type"] === "BreadcrumbList") {
      assert.deepEqual(
        data.itemListElement.map((item) => item.position),
        [1, 2],
      );
      assert.equal(data.itemListElement[1].item, canonical);
    }
    if (data["@type"] === "FAQPage") {
      const details = $(".faq-list details").toArray();
      assert.equal(data.mainEntity.length, details.length);
      data.mainEntity.forEach((q, i) => {
        assert.equal(
          q.name,
          $(details[i])
            .find("summary")
            .clone()
            .children("span")
            .remove()
            .end()
            .text()
            .trim(),
        );
        const answer = $(details[i]).find("p").clone();
        answer.find("a").remove();
        assert.equal(q.acceptedAnswer.text, answer.text().trim());
      });
    }
  }
  for (const el of $("[href],[src],[srcset]").toArray()) {
    for (const attr of ["href", "src", "srcset"]) {
      const value = $(el).attr(attr) || "";
      assert.ok(
        !value.includes("chatgpt.site") && !value.includes("localhost"),
        "Temporary origin " + route,
      );
    }
  }
  rows.push({
    path: route,
    title,
    description,
    indexable,
    schema: schemas.map((s) => s["@type"]),
  });
}
assert.ok(
  urls.every(
    (url) =>
      url.startsWith("https://drenazoirengimas.lt/") && !new URL(url).search,
  ),
);
const robots = await readFile(path.join(root, "robots.txt"), "utf8");
assert.ok(
  robots.includes("Allow: /") &&
    robots.includes("Sitemap: https://drenazoirengimas.lt/sitemap.xml"),
);
assert.ok(
  !robots.includes("Disallow: /aciu/"),
  "Allow crawling of noindex confirmation so its directive is discoverable",
);
await mkdir(".audit-results", { recursive: true });
await writeFile(
  ".audit-results/seo.json",
  JSON.stringify(
    {
      mode: "isolated-production-inspection",
      pages: rows.length,
      indexableUrls: urls.length,
      urls,
      map: rows,
    },
    null,
    2,
  ),
);
console.log(
  `Production-mode SEO audit passed: ${rows.length} pages; ${urls.length} canonical indexable sitemap URLs; unique metadata; schema matches visible content.`,
);
