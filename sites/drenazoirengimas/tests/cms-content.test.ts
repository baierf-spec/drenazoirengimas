import { afterEach, expect, it } from "vitest";
import { readFile, mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import sharp from "sharp";
import { parse } from "yaml";
import { pruneGalleryOriginals } from "../scripts/gallery-assets.mjs";
import {
  cmsProjectSchema,
  optimizeProjectImage,
} from "../scripts/prepare-content.mjs";
import { validateCmsPhoto } from "../src/scripts/cms-images";
const directories: string[] = [];
afterEach(async () => {
  for (const p of directories.splice(0))
    await rm(p, { recursive: true, force: true });
});
it("produces consistent GitHub CMS config and protects technical settings", async () => {
  const config = JSON.parse(await readFile("public/admin/config.json", "utf8"));
  expect(parse(await readFile("public/admin/config.yml", "utf8"))).toEqual(
    config,
  );
  expect(config.backend).toMatchObject({
    name: "github",
    repo: "baierf-spec/drenazoirengimas",
    branch: "main",
    base_url: "https://drenazoirengimas.lt",
    auth_endpoint: "auth",
  });
  expect(
    config.collections.find((c: { name: string }) => c.name === "projects")
      .folder,
  ).toBe("src/content/projects");
  const fields = config.collections.find(
    (c: { name: string }) => c.name === "settings",
  ).files[0].fields;
  for (const name of ["email", "turnstile", "analytics"])
    expect(fields.find((f: { name: string }) => f.name === name).widget).toBe(
      "hidden",
    );
  expect(JSON.stringify(config)).not.toMatch(
    /GITHUB_CLIENT_SECRET|OAUTH_STATE_SECRET|TURNSTILE_SECRET_KEY|widget":"markdown/,
  );
});
it("validates author project cover, traversal, empty descriptions and image paths", () => {
  const project = {
    title: "Tik testui",
    description: "Tai automatinio testo įrašas.",
    status: "draft",
    images: [{ src: "/images/projects/test.jpg", alt: "Tik testinis vaizdas" }],
  };
  expect(cmsProjectSchema.parse(project).cover).toBe(0);
  expect(
    cmsProjectSchema.parse({
      ...project,
      coverImage: null,
      completion_date: null,
      project_type: "",
    }).cover,
  ).toBe(0);
  for (const row of [
    { ...project, cover: 1 },
    { ...project, description: "" },
    {
      ...project,
      images: [{ src: "/images/projects/../private.jpg", alt: "Test" }],
    },
    { ...project, status: "invalid" },
  ])
    expect(() => cmsProjectSchema.parse(row)).toThrow();
});
it("limits client image size/type and accepts iPhone files without manual conversion", () => {
  for (const [name, type] of [
    ["phone.heic", "image/heic"],
    ["phone.heif", ""],
    ["phone.jpg", "image/jpeg"],
    ["phone.png", "image/png"],
    ["phone.webp", "image/webp"],
  ])
    expect(() =>
      validateCmsPhoto(new File(["photo"], name, { type })),
    ).not.toThrow();
  expect(() =>
    validateCmsPhoto(new File(["x"], "bad.svg", { type: "image/svg+xml" })),
  ).toThrow();
  expect(() =>
    validateCmsPhoto(
      new File([new Uint8Array(20 * 1024 * 1024 + 1)], "large.jpg", {
        type: "image/jpeg",
      }),
    ),
  ).toThrow();
});
it("creates responsive WebP dimensions and strips EXIF/GPS", async () => {
  const root = await mkdtemp(path.join(tmpdir(), "drainage-cms-"));
  directories.push(root);
  await mkdir(path.join(root, "public/images/projects"), { recursive: true });
  await sharp({
    create: { width: 2000, height: 1200, channels: 3, background: "#082536" },
  })
    .jpeg()
    .withExif({ IFD0: { Copyright: "Test metadata" } })
    .toFile(path.join(root, "public/images/projects/test.jpg"));
  const result = await optimizeProjectImage(
    { src: "/images/projects/test.jpg", alt: "Tik testas" },
    root,
  );
  expect(result.variants.map((v: { width: number }) => v.width)).toEqual([
    480, 960, 1600,
  ]);
  expect(result.width).toBe(1600);
  expect(result.height).toBe(960);
  const meta = await sharp(path.join(root, "public", result.src)).metadata();
  expect(meta.exif).toBeUndefined();
  expect(meta.format).toBe("webp");
});

it("removes raw and unpublished uploads from the deploy artifact", async () => {
  const root = await mkdtemp(path.join(tmpdir(), "drainage-cms-"));
  directories.push(root);
  await mkdir(path.join(root, "images/projects/_generated"), {
    recursive: true,
  });
  await writeFile(
    path.join(root, "images/projects/private-original.jpg"),
    "not a public artifact",
  );
  await writeFile(
    path.join(root, "images/projects/_generated/public.webp"),
    "optimized",
  );
  await pruneGalleryOriginals(root);
  await expect(
    readFile(path.join(root, "images/projects/private-original.jpg")),
  ).rejects.toThrow();
  expect(
    await readFile(
      path.join(root, "images/projects/_generated/public.webp"),
      "utf8",
    ),
  ).toBe("optimized");
});
