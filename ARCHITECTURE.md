# Architecture

## Rendering and routing

Astro 7/TypeScript pre-renders complete HTML, metadata and JSON-LD for all content routes. Vanilla TS handles menu, consent and the approved quote/diagnostic/calculator islands. Zod is shared by browser/server form validation and only loaded where needed. No client-rendered content shell or SPA router.

Native Cloudflare Worker runs first for redirects/security and `/api/*`, then delegates content to `ASSETS`. Static Assets force trailing slashes and return real 404 responses. Canonical origin is https://drenazoirengimas.lt; www, HTTP and HTML aliases redirect.

## Intake flow

1. Three quote steps: object, situation/location/photos, contacts/acknowledgement. Email/photos optional.
2. Browser processes photos to ≤1600 px JPEG without original EXIF; client validates before multipart POST.
3. Server checks method, configured Origin, activation/resources, streamed body cap, shared schema, file count/size, MIME/signature.
4. Exact repeated request ID + payload/photo fingerprint returns the stored success. Changed content under the same ID returns 409.
5. New attempts increment a D1 daily HMAC(IP+day) rate key. No raw IP is stored in D1. Turnstile must verify success, allowed hostname and action `lead`.
6. Random private R2 objects are written; D1 inserts atomically. Concurrent losing writes remove their own uploaded objects.
7. Only committed persistence yields success. Browser navigates to `/aciu/`; failure keeps fields in memory and retry uses the same ID.
8. Outbox delivers admin/customer messages using D1 leases and stable delivery correlation IDs.

## Data and limits

`drainage_leads`: UUID, creation, normalized JSON, private photo keys, fingerprint, recipient delivery flags, attempt/retry/lease fields. `drainage_rate_limits`: one-day pseudonymous HMAC key, counter, expiry. No UTM/referrer/query or unnecessary CRM data is stored.

Limit: 10 valid-shape new attempts/day/IP plus Turnstile. Five processed photos, ≤2 MiB each, ≤10 MiB combined; ≤11 MiB total multipart body. Browser input ≤8 MiB/photo before processing. JPEG/PNG/WebP supported; HEIC conversion guidance is explicit. Server uses header/magic-byte checks, not malware scanning or a full server image decoder. Files are served as signed attachments with nosniff. Never make R2 public.

## Delivery and reliability

Success means durable intake, not guaranteed mailbox delivery. Initial delivery uses `waitUntil`; native cron every 15 minutes retries due records with exponential backoff capped at 6 hours. Per-recipient flags prevent repeating one recipient when only the other failed. A 2-minute D1 lease prevents parallel deliveries. Photo link expiry is anchored to creation so retry bodies remain deterministic.

Delivery is at-least-once across provider/network/database failures. Cloudflare Email has no provider idempotency guarantee: a crash after acceptance but before persisting its flag can cause a duplicate on retry. Monitor pending records and actual delivery. No exactly-once guarantee is made.

## Photos and retention

R2 object keys are random and private. HMAC binds key and expiry. Admin attachment links expire 7 days after lead creation; responses are no-store/no-referrer. A holder of a complete signed link can use it until expiry: keep email links confidential.

Native cron deletes current-system leads and referenced photos after 90 days, 50 rows/run; expires rate keys after one day. Add an R2 lifecycle rule for `leads/` at 90 days to remove orphaned uploads. Mailbox copies and legacy data require separate controller retention. Sites review hosting does not automatically execute Wrangler cron: use native Cloudflare for production maintenance.

## Consent and privacy

Optional analytics are absent until opt-in. Choice is stored 180 days; tool context only in session storage, cleared on submission. Withdrawal stops events, expires first-party GA cookies and reloads. Already collected provider data follows account settings.

GA page views use origin/path without query strings. Analytics properties are whitelisted; names, emails, phones, notes and filenames are excluded. Disable Enhanced Measurement forms, user-provided data, Signals and unreviewed marketing integrations in GA.

Production preflight requires real controller/contact details. Controller must validate actual recipients, processing agreements, legal bases, international transfers, operational coverage and mailbox retention. Runtime fails closed when credentials/bindings are absent.

## Security and portability

Credentials only in runtime bindings, never public variables. API no-store; HTTPS HSTS; nosniff, referrer restrictions and vendor-constrained CSP. Static Astro scripts currently require CSP `unsafe-inline`; no user-submitted HTML is executed. Email is plain text. No bodies, provider response contents, raw IPs or tokens are logged.

Existing Git history/Site identity is retained. Previous head: `8bb3da7fea9f17bb14832f11efdf80ca1530ad01`. Framework migrated from Vinext to the requested Astro architecture. The legacy `leads` table is untouched; new tables are namespaced. `migrations/` serves native Cloudflare; `drizzle/` mirrors for Sites.

Build outputs: native assets `dist/client`; extra Sites compatibility Worker `dist/server/index.js`. Lockfile/source/tests reproduce both without account credentials. No authenticated admin was approved; do not expose D1/R2 controls publicly.

## SEO registry and publication gates

`src/data/pages.ts` centralizes unique titles/descriptions and indexability for 14 HTML routes (9 intended production-indexable). Base generates canonical/OG/WebPage and robots metadata; sitemap uses the same registry. Utility flows and the unverified-project page remain noindex. FAQs and JSON-LD share one data source. `src/data/locations.ts` is empty: reviewed coverage and evidence are required before any local page generation. Human review remains essential.

Build-time `PUBLIC_SITE_MODE=production` permits static indexability. Runtime `SEO_INDEXABLE=true` additionally permits canonical-host indexing, production robots and sitemap; every other host is forced noindex with deny robots and empty sitemap. `LEADS_ENABLED` only gates intake, independently. Both flags default false. Production HTML is inspected in an isolated build by `npm run audit:seo`, without deploying or enabling the service. The default dist artifact remains the private preview.

The native SVG technical section has explicit dimensions, labelled elements and scoped styles; it is an illustration, not engineering advice. Confirmation HTML is neutral without prior confirmed intake. Client GA commands use the official arguments queue and sanitize configured page/referrer URLs.

## Dynamic gallery (2026-10-20)

Static-first routing remains. Worker handles `/gallery-manager*`, `/api/gallery*`, `/projektai/*`, `/projektu-nuotraukos/*` and dynamic sitemap before Static Assets. Listing/detail HTML reuses the pre-rendered projects layout. All user-authored text is escaped; dynamic canonical and social metadata use the apex production origin. Unpublished rows/photos are inaccessible publicly. Dynamic responses and photo routes are no-store to avoid stale visibility after unpublishing; do not override with cache-everything.

The private interface validates Cloudflare Access RS256 JWT issuer/audience/expiry/email with jose and a server-side exact-email list; same-origin writes add CSRF protection. No passwords, admin users, roles or settings UI. GALLERY_ENABLED defaults false, gracefully preserving the public empty state. D1 tables and private R2 gallery/ prefix are documented in GALLERY_MANAGEMENT.md. Deletion queues allow R2 retry, and draft-first SQL triggers enforce publication prerequisites. The gallery stays separate from lead PII and its 90-day retention.

Owner photos are converted to WebP 480/960/1600 in the browser, including automatic lazy HEIC fallback. Original bytes never enter public storage; server strips optional metadata again and validates header dimensions/container bounds. This is not a full server decoder. R2 keys, image IDs and immutable-after-publication slugs remain account-independent for transfer. Backup restore generates draft inserts, then images, then published status so DB invariants remain active.

Email transport is the native Cloudflare EMAIL send_email binding. No external email API key is required. Customer confirmation defaults off so the verified-owner destination can work without enabling outbound customer delivery. See EMAIL_SETUP.md.
