# Moving a site into the monorepo

Rule: the site keeps its design and every URL; only the plumbing changes.

1. **Inventory.** List every URL the live site serves (sitemap + crawl), its titles, meta
   descriptions, canonical tags, JSON-LD and redirects. Save the list as the acceptance check.
2. **Pages.** Recreate each route as an Astro page with the same path. React components without
   state become `.astro` components; interactive parts (calculators, galleries) stay small
   islands or plain scripts. Reuse the site's CSS/Tailwind theme as is.
3. **Content.** Move texts to `src/content/*.json` (or Markdown) so they can be edited without
   touching layout.
4. **Form.** Write `worker/site.ts` (`@site/lead`): the site's form schema, limits, e-mail
   content and the contact-free LeadHub summary. The kit does the rest.
5. **Config.** `site.config.json` + `shared/site-config.ts` with the site's `business` schema.
6. **LeadHub.** Mark the tenant card and gallery with the kit's `data-leadhub-*` attributes
   (see `sites/drenazoirengimas/src/components/LeadhubSection.astro`).
7. **Verify.** Every URL from step 1 returns the same status, title, canonical and structured
   data; Lighthouse; the form end to end; the tenant view with a mocked LeadHub config.
8. **Switch.** Point the site's Workers Builds trigger at `sites/<site>`, deploy, then watch
   Search Console for crawl errors for two weeks before the next site.

Order: pilot drenazoirengimas (already Astro) → sklypolyginimas (plain JS, small) →
grandiniugalandimas → pusuformavimas → kelmunaikinimas.
