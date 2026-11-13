import { readFile, readdir } from "node:fs/promises";
import { z } from "zod";
const str = z.string().trim().min(1).max(6000);
const short = z.string().trim().min(1).max(200);
const safeURL = z
  .url()
  .refine((v) => ["https:", "http:"].includes(new URL(v).protocol));
const read = async (p) => JSON.parse(await readFile(p, "utf8"));
const home = await read("src/content/home.json");
for (const [key, value] of Object.entries(home)) {
  if (Array.isArray(value)) {
    if (!value.length)
      throw Error("Tuščias pagrindinio puslapio laukas: " + key);
    for (const item of value)
      if (typeof item === "string") short.parse(item);
      else for (const v of Object.values(item)) str.parse(v);
  } else str.parse(value);
}
z.object({
  items: z
    .array(
      z.object({
        question: short,
        answer: str,
        enabled: z.boolean(),
        link: z
          .object({
            href: z.string().regex(/^\/(?!\/)[a-z0-9/#?=-]*$/),
            label: short,
          })
          .optional(),
      }),
    )
    .min(1),
}).parse(await read("src/content/faq.json"));
const articleSchema = z.object({
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  title: short,
  description: short,
  intro: str,
  sections: z
    .array(
      z.object({
        title: short,
        text: z.array(str).min(1),
        list: z.array(str).optional(),
        id: z
          .string()
          .regex(/^[a-z0-9-]+$/)
          .optional(),
      }),
    )
    .min(1),
  sources: z.array(z.object({ label: short, url: safeURL })).optional(),
});
const fixed = [
  "pamatu-drenazas",
  "sklypo-drenazas",
  "lietaus-vandens-nuvedimas",
  "vanduo-sklype",
  "drenazas-ar-lietaus-nuotekos",
];
for (const slug of fixed) {
  const a = articleSchema.parse(
    await read("src/content/articles/" + slug + ".json"),
  );
  if (a.slug !== slug) throw Error("Negalima keisti esamo puslapio adreso.");
}
const found = (await readdir("src/content/articles"))
  .filter((v) => v.endsWith(".json"))
  .map((v) => v.slice(0, -5));
if (found.length !== fixed.length || found.some((s) => !fixed.includes(s)))
  throw Error("Naują paslaugos adresą turi prijungti programuotojas.");
const seo = z
  .object({
    pages: z
      .array(
        z.object({
          path: z.string().regex(/^\/(?!\/)[a-z0-9/.-]*$/),
          title: short,
          description: str,
          ogImage: z.union([
            z.literal(""),
            z
              .string()
              .regex(
                /^\/images\/projects\/[a-zA-Z0-9_/-]+\.(?:jpe?g|png|webp|avif)$/i,
              ),
          ]),
        }),
      )
      .min(1),
  })
  .parse(await read("src/content/seo.json"));
if (new Set(seo.pages.map((p) => p.path)).size !== seo.pages.length)
  throw Error("SEO adresai kartojasi.");
const services = z
  .object({
    items: z
      .array(
        z.object({
          slug: z.enum([
            "pamatu-drenazas",
            "sklypo-drenazas",
            "lietaus-vandens-nuvedimas",
          ]),
          title: short,
          tag: short,
          text: str,
          icon: short,
          enabled: z.boolean(),
        }),
      )
      .length(3),
  })
  .parse(await read("src/content/services.json"));
if (new Set(services.items.map((s) => s.slug)).size !== 3)
  throw Error("Paslaugų adresai turi būti unikalūs.");
const price = await read("src/content/pricing.json");
for (const [key, value] of Object.entries(price))
  if (/^text\d+$/.test(key)) str.parse(value);
z.array(short).min(1).parse(price.factors);
z.iso.date().parse(price.modelReviewedAt);
z.array(
  z.object({
    label: short,
    url: safeURL,
    scope: str,
    reviewedAt: z.iso.date(),
  }),
).parse(price.marketSources);
console.log(
  "CMS text, links, fixed URLs, FAQ, pricing sources and SEO content validated.",
);
