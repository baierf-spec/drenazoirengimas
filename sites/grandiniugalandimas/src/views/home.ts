// <head> of the home page (title, description, canonical, structured data).
import { SITE, schemaBusiness, schemaOffer } from "@/lib/site";
import { BUSINESS, isEnabled } from "@/config/business";

const shippingLabel = isEnabled("shipping") ? " paštu" : "";
const title = `Grandinių galandimas${isEnabled("shipping") ? " | Paštomatu" : ""}${isEnabled("nationwide") ? " visoje Lietuvoje" : ""}`;
const description = isEnabled("shipping")
  ? `Atsiųskite pjūklo grandines galandimui paštomatu. Aiškios kainos ir grąžinimo sąlygos. Siuntimą mums apmokate atskirai. Pirmiausia pateikite užklausą.`
  : `Profesionalus pjūklų grandinių galandimas. Peržiūrėkite kainas ir pateikite užklausą – suderinsime grandinių perdavimą.`;

export const homeHead = () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { property: "og:locale", content: "lt_LT" },
      { property: "og:url", content: SITE.url + "/" },
      { property: "og:image", content: SITE.ogImage },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: SITE.ogImage },
      { name: "geo.region", content: "LT" },
      { name: "geo.placename", content: "Lietuva" },
    ],
    links: [{ rel: "canonical", href: SITE.url + "/" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@graph": [
            schemaBusiness(),
            {
              "@type": "Service",
              "@id": SITE.url + "/#service",
              url: SITE.url + "/",
              name: `Pjūklų grandinių galandimas${shippingLabel}`,
              serviceType: "Grandininio pjūklo grandinių galandimas",
              provider: { "@id": SITE.url + "/#business" },
              areaServed: { "@type": "Country", name: BUSINESS.serviceArea },
              ...(schemaOffer() ? { offers: schemaOffer() } : {}),
            },

          ],
        }),
      },
    ],
  });
