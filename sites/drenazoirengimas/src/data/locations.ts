import { z } from "zod";
import type { Article } from "./articles";
// Add a reviewed record only after actual local service coverage and unique evidence are supplied.
export const locationSchema = z.object({
  slug: z.string().regex(/^drenazo-irengimas-[a-z-]+$/),
  title: z.string().min(1),
  description: z.string().min(1),
  intro: z.string().min(1),
  coverageConfirmed: z.literal(true),
  reviewed: z.literal(true),
  references: z.array(z.url()).min(1),
  sections: z
    .array(
      z.object({
        title: z.string().min(1),
        text: z.array(z.string().min(1)).min(1),
        list: z.array(z.string()).optional(),
      }),
    )
    .min(1),
});
export type LocationPage = z.infer<typeof locationSchema>;
export const locations: LocationPage[] = [];
export function reviewedLocationArticles(
  records: unknown[] = locations,
): Article[] {
  return records.map((record) => {
    const entry = locationSchema.parse(record);
    return {
      slug: entry.slug,
      title: entry.title,
      description: entry.description,
      intro: entry.intro,
      sections: entry.sections,
      service: true,
    };
  });
}
