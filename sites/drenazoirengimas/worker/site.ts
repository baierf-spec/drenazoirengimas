// The site's side of the shared lead-site kit (resolved as "@site/lead"): form rules and e-mail content.
import { labels } from "./email";
import type { Lead } from "../src/lib/validation";
export { LIMITS, imageType, validateLead, type Lead } from "../src/lib/validation";
export { labels, renderLeadEmail } from "./email";
export const leadSubject = "Nauja drenažo užklausa – drenazoirengimas.lt";
export const attachmentName = "objekto-nuotrauka";
/** Contact-free summary sent to LeadHub (no name, phone or e-mail). */
export const leadSummaryParts = (lead: Lead) => [
  lead.location,
  labels[lead.property],
  labels[lead.problem],
  labels[lead.timing],
  lead.message,
];

/** Row for the owner's enquiries sheet ("Lead domains" → Užklausos). */
export const sheetSite = "drenazoirengimas.lt";
export const sheetLead = (lead: Lead) => ({
  vardas: lead.name,
  telefonas: lead.phone,
  pastas: lead.email,
  vietove: lead.location,
  uzklausa: [labels[lead.property], labels[lead.problem], labels[lead.timing], lead.message].filter(Boolean).join(" · "),
});
