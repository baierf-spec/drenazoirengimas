// @vitest-environment happy-dom
import { describe, it, expect, vi } from "vitest";
import { prepareGalleryPhoto } from "../src/scripts/gallery-photos";
import { heicTo } from "heic-to/csp";
vi.mock("heic-to/csp", () => ({ heicTo: vi.fn() }));
function canvas() {
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue({
    fillStyle: "",
    fillRect: vi.fn(),
    drawImage: vi.fn(),
  } as unknown as CanvasRenderingContext2D);
  vi.spyOn(HTMLCanvasElement.prototype, "toBlob").mockImplementation((cb) =>
    cb(new Blob(["webp"], { type: "image/webp" })),
  );
}
describe("automatic gallery photo preparation", () => {
  it("converts HEIC automatically when native decoding is unavailable, then generates responsive WebP", async () => {
    canvas();
    const close = vi.fn();
    vi.stubGlobal(
      "createImageBitmap",
      vi.fn().mockRejectedValue(new Error("Unsupported")),
    );
    vi.mocked(heicTo).mockResolvedValue({
      width: 4000,
      height: 3000,
      close,
    } as unknown as ImageBitmap);
    const header = new Uint8Array(16);
    header.set(new TextEncoder().encode("ftypheic"), 4);
    const result = await prepareGalleryPhoto(
      new File([header], "iphone.heic", { type: "image/heic" }),
    );
    expect(heicTo).toHaveBeenCalledOnce();
    expect(result.map((v) => [v.slot, v.width, v.height])).toEqual([
      [480, 480, 360],
      [960, 960, 720],
      [1600, 1600, 1200],
    ]);
    expect(result.every((v) => v.blob.type === "image/webp")).toBe(true);
    expect(close).toHaveBeenCalledOnce();
  });
  it("does not load the HEIC converter for normal JPEG files", async () => {
    canvas();
    vi.mocked(heicTo).mockClear();
    vi.stubGlobal(
      "createImageBitmap",
      vi.fn().mockResolvedValue({ width: 1200, height: 800, close: vi.fn() }),
    );
    const result = await prepareGalleryPhoto(
      new File(["jpeg"], "photo.jpg", { type: "image/jpeg" }),
    );
    expect(heicTo).not.toHaveBeenCalled();
    expect(result.at(-1)!.width).toBe(1200);
  });
  it("rejects unsupported and oversized files before decoding", async () => {
    vi.stubGlobal("createImageBitmap", vi.fn());
    await expect(
      prepareGalleryPhoto(
        new File(["<svg>"], "photo.svg", { type: "image/svg+xml" }),
      ),
    ).rejects.toThrow("Pasirinkite");
    const large = new File(["x"], "large.jpg", { type: "image/jpeg" });
    Object.defineProperty(large, "size", { value: 21 * 1024 * 1024 });
    await expect(prepareGalleryPhoto(large)).rejects.toThrow("20 MB");
    expect(createImageBitmap).not.toHaveBeenCalled();
  });
});
