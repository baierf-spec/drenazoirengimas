import { defineConfig } from "vitest/config";
import { siteAliases } from "@leadsites/kit/aliases";
export default defineConfig({ resolve: { alias: siteAliases(import.meta.dirname) }, test: { include: ["tests/**/*.test.ts"], environment: "node" } });
