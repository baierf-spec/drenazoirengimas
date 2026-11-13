# Architecture

## One platform, many sites

Every lead site is a static Astro build served by its own Cloudflare Worker. The Worker serves
the HTML from Workers Assets and handles the few dynamic routes:

| Route | What it does |
|---|---|
| `POST /api/leads` | enquiry form: origin check, size and file checks, Turnstile, rate limit, de-duplication, e-mail to the tenant (while rented) or to the owner, contact-free event to LeadHub, GA4 server event |
| `GET /api/leadhub/config` | tenant contacts, gallery and operator for the browser (never the tenant's lead e-mail) |
| `POST /api/leadhub/event` | phone / e-mail click events for LeadHub |
| `/leadhub/gallery/*` | tenant photos, served from the site's own domain |
| `/admin`, `/auth`, `/callback` | Decap CMS and its GitHub login (sites that use it) |
| everything else | static pages; `*.html` and `/index.html` redirect to clean URLs; real 404s |

Security headers (CSP, HSTS, nosniff, frame-ancestors none) and `noindex` on previews, APIs and
errors are applied in one place for all sites.

## The "@site/*" slots

The kit never imports a site directly. It imports three slots that each site fills:

| Slot | Site file | Contents |
|---|---|---|
| `@site/config` | `shared/site-config.ts` | `defineSiteConfig(site.config.json, businessSchema)` |
| `@site/lead` | `worker/site.ts` | form validation, limits, e-mail content, LeadHub summary |
| `@site/cms` | `cms.config.json` | Decap CMS repository and scope |

The same mapping is declared in `packages/kit/aliases.mjs` (Astro, Vitest, esbuild) and in each
site's `wrangler.jsonc` `alias` and `tsconfig*.json` `paths`. Resolution happens at build time,
so there is no runtime cost and no shared mutable state between sites.

## LeadHub

LeadHub decides what a site shows. While a site is rented the Worker receives the tenant's
contacts, gallery and lead e-mail over the `LEADHUB` service binding (cached for a minute, last
known state kept during outages). Without a rental the page shows only the enquiry form and
enquiries go to the owner. Lead events sent to LeadHub never contain names, phones or e-mails.

## Deploy

One Workers Builds trigger per site, root directory `sites/<site>`, build
`npm run build:production`, deploy `npx wrangler deploy`. npm finds the workspace root by itself.
