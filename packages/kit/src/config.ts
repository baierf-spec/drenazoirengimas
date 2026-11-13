// Shared lead-site configuration: schema, public settings for pages, runtime settings for the Worker.
// Each site passes its own JSON and the schema of its `business` block.
import { z } from "zod";
/** Worker variables that config e-mail fields may point at ("env:NAME"). */
const DEFAULT_ENV = ["EMAIL_FROM", "ADMIN_EMAIL", "BUSINESS_REPLY_TO"] as const;
export function defineSiteConfig<B extends z.ZodObject>(
  raw: unknown,
  business: B,
  options: { emailEnv?: readonly string[] } = {},
) {
  const envRefs = (options.emailEnv ?? DEFAULT_ENV).map((n) => `env:${n}`) as [string, ...string[]];
  const address = z.union([z.email(), z.enum(envRefs)]);
  const configSchema = z
  .object({
    $schema: z.string().optional(),
    site: z
      .object({
        origin: z.url().refine((v) => {
          const u = new URL(v);
          return (
            u.protocol === "https:" &&
            !u.username &&
            !u.password &&
            u.pathname === "/" &&
            !u.search &&
            !u.hash
          );
        }, "site.origin turi būti HTTPS domenas be kelio ar parametrų."),
        name: z.string().min(1).max(120),
        /** "always": /kainos/ (Astro default); "never": /kainos. Must match the URLs Google knows. */
        trailingSlash: z.enum(["always", "never"]).default("always"),
      })
      .strict(),
    contact: z
      .object({
        showPhone: z.boolean(),
        phone: z.string().max(30),
        email: z.union([z.email(), z.literal("")]),
      })
      .strict(),
    privacy: z
      .object({
        controllerName: z.string().max(200),
        controllerAddress: z.string().max(300),
      })
      .strict(),
    turnstile: z.object({ siteKey: z.string().max(100) }).strict(),
    analytics: z
      .object({
        ga4Id: z.string().refine((v) => !v || /^G-[A-Z0-9]+$/.test(v)),
        cloudflareToken: z.string().max(200),
        googleVerification: z.string().max(200),
      })
      .strict(),
    features: z
      .object({
        leadsEnabled: z.boolean(),
        indexingEnabled: z.boolean(),
        referrerAttribution: z.boolean(),
      })
      .strict(),
    business,
    email: z.object({ from: address, to: address, replyTo: address }).strict(),
  })
  .strict();
  type SiteConfig = z.infer<typeof configSchema> & { business: z.infer<B> };
  const siteConfig = configSchema.parse(raw) as SiteConfig;
  function publicSettings(
  config: SiteConfig = siteConfig,
  auditMode?: string,
) {
  return {
    ...config.business,
    origin: new URL(config.site.origin).origin,
    name: config.site.name,
    production: auditMode
      ? auditMode === "production"
      : config.features.indexingEnabled,
    phone:
      config.contact.showPhone && /^\+370\d{8}$/.test(config.contact.phone)
        ? config.contact.phone
        : "",
    email: config.contact.email,
    controller: config.privacy.controllerName,
    controllerAddress: config.privacy.controllerAddress,
    turnstile: config.turnstile.siteKey,
    ga4: config.analytics.ga4Id,
    cloudflareAnalytics: config.analytics.cloudflareToken,
    verification: config.analytics.googleVerification,
    attributionEnabled: config.features.referrerAttribution,
  };
}
  function runtimeSettings(
  env: Record<string, unknown>,
  config: SiteConfig = siteConfig,
) {
  const resolve = (value: string) =>
    value.startsWith("env:")
      ? typeof env[value.slice(4)] === "string"
        ? String(env[value.slice(4)])
        : ""
      : value;
  return {
    origin: new URL(config.site.origin).origin,
    allowedOrigins: [new URL(config.site.origin).origin],
    leadsEnabled: config.features.leadsEnabled,
    indexingEnabled: config.features.indexingEnabled,
    emailFrom: resolve(config.email.from),
    adminEmail: resolve(config.email.to),
    replyTo: resolve(config.email.replyTo),
  };
}
  function productionErrors(config: SiteConfig = siteConfig) {
  const errors = [];
  if (config.contact.showPhone && !/^\+370\d{8}$/.test(config.contact.phone))
    errors.push(
      "contact.phone: įrašykite galiojantį +370 numerį arba išjunkite contact.showPhone",
    );
  if (!config.contact.email) errors.push("contact.email");
  for (const key of ["controllerName", "controllerAddress"] as const)
    if (
      !config.privacy[key] ||
      /\[|REPLACE|PLACEHOLDER/i.test(config.privacy[key])
    )
      errors.push("privacy." + key);
  if (
    !config.turnstile.siteKey ||
    /^[123]x000000/.test(config.turnstile.siteKey)
  )
    errors.push("turnstile.siteKey: reikia tikro viešo rakto");
  return errors;
}
  return { configSchema, siteConfig, publicSettings, runtimeSettings, productionErrors };
}
