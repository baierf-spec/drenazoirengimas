import { createRemoteJWKSet, jwtVerify } from "jose";
import type { Env } from "./types";
const keysets = new Map<string, ReturnType<typeof createRemoteJWKSet>>();
export async function galleryAccess(
  request: Request,
  env: Env,
): Promise<200 | 401 | 403 | 503> {
  if (
    env.GALLERY_ENABLED !== "true" ||
    !env.DB ||
    !env.PHOTOS ||
    !env.ACCESS_TEAM_DOMAIN ||
    !env.ACCESS_AUD ||
    !env.GALLERY_OWNER_EMAILS
  )
    return 503;
  const team = env.ACCESS_TEAM_DOMAIN.replace(/^https:\/\//, "").replace(
    /\/$/,
    "",
  );
  if (!/^[a-z0-9-]+\.cloudflareaccess\.com$/.test(team)) return 503;
  const token = request.headers.get("Cf-Access-Jwt-Assertion");
  if (!token) return 401;
  try {
    let keys = keysets.get(team);
    if (!keys) {
      keys = createRemoteJWKSet(
        new URL(`https://${team}/cdn-cgi/access/certs`),
        { timeoutDuration: 5000 },
      );
      keysets.set(team, keys);
    }
    const { payload } = await jwtVerify(token, keys, {
      issuer: `https://${team}`,
      audience: env.ACCESS_AUD,
      algorithms: ["RS256"],
      requiredClaims: ["exp", "iat", "email"],
      clockTolerance: 5,
    });
    const owners = env.GALLERY_OWNER_EMAILS.split(",")
      .map((v) => v.trim().toLowerCase())
      .filter(Boolean);
    return typeof payload.email === "string" &&
      owners.includes(payload.email.toLowerCase())
      ? 200
      : 403;
  } catch {
    return 401;
  }
}
