import type { LeadhubEnv } from "./leadhub";
export interface Env extends LeadhubEnv {
  ASSETS: Fetcher;
  GITHUB_CLIENT_ID?: string;
  GITHUB_CLIENT_SECRET?: string;
  OAUTH_STATE_SECRET?: string;
  EMAIL?: SendEmail;
  TURNSTILE_SECRET_KEY?: string;
  EMAIL_FROM?: string;
  /** Second sender on another onboarded domain, used when the first one is refused. */
  EMAIL_FROM_FALLBACK?: string;
  ADMIN_EMAIL?: string;
  BUSINESS_REPLY_TO?: string;
  GA_API_SECRET?: string;
}
