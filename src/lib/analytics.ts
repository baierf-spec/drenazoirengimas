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
