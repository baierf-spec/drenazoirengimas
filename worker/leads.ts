import { LIMITS, imageType, validateLead } from "../src/lib/validation";
import type { Env, LeadRecord, StoredLead } from "./types";
import {
  configured,
  digest,
  sign,
  limitedBody,
  validateTurnstile,
} from "./security";
import { deliverLead } from "./email";
export const json = (
  body: unknown,
  status = 200,
  headers: Record<string, string> = {},
) =>
  Response.json(body, {
    status,
    headers: {
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
      ...headers,
    },
  });
export async function receiveLead(
  request: Request,
  env: Env,
  ctx: Pick<ExecutionContext, "waitUntil">,
): Promise<Response> {
  if (request.method !== "POST")
    return json({ error: "Leidžiamas tik POST metodas." }, 405, {
      Allow: "POST",
    });
  const origin = request.headers.get("Origin");
  const allowed = (env.ALLOWED_ORIGINS || env.SITE_ORIGIN || "")
    .split(",")
    .map((v) => v.trim());
  if (!origin || !allowed.includes(origin))
    return json({ error: "Užklausa iš šio puslapio neleidžiama." }, 403);
  if (!configured(env))
    return json(
      {
        error:
          "Užklausų priėmimas šiuo metu neaktyvus. Duomenys nebuvo išsaugoti.",
      },
      503,
    );
  if (!request.headers.get("Content-Type")?.startsWith("multipart/form-data"))
    return json({ error: "Netinkamas užklausos formatas." }, 415);
  let form: FormData;
  try {
    const body = await limitedBody(request, LIMITS.request);
    form = await new Request(request.url, {
      method: "POST",
      headers: { "Content-Type": request.headers.get("Content-Type")! },
      body,
    }).formData();
  } catch (e) {
    return json(
      {
        error:
          e instanceof Error && e.message === "too_large"
            ? "Nuotraukos viršija leistiną užklausos dydį."
            : "Nepavyko perskaityti pateiktos formos.",
      },
      e instanceof Error && e.message === "too_large" ? 413 : 400,
    );
  }
  const result = validateLead(form);
  if (!result.success)
    return json(
      {
        error: "Patikrinkite formos laukus ir privatumo sutikimą.",
        fields: result.error.flatten().fieldErrors,
      },
      422,
    );
  const lead = result.data;
  const token = form.get("turnstileToken");
  if (typeof token !== "string" || !token || token.length > 2048)
    return json({ error: "Patvirtinkite apsaugos patikrą." }, 400);
  const photos = form.getAll("photos");
  if (
    photos.length > LIMITS.photos ||
    photos.some((f) => typeof f === "string")
  )
    return json({ error: "Galima pridėti iki 5 nuotraukų." }, 422);
  const files = photos as File[];
  let total = 0;
  const checked: { file: File; bytes: ArrayBuffer; mime: string }[] = [];
  for (const file of files) {
    total += file.size;
    if (file.size === 0 || file.size > LIMITS.file || total > LIMITS.total)
      return json(
        {
          error:
            "Kiekviena paruošta nuotrauka turi būti iki 2 MB, visos kartu – iki 10 MB.",
        },
        413,
      );
    const bytes = await file.arrayBuffer();
    const mime = imageType(new Uint8Array(bytes));
    if (!mime || file.type !== mime)
      return json(
        { error: "Tinka tik tikros JPG, PNG arba WebP nuotraukos." },
        422,
      );
    checked.push({ file, bytes, mime });
  }
  const fp = await digest(
    JSON.stringify(lead) +
      (await Promise.all(
        checked.map(async (item) =>
          digest(
            [
              ...new Uint8Array(
                await crypto.subtle.digest("SHA-256", item.bytes),
              ),
            ].join(","),
          ),
        ),
      )),
  );
  try {
    // A committed identical retry can succeed without reusing an already consumed Turnstile token.
    const previous = await env.DB.prepare(
      "SELECT * FROM drainage_leads WHERE id=?",
    )
      .bind(lead.requestId)
      .first<LeadRecord>();
    if (previous) {
      if (previous.fingerprint !== fp)
        return json(
          {
            error:
              "Ankstesnio siuntimo turinys pasikeitė. Įkelkite formą iš naujo.",
          },
          409,
        );
      return json({ id: previous.id, status: "received" }, 200);
    }
    const now = Date.now();
    const day = Math.floor(now / 864e5);
    const ip = request.headers.get("CF-Connecting-IP") || "unknown";
    const rateKey = await sign(`${ip}:${day}`, env.IP_HASH_SECRET!);
    const rate = await env.DB.prepare(
      "INSERT INTO drainage_rate_limits (key,count,expires_at) VALUES (?,1,?) ON CONFLICT(key) DO UPDATE SET count=count+1 RETURNING count",
    )
      .bind(rateKey, now + 864e5)
      .first<{ count: number }>();
    if (!rate || rate.count > 10)
      return json({ error: "Per daug bandymų. Pabandykite vėliau." }, 429, {
        "Retry-After": "3600",
      });
    if (!(await validateTurnstile(token, request, env, lead.requestId)))
      return json(
        { error: "Apsaugos patikra nepavyko. Patvirtinkite ją dar kartą." },
        403,
      );
    const keys: string[] = [];
    try {
      for (const item of checked) {
        const key = `leads/${lead.requestId}/${crypto.randomUUID()}.${item.mime === "image/jpeg" ? "jpg" : item.mime === "image/png" ? "png" : "webp"}`;
        await env.PHOTOS.put(key, item.bytes, {
          httpMetadata: { contentType: item.mime },
          customMetadata: { createdAt: String(now) },
        });
        keys.push(key);
      }
      const stored: StoredLead = { ...lead, consentVersion: "2026-10-19-v1" };
      const inserted = await env.DB.prepare(
        "INSERT INTO drainage_leads (id,created_at,payload,photos,fingerprint) VALUES (?,?,?,?,?) ON CONFLICT(id) DO NOTHING",
      )
        .bind(
          lead.requestId,
          now,
          JSON.stringify(stored),
          JSON.stringify(keys),
          fp,
        )
        .run();
      if (!inserted.meta.changes) {
        await Promise.all(keys.map((k) => env.PHOTOS.delete(k)));
        const concurrent = await env.DB.prepare(
          "SELECT * FROM drainage_leads WHERE id=?",
        )
          .bind(lead.requestId)
          .first<LeadRecord>();
        if (concurrent?.fingerprint === fp)
          return json({ id: concurrent.id, status: "received" }, 200);
        return json(
          {
            error:
              "Šis siuntimo numeris jau panaudotas. Įkelkite formą iš naujo.",
          },
          409,
        );
      }
      const record: LeadRecord = {
        id: lead.requestId,
        created_at: now,
        payload: JSON.stringify(stored),
        photos: JSON.stringify(keys),
        fingerprint: fp,
        admin_sent: 0,
        customer_sent: 0,
        attempts: 0,
        next_attempt: 0,
        lease_until: 0,
      };
      ctx.waitUntil(deliverLead(record, env));
      return json({ id: lead.requestId, status: "received" }, 201);
    } catch {
      await Promise.allSettled(keys.map((k) => env.PHOTOS.delete(k)));
      throw new Error("storage_failed");
    }
  } catch {
    return json(
      {
        error:
          "Užklausos išsaugoti nepavyko. Duomenys liko formoje – bandykite dar kartą.",
      },
      503,
    );
  }
}
