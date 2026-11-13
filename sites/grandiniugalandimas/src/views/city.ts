// <head> of a city page.
import { CITIES_DATA } from "@/data/citiesData";
import { SITE, priceSuffix, serviceFacts, schemaOffer, schemaBusiness } from "@/lib/site";
import { isEnabled } from "@/config/business";

export const cityHead = (params: { slug: string }) => {
    const city = CITIES_DATA[params.slug];
    if (!city) {
      return { meta: [{ title: "Puslapis nerastas" }, { name: "robots", content: "noindex" }] };
    }

    const shippingText = isEnabled("shipping")
      ? ` Grandines galite išsiųsti iš ${city.genitive} paštomato.`
      : "";
    const title = `Grandinių galandimas ${city.locative}${isEnabled("shipping") ? " – paštomatu" : ""}${priceSuffix()}`;
    const description = `Grandinių galandimas klientams iš ${city.genitive}.${shippingText} ${serviceFacts()}`.trim();
    const url = `${SITE.url}/miestas/${city.slug}`;

    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "website" },
        { property: "og:locale", content: "lt_LT" },
        { property: "og:url", content: url },
        { property: "og:image", content: SITE.ogImage },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:image", content: SITE.ogImage },
        { name: "geo.region", content: "LT" },
        { name: "geo.placename", content: city.name },
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@graph": [
              schemaBusiness(),
              {
                "@type": "Service",
                name: `Grandinių galandimas ${city.locative}`,
                serviceType: "Grandininio pjūklo grandinių galandimas",
                areaServed: {
                  "@type": "City",
                  name: city.name,
                  address: { "@type": "PostalAddress", addressLocality: city.name, addressCountry: "LT" },
                },
                provider: { "@id": SITE.url + "/#business" },
                ...(schemaOffer() ? { offers: schemaOffer() } : {}),
              },
              {
                "@type": "BreadcrumbList",
                itemListElement: [
                  { "@type": "ListItem", position: 1, name: "Pradžia", item: SITE.url + "/" },
                  { "@type": "ListItem", position: 2, name: city.name, item: url },
                ],
              },
            ],
          }),
        },
      ],
    };
  };
