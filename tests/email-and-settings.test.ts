import { expect, it, vi, afterEach } from "vitest";
import { renderLeadEmail } from "../worker/email";
import { validateLead } from "../src/lib/validation";
import { externalReferrer } from "../src/lib/attribution";
import { form } from "./fixtures";
afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
});
it("renders concise HTML and text emails without technical or empty fields", () => {
  const data = form({
    email: "",
    message: "<img src=x onerror=evil()>\nVanduo prie namo",
    name: "Jonas <test>",
    referrer: "https://www.google.com/search?q=private#private",
  });
  const result = validateLead(data);
  expect(result.success).toBe(true);
  if (!result.success) return;
  const mail = renderLeadEmail(result.data, 2);
  expect(mail.html).toContain("<table");
  expect(mail.html).toContain("Jonas &lt;test&gt;");
  expect(mail.html).toContain("&lt;img");
  expect(mail.html).not.toContain("<img src=x");
  expect(mail.html).toContain("tel:+37061234567");
  expect(mail.text).toContain("Atėjimo šaltinis: www.google.com");
  expect(mail.text).not.toContain("private");
  expect(mail.text).not.toMatch(
    /Privatumo versija|Užklausos numeris|Klausimynas|Neskaičiuotas|Nepildytas|El. paštas:/,
  );
  expect(mail.text).toContain("Pridėta nuotraukų: 2");
});
it("omits empty comments and attachments notice", () => {
  const result = validateLead(form({ message: "" }));
  if (!result.success) throw new Error("fixture");
  const mail = renderLeadEmail(result.data, 0);
  expect(mail.text).not.toContain("Kliento komentaras");
  expect(mail.text).not.toContain("Pridėta nuotraukų");
  expect(mail.text).toContain("Nenustatytas");
});
it("sanitizes external referrers and ignores internal/invalid/credential URLs", () => {
  expect(externalReferrer("https://example.org/path?email=private#hash")).toBe(
    "https://example.org",
  );
  for (const url of [
    "https://drenazoirengimas.lt/a/",
    "https://www.drenazoirengimas.lt/",
    "javascript:alert(1)",
    "https://user:pass@example.org/",
    "not-url",
    "",
  ])
    expect(externalReferrer(url)).toBe("");
});
it("hides public phone by default and supports explicit on/off", async () => {
  vi.stubEnv("PUBLIC_PHONE", "+37061234567");
  vi.stubEnv("PUBLIC_SHOW_PHONE", "false");
  vi.resetModules();
  expect((await import("../src/data/site")).site.phone).toBe("");
  vi.stubEnv("PUBLIC_SHOW_PHONE", "true");
  vi.resetModules();
  expect((await import("../src/data/site")).site.phone).toBe("+37061234567");
  vi.stubEnv("PUBLIC_SHOW_PHONE", "");
  vi.resetModules();
  expect((await import("../src/data/site")).site.phone).toBe("");
});
