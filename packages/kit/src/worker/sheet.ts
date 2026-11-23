// Užklausų įrašymas į Google Sheets lentelę „Lead domains“ per Apps Script.
// Įjungiama paslaptimis SHEET_WEBHOOK_URL ir SHEET_WEBHOOK_TOKEN; be jų nieko nesiunčiama.

export type SourceMeta = { ref?: string; utm_source?: string; utm_medium?: string; gclid?: string; fbclid?: string };
export type SheetLead = { vardas?: string; telefonas?: string; pastas?: string; vietove?: string; uzklausa?: string };
export type SheetEnv = { SHEET_WEBHOOK_URL?: string; SHEET_WEBHOOK_TOKEN?: string };

const AI = /(chatgpt|openai|perplexity|gemini|copilot|claude|deepseek|grok|you\.com|bard)/;

/** Šaltinis tokiu pavadinimu, koks yra lentelės sąraše. */
export function classifySource(m: SourceMeta = {}): string {
  const ref = String(m.ref || "").toLowerCase().replace(/^www\./, "");
  const src = String(m.utm_source || "").toLowerCase();
  const med = String(m.utm_medium || "").toLowerCase();
  const paid = /^(cpc|ppc|paid|paid[_-]?search|sem|display|ads?)$/.test(med);
  if (m.gclid || (src.includes("google") && paid)) return "Google Ads";
  if (m.fbclid || /(facebook|instagram|^fb$|^ig$|^meta$)/.test(src) || /(^|\.)(facebook\.com|instagram\.com|fb\.com|fb\.me)$/.test(ref))
    return "Facebook / Instagram";
  if (AI.test(src) || AI.test(ref)) return "AI paieška";
  if (/(^|\.)google\.[a-z.]+$/.test(ref) || src === "google") return "Google (organinis)";
  if (/(^|\.)bing\.com$/.test(ref) || src === "bing") return "Bing";
  if (!ref && !src) return "Tiesioginis";
  return "Nuoroda iš kito puslapio";
}

/** Iš formos laukų paima tik šaltinio duomenis (be asmens duomenų). */
export function entryMeta(d: Record<string, unknown> = {}) {
  const s = (v: unknown, n: number) => (typeof v === "string" ? v.trim().slice(0, n) : "");
  let ref = s(d["entry_ref"], 200);
  // Tik domenas: kelias ir parametrai nesaugomi.
  if (ref.includes("/")) {
    try { ref = new URL(ref).hostname; } catch { ref = ""; }
  }
  return {
    ref: ref.replace(/^www\./, ""),
    page: s(d["entry_page"], 200).replace(/[?#].*$/, ""),
    utm_source: s(d["utm_source"], 100),
    utm_medium: s(d["utm_medium"], 100),
    utm_campaign: s(d["utm_campaign"], 150),
    gclid: d["gclid"] ? "1" : "",
    fbclid: d["fbclid"] ? "1" : "",
  };
}

const pathOf = (url: string) => {
  try {
    return url ? new URL(url).pathname : "";
  } catch {
    return "";
  }
};

/** Šaltinio laukai tiesiai iš formos (veikia su bet kuria svetainės formos schema). */
export function formEntry(form: FormData) {
  const g = (k: string) => {
    const v = form.get(k);
    return typeof v === "string" ? v : "";
  };
  return entryMeta({
    entry_ref: g("entry_ref") || g("referrer"),
    entry_page: g("entry_page") || g("puslapis") || (g("source").startsWith("/") ? g("source") : "") || pathOf(g("pageUrl")),
    utm_source: g("utm_source"),
    utm_medium: g("utm_medium"),
    utm_campaign: g("utm_campaign"),
    gclid: g("gclid"),
    fbclid: g("fbclid"),
  });
}

/** Viena eilutė lentelei; `site` yra domenas, kaip jis įrašytas suvestinėje. */
export function sheetRow(site: string, meta: ReturnType<typeof entryMeta>, lead: SheetLead) {
  const page = meta.page && meta.page.startsWith("/") ? meta.page : "/";
  // Perėjimas iš to paties puslapio nėra šaltinis.
  const ref = meta.ref === site || meta.ref === `www.${site}` ? "" : meta.ref;
  meta = { ...meta, ref };
  return {
    data: new Date().toISOString(),
    puslapis: site,
    saltinis: classifySource(meta),
    iejimas: `https://${site}${page}`,
    vardas: lead.vardas || "",
    telefonas: lead.telefonas || "",
    pastas: lead.pastas || "",
    vietove: lead.vietove || "",
    uzklausa: lead.uzklausa || "",
    pastabos: meta.ref ? `Atėjo iš: ${meta.ref}` : "",
    utm_source: meta.utm_source,
    utm_campaign: meta.utm_campaign,
  };
}

/** Išsiunčia eilutę; klaida nestabdo užklausos (laiškas jau išsiųstas). */
export async function sendToSheet(env: SheetEnv | undefined, row: ReturnType<typeof sheetRow>): Promise<boolean> {
  if (!env || !env.SHEET_WEBHOOK_URL || !env.SHEET_WEBHOOK_TOKEN) return false;
  try {
    const r = await fetch(env.SHEET_WEBHOOK_URL, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ token: env.SHEET_WEBHOOK_TOKEN, row }),
      redirect: "follow",
    });
    const j = (await r.json().catch(() => ({}))) as { ok?: boolean; error?: string };
    if (!j.ok) console.error("lentelė: įrašas nepriimtas", r.status, j.error || "");
    return j.ok === true;
  } catch (e) {
    console.error("lentelė: nepavyko išsiųsti", e);
    return false;
  }
}
