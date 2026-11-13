# LeadHub lead sites

All lead sites that LeadHub rents out, in one repository and on one technology:
**Astro (static HTML) + one Cloudflare Worker per site**.

```
packages/kit/            shared runtime, identical for every site
  src/config.ts          site.config.json schema, public + runtime settings
  src/worker/            request routing, security headers, enquiry form API, LeadHub link,
                         e-mail delivery, GA4 Measurement Protocol, Turnstile, Decap CMS login
  src/client/            browser scripts: LeadHub tenant card + gallery, consent/analytics,
                         referrer attribution
  aliases.mjs            the "@site/*" slots each site fills
sites/<site>/            one folder per site: its own design, pages, content and form
docs/                    architecture and porting guide
```

Each site keeps its own look. What every site must do the same way (LeadHub tenant contacts and
photos, where enquiries go, security, analytics consent) lives once in `packages/kit`.

## Work on a site

```
npm install                       # once, at the repository root
cd sites/drenazoirengimas
npm run dev                       # Astro dev server
npm run check                     # lint, types, build, SEO audit, tests
npm run deploy                    # production build + wrangler deploy
```

## Sites

| Site | Folder | Status |
|---|---|---|
| drenazoirengimas.lt | `sites/drenazoirengimas` | moved (pilot) |
| kelmunaikinimas.lt | — | TanStack Start, to be moved |
| pusuformavimas.lt | — | TanStack Start, to be moved |
| grandiniugalandimas.lt | `sites/grandiniugalandimas` | moved (Astro + React islands) |
| sklypolyginimas.lt | — | plain JS, to be moved |

See `docs/ARCHITECTURE.md` and `docs/PORTING.md`.
