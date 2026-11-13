// Referrer origin only (no path, query or credentials); this site's own origin is not "external".
import { externalReferrer as external } from "@leadsites/kit/client/referrer";
export const externalReferrer = (value: string, ownOrigin = "https://drenazoirengimas.lt") => external(value, ownOrigin);
