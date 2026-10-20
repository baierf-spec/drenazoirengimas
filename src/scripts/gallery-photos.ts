export type PreparedPhoto = {
  slot: number;
  blob: Blob;
  width: number;
  height: number;
}[];
export async function prepareGalleryPhoto(file: File): Promise<PreparedPhoto> {
  if (file.size > 20 * 1024 * 1024 || file.size === 0)
    throw new Error("Viena nuotrauka gali būti iki 20 MB.");
  const header = new Uint8Array(await file.slice(0, 16).arrayBuffer());
  const brand = new TextDecoder().decode(header.slice(8, 12));
  const heic = ["heic", "heix", "hevc", "hevx", "mif1", "msf1"].includes(brand);
  const standard = ["image/jpeg", "image/png", "image/webp"].includes(
    file.type,
  );
  if (!standard && !heic)
    throw new Error("Pasirinkite JPG, PNG, WebP arba HEIC / HEIF nuotrauką.");
  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  } catch {
    if (!heic)
      throw new Error(
        "Nepavyko perskaityti nuotraukos. Pasirinkite failą dar kartą.",
      );
    const { heicTo } = await import("heic-to/csp");
    bitmap = await heicTo({ blob: file, type: "bitmap" });
  }
  try {
    if (bitmap.width * bitmap.height > 60_000_000)
      throw new Error("Nuotraukos raiška per didelė (iki 60 megapikselių).");
    const results: PreparedPhoto = [];
    for (const slot of [480, 960, 1600]) {
      const scale = Math.min(1, slot / Math.max(bitmap.width, bitmap.height)),
        canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(bitmap.width * scale));
      canvas.height = Math.max(1, Math.round(bitmap.height * scale));
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Naršyklė negali paruošti nuotraukos.");
      ctx.fillStyle = "#fff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
      const blob = await new Promise<Blob>((resolve, reject) =>
        canvas.toBlob(
          (b) =>
            b ? resolve(b) : reject(new Error("Nepavyko paruošti nuotraukos.")),
          "image/webp",
          0.84,
        ),
      );
      if (blob.type !== "image/webp" || blob.size > 2 * 1024 * 1024)
        throw new Error(
          "Nuotraukos paruošti nepavyko. Atnaujinkite naršyklę ir bandykite dar kartą.",
        );
      results.push({ slot, blob, width: canvas.width, height: canvas.height });
      canvas.width = canvas.height = 1;
    }
    return results;
  } finally {
    bitmap.close();
  }
}
export function uploadGalleryPhoto(
  projectId: string,
  id: string,
  photos: PreparedPhoto,
  onProgress: (n: number) => void,
): Promise<unknown> {
  const body = new FormData();
  body.set("id", id);
  for (const v of photos) body.set(String(v.slot), v.blob, `${v.slot}.webp`);
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", `/api/gallery/projects/${projectId}/photos`);
    xhr.timeout = 120000;
    xhr.responseType = "json";
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable)
        onProgress(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onload = () =>
      xhr.status >= 200 && xhr.status < 300 && xhr.response?.id
        ? resolve(xhr.response)
        : reject(
            new Error(
              xhr.response?.error ||
                (xhr.status === 401 || xhr.status === 403
                  ? "Prisijungimo laikas baigėsi. Atnaujinkite puslapį ir prisijunkite."
                  : "Nuotraukos išsaugoti nepavyko. Bandykite dar kartą."),
            ),
          );
    xhr.onerror = () =>
      reject(new Error("Ryšio klaida. Galite bandyti dar kartą."));
    xhr.ontimeout = () =>
      reject(new Error("Siuntimas užtruko. Galite bandyti dar kartą."));
    xhr.send(body);
  });
}
