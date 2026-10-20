import type { Env } from "./types";
import type {
  Project,
  ProjectImage,
  ProjectWithImages,
} from "../src/lib/gallery";
export const galleryReady = (env: Env) =>
  env.GALLERY_ENABLED === "true" && !!env.DB && !!env.PHOTOS;
export async function projects(
  env: Env,
  publicOnly = true,
): Promise<Project[]> {
  return (
    await env.DB.prepare(
      `SELECT * FROM gallery_projects ${publicOnly ? "WHERE status='published' AND cover_image_id IS NOT NULL" : ""} ORDER BY sort_order,created_at DESC,id`,
    ).all<Project>()
  ).results;
}
export async function images(env: Env, id: string): Promise<ProjectImage[]> {
  return (
    await env.DB.prepare(
      "SELECT * FROM gallery_images WHERE project_id=? ORDER BY sort_order,created_at,id",
    )
      .bind(id)
      .all<ProjectImage>()
  ).results;
}
export async function project(
  env: Env,
  id: string,
): Promise<ProjectWithImages | null> {
  const p = await env.DB.prepare("SELECT * FROM gallery_projects WHERE id=?")
    .bind(id)
    .first<Project>();
  return p ? { ...p, images: await images(env, p.id) } : null;
}
export async function drainGalleryDeletions(env: Env) {
  if (!galleryReady(env)) return;
  const pending = await env.DB.prepare(
    "SELECT storage_key FROM gallery_deletions LIMIT 100",
  ).all<{ storage_key: string }>();
  for (const row of pending.results) {
    try {
      await env.PHOTOS.delete(row.storage_key);
      await env.DB.prepare("DELETE FROM gallery_deletions WHERE storage_key=?")
        .bind(row.storage_key)
        .run();
    } catch {
      /* Retry on next mutation/maintenance; keys are no longer public. */
    }
  }
}
