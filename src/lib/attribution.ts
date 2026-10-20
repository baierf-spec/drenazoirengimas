// Only an external HTTP(S) origin; never preserve paths, queries, credentials or fragments.
export function externalReferrer(
  value: string,
  ownOrigin = "https://drenazoirengimas.lt",
): string {
  try {
    const url = new URL(value);
    const own = new URL(ownOrigin);
    if (
      !["https:", "http:"].includes(url.protocol) ||
      url.username ||
      url.password ||
      url.origin.length > 254
    )
      return "";
    if (
      url.hostname.replace(/^www\./, "") === own.hostname.replace(/^www\./, "")
    )
      return "";
    return url.origin;
  } catch {
    return "";
  }
}
