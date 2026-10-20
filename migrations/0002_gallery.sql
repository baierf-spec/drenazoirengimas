PRAGMA foreign_keys = ON;
CREATE TABLE IF NOT EXISTS gallery_projects (
 id TEXT PRIMARY KEY,
 slug TEXT NOT NULL UNIQUE,
 title TEXT NOT NULL,
 location TEXT,
 project_type TEXT CHECK(project_type IS NULL OR project_type IN ('foundation','plot','rain','other')),
 description TEXT NOT NULL DEFAULT '',
 completion_date TEXT,
 cover_image_id TEXT,
 status TEXT NOT NULL DEFAULT 'draft' CHECK(status IN ('draft','published')),
 sort_order INTEGER NOT NULL DEFAULT 0,
 created_at INTEGER NOT NULL,
 updated_at INTEGER NOT NULL,
 published_at INTEGER
);
CREATE INDEX IF NOT EXISTS gallery_projects_public ON gallery_projects(status, sort_order, created_at);
CREATE TABLE IF NOT EXISTS gallery_images (
 id TEXT PRIMARY KEY,
 project_id TEXT NOT NULL REFERENCES gallery_projects(id) ON DELETE CASCADE,
 storage_key TEXT NOT NULL,
 variants TEXT NOT NULL,
 fingerprint TEXT NOT NULL,
 alt_text TEXT,
 sort_order INTEGER NOT NULL DEFAULT 0,
 width INTEGER NOT NULL CHECK(width BETWEEN 1 AND 1600),
 height INTEGER NOT NULL CHECK(height BETWEEN 1 AND 1600),
 created_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS gallery_images_project ON gallery_images(project_id, sort_order, created_at);
CREATE TABLE IF NOT EXISTS gallery_deletions (storage_key TEXT PRIMARY KEY);
CREATE TRIGGER IF NOT EXISTS gallery_image_limit BEFORE INSERT ON gallery_images
WHEN (SELECT COUNT(*) FROM gallery_images WHERE project_id=NEW.project_id)>=20
BEGIN SELECT RAISE(ABORT,'photo_limit'); END;
CREATE TRIGGER IF NOT EXISTS gallery_publish_check BEFORE UPDATE ON gallery_projects
WHEN NEW.status='published' AND (length(trim(NEW.title))<3 OR NEW.title='Naujas projektas' OR length(trim(NEW.description))<20 OR NOT EXISTS(SELECT 1 FROM gallery_images WHERE id=NEW.cover_image_id AND project_id=NEW.id))
BEGIN SELECT RAISE(ABORT,'publication_incomplete'); END;
CREATE TRIGGER IF NOT EXISTS gallery_insert_draft BEFORE INSERT ON gallery_projects
WHEN NEW.status<>'draft'
BEGIN SELECT RAISE(ABORT,'create_draft_first'); END;
CREATE TRIGGER IF NOT EXISTS gallery_delete_cover BEFORE DELETE ON gallery_images
WHEN EXISTS(SELECT 1 FROM gallery_projects WHERE id=OLD.project_id AND cover_image_id=OLD.id)
BEGIN
 UPDATE gallery_projects SET
  cover_image_id=(SELECT id FROM gallery_images WHERE project_id=OLD.project_id AND id<>OLD.id ORDER BY sort_order,created_at LIMIT 1),
  status=CASE WHEN (SELECT count(*) FROM gallery_images WHERE project_id=OLD.project_id AND id<>OLD.id)=0 THEN 'draft' ELSE status END,
  updated_at=MAX(updated_at+1,CAST(strftime('%s','now') AS INTEGER)*1000)
 WHERE id=OLD.project_id;
END;

CREATE UNIQUE INDEX IF NOT EXISTS gallery_published_title ON gallery_projects(lower(title)) WHERE status='published';
