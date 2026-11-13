// E-mail about a new order enquiry (to the tenant while rented, otherwise to the owner).
import { BUSINESS, quote, formatEur } from "../src/config/business";
import type { Lead } from "../src/lib/lead/schema";

const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

function buildLeadEmail(lead: Lead, opts: { businessName: string; timestamp: string }) {
  const pricing = quote(lead.quantity);
  const rows: [string, string][] = [
    ["Klientas", lead.name],
    ["Kliento telefonas", lead.phone],
    ["Kliento el. paštas", lead.email],
    ["Miestas", lead.city],
    ["Grandinių kiekis", String(lead.quantity)],
    ["Grandinių informacija", lead.chainInfo],
    ["Galandimas", pricing ? formatEur(pricing.chainPrice) : "Kaina derinama"],
    ["Grąžinimas klientui", BUSINESS.shipping.enabled && pricing ? formatEur(pricing.shippingPrice) : ""],
    ["Klientui pateikta orientacinė suma", pricing ? formatEur(pricing.total) : "Kaina derinama"],
    ["Siuntimas galandimui", BUSINESS.shipping.enabled ? "Klientas siuntimą galandimui užsako ir apmoka vežėjui atskirai. Šios išlaidos neįtrauktos į pateiktą sumą." : ""],
    ["Būsena", "Nauja kliento užklausa – reikia susisiekti ir suderinti sąlygas"],
    ["Žinutė", lead.message],
    ["Puslapis", lead.pageUrl],
    ["Laikas", opts.timestamp],
  ].filter(([, v]) => v) as [string, string][];

  const subject = `Kliento užklausa: ${lead.name.replace(/[\r\n]+/g, " ")} – ${lead.quantity} vnt.${lead.city ? ` (${lead.city.replace(/[\r\n]+/g, " ")})` : ""}`;
  const intro = `Svetainėje „${opts.businessName}“ gauta nauja kliento užklausa. Šis pranešimas skirtas paslaugos administratoriui.`;
  const nextStep = "Toliau: susisiekite su klientu, patvirtinkite kainą, siuntimo tinklą ir gavėjo duomenis. Grąžinimo paštomatą suderinkite atskirai. Klientui automatinis patvirtinimo laiškas nesiunčiamas. Paspaudus „Atsakyti“, atsakymas bus adresuojamas klientui.";
  const text = [intro, "", rows.map(([k, v]) => `${k}: ${v}`).join("\n"), "", nextStep].join("\n");
  const html = `<h2 style="font-family:sans-serif">Gauta kliento užklausa</h2><p style="font-family:sans-serif;font-size:14px">${esc(intro)}</p><table style="font-family:sans-serif;font-size:14px;border-collapse:collapse">${rows
    .map(
      ([k, v]) =>
        `<tr><td style="padding:4px 12px 4px 0;color:#666;vertical-align:top">${esc(k)}</td><td style="padding:4px 0;white-space:pre-wrap">${esc(v)}</td></tr>`,
    )
    .join("")}</table><p style="font-family:sans-serif;font-size:14px;line-height:1.6">${esc(nextStep)}</p>`;

  return { subject, text, html };
}


const now = () => new Date().toLocaleString("lt-LT", { timeZone: "Europe/Vilnius" });
export function renderLeadEmail(lead: Lead, _photoCount = 0) {
  void _photoCount;
  const { text, html } = buildLeadEmail(lead, { businessName: BUSINESS.businessName, timestamp: now() });
  return { text, html };
}
export function leadEmailSubject(lead: Lead) {
  return buildLeadEmail(lead, { businessName: BUSINESS.businessName, timestamp: "" }).subject;
}
