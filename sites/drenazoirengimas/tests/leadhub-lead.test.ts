import { describe, it, expect, vi } from "vitest";
import { leadhubLead } from "@leadsites/kit/worker/leadhub";

const row = { data: "2026-11-23T10:00:00.000Z", puslapis: "drenazoirengimas.lt", vardas: "Jonas", telefonas: "+37060000000" };

function binding(res: Response | Error) {
  const fetch = vi.fn(async (req: Request) => {
    void req;
    if (res instanceof Error) throw res;
    return res;
  });
  return { env: { LEADHUB: { fetch }, LEADHUB_SITE_KEY: "drenazoirengimas", LEADHUB_SECRET: "s3cret" }, fetch };
}

describe("leadhubLead: the enquiry goes to the owner's LeadHub register", () => {
  it("posts the sheet row with the site credentials and the request id", async () => {
    const { env, fetch } = binding(Response.json({ id: "x" }, { status: 201 }));
    expect(await leadhubLead(env, row, { requestId: "req-1", hasPhotos: true })).toBe(true);
    const req = fetch.mock.calls[0]![0];
    expect(req.url).toBe("https://leadhub/api/site/lead");
    expect(req.method).toBe("POST");
    expect(req.headers.get("x-site-key")).toBe("drenazoirengimas");
    expect(req.headers.get("x-site-secret")).toBe("s3cret");
    expect(await req.json()).toEqual({ request_id: "req-1", has_photos: true, row });
  });

  it("does nothing when the site is not connected to LeadHub", async () => {
    expect(await leadhubLead({}, row)).toBe(false);
    expect(await leadhubLead({ LEADHUB_SITE_KEY: "x", LEADHUB_SECRET: "y" }, row)).toBe(false);
  });

  it("never throws: a refusal or an outage is reported as false", async () => {
    const err = vi.spyOn(console, "error").mockImplementation(() => undefined);
    expect(await leadhubLead(binding(new Response("no", { status: 404 })).env, row)).toBe(false);
    expect(await leadhubLead(binding(new Error("down")).env, row)).toBe(false);
    expect(err).toHaveBeenCalledTimes(2);
  });
});
