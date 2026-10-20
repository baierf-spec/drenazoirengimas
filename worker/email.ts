import type { Env } from "./types";
import type { Lead } from "../src/lib/validation";
export type LeadPhoto = { bytes: ArrayBuffer; mime: string };
const labels: Record<string, string> = {
  house: "Gyvenamasis namas",
  homestead: "Sodyba / ūkinis pastatas",
  plot: "Sklypas",
  other: "Kita",
  foundations: "Vanduo prie pamatų",
  basement: "Drėgnas rūsys",
  yard: "Šlapias kiemas",
  groundwater: "Gruntinis vanduo",
  new: "Naujam namui",
  rain: "Lietaus vanduo",
  unknown: "Reikia įvertinti",
  soon: "Kuo greičiau",
  month: "Per mėnesį",
  quarter: "Per 1–3 mėnesius",
  later: "Vėliau",
};
export async function sendLead(lead: Lead, photos: LeadPhoto[], env: Env) {
  if (!env.EMAIL || !env.EMAIL_FROM || !env.ADMIN_EMAIL)
    throw new Error("email_not_configured");
  await env.EMAIL.send({
    from: env.EMAIL_FROM,
    to: env.ADMIN_EMAIL,
    replyTo: lead.email || env.BUSINESS_REPLY_TO,
    subject: "Nauja drenažo užklausa – drenazoirengimas.lt",
    text: [
      `Užklausos numeris: ${lead.requestId}`,
      `Vardas: ${lead.name}`,
      `Telefonas: ${lead.phone}`,
      `El. paštas: ${lead.email || "Nepateiktas"}`,
      `Vieta: ${lead.location}`,
      `Objektas: ${labels[lead.property]}`,
      `Problema: ${labels[lead.problem]}`,
      `Terminas: ${labels[lead.timing]}`,
      `Komentaras: ${lead.message || "Nepateiktas"}`,
      `Klausimynas: ${lead.diagnostic || "Nepildytas"}`,
      `Orientacinis scenarijus: ${lead.estimate || "Neskaičiuotas"}`,
      `Šaltinio puslapis: ${lead.source}`,
      "Privatumo versija: 2026-10-20-email-v2",
      `Pridėta nuotraukų: ${photos.length}`,
      "Nuotraukos pateiktos kaip šio laiško priedai.",
    ].join("\n"),
    attachments: photos.map((photo, i) => ({
      content: photo.bytes,
      filename: `objekto-nuotrauka-${i + 1}.${photo.mime === "image/jpeg" ? "jpg" : photo.mime === "image/png" ? "png" : "webp"}`,
      type: photo.mime,
      disposition: "attachment" as const,
    })),
    headers: { "X-Lead-Delivery-ID": `${lead.requestId}-admin` },
  });
}
