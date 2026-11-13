import { z } from "zod";

/** Užklausos laukai. Naudojama ir naršyklėje, ir serveryje (/api/lead). */
export const leadSchema = z
  .object({
    name: z.string().trim().min(2, "Įveskite vardą").max(120),
    phone: z.string().trim().min(1, "Įveskite telefono numerį").max(40).refine((v) => (/^[+\d\s()-]+$/.test(v) && v.replace(/\D/g, "").length >= 8), "Patikrinkite telefono numerį"),
    email: z
      .string()
      .trim()
      .min(1, "Įveskite el. paštą")
      .max(255)
      .refine((v) => /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(v), "Neteisingas el. pašto adresas"),
    city: z.string().trim().min(2, "Įveskite miestą").max(80),
    quantity: z.number().int().min(1).max(500),
    chainInfo: z.string().trim().min(2, "Nurodykite grandinių informaciją").max(300),
    message: z.string().trim().min(2, "Įrašykite žinutę").max(1500),
    estimatedTotal: z.number().min(0).max(100000).nullable().optional(),
    pageUrl: z.string().trim().max(500).optional().default(""),
    /** Paslėptas laukas nuo botų – žmogus jo nemato ir nepildo. */
    website: z.string().max(200).optional().default(""),
  });

export type LeadInput = z.input<typeof leadSchema>;
export type Lead = z.output<typeof leadSchema>;

/** Didžiausias leidžiamas užklausos dydis baitais. */
export const LEAD_MAX_BYTES = 10_000;

