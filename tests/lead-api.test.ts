import { describe, it, expect, vi } from "vitest";
import { receiveLead } from "../worker/leads";
import { handleRequest } from "../worker/index";
import { fixture, form, request } from "./fixtures";
function services(valid = true) {
  vi.stubGlobal(
    "fetch",
    vi.fn(async () =>
      Response.json({
        success: valid,
        hostname: "drenazoirengimas.lt",
        action: "lead",
      }),
    ),
  );
}
describe("direct Cloudflare email intake without D1 or R2", () => {
  it("sends structured admin notification with real binary attachment and client Reply-To", async () => {
    services();
    const f = fixture();
    const response = await receiveLead(request(form({}, true)), f.env);
    expect(response.status).toBe(201);
    const calls = vi.mocked(f.env.EMAIL!.send).mock.calls;
    expect(calls).toHaveLength(1);
    const mail = calls[0][0] as EmailMessageBuilder;
    expect(mail.to).toBe("admin@example.test");
    expect(mail.replyTo).toBe("klientas@example.test");
    expect(mail.text).toContain("Vieta: Vilnius");
    expect(mail.text).not.toContain("/api/photo");
    expect(mail.attachments).toHaveLength(1);
    expect(mail.attachments![0]).toMatchObject({
      filename: "objekto-nuotrauka-1.jpg",
      type: "image/jpeg",
      disposition: "attachment",
    });
    expect(new Uint8Array(mail.attachments![0].content as ArrayBuffer)[0]).toBe(
      255,
    );
  });
  it("waits for email acceptance before claiming success", async () => {
    services();
    const f = fixture();
    let accept!: (r: EmailSendResult) => void;
    vi.mocked(f.env.EMAIL!.send).mockImplementation(
      () =>
        new Promise((resolve) => {
          accept = resolve;
        }),
    );
    let resolved = false;
    const sending = receiveLead(request(form()), f.env).then((r) => {
      resolved = true;
      return r;
    });
    await vi.waitFor(() => expect(accept).toBeTypeOf("function"));
    expect(resolved).toBe(false);
    accept({ messageId: "accepted" });
    expect((await sending).status).toBe(201);
  });
  it("returns retryable error on email failure and allows retry with renewed challenge", async () => {
    services();
    const f = fixture();
    const id = crypto.randomUUID();
    vi.mocked(f.env.EMAIL!.send).mockRejectedValueOnce(new Error("offline"));
    expect(
      (await receiveLead(request(form({ requestId: id })), f.env)).status,
    ).toBe(503);
    expect(
      (
        await receiveLead(
          request(form({ requestId: id, turnstileToken: "new-token" })),
          f.env,
        )
      ).status,
    ).toBe(201);
  });
  it("coalesces concurrent duplicate submits in the same isolate", async () => {
    services();
    const f = fixture(),
      id = crypto.randomUUID();
    const responses = await Promise.all([
      receiveLead(request(form({ requestId: id })), f.env),
      receiveLead(request(form({ requestId: id })), f.env),
    ]);
    expect(responses.every((r) => r.ok)).toBe(true);
    expect(f.env.EMAIL!.send).toHaveBeenCalledTimes(1);
    expect(
      (
        await receiveLead(
          request(form({ requestId: id, location: "Kaunas" })),
          f.env,
        )
      ).status,
    ).toBe(409);
  });
  it("fails closed without email binding", async () => {
    const f = fixture();
    delete f.env.EMAIL;
    expect((await receiveLead(request(form()), f.env)).status).toBe(503);
  });
  it("supports optional email with business Reply-To and no customer message", async () => {
    services();
    const f = fixture();
    await receiveLead(request(form({ email: "" })), f.env);
    expect(f.env.EMAIL!.send).toHaveBeenCalledTimes(1);
    expect(
      (vi.mocked(f.env.EMAIL!.send).mock.calls[0][0] as EmailMessageBuilder)
        .replyTo,
    ).toBe("business@example.test");
  });
  it.each([{ phone: "bad" }, { consent: "" }, { website: "spam" }])(
    "validates form on server: %o",
    async (fields) => {
      const f = fixture();
      expect((await receiveLead(request(form(fields)), f.env)).status).toBe(
        422,
      );
      expect(f.env.EMAIL!.send).not.toHaveBeenCalled();
    },
  );
  it("rejects cross-origin and non-POST requests", async () => {
    const f = fixture();
    expect(
      (
        await receiveLead(
          request(form(), { headers: { Origin: "https://evil.test" } }),
          f.env,
        )
      ).status,
    ).toBe(403);
    expect(
      (
        await receiveLead(
          new Request("https://drenazoirengimas.lt/api/leads"),
          f.env,
        )
      ).status,
    ).toBe(405);
  });
  it("rejects challenge failure without email", async () => {
    services(false);
    const f = fixture();
    expect((await receiveLead(request(form()), f.env)).status).toBe(403);
    expect(f.env.EMAIL!.send).not.toHaveBeenCalled();
  });
  it("checks challenge hostname and action", async () => {
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
    expect((await receiveLead(request(form()), f.env)).status).toBe(403);
  });
  it("rejects fake photos and too many photos", async () => {
    const f = fixture(),
      bad = form();
    bad.append(
      "photos",
      new File(["<script>bad</script>"], "fake.jpg", { type: "image/jpeg" }),
    );
    expect((await receiveLead(request(bad), f.env)).status).toBe(422);
    const many = form({}, true);
    for (let i = 0; i < 5; i++)
      many.append("photos", many.get("photos") as File);
    expect((await receiveLead(request(many), f.env)).status).toBe(422);
  });
  it("enforces combined attachment budget before delivery", async () => {
    const f = fixture(),
      data = form();
    for (let i = 0; i < 2; i++) {
      const bytes = new Uint8Array(1700000);
      bytes.set([255, 216, 255]);
      data.append("photos", new File([bytes], "x.jpg", { type: "image/jpeg" }));
    }
    expect((await receiveLead(request(data), f.env)).status).toBe(413);
  });
  it("limits body size", async () => {
    const f = fixture(),
      r = request(form());
    r.headers.set("Content-Length", "10000000");
    expect((await receiveLead(r, f.env)).status).toBe(413);
  });
  it("keeps removed manager and private photo endpoints inaccessible", async () => {
    const f = fixture();
    for (const path of [
      "/gallery-manager/",
      "/gallery-manager.html",
      "/api/gallery/projects",
      "/api/photo",
    ]) {
      const r = await handleRequest(
        new Request("https://drenazoirengimas.lt" + path),
        f.env,
        f.ctx,
      );
      expect(r.status).toBe(404);
    }
  });
  it("preserves canonical redirects", async () => {
    const f = fixture();
    const r = await handleRequest(
      new Request("https://www.drenazoirengimas.lt/a/?x=1"),
      f.env,
      f.ctx,
    );
    expect(r.status).toBe(301);
    expect(r.headers.get("location")).toBe(
      "https://drenazoirengimas.lt/a/?x=1",
    );
  });
});
