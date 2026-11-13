# Architecture

Current mode: static Astro SEO website + a small Cloudflare Worker with native EMAIL binding. Content is managed in GitHub. No D1, R2, Access application, database migration or cron is required. This replaces the former cloud gallery/outbox architecture as requested on 2026-10-20.

Astro renders semantic HTML, local optimized assets, canonical metadata and sitemap. Public project definitions are validated at build time in src/lib/projects.ts, compiled from src/content/projects/*.json by scripts/prepare-content.mjs. Only published projects generate /projektai/[slug]/ pages and sitemap entries. Listing remains an intentional empty state until real owner content exists. Existing visual design and navigation are preserved.

POST /api/leads validates method, Origin, multipart size, shared Zod fields, honeypot, privacy acknowledgement, photo MIME/signatures and Cloudflare Turnstile hostname/action. It waits for native EMAIL.send() acceptance before returning 201. Photos are resized / canvas-encoded in the browser, validated server-side and attached as binary email parts, with server-generated safe filenames. They are never placed in GitHub, public assets, D1 or R2. Maximum five files, 2 MiB each and 3 MiB combined keeps base64 MIME below the conservative 5 MiB Email Service ceiling. No client confirmation email is sent in this owner-only mode.

EMAIL.send acceptance is not proof of final Inbox delivery. Failure returns 503, retains form fields in the browser and prompts retry with renewed Turnstile. There is no durable queue or unattended retry. A bounded in-memory ten-minute request hash / promise map coalesces concurrent matching submissions within one Worker isolate. Changed content for the same request ID returns 409. Per-isolate hashed-IP hourly counters supplement Turnstile; these protections reset on eviction/redeploy and do not guarantee global rate limiting or exactly-once delivery. A network failure after provider acceptance can lead to a duplicate on retry from another isolate. Correlate email using the request number.

No form contents, IPs, email addresses, photos or provider response bodies are logged by application code. Cloudflare and the destination mail provider apply their own operational policies. In-memory counters hold only digests/counts; email and attachments live in the owner's mailbox according to the owner's retention policy. Public gallery assets are intentionally public and can remain in Git history even after removal.

Analytics events: phone_click, quote_started, quote_submitted, photo_uploaded, diagnostic_started, diagnostic_completed, cost_estimator_completed, primary_cta_click. GA4 and Cloudflare analytics are loaded only after opt-in. No form PII is sent to analytics. No actual legal identity, destination email or credentials are invented.

## Central configuration (2026-10-20)

site.config.json is the authoritative business configuration for static Astro and the Worker. shared/site-config.ts validates it and returns separate public/runtime projections. site.config.schema.json supports editor validation. Public settings do not expose notification addresses. No PUBLIC_* or old runtime flag overrides are read. features.indexingEnabled drives both generated metadata/robots/sitemap and Worker host indexing; audit mode is an isolated test-only override. Email addresses are literals or explicit env: references to optional private fields. TURNSTILE_SECRET_KEY is always external. Wrangler keep_vars preserves existing private Text addresses during migration. See CONFIGURATION.md for exact cleanup and transfer steps.

## Decap CMS

The admin-only Decap 3.17.1 app uses GitHub backend and the existing Worker /auth + /callback OAuth endpoints. HS256 expiring state cookie, PKCE S256, canonical origin restriction and repository push permission protect the exchange. Secrets stay in Cloudflare; protected repository/branch settings are cms.config.json. Public copy lives in src/content JSON and canonical business settings remain site.config.json. See CMS_SETUP.md for exact file ownership and transfer. No new service, storage binding or database was introduced.

Images are reduced in the admin browser (HEIC lazy conversion), validated again and rendered as 480/960/1600 WebP during builds. Only referenced published/SEO variants are deployed. The source repository/history remains public. Generated manifests and admin config are reproducible build artifacts, not duplicate editable sources. Client lead images still travel only as email attachments.
