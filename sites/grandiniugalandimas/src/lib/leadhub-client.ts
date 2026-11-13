// Browser side of the LeadHub connection (shared by all LeadHub sites; keep the copies identical).
// Loads the tenant's contact card and work photos once per page view.
import { useEffect, useState } from "react";

export type LeadhubTenant = {
  company_name: string;
  company_code: string;
  vat_code: string;
  address: string;
  phone: string;
  email: string;
  hours: string;
  about: string;
};
export type LeadhubPhoto = { id: string; caption: string; src: string; srcSet: string };
/** Who runs the site (public identification for the privacy page). */
export type LeadhubOperator = {
  name: string;
  activity_cert: string;
  vat_code: string;
  address: string;
  email: string;
  phone: string;
};
export type LeadhubState = { ready: boolean; tenant: LeadhubTenant | null; gallery: LeadhubPhoto[];
  operator: LeadhubOperator | null; };

const EMPTY: LeadhubState = { ready: false, tenant: null, gallery: [], operator: null };
let state: LeadhubState = EMPTY;
let loading: Promise<LeadhubState> | null = null;
const listeners = new Set<(s: LeadhubState) => void>();

function load(): Promise<LeadhubState> {
  if (!loading) {
    loading = fetch("/api/leadhub/config", { credentials: "omit" })
      .then((r) => (r.ok ? r.json() : { tenant: null, gallery: [], operator: null }))
      .then((b: { tenant?: LeadhubTenant | null; gallery?: LeadhubPhoto[]; operator?: LeadhubOperator | null }) => ({ ready: true, tenant: b.tenant ?? null, gallery: b.gallery ?? [], operator: b.operator ?? null }))
      .catch(() => ({ ...EMPTY, ready: true }))
      .then((s) => {
        state = s;
        listeners.forEach((l) => l(s));
        return s;
      });
  }
  return loading;
}

/** Tenant contact card and gallery; `tenant` is null while the site is not rented. */
export function useLeadhub(): LeadhubState {
  // First render always matches the pre-rendered HTML (no tenant yet); the loaded state follows right after.
  const [s, set] = useState<LeadhubState>(EMPTY);
  useEffect(() => {
    listeners.add(set);
    if (!state.ready) void load();
    else set(state);
    return () => {
      listeners.delete(set);
    };
  }, []);
  return s;
}

const sent = new Set<string>();
/** Counts a phone or e-mail click once per page view (no personal data). */
export function trackContact(kind: "phone_click" | "email_click") {
  if (sent.has(kind)) return;
  sent.add(kind);
  const body = JSON.stringify({ kind });
  try {
    if (navigator.sendBeacon?.("/api/leadhub/event", new Blob([body], { type: "text/plain;charset=UTF-8" }))) return;
  } catch { /* fall through */ }
  void fetch("/api/leadhub/event", { method: "POST", headers: { "content-type": "application/json" }, body, keepalive: true }).catch(() => undefined);
}

/** "+370 612 34567" → "+37061234567" for tel: links. */
export const telHref = (phone: string) => `tel:${phone.replace(/[^\d+]/g, "")}`;
/** WhatsApp/Viber digits ("37061234567"). */
export const phoneDigits = (phone: string) => phone.replace(/\D/g, "");

/** Privacy page: who runs the site (data controller). */
export const operatorText = (o: LeadhubOperator | null) =>
  o
    ? [
        o.name,
        o.activity_cert && `individualios veiklos pažymos Nr. ${o.activity_cert}`,
        o.vat_code && `PVM mokėtojo kodas ${o.vat_code}`,
        o.address,
        o.email && `el. paštas ${o.email}`,
      ]
        .filter(Boolean)
        .join(", ") + "."
    : "fizinis asmuo, vykdantis individualią veiklą ir valdantis LeadHub svetainių tinklą.";

/** Privacy page: who currently receives enquiries (the tenant), or null while the site is not rented. */
export const providerText = (t: LeadhubTenant | null) =>
  t
    ? `Šiuo metu užklausas gauna ir paslaugas teikia ${[t.company_name, t.company_code && `įm. k. ${t.company_code}`, t.address].filter(Boolean).join(", ")}.`
    : null;
