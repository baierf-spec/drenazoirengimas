import { BUSINESS, getPriceRange, isEnabled, priceFromLabel, turnaroundLabel } from "@/config/business";

/** Išvestinės reikšmės iš business.ts – patys duomenys keičiami ten. */
export const SITE = {
  name: BUSINESS.businessName,
  url: (import.meta.env["PUBLIC_SITE_URL"] as string | undefined)?.replace(/\/$/, "") || BUSINESS.websiteUrl,
  email: BUSINESS.email,
  phone: BUSINESS.phone,
  ogImage: BUSINESS.ogImage,
  currency: BUSINESS.pricing.currency,
} as const;

/** Pavadinimo pabaiga su kaina, pvz. " | nuo 3,60 €/vnt.", arba tuščia. */
export const priceSuffix = () => {
  const p = priceFromLabel();
  return p ? ` | ${p}` : "";
};

/** Trumpas aprašymo papildinys apie terminą ir nemokamą siuntimą. */
export function serviceFacts(): string {
  const parts: string[] = [];
  const t = turnaroundLabel();
  if (t) parts.push(`Galandimas ir grąžinimas per ${t} nuo gavimo.`);
  if (isEnabled("freeShipping"))
    parts.push(`Nuo ${BUSINESS.shipping.freeShippingMinimumQuantity} vnt. grąžinimas nemokamas.`);
  if (isEnabled("shipping")) parts.push("Siuntimą mums klientas apmoka atskirai.");
  return parts.join(" ");
}

/** Schema.org pasiūlymas arba undefined, kai kainos paslėptos. */
export function schemaOffer() {
  const r = getPriceRange();
  if (!r) return undefined;
  return {
    "@type": "AggregateOffer",
    lowPrice: r.low,
    highPrice: r.high,
    priceCurrency: SITE.currency,
    description: "Galandimo kaina vienai grandinei pagal kiekį; siuntimas ir grąžinimas skaičiuojami atskirai.",
  };
}

export function schemaBusiness() {
  return {
    "@type": BUSINESS.address ? "LocalBusiness" : "Organization",
    "@id": SITE.url + "/#business",
    name: SITE.name,
    url: SITE.url,
    email: SITE.email,
    ...(SITE.phone ? { telephone: SITE.phone } : {}),
    ...(BUSINESS.legalBusinessName ? { legalName: BUSINESS.legalBusinessName } : {}),
    image: SITE.ogImage,
    areaServed: { "@type": "Country", name: BUSINESS.serviceArea },
    ...(BUSINESS.address ? { address: { "@type": "PostalAddress", addressCountry: "LT", streetAddress: BUSINESS.address, addressLocality: BUSINESS.city } } : {}),
  };
}


