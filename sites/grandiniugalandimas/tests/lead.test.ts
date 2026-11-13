import { describe, expect, it, vi } from "vitest";
import { leadSchema } from "@/lib/lead/schema";
import { renderLeadEmail } from "../worker/email";
import { handleRequest } from "../worker/index";

const base = { name: "Jonas", phone: "+370 600 00000", email: "jonas@example.com", city: "Vilnius", chainInfo: "Nežinau", message: "Testinė užklausa", quantity: 4 };
const ORIGIN = "https://grandiniugalandimas.lt";

describe("užklausos validacija", () => {
  it("visi matomi laukai privalomi", () => {
    for (const field of ["name", "phone", "email", "city", "chainInfo", "message"]) {
      expect(leadSchema.safeParse({ ...base, [field]: "" }).success).toBe(false);
    }
    expect(leadSchema.safeParse({ ...base, email: "neteisingas" }).success).toBe(false);
  });
  it("priima tinkamą užklausą", () => {
    expect(leadSchema.safeParse(base).success).toBe(true);
  });
});

describe("laiško suvestinė", () => {
  it("nepasitiki kliento pateikta suma ir išskiria tik grąžinimą", () => {
    const email = renderLeadEmail(leadSchema.parse({ ...base, estimatedTotal: 0.01 }));
    expect(email.text).toContain("Klientui pateikta orientacinė suma: 16,00 €");
    expect(email.text).toContain("Grąžinimas klientui: 0,00 €");
    expect(email.text).toContain("apmoka vežėjui atskirai");
    expect(email.text).not.toContain("0.01");
  });
});

// The order form posts to the shared kit endpoint; these run the real Worker handler.
function form(extra: Record<string, string> = {}) {
  const f = new FormData();
  for (const [k, v] of Object.entries({ ...base, quantity: "4", estimatedTotal: "16", pageUrl: ORIGIN + "/", website: "", requestId: crypto.randomUUID(), ...extra }))
    f.append(k, String(v));
  return f;
}
function env() {
  const send = vi.fn().mockResolvedValue(undefined);
  return {
    send,
    env: {
      ASSETS: { fetch: async () => new Response("") },
      EMAIL: { send },
      LEAD_FROM_EMAIL: "uzklausos@grandiniugalandimas.lt",
      LEAD_RECIPIENT_EMAIL: "owner@example.com",
    },
  };
}
const post = (body: FormData, e: object, origin = ORIGIN) =>
  handleRequest(new Request(ORIGIN + "/api/leads", { method: "POST", headers: { Origin: origin }, body }), e as never, { waitUntil() {} });

describe("užklausos siuntimas (/api/leads)", () => {
  it("išsiunčia laišką savininkui su atsakymu klientui", async () => {
    const { env: e, send } = env();
    const res = await post(form(), e);
    expect(res.status).toBe(201);
    expect(await res.json()).toMatchObject({ status: "sent" });
    expect(send).toHaveBeenCalledTimes(1);
    const mail = send.mock.calls[0][0];
    expect(mail).toMatchObject({ from: "uzklausos@grandiniugalandimas.lt", to: "owner@example.com", replyTo: "jonas@example.com" });
    expect(mail.subject).toContain("Kliento užklausa: Jonas – 4 vnt. (Vilnius)");
    expect(mail.text).toContain("Kliento telefonas: +370 600 00000");
  });
  it("botui (užpildytas paslėptas laukas) atsako normaliai, bet nieko nesiunčia", async () => {
    const { env: e, send } = env();
    const res = await post(form({ website: "spam.example" }), e);
    expect(res.status).toBe(201);
    expect(send).not.toHaveBeenCalled();
  });
  it("atmeta užklausas iš kitų svetainių ir netinkamus laukus", async () => {
    const { env: e, send } = env();
    expect((await post(form(), e, "https://evil.example")).status).toBe(403);
    expect((await post(form({ email: "ne-el-pastas" }), e)).status).toBe(422);
    expect((await post(form({ requestId: "1" }), e)).status).toBe(422);
    expect(send).not.toHaveBeenCalled();
  });
  it("tas pats siuntimas du kartus išsiunčiamas vieną kartą", async () => {
    const { env: e, send } = env();
    const f = form();
    await post(f, e);
    await post(f, e);
    expect(send).toHaveBeenCalledTimes(1);
  });
});
