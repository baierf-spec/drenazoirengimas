// LeadHub connection for this lead site (shared by all LeadHub sites; keep the copies identical).
//
// LeadHub decides what the site shows: while the site is rented, the tenant's contact card and
// work photos; otherwise nothing (the page shows only the enquiry form) and enquiries go to the
// site owner. The Worker talks to LeadHub over a service binding:
//   wrangler: "services": [{ "binding": "LEADHUB", "service": "leadhub" }]
//   vars: LEADHUB_SITE_KEY   secret: LEADHUB_SECRET
// Without the binding the site simply behaves as "not rented".

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
export type LeadhubPhoto = { id: string; caption: string; base: string };
/** Who runs the site (public identification for the privacy page). */
export type LeadhubOperator = {
  name: string;
  activity_cert: string;
  vat_code: string;
  address: string;
  email: string;
  phone: string;
};
export type LeadhubConfig = {
  tenant: LeadhubTenant | null;
  /** Server only: where enquiries go while rented. Never sent to the browser. */
  lead_email: string | null;
  gallery: LeadhubPhoto[];
  operator: LeadhubOperator | null;
};
/** What the browser gets from GET /api/leadhub/config. */
export type LeadhubPublicConfig = {
  tenant: LeadhubTenant | null;
  operator: LeadhubOperator | null;
  gallery: { id: string; caption: string; src: string; srcSet: string }[];
};

type Fetcher = {
  fetch(input: Request | string, init?: RequestInit): Promise<Response>;
};
export type LeadhubEnv = {
  LEADHUB?: Fetcher;
  LEADHUB_SITE_KEY?: string;
  LEADHUB_SECRET?: string;
};
type Ctx = { waitUntil(p: Promise<unknown>): void } | undefined;

const EMPTY: LeadhubConfig = { tenant: null, lead_email: null, gallery: [], operator: null };
const FRESH_MS = 60_000; // changes in LeadHub show up within a minute
const CACHE_URL = "https://leadhub.cache/site-config";
const SIZES = [480, 960, 1600] as const;

let memory: { at: number; config: LeadhubConfig } | null = null;

const connected = (env: LeadhubEnv) =>
  !!(env.LEADHUB && env.LEADHUB_SITE_KEY && env.LEADHUB_SECRET);
const authHeaders = (env: LeadhubEnv) => ({
  "x-site-key": env.LEADHUB_SITE_KEY!,
  "x-site-secret": env.LEADHUB_SECRET!,
});

function edgeCache(): Cache | null {
  try {
    return (
      (globalThis as unknown as { caches?: { default?: Cache } }).caches
        ?.default ?? null
    );
  } catch {
    return null;
  }
}

/**
 * Current rental state. Fresh for a minute; when LeadHub cannot be reached the last known
 * state is kept (so a tenant's contacts never disappear during an outage).
 */
export async function leadhubConfig(env: LeadhubEnv): Promise<LeadhubConfig> {
  if (!connected(env)) return EMPTY;
  if (memory && Date.now() - memory.at < FRESH_MS) return memory.config;
  const cache = edgeCache();
  try {
    const res = await env.LEADHUB!.fetch(
      new Request("https://leadhub/api/site/config", {
        headers: authHeaders(env),
      }),
    );
    if (!res.ok) throw new Error(`LeadHub ${res.status}`);
    const body = (await res.json()) as Partial<LeadhubConfig>;
    const config: LeadhubConfig = {
      tenant: body.tenant ?? null,
      lead_email: body.lead_email ?? null,
      gallery: body.gallery ?? [],
      operator: body.operator ?? null,
    };
    memory = { at: Date.now(), config };
    await cache
      ?.put(
        CACHE_URL,
        new Response(JSON.stringify(config), {
          headers: { "cache-control": "max-age=604800" },
        }),
      )
      .catch(() => undefined);
    return config;
  } catch (error) {
    console.error("LeadHub config unavailable", error);
    if (memory) return memory.config;
    const stale = await cache?.match(CACHE_URL).catch(() => undefined);
    if (stale) {
      const config = (await stale.json()) as LeadhubConfig;
      memory = { at: Date.now() - FRESH_MS / 2, config };
      return config;
    }
    return EMPTY;
  }
}

export function publicConfig(config: LeadhubConfig): LeadhubPublicConfig {
  return {
    tenant: config.tenant,
    operator: config.operator ?? null,
    gallery: config.gallery.map((p) => ({
      id: p.id,
      caption: p.caption,
      src: `/leadhub/gallery/${p.base}-960.webp`,
      srcSet: SIZES.map(
        (s) => `/leadhub/gallery/${p.base}-${s}.webp ${s}w`,
      ).join(", "),
    })),
  };
}

export type LeadhubEventKind = "form" | "phone_click" | "email_click";
/**
 * What the visitor asked for, without their name or contacts: LeadHub uses it only to decide whether an
 * enquiry is real (spam and duplicates are not billed to the tenant). E-mail addresses, phone numbers and
 * links are removed before anything leaves the site.
 */
export function leadSummary(parts: Array<string | number | null | undefined | false>): string {
  return parts
    .filter(Boolean)
    .join(" · ")
    .replace(/[^\s@]+@[^\s@]+\.[^\s@]+/g, "[el. paštas]")
    .replace(/https?:\/\/\S+|www\.\S+/gi, "[nuoroda]")
    .replace(/\+?\d[\d\s().-]{6,}\d/g, "[tel.]")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 600);
}

/** Records an enquiry or a contact click in LeadHub (no visitor personal data). */
export function leadhubEvent(
  env: LeadhubEnv,
  ctx: Ctx,
  kind: LeadhubEventKind,
  opts: { hasPhotos?: boolean | undefined; source?: string | undefined; summary?: string | undefined } = {},
): Promise<void> {
  if (!connected(env)) return Promise.resolve();
  const send = env
    .LEADHUB!.fetch(
      new Request("https://leadhub/api/site/event", {
        method: "POST",
        headers: { ...authHeaders(env), "content-type": "application/json" },
        body: JSON.stringify({
          kind,
          has_photos: !!opts.hasPhotos,
          source: opts.source ?? "", summary: kind === "form" ? leadSummary([opts.summary]) : "",
        }),
      }),
    )
    .then(
      (r) => {
        if (!r.ok) console.error("LeadHub event failed", r.status);
      },
      (e) => console.error("LeadHub event failed", e),
    );
  if (typeof ctx?.waitUntil === "function") ctx.waitUntil(send);
  return send;
}

/**
 * Where an enquiry e-mail goes: the tenant while the site is rented, otherwise the site owner.
 * `routedTo` is reported to LeadHub statistics by LeadHub itself.
 */
export async function leadRecipient(
  env: LeadhubEnv,
  ownerEmail: string | undefined,
) {
  const config = await leadhubConfig(env);
  const tenantEmail = config.tenant ? config.lead_email : null;
  return {
    to: tenantEmail || ownerEmail || "",
    tenant: config.tenant,
    isTenant: !!tenantEmail,
    owner: ownerEmail || "",
  };
}

/**
 * Sends an enquiry to the tenant; when that fails (for example the e-mail plan cannot reach the
 * address) the owner gets it with a forwarding note, so no enquiry is ever lost.
 */
export async function deliverLead(
  env: LeadhubEnv,
  ownerEmail: string | undefined,
  send: (to: string, subjectPrefix: string) => Promise<unknown>,
) {
  const r = await leadRecipient(env, ownerEmail);
  if (!r.isTenant) return send(r.to, "");
  try {
    return await send(r.to, "");
  } catch (error) {
    console.error("Lead to tenant failed, sending to owner", error);
    if (!r.owner) throw error;
    return send(
      r.owner,
      `[Persiųsti: ${r.tenant?.company_name || "nuomininkui"} <${r.to}>] `,
    );
  }
}

const json = (
  body: unknown,
  status = 200,
  extra: Record<string, string> = {},
) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", ...extra },
  });
const GALLERY_PATH =
  /^\/leadhub\/gallery\/(gallery\/[0-9a-f-]{36}\/[0-9a-f-]{36}-(?:480|960|1600)\.webp)$/i;

/**
 * Public routes: GET /api/leadhub/config, POST /api/leadhub/event (contact clicks),
 * GET /leadhub/gallery/... (tenant photos on this domain). Returns null for other paths.
 */
export async function handleLeadhub(
  request: Request,
  env: LeadhubEnv,
  ctx: Ctx,
): Promise<Response | null> {
  const url = new URL(request.url);
  if (url.pathname === "/api/leadhub/config" && request.method === "GET") {
    const config = publicConfig(await leadhubConfig(env));
    return json(config, 200, {
      "cache-control": "public, max-age=60",
      "x-robots-tag": "noindex",
    });
  }
  if (url.pathname === "/api/leadhub/event" && request.method === "POST") {
    const origin = request.headers.get("origin");
    if (origin && new URL(origin).host !== url.host)
      return json({ ok: false }, 403);
    let kind = "";
    try {
      kind = String(((await request.json()) as { kind?: unknown }).kind ?? "");
    } catch {
      /* empty */
    }
    if (kind !== "phone_click" && kind !== "email_click")
      return json({ ok: false }, 400);
    // Awaited (a few ms over the binding): background work may be cut off once the response is sent.
    await leadhubEvent(env, undefined, kind, { source: "site" });
    return json({ ok: true });
  }
  const m = GALLERY_PATH.exec(url.pathname);
  if (m && request.method === "GET") {
    if (!connected(env)) return new Response("Not found", { status: 404 });
    const cache = edgeCache();
    const hit = await cache?.match(request).catch(() => undefined);
    if (hit) return hit;
    const res = await env.LEADHUB!.fetch(
      new Request(`https://leadhub/api/gallery/${m[1]}`),
    );
    if (!res.ok)
      return new Response("Not found", {
        status: 404,
        headers: { "cache-control": "no-store" },
      });
    const out = new Response(res.body, {
      headers: {
        "content-type": "image/webp",
        "cache-control": "public, max-age=3600",
        etag: res.headers.get("etag") ?? "",
      },
    });
    if (cache && typeof ctx?.waitUntil === "function")
      ctx.waitUntil(cache.put(request, out.clone()).catch(() => undefined));
    return out;
  }
  return null;
}
