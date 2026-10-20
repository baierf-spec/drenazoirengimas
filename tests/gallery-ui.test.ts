// @vitest-environment happy-dom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { readFileSync } from "node:fs";
import { initGalleryManager } from "../src/scripts/gallery-manager";
import {
  prepareGalleryPhoto,
  uploadGalleryPhoto,
} from "../src/scripts/gallery-photos";
vi.mock("../src/scripts/gallery-photos", () => ({
  prepareGalleryPhoto: vi.fn(),
  uploadGalleryPhoto: vi.fn(),
}));
const image = {
  id: "2c143b80-2222-4222-8222-222222222222",
  project_id: "1c143b80-1111-4111-8111-111111111111",
  alt_text: null,
};
function project() {
  return {
    id: image.project_id,
    slug: "tik-testas",
    title: "Tik testų projektas",
    description: "Ilgesnis nei dvidešimt simbolių testų aprašymas.",
    location: null,
    project_type: "plot",
    completion_date: "2026",
    status: "draft",
    cover_image_id: image.id,
    updated_at: 1,
    images: [image],
  };
}
function input(name: string, value: string) {
  const field = document.querySelector<HTMLInputElement>(
    `#project-editor [name="${name}"]`,
  )!;
  field.value = value;
  field.dispatchEvent(new Event("input", { bubbles: true }));
}
beforeEach(() => {
  vi.clearAllMocks();
  document.documentElement.innerHTML = readFileSync(
    "dist/client/gallery-manager/index.html",
    "utf8",
  ).replace(/<link[^>]*rel="stylesheet"[^>]*>/g, "");
  vi.stubGlobal(
    "confirm",
    vi.fn(() => true),
  );
});
describe("simple gallery editor DOM flows", () => {
  it("creates a draft, maps optional fields and publishes with version and cover", async () => {
    const p = project();
    const calls: {
      path: string;
      method: string;
      body: Record<string, unknown>;
    }[] = [];
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: string, options?: RequestInit) => {
        const method = options?.method || "GET",
          body = options?.body ? JSON.parse(String(options.body)) : {};
        calls.push({ path: String(url), method, body });
        if (String(url).endsWith("/projects") && method === "GET")
          return Response.json({ projects: [] });
        if (method === "PATCH")
          return Response.json({ ...p, ...body, updated_at: 2 });
        return Response.json(p, { status: method === "POST" ? 201 : 200 });
      }),
    );
    initGalleryManager();
    await vi.waitFor(() =>
      expect(document.querySelector("#manager-status")!.textContent).toBe(""),
    );
    document.querySelector<HTMLButtonElement>("#new-project")!.click();
    input("title", "Drenažo darbų testas");
    input("description", "Tai tik automatinio testo projekto aprašymas.");
    input("location", "Testo vietovė");
    document.querySelector<HTMLButtonElement>("#save-project")!.click();
    await vi.waitFor(() =>
      expect(document.querySelector("#manager-status")!.textContent).toContain(
        "Juodraštis išsaugotas",
      ),
    );
    await vi.waitFor(() =>
      expect(
        document.querySelector("#project-editor")!.hasAttribute("aria-busy"),
      ).toBe(false),
    );
    expect(
      Array.from(
        document.querySelectorAll<HTMLInputElement>(
          "#project-editor input,#project-editor textarea,#project-editor select",
        ),
      )
        .filter((el) => !el.checkValidity())
        .map((el) => ({
          name: el.name,
          value: el.value,
          message: el.validationMessage,
        })),
    ).toEqual([]);
    document
      .querySelector<HTMLFormElement>("#project-editor")!
      .dispatchEvent(new Event("submit", { cancelable: true }));
    await vi.waitFor(() =>
      expect(document.querySelector("#manager-status")!.textContent).toContain(
        "Projektas publikuotas",
      ),
    );
    const publish = calls.filter((c) => c.method === "PATCH").at(-1)!;
    expect(publish.body).toMatchObject({
      title: "Drenažo darbų testas",
      location: "Testo vietovė",
      status: "published",
      cover_image_id: image.id,
      version: 2,
    });
  });
  it("processes multiple files sequentially and allows a failed upload to retry", async () => {
    const p = project();
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: string) =>
        Response.json(
          String(url).endsWith("/projects") ? { projects: [p] } : p,
        ),
      ),
    );
    vi.mocked(prepareGalleryPhoto).mockResolvedValue([
      {
        slot: 480,
        blob: new Blob(["webp"], { type: "image/webp" }),
        width: 48,
        height: 32,
      },
    ]);
    vi.mocked(uploadGalleryPhoto)
      .mockRejectedValueOnce(new Error("Ryšio klaida."))
      .mockResolvedValue(p);
    initGalleryManager();
    await vi.waitFor(() =>
      expect(document.querySelector(".owner-project-title")).not.toBeNull(),
    );
    document.querySelector<HTMLButtonElement>(".owner-project-title")!.click();
    await vi.waitFor(() =>
      expect(
        document.querySelector<HTMLFormElement>("#project-editor")!.hidden,
      ).toBe(false),
    );
    const files = document.querySelector<HTMLInputElement>("#gallery-files")!;
    Object.defineProperty(files, "files", {
      value: [
        new File(["one"], "1.jpg", { type: "image/jpeg" }),
        new File(["two"], "2.jpg", { type: "image/jpeg" }),
      ],
      configurable: true,
    });
    files.dispatchEvent(new Event("change"));
    await vi.waitFor(() =>
      expect(document.querySelector("#manager-status")!.textContent).toContain(
        "Dalies nuotraukų",
      ),
    );
    expect(uploadGalleryPhoto).toHaveBeenCalledTimes(2);
    expect(document.querySelectorAll("#upload-queue li")).toHaveLength(1);
    document.querySelector<HTMLButtonElement>("#upload-queue button")!.click();
    await vi.waitFor(() => expect(uploadGalleryPhoto).toHaveBeenCalledTimes(3));
    await vi.waitFor(() =>
      expect(document.querySelectorAll("#upload-queue li")).toHaveLength(0),
    );
  });
  it("shows an understandable error when the private API is not active", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        Response.json(
          { error: "Galerijos valdymas dar neaktyvuotas." },
          { status: 503 },
        ),
      ),
    );
    initGalleryManager();
    await vi.waitFor(() =>
      expect(document.querySelector("#manager-error")!.textContent).toContain(
        "neaktyvuotas",
      ),
    );
    expect(document.querySelector("#manager-status")!.textContent).toBe("");
  });
});
