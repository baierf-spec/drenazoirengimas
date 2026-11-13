import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
const names = execFileSync("git", ["ls-files", "-z"], { encoding: "utf8" })
  .split("\0")
  .filter(Boolean);
const forbidden = names.filter(
  (name) =>
    /^(?:\.env(?:\..+)?|\.dev\.vars(?:\..+)?)$/.test(name) &&
    name !== ".env.example",
);
const hits = [];
for (const name of names) {
  if (!/\.(?:ts|tsx|js|mjs|json|jsonc|md|yml|yaml|env|example)$/.test(name))
    continue;
  let value;
  try {
    value = readFileSync(name, "utf8");
  } catch {
    continue;
  }
  if (
    /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----|\b(?:ghp_|github_pat_|sk-proj-)[A-Za-z0-9_-]{20,}|\b(?:RESEND_API_KEY|TURNSTILE_SECRET_KEY)[\t ]*=[\t ]*[^\s#]{8,}/.test(
      value,
    )
  )
    hits.push(name);
}
if (forbidden.length || hits.length) {
  console.error("Potential credential files detected:", [
    ...forbidden,
    ...hits,
  ]);
  process.exit(1);
}
console.log(
  `Secret-pattern scan passed for ${names.length} tracked paths. Pattern scan complements review; it is not a guarantee against every secret format.`,
);
