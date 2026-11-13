import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";
import { fileURLToPath } from "node:url";
import settings from "./site.config.json" with { type: "json" };
import { siteAliases } from "@leadsites/kit/aliases";

// URLs without a trailing slash (/kainos), exactly as Google has indexed them.
export default defineConfig({
  site: settings.site.origin,
  output: "static",
  trailingSlash: "never",
  build: { format: "file", inlineStylesheets: "auto" },
  integrations: [react()],
  vite: {
    plugins: [tailwindcss()],
    resolve: { alias: { ...siteAliases(import.meta.dirname), "@": fileURLToPath(new URL("./src", import.meta.url)) } },
    build: { sourcemap: false },
    // Workspace-hoisted CommonJS React must be pre-bundled for the dev server.
    optimizeDeps: { include: ["react", "react-dom", "react-dom/client", "react/jsx-runtime", "lucide-react"] },
  },
});
