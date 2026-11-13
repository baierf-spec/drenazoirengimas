// This site's configuration (resolved as "@site/config"): site.config.json checked against the shared schema.
import { z } from "zod";
import raw from "../site.config.json" with { type: "json" };
import { defineSiteConfig } from "@leadsites/kit/config";
const business =
  z
      .object({
        primaryCta: z.string().trim().min(3).max(60),
        serviceAreas: z.array(z.string().trim().min(2).max(100)).min(1).max(6),
        heroArea: z.string().trim().min(3).max(160),
        footerArea: z.string().trim().min(3).max(180),
        footerLines: z.array(z.string().trim().min(1).max(180)).length(2),
        footerDescription: z.string().trim().min(10).max(500),
      })
      .strict();
export const { configSchema, siteConfig, publicSettings, runtimeSettings, productionErrors } = defineSiteConfig(raw, business);
export type SiteConfig = typeof siteConfig;
