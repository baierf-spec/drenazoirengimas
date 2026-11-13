/**
 * ============================================================================
 *  VERSLO KONFIGŪRACIJA – vienintelis failas, kurį reikia keisti perimant svetainę.
 * ============================================================================
 *
 * Čia surašyti visi verslo duomenys: pavadinimas, kontaktai, kainos, siuntimas,
 * terminai, paslaugos ir teiginiai. Komponentai (puslapio dalys) duomenis ima iš
 * čia, todėl įprastiems pakeitimams React failų redaguoti nereikia.
 *
 * Taisyklė: jei negalite pažadėti – išjunkite (false). Tada atitinkami tekstai
 * ir kortelės iš svetainės dingsta arba perrašomi neutraliai.
 */

export type PricingMode = "tiers" | "fixed" | "range" | "hidden";

export interface PriceTier {
  /** Grandinių kiekis (rodomas kaip mygtukas, pvz. „4 vnt“). */
  quantity: number;
  /** Bendra galandimo kaina už visą kiekį, EUR. */
  total: number;
  /** Pažymėti kaip populiariausią pasirinkimą. */
  popular?: boolean;
}

export const BUSINESS = {
  // ---------------------------------------------------------------- Įmonė
  /** Prekės ženklas, rodomas svetainėje ir paieškoje. */
  businessName: "Grandinių Galandimas",
  /** Juridinis pavadinimas privatumo politikai. Tuščias = nerodomas. */
  legalBusinessName: "",
  /** Įmonės / individualios veiklos kodas. Tuščias = nerodomas. */
  companyCode: "",
  /** Fizinis adresas. Tuščias = nerodomas (paslauga veikia paštu). */
  address: "",
  /** Bazinis miestas (struktūriniams duomenims). */
  city: "Kaunas",
  /** Aptarnaujama teritorija. */
  serviceArea: "Lietuva",
  /** Pagrindinis domenas su https://, be pasvirojo brūkšnio gale. */
  websiteUrl: "https://grandiniugalandimas.lt",

  /** Tikri savininko duomenys ir jo nuotraukos. Tuščia – sekcija nerodoma. */
  operatorName: "",
  operatorBio: "",
  workshopPhotos: [] as { src: string; alt: string; width: number; height: number }[],

  // ---------------------------------------------------------------- Kontaktai
  /** Telefonas tarptautiniu formatu, pvz. "+37060000000". Tuščias = niekur nerodomas. */
  phone: "",
  /** Telefonas taip, kaip rodomas žmonėms, pvz. "+370 600 00000". */
  phoneDisplay: "",
  /** Viešas el. paštas klientams. (Užklausų gavėjas nustatomas aplinkos kintamuoju LEAD_RECIPIENT_EMAIL.) */
  email: "grandiniugalandimas@gmail.com",

  // ---------------------------------------------------------------- Užsakymai
  /**
   * true = forma išjungta, rodomas pranešimas „Laikinai nepriimame naujų užsakymų“.
   * PERĖMUS SVETAINĘ NUSTATYKITE false, kai būsite pasiruošę priimti užklausas.
   */
  ordersPaused: false,
  /** Per kiek laiko atsakote į užklausą (rodoma prie formos). Tuščias = nerodoma. */
  responseTime: "per 24 val.",

  // ---------------------------------------------------------------- Kainos
  pricing: {
    /**
     * "tiers"  – kainos pagal kiekį (lentelė žemiau),
     * "fixed"  – viena kaina už grandinę (fixedPrice),
     * "range"  – kaina „nuo–iki“ (rangeFrom / rangeTo), skaičiuoklė be tikslios sumos,
     * "hidden" – kainos nerodomos, mygtukas „Sužinoti kainą“.
     */
    mode: "tiers" as PricingMode,
    currency: "EUR",
    /** Naudojama "tiers" režime. Kaina vienetui apskaičiuojama automatiškai. */
    tiers: [
      { quantity: 1, total: 4.5 },
      { quantity: 2, total: 9.0 },
      { quantity: 4, total: 16.0, popular: true },
      { quantity: 5, total: 20.0 },
      { quantity: 10, total: 36.0 },
    ] as PriceTier[],
    /** "fixed" režimas: kaina už 1 grandinę. */
    fixedPrice: 4.5,
    /** "range" režimas. */
    rangeFrom: 3.6,
    rangeTo: 4.5,
    /** Kiekiai, kuriuos galima pasirinkti "fixed" / "range" režimuose. */
    quantityOptions: [1, 2, 4, 5, 10],
  },

  // ---------------------------------------------------------------- Siuntimas
  shipping: {
    /** false = paslauga be siuntimo (tik atvežus). Tekstai apie paštomatus dingsta. */
    enabled: true,
    /** Nebūtinas konkretus tinklas; tuščia = siuntimo būdą suderiname individualiai. */
    provider: "",
    /** Grąžinimo klientui kaina, kai nemokamas grąžinimas netaikomas, EUR. 0 = neskelbiama. */
    price: 3.5,
    /** Siuntimą mums klientas užsako ir apmoka vežėjui atskirai. */
    inboundPaidByCustomer: true,
    /** Grąžinimo klientui kaina 2 vnt. (nuolaida). null = tokia pati kaip price. */
    priceForTwo: 3.0 as number | null,
    /** Ar taikomas nemokamas grąžinimas. */
    freeShippingEnabled: true,
    /** Nuo kiek grandinių grąžinimas nemokamas. */
    freeShippingMinimumQuantity: 4,
    /** Rodyti miestų puslapiuose Omniva paštomatų sąrašą. */
    showCityLockers: false,
  },

  /** Ar aptarnaujama visa Lietuva (miestų puslapiai, „visoje Lietuvoje“ tekstai). */
  nationwideServiceEnabled: true,

  // ---------------------------------------------------------------- Terminai
  /** Galandimo ir grąžinimo terminas darbo dienomis nuo grandinių gavimo. 0 = terminas neskelbiamas. */
  turnaroundMinDays: 2,
  turnaroundMaxDays: 3,

  // ---------------------------------------------------------------- Paslaugos
  services: {
    standardChains: true,
    /** Kietlydinio (karbido, „Vidia“) grandinės. */
    carbideChains: false,
    /** Išilginio pjovimo (ripping) grandinės. */
    rippingChains: false,
    /** Gylio ribotuvų reguliavimas. */
    depthGaugeAdjustment: true,
  },

  // ---------------------------------------------------------------- Teiginiai
  claims: {
    /** Staklės su aušinimu – metalas neperkaitinamas. */
    cooledMachine: true,
    /** Garantija: nepatiks – pagaląsime iš naujo nemokamai. */
    sharpeningGuarantee: true,
    /** Siuntimas visoje Lietuvoje. */
    nationwideShipping: true,
    /** Skubus aptarnavimas. */
    expressService: false,
    /** Apmokama tik suderinus užsakymą (be išankstinio mokėjimo). */
    noPrepayment: true,
  },

  // ---------------------------------------------------------------- Socialinis įrodymas
  /** Įjunkite TIK su tikrais skaičiais. */
  socialProof: {
    enabled: false,
    chainsSharpened: 0,
    customersServed: 0,
  },

  /** Viešas Google Analytics 4 ID. Tuščia reikšmė išjungia analitiką. */
  analytics: { measurementId: "G-MQ77R50276" },

  // ---------------------------------------------------------------- Kita
  /** Socialinių tinklų nuorodos. Tuščia = ikona nerodoma. */
  social: { facebook: "", instagram: "" },
  /** Žemėlapio koordinatės (geo meta). Tuščia = nerodoma. */
  geo: null as { lat: number; lng: number } | null,
  /** Naujos grandinės kaina sutaupymo skaičiuoklei (orientacinė). */
  newChainPrice: 25,
  /** Orientacinės palyginimo kainos, ne parduotuvės pasiūlymai. */
  comparisonBrands: [
    { id: 'stihl', name: 'Stihl', series: 'Oilomatic / Rapid', avgNewPrice: 22 },
    { id: 'husqvarna', name: 'Husqvarna', series: 'X-Cut / SP', avgNewPrice: 20 },
    { id: 'oregon', name: 'Oregon', series: 'SpeedCut / Control', avgNewPrice: 18 },
    { id: 'generic', name: 'Standartinė', series: 'Universali grandinė', avgNewPrice: 15 },
  ],
  ogImage: "https://grandiniugalandimas.lt/og-image.jpg",
} as const;

// ============================================================================
//  Pagalbinės funkcijos (keisti nereikia)
// ============================================================================

export const formatEur = (n: number) => `${n.toFixed(2).replace(".", ",")} €`;

/** Kainos vienetui intervalas pagal pasirinktą režimą. null = kainos nerodomos. */
export function getPriceRange(): { low: number; high: number } | null {
  const p = BUSINESS.pricing;
  switch (p.mode) {
    case "tiers": {
      const units = p.tiers.map((t) => t.total / t.quantity);
      return { low: Math.min(...units), high: Math.max(...units) };
    }
    case "fixed":
      return { low: p.fixedPrice, high: p.fixedPrice };
    case "range":
      return { low: p.rangeFrom, high: p.rangeTo };
    default:
      return null;
  }
}

/** Trumpas kainos tekstas, pvz. „nuo 3,60 €/vnt.“ arba null. */
export function priceFromLabel(): string | null {
  const r = getPriceRange();
  if (!r) return null;
  return r.low === r.high ? `${formatEur(r.low)}/vnt.` : `nuo ${formatEur(r.low)}/vnt.`;
}

export function shippingPriceFor(quantity: number): number {
  const s = BUSINESS.shipping;
  if (!s.enabled) return 0;
  if (s.freeShippingEnabled && quantity >= s.freeShippingMinimumQuantity) return 0;
  if (quantity === 2 && s.priceForTwo != null) return s.priceForTwo;
  return s.price;
}

export function isFreeShipping(quantity: number): boolean {
  const s = BUSINESS.shipping;
  return s.enabled && s.freeShippingEnabled && quantity >= s.freeShippingMinimumQuantity;
}

/** Terminas tekstu, pvz. „2–3 darbo dienas“ arba null. */
export function turnaroundLabel(): string | null {
  const a: number = BUSINESS.turnaroundMinDays;
  const b: number = BUSINESS.turnaroundMaxDays;
  if (!b) return null;
  return a && a !== b ? `${a}–${b} darbo dienas` : b === 1 ? "1 darbo dieną" : `${b} darbo dienas`;
}

export const hasPhone = () => Boolean(BUSINESS.phone);
export const showPrices = () => BUSINESS.pricing.mode !== "hidden";

/** Funkcijų jungikliai, kuriais galima žymėti tekstus (miestų duomenyse ir pan.). */
export type FeatureFlag =
  | "shipping"
  | "freeShipping"
  | "cooledMachine"
  | "guarantee"
  | "carbide"
  | "ripping"
  | "depthGauge"
  | "nationwide"
  | "prices"
  | "noPrepayment"
  | "turnaround";

export function isEnabled(flag: FeatureFlag): boolean {
  const b = BUSINESS;
  switch (flag) {
    case "shipping":
      return b.shipping.enabled;
    case "freeShipping":
      return b.shipping.enabled && b.shipping.freeShippingEnabled;
    case "cooledMachine":
      return b.claims.cooledMachine;
    case "guarantee":
      return b.claims.sharpeningGuarantee;
    case "carbide":
      return b.services.carbideChains;
    case "ripping":
      return b.services.rippingChains;
    case "depthGauge":
      return b.services.depthGaugeAdjustment;
    case "nationwide":
      return b.nationwideServiceEnabled && b.claims.nationwideShipping;
    case "prices":
      return showPrices();
    case "noPrepayment":
      return b.claims.noPrepayment;
    case "turnaround":
      return turnaroundLabel() !== null;
  }
}

/**
 * Įstato konfigūracijos reikšmes į tekstą:
 * {freeMin} {provider} {turnaround} {priceFrom} {shipping} {email} {name}
 */
export function fill(text: string): string {
  const b = BUSINESS;
  return text
    .replaceAll("{freeMin}", String(b.shipping.freeShippingMinimumQuantity))
    .replaceAll("{provider}", b.shipping.provider)
    .replaceAll("{turnaround}", turnaroundLabel() ?? "")
    .replaceAll("{priceFrom}", priceFromLabel() ?? "")
    .replaceAll("{shipping}", formatEur(b.shipping.price))
    .replaceAll("{email}", b.email)
    .replaceAll("{name}", b.businessName);
}

/** Tekstas su sąlyga: rodomas tik kai visi nurodyti jungikliai įjungti. */
export interface Conditional {
  text: string;
  requires?: FeatureFlag[];
}

export function visible<T extends { requires?: FeatureFlag[] }>(items: T[]): T[] {
  return items.filter((i) => !i.requires || i.requires.every(isEnabled));
}

/**
 * Kainos apskaičiavimas pasirinktam kiekiui.
 * "tiers": taikoma didžiausios pakopos (kurios kiekis ≤ pasirinktam) vieneto kaina.
 * "range": skaičiuojama pagal viršutinę ribą (orientacinė, rodoma kaip „iki“).
 * "hidden": grąžina null – kaina nerodoma.
 */
export function quote(
  quantity: number,
): { chainPrice: number; shippingPrice: number; unitPrice: number; total: number; approximate: boolean } | null {
  const p = BUSINESS.pricing;
  let unit: number;
  if (p.mode === "hidden") return null;
  if (p.mode === "tiers") {
    const sorted = [...p.tiers].sort((a, b) => a.quantity - b.quantity);
    const exact = sorted.find((t) => t.quantity === quantity);
    if (exact) {
      const shippingPrice = shippingPriceFor(quantity);
      return {
        chainPrice: exact.total,
        shippingPrice,
        unitPrice: exact.total / quantity,
        total: exact.total + shippingPrice,
        approximate: false,
      };
    }
    const tier = [...sorted].reverse().find((t) => t.quantity <= quantity) ?? sorted[0]!;
    unit = tier.total / tier.quantity;
  } else if (p.mode === "fixed") {
    unit = p.fixedPrice;
  } else {
    unit = p.rangeTo;
  }
  const chainPrice = Math.round(unit * quantity * 100) / 100;
  const shippingPrice = shippingPriceFor(quantity);
  return { chainPrice, shippingPrice, unitPrice: unit, total: chainPrice + shippingPrice, approximate: p.mode === "range" };
}

/** Kiekiai, rodomi kaip pasirinkimo mygtukai. */
export function quantityOptions(): { quantity: number; popular: boolean }[] {
  const p = BUSINESS.pricing;
  if (p.mode === "tiers") {
    return [...p.tiers].sort((a, b) => a.quantity - b.quantity).map((t) => ({ quantity: t.quantity, popular: Boolean(t.popular) }));
  }
  const freeMin = BUSINESS.shipping.freeShippingEnabled ? BUSINESS.shipping.freeShippingMinimumQuantity : -1;
  return p.quantityOptions.map((q) => ({ quantity: q, popular: q === freeMin }));
}


/** Kliento siuntimo mums kaina niekada neįtraukta į svetainės mokėtiną sumą. */
export function inboundShippingLabel(): string | null {
  return BUSINESS.shipping.enabled ? 'Siuntimą mums užsakote ir apmokate vežėjui atskirai. Ši kaina į sumą neįtraukta.' : null;
}
export function normalizeQuantity(quantity: number): number {
  return Math.min(500, Math.max(1, Math.trunc(Number.isFinite(quantity) ? quantity : 1)));
}

