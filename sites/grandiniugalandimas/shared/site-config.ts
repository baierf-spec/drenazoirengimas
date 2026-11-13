// This site's configuration (resolved as "@site/config"): site.config.json checked against the shared schema.
// Business data (prices, cities, texts) lives in src/config/business.ts.
import { z } from "zod";
import raw from "../site.config.json" with { type: "json" };
import { defineSiteConfig } from "@leadsites/kit/config";
export const { configSchema, siteConfig, publicSettings, runtimeSettings, productionErrors } = defineSiteConfig(
  raw,
  z.object({}).strict(),
  { emailEnv: ["LEAD_FROM_EMAIL", "LEAD_RECIPIENT_EMAIL"] },
);
export type SiteConfig = typeof siteConfig;
