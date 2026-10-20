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
const escapeHtml = (value: string) =>
  value.replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ]!,
  );
export function renderLeadEmail(lead: Lead, photoCount: number) {
  const rows = [
    ["Vardas", lead.name],
    ["Telefonas", lead.phone],
    ...(lead.email ? [["El. paštas", lead.email]] : []),
    ["Vieta", lead.location],
    ["Objektas", labels[lead.property]],
    ["Problema", labels[lead.problem]],
    ["Terminas", labels[lead.timing]],
  ];
  const referrer = lead.referrer
    ? new URL(lead.referrer).hostname
    : "Nenustatytas";
  const text = [
    "NAUJA DRENAŽO UŽKLAUSA",
    "",
    ...rows.map(([label, value]) => `${label}: ${value}`),
    ...(lead.message ? ["", "Kliento komentaras:", lead.message] : []),
    ...(photoCount
      ? ["", `Pridėta nuotraukų: ${photoCount}. Jas rasite laiško prieduose.`]
      : []),
    "",
    `Atėjimo šaltinis: ${referrer}`,
    "drenazoirengimas.lt",
  ].join("\n");
  const html = `<!doctype html><html lang="lt"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head>
  <body style="margin:0;padding:20px 8px;background:#eff4f7;font-family:Arial,Helvetica,sans-serif;color:#082536">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0"><tr><td align="center">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:600px;background:#fff;border-radius:16px;overflow:hidden">
      <tr><td style="padding:24px;background:#082536;color:#fff"><p style="margin:0 0 8px;font-size:13px;letter-spacing:1px;color:#a8dae6">DRENAZOIRENGIMAS.LT</p><h1 style="margin:0;font-size:26px;line-height:1.3">Nauja užklausa</h1></td></tr>
      <tr><td style="padding:24px"><p style="margin:0 0 20px;font-size:18px;line-height:1.5"><strong>${escapeHtml(lead.name)}</strong> kreipiasi dėl drenažo.</p>
      <table width="100%" cellspacing="0" cellpadding="0" style="font-size:16px;line-height:1.5;border-collapse:collapse">
        ${rows.map(([label, value]) => `<tr><th scope="row" align="left" valign="top" style="width:35%;padding:10px 12px 10px 0;border-bottom:1px solid #e7edf1;font-weight:normal;color:#526877">${escapeHtml(label)}</th><td valign="top" style="padding:10px 0;border-bottom:1px solid #e7edf1;overflow-wrap:anywhere">${label === "Telefonas" ? `<a href="tel:${escapeHtml(lead.phone)}" style="color:#006d86;font-weight:bold">${escapeHtml(value)}</a>` : label === "El. paštas" ? `<a href="mailto:${escapeHtml(encodeURIComponent(lead.email))}" style="color:#006d86">${escapeHtml(value)}</a>` : escapeHtml(value)}</td></tr>`).join("")}
      </table>
      ${lead.message ? `<h2 style="margin:24px 0 8px;font-size:17px">Kliento komentaras</h2><p style="margin:0;font-size:16px;line-height:1.6;overflow-wrap:anywhere">${escapeHtml(lead.message).replace(/\n/g, "<br>")}</p>` : ""}
      ${photoCount ? `<p style="margin:24px 0 0;padding:14px;background:#eff7fa;border-radius:8px;font-size:15px;line-height:1.5">Pridėta nuotraukų: <strong>${photoCount}</strong>. Jas rasite laiško prieduose.</p>` : ""}
      <p style="margin:24px 0 0;font-size:13px;line-height:1.5;color:#526877">Atėjimo šaltinis: ${escapeHtml(referrer)}</p>
      </td></tr>
    </table>
  </td></tr></table></body></html>`;
  return { text, html };
}
export async function sendLead(lead: Lead, photos: LeadPhoto[], env: Env) {
  if (!env.EMAIL || !env.EMAIL_FROM || !env.ADMIN_EMAIL)
    throw new Error("email_not_configured");
  const content = renderLeadEmail(lead, photos.length);
  await env.EMAIL.send({
    from: env.EMAIL_FROM,
    to: env.ADMIN_EMAIL,
    replyTo: lead.email || env.BUSINESS_REPLY_TO,
    subject: "Nauja drenažo užklausa – drenazoirengimas.lt",
    ...content,
    attachments: photos.map((photo, i) => ({
      content: photo.bytes,
      filename: `objekto-nuotrauka-${i + 1}.${photo.mime === "image/jpeg" ? "jpg" : photo.mime === "image/png" ? "png" : "webp"}`,
      type: photo.mime,
      disposition: "attachment" as const,
    })),
    headers: { "X-Lead-Delivery-ID": `${lead.requestId}-admin` },
  });
}
