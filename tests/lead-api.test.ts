import { describe, it, expect, vi } from "vitest";
import { receiveLead } from "../worker/leads";
import { handleRequest, getPhoto, maintenance } from "../worker/index";
import { signedPhotoUrl } from "../worker/security";
import { fixture, form, request } from "./fixtures";
function mockServices(valid = true) {
  return vi.stubGlobal(
    "fetch",
    vi.fn(async (input: string | URL | Request) =>
      String(input).includes("siteverify")
        ? Response.json({
            success: valid,
            hostname: "drenazoirengimas.lt",
            action: "lead",
          })
        : Response.json({}),
    ),
  );
}
describe("lead capture with actual SQLite migration and mocked external services", () => {
  it("stores a lead and private photo and delivers correctly addressed admin/customer notifications", async () => {
    mockServices();
    const f = fixture();
    const response = await receiveLead(request(form({}, true)), f.env, f.ctx);
    expect(response.status).toBe(201);
    await Promise.all(f.tasks);
    const row = f.sqlite.prepare("SELECT * FROM drainage_leads").get()!;
    expect(row.admin_sent).toBe(1);
    expect(row.customer_sent).toBe(1);
    expect(f.objects.size).toBe(1);
    const calls = vi.mocked(f.env.EMAIL!.send).mock.calls;
    expect(calls).toHaveLength(2);
    const admin = calls[0][0] as EmailMessageBuilder;
    const customer = calls[1][0] as EmailMessageBuilder;
    expect(admin.to).toBe("admin@example.test");
    expect(admin.replyTo).toBe("klientas@example.test");
    expect(admin.text).toContain("/api/photo?");
    expect(admin.headers?.["X-Lead-Delivery-ID"]).toMatch(/-admin$/);
    expect(customer.to).toBe("klientas@example.test");
    expect(customer.replyTo).toBe("business@example.test");
    expect(customer.text).toContain("Gavome jūsų užklausą");
  });
  it("persists multiple optional photos and includes each in the admin notification", async () => {
    mockServices();
    const f = fixture();
    const data = form({}, true);
    data.append("photos", data.get("photos") as File);
    expect((await receiveLead(request(data), f.env, f.ctx)).status).toBe(201);
    await Promise.all(f.tasks);
    const row = f.sqlite.prepare("SELECT * FROM drainage_leads").get()!;
    expect(JSON.parse(String(row.photos))).toHaveLength(2);
    expect(f.objects.size).toBe(2);
    const mail = vi.mocked(f.env.EMAIL!.send).mock
      .calls[0][0] as EmailMessageBuilder;
    expect(mail.text?.match(/https:\/\/[^\s]+\/api\/photo\?/g)).toHaveLength(2);
  });
  it("rejects invalid contact data on server", async () => {
    mockServices();
    const f = fixture();
    const r = await receiveLead(request(form({ phone: "abc" })), f.env, f.ctx);
    expect(r.status).toBe(422);
    expect(
      f.sqlite.prepare("SELECT count(*) AS n FROM drainage_leads").get()!.n,
    ).toBe(0);
  });
  it("rejects missing privacy acknowledgment", async () => {
    const f = fixture();
    expect(
      (await receiveLead(request(form({ consent: "" })), f.env, f.ctx)).status,
    ).toBe(422);
  });
  it("rejects a honeypot submission", async () => {
    const f = fixture();
    expect(
      (await receiveLead(request(form({ website: "spam.test" })), f.env, f.ctx))
        .status,
    ).toBe(422);
  });
  it("requires same allowed Origin", async () => {
    const f = fixture();
    expect(
      (
        await receiveLead(
          request(form(), { headers: { Origin: "https://evil.test" } }),
          f.env,
          f.ctx,
        )
      ).status,
    ).toBe(403);
  });
  it("fails closed when integrations are missing", async () => {
    const f = fixture();
    delete f.env.EMAIL;
    expect((await receiveLead(request(form()), f.env, f.ctx)).status).toBe(503);
  });
  it("requires an explicit POST", async () => {
    const f = fixture();
    expect(
      (
        await receiveLead(
          new Request("https://drenazoirengimas.lt/api/leads"),
          f.env,
          f.ctx,
        )
      ).status,
    ).toBe(405);
  });
  it("rejects invalid Turnstile result without storing anything", async () => {
    mockServices(false);
    const f = fixture();
    expect((await receiveLead(request(form()), f.env, f.ctx)).status).toBe(403);
    expect(f.objects.size).toBe(0);
  });
  it("checks Turnstile hostname and action, not just success", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        Response.json({
          success: true,
          hostname: "evil.test",
          action: "other",
        }),
      ),
    );
    const f = fixture();
    expect((await receiveLead(request(form()), f.env, f.ctx)).status).toBe(403);
  });
  it("recognizes an identical retry without duplicate records, images or emails", async () => {
    mockServices();
    const f = fixture();
    expect(
      (await receiveLead(request(form({}, true)), f.env, f.ctx)).status,
    ).toBe(201);
    await Promise.all(f.tasks);
    expect(
      (await receiveLead(request(form({}, true)), f.env, f.ctx)).status,
    ).toBe(200);
    expect(
      f.sqlite.prepare("SELECT count(*) AS n FROM drainage_leads").get()!.n,
    ).toBe(1);
    expect(f.objects.size).toBe(1);
    expect(
      vi
        .mocked(fetch)
        .mock.calls.filter(([url]) => String(url).includes("siteverify")),
    ).toHaveLength(1);
  });
  it("rejects reuse of idempotency key with changed content", async () => {
    mockServices();
    const f = fixture();
    await receiveLead(request(form()), f.env, f.ctx);
    await Promise.all(f.tasks);
    expect(
      (await receiveLead(request(form({ location: "Kaunas" })), f.env, f.ctx))
        .status,
    ).toBe(409);
  });
  it("keeps durable lead and schedules retry when email provider fails", async () => {
    mockServices();
    const f = fixture();
    vi.mocked(f.env.EMAIL!.send).mockRejectedValueOnce(
      new Error("delivery_failed"),
    );
    expect((await receiveLead(request(form()), f.env, f.ctx)).status).toBe(201);
    await Promise.all(f.tasks);
    let row = f.sqlite.prepare("SELECT * FROM drainage_leads").get()!;
    expect(row.admin_sent).toBe(0);
    expect(row.attempts).toBe(1);
    mockServices();
    f.sqlite.exec("UPDATE drainage_leads SET next_attempt=0");
    await maintenance(f.env);
    row = f.sqlite.prepare("SELECT * FROM drainage_leads").get()!;
    expect(row.admin_sent).toBe(1);
    expect(row.customer_sent).toBe(1);
  });
  it("handles optional email without sending customer notification", async () => {
    mockServices();
    const f = fixture();
    await receiveLead(request(form({ email: "" })), f.env, f.ctx);
    await Promise.all(f.tasks);
    const calls = vi.mocked(f.env.EMAIL!.send).mock.calls;
    expect(calls).toHaveLength(1);
    expect((calls[0][0] as EmailMessageBuilder).replyTo).toBe(
      "business@example.test",
    );
  });
  it("sends only to the owner when customer confirmations are disabled", async () => {
    mockServices();
    const f = fixture();
    f.env.CUSTOMER_CONFIRMATION = "false";
    await receiveLead(request(form()), f.env, f.ctx);
    await Promise.all(f.tasks);
    const calls = vi.mocked(f.env.EMAIL!.send).mock.calls;
    expect(calls).toHaveLength(1);
    expect((calls[0][0] as EmailMessageBuilder).to).toBe("admin@example.test");
    expect(
      f.sqlite.prepare("SELECT customer_sent FROM drainage_leads").get()!
        .customer_sent,
    ).toBe(1);
  });
  it("checks real file signature and declared MIME", async () => {
    const f = fixture();
    const data = form();
    data.append(
      "photos",
      new File(["<script>evil</script>"], "fake.jpg", { type: "image/jpeg" }),
    );
    expect((await receiveLead(request(data), f.env, f.ctx)).status).toBe(422);
  });
  it("rejects six photos", async () => {
    const f = fixture();
    const data = form({}, true);
    const photo = data.get("photos") as File;
    for (let i = 0; i < 5; i++) data.append("photos", photo);
    expect((await receiveLead(request(data), f.env, f.ctx)).status).toBe(422);
  });
  it("rejects oversized body before parsing", async () => {
    const f = fixture();
    const r = request(form());
    r.headers.set("Content-Length", String(20 * 1024 * 1024));
    expect((await receiveLead(r, f.env, f.ctx)).status).toBe(413);
  });
  it("rate limits server-verified submissions", async () => {
    mockServices(false);
    const f = fixture();
    for (let i = 0; i < 10; i++)
      await receiveLead(
        request(form({ requestId: crypto.randomUUID() })),
        f.env,
        f.ctx,
      );
    const r = await receiveLead(
      request(form({ requestId: crypto.randomUUID() })),
      f.env,
      f.ctx,
    );
    expect(r.status).toBe(429);
    expect(r.headers.get("Retry-After")).toBe("3600");
  });
  it("only serves signed, unexpired private photo URLs", async () => {
    mockServices();
    const f = fixture();
    await receiveLead(request(form({}, true)), f.env, f.ctx);
    await Promise.all(f.tasks);
    const key = [...f.objects.keys()][0];
    const url = await signedPhotoUrl(key, f.env, Date.now() + 3600000);
    const response = await getPhoto(new Request(url), f.env);
    expect(response.status).toBe(200);
    expect(response.headers.get("Cache-Control")).toBe("private, no-store");
    expect(
      (await getPhoto(new Request(url.replace(/sig=./, "sig=x")), f.env))
        .status,
    ).toBe(403);
    const expired = await signedPhotoUrl(key, f.env, Date.now() - 1);
    expect((await getPhoto(new Request(expired), f.env)).status).toBe(403);
  });
  it("removes leads and photos after retention period", async () => {
    mockServices();
    const f = fixture();
    await receiveLead(request(form({}, true)), f.env, f.ctx);
    await Promise.all(f.tasks);
    f.sqlite
      .prepare("UPDATE drainage_leads SET created_at=?")
      .run(Date.now() - 91 * 864e5);
    await maintenance(f.env);
    expect(f.objects.size).toBe(0);
    expect(
      f.sqlite.prepare("SELECT count(*) AS n FROM drainage_leads").get()!.n,
    ).toBe(0);
  });
  it("redirects www and html aliases and returns 404 for unknown API paths", async () => {
    const f = fixture();
    for (const [url, target] of [
      [
        "https://www.drenazoirengimas.lt/a/?x=1",
        "https://drenazoirengimas.lt/a/?x=1",
      ],
      [
        "https://drenazoirengimas.lt/pamatu-drenazas.html",
        "https://drenazoirengimas.lt/pamatu-drenazas/",
      ],
      [
        "https://drenazoirengimas.lt/index.html",
        "https://drenazoirengimas.lt/",
      ],
    ]) {
      const response = await handleRequest(new Request(url), f.env, f.ctx);
      expect(response.status).toBe(301);
      expect(response.headers.get("location")).toBe(target);
    }
    expect(
      (
        await handleRequest(
          new Request("https://drenazoirengimas.lt/api/unknown"),
          f.env,
          f.ctx,
        )
      ).status,
    ).toBe(404);
  });
});
