import { readFile } from "node:fs/promises";
// Public build variables only. Server secrets are checked at runtime and configured separately.
try {
  for (const line of (await readFile(".env", "utf8")).split("\n")) {
    const match = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (match && !process.env[match[1]])
      process.env[match[1]] = match[2].replace(/^['"]|['"]$/g, "");
  }
} catch {
  /* CI uses its environment. */
}
const missing = [];
for (const name of [
  "PUBLIC_CONTACT_EMAIL",
  "PUBLIC_CONTROLLER_NAME",
  "PUBLIC_CONTROLLER_ADDRESS",
  "PUBLIC_TURNSTILE_SITE_KEY",
])
  if (!process.env[name]) missing.push(name);
if (process.env.PUBLIC_SITE_MODE !== "production")
  missing.push("PUBLIC_SITE_MODE=production");
if (
  process.env.PUBLIC_TURNSTILE_SITE_KEY?.startsWith("1x000000") ||
  process.env.PUBLIC_TURNSTILE_SITE_KEY?.startsWith("2x000000") ||
  process.env.PUBLIC_TURNSTILE_SITE_KEY?.startsWith("3x000000")
)
  missing.push("real Turnstile site key (test key forbidden)");
if (
  process.env.PUBLIC_SHOW_PHONE === "true" &&
  !/^\+370\d{8}$/.test(process.env.PUBLIC_PHONE || "")
)
  missing.push("valid PUBLIC_PHONE (+370 and eight digits)");
if (
  process.env.PUBLIC_CONTACT_EMAIL &&
  !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(process.env.PUBLIC_CONTACT_EMAIL)
)
  missing.push("valid PUBLIC_CONTACT_EMAIL");
for (const key of ["PUBLIC_CONTROLLER_NAME", "PUBLIC_CONTROLLER_ADDRESS"])
  if (/\[|REPLACE|PLACEHOLDER/i.test(process.env[key] || ""))
    missing.push("real " + key);
if (missing.length) {
  console.error(
    "Production activation blocked. Configure: " + missing.join(", "),
  );
  process.exit(1);
}
console.log(
  "Public production configuration passed. Complete server-secret and end-to-end checks in DEPLOYMENT.md before enabling leads.",
);
