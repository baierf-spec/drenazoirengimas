import { externalReferrer } from "../lib/attribution";
const key = "drainage-entry-source";
function consentGranted() {
  try {
    const c = JSON.parse(localStorage.getItem("drainage-consent") || "null");
    return (
      c?.value === "granted" &&
      Number.isFinite(c.at) &&
      Date.now() - c.at >= 0 &&
      Date.now() - c.at < 180 * 864e5
    );
  } catch {
    return false;
  }
}
export function forgetEntrySource() {
  try {
    sessionStorage.removeItem(key);
  } catch {
    /* Optional storage. */
  }
}
export function rememberEntrySource(referrer = document.referrer) {
  if (!consentGranted()) {
    forgetEntrySource();
    return;
  }
  try {
    const old = JSON.parse(sessionStorage.getItem(key) || "null");
    if (
      old &&
      Number.isFinite(old.at) &&
      Date.now() - old.at >= 0 &&
      Date.now() - old.at < 864e5
    )
      return;
    // An internal referrer without a previous saved entry means the original source is unknown.
    sessionStorage.setItem(
      key,
      JSON.stringify({
        origin: externalReferrer(referrer, location.origin),
        at: Date.now(),
      }),
    );
  } catch {
    /* Form still works without storage. */
  }
}
export function entrySource() {
  if (!consentGranted()) {
    forgetEntrySource();
    return "";
  }
  try {
    const saved = JSON.parse(sessionStorage.getItem(key) || "null");
    if (
      saved &&
      typeof saved.origin === "string" &&
      Number.isFinite(saved.at) &&
      Date.now() - saved.at >= 0 &&
      Date.now() - saved.at < 864e5
    )
      return externalReferrer(saved.origin, location.origin);
  } catch {
    /* Optional source. */
  }
  return externalReferrer(document.referrer, location.origin);
}
