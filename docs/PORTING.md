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

## Notes from grandiniugalandimas

- React sites keep their components: Astro renders them to static HTML and hydrates only the
  interactive ones as islands (`client:visible` / `client:load`). Components that talked to each
  other through a parent now use a window event (see `src/islands/Calculators.tsx`).
- Image imports inside React components need `?url` (Astro otherwise passes an image object).
- Hooks that read shared browser state (LeadHub) must render the empty state first, or a late
  island hydrates with different text than the HTML (React error #418).
- Sites without trailing slashes set `site.trailingSlash: "never"`, Astro `build.format: "file"`
  and Workers assets `html_handling: "drop-trailing-slash"`; the kit answers `/page/` with a 301.
- Forms without Turnstile: leave `turnstile.siteKey` empty and export `isBot` (honeypot) from
  `worker/site.ts`.
