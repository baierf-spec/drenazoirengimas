import { defineConfig } from "astro/config";
import settings from "./site.config.json" with { type: "json" };
export default defineConfig({
  server: { host: "0.0.0.0", port: 4173 },
  site: settings.site.origin,
  output: "static",
  trailingSlash: "always",
  build: { inlineStylesheets: "auto" },
  image: { service: { entrypoint: "astro/assets/services/sharp" } },
  vite: {
    server: { allowedHosts: ["terminal.local"] },
    build: { sourcemap: false },
  },
});
