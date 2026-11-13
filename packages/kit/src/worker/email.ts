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
  const message = {
    to: to || settings.adminEmail,
    replyTo: lead.email || settings.replyTo,
    subject: subjectPrefix + (typeof leadSubject === "string" ? leadSubject : (leadSubject as (l: Lead) => string)(lead)),
    ...content,
    headers: { "X-Lead-Delivery-ID": `${lead.requestId}-admin` },
  };
  const attachments = photos.map((photo, i) => ({
    content: photo.bytes,
    filename: `${attachmentName}-${i + 1}.${EXT[photo.mime] ?? "jpg"}`,
    type: photo.mime,
    disposition: "attachment" as const,
  }));
  // A lead is never lost: try the main sender, then EMAIL_FROM_FALLBACK (another onboarded domain);
  // if the photos are what fails, send the enquiry without them and say so.
  const senders = [settings.emailFrom, env.EMAIL_FROM_FALLBACK].filter((v): v is string => !!v);
  const attempt = async (withPhotos: boolean) => {
    let last: unknown;
    for (const from of senders) {
      try {
        await env.EMAIL!.send({
          ...message,
          from,
          ...(withPhotos && attachments.length ? { attachments } : {}),
          ...(!withPhotos && attachments.length ? { text: `${message.text}\n\n(Nuotraukų nepavyko prisegti – susisiekite su klientu.)` } : {}),
        });
        return;
      } catch (error) {
        last = error;
        console.error("lead e-mail failed", from, (error as Error)?.message);
      }
    }
    throw last ?? new Error("email_not_sent");
  };
  try {
    await attempt(true);
  } catch (error) {
    if (!attachments.length) throw error;
    await attempt(false);
  }
}
const EXT: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "image/heic": "heic", "image/heif": "heif" };
