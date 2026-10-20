import { expect, it } from "vitest";
import {
  configSchema,
  siteConfig,
  publicSettings,
  runtimeSettings,
  productionErrors,
} from "../shared/site-config";
import { configured } from "../worker/security";
import { fixture } from "./fixtures";
it("keeps business switches in GitHub and ignores obsolete dashboard overrides", () => {
  const c = structuredClone(siteConfig);
  c.features.leadsEnabled = true;
  c.features.indexingEnabled = true;
  c.contact.showPhone = false;
  const runtime = runtimeSettings(
    {
      LEADS_ENABLED: "false",
      SEO_INDEXABLE: "false",
      SITE_ORIGIN: "https://wrong.example",
    },
    c,
  );
  expect(runtime.leadsEnabled).toBe(true);
  expect(runtime.indexingEnabled).toBe(true);
  expect(runtime.origin).toBe(c.site.origin);
  expect(publicSettings(c).phone).toBe("");
});
it("uses literal email settings without legacy email variables", () => {
  const c = structuredClone(siteConfig);
  c.email = {
    from: "forms@example.test",
    to: "new-owner@example.test",
    replyTo: "reply@example.test",
  };
  const r = runtimeSettings(
    { ADMIN_EMAIL: "old-owner@example.test", EMAIL_FROM: "old@example.test" },
    c,
  );
  expect(r).toMatchObject({
    emailFrom: "forms@example.test",
    adminEmail: "new-owner@example.test",
    replyTo: "reply@example.test",
  });
  const f = fixture();
  expect(configured(f.env, { ...r, leadsEnabled: true })).toBe(true);
  expect(configured(f.env, { ...r, leadsEnabled: false })).toBe(false);
});
it("resolves explicitly selected private references, with no silent fallback", () => {
  const c = structuredClone(siteConfig);
  c.email = {
    from: "env:EMAIL_FROM",
    to: "env:ADMIN_EMAIL",
    replyTo: "env:BUSINESS_REPLY_TO",
  };
  expect(runtimeSettings({}, c).adminEmail).toBe("");
  expect(
    runtimeSettings({ ADMIN_EMAIL: "owner@example.test" }, c).adminEmail,
  ).toBe("owner@example.test");
  const f = fixture();
  delete f.env.ADMIN_EMAIL;
  expect(configured(f.env)).toBe(false);
});
it("does not expose notification addresses in the public settings object", () => {
  const c = structuredClone(siteConfig);
  c.email.to = "private-owner@example.test";
  expect(JSON.stringify(publicSettings(c))).not.toContain("private-owner");
  expect(Object.keys(publicSettings(c))).not.toContain("emailFrom");
});
it("validates config shape, email addresses and production-required public values", () => {
  expect(() =>
    configSchema.parse({
      ...siteConfig,
      TURNSTILE_SECRET_KEY: "must-not-be-here",
    }),
  ).toThrow();
  expect(() =>
    configSchema.parse({
      ...siteConfig,
      email: { ...siteConfig.email, to: "env:UNKNOWN_SECRET" },
    }),
  ).toThrow();
  expect(() =>
    configSchema.parse({
      ...siteConfig,
      site: { ...siteConfig.site, origin: "https://example.org/private?x=1" },
    }),
  ).toThrow();
  const c = structuredClone(siteConfig);
  c.contact.showPhone = true;
  c.contact.phone = "bad";
  expect(productionErrors(c).join(" ")).toContain("contact.phone");
  c.contact.showPhone = false;
  expect(productionErrors(c).join(" ")).not.toContain("contact.phone");
  c.turnstile.siteKey = "1x000000test";
  expect(productionErrors(c).join(" ")).toContain("turnstile.siteKey");
});
it("makes origin changes consistent for page and Worker settings", () => {
  const c = structuredClone(siteConfig);
  c.site.origin = "https://new-owner.example";
  expect(publicSettings(c).origin).toBe("https://new-owner.example");
  expect(runtimeSettings({}, c).allowedOrigins).toEqual([
    "https://new-owner.example",
  ]);
});
