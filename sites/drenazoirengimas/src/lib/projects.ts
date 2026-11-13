import { z } from "zod";
export const projectTypes = {
  foundation: "Pamatų drenažas",
  plot: "Sklypo drenažas",
  rain: "Lietaus vandens nuvedimas",
  other: "Kita",
} as const;
const image = z.object({
  src: z
    .string()
    .regex(/^\/images\/projects\/[a-z0-9_/-]+\.(webp|jpg|png|avif)$/),
  alt: z.string().trim().min(3).max(200),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  variants: z
    .array(
      z.object({
        src: z
          .string()
          .regex(/^\/images\/projects\/[a-z0-9_/-]+\.(webp|jpg|png|avif)$/),
        width: z.number().int().positive(),
      }),
    )
    .default([]),
});
export const projectSchema = z
  .object({
    slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
    title: z.string().trim().min(3).max(120),
    description: z.string().trim().min(10).max(2000),
    problem: z.string().max(2000).optional(),
    solution: z.string().max(3000).optional(),
    work_scope: z.string().max(2000).optional(),
    duration: z.string().max(200).optional(),
    price: z.string().max(200).optional(),
    seoTitle: z.string().max(120).optional(),
    seoDescription: z.string().max(180).optional(),
    location: z.string().trim().max(120).optional(),
    completion_date: z
      .string()
      .regex(/^(?:\d{4}(-\d{2}-\d{2})?)?$/)
      .optional(),
    project_type: z.enum(["foundation", "plot", "rain", "other"]).optional(),
    status: z.enum(["draft", "published"]),
    sort_order: z.number().int().default(0),
    cover: z.number().int().nonnegative().default(0),
    images: z.array(image).min(1),
  })
  .refine(
    (p) => p.cover < p.images.length,
    "Viršelis turi būti projekto nuotrauka.",
  );
export type Project = z.infer<typeof projectSchema>;
export function parseProjects(data: unknown) {
  const rows = z.array(projectSchema).parse(data);
  if (new Set(rows.map((p) => p.slug)).size !== rows.length)
    throw new Error("Projektų slug turi būti unikalūs.");
  return rows;
}
export function publishedProjects(rows: Project[]) {
  return rows
    .filter((p) => p.status === "published")
    .sort((a, b) => a.sort_order - b.sort_order);
}
