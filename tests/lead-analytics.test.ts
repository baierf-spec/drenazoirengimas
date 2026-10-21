// @vitest-environment happy-dom
import { afterEach, expect, it, vi } from "vitest";
import { reportGeneratedLead } from "../src/lib/analytics";
afterEach(() => {
  delete window.gtag;
  sessionStorage.clear();
  vi.useRealTimers();
});
it("sends only fixed fields and skips duplicate lead IDs across repeated callbacks", async () => {
  window.gtag = vi.fn((_type, _event, params) => params.event_callback());
  const id = crypto.randomUUID();
  await reportGeneratedLead(id);
  await reportGeneratedLead(id);
  expect(window.gtag).toHaveBeenCalledTimes(1);
  const params = vi.mocked(window.gtag).mock.calls[0][2] as Record<
    string,
    unknown
  >;
  expect(Object.keys(params).sort()).toEqual([
    "event_callback",
    "event_timeout",
    "form_name",
    "lead_type",
  ]);
  expect(JSON.stringify(params)).not.toContain(id);
  const previous = crypto.randomUUID();
  sessionStorage.setItem("drainage-counted-leads", JSON.stringify([previous]));
  await reportGeneratedLead(previous);
  expect(window.gtag).toHaveBeenCalledTimes(1);
});
it("continues when analytics is absent, throws or never invokes its callback", async () => {
  await reportGeneratedLead(crypto.randomUUID());
  window.gtag = () => {
    throw Error("blocked");
  };
  await expect(
    reportGeneratedLead(crypto.randomUUID()),
  ).resolves.toBeUndefined();
  vi.useFakeTimers();
  window.gtag = vi.fn();
  const sending = reportGeneratedLead(crypto.randomUUID());
  await vi.advanceTimersByTimeAsync(1500);
  await expect(sending).resolves.toBeUndefined();
});
