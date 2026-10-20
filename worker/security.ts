import type { Env } from "./types";
export const encoder = new TextEncoder();
export async function digest(value: string) {
  return [
    ...new Uint8Array(
      await crypto.subtle.digest("SHA-256", encoder.encode(value)),
    ),
  ]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
export async function sign(value: string, secret: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  return [
    ...new Uint8Array(
      await crypto.subtle.sign("HMAC", key, encoder.encode(value)),
    ),
  ]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
export async function signedPhotoUrl(key: string, env: Env, expires: number) {
  const url = new URL("/api/photo", env.SITE_ORIGIN);
  url.searchParams.set("key", key);
  url.searchParams.set("expires", String(expires));
  url.searchParams.set(
    "sig",
    await sign(`${key}:${expires}`, env.PHOTO_SIGNING_SECRET!),
  );
  return url.href;
}
export function configured(env: Env) {
  return (
    env.LEADS_ENABLED === "true" &&
    Boolean(
      env.DB &&
      env.PHOTOS &&
      env.TURNSTILE_SECRET_KEY &&
      env.EMAIL &&
      env.EMAIL_FROM &&
      env.ADMIN_EMAIL &&
      env.BUSINESS_REPLY_TO &&
      env.IP_HASH_SECRET &&
      env.IP_HASH_SECRET.length >= 32 &&
      env.PHOTO_SIGNING_SECRET &&
      env.PHOTO_SIGNING_SECRET.length >= 32 &&
      env.SITE_ORIGIN,
    )
  );
}
export async function validateTurnstile(
  token: string,
  request: Request,
  env: Env,
  requestId: string,
): Promise<boolean> {
  const response = await fetch(
    "https://challenges.cloudflare.com/turnstile/v0/siteverify",
    {
      method: "POST",
      body: JSON.stringify({
        secret: env.TURNSTILE_SECRET_KEY,
        response: token,
        remoteip: request.headers.get("CF-Connecting-IP") || undefined,
        idempotency_key: requestId,
      }),
      headers: { "Content-Type": "application/json" },
      signal: AbortSignal.timeout(10000),
    },
  );
  if (!response.ok) return false;
  const result = (await response.json()) as {
    success: boolean;
    hostname: string;
    action: string;
  };
  const hosts = (env.ALLOWED_ORIGINS || env.SITE_ORIGIN || "")
    .split(",")
    .map((v) => {
      try {
        return new URL(v.trim()).hostname;
      } catch {
        return "";
      }
    });
  return (
    result.success === true &&
    hosts.includes(result.hostname) &&
    result.action === "lead"
  );
}
export async function limitedBody(
  request: Request,
  maximum: number,
): Promise<ArrayBuffer> {
  if (Number(request.headers.get("content-length") || 0) > maximum)
    throw new Error("too_large");
  if (!request.body) throw new Error("empty");
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > maximum) {
      await reader.cancel();
      throw new Error("too_large");
    }
    chunks.push(value);
  }
  const body = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    body.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return body.buffer;
}
export function constantEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let value = 0;
  for (let i = 0; i < a.length; i++) value |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return value === 0;
}
