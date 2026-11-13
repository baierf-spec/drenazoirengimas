# SEO audit — GitHub gallery / direct email mode

2026-10-20: production-mode inspection verifies unique titles/descriptions, lt language, one H1, canonical https://drenazoirengimas.lt URLs, absolute Open Graph metadata, structured data matching content, sitemap/indexability consistency and real 404 routing. Empty gallery remains noindex and outside sitemap; navigation still includes Projektai.

Published GitHub gallery projects become static /projektai/[slug]/ routes, each with title, description, canonical, cover Open Graph image, semantic headings, alt text and BreadcrumbList. Listing becomes indexable only when published content exists. Drafts do not generate routes or sitemap entries. Invalid or duplicate slugs and missing cover images fail the build. Static public files / Git history are public regardless of draft status; no private project/customer images belong in the repository.

`npm run audit:seo` inspects an isolated production-mode build. `node scripts/audit-projects.mjs` temporarily injects isolated test content, builds outside deployment output, checks listing/detail/cover/schema/sitemap and exclusion of drafts, then restores real empty content and deletes fixtures. Test data is never committed/published. `npm run test:built` checks built HTML resources and packaged Worker routes.

A single site.config.json features.indexingEnabled flag now controls static metadata/robots/sitemap and Worker indexing together. Other hosts remain noindex. SITE_AUDIT_MODE is used only inside isolated automated audits, not normal deployment configuration. Current indexing value was imported from the live domain's observed Allow robots and absence of a noindex response header. Google Search Console, Rich Results testing on the actual domain, external crawl, mobile field Core Web Vitals and DNS/HTTPS remain live account/deployment checks.

## Decap integration

Page SEO copy now comes from src/content/seo.json; canonical origins/routes and indexing policy remain protected code/config. Project metadata comes from published project entries. The admin shell and /auth + /callback are noindex and excluded from sitemap; admin code is not loaded on public pages. Current 9 canonical sitemap URLs preserved. FAQ schema derives from the same enabled JSON entries as the visible FAQ. Structured-data claims were not expanded. An isolated build verifies project publication, cover images, BreadcrumbList, listing/detail/sitemap and draft exclusion.
