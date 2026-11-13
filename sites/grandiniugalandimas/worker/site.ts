// The site's side of the shared lead-site kit (resolved as "@site/lead"): order form rules and e-mail.
import { leadSchema, type Lead as FormLead } from "../src/lib/lead/schema";

export type Lead = FormLead & { requestId: string };
/** Small JSON-like form, no photos. */
export const LIMITS = { request: 10_000, photos: 0, file: 0, total: 0 } as const;
export const imageType = (_bytes?: Uint8Array): string | null => (void _bytes, null);

const requestId = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const text = (form: FormData, key: string) => {
  const v = form.get(key);
  return typeof v === "string" ? v : "";
};

/** Same rules as the browser (src/lib/lead/schema.ts) plus the delivery id used against double sends. */
export function validateLead(form: FormData) {
  const id = text(form, "requestId");
  const estimated = text(form, "estimatedTotal");
  const result = leadSchema.safeParse({
    name: text(form, "name"),
    phone: text(form, "phone"),
    email: text(form, "email"),
    city: text(form, "city"),
    quantity: Number(text(form, "quantity")),
    chainInfo: text(form, "chainInfo"),
    message: text(form, "message"),
    estimatedTotal: estimated === "" ? null : Number(estimated),
    pageUrl: text(form, "pageUrl"),
    website: text(form, "website"),
  });
  if (!result.success || !requestId.test(id)) {
    const error = result.success ? null : result.error;
    return {
      success: false as const,
      error: {
        flatten: () => ({
          fieldErrors: {
            ...(error ? Object.fromEntries(error.issues.map((i) => [String(i.path[0] ?? "form"), [i.message]])) : {}),
            ...(requestId.test(id) ? {} : { requestId: ["Atnaujinkite puslapį."] }),
          },
        }),
      },
    };
  }
  return { success: true as const, data: { ...result.data, requestId: id } satisfies Lead };
}

/** Hidden field that people never see: when it is filled the sender is a bot. */
export const isBot = (form: FormData) => text(form, "website").trim() !== "";

export { leadEmailSubject as leadSubject } from "./email";
export const attachmentName = "nuotrauka";

/** Contact-free summary sent to LeadHub (no name, phone or e-mail). */
export const leadSummaryParts = (lead: Lead) => [lead.city, `${lead.quantity} grandin.`, lead.chainInfo, lead.message];

export { renderLeadEmail } from "./email";
