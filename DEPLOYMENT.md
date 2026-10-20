# Cloudflare deployment

Current deployment does not require D1, R2, migrations, Access or cron. Existing unused D1 resources may remain in the account; this change does not delete any external data or resources. No paid resource has been created or enabled by this change.

## GitHub and Workers Builds

Repository: https://github.com/baierf-spec/drenazoirengimas , branch main.

- Worker name: drenazoirengimas
- Build command: npm run build:production
- Deploy command: npx wrangler deploy
- Root: repository root
- Node: 24
- Entry: worker/index.ts
- Assets: dist/client, ASSETS binding, run_worker_first=true
- Only external runtime binding: EMAIL (send_email)

Build variables: PUBLIC_SITE_MODE=production, PUBLIC_PHONE (real +370 plus 8 digits), PUBLIC_CONTACT_EMAIL, PUBLIC_CONTROLLER_NAME, PUBLIC_CONTROLLER_ADDRESS, PUBLIC_TURNSTILE_SITE_KEY. Optional PUBLIC_GA4_ID, PUBLIC_CF_ANALYTICS_TOKEN, PUBLIC_GOOGLE_SITE_VERIFICATION. Build preflight rejects missing actual owner details. Rebuild on changes.

Runtime: SITE_ORIGIN=https://drenazoirengimas.lt, ALLOWED_ORIGINS=https://drenazoirengimas.lt, LEADS_ENABLED=false until real delivery tested, SEO_INDEXABLE=false until canonical public launch. Configure TURNSTILE_SECRET_KEY, EMAIL_FROM, ADMIN_EMAIL, BUSINESS_REPLY_TO in Worker secrets/variables. Do not put secret values into PUBLIC_* or GitHub. Old IP_HASH_SECRET / PHOTO_SIGNING_SECRET / customer/Access/gallery variables are no longer used and can be removed from this Worker. See EMAIL_SETUP.md for exact owner steps.

Create a managed Turnstile widget for drenazoirengimas.lt. Public site key goes into build variables, secret into runtime. Client action lead is checked server-side. Do not use test keys in production.

## Verify and deploy

```bash
npm ci
npm run check
npm run check:secrets
npm run deploy:dry-run
npm run build:production
npx wrangler deploy
```

Set runtime flags in wrangler.jsonc when activating; dashboard-only changes must be reconciled with Wrangler to survive future deploys. Production indexing requires both build PUBLIC_SITE_MODE=production and runtime SEO_INDEXABLE=true. Alternate hosts stay noindex, with deny robots and empty sitemap. Server-side errors do not expose provider details.

## Domain

Add Worker Custom Domains for drenazoirengimas.lt and www.drenazoirengimas.lt. The Worker redirects www and HTTP to the HTTPS apex preserving path/query. Use Cloudflare-returned DNS/certificate configuration, not guessed IPs. Preserve existing mail DNS records. Verify both hosts, HTTPS, canonical tags, genuine 404, robots and sitemap. Domain registration / zone membership alone does not attach it to the Worker.

## Gallery and transfer

GALLERY_MANAGEMENT.md describes GitHub content, responsive images, publishing and backups. Every content change triggers a build; there is no private online CMS. Never put private enquiry images into the public repository. Transfer source / assets via GitHub, create a Worker in the new account, reconnect domain and verified mail destination, create new Turnstile keys and set runtime secrets. Stable domain and slugs preserve public URLs. No D1/R2 backup is needed in this mode; mail archives are managed separately by the owner.

## Final live checks

Submit a controlled lead with several photo attachments; verify Inbox, Spam, Reply-To and no public photo URL. Verify challenge failure, email failure/retry, mobile file preparation, duplicate-submit button protection and consent. Run real iOS/Android tests and live performance checks. These account-level tests remain pending until native configuration is active. No actual Inbox result is claimed by mocked tests.

Analytics tools are optional and consent-gated. Use Search Console DNS/meta verification and submit the canonical sitemap after activation. Configure real owner/privacy details before collecting leads.
