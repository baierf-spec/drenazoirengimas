import type { Env, LeadRecord, StoredLead } from "./types";
import { signedPhotoUrl } from "./security";
export interface Mail {
  to: string;
  replyTo: string;
  subject: string;
  text: string;
  idempotencyKey: string;
}
export interface EmailProvider {
  send: (mail: Mail) => Promise<void>;
}
// Cloudflare-native transport; no external provider key or HTTP email API.
export function emailProvider(env: Env): EmailProvider {
  return {
    async send(mail) {
      if (!env.EMAIL || !env.EMAIL_FROM)
        throw new Error("email_not_configured");
      await env.EMAIL.send({
        from: env.EMAIL_FROM,
        to: mail.to,
        replyTo: mail.replyTo,
        subject: mail.subject,
        text: mail.text,
        // Correlation only: Cloudflare does not promise idempotent delivery.
        headers: { "X-Lead-Delivery-ID": mail.idempotencyKey },
      });
    },
  };
}
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
export async function deliverLead(record: LeadRecord, env: Env): Promise<void> {
  const now = Date.now();
  // Lease prevents concurrent scheduled/request deliveries from both sending the same outbox row.
  const claim = await env.DB.prepare(
    "UPDATE drainage_leads SET lease_until=? WHERE id=? AND lease_until<?",
  )
    .bind(now + 120000, record.id, now)
    .run();
  if (!claim.meta.changes) return;
  try {
    const current = await env.DB.prepare(
      "SELECT * FROM drainage_leads WHERE id=?",
    )
      .bind(record.id)
      .first<LeadRecord>();
    if (!current) return;
    const lead = JSON.parse(current.payload) as StoredLead;
    const photos = JSON.parse(current.photos) as string[];
    const mail = emailProvider(env);
    if (!current.admin_sent) {
      const links = await Promise.all(
        photos.map((key) =>
          signedPhotoUrl(key, env, record.created_at + 7 * 864e5),
        ),
      );
      const lines = [
        `Nauja užklausa: ${record.id}`,
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
        `Privatumo versija: ${lead.consentVersion}`,
        `Nuotraukos (${photos.length}; nuorodos galioja iki ${new Date(record.created_at + 7 * 864e5).toISOString()}):`,
        ...links,
      ];
      await mail.send({
        to: env.ADMIN_EMAIL!,
        replyTo: lead.email || env.BUSINESS_REPLY_TO!,
        subject: "Nauja drenažo užklausa – drenazoirengimas.lt",
        text: lines.join("\n"),
        idempotencyKey: `${record.id}-admin`,
      });
      await env.DB.prepare("UPDATE drainage_leads SET admin_sent=1 WHERE id=?")
        .bind(record.id)
        .run();
    }
    if (
      !current.customer_sent &&
      lead.email &&
      env.CUSTOMER_CONFIRMATION === "true"
    ) {
      await mail.send({
        to: lead.email,
        replyTo: env.BUSINESS_REPLY_TO!,
        subject: "Jūsų užklausa gauta – drenazoirengimas.lt",
        text: `Sveiki, ${lead.name},\n\nGavome jūsų užklausą dėl objekto vietovėje „${lead.location}“.\nIšsaugojome pateiktą informaciją ir ${photos.length} nuotrauką (-as).\n\nInformacija bus naudojama situacijai įvertinti ir su jumis susisiekti. Darbų apimtį ir kainą suderinsite su pasirinktu paslaugos teikėju.\n\nNorėdami papildyti informaciją, atsakykite į šį laišką.\n\nUžklausos numeris: ${record.id}\nhttps://drenazoirengimas.lt`,
        idempotencyKey: `${record.id}-customer`,
      });
      await env.DB.prepare(
        "UPDATE drainage_leads SET customer_sent=1 WHERE id=?",
      )
        .bind(record.id)
        .run();
    } else if (!lead.email || env.CUSTOMER_CONFIRMATION !== "true")
      await env.DB.prepare(
        "UPDATE drainage_leads SET customer_sent=1 WHERE id=?",
      )
        .bind(record.id)
        .run();
    await env.DB.prepare(
      "UPDATE drainage_leads SET lease_until=0,next_attempt=0 WHERE id=?",
    )
      .bind(record.id)
      .run();
  } catch {
    const attempts = record.attempts + 1;
    const retry =
      now + Math.min(6 * 3600e3, Math.pow(2, Math.min(attempts, 10)) * 60000);
    await env.DB.prepare(
      "UPDATE drainage_leads SET lease_until=0,attempts=?,next_attempt=? WHERE id=?",
    )
      .bind(attempts, retry, record.id)
      .run();
    // No form contents, email provider response bodies, tokens or IP addresses are logged.
  }
}
