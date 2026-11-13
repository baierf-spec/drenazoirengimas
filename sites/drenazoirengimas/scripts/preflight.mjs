import { productionErrors, siteConfig } from "../shared/site-config.ts";
const errors = productionErrors();
if (errors.length) {
  console.error(
    "Production activation blocked. Configure site.config.json: " +
      errors.join(", "),
  );
  process.exit(1);
}
console.log(
  "site.config.json validated. Runtime still needs EMAIL binding, TURNSTILE_SECRET_KEY and any explicitly referenced private email values.",
);

const references = [
  ...new Set(
    Object.values(siteConfig.email)
      .filter((v) => v.startsWith("env:"))
      .map((v) => v.slice(4)),
  ),
];
console.log(
  "Private email references: " +
    (references.length
      ? references.join(", ")
      : "none; all addresses are defined in site.config.json"),
);
