# drenazoirengimas.lt

Lithuanian drainage lead-generation website built from the supplied design and research. Astro static-first HTML + TypeScript islands + a real Cloudflare Worker, D1 persistence, private R2 photos and isolated Resend transport.

**Activation status:** integration-prepared. Public lead intake remains disabled until real controller/contact information, account resources and remaining browser QA are completed. Preview does not simulate successful production submissions.

## Install and run

Node 24 recommended (minimum 22.13). Use the committed npm lockfile.

```bash
npm ci
cp .env.example .env
npm run dev
```

Astro UI runs at http://localhost:4173; its development server does not execute the Worker API. Full-stack local testing uses ignored `.dev.vars` for server secrets, local D1 and Wrangler:

```bash
npm run build
npm run db:migrate:local
npm run dev:worker
```

Use Wrangler's returned localhost origin in local `SITE_ORIGIN` and `ALLOWED_ORIGINS`. Only local testing may use Turnstile test credentials and controlled mailboxes.

## Build and verify

```bash
npm run check
npm run deploy:dry-run
```

`check` runs lint, Astro/TypeScript checks, build, isolated production SEO build, Vitest and the built-HTML crawl. `npm test` alone requires a prior `npm run build` and `npm run audit:seo` (gallery tests inspect production-mode HTML). API tests run the real SQL migration in memory and mock external Turnstile/email requests. DOM tests execute actual scripts against generated pages; they are not browser layout tests.

`npm run audit:seo` creates an isolated production-mode HTML build in ignored `.audit-production` and verifies the metadata/schema/sitemap map (report in ignored `.audit-results/seo.json`). It does not activate intake or bypass the deployment preflight.

`npm run build` uses PUBLIC_SITE_MODE (preview by default) to create the static artifact. `npm run build:production` first validates real public configuration. `npm run deploy` runs that gate then the official Wrangler deployment.

## Source map

- `src/pages`, `layouts`, `components`, `styles`: pre-rendered content and approved visual system.
- `src/scripts`: menu, consent, quote, diagnostic, estimator; no SPA.
- `src/lib`: shared validation, calculations, analytics event whitelist.
- `worker`: API, secure photo download, durable email outbox, retention.
- `migrations`: native D1 SQL. `drizzle`: matching Sites migration artifact.
- `scripts`: preflight, asset optimization, build adapter, link/SEO crawl.
- `docs/spec`: approved board, recovered research, decisions and image sources.

See [ARCHITECTURE.md](ARCHITECTURE.md), [DEPLOYMENT.md](DEPLOYMENT.md), [QA.md](QA.md), [SEO_AUDIT.md](SEO_AUDIT.md), [SEO_CONTENT_PLAN.md](SEO_CONTENT_PLAN.md) and [GEO_STRATEGY.md](GEO_STRATEGY.md).

## Configuration

`.env.example` lists public build settings and server-only configuration. `PUBLIC_*` values are embedded in HTML/JS; never put secrets there. Use Cloudflare Secrets or ignored local `.dev.vars` for provider keys and signing secrets. Rebuild after changing public settings.

Real phone buttons appear only with a valid `PUBLIC_PHONE`; otherwise the photo action is used. No legal identity, ratings, reviews, certificates or completed projects are fabricated. Lithuania coverage refers to enquiries; actual availability is confirmed individually. City/detail project pages are withheld until unique evidence exists.

Analytics configuration: optional `PUBLIC_GA4_ID`, `PUBLIC_CF_ANALYTICS_TOKEN`, `PUBLIC_GOOGLE_SITE_VERIFICATION`. Trackers load only after opt-in. Events: `phone_click`, `quote_started`, `quote_submitted`, `photo_uploaded`, `diagnostic_started`, `diagnostic_completed`, `cost_estimator_completed`, `primary_cta_click`. No contacts, free text, filenames or query strings enter analytics. Disable GA4 automatic form measurement/user-provided data collection.

Email configuration: verified `EMAIL_FROM`, `ADMIN_EMAIL`, `BUSINESS_REPLY_TO`, native `EMAIL` send binding; customer confirmation disabled by default; enable only after configuring Cloudflare outbound delivery to external customers. Admin Reply-To uses customer email when supplied; customer Reply-To uses business email. Delivery failures keep intake durable and schedule retries. Transport is isolated in `worker/email.ts`.

## Deployment outputs

Native Cloudflare: Worker `worker/index.ts`, assets `dist/client`, `wrangler.jsonc`. Build `npm run build:production`, deploy `npx wrangler deploy`. No SSR adapter is required for pre-rendered Astro pages.

The build also creates `dist/server/index.js` for the existing private ChatGPT Site. This compatibility bundle embeds the same pages/assets; native Cloudflare uses Static Assets instead. `.openai/hosting.json` retains the existing Site identity and Git history. The legacy `leads` database table is untouched.

Images: responsive AVIF/WebP hero, explicit dimensions, lazy card photos; Manrope is self-hosted. `npm run optimize:images` recreates image outputs. AI illustrations are not alleged project evidence. Calculator assumptions are visible; diagnostic does not substitute for site assessment.

Before real intake: complete the exact activation steps and outstanding checks in DEPLOYMENT.md/QA.md. Credentials, DNS connection and real-browser/CWV results are not claimed complete.

SEO activation requires both build-time `PUBLIC_SITE_MODE=production` and runtime `SEO_INDEXABLE=true` on the canonical host. Keep both gates in preview until QA completes. Runtime `LEADS_ENABLED` is independent so maintenance does not accidentally deindex an active site. Production sitemap contains 9 intended indexable URLs; preview sitemap is empty.

## Owner gallery

See [GALLERY_MANAGEMENT.md](GALLERY_MANAGEMENT.md) for Access OTP, owner email, D1/R2 setup, backups and transfer. `/gallery-manager/` is a single owner-only content editor. It fails closed until `GALLERY_ENABLED`, Access configuration and account bindings are provided. Published project listing/detail/image routes and sitemap are rendered by Worker without a rebuild. Default gallery is intentionally empty; no sample projects are seeded. Native gallery migration is in `migrations/0002_gallery.sql`; it is not auto-applied by the Sites review artifact. No new paid/account resources were created.

HEIC fallback is lazy and owner-only; it is not a dependency of the public landing page's initial JS. See THIRD_PARTY_NOTICES.md. The large decoder build warning is expected for this isolated lazy module, not hidden by raising global limits.
