import { z } from "zod";
export const LIMITS = {
  photos: 5,
  file: 2 * 1024 * 1024,
  total: 10 * 1024 * 1024,
  request: 11 * 1024 * 1024,
} as const;
export const problemIds = [
  "foundations",
  "basement",
  "yard",
  "groundwater",
  "new",
  "rain",
  "unknown",
] as const;
export function normalizePhone(value: string): string {
  const p = value.replace(/[\s().-]/g, "");
  if (/^(?:0|8)\d{8}$/.test(p)) return "+370" + p.slice(1);
  return p;
}
export const leadSchema = z.object({
  requestId: z.uuid(),
  name: z
    .string()
    .trim()
    .min(2, "Įrašykite vardą (bent 2 simboliai).")
    .max(100),
  phone: z
    .string()
    .transform(normalizePhone)
    .refine(
      (p) => /^\+\d{8,15}$/.test(p),
      "Įrašykite galiojantį telefoną, pvz. +370 612 34567.",
    ),
  email: z
    .union([z.literal(""), z.email("Patikrinkite el. pašto adresą.").max(254)])
    .default(""),
  location: z.string().trim().min(2, "Įrašykite objekto vietovę.").max(120),
  property: z.enum(["house", "homestead", "plot", "other"]),
  problem: z.enum(problemIds),
  timing: z.enum(["soon", "month", "quarter", "later"]),
  message: z
    .string()
    .trim()
    .max(2000, "Komentaras negali viršyti 2000 simbolių.")
    .default(""),
  consent: z.literal("yes", {
    error: "Patvirtinkite, kad susipažinote su privatumo informacija.",
  }),
  website: z.literal(""),
  source: z
    .string()
    .max(300)
    .refine((p) => p.startsWith("/") && !p.startsWith("//"))
    .default("/"),
  diagnostic: z.string().max(250).default(""),
  estimate: z.string().max(250).default(""),
});
export type Lead = z.infer<typeof leadSchema>;
export function validateLead(form: FormData) {
  const data = Object.fromEntries(
    [
      "requestId",
      "name",
      "phone",
      "email",
      "location",
      "property",
      "problem",
      "timing",
      "message",
      "consent",
      "website",
      "source",
      "diagnostic",
      "estimate",
    ].map((key) => [key, form.get(key) ?? ""]),
  );
  return leadSchema.safeParse(data);
}
export function imageType(bytes: Uint8Array): string | null {
  if (bytes.length < 12) return null;
  if (bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255)
    return "image/jpeg";
  if ([137, 80, 78, 71, 13, 10, 26, 10].every((v, i) => bytes[i] === v))
    return "image/png";
  if (
    String.fromCharCode(...bytes.slice(0, 4)) === "RIFF" &&
    String.fromCharCode(...bytes.slice(8, 12)) === "WEBP"
  )
    return "image/webp";
  return null;
}
