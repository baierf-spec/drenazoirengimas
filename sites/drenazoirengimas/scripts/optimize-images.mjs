import sharp from "sharp";
for (const size of [768, 1440, 1920]) {
  await sharp("docs/spec/hero-source.png")
    .resize({ width: size })
    .avif({ quality: 50 })
    .toFile(`public/images/hero-${size}.avif`);
  await sharp("docs/spec/hero-source.png")
    .resize({ width: size })
    .webp({ quality: 80 })
    .toFile(`public/images/hero-${size}.webp`);
}
await sharp("docs/spec/hero-source.png")
  .resize(1200, 630, { fit: "cover" })
  .jpeg({ quality: 82 })
  .toFile("public/images/og.jpg");
for (const name of ["foundations", "basement", "yard", "groundwater"])
  await sharp(`docs/spec/${name}-source.png`)
    .resize(640, 480, { fit: "cover" })
    .webp({ quality: 80 })
    .toFile(`public/images/${name}.webp`);
console.log(
  "Responsive AVIF/WebP hero, problem images and OG image generated.",
);

for (const name of ["foundations", "basement", "yard", "groundwater"])
  await sharp(`docs/spec/${name}-source.png`)
    .resize(320, 240, { fit: "cover" })
    .webp({ quality: 78 })
    .toFile(`public/images/${name}-320.webp`);
