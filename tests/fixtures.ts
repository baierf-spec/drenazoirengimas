import { vi } from "vitest";
import { DatabaseSync } from "node:sqlite";
import { readFileSync } from "node:fs";
import type { Env } from "../worker/types";
export function database() {
  const sqlite = new DatabaseSync(":memory:");
  sqlite.exec(readFileSync("migrations/0001_lead_capture.sql", "utf8"));
  const db = {
    async batch(statements: { run: () => Promise<unknown> }[]) {
      sqlite.exec("BEGIN");
      try {
        const results = [];
        for (const s of statements) results.push(await s.run());
        sqlite.exec("COMMIT");
        return results;
      } catch (e) {
        sqlite.exec("ROLLBACK");
        throw e;
      }
    },
    prepare(sql: string) {
      let values: unknown[] = [];
      const statement = sqlite.prepare(sql);
      const api = {
        bind(...args: unknown[]) {
          values = args;
          return api;
        },
        async first() {
          return statement.get(...(values as never[])) || null;
        },
        async all() {
          return { results: statement.all(...(values as never[])) };
        },
        async run() {
          const r = statement.run(...(values as never[]));
          return { success: true, meta: { changes: Number(r.changes) } };
        },
      };
      return api;
    },
  };
  return { sqlite, db: db as unknown as D1Database };
}
export function fixture() {
  const { sqlite, db } = database();
  const objects = new Map<string, { body: ArrayBuffer; mime: string }>();
  const bucket = {
    async put(
      key: string,
      body: ArrayBuffer,
      options: { httpMetadata: { contentType: string } },
    ) {
      objects.set(key, { body, mime: options.httpMetadata.contentType });
      return {};
    },
    async delete(key: string) {
      objects.delete(key);
    },
    async get(key: string) {
      const item = objects.get(key);
      return item
        ? {
            body: new Blob([item.body]).stream(),
            httpMetadata: { contentType: item.mime },
          }
        : null;
    },
  };
  const env: Env = {
    DB: db,
    PHOTOS: bucket as unknown as R2Bucket,
    ASSETS: { fetch: async () => new Response("asset") } as unknown as Fetcher,
    SITE_ORIGIN: "https://drenazoirengimas.lt",
    ALLOWED_ORIGINS: "https://drenazoirengimas.lt",
    LEADS_ENABLED: "true",
    TURNSTILE_SECRET_KEY: "server-test-secret",
    EMAIL: {
      send: vi.fn(async () => ({ messageId: "test-email" })),
    } as unknown as SendEmail,
    EMAIL_FROM: "forms@example.test",
    ADMIN_EMAIL: "admin@example.test",
    BUSINESS_REPLY_TO: "business@example.test",
    IP_HASH_SECRET: "a".repeat(40),
    PHOTO_SIGNING_SECRET: "b".repeat(40),
    CUSTOMER_CONFIRMATION: "true",
  };
  const tasks: Promise<unknown>[] = [];
  const ctx = {
    waitUntil(p: Promise<unknown>) {
      tasks.push(p);
    },
  };
  return { sqlite, env, objects, ctx, tasks };
}
export function form(overrides: Record<string, string> = {}, photo = false) {
  const data = new FormData();
  for (const [key, value] of Object.entries({
    requestId: "1f51a2e2-f6af-49be-a2de-5ca989471d7c",
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
      "CF-Connecting-IP": "198.51.100.2",
    },
    body: data,
    ...options,
  });
}
