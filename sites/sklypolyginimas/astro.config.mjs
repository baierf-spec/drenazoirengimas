import { defineConfig } from "astro/config";
import settings from "./site.config.json" with { type: "json" };
import { siteAliases } from "@leadsites/kit/aliases";

// URLs with a trailing slash (/kaina/), exactly as Google has indexed them.
export default defineConfig({
  site: settings.site.origin,
  output: "static",
  trailingSlash: "always",
  build: { format: "directory" },
  vite: { resolve: { alias: siteAliases(import.meta.dirname) }, build: { sourcemap: false } },
});
