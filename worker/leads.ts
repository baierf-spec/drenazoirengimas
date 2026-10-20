import { runtimeSettings } from "../shared/site-config";
import { LIMITS, imageType, validateLead } from "../src/lib/validation";
import type { Env } from "./types";
import { configured, digest, limitedBody, validateTurnstile } from "./security";
import { sendLead } from "./email";
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
  _ctx?: Pick<ExecutionContext, "waitUntil">,
): Promise<Response> {
  void _ctx;
  if (request.method !== "POST")
    return json({ error: "Leidžiamas tik POST metodas." }, 405, {
      Allow: "POST",
    });
  const origin = request.headers.get("Origin");
  const allowed = runtimeSettings(
    env as unknown as Record<string, unknown>,
  ).allowedOrigins;
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
            "Kiekviena paruošta nuotrauka turi būti iki 2 MB, visos kartu – iki 3 MB.",
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
  const fingerprint = await digest(
    JSON.stringify(lead) +
      (
        await Promise.all(
          checked.map(async (item) => {
            const hash = new Uint8Array(
              await crypto.subtle.digest("SHA-256", item.bytes),
            );
            return Array.from(hash).join(",");
          }),
        )
      ).join("|"),
  );
  const now = Date.now();
  for (const [id, entry] of deliveries)
    if (entry.expires < now) deliveries.delete(id);
  const previous = deliveries.get(lead.requestId);
  if (previous) {
    if (previous.fingerprint !== fingerprint)
      return json(
        { error: "Siuntimo turinys pasikeitė. Atnaujinkite formą." },
        409,
      );
    return previous.result.then((ok) =>
      deliveryResponse(ok, lead.requestId, 200),
    );
  }
  if (deliveries.size >= 256)
    return json(
      { error: "Siuntimas laikinai užimtas. Pabandykite vėliau." },
      503,
    );
  // Best-effort per-isolate abuse protection; Turnstile is always verified server-side.
  const rateKey = await digest(
    (request.headers.get("CF-Connecting-IP") || "unknown") +
      Math.floor(now / 3600000),
  );
  for (const [key, rate] of rates) if (rate.expires < now) rates.delete(key);
  const rate = rates.get(rateKey) || { count: 0, expires: now + 3600000 };
  if (rate.count >= 10 || rates.size >= 2048)
    return json({ error: "Per daug bandymų. Pabandykite vėliau." }, 429, {
      "Retry-After": "3600",
    });
  rate.count++;
  rates.set(rateKey, rate);
  // Re-check after the asynchronous digest so simultaneous requests share one delivery.
  const concurrent = deliveries.get(lead.requestId);
  if (concurrent) {
    if (concurrent.fingerprint !== fingerprint)
      return json({ error: "Siuntimo turinys pasikeitė." }, 409);
    return concurrent.result.then((ok) =>
      deliveryResponse(ok, lead.requestId, 200),
    );
  }
  const operation = (async () => {
    if (!(await validateTurnstile(token, request, env, lead.requestId)))
      return "challenge" as const;
    await sendLead(lead, checked, env);
    return "sent" as const;
  })().catch(() => "failed" as const);
  deliveries.set(lead.requestId, {
    fingerprint,
    expires: now + 10 * 60000,
    result: operation,
  });
  const delivery = await operation;
  if (delivery !== "sent") deliveries.delete(lead.requestId);
  return deliveryResponse(delivery, lead.requestId, 201);
}
type DeliveryResult = "sent" | "challenge" | "failed";
const deliveries = new Map<
  string,
  { fingerprint: string; expires: number; result: Promise<DeliveryResult> }
>();
const rates = new Map<string, { count: number; expires: number }>();
function deliveryResponse(result: DeliveryResult, id: string, status: number) {
  if (result === "sent") return json({ id, status: "sent" }, status);
  if (result === "challenge")
    return json(
      { error: "Apsaugos patikra nepavyko. Patvirtinkite ją dar kartą." },
      403,
    );
  return json(
    {
      error:
        "Užklausos išsiųsti nepavyko. Duomenys liko formoje – bandykite dar kartą.",
    },
    503,
  );
}
