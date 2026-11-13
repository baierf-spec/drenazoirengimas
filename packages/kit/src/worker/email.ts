// Sends an enquiry by e-mail (Cloudflare Email Service). The site supplies the content.
import { runtimeSettings } from "@site/config";
import { attachmentName, leadSubject, renderLeadEmail, type Lead } from "@site/lead";
import type { Env } from "./types";
export type LeadPhoto = { bytes: ArrayBuffer; mime: string };
export async function sendLead(lead: Lead, photos: LeadPhoto[], env: Env, to?: string, subjectPrefix = "") {
  const settings = runtimeSettings(env as unknown as Record<string, unknown>);
  if (!env.EMAIL || !settings.emailFrom || !settings.adminEmail)
    throw new Error("email_not_configured");
  const content = renderLeadEmail(lead, photos.length);
  await env.EMAIL.send({
    from: settings.emailFrom,
    to: to || settings.adminEmail,
    replyTo: lead.email || settings.replyTo,
    subject: subjectPrefix + (typeof leadSubject === "string" ? leadSubject : (leadSubject as (l: Lead) => string)(lead)),
    ...content,
    attachments: photos.map((photo, i) => ({
      content: photo.bytes,
      filename: `${attachmentName}-${i + 1}.${photo.mime === "image/jpeg" ? "jpg" : photo.mime === "image/png" ? "png" : "webp"}`,
      type: photo.mime,
      disposition: "attachment" as const,
    })),
    headers: { "X-Lead-Delivery-ID": `${lead.requestId}-admin` },
  });
}
