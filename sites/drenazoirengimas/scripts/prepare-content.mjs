import {
  readFile,
  writeFile,
  readdir,
  mkdir,
  rm,
  stat,
  realpath,
} from "node:fs/promises";
import { createHash } from "node:crypto";
import path from "node:path";
import sharp from "sharp";
import { z } from "zod";
const text = z.string().trim();
const sourceImage = z.object({
  src: text.regex(
    /^\/images\/projects\/[a-zA-Z0-9_/-]+\.(?:jpe?g|png|webp|avif|heic|heif)$/i,
  ),
  alt: text.min(3).max(200),
});
const projectFieldsSchema = z
  .object({
    title: text.min(3).max(120),
    description: text.min(10).max(2000),
    status: z.enum(["draft", "published"]),
    location: text.max(120).optional().default(""),
    project_type: z.enum(["foundation", "plot", "rain", "other"]).optional(),
    completion_date: text.regex(/^(?:\d{4}(?:-\d{2}-\d{2})?)?$/).optional(),
    coverImage: sourceImage.shape.src.optional().or(z.literal("")),
    cover: z.number().int().nonnegative().default(0),
    sort_order: z.number().int().default(0),
    images: z.array(sourceImage).min(1).max(30),
    problem: text.max(2000).optional(),
    solution: text.max(3000).optional(),
    work_scope: text.max(2000).optional(),
    duration: text.max(200).optional(),
    price: text.max(200).optional(),
    seoTitle: text.max(120).optional(),
    seoDescription: text.max(180).optional(),
  })
  .refine(
    (p) => p.cover < p.images.length,
    "Viršelis turi būti viena iš projekto nuotraukų.",
  );
export const cmsProjectSchema = z.preprocess((value) => {
  if (value && typeof value === "object" && !Array.isArray(value))
    return Object.fromEntries(
      Object.entries(value).filter(
        ([key, v]) => v !== null && !(key === "project_type" && v === ""),
      ),
    );
  return value;
}, projectFieldsSchema);
export async function optimizeProjectImage(image, root = process.cwd()) {
  const publicRoot = await realpath(path.join(root, "public"));
  const input = await realpath(path.join(publicRoot, image.src));
  if (!input.startsWith(publicRoot + path.sep))
    throw Error("Nuotrauka turi būti projekto kataloge.");
  if ((await stat(input)).size > 20 * 1024 * 1024)
    throw Error("Nuotrauka per didelė (iki 20 MB).");
  const bytes = await readFile(input);
  const meta = await sharp(bytes, { limitInputPixels: 60000000 }).metadata();
  if (
    !["jpeg", "png", "webp", "avif", "heif"].includes(meta.format) ||
    meta.pages > 1
  )
    throw Error("Netinkamas nuotraukos formatas arba animacija.");
  const hash = createHash("sha256").update(bytes).digest("hex").slice(0, 20);
  const folder = path.join(publicRoot, "images/projects/_generated");
  await mkdir(folder, { recursive: true });
  const variants = [];
  let final;
  for (const width of [480, 960, 1600]) {
    const file = `${hash}-${width}.webp`;
    const info = await sharp(bytes, { limitInputPixels: 60000000 })
      .rotate()
      .resize({ width, withoutEnlargement: true })
      .webp({ quality: 82 })
      .toFile(path.join(folder, file));
    final = {
      src: `/images/projects/_generated/${file}`,
      width: info.width,
      height: info.height,
      alt: image.alt,
    };
    if (!variants.some((v) => v.width === info.width))
      variants.push({ src: final.src, width: info.width });
  }
  return { ...final, variants };
}
export async function prepareProjects(root = process.cwd()) {
  const dir = path.join(root, "src/content/projects");
  await mkdir(dir, { recursive: true });
  const projects = [];
  // Sources are retained only in GitHub; public builds copy optimized, metadata-free versions.
  await rm(path.join(root, "public/images/projects/_generated"), {
    recursive: true,
    force: true,
  });
  for (const name of (await readdir(dir))
    .filter((n) => n.endsWith(".json"))
    .sort()) {
    const slug = name.slice(0, -5);
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug))
      throw Error("Netinkamas projekto adresas: " + name);
    const data = cmsProjectSchema.parse(
      JSON.parse(await readFile(path.join(dir, name), "utf8")),
    );
    if (data.status !== "published") continue;
    if (data.coverImage) {
      const index = data.images.findIndex(
        (image) => image.src === data.coverImage,
      );
      if (index >= 0) data.cover = index;
      else {
        data.images.unshift({ src: data.coverImage, alt: data.title });
        data.cover = 0;
      }
    }
    const images = [];
    for (const image of data.images)
      images.push(await optimizeProjectImage(image, root));
    projects.push({
      ...data,
      completion_date: data.completion_date || undefined,
      slug,
      images,
    });
  }
  const media = {};
  const seo = JSON.parse(
    await readFile(path.join(root, "src/content/seo.json"), "utf8"),
  );
  for (const page of seo.pages) {
    if (page.ogImage) {
      const parsed = sourceImage.parse({ src: page.ogImage, alt: page.title });
      media[page.ogImage] = (await optimizeProjectImage(parsed, root)).src;
    }
  }
  await writeFile(
    path.join(root, "src/data/generated-media.json"),
    JSON.stringify(media, null, 2) + "\n",
  );
  const file = path.join(root, "src/data/generated-projects.json");
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, JSON.stringify(projects, null, 2) + "\n");
  return projects;
}
if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === new URL(import.meta.url).pathname
) {
  await prepareProjects();
  console.log("CMS project content validated and images optimized.");
}
