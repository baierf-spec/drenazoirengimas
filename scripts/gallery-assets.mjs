import { readdir, rm } from "node:fs/promises";
import path from "node:path";
export async function pruneGalleryOriginals(client) {
  const folder = path.join(client, "images/projects");
  try {
    for (const name of await readdir(folder))
      if (name !== "_generated")
        await rm(path.join(folder, name), { recursive: true, force: true });
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }
}
