// This site's configuration (resolved as "@site/config"): site.config.json checked against the shared schema.
import { z } from "zod";
import raw from "../site.config.json" with { type: "json" };
import { defineSiteConfig } from "@leadsites/kit/config";
export const { configSchema, siteConfig, publicSettings, runtimeSettings, productionErrors } = defineSiteConfig(raw, z.object({}).strict());
export type SiteConfig = typeof siteConfig;
