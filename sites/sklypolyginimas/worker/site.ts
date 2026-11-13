// The site's side of the shared lead-site kit (resolved as "@site/lead"): enquiry form rules and e-mail.
import { LEAD_FIELDS, META_FIELDS, clean, emailHtml } from "./email.js";

type Data = Record<string, string>;
export type Lead = { requestId: string; email: string; data: Data };

/** Up to 6 photos (phones send big files and HEIC). */
export const LIMITS = { request: 22 * 1024 * 1024, photos: 6, file: 5 * 1024 * 1024, total: 18 * 1024 * 1024 } as const;

/** Real file type from the first bytes: JPEG, PNG, WebP or HEIC/HEIF. */
export function imageType(b: Uint8Array): string | null {
  if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return "image/jpeg";
  if (b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47) return "image/png";
  const ascii = (from: number, to: number) => String.fromCharCode(...b.subarray(from, to));
  if (ascii(0, 4) === "RIFF" && ascii(8, 12) === "WEBP") return "image/webp";
  if (ascii(4, 8) === "ftyp" && /^(heic|heix|hevc|hevx|mif1|msf1|heif)$/.test(ascii(8, 12))) return "image/heic";
  return null;
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const fail = (field: string, message: string) => ({
  success: false as const,
  error: { flatten: () => ({ fieldErrors: { [field]: [message] } }) },
});

export function validateLead(form: FormData) {
  const data: Data = {};
  for (const [k] of [...LEAD_FIELDS, ...META_FIELDS]) {
    const all = form.getAll(k).map((v) => (typeof v === "string" ? clean(v, k === "pastabos" ? 2000 : 300) : "")).filter(Boolean);
    if (all.length) data[k] = all.join(", ");
  }
  if (data.referrer) {
    try { data.referrer = new URL(data.referrer).hostname; } catch { delete data.referrer; }
  }
  if (!data.vardas) return fail("vardas", "Įrašykite vardą.");
  if (!data.arai) return fail("arai", "Nurodykite sklypo plotą arais (galima apytiksliai).");
  if (!data.tel || data.tel.replace(/\D/g, "").length < 8) return fail("tel", "Patikrinkite telefono numerį.");
  if (clean(form.get("sutikimas")) !== "taip") return fail("sutikimas", "Pažymėkite sutikimą, kad galėtume perduoti užklausą rangovui.");
  if (data.email && !EMAIL.test(data.email)) delete data.email;
  const requestId = String(form.get("requestId") ?? "");
  if (!UUID.test(requestId)) return fail("requestId", "Atnaujinkite puslapį ir bandykite dar kartą.");
  return { success: true as const, data: { requestId, email: data.email ?? "", data } satisfies Lead };
}

/** Hidden field that people never see: when it is filled the sender is a bot. */
export const isBot = (form: FormData) => clean(form.get("website")) !== "";

export const leadSubject = ({ data }: Lead) =>
  `Užklausa: ${[data.vieta || data.savivaldybe, data.arai ? data.arai + " a" : ""].filter(Boolean).join(", ") || "sklypo lyginimas"}${data.bukle ? " · " + data.bukle : ""} – ${data.vardas}`;
export const attachmentName = "sklypas";
/** Name of the file input in the forms. */
export const photoField = "foto";

export function renderLeadEmail({ data, requestId }: Lead, photoCount = 0) {
  const when = new Date().toLocaleString("lt-LT", { timeZone: "Europe/Vilnius", dateStyle: "short", timeStyle: "short" });
  const html = emailHtml({
    kicker: "Nauja sklypo lyginimo užklausa",
    title: [data.vieta, data.savivaldybe].filter(Boolean).join(", ") || "Vieta nenurodyta",
    chips: [data.arai ? `${data.arai} a` : "Plotas nenurodytas", data.bukle, data.kada].filter(Boolean),
    data, attachments: { length: photoCount }, when, id: requestId, country: "",
    sections: [
      ["Sklypas", [["savivaldybe", "Savivaldybė"], ["vieta", "Vietovė"], ["arai", "Plotas"], ["bukle", "Situacija"], ["darbai", "Reikalingi darbai"]]],
      ["Planai", [["kada", "Kada"], ["savininkas", "Savininkas"], ["biudzetas", "Biudžetas"], ["laikas", "Patogu skambinti"]]],
    ],
  });
  const rows = [...LEAD_FIELDS, ...META_FIELDS].filter(([k]) => data[k]).map(([k, label]) => `${label}: ${data[k]}`);
  const text = [leadSubject({ data, requestId, email: "" }), "", ...rows, "", photoCount ? `Nuotraukų: ${photoCount}` : "", `${when} · ID ${requestId}`].join("\n");
  return { html, text };
}

/** Contact-free summary sent to LeadHub (no name, phone or e-mail). */
export const leadSummaryParts = ({ data }: Lead) => [
  [data.vieta, data.savivaldybe].filter(Boolean).join(", "),
  data.arai && `${data.arai} a`,
  data.bukle,
  data.darbai,
  data.kada && `Kada: ${data.kada}`,
  data.pastabos,
];
