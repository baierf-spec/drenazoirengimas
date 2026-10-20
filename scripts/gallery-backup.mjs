import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
const projectColumns = [
  "id",
  "slug",
  "title",
  "location",
  "project_type",
  "description",
  "completion_date",
  "cover_image_id",
  "status",
  "sort_order",
  "created_at",
  "updated_at",
  "published_at",
];
const imageColumns = [
  "id",
  "project_id",
  "storage_key",
  "variants",
  "fingerprint",
  "alt_text",
  "sort_order",
  "width",
  "height",
  "created_at",
];
function sql(value) {
  if (value === null || value === undefined) return "NULL";
  if (typeof value === "number" && Number.isSafeInteger(value))
    return String(value);
  if (typeof value !== "string") throw new Error("Invalid backup value");
  return "'" + value.replaceAll("'", "''") + "'";
}
export function galleryRestoreSql(backup) {
  if (
    backup.format !== 1 ||
    !Array.isArray(backup.projects) ||
    !Array.isArray(backup.images)
  )
    throw new Error("Unsupported gallery backup");
  const statements = [];
  for (const p of backup.projects) {
    if (
      !/^[a-z0-9-]+$/.test(p.slug) ||
      !["draft", "published"].includes(p.status)
    )
      throw new Error("Invalid project");
    const row = { ...p, status: "draft", cover_image_id: null };
    statements.push(
      `INSERT INTO gallery_projects(${projectColumns.join(",")}) VALUES(${projectColumns.map((c) => sql(row[c])).join(",")});`,
    );
  }
  for (const i of backup.images) {
    if (!backup.projects.some((p) => p.id === i.project_id))
      throw new Error("Missing parent project");
    const variants = JSON.parse(i.variants);
    if (
      variants.length !== 3 ||
      variants.some(
        (v) =>
          !v.key.startsWith(`gallery/${i.project_id}/${i.id}/`) ||
          !/^gallery\/[a-f0-9-]{36}\/[a-f0-9-]{36}\/[a-f0-9-]{36}\/(480|960|1600)\.webp$/.test(
            v.key,
          ),
      )
    )
      throw new Error("Invalid image storage key");
    statements.push(
      `INSERT INTO gallery_images(${imageColumns.join(",")}) VALUES(${imageColumns.map((c) => sql(i[c])).join(",")});`,
    );
  }
  for (const p of backup.projects)
    statements.push(
      `UPDATE gallery_projects SET cover_image_id=${sql(p.cover_image_id)},status=${sql(p.status)} WHERE id=${sql(p.id)};`,
    );
  return (
    "-- Restore only into an empty, migrated gallery. Copy R2 gallery/ objects first.\n" +
    statements.join("\n") +
    "\n"
  );
}
if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href
) {
  const [action, directory, ...flags] = process.argv.slice(2);
  if (!directory || !["export", "prepare-restore"].includes(action))
    throw new Error(
      "Usage: node scripts/gallery-backup.mjs export|prepare-restore /absolute/backup-directory [--local]",
    );
  const folder = path.resolve(directory),
    root = process.cwd();
  if (folder === root || folder.startsWith(root + path.sep))
    throw new Error(
      "Choose a private backup directory outside the repository.",
    );
  mkdirSync(folder, { recursive: true, mode: 0o700 });
  if (action === "export") {
    const query = (table) => {
      const result = JSON.parse(
        execFileSync(
          path.resolve("node_modules/.bin/wrangler"),
          [
            "d1",
            "execute",
            "drenazoirengimas-leads",
            flags.includes("--local") ? "--local" : "--remote",
            "--command",
            `SELECT * FROM ${table}`,
            "--json",
          ],
          { encoding: "utf8", stdio: ["ignore", "pipe", "inherit"] },
        ),
      );
      return result.flatMap((r) => r.results || []);
    };
    const backup = {
      format: 1,
      exportedAt: new Date().toISOString(),
      projects: query("gallery_projects"),
      images: query("gallery_images"),
    };
    writeFileSync(
      path.join(folder, "gallery.json"),
      JSON.stringify(backup, null, 2),
      { mode: 0o600 },
    );
    console.log(
      "Gallery metadata exported. Copy the R2 gallery/ prefix separately before this backup is complete.",
    );
  } else {
    const backup = JSON.parse(
      readFileSync(path.join(folder, "gallery.json"), "utf8"),
    );
    writeFileSync(
      path.join(folder, "gallery-restore.sql"),
      galleryRestoreSql(backup),
      { mode: 0o600 },
    );
    console.log("Restore SQL prepared; no remote writes performed.");
  }
}
