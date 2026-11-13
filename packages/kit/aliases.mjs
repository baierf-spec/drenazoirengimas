// The "@site/*" slots the kit imports from: each site fills them with its own modules.
// Used by astro.config.mjs, vitest.config.ts and the Worker bundler; wrangler.jsonc lists the same.
import { existsSync } from "node:fs";
import { resolve } from "node:path";
export function siteAliases(siteDir) {
  return {
    "@site/config": resolve(siteDir, "shared/site-config.ts"),
    "@site/lead": resolve(siteDir, "worker/site.ts"),
    // Sites without Decap CMS get an empty config (no /auth, /callback routes).
    "@site/cms": existsSync(resolve(siteDir, "cms.config.json"))
      ? resolve(siteDir, "cms.config.json")
      : resolve(import.meta.dirname, "no-cms.json"),
  };
}
