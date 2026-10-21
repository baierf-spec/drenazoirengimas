// @vitest-environment happy-dom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { readFileSync } from "node:fs";
import { initQuote } from "../src/scripts/quote";
import { initConfirmation } from "../src/scripts/confirmation";
import { initDiagnostic, initEstimator } from "../src/scripts/tools";
function page(name: string) {
  const html = readFileSync(`dist/client/${name}/index.html`, "utf8");
  document.documentElement.innerHTML = html.replace(
    /<link[^>]*rel="stylesheet"[^>]*>/g,
    "",
  );
}
function input(name: string, value: string) {
  const el = document.querySelector<HTMLInputElement>(`[name="${name}"]`)!;
  el.value = value;
  el.dispatchEvent(new Event("input", { bubbles: true }));
}
beforeEach(() => {
  vi.resetModules();
  localStorage.clear();
  sessionStorage.clear();
});
describe("interactive UI against the built Astro pages", () => {
  it("does not claim success when the confirmation URL is opened directly", () => {
    page("aciu");
    const neutral = document.querySelector("h1")!.textContent;
    initConfirmation();
    expect(document.querySelector("h1")!.textContent).toBe(neutral);
    expect(
      document.querySelector<HTMLElement>("[data-received-note]")!.hidden,
    ).toBe(true);
    sessionStorage.setItem("drainage-received", "yes");
    initConfirmation();
    expect(document.querySelector("h1")!.textContent).toBe("Užklausa gauta.");
    expect(
      document.querySelector<HTMLElement>("[data-received-note]")!.hidden,
    ).toBe(false);
  });
  it("renders a labelled technical section without a caption icon that can stretch", () => {
    page("");
    const figure = document.querySelector(".water-diagram")!;
    expect(figure.querySelectorAll("svg")).toHaveLength(1);
    expect(figure.querySelector("svg")!.getAttribute("viewBox")).toBe(
      "0 0 960 480",
    );
    expect(figure.querySelectorAll(".diagram-legend li")).toHaveLength(5);
    expect(figure.querySelector("figcaption")!.textContent).toContain(
      "ne techninis projektas",
    );
  });
  it("opens the mobile menu, follows links and closes on Escape with restored focus", async () => {
    page("");
    await import("../src/scripts/site");
    const button = document.querySelector<HTMLButtonElement>(".menu-toggle")!;
    button.click();
    expect(button.getAttribute("aria-expanded")).toBe("true");
    expect(
      document.querySelector("#navigation")?.hasAttribute("data-open"),
    ).toBe(true);
    document.dispatchEvent(
      new KeyboardEvent("keydown", { key: "Escape", bubbles: true }),
    );
    expect(button.getAttribute("aria-expanded")).toBe("false");
    expect(document.activeElement).toBe(button);
    expect(button.getAttribute("aria-label")).toBe("Atidaryti meniu");
  });
  it("shows one quote step at a time and blocks advancement without a location", () => {
    page("gauti-pasiulyma");
    initQuote();
    const steps = document.querySelectorAll<HTMLFieldSetElement>(".flow-step");
    expect(steps[0].hidden).toBe(false);
    expect(steps[1].hidden).toBe(true);
    document.querySelector<HTMLButtonElement>("[data-next]")!.click();
    expect(steps[1].hidden).toBe(false);
    steps[1].querySelector<HTMLButtonElement>("[data-next]")!.click();
    expect(steps[1].hidden).toBe(false);
    input("location", "Kaunas");
    steps[1].querySelector<HTMLButtonElement>("[data-next]")!.click();
    expect(steps[2].hidden).toBe(false);
  });
  it("prepares two photos, removes one and submits only the remaining photo", async () => {
    page("gauti-pasiulyma");
    vi.stubGlobal(
      "createImageBitmap",
      vi.fn(async () => ({ width: 2000, height: 1000, close: vi.fn() })),
    );
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue({
      fillStyle: "",
      fillRect: vi.fn(),
      drawImage: vi.fn(),
    } as unknown as CanvasRenderingContext2D);
    vi.spyOn(HTMLCanvasElement.prototype, "toBlob").mockImplementation(
      (callback) => {
        callback(
          new Blob([new Uint8Array([255, 216, 255, 217])], {
            type: "image/jpeg",
          }),
        );
      },
    );
    vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:photo-preview");
    vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => {});
    initQuote();
    const f = document.querySelector<HTMLFormElement>("#quote-form")!;
    const photos = f.querySelector<HTMLInputElement>("#photos")!;
    Object.defineProperty(photos, "files", {
      value: [
        new File(["one"], "one.jpg", { type: "image/jpeg" }),
        new File(["two"], "two.png", { type: "image/png" }),
      ],
      configurable: true,
    });
    photos.dispatchEvent(new Event("change"));
    await vi.waitFor(() =>
      expect(f.querySelectorAll(".photo-list li")).toHaveLength(2),
    );
    expect(createImageBitmap).toHaveBeenCalledTimes(2);
    f.querySelector<HTMLButtonElement>(".photo-list button")!.click();
    expect(f.querySelectorAll(".photo-list li")).toHaveLength(1);
    document.querySelector<HTMLButtonElement>("[data-next]")!.click();
    input("location", "Vilnius");
    document.querySelectorAll<HTMLButtonElement>("[data-next]")[1].click();
    input("name", "Tomas");
    input("phone", "+37061234567");
    (f.elements.namedItem("consent") as HTMLInputElement).checked = true;
    const token = document.createElement("input");
    token.name = "turnstileToken";
    token.value = "verified";
    f.append(token);
    vi.spyOn(window.location, "assign").mockImplementation(() => {});
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        Response.json({ id: "photo-lead", status: "sent" }, { status: 201 }),
      ),
    );
    f.dispatchEvent(new Event("submit", { cancelable: true }));
    await vi.waitFor(() => expect(fetch).toHaveBeenCalledTimes(1));
    const submitted = vi.mocked(fetch).mock.calls[0][1]!.body as FormData;
    expect(submitted.getAll("photos")).toHaveLength(1);
    expect((submitted.get("photos") as File).type).toBe("image/jpeg");
  });
  it("keeps form data after network failure and restores the submit button", async () => {
    page("gauti-pasiulyma");
    const f = document.querySelector<HTMLFormElement>("#quote-form")!;
    f.dataset.turnstile = "";
    initQuote();
    document.querySelector<HTMLButtonElement>("[data-next]")!.click();
    input("location", "Kaunas");
    document.querySelectorAll<HTMLButtonElement>("[data-next]")[1].click();
    input("name", "Tomas");
    input("phone", "+37061234567");
    (f.elements.namedItem("consent") as HTMLInputElement).checked = true;
    const token = document.createElement("input");
    token.name = "turnstileToken";
    token.value = "verified";
    f.append(token);
    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValue(new Error("Ryšio klaida")),
    );
    f.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
    await vi.waitFor(() =>
      expect(f.querySelector("#quote-error")?.textContent).toContain(
        "Ryšio klaida",
      ),
    );
    expect((f.elements.namedItem("phone") as HTMLInputElement).value).toBe(
      "+37061234567",
    );
    expect(f.querySelector<HTMLButtonElement>("[type=submit]")!.disabled).toBe(
      false,
    );
  });
  it("accepts successful API response and navigates to the confirmation page", async () => {
    page("gauti-pasiulyma");
    const f = document.querySelector<HTMLFormElement>("#quote-form")!;
    initQuote();
    document.querySelector<HTMLButtonElement>("[data-next]")!.click();
    input("location", "Vilnius");
    document.querySelectorAll<HTMLButtonElement>("[data-next]")[1].click();
    input("name", "Tomas");
    input("phone", "+37061234567");
    (f.elements.namedItem("consent") as HTMLInputElement).checked = true;
    const token = document.createElement("input");
    token.name = "turnstileToken";
    token.value = "verified";
    f.append(token);
    const assign = vi
      .spyOn(window.location, "assign")
      .mockImplementation(() => {});
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValue(
          Response.json({ id: "received-id", status: "sent" }, { status: 201 }),
        ),
    );
    f.dispatchEvent(new Event("submit", { cancelable: true }));
    await vi.waitFor(() => expect(assign).toHaveBeenCalledWith("/aciu/"));
    expect(sessionStorage.getItem("drainage-received")).toBe("yes");
  });
  it.each(["sent", "failed", "missing-status", "network"])(
    "counts a lead only after a confirmed email response: %s",
    async (outcome) => {
      page("gauti-pasiulyma");
      const f = document.querySelector<HTMLFormElement>("#quote-form")!;
      initQuote();
      document.querySelector<HTMLButtonElement>("[data-next]")!.click();
      input("location", "Vilnius");
      document.querySelectorAll<HTMLButtonElement>("[data-next]")[1].click();
      input("name", "Tomas");
      input("phone", "+37061234567");
      (f.elements.namedItem("consent") as HTMLInputElement).checked = true;
      const token = document.createElement("input");
      token.name = "turnstileToken";
      token.value = "verified";
      f.append(token);
      const gtag = vi.fn((_type, _event, params) => params.event_callback());
      window.gtag = gtag;
      const assign = vi
        .spyOn(window.location, "assign")
        .mockImplementation(() => {});
      let finish!: (response: Response) => void;
      let fail!: (error: Error) => void;
      vi.stubGlobal(
        "fetch",
        vi.fn(
          () =>
            new Promise<Response>((resolve, reject) => {
              finish = resolve;
              fail = reject;
            }),
        ),
      );
      f.dispatchEvent(new Event("submit", { cancelable: true }));
      f.dispatchEvent(new Event("submit", { cancelable: true }));
      expect(fetch).toHaveBeenCalledTimes(1);
      expect(gtag).not.toHaveBeenCalled();
      if (outcome === "network") fail(new TypeError("offline"));
      else
        finish(
          Response.json(
            {
              id: crypto.randomUUID(),
              ...(outcome !== "missing-status" ? { status: outcome } : {}),
            },
            { status: outcome === "failed" ? 503 : 201 },
          ),
        );
      if (outcome === "sent") {
        await vi.waitFor(() => expect(assign).toHaveBeenCalledWith("/aciu/"));
        expect(gtag).toHaveBeenCalledExactlyOnceWith(
          "event",
          "generate_lead",
          expect.objectContaining({
            form_name: "kontaktinė_forma",
            lead_type: "užklausa",
          }),
        );
        f.dispatchEvent(new Event("submit", { cancelable: true }));
        expect(fetch).toHaveBeenCalledTimes(1);
        expect(gtag).toHaveBeenCalledTimes(1);
        page("aciu");
        initConfirmation();
        initConfirmation();
        expect(gtag).toHaveBeenCalledTimes(1);
      } else {
        await vi.waitFor(() => expect(f.getAttribute("aria-busy")).toBeNull());
        expect(gtag).not.toHaveBeenCalled();
        expect(assign).not.toHaveBeenCalled();
      }
      delete window.gtag;
    },
  );
  it("blocks repeated submits while the first request is pending", () => {
    page("gauti-pasiulyma");
    const f = document.querySelector<HTMLFormElement>("#quote-form")!;
    initQuote();
    document.querySelector<HTMLButtonElement>("[data-next]")!.click();
    input("location", "Vilnius");
    document.querySelectorAll<HTMLButtonElement>("[data-next]")[1].click();
    input("name", "Tomas");
    input("phone", "+37061234567");
    (f.elements.namedItem("consent") as HTMLInputElement).checked = true;
    const token = document.createElement("input");
    token.name = "turnstileToken";
    token.value = "verified";
    f.append(token);
    vi.stubGlobal(
      "fetch",
      vi.fn(() => new Promise(() => {})),
    );
    f.dispatchEvent(new Event("submit", { cancelable: true }));
    f.dispatchEvent(new Event("submit", { cancelable: true }));
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(f.getAttribute("aria-busy")).toBe("true");
  });
  it("completes diagnostic and hands its contextual result to quote flow", () => {
    page("diagnostika");
    initDiagnostic();
    document
      .querySelector<HTMLButtonElement>("[data-diagnostic-next]")!
      .click();
    document
      .querySelector("#diagnostic-form")!
      .dispatchEvent(new Event("submit", { cancelable: true }));
    expect(document.querySelector<HTMLElement>('[data-step="2"]')!.hidden).toBe(
      false,
    );
    expect(
      document.querySelector("#diagnostic-result")?.textContent?.length,
    ).toBeGreaterThan(15);
    expect(sessionStorage.getItem("drainage-diagnostic")).toContain(
      "foundations",
    );
  });
  it("updates visible estimate and its explanation when inputs change", () => {
    page("drenazo-kaina");
    initEstimator();
    const before = document.querySelector("#estimate-price")!.textContent;
    input("length", "100");
    expect(document.querySelector("#estimate-price")!.textContent).not.toBe(
      before,
    );
    expect(document.querySelector("#estimate-formula")!.textContent).toContain(
      "100 m",
    );
  });
  it("does not load optional Cloudflare analytics before consent and allows a deliberate decision", async () => {
    page("");
    document.querySelector("#analytics-config")!.textContent = JSON.stringify({
      cloudflare: "cf-test-token",
    });
    await import("../src/scripts/site");
    expect(
      document.querySelector('script[src*="cloudflareinsights"]'),
    ).toBeNull();
    expect(document.querySelector<HTMLElement>(".consent-panel")!.hidden).toBe(
      false,
    );
    document
      .querySelector<HTMLButtonElement>('[data-consent="denied"]')!
      .click();
    expect(
      document.querySelector('script[src*="cloudflareinsights"]'),
    ).toBeNull();
    expect(JSON.parse(localStorage.getItem("drainage-consent")!).value).toBe(
      "denied",
    );
  });
  it("does not duplicate the Google tag already included in the HTML head", async () => {
    page("");
    document.querySelector("#analytics-config")!.textContent = JSON.stringify({
      ga4: "G-TEST123",
    });
    const gtag = vi.fn();
    window.gtag = gtag;
    await import("../src/scripts/site");
    document
      .querySelector<HTMLButtonElement>('[data-consent="granted"]')!
      .click();
    expect(
      document.querySelectorAll('script[src*="googletagmanager"]'),
    ).toHaveLength(1);
    expect(gtag).not.toHaveBeenCalled();
    expect(JSON.parse(localStorage.getItem("drainage-consent")!).value).toBe(
      "granted",
    );
  });
});
