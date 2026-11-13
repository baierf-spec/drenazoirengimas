import { expect, it, vi } from "vitest";
import { readFile } from "node:fs/promises";
import { runInNewContext } from "node:vm";
async function editor() {
  let handler: (args: { entry: Map<string, unknown> }) => unknown = () => {};
  const cms = {
    init: vi.fn(),
    registerEventListener: vi.fn((event: { handler: typeof handler }) => {
      handler = event.handler;
    }),
    registerPreviewTemplate: vi.fn(),
  };
  await runInNewContext(await readFile("public/admin/init.js", "utf8"), {
    window: { CMS: cms, h: vi.fn() },
    document: { getElementById: () => ({ remove() {}, textContent: "" }) },
    fetch: async () => ({ ok: true, json: async () => ({ collections: [] }) }),
  });
  return { handler, cms };
}
it("preserves entry data instead of nesting the whole CMS entry on save", async () => {
  const { handler, cms } = await editor();
  for (const collection of ["home", "projects"]) {
    const data = {
      toJS: () => ({
        title: "Testinis pavadinimas",
        description: "Testinis aprašymas.",
        images: [{ src: "/test.jpg", alt: "Testas" }],
        cover: 0,
      }),
    };
    expect(
      handler({
        entry: new Map<string, unknown>([
          ["collection", collection],
          ["data", data],
        ]),
      }),
    ).toBe(data);
  }
  expect(cms.registerPreviewTemplate).toHaveBeenCalledWith(
    "projects",
    expect.any(Function),
  );
});
it("stops invalid project saves before a repository write", async () => {
  const { handler } = await editor();
  for (const values of [
    { title: "x" },
    { title: "Pavadinimas", description: "Per trumpa" },
    {
      title: "Pavadinimas",
      description: "Pakankamai ilgas aprašymas",
      images: [],
    },
  ]) {
    expect(() =>
      handler({
        entry: new Map<string, unknown>([
          ["collection", "projects"],
          ["data", { toJS: () => values }],
        ]),
      }),
    ).toThrow();
  }
});
