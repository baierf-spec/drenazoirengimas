export const site = {
  origin: "https://drenazoirengimas.lt",
  name: "drenazoirengimas.lt",
  production: import.meta.env.PUBLIC_SITE_MODE === "production",
  phone:
    import.meta.env.PUBLIC_SHOW_PHONE === "true" &&
    /^\+370\d{8}$/.test(import.meta.env.PUBLIC_PHONE || "")
      ? import.meta.env.PUBLIC_PHONE
      : "",
  email: import.meta.env.PUBLIC_CONTACT_EMAIL || "",
  controller: import.meta.env.PUBLIC_CONTROLLER_NAME || "",
  controllerAddress: import.meta.env.PUBLIC_CONTROLLER_ADDRESS || "",
  turnstile: import.meta.env.PUBLIC_TURNSTILE_SITE_KEY || "",
  ga4: /^G-[A-Z0-9]+$/.test(import.meta.env.PUBLIC_GA4_ID || "")
    ? import.meta.env.PUBLIC_GA4_ID
    : "",
  cloudflareAnalytics: import.meta.env.PUBLIC_CF_ANALYTICS_TOKEN || "",
  verification: import.meta.env.PUBLIC_GOOGLE_SITE_VERIFICATION || "",
};
export const problems = [
  {
    id: "foundations",
    title: "Vanduo prie pamatų",
    text: "Po lietaus vanduo kaupiasi prie namo. Svarbu suprasti, iš kur jis atiteka.",
    icon: "house",
    href: "/pamatu-drenazas/",
  },
  {
    id: "basement",
    title: "Drėgnas rūsys",
    text: "Drėgmė, pelėsis ar vandens pėdsakai – priežastį svarbu nustatyti prieš renkantis darbus.",
    icon: "basement",
    href: "/pamatu-drenazas/",
  },
  {
    id: "yard",
    title: "Šlapias kiemas",
    text: "Ilgai neišnykstančios balos ir klampi veja trukdo naudotis sklypu.",
    icon: "trees",
    href: "/sklypo-drenazas/",
  },
  {
    id: "groundwater",
    title: "Gruntinis vanduo",
    text: "Nuolat šlapioms vietoms reikia sprendimo pagal grunto ir vandens sąlygas.",
    icon: "water",
    href: "/vanduo-sklype/",
  },
];
export const propertyTypes = [
  ["house", "Gyvenamasis namas", "house"],
  ["homestead", "Sodyba / ūkinis pastatas", "trees"],
  ["plot", "Sklypas (be pastatų)", "land"],
  ["other", "Kitas objektas", "building"],
] as const;
export const faq = [
  [
    "Kada reikalingas drenažas?",
    "Drenažą verta svarstyti, kai vanduo grunte nuolat kaupiasi prie pamatų ar sklype. Pirmiausia nustatomas jo šaltinis ir galimybė nuvesti surinktą vandenį. Vien drėgmė ar balos dar nereiškia, kad būtina įrengti drenažą.",
  ],
  [
    "Kas lemia drenažo įrengimo kainą?",
    "Kainą lemia trasos ilgis, kasimo sąlygos, medžiagos, šuliniai, vandens nuvedimas ir gerbūvio atkūrimas. Lyginant pasiūlymus svarbu patikrinti darbų apimtį. Skaičiuoklė pateikia tik orientacinį scenarijų, ne rangovo sąmatą.",
  ],
  [
    "Kada reikalinga objekto apžiūra?",
    "Apžiūros gali reikėti, kai iš nuotraukų neaiškus reljefas, vandens šaltinis, esami tinklai ar nuvedimo galimybės. Nuotraukos padeda pasiruošti pokalbiui, bet nepatvirtina galutinio sprendimo ar kainos.",
  ],
  [
    "Kur nuvedamas drenažo vanduo?",
    "Vandens priėmimo vieta parenkama pagal gruntą, reljefą ir taikomus reikalavimus. Ji turi būti techniškai tinkama ir leistina. Šulinys savaime nėra galutinė nuvedimo vieta, o prijungimas prie tinklų negali būti žadamas nepatikrinus sąlygų.",
  ],
  [
    "Ar drenažas padeda molingame grunte?",
    "Gali padėti, tačiau molingam sklypui netinka vienodas sprendimas visais atvejais. Reikia įvertinti vandens šaltinį, grunto laidumą, filtro ir drenuojančio sluoksnio parinkimą bei nuvedimą. Infiltracijos galimybę būtina tikrinti atskirai.",
  ],
  [
    "Kuo skiriasi pamatų ir sklypo drenažas?",
    "Pamatų drenažas sprendžia vandens grunte problemą prie pastato, o sklypo drenažas – užmirkstančiose teritorijos vietose. Abi sistemos priklauso nuo grunto, reljefo ir nuvedimo sąlygų. Pamatų drenažas neatstoja hidroizoliacijos.",
  ],
  [
    "Kaip suprasti, ar problema susijusi su drenažu?",
    "Užfiksuokite, kur, kada ir kiek laiko laikosi vanduo. Balos po lietaus, nuolat šlapias gruntas ir drėgmė rūsyje gali turėti skirtingas priežastis. Jas padeda atskirti objekto įvertinimas; vien simptomų patikimai diagnozei nepakanka.",
  ],
  [
    "Ar lietaus vanduo ir drenažas yra ta pati sistema?",
    "Ne. Drenažu surenkamas vanduo grunte, o lietaus sistema valdo nuo stogo ir dangų surinktą vandenį. Jos gali būti bendro vandens valdymo dalis, tačiau sujungimo ar atskiro nuvedimo sprendimas parenkamas konkrečiam objektui.",
  ],
  [
    "Kiek laiko trunka drenažo įrengimas?",
    "Terminas priklauso nuo trasos, kasimo sąlygų, privažiavimo, esamų dangų ir derinimų. Darbų eiga bei trukmė aptariamos įvertinus objektą. Vienas terminas visiems sklypams nebūtų patikimas.",
  ],
  [
    "Ar reikės ardyti veją ir trinkeles?",
    "Kasimo zona ir technikos privažiavimas aptariami prieš darbus. Sąmatoje verta atskirai numatyti dangų ardymą, grunto tvarkymą ir pažeistų vietų atkūrimą.",
  ],
  [
    "Ar galima kreiptis ne iš Vilniaus ar Kauno?",
    "Taip, užklausą galima pateikti iš visos Lietuvos. Prioritetinės vietovės – Vilnius, Kaunas ir jų rajonai. Rangovo galimybė atvykti konkrečiu adresu tikslinama pagal jo aptarnavimo teritoriją ir užimtumą.",
  ],
  [
    "Kas gaus mano užklausą?",
    "Užklausa perduodama ją administruojančiam asmeniui ir, jums sutikus, tinkamam nepriklausomam paslaugos teikėjui. Darbų apimtį, kainą ir sutartį suderinate su pasirinktu rangovu. Pateikta užklausa neįpareigoja užsakyti darbų.",
  ],
];
export const faqLinks: Record<string, { href: string; label: string }> = {
  [faq[0][0]]: {
    href: "/pamatu-drenazas/",
    label: "Kada vertinti pamatų drenažą",
  },
  [faq[1][0]]: {
    href: "/drenazo-kaina/",
    label: "Drenažo kainos veiksniai ir skaičiuoklė",
  },
  [faq[2][0]]: {
    href: "/gauti-pasiulyma/",
    label: "Pateikti objekto situaciją",
  },
  [faq[3][0]]: {
    href: "/lietaus-vandens-nuvedimas/",
    label: "Vandens surinkimas ir nuvedimas",
  },
  [faq[4][0]]: {
    href: "/sklypo-drenazas/#molingas-gruntas",
    label: "Drenažas molingame grunte",
  },
  [faq[5][0]]: {
    href: "/drenazas-ar-lietaus-nuotekos/",
    label: "Vandens valdymo sistemų skirtumai",
  },
  [faq[6][0]]: { href: "/vanduo-sklype/", label: "Ką stebėti šlapiame sklype" },
};
export const services = [
  {
    slug: "pamatu-drenazas",
    title: "Pamatų drenažas",
    tag: "NAMUI",
    text: "Vandens valdymas prie esamo ar statomo namo, atsižvelgiant į pamatus ir hidroizoliaciją.",
    icon: "house",
  },
  {
    slug: "sklypo-drenazas",
    title: "Sklypo drenažas",
    tag: "SKLYPUI",
    text: "Sprendimai užmirkstančiam kiemui, molingam gruntui ir užmirkstančioms teritorijoms.",
    icon: "trees",
  },
  {
    slug: "lietaus-vandens-nuvedimas",
    title: "Lietaus vandens nuvedimas",
    tag: "VANDENS KELIUI",
    text: "Nuo stogo ir dangų surenkamas vanduo turi turėti tinkamą priėmimo vietą.",
    icon: "water",
  },
];
