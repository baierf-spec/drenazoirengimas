import { vi } from "vitest";
import type { Env } from "../worker/types";
export function fixture() {
  const env: Env = {
    ASSETS: { fetch: async () => new Response("asset") } as unknown as Fetcher,
    SITE_ORIGIN: "https://drenazoirengimas.lt",
    ALLOWED_ORIGINS: "https://drenazoirengimas.lt",
    LEADS_ENABLED: "true",
    TURNSTILE_SECRET_KEY: "server-test-secret",
    EMAIL_FROM: "forms@example.test",
    ADMIN_EMAIL: "admin@example.test",
    BUSINESS_REPLY_TO: "business@example.test",
    EMAIL: {
      send: vi.fn(async () => ({ messageId: "test-email" })),
    } as unknown as SendEmail,
  };
  return { env, ctx: { waitUntil() {} }, tasks: [] };
}
export function form(overrides: Record<string, string> = {}, photo = false) {
  const data = new FormData();
  for (const [key, value] of Object.entries({
    requestId: crypto.randomUUID(),
    name: "Tomas",
    phone: "+37061234567",
    email: "klientas@example.test",
    location: "Vilnius",
    property: "house",
    problem: "foundations",
    timing: "month",
    message: "Vanduo po lietaus",
    consent: "yes",
    website: "",
    source: "/gauti-pasiulyma/",
    diagnostic: "",
    estimate: "",
    turnstileToken: "valid-token",
    ...overrides,
  }))
    data.set(key, value);
  if (photo)
    data.append(
      "photos",
      new File(
        [
          new Uint8Array([
            255, 216, 255, 224, 0, 16, 74, 70, 73, 70, 0, 1, 1, 0, 0, 1,
          ]),
        ],
        "test.jpg",
        { type: "image/jpeg" },
      ),
    );
  return data;
}
export function request(data: FormData, options: RequestInit = {}) {
  return new Request("https://drenazoirengimas.lt/api/leads", {
    method: "POST",
    headers: {
      Origin: "https://drenazoirengimas.lt",
      "CF-Connecting-IP": crypto.randomUUID(),
    },
    body: data,
    ...options,
  });
}
