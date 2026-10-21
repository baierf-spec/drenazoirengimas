export type ConversionEvent =
  | "phone_click"
  | "quote_started"
  | "quote_submitted"
  | "photo_uploaded"
  | "diagnostic_started"
  | "diagnostic_completed"
  | "cost_estimator_completed"
  | "primary_cta_click";
declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    turnstile?: {
      render: (el: HTMLElement, options: Record<string, unknown>) => string;
      reset: (id?: string) => void;
    };
    onTurnstileLoaded?: () => void;
  }
}
let enabled = false;
const allowedKeys = new Set([
  "page_type",
  "cta_position",
  "problem_type",
  "property_type",
  "photo_count",
  "estimate_min",
  "estimate_max",
  "step",
]);
export function setAnalyticsConsent(value: boolean) {
  enabled = value;
}
export function track(
  event: ConversionEvent,
  properties: Record<string, string | number> = {},
) {
  if (!enabled) return;
  const safe = Object.fromEntries(
    Object.entries(properties).filter(([key]) => allowedKeys.has(key)),
  );
  // Never include form values, URLs containing query strings, filenames or contact details.
  window.dataLayer ??= [];
  window.dataLayer.push({ event, ...safe });
  window.gtag?.("event", event, safe);
}

// Matches the standard GA4 tag loaded in Base. The ID is kept locally only
// for deduplication and is never sent to Analytics.
const reportedLeads = new Set<string>();
export async function reportGeneratedLead(id: string): Promise<void> {
  if (!window.gtag || reportedLeads.has(id)) return;
  let saved: string[] = [];
  try {
    const value: unknown = JSON.parse(
      sessionStorage.getItem("drainage-counted-leads") || "[]",
    );
    if (Array.isArray(value))
      saved = value.filter((item): item is string => typeof item === "string");
  } catch {
    /* Storage is optional. */
  }
  if (saved.includes(id)) return;
  reportedLeads.add(id);
  try {
    sessionStorage.setItem(
      "drainage-counted-leads",
      JSON.stringify([...saved.slice(-49), id]),
    );
  } catch {
    /* In-memory duplicate protection still applies. */
  }
  await new Promise<void>((resolve) => {
    const timer = window.setTimeout(resolve, 1500);
    const done = () => {
      window.clearTimeout(timer);
      resolve();
    };
    try {
      window.gtag!("event", "generate_lead", {
        form_name: "kontaktinė_forma",
        lead_type: "užklausa",
        event_callback: done,
        event_timeout: 1500,
      });
    } catch {
      done();
    } // Analytics must never turn a delivered enquiry into an error.
  });
}
