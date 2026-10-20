# SEO audit — GitHub gallery / direct email mode

2026-10-20: production-mode inspection verifies unique titles/descriptions, lt language, one H1, canonical https://drenazoirengimas.lt URLs, absolute Open Graph metadata, structured data matching content, sitemap/indexability consistency and real 404 routing. Empty gallery remains noindex and outside sitemap; navigation still includes Projektai.

Published GitHub gallery projects become static /projektai/[slug]/ routes, each with title, description, canonical, cover Open Graph image, semantic headings, alt text and BreadcrumbList. Listing becomes indexable only when published content exists. Drafts do not generate routes or sitemap entries. Invalid or duplicate slugs and missing cover images fail the build. Static public files / Git history are public regardless of draft status; no private project/customer images belong in the repository.

`npm run audit:seo` inspects an isolated production-mode build. `node scripts/audit-projects.mjs` temporarily injects isolated test content, builds outside deployment output, checks listing/detail/cover/schema/sitemap and exclusion of drafts, then restores real empty content and deletes fixtures. Test data is never committed/published. `npm run test:built` checks built HTML resources and packaged Worker routes.

Two production indexing gates remain: build PUBLIC_SITE_MODE=production and runtime SEO_INDEXABLE=true on the canonical apex host. Other hosts stay noindex and return deny robots/empty sitemap. Google Search Console, Rich Results testing on the actual domain, external crawl, mobile field Core Web Vitals and DNS/HTTPS are account/deployment checks, not claimed by build tests. There are no invented projects, city coverage claims, reviews or local business identities.
