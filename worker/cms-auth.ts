import { SignJWT, jwtVerify } from "jose";
import { siteConfig } from "../shared/site-config";
import cms from "../cms.config.json";
import type { Env } from "./types";
import { constantEqual } from "./security";
const origin = new URL(siteConfig.site.origin).origin;
const cookieName = "__Host-decap-oauth";
const callback = origin + "/callback";
const encoder = new TextEncoder();
const headers = {
  "Cache-Control": "no-store, private",
  "Referrer-Policy": "no-referrer",
  "X-Robots-Tag": "noindex, nofollow",
};
function message(text: string, status: number, clear = false) {
  return new Response(text, {
    status,
    headers: {
      ...headers,
      "Content-Type": "text/plain; charset=utf-8",
      ...(clear
        ? {
            "Set-Cookie": `${cookieName}=; Path=/; Secure; HttpOnly; SameSite=Lax; Max-Age=0`,
          }
        : {}),
    },
  });
}
export function cmsAuthReady(env: Env) {
  return Boolean(
    env.GITHUB_CLIENT_ID &&
    env.GITHUB_CLIENT_SECRET &&
    env.OAUTH_STATE_SECRET &&
    env.OAUTH_STATE_SECRET.length >= 32,
  );
}
function popup(token: string) {
  const nonce = crypto.randomUUID();
  const result = JSON.stringify(
    "authorization:github:success:" +
      JSON.stringify({ token, provider: "github" }),
  ).replace(/</g, "\\u003c");
  const script = `const origin=${JSON.stringify(origin)};const opener=window.opener;if(opener){const handler=(event)=>{if(event.origin!==origin||event.source!==opener||event.data!=="authorizing:github")return;window.removeEventListener("message",handler);opener.postMessage(${result},origin);};window.addEventListener("message",handler);opener.postMessage("authorizing:github",origin);}`;
  return new Response(
    `<!doctype html><html lang="lt"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Prisijungimas prie turinio valdymo</title></head><body><p>Prisijungta. Galite grįžti į turinio valdymo langą.</p><script nonce="${nonce}">${script}</script></body></html>`,
    {
      headers: {
        ...headers,
        "Content-Type": "text/html; charset=utf-8",
        "Set-Cookie": `${cookieName}=; Path=/; Secure; HttpOnly; SameSite=Lax; Max-Age=0`,
        "Content-Security-Policy": `default-src 'none'; script-src 'nonce-${nonce}'; base-uri 'none'; frame-ancestors 'none'; form-action 'none'`,
      },
    },
  );
}
export async function cmsAuth(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  if (url.origin !== origin) return message("Puslapis nerastas.", 404);
  if (request.method !== "GET") return message("Metodas neleidžiamas.", 405);
  const requestOrigin = request.headers.get("Origin");
  if (requestOrigin && requestOrigin !== origin)
    return message("Prisijungimas iš šio puslapio neleidžiamas.", 403);
  if (!cmsAuthReady(env))
    return message(
      "CMS prisijungimas dar nesukonfigūruotas. Savininkas turi prijungti GitHub OAuth nustatymus Cloudflare aplinkoje.",
      503,
    );
  const key = encoder.encode(env.OAUTH_STATE_SECRET!);
  if (url.pathname === "/auth") {
    if (
      url.searchParams.get("provider") !== "github" ||
      url.searchParams.get("site_id") !== new URL(origin).hostname
    )
      return message("Netinkama turinio valdymo svetainė.", 400);
    const state = crypto.randomUUID();
    const verifier = crypto.randomUUID() + crypto.randomUUID();
    const digest = await crypto.subtle.digest(
      "SHA-256",
      encoder.encode(verifier),
    );
    const challenge = btoa(String.fromCharCode(...new Uint8Array(digest)))
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/g, "");
    const session = await new SignJWT({ state, verifier })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuer(origin)
      .setAudience("decap-cms")
      .setIssuedAt()
      .setExpirationTime("10m")
      .sign(key);
    const github = new URL("https://github.com/login/oauth/authorize");
    github.search = new URLSearchParams({
      client_id: env.GITHUB_CLIENT_ID!,
      redirect_uri: callback,
      scope: cms.scope,
      state,
      code_challenge: challenge,
      code_challenge_method: "S256",
      allow_signup: "false",
    }).toString();
    return new Response(null, {
      status: 302,
      headers: {
        ...headers,
        Location: github.href,
        "Set-Cookie": `${cookieName}=${session}; Path=/; Secure; HttpOnly; SameSite=Lax; Max-Age=600`,
      },
    });
  }
  if (url.pathname !== "/callback") return message("Puslapis nerastas.", 404);
  const state = url.searchParams.get("state") || "";
  const code = url.searchParams.get("code") || "";
  const session = request.headers
    .get("Cookie")
    ?.split(";")
    .map((v) => v.trim())
    .find((v) => v.startsWith(cookieName + "="))
    ?.slice(cookieName.length + 1);
  if (!session || !state || !code || code.length > 1024 || state.length > 100)
    return message(
      "Prisijungimas nepatvirtintas. Uždarykite šį langą ir bandykite iš naujo.",
      400,
      true,
    );
  try {
    const { payload } = await jwtVerify(session, key, {
      algorithms: ["HS256"],
      issuer: origin,
      audience: "decap-cms",
      maxTokenAge: "10m",
    });
    if (
      typeof payload.state !== "string" ||
      !constantEqual(state, payload.state) ||
      typeof payload.verifier !== "string"
    )
      return message("Prisijungimo patikra nepavyko.", 400, true);
    const exchange = await fetch(
      "https://github.com/login/oauth/access_token",
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          client_id: env.GITHUB_CLIENT_ID,
          client_secret: env.GITHUB_CLIENT_SECRET,
          code,
          redirect_uri: callback,
          code_verifier: payload.verifier,
        }),
        signal: AbortSignal.timeout(10000),
      },
    );
    if (!exchange.ok)
      return message(
        "GitHub prisijungimas laikinai nepasiekiamas. Bandykite dar kartą.",
        502,
        true,
      );
    const data = (await exchange.json()) as {
      access_token?: string;
      token_type?: string;
      error?: string;
    };
    if (!data.access_token || data.error || data.token_type !== "bearer")
      return message(
        "GitHub nepatvirtino prisijungimo. Bandykite iš naujo.",
        401,
        true,
      );
    const authHeaders = {
      Authorization: `Bearer ${data.access_token}`,
      Accept: "application/vnd.github+json",
      "User-Agent": "drenazoirengimas-decap",
      "X-GitHub-Api-Version": "2022-11-28",
    };
    const [user, repo] = await Promise.all([
      fetch("https://api.github.com/user", {
        headers: authHeaders,
        signal: AbortSignal.timeout(10000),
      }),
      fetch(`https://api.github.com/repos/${cms.repository}`, {
        headers: authHeaders,
        signal: AbortSignal.timeout(10000),
      }),
    ]);
    if (!user.ok || !repo.ok)
      return message(
        "Ši GitHub paskyra neturi prieigos prie svetainės turinio.",
        403,
        true,
      );
    const permissions = (await repo.json()) as {
      permissions?: { push?: boolean };
    };
    if (permissions.permissions?.push !== true)
      return message(
        "Turinį gali keisti tik šios saugyklos redaktoriai. Kreipkitės į savininką.",
        403,
        true,
      );
    return popup(data.access_token);
  } catch {
    return message(
      "Prisijungimo patikra nepavyko arba pasibaigė jos laikas. Bandykite iš naujo.",
      400,
      true,
    );
  }
}
