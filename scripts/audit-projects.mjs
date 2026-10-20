import { readFile, writeFile, mkdir, rm } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import assert from "node:assert/strict";
import sharp from "sharp";
import { load } from "cheerio";
// Isolated build fixture, never published or added to source history.
const original = await readFile("src/data/projects.json", "utf8");
const photoDir = "public/images/projects/qa-fixture";
const output = ".audit-projects";
const project = {
  slug: "qa-fixture",
  title: "Tik izoliuoto testo projektas",
  description:
    "Tik automatinei patikrai skirtas tekstas. Tai nėra atlikto darbo pristatymas.",
  status: "published",
  images: [
    {
      src: "/images/projects/qa-fixture/photo.webp",
      alt: "Automatinio testo spalvos pavyzdys",
      width: 480,
      height: 320,
    },
  ],
};
try {
  await mkdir(photoDir, { recursive: true });
  await sharp({
    create: { width: 480, height: 320, channels: 3, background: "#082536" },
  })
    .webp()
    .toFile(photoDir + "/photo.webp");
  await writeFile(
    "src/data/projects.json",
    JSON.stringify([
      project,
      { ...project, slug: "qa-draft", status: "draft" },
    ]),
  );
  execFileSync("node_modules/.bin/astro", ["build", "--outDir", output], {
    stdio: "inherit",
    env: { ...process.env, SITE_AUDIT_MODE: "production" },
  });
  const html = await readFile(
      output + "/projektai/qa-fixture/index.html",
      "utf8",
    ),
    $ = load(html);
  assert.equal($("h1").text(), project.title);
  assert.equal(
    $('link[rel="canonical"]').attr("href"),
    "https://drenazoirengimas.lt/projektai/qa-fixture/",
  );
  assert.equal(
    $('meta[property="og:image"]').attr("content"),
    "https://drenazoirengimas.lt" + project.images[0].src,
  );
  assert.ok($('meta[name="robots"]').attr("content").startsWith("index"));
  assert.equal($(".project-photos img").attr("alt"), project.images[0].alt);
  const sitemap = await readFile(output + "/sitemap.xml", "utf8");
  assert.ok(sitemap.includes("/projektai/qa-fixture/"));
  assert.ok(!sitemap.includes("qa-draft"));
  const listing = await readFile(output + "/projektai/index.html", "utf8");
  assert.ok(listing.includes('href="/projektai/qa-fixture/"'));
  assert.ok(!listing.includes("qa-draft"));
  await assert.rejects(readFile(output + "/projektai/qa-draft/index.html"));
  const schemas = $('script[type="application/ld+json"]')
    .toArray()
    .map((el) => JSON.parse($(el).text()));
  assert.ok(schemas.some((s) => s["@type"] === "BreadcrumbList"));
  console.log(
    "PASS: published project listing/detail/metadata/cover/schema/sitemap; drafts excluded.",
  );
} finally {
  await writeFile("src/data/projects.json", original);
  await rm(photoDir, { recursive: true, force: true });
  await rm(output, { recursive: true, force: true });
}
