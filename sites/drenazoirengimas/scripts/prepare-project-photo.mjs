import sharp from "sharp";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
const [source, slug, name] = process.argv.slice(2);
if (
  !source ||
  !/^[a-z0-9-]+$/.test(slug || "") ||
  !/^[a-z0-9-]+$/.test(name || "")
)
  throw new Error(
    "Naudojimas: node scripts/prepare-project-photo.mjs failas.jpg projekto-slug nuotraukos-vardas",
  );
const dir = path.resolve("public/images/projects", slug);
await mkdir(dir, { recursive: true });
const variants = [];
let dimensions;
for (const width of [480, 960, 1600]) {
  const file = `${name}-${width}.webp`;
  const { data, info } = await sharp(source, { limitInputPixels: 60000000 })
    .rotate()
    .resize({ width, withoutEnlargement: true })
    .webp({ quality: 84 })
    .toBuffer({ resolveWithObject: true });
  await writeFile(path.join(dir, file), data);
  variants.push({ src: `/images/projects/${slug}/${file}`, width: info.width });
  dimensions = info;
}
console.log(
  JSON.stringify(
    {
      src: variants[2].src,
      alt: "Įrašykite tikslų nuotraukos aprašymą",
      width: dimensions.width,
      height: dimensions.height,
      variants: [...new Map(variants.map((v) => [v.width, v])).values()],
    },
    null,
    2,
  ),
);
