export interface Env {
  ASSETS: Fetcher;
  EMAIL?: SendEmail;
  TURNSTILE_SECRET_KEY?: string;
  EMAIL_FROM?: string;
  ADMIN_EMAIL?: string;
  BUSINESS_REPLY_TO?: string;
}
