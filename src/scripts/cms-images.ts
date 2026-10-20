// Admin-only upload adapter. Public lead forms are unchanged.
export const CMS_IMAGE_LIMIT = 20 * 1024 * 1024;
export function validateCmsPhoto(file: File) {
  if (!file.size || file.size > CMS_IMAGE_LIMIT)
    throw new Error("Nuotrauka turi būti iki 20 MB.");
  if (
    !/\.(jpe?g|png|webp|heic|heif)$/i.test(file.name) ||
    (file.type &&
      !/^image\/(jpeg|png|webp|heic|heif|heic-sequence|heif-sequence)$/i.test(
        file.type,
      ))
  )
    throw new Error("Pasirinkite JPG, PNG, WebP arba iPhone HEIC nuotrauką.");
}
export async function prepareCmsPhoto(file: File): Promise<File> {
  validateCmsPhoto(file);
  let blob: Blob = file;
  if (/\.(heic|heif)$/i.test(file.name)) {
    const { heicTo } = await import("heic-to/csp");
    blob = await heicTo({ blob: file, type: "image/jpeg", quality: 0.9 });
  }
  const url = URL.createObjectURL(blob);
  try {
    const image = new Image();
    image.src = url;
    await image.decode();
    if (image.naturalWidth * image.naturalHeight > 60000000)
      throw Error(
        "Nuotraukos raiška per didelė. Pasirinkite iki 60 megapikselių nuotrauką.",
      );
    const scale = Math.min(
      1,
      1600 / image.naturalWidth,
      1600 / image.naturalHeight,
    );
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(image.naturalWidth * scale);
    canvas.height = Math.round(image.naturalHeight * scale);
    const context = canvas.getContext("2d");
    if (!context) throw Error("Naršyklė negali paruošti nuotraukos.");
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    const converted = await new Promise<Blob>((resolve, reject) =>
      canvas.toBlob(
        (result) =>
          result
            ? resolve(result)
            : reject(Error("Nepavyko paruošti nuotraukos.")),
        "image/webp",
        0.85,
      ),
    );
    const name =
      file.name
        .replace(/\.[^.]+$/, "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/[^a-z0-9-]/g, "-")
        .slice(0, 70) || "nuotrauka";
    return new File(
      [converted],
      `${name}-${crypto.randomUUID().slice(0, 8)}.${converted.type === "image/webp" ? "webp" : "png"}`,
      { type: converted.type },
    );
  } finally {
    URL.revokeObjectURL(url);
  }
}
const completed = new WeakSet<Event>();
async function intercept(event: Event) {
  if (completed.has(event)) return;
  const input = event.target instanceof HTMLInputElement ? event.target : null;
  const transfer = event instanceof DragEvent ? event.dataTransfer : null;
  const files =
    event.type === "change" && input?.type === "file"
      ? [...(input.files || [])]
      : transfer?.files.length
        ? [...transfer.files]
        : [];
  if (!files.length) return;
  event.preventDefault();
  event.stopImmediatePropagation();
  const target = event.target;
  const status = document.createElement("div");
  status.setAttribute("role", "status");
  status.className = "cms-upload-status";
  document.body.append(status);
  try {
    const prepared = new DataTransfer();
    for (let i = 0; i < files.length; i++) {
      status.textContent = `Ruošiama nuotrauka ${i + 1} iš ${files.length}…`;
      prepared.items.add(await prepareCmsPhoto(files[i]));
    }
    let next: Event;
    if (input) {
      input.files = prepared.files;
      next = new Event("change", { bubbles: true });
    } else
      next = new DragEvent("drop", {
        bubbles: true,
        cancelable: true,
        dataTransfer: prepared,
      });
    completed.add(next);
    target?.dispatchEvent(next);
    status.remove();
  } catch (error) {
    status.setAttribute("role", "alert");
    status.textContent =
      (error instanceof Error
        ? error.message
        : "Nepavyko paruošti nuotraukos.") +
      " Pasirinkite nuotrauką dar kartą, kad pakartotumėte.";
    const close = document.createElement("button");
    close.textContent = "Uždaryti";
    close.onclick = () => status.remove();
    status.append(close);
    if (input) input.value = "";
  }
}
if (typeof document !== "undefined") {
  document.addEventListener("change", intercept, true);
  document.addEventListener("drop", intercept, true);
  new MutationObserver(() =>
    document
      .querySelectorAll<HTMLInputElement>('input[type="file"]')
      .forEach(
        (input) =>
          (input.accept =
            "image/jpeg,image/png,image/webp,image/heic,image/heif,.heic,.heif"),
      ),
  ).observe(document.documentElement, { childList: true, subtree: true });
}
