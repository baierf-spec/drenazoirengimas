import { afterEach, expect, it, vi } from "vitest";
import { SignJWT } from "jose";
import { cmsAuth } from "../worker/cms-auth";
import { handleRequest } from "../worker";
import { fixture } from "./fixtures";
const origin = "https://drenazoirengimas.lt";
const makeEnv = () => ({
  ...fixture().env,
  GITHUB_CLIENT_ID: "test-client",
  GITHUB_CLIENT_SECRET: "test-secret",
  OAUTH_STATE_SECRET: "only-for-unit-tests-32-characters-long",
});
const req = (path: string, headers: HeadersInit = {}) =>
  new Request(origin + path, { headers });
afterEach(() => vi.unstubAllGlobals());
async function begin() {
  const env = makeEnv();
  const start = await cmsAuth(
    req("/auth?provider=github&site_id=drenazoirengimas.lt"),
    env,
  );
  return {
    env,
    state: new URL(start.headers.get("Location")!).searchParams.get("state")!,
    cookie: start.headers.get("Set-Cookie")!.split(";")[0],
  };
}
it("fails closed when OAuth secrets are missing", async () =>
  expect((await cmsAuth(req("/auth"), fixture().env)).status).toBe(503));
it("rejects foreign hosts, origins, providers, site IDs and methods", async () => {
  const env = makeEnv();
  expect(
    (await cmsAuth(new Request("https://preview.example/auth"), env)).status,
  ).toBe(404);
  expect(
    (
      await cmsAuth(
        req("/auth?provider=github&site_id=drenazoirengimas.lt", {
          Origin: "https://evil.test",
        }),
        env,
      )
    ).status,
  ).toBe(403);
  for (const path of [
    "/auth?provider=gitlab&site_id=drenazoirengimas.lt",
    "/auth?provider=github&site_id=evil.test",
  ])
    expect((await cmsAuth(req(path), env)).status).toBe(400);
  expect(
    (await cmsAuth(new Request(origin + "/auth", { method: "POST" }), env))
      .status,
  ).toBe(405);
});
it("starts fixed-scope GitHub OAuth with signed HttpOnly state and PKCE", async () => {
  const r = await cmsAuth(
    req(
      "/auth?provider=github&site_id=drenazoirengimas.lt&scope=repo&redirect_uri=https://evil.test",
    ),
    makeEnv(),
  );
  const u = new URL(r.headers.get("Location")!);
  expect(u.origin).toBe("https://github.com");
  expect(u.searchParams.get("scope")).toBe("public_repo");
  expect(u.searchParams.get("redirect_uri")).toBe(origin + "/callback");
  expect(u.searchParams.get("code_challenge_method")).toBe("S256");
  expect(u.searchParams.get("code_challenge")).toHaveLength(43);
  for (const flag of ["Secure", "HttpOnly", "SameSite=Lax", "Max-Age=600"])
    expect(r.headers.get("Set-Cookie")).toContain(flag);
});
it("does not exchange a code for missing, tampered or mismatched state", async () => {
  const { env, cookie, state } = await begin();
  const fetcher = vi.fn();
  vi.stubGlobal("fetch", fetcher);
  for (const c of ["", cookie + "bad"])
    expect(
      (
        await cmsAuth(
          req("/callback?code=test&state=" + state, { Cookie: c }),
          env,
        )
      ).status,
    ).toBe(400);
  expect(
    (
      await cmsAuth(
        req("/callback?code=test&state=other", { Cookie: cookie }),
        env,
      )
    ).status,
  ).toBe(400);
  expect(fetcher).not.toHaveBeenCalled();
});
it("rejects expired state before calling GitHub", async () => {
  const env = makeEnv();
  const signed = await new SignJWT({ state: "old", verifier: "v" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuer(origin)
    .setAudience("decap-cms")
    .setIssuedAt(Math.floor(Date.now() / 1000) - 1000)
    .setExpirationTime(Math.floor(Date.now() / 1000) - 100)
    .sign(new TextEncoder().encode(env.OAUTH_STATE_SECRET));
  const fetcher = vi.fn();
  vi.stubGlobal("fetch", fetcher);
  expect(
    (
      await cmsAuth(
        req("/callback?code=test&state=old", {
          Cookie: "__Host-decap-oauth=" + signed,
        }),
        env,
      )
    ).status,
  ).toBe(400);
  expect(fetcher).not.toHaveBeenCalled();
});
it("checks repository write permission and delivers a token only to the fixed opener", async () => {
  const { env, state, cookie } = await begin();
  const fetcher = vi
    .fn()
    .mockResolvedValueOnce(
      Response.json({ access_token: "unit-test-token", token_type: "bearer" }),
    )
    .mockResolvedValueOnce(Response.json({ login: "owner" }))
    .mockResolvedValueOnce(Response.json({ permissions: { push: true } }));
  vi.stubGlobal("fetch", fetcher);
  const r = await cmsAuth(
    req("/callback?code=test&state=" + state, { Cookie: cookie }),
    env,
  );
  const html = await r.text();
  expect(r.status).toBe(200);
  expect(html).toContain("authorization:github:success:");
  expect(html).toContain("event.source!==opener");
  expect(html).toContain("event.origin!==origin");
  expect(html).not.toContain('postMessage("*"');
  expect(r.headers.get("Content-Security-Policy")).toContain(
    "script-src 'nonce-",
  );
  expect(r.headers.get("Set-Cookie")).toContain("Max-Age=0");
  expect(r.headers.get("Cache-Control")).toContain("no-store");
  const exchanged = JSON.parse(fetcher.mock.calls[0][1].body);
  expect(exchanged.code_verifier).toHaveLength(72);
});
it("rejects read-only accounts and handles provider failures without exposing tokens", async () => {
  const { env, state, cookie } = await begin();
  vi.stubGlobal(
    "fetch",
    vi
      .fn()
      .mockResolvedValueOnce(
        Response.json({
          access_token: "unit-test-token",
          token_type: "bearer",
        }),
      )
      .mockResolvedValueOnce(Response.json({ login: "viewer" }))
      .mockResolvedValueOnce(Response.json({ permissions: { push: false } })),
  );
  const r = await cmsAuth(
    req("/callback?code=test&state=" + state, { Cookie: cookie }),
    env,
  );
  expect(r.status).toBe(403);
  expect(await r.text()).not.toContain("unit-test-token");
  vi.stubGlobal("fetch", vi.fn().mockRejectedValue(Error("provider error")));
  expect(
    (
      await cmsAuth(
        req("/callback?code=test&state=" + state, { Cookie: cookie }),
        env,
      )
    ).status,
  ).toBe(400);
});
it("isolates CMS CSP/noindex/cache headers from public pages", async () => {
  const f = fixture();
  const r = await handleRequest(req("/admin/"), f.env, f.ctx);
  expect(r.headers.get("X-Robots-Tag")).toBe("noindex, nofollow");
  expect(r.headers.get("Cache-Control")).toBe("no-store");
  expect(r.headers.get("Content-Security-Policy")).toContain(
    "https://api.github.com",
  );
  const publicPage = await handleRequest(req("/"), f.env, f.ctx);
  expect(publicPage.headers.get("Content-Security-Policy")).not.toContain(
    "https://api.github.com",
  );
  const callback = await handleRequest(req("/callback"), makeEnv(), f.ctx);
  expect(callback.status).toBe(400);
});
