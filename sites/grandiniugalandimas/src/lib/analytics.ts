import { BUSINESS } from "@/config/business";

/** Public GA4 destination; transferable with the rest of the business settings. */
export const GA_ID = BUSINESS.analytics.measurementId.trim();
export const GA_BOOTSTRAP = "window.dataLayer=window.dataLayer||[];window.gtag=window.gtag||function(){window.dataLayer.push(arguments);};";

const CONSENT_KEY = "analytics_consent";
export type ConsentValue = "granted" | "denied";
type Gtag = (...args: unknown[]) => void;
declare global {
  interface Window { dataLayer?: unknown[]; gtag?: Gtag; }
}

export function getConsent(): ConsentValue | null {
  if (typeof window === "undefined") return null;
  try {
    const value = window.localStorage.getItem(CONSENT_KEY);
    return value === "granted" || value === "denied" ? value : null;
  } catch { return null; }
}

export function setConsent(value: ConsentValue) {
  try { window.localStorage.setItem(CONSENT_KEY, value); } catch { /* Storage may be unavailable. */ }
}

export function loadAnalytics() {
  if (!GA_ID || typeof document === "undefined" || getConsent() !== "granted") return;
  if (document.getElementById("ga4-tag")) return;
  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function gtag() {
    // eslint-disable-next-line prefer-rest-params
    window.dataLayer!.push(arguments);
  };
  window.gtag("js", new Date());
  // The Google tag handles initial and browser-history page views; do not send duplicates manually.
  window.gtag("config", GA_ID);
  const script = document.createElement("script");
  script.id = "ga4-tag";
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(GA_ID)}`;
  document.head.appendChild(script);
}

/** Only a successful server response AFTER the provider accepted the admin email counts. */
export function trackConfirmedLead(
  responseOk: boolean,
  result: { ok?: boolean; emailSent?: boolean; tracked?: boolean } | null,
) {
  if (!GA_ID || !responseOk || result?.ok !== true || result.emailSent !== true) return;
  // Serveris jau užskaitė užklausą GA (Measurement Protocol) – nedubliuojame.
  if (result.tracked === true) return;
  try {
    if (getConsent() !== "granted") return;
    loadAnalytics();
    window.gtag?.("event", "generate_lead", {
      form_name: "kontaktinė_forma",
      lead_type: "užklausa",
      send_to: GA_ID,
    });
  } catch { /* Analytics must never turn a delivered enquiry into a form error. */ }
}

/** GA identifikatoriai iš slapukų (tik po sutikimo), kad serverio įvykis būtų priskirtas lankytojui. */
export function gaHeaders(): Record<string, string> {
  if (typeof document === "undefined" || !GA_ID) return {};
  const cookie = document.cookie;
  const cid = /(?:^|;\s*)_ga=GA\d\.\d\.(\d+\.\d+)/.exec(cookie)?.[1];
  const raw = new RegExp(`(?:^|;\\s*)_ga_${GA_ID.replace(/^G-/, "")}=([^;]+)`).exec(cookie)?.[1] ?? "";
  const sid = /\$?s(\d{9,})/.exec(raw)?.[1] ?? /^GS1\.\d\.(\d{9,})/.exec(raw)?.[1];
  return { ...(cid && { "X-GA-Client-Id": cid }), ...(sid && { "X-GA-Session-Id": sid }) };
}
