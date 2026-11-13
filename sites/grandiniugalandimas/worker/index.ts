// Worker entry: the shared lead-site runtime with this site's config and form plugged in
// through the "@site/*" aliases in wrangler.jsonc.
export { handleRequest, default } from "@leadsites/kit/worker";
