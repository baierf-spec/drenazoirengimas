export interface Env {
  ASSETS: Fetcher;
  EMAIL?: SendEmail;
  SITE_ORIGIN?: string;
  ALLOWED_ORIGINS?: string;
  LEADS_ENABLED?: string;
  SEO_INDEXABLE?: string;
  TURNSTILE_SECRET_KEY?: string;
  EMAIL_FROM?: string;
  ADMIN_EMAIL?: string;
  BUSINESS_REPLY_TO?: string;
}
