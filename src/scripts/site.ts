import { rememberEntrySource, forgetEntrySource } from "./attribution";
import {
  setAnalyticsConsent,
  track,
  type ConversionEvent,
} from "../lib/analytics";
const menu = document.querySelector<HTMLButtonElement>(".menu-toggle");
const nav = document.querySelector<HTMLElement>("#navigation");
function closeMenu() {
  menu?.setAttribute("aria-label", "Atidaryti meniu");
  menu?.setAttribute("aria-expanded", "false");
  nav?.removeAttribute("data-open");
}
menu?.addEventListener("click", () => {
  const opened = menu.getAttribute("aria-expanded") === "true";
  menu.setAttribute("aria-expanded", String(!opened));
  nav?.toggleAttribute("data-open", !opened);
  menu.setAttribute(
    "aria-label",
    opened ? "Atidaryti meniu" : "Uždaryti meniu",
  );
});
nav?.addEventListener("click", (e) => {
  if ((e.target as HTMLElement).closest("a")) closeMenu();
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && menu?.getAttribute("aria-expanded") === "true") {
    closeMenu();
    menu.focus();
  }
});
document.addEventListener("click", (e) => {
  if (
    menu?.getAttribute("aria-expanded") === "true" &&
    !(e.target as HTMLElement).closest(".header")
  )
    closeMenu();
  const a = (e.target as HTMLElement).closest<HTMLElement>("[data-event]");
  if (a)
    track(a.dataset.event as ConversionEvent, {
      cta_position: a.closest(".hero")
        ? "hero"
        : a.closest(".header")
          ? "header"
          : a.closest(".mobile-cta")
            ? "mobile"
            : "body",
    });
});
const panel = document.querySelector<HTMLElement>(".consent-panel");
const config = JSON.parse(
  document.querySelector("#analytics-config")?.textContent || "{}",
) as { ga4?: string; cloudflare?: string; attribution?: boolean };
let initialized = false;
function safeReferrer() {
  try {
    const url = new URL(document.referrer);
    return url.origin + url.pathname;
  } catch {
    return "";
  }
}

function activate() {
  rememberEntrySource();
  setAnalyticsConsent(true);
  if (initialized) return;
  initialized = true;
  if (config.ga4) {
    window.dataLayer ??= [];
    window.gtag = function () {
      // The official gtag queue expects an IArguments object.
      // eslint-disable-next-line prefer-rest-params
      window.dataLayer!.push(arguments);
    };
    window.gtag("js", new Date());
    window.gtag("config", config.ga4, {
      send_page_view: false,
      page_location: location.origin + location.pathname,
      page_referrer: safeReferrer(),
      allow_google_signals: false,
      allow_ad_personalization_signals: false,
    });
    window.gtag("event", "page_view", {
      page_location: location.origin + location.pathname,
      page_path: location.pathname,
      page_title: document.title,
    });
    const script = document.createElement("script");
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(config.ga4)}`;
    document.head.append(script);
  }
  if (config.cloudflare) {
    const script = document.createElement("script");
    script.defer = true;
    script.src = "https://static.cloudflareinsights.com/beacon.min.js";
    script.dataset.cfBeacon = JSON.stringify({
      token: config.cloudflare,
      spa: false,
    });
    document.head.append(script);
  }
}
const hasAnalytics = Boolean(
  config.ga4 || config.cloudflare || config.attribution,
);
let consent: string | null = null;
try {
  const saved = JSON.parse(localStorage.getItem("drainage-consent") || "null");
  if (
    saved &&
    Date.now() - saved.at < 180 * 864e5 &&
    ["granted", "denied"].includes(saved.value)
  )
    consent = saved.value;
} catch {
  /* Storage can be unavailable. */
}
if (consent === "granted" && hasAnalytics) activate();
else forgetEntrySource();
if (!consent && hasAnalytics && panel) panel.hidden = false;
function revokeCookies() {
  for (const cookie of document.cookie.split(";")) {
    const name = cookie.trim().split("=")[0];
    if (name === "_ga" || name.startsWith("_ga_")) {
      for (const domain of ["", location.hostname, "." + location.hostname])
        document.cookie = `${name}=; Max-Age=0; path=/;${domain ? " domain=" + domain + ";" : ""} SameSite=Lax`;
    }
  }
}
document
  .querySelectorAll<HTMLButtonElement>("[data-consent]")
  .forEach((button) =>
    button.addEventListener("click", () => {
      const value = button.dataset.consent!;
      try {
        localStorage.setItem(
          "drainage-consent",
          JSON.stringify({ value, at: Date.now() }),
        );
      } catch {
        /* Choice applies to this page even without storage. */
      }
      if (panel) panel.hidden = true;
      if (value === "granted" && hasAnalytics) activate();
      else {
        forgetEntrySource();
        setAnalyticsConsent(false);
        if (initialized) {
          revokeCookies();
          location.reload();
        }
      }
    }),
  );
document
  .querySelectorAll<HTMLButtonElement>(".cookie-settings")
  .forEach((button) =>
    button.addEventListener("click", () => {
      if (panel) {
        panel.hidden = false;
        panel.querySelector<HTMLButtonElement>("button")?.focus();
      }
    }),
  );
