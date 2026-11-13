// Worker entry: the shared lead-site runtime (aliases "@site/*" in wrangler.jsonc) plus this site's
// contractor sign-up form (/api/partner), which always goes to the owner.
import kit, { handleRequest } from "@leadsites/kit/worker";
import { json } from "@leadsites/kit/worker/leads";
import { validateTurnstile } from "@leadsites/kit/worker/security";
import { runtimeSettings } from "@site/config";
import type { Env } from "@leadsites/kit/worker/types";
import { PARTNER_FIELDS, clean, emailHtml } from "./email.js";

export { handleRequest };

async function partner(request: Request, env: Env): Promise<Response> {
  if (request.method !== "POST") return json({ ok: false, error: "Netinkamas metodas." }, 405);
  const settings = runtimeSettings(env as unknown as Record<string, unknown>);
  if (request.headers.get("Origin") !== settings.origin) return json({ ok: false, error: "Neleistinas šaltinis." }, 403);
  if (Number(request.headers.get("content-length") || 0) > 20_000) return json({ ok: false, error: "Per didelė užklausa." }, 413);
  const form = await request.formData().catch(() => null);
  if (!form) return json({ ok: false, error: "Netinkami duomenys." }, 400);
  if (clean(form.get("website"))) return json({ ok: true });
  const token = String(form.get("cf-turnstile-response") ?? "");
  if (!token || !(await validateTurnstile(token, request, env, crypto.randomUUID())))
    return json({ ok: false, error: "Nepavyko patvirtinti, kad esate ne robotas. Atnaujinkite puslapį ir bandykite dar kartą." }, 400);
  const data: Record<string, string> = {};
  for (const [k] of PARTNER_FIELDS) {
    const v = clean(form.get(k), 300);
    if (v) data[k] = v;
  }
  if (!data.imone) return json({ ok: false, error: "Įrašykite įmonės pavadinimą." }, 400);
  if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) return json({ ok: false, error: "Patikrinkite el. pašto adresą." }, 400);
  const id = crypto.randomUUID();
  const when = new Date().toLocaleString("lt-LT", { timeZone: "Europe/Vilnius", dateStyle: "short", timeStyle: "short" });
  const subject = `Naujas partneris: ${data.imone}${data.regionas ? ", " + data.regionas : ""}`;
  const html = emailHtml({ kicker: "Naujas partnerio kontaktas", title: data.imone, data, sections: [["Kontaktas", PARTNER_FIELDS]], attachments: [], when, id, country: "" });
  const text = [subject, "", ...PARTNER_FIELDS.filter(([k]) => data[k]).map(([k, l]) => `${l}: ${data[k]}`), "", `${when} · ID ${id}`].join("\n");
  for (const from of [settings.emailFrom, env.EMAIL_FROM_FALLBACK].filter(Boolean) as string[]) {
    try {
      await env.EMAIL!.send({ from, to: settings.adminEmail, replyTo: data.email, subject, html, text });
      return json({ ok: true, id });
    } catch (error) {
      console.error("partner e-mail failed", from, (error as Error)?.message);
    }
  }
  return json({ ok: false, error: "Nepavyko išsiųsti. Bandykite dar kartą po minutės." }, 500);
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext) {
    if (new URL(request.url).pathname === "/api/partner") return partner(request, env);
    return kit.fetch(request, env, ctx);
  },
};
