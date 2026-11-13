import { afterEach, describe, expect, it, vi } from "vitest";
import worker from "../worker/index";
import { imageType } from "../worker/site";

const ORIGIN = "https://sklypolyginimas.lt";
const JPEG = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0, 0, 0, 0, 0, 0, 0, 0]);
const HEIC = new Uint8Array([0, 0, 0, 24, ...[..."ftypheic"].map((c) => c.charCodeAt(0))]);

function env() {
  const send = vi.fn().mockResolvedValue(undefined);
  return {
    send,
    env: {
      ASSETS: { fetch: async () => new Response("") },
      EMAIL: { send },
      EMAIL_FROM: "uzklausa@sklypolyginimas.lt",
      EMAIL_FROM_FALLBACK: "uzklausa@drenazoirengimas.lt",
      ADMIN_EMAIL: "owner@example.com",
      TURNSTILE_SECRET_KEY: "secret",
    },
  };
}
// Turnstile answers "ok, action lead, our hostname".
function turnstileOk() {
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue(Response.json({ success: true, hostname: "sklypolyginimas.lt", action: "lead" })));
}
function lead(extra: Record<string, string | Blob> = {}) {
  const f = new FormData();
  const base: Record<string, string> = { savivaldybe: "Vilniaus r.", arai: "12", bukle: "Po statybų", pastabos: "Liko grunto krūvos", vardas: "Ona", tel: "+37060000000", email: "ona@example.com", sutikimas: "taip", website: "", saltinis: "hero", puslapis: "/", "cf-turnstile-response": "token", requestId: crypto.randomUUID() };
  for (const [k, v] of Object.entries({ ...base, ...extra })) f.append(k, v);
  return f;
}
const post = (path: string, body: FormData, e: object, origin = ORIGIN) =>
  worker.fetch(new Request(ORIGIN + path, { method: "POST", headers: { Origin: origin }, body }), e as never, { waitUntil() {}, passThroughOnException() {} } as never);

afterEach(() => vi.unstubAllGlobals());

describe("užklausa (/api/leads)", () => {
  it("siunčia savininkui su sklypo duomenimis ir nuotraukomis", async () => {
    turnstileOk();
    const { env: e, send } = env();
    const res = await post("/api/leads", lead({ foto: new File([JPEG], "a.jpg", { type: "image/jpeg" }) }), e);
    expect([res.status, await res.clone().text()]).toEqual([201, expect.any(String)]);
    const mail = send.mock.calls[0][0];
    expect(mail).toMatchObject({ from: "uzklausa@sklypolyginimas.lt", to: "owner@example.com", replyTo: "ona@example.com" });
    expect(mail.subject).toBe("Užklausa: Vilniaus r., 12 a · Po statybų – Ona");
    expect(mail.attachments).toHaveLength(1);
    expect(mail.attachments[0].filename).toBe("sklypas-1.jpg");
    expect(mail.text).toContain("Telefonas: +37060000000");
  });
  it("kai pagrindinis siuntėjas atmetamas, naudoja atsarginį", async () => {
    turnstileOk();
    const { env: e, send } = env();
    send.mockRejectedValueOnce(new Error("sender not verified"));
    expect((await post("/api/leads", lead(), e)).status).toBe(201);
    expect(send.mock.calls.map((c) => c[0].from)).toEqual(["uzklausa@sklypolyginimas.lt", "uzklausa@drenazoirengimas.lt"]);
  });
  it("be ploto, telefono ar sutikimo – aiški klaida, nieko nesiunčia", async () => {
    turnstileOk();
    const { env: e, send } = env();
    for (const [field, value] of [["arai", ""], ["tel", "123"], ["sutikimas", ""]]) {
      const res = await post("/api/leads", lead({ [field]: value }), e);
      expect(res.status).toBe(422);
      expect(Object.keys((await res.json()).fields)).toEqual([field]);
    }
    expect(send).not.toHaveBeenCalled();
  });
  it("botas, svetima svetainė ir nepatvirtinta apsauga nieko neišsiunčia", async () => {
    const { env: e, send } = env();
    turnstileOk();
    expect((await post("/api/leads", lead({ website: "x" }), e)).status).toBe(201);
    expect((await post("/api/leads", lead(), e, "https://evil.example")).status).toBe(403);
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(Response.json({ success: false })));
    expect((await post("/api/leads", lead(), e)).status).toBe(403);
    expect(send).not.toHaveBeenCalled();
  });
  it("atpažįsta telefono HEIC nuotraukas", () => {
    expect(imageType(HEIC)).toBe("image/heic");
    expect(imageType(JPEG)).toBe("image/jpeg");
    expect(imageType(new Uint8Array(12))).toBeNull();
  });
});

describe("rangovo registracija (/api/partner)", () => {
  const partner = (extra: Record<string, string> = {}) => {
    const f = new FormData();
    for (const [k, v] of Object.entries({ imone: "UAB Testas", regionas: "Vilnius", vardas: "Jonas", tel: "+37060000001", email: "info@testas.lt", "cf-turnstile-response": "t", ...extra })) f.append(k, v);
    return f;
  };
  it("visada siunčia savininkui", async () => {
    turnstileOk();
    const { env: e, send } = env();
    const res = await post("/api/partner", partner(), e);
    expect(await res.json()).toMatchObject({ ok: true });
    expect(send.mock.calls[0][0]).toMatchObject({ to: "owner@example.com", replyTo: "info@testas.lt", subject: "Naujas partneris: UAB Testas, Vilnius" });
  });
  it("tikrina el. paštą ir šaltinį", async () => {
    turnstileOk();
    const { env: e, send } = env();
    expect((await post("/api/partner", partner({ email: "blogas" }), e)).status).toBe(400);
    expect((await post("/api/partner", partner(), e, "https://evil.example")).status).toBe(403);
    expect(send).not.toHaveBeenCalled();
  });
});
