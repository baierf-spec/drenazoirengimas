# Deployment and activation

Code is prepared; account resources and native production activation remain deliberately deferred. No new R2/D1/Access application or paid resource was created during the 2026-10-20 gallery pass. Do not treat the Sites review as an authenticated Cloudflare gallery or a connected production domain.

## Documentation verified 2026-10-19

- https://docs.astro.build/en/guides/deploy/cloudflare/
- https://developers.cloudflare.com/workers/framework-guides/web-apps/astro/
- https://developers.cloudflare.com/workers/static-assets/
- https://developers.cloudflare.com/workers/static-assets/routing/static-site-generation/
- https://developers.cloudflare.com/workers/static-assets/binding/
- https://developers.cloudflare.com/turnstile/get-started/server-side-validation/
- https://developers.cloudflare.com/r2/buckets/object-lifecycles/
- Controller privacy review: https://eur-lex.europa.eu/eli/reg/2016/679/oj/eng/

Architecture: fully pre-rendered Astro + separate Worker API. No SSR adapter is necessary. Workers Static Assets and Worker code deploy together via `wrangler deploy`.

## GitHub

Create private `baierf-spec/drenazoirengimas` when signed in. Do not reuse another service's repository. Source is already committed locally; ZIP contains Git history. Keep the Sites remote and add GitHub separately:

```bash
git remote add github https://github.com/baierf-spec/drenazoirengimas.git
git push -u github main
```

Alternatively, after official GitHub CLI authentication: `gh repo create baierf-spec/drenazoirengimas --private --source=. --remote=github --push`. Do not store a token in the repository.

## Cloudflare account resources

Authenticate in the account owning drenazoirengimas.lt, or run `npx wrangler login` in your terminal. No credentials belong in source/chat.

```bash
npm ci
npx wrangler d1 create drenazoirengimas-leads
npx wrangler r2 bucket create drenazoirengimas-private-photos
```

Replace `REPLACE_WITH_D1_DATABASE_ID` in `wrangler.jsonc` with the returned ID. R2 public/r2.dev access must remain OFF. Choose appropriate region/jurisdiction when creating according to controller policy; a Worker region alone does not guarantee EEA-only processing.

```bash
npm run db:migrate:remote
```

Add an R2 lifecycle rule deleting the `leads/` prefix after 90 days (covers orphaned uploads). Native cron is declared every 15 minutes. Existing legacy table is not modified.

## Turnstile

Create a managed widget allowing `drenazoirengimas.lt`. Build with its public site key; configure secret below. Client action is `lead`, checked server-side with hostname. Any staging origin needs separate staging allowlisting. Do not deploy test credentials publicly. Widget loads on the contact step.

## Email and runtime secrets

Use the native Cloudflare Email Service `EMAIL` binding declared by `send_email` in wrangler.jsonc. There is no external email vendor or email API key. Follow [EMAIL_SETUP.md](EMAIL_SETUP.md) for the Lithuanian account-owner guide.

Enable Email Routing for the domain and verify the actual owner destination email. Set `EMAIL_FROM` to a plain sender address on the onboarded domain, `ADMIN_EMAIL` to that verified destination, and `BUSINESS_REPLY_TO` to a monitored inbox or an address forwarded to it. The default binding sends only to verified account destinations. Set a fixed `destination_address` equal to ADMIN_EMAIL for a stricter owner-only binding when configuring this account.

```bash
npx wrangler secret put TURNSTILE_SECRET_KEY
npx wrangler secret put EMAIL_FROM
npx wrangler secret put ADMIN_EMAIL
npx wrangler secret put BUSINESS_REPLY_TO
npx wrangler secret put IP_HASH_SECRET
npx wrangler secret put PHOTO_SIGNING_SECRET
```

Last two: independent cryptographically random secrets, ≥32 characters. Admin receives structured lead + signed photo links. Admin Reply-To uses customer email if present, else business. `CUSTOMER_CONFIRMATION=false` is the safe default for verified-destination sending. Only enable customer confirmations after separately enabling Cloudflare Email Sending for external recipients, verifying the sending domain, checking plan/beta availability and configuring the appropriate sender restriction. No paid plan is enabled by this project. Customer Reply-To uses BUSINESS_REPLY_TO. Cloudflare has no guaranteed provider-level deduplication; the D1 outbox lease and delivery flags reduce duplication, but a crash after send and before flag persistence can cause a retry duplicate.

## Public build settings

| Variable                        | Meaning                                |
| ------------------------------- | -------------------------------------- |
| PUBLIC_SITE_MODE=production     | Indexable static HTML after activation |
| PUBLIC_PHONE                    | Verified real +370 phone               |
| PUBLIC_CONTACT_EMAIL            | Real public/privacy contact            |
| PUBLIC_CONTROLLER_NAME          | Actual responsible entity/person       |
| PUBLIC_CONTROLLER_ADDRESS       | Actual controller contact address      |
| PUBLIC_TURNSTILE_SITE_KEY       | Real public widget key                 |
| PUBLIC_GA4_ID                   | Optional G-… measurement ID            |
| PUBLIC_CF_ANALYTICS_TOKEN       | Optional public beacon token           |
| PUBLIC_GOOGLE_SITE_VERIFICATION | Optional Search Console token          |

Values must be present at BUILD time because pages are pre-rendered; rebuild on changes. Never put secrets in PUBLIC_*.

Runtime vars: `SITE_ORIGIN=https://drenazoirengimas.lt`, `ALLOWED_ORIGINS=https://drenazoirengimas.lt`, `SEO_INDEXABLE=false`, `LEADS_ENABLED=false` through staging. Set `SEO_INDEXABLE=true` only when the canonical production build and final QA are approved; keep it independent of intake maintenance. Production indexing also requires build-time `PUBLIC_SITE_MODE=production`. Preview/noncanonical hosts always return deny robots and an empty sitemap. Enable true only after controller/coverage/privacy approval and end-to-end verification. Required missing integrations produce 503, not simulated success.

## Deploy

```bash
npm run check
npm run deploy:dry-run
npm run build:production
npx wrangler deploy
```

| Setting            | Value                     |
| ------------------ | ------------------------- |
| Build command      | npm run build:production  |
| Deploy command     | npx wrangler deploy       |
| Worker entry       | worker/index.ts           |
| Static assets      | dist/client               |
| Bindings           | DB, PHOTOS, ASSETS, EMAIL |
| Compatibility date | 2026-10-19                |
| Cron               | */15 * * * *              |
| Not found          | 404-page                  |
| HTML               | force-trailing-slash      |

Cloudflare dashboard: Workers & Pages → connect/import Git repository → select private GitHub repository → configure commands, build env, runtime secrets/bindings. Require GitHub Quality checks on main before production deployment. CI has read-only repository permissions; no deploy token. Do not turn on unconditional production auto-deploy without gates/checks.

## Domain / DNS / HTTPS

Canonical is HTTPS apex. Add Worker Custom Domains for `drenazoirengimas.lt` and `www.drenazoirengimas.lt`, so www receives a 301 preserving path/query. Custom-domain setup creates required records and edge certificates: use account-returned values, never a guessed IP/CNAME. Review existing conflicting A/AAAA/CNAME before changing them. Preserve MX/SPF/DKIM records used by email.

Verify HTTPS on both hosts, clean URL redirects and genuine 404. Disable unnecessary public workers.dev exposure or retain code's noncanonical-host noindex. Staging must not redirect its forms into production. Production HTML must be built in production mode; preview remains noindex.

## Analytics / search

Equal-choice opt-in gates GA4/Cloudflare analytics. Disable GA enhanced form measurement, Signals, automatic user data collection and unreviewed marketing integrations. Verify no PII/query values leave the browser. Configure meaningful conversion events from README.

Verify Search Console with DNS or public meta token; submit canonical sitemap and inspect primary URLs after activation. robots permits crawling only with both production indexing gates. Sitemap includes exactly the 9 indexable canonical pages currently approved; it excludes form/diagnostic/thank-you/project-pending/404 pages. `npm run audit:seo` inspects a separate production-mode HTML build and does not activate the domain or bypass `build:production` preflight. Rich Results Test, URL Inspection, live crawl and field CWV require the public deployment and have not been performed here.

## Final account-owner smoke test

360/390/430/768/1024/1440/large desktop, plus iOS Safari/Android Chrome: overflow, navigation, forms, uploads/remove, focus, screen reader smoke, reduced motion, sticky CTA. Test invalid photos, network failure/retry, expired Turnstile, double click, consent denial and withdrawal. Run Lighthouse and measure real field CWV after traffic; no score is pre-claimed.

Submit a marked test lead with photos and controlled customer mailbox. Verify D1, private R2, admin mail, customer confirmation, Reply-To, retry cron, signed expiry, retention/lifecycle. Confirm actual legal/operator text and data-sharing process. These require real credentials.

## Sites review publication

Existing Site ID: `appgprj_6ac3d2ab06f08191a14f43815661a97d`. Its compatibility artifact displays the same website with the existing Site audience preserved; intake and gallery management remain disabled. Native Wrangler cron does not automatically run in Sites. This review publication does not connect the canonical domain or replace native Cloudflare activation.

## Gallery integration — 2026-10-20

The gallery is fully prepared in source but disabled until owner configuration. Read GALLERY_MANAGEMENT.md before activating or transferring. Keep `assets.run_worker_first=true`: the Worker must authorize the manager before serving HTML, including aliases. Do not host dist/client alone as an unprotected static-only production deployment.

1. Provision/choose account-owned D1 `DB` and private R2 `PHOTOS` using the earlier steps. Do not apply a broad 90-day lifecycle to `gallery/`; the existing lead rule must target `leads/` only.
2. Apply `migrations/0002_gallery.sql` via the native migration command. It adds gallery tables/indexes/triggers; existing lead tables remain. This migration is intentionally not added to the Sites review auto-migration journal.
3. Configure **one** self-hosted Cloudflare Access application covering `/gallery-manager*` and `/api/gallery*`, OTP login and an exact owner-email Allow policy. Copy its team domain and AUD. There is no custom password database or developer bypass.
4. Runtime-only variables: `GALLERY_ENABLED=false`, `ACCESS_TEAM_DOMAIN`, `ACCESS_AUD`, `GALLERY_OWNER_EMAILS`. Put actual owner values in the account configuration, not PUBLIC_* or repository. Change to true only after binding/migration/Access tests. Missing configuration produces a protected 503; absent public gallery data leaves the intentional empty page.
5. Check native manager URL, denied email/missing/expired JWT, multi-photo HEIC/JPEG upload, progress/retry, cover/order/alt, publish, edit, unpublish and deletion. Verify public image URL fails immediately after unpublishing and sitemap updates without deploy. Test iPhone/Android with real files; isolated test mocks do not prove actual Access OTP or mobile codecs.
6. Metadata backup/restore helper: `node scripts/gallery-backup.mjs export /private/backup` and `prepare-restore`; R2 objects copied separately. Exact safe migration order, original key preservation and owner-email change are in GALLERY_MANAGEMENT.md.

### Final owner information before domain activation

Fill `PUBLIC_CONTROLLER_NAME`, `PUBLIC_CONTROLLER_ADDRESS`, `PUBLIC_CONTACT_EMAIL`, `PUBLIC_PHONE`, `PUBLIC_TURNSTILE_SITE_KEY` and approve the privacy text/recipients/coverage/prices. These are owner placeholders in configuration/documentation; developer placeholders are no longer displayed as a preparation notice on the privacy page. Do not enable public intake without real identity. An empty controller value is still rejected by `build:production`.

`src/data/price-sources.ts` contains no invented market URLs. The calculator explicitly uses model assumptions and provides an expandable provenance block. Add reviewed source URLs, scope and review dates only when verified; its current date denotes model review, not proof of market tariffs.

At native production launch require both PUBLIC_SITE_MODE=production and SEO_INDEXABLE=true. Published projects then extend the 9 base sitemap URLs with the gallery listing and their detail URLs. Preview remains noindex. No admin/draft URL or photo variant is inserted into sitemap. WWW/HTTP redirects, HTTPS and real DNS still require account-owner validation.
