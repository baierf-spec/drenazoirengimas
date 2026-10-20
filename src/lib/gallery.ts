import { z } from "zod";
export const projectTypes = {
  foundation: "Pamatų drenažas",
  plot: "Sklypo drenažas",
  rain: "Lietaus vandens nuvedimas",
  other: "Kita",
} as const;
const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .nullable()
    .optional()
    .transform((v) => v || null);
export const projectInput = z
  .object({
    title: z
      .string()
      .trim()
      .min(3, "Pavadinime reikia bent 3 simbolių.")
      .max(120),
    location: optionalText(120),
    project_type: z
      .enum(["foundation", "plot", "rain", "other"])
      .nullable()
      .optional()
      .transform((v) => v || null),
    description: z.string().trim().max(2000),
    completion_date: optionalText(10).refine(
      (v) =>
        !v ||
        (/^(19|20)\d{2}(-\d{2}-\d{2})?$/.test(v) &&
          (v.length === 4 ||
            (Number.isFinite(new Date(v).getTime()) &&
              new Date(v).toISOString().slice(0, 10) === v))),
      "Įrašykite metus arba datą YYYY-MM-DD.",
    ),
    cover_image_id: z
      .uuid()
      .nullable()
      .optional()
      .transform((v) => v || null),
    status: z.enum(["draft", "published"]),
    version: z.number().int().optional(),
  })
  .strict();
export type Project = {
  id: string;
  slug: string;
  title: string;
  location: string | null;
  project_type: keyof typeof projectTypes | null;
  description: string;
  completion_date: string | null;
  cover_image_id: string | null;
  status: "draft" | "published";
  sort_order: number;
  created_at: number;
  updated_at: number;
  published_at: number | null;
};
export type Variant = {
  width: number;
  height: number;
  key: string;
  slot: number;
};
export type ProjectImage = {
  id: string;
  project_id: string;
  storage_key: string;
  variants: string;
  fingerprint: string;
  alt_text: string | null;
  sort_order: number;
  width: number;
  height: number;
  created_at: number;
};
export type ProjectWithImages = Project & { images: ProjectImage[] };
export function slugify(title: string) {
  const chars: Record<string, string> = {
    ą: "a",
    č: "c",
    ę: "e",
    ė: "e",
    į: "i",
    š: "s",
    ų: "u",
    ū: "u",
    ž: "z",
  };
  return (
    title
      .toLowerCase()
      .replace(/[ąčęėįšųūž]/g, (c) => chars[c])
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 80) || "projektas"
  );
}
export const variantSlots = [480, 960, 1600] as const;
