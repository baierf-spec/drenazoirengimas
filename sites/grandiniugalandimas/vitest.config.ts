import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";
import { siteAliases } from "@leadsites/kit/aliases";
export default defineConfig({
  resolve: { alias: { ...siteAliases(import.meta.dirname), "@": fileURLToPath(new URL("./src", import.meta.url)) } },
  test: { include: ["tests/**/*.test.{ts,tsx}"], environment: "node" },
});
