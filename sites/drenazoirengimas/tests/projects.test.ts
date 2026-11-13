import { expect, it } from "vitest";
import { parseProjects, publishedProjects } from "../src/lib/projects";
import { publicProjects } from "../src/data/projects";
const sample = {
  slug: "test-only",
  title: "Testinis įrašas",
  description: "Tik testui skirtas turinys, svetainėje nepublikuojamas.",
  status: "published",
  images: [
    {
      src: "/images/projects/test/480.webp",
      alt: "Tik testinė nuotrauka",
      width: 480,
      height: 320,
    },
  ],
};
it("has no fabricated public projects", () =>
  expect(publicProjects).toEqual([]));
it("validates owner project data", () => {
  expect(() => parseProjects([{ ...sample, slug: "../bad" }])).toThrow();
  expect(() => parseProjects([{ ...sample, cover: 2 }])).toThrow();
  expect(() => parseProjects([{ ...sample, images: [] }])).toThrow();
  expect(() => parseProjects([sample, sample])).toThrow();
});
it("filters drafts for listing, detail route generation and sitemap", () => {
  const rows = parseProjects([
    sample,
    { ...sample, slug: "draft", status: "draft" },
  ]);
  expect(publishedProjects(rows).map((p) => p.slug)).toEqual(["test-only"]);
});
it("sorts projects using owner order", () => {
  const rows = parseProjects([
    { ...sample, sort_order: 2 },
    { ...sample, slug: "first", sort_order: 1 },
  ]);
  expect(publishedProjects(rows)[0].slug).toBe("first");
});
