import { variantSlots, type Variant } from "../src/lib/gallery";
// Accept only still WebP output; strip optional metadata server-side as a second boundary.
export function cleanWebp(input: Uint8Array): {
  bytes: Uint8Array;
  width: number;
  height: number;
} {
  const text = (offset: number, n: number) =>
    String.fromCharCode(...input.slice(offset, offset + n));
  const view = new DataView(input.buffer, input.byteOffset, input.byteLength);
  if (
    input.length < 30 ||
    input.length > 2 * 1024 * 1024 ||
    text(0, 4) !== "RIFF" ||
    text(8, 4) !== "WEBP" ||
    view.getUint32(4, true) + 8 !== input.length
  )
    throw new Error("Netinkamas WebP failas.");
  let width = 0,
    height = 0,
    frames = 0;
  const chunks: Uint8Array[] = [];
  for (let pos = 12; pos < input.length;) {
    if (pos + 8 > input.length) throw new Error("Pažeista nuotrauka.");
    const type = text(pos, 4),
      len = view.getUint32(pos + 4, true),
      end = pos + 8 + len + (len % 2);
    if (end > input.length || len === 0) throw new Error("Pažeista nuotrauka.");
    const data = pos + 8;
    if (type === "ANIM" || type === "ANMF")
      throw new Error("Įkelkite neanimuotą nuotrauką.");
    if (type === "VP8 ") {
      if (len < 10 || text(data + 3, 3) !== "\x9d\x01\x2a")
        throw new Error("Pažeista nuotrauka.");
      width = view.getUint16(data + 6, true) & 0x3fff;
      height = view.getUint16(data + 8, true) & 0x3fff;
      frames++;
    } else if (type === "VP8L") {
      if (len < 5 || input[data] !== 0x2f)
        throw new Error("Pažeista nuotrauka.");
      const bits = view.getUint32(data + 1, true);
      width = (bits & 0x3fff) + 1;
      height = ((bits >>> 14) & 0x3fff) + 1;
      frames++;
    }
    if (["VP8 ", "VP8L", "ALPH", "VP8X"].includes(type)) {
      const chunk = input.slice(pos, end);
      if (type === "VP8X") {
        if (len !== 10 || chunk[8] & 2) throw new Error("Netinkama nuotrauka.");
        chunk[8] &= ~(0x20 | 0x08 | 0x04);
      }
      chunks.push(chunk);
    } // EXIF, XMP, ICC and unknown metadata are intentionally discarded.
    pos = end;
  }
  if (frames !== 1 || !width || !height || width > 1600 || height > 1600)
    throw new Error("Nuotrauka turi būti iki 1600 px.");
  for(const chunk of chunks) {
    if(String.fromCharCode(...chunk.slice(0,4))==='VP8X') {
      const canvasWidth=1+chunk[12]+(chunk[13]<<8)+(chunk[14]<<16);
      const canvasHeight=1+chunk[15]+(chunk[16]<<8)+(chunk[17]<<16);
      if(canvasWidth!==width||canvasHeight!==height)throw new Error('Netinkami nuotraukos matmenys.');
    }
  }
  const size = 12 + chunks.reduce((n, c) => n + c.length, 0),
    bytes = new Uint8Array(size);
  bytes.set(input.slice(0, 12));
  new DataView(bytes.buffer).setUint32(4, size - 8, true);
  let offset = 12;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.length;
  }
  return { bytes, width, height };
}
export async function boundedBody(request: Request, limit: number) {
  if (Number(request.headers.get("content-length")) > limit)
    throw new Error("Duomenų kiekis per didelis.");
  const reader = request.body?.getReader();
  if (!reader) throw new Error("Trūksta duomenų.");
  const parts: Uint8Array[] = [];
  let length = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    length += value.byteLength;
    if (length > limit) {
      await reader.cancel();
      throw new Error("Duomenų kiekis per didelis.");
    }
    parts.push(value);
  }
  const bytes = new Uint8Array(length);
  let pos = 0;
  for (const p of parts) {
    bytes.set(p, pos);
    pos += p.length;
  }
  return bytes;
}
export async function readVariants(request: Request) {
  const body = await boundedBody(request, 7 * 1024 * 1024);
  const form = await new Request(request.url, {
    method: "POST",
    headers: { "Content-Type": request.headers.get("content-type") || "" },
    body,
  }).formData();
  const id = String(form.get("id") || "");
  if (!/^[0-9a-f-]{36}$/.test(id)) throw new Error("Netinkamas nuotraukos ID.");
  const variants = [];
  for (const slot of variantSlots) {
    const file = form.get(String(slot));
    if (
      !(file instanceof File) ||
      file.type !== "image/webp" ||
      form.getAll(String(slot)).length !== 1
    )
      throw new Error("Trūksta optimizuotos nuotraukos.");
    const image = cleanWebp(new Uint8Array(await file.arrayBuffer()));
    if (Math.max(image.width, image.height) > slot)
      throw new Error("Netinkami nuotraukos matmenys.");
    variants.push({ ...image, slot });
  }
  const big = variants[2];
  for (const v of variants)
    if (Math.abs(v.width / v.height - big.width / big.height) > 0.03)
      throw new Error("Nuotraukos variantai nesutampa.");
  const hashes = await Promise.all(
    variants.map(async (v) =>
      Array.from(
        new Uint8Array(
          await crypto.subtle.digest("SHA-256", new Uint8Array(v.bytes)),
        ),
      )
        .map((b) => b.toString(16).padStart(2, "0"))
        .join(""),
    ),
  );
  return { id, variants, fingerprint: hashes.join(":") };
}
export function storedVariants(value: string): Variant[] {
  return JSON.parse(value) as Variant[];
}
