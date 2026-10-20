import type { Lead } from "../src/lib/validation";
export interface Env {
  ASSETS: Fetcher;
  DB: D1Database;
  PHOTOS: R2Bucket;
  SITE_ORIGIN?: string;
  ALLOWED_ORIGINS?: string;
  LEADS_ENABLED?: string;
  SEO_INDEXABLE?: string;
  TURNSTILE_SECRET_KEY?: string;
  EMAIL?: SendEmail;
  EMAIL_FROM?: string;
  ADMIN_EMAIL?: string;
  BUSINESS_REPLY_TO?: string;
  IP_HASH_SECRET?: string;
  PHOTO_SIGNING_SECRET?: string;
  CUSTOMER_CONFIRMATION?: string;
  GALLERY_ENABLED?: string;
  ACCESS_TEAM_DOMAIN?: string;
  ACCESS_AUD?: string;
  GALLERY_OWNER_EMAILS?: string;
}
export interface LeadRecord {
  id: string;
  created_at: number;
  payload: string;
  photos: string;
  fingerprint: string;
  admin_sent: number;
  customer_sent: number;
  attempts: number;
  next_attempt: number;
  lease_until: number;
}
export type StoredLead = Lead & { consentVersion: string };
