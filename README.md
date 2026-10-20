# drenazoirengimas.lt

Lithuanian drainage lead-generation website: Astro, TypeScript, static SEO pages, responsive design, calculator/diagnostic, optional consent-gated analytics and Cloudflare Worker email intake.

```bash
npm ci
npm run dev
npm run check
npm run deploy:dry-run
```

Use Node 24. `check` runs lint, Astro/TypeScript, build, production-mode SEO inspection, Vitest and built HTML/internal link/packaged Worker checks. API tests mock Turnstile and the native Cloudflare EMAIL binding. They do not prove actual Inbox delivery. `npm run build:production` additionally requires real public configuration from .env.example / build variables.

No D1, R2, database migration or cloud CMS is required. Client enquiries are sent synchronously to the owner's verified destination with photo attachments. No automatic customer email. The page retains input on email error; there is no durable retry queue. Duplicate and rate protection in Worker memory is best-effort per isolate, supplemented by mandatory Turnstile.

Projects remain in main navigation and render an intentional Lithuanian empty state until real projects are supplied. Manage `src/data/projects.json` and optimized photos through GitHub; a successful build updates listing, detail routes and sitemap. No fictional projects or testimonials are provided.

- [DEPLOYMENT.md](DEPLOYMENT.md): Workers Builds, domain, environment configuration and activation.
- [EMAIL_SETUP.md](EMAIL_SETUP.md): Lithuanian owner email setup.
- [GALLERY_MANAGEMENT.md](GALLERY_MANAGEMENT.md): GitHub project/photo management and transfer.
- [ARCHITECTURE.md](ARCHITECTURE.md): data flow, security, limits and reliability tradeoffs.
- [QA.md](QA.md), [SEO_AUDIT.md](SEO_AUDIT.md): checks and outstanding real-account verification.

Optional public analytics configuration: PUBLIC_GA4_ID, PUBLIC_CF_ANALYTICS_TOKEN, PUBLIC_GOOGLE_SITE_VERIFICATION. Events: phone_click, quote_started, quote_submitted, photo_uploaded, diagnostic_started, diagnostic_completed, cost_estimator_completed, primary_cta_click. No PII is sent to analytics; trackers load only after consent. Never commit .env, .dev.vars, credentials, customer information or private enquiry photos.

## Public phone visibility

`PUBLIC_SHOW_PHONE=false` is the default: all public phone numbers and `tel:` CTAs are hidden, with existing photo/enquiry actions in their place. Customer phone inputs remain required. To show the business phone, set **build** variable `PUBLIC_SHOW_PHONE=true` and a valid `PUBLIC_PHONE`, then rebuild. No number is required by production preflight while visibility is off.

## Lead email and source

Notifications have HTML and plain-text versions: contacts, location, property/problem, timing, optional comment, photo attachments and source domain. Technical IDs stay in the delivery header, outside the visible message. First-entry attribution uses the existing analytics consent, only an external origin, and per-tab session storage up to 24 hours. No full referrer path, query, fragment, UTM or search term is saved. No source storage before consent; withdrawal clears it. Source may be unknown and is untrusted visitor metadata, not proof of a particular campaign/conversion.
