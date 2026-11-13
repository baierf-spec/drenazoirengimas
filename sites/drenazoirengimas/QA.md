# Galutinės patikros — Decap CMS

Data: 2026-10-20. Tikrinama GitHub/Cloudflare versija su Decap, be DB/R2/Netlify. Tai patikrų rezultatai, ne deklaracija, kad paskyros OAuth jau prijungtas.

## Automatika

- PASS: švarus `npm ci` iš package-lock; Node 24.
- PASS: `npm run check` — ESLint, Astro/TypeScript (46 failai, 0 klaidų / įspėjimų), build, izoliuotas production SEO auditas, 78 testai 11 failų, vidinių nuorodų / vaizdų / JSON-LD auditas, tikro supakuoto Worker smoke, izoliuotas projekto publish/draft puslapių generavimas.
- PASS: `npm run build:production` — preflight ir tikras Astro statinis build, `/admin/` įtrauktas. 14 viešo turinio HTML puslapių + atskiras CMS shell, robots ir sitemap.
- PASS: `npm run deploy:dry-run` — oficialus Wrangler bundling, tik EMAIL ir ASSETS; papildomų saugyklų / DB / mokamų resursų nereikia.
- PASS: `npm run check:secrets` ir staged turinio peržiūra; jokie tikri OAuth / Cloudflare / Turnstile secrets į commit neįtraukti.
- PASS: JSON konfigūracija generuojama vienodai kaip Decap JSON/YAML. Fiksuotas repo/main/origin. Techniniai laukai savininko UI paslėpti.
- PASS: OAuth trūkstami nustatymai fail-closed; GET/host/origin/provider/site_id; atsitiktinė pasirašyta 10 min. būsena; HttpOnly/Secure cookie; PKCE S256; pasibaigusi/pakeista/nesutampanti būsena; GitHub write permission; read-only atmetimas; tokenas siunčiamas tik fiksuotam opener; cookie išvalymas; CSP nonce; išorės klaidos be tokenų nutekinimo (mock HTTP testai).
- PASS: CMS preSave išlaiko entry.data struktūrą ir blokuoja netaisyklingą projektą prieš GitHub įrašą.
- PASS: projektų title/description/cover/slug/image validavimas, publish/draft filtras, eiliškumas; publikuotas įrašas turi listingą, detail H1, alt, OG, canonical, BreadcrumbList ir sitemap; draft neturi viešo puslapio ar sitemap įrašo.
- PASS: JPG/PNG/WebP/HEIC įkėlimo tipų / dydžių validatorius; 480/960/1600 WebP iš tikro sharp vaizdo, teisingi matmenys ir pašalintas EXIF; į deploy išvestį nepatenka žali / nepublikuoti failai.
- PASS: esami formų, email, referrer, consent, navigacijos, responsive menu ir skaičiuoklės testai liko ir praėjo. Tikri laiškai testais nesiunčiami.

## Rankinė / naršyklės patikra

- Prieš pakeitimą užfiksuota tikra produkcija: `/` HTTP 200; `/admin/` HTTP 404. GitHub main turėjo pilną projektą, prieš CMS nieko atstatyti nereikėjo.
- Vietinėje naršyklėje `/admin/` užsikrauna su tikru Decap 3.17.1, lietuvišku „Prisijungti su GitHub“ mygtuku ir veikiančiu config. Aptiktos ir ištaisytos dev statinio admin maršruto ir Decap konfigūracijos klaidos.
- Visas sugeneruoto pagrindinio puslapio main/header/footer/mobile CTA tekstas palygintas su prieš pakeitimą gauta tikra produkcija — identiškas normalizavus tarpus. Esami CSS, šriftai, iliustracijos, navigacija ir brūkšniai/eilučių laužymas išsaugoti. Jokių sugalvotų projektų / atsiliepimų.
- Pagrindinis domenas/canonical lieka https://drenazoirengimas.lt; 9 teisėti baziniai indexable URL; admin/auth/callback neindeksuojami. Tuščia galerija noindex ir su esamu profesionaliu laukimo tekstu.

## Dar nepatvirtinta gyvai — būtinas paskyros prijungimas

- GitHub OAuth App sukūrimas / Client ID ir Secret; Cloudflare OAuth trijų runtime laukų įrašymas. GitHub turinio jungtis šių paskyros teisių neturi. Naršyklėje atvertas konkretus OAuth App kūrimo adresas nukreipia į GitHub login.
- Dėl šios priežasties **neatlikta / nelaikoma PASS**: tikras login, repo turinio skaitymas po login, CMS save → GitHub commit → automatinis Cloudflare deploy → pakeitimo matymas produkcijoje, tikras CMS nuotraukos upload / pašalinimas, logout/login.
- **Neatlikta / nelaikoma PASS**: redaktoriaus patikra 360/390/430 px po prisijungimo ir tikro iPhone / Android HEIC konvertavimo bei upload bandymas. Admin adapterio tipų validacija / build integracija ir vaizdo optimizavimas patikrinti automatika; tai nėra fizinio telefono įrodymas.
- Tikras užklausų pristatymas Inbox/Spam ir priedai šio CMS pakeitimo metu netestuoti ir nepakeisti. Esami Cloudflare el. pašto / Turnstile nustatymai vis dar būtini.

Niekas nepublikuota per Netlify, Sites preview ar naują infrastruktūrą. CMS kodas įkeliamas į esamą GitHub main; tikrą Cloudflare build ir `/admin/` HTTP rezultatą reikia patikrinti po commit. Gyvo OAuth workflow baigimas yra atskiras likęs žingsnis, aiškiai aprašytas CMS_SETUP.md.

## Analitika ir produkcijos būklė po CMS commit

2026-10-20: GitHub main CMS commit db1e671, jo GitHub Actions Quality checks — SUCCESS. Tačiau pakartotinė tikro domeno patikra vis dar grąžino /admin/ 404 ir /auth 404; tai senas deployment, ne OAuth secrets klaida. Cloudflare paskyroje reikia patikrinti, ar Workers Builds prijungtas prie šios main šakos, ir įdiegti naujausią commit. Automatinio Cloudflare publikavimo nelaikome patvirtintu vien pagal sėkmingus GitHub Actions.

Vartotojo prašymu standartinis Google tag G-NF15227P2D įterptas tiesiai po bendro <head> pradžios visuose viešuose puslapiuose, įkeliamas iš karto. Ankstesnis nuo sutikimo priklausęs dinaminis GA4 loader pašalintas. test:built tikrina vieną išorinį async tag ir vieną config inicializaciją su teisingu ID kiekviename viešame HTML. UI testas patvirtina, kad sutikimo mygtukas nekuria antro GA4 tag / config / page_view. Papildomų įvykių, Cloudflare ir referrer sutikimo logika išsaugota. Privatumo tekstas suderintas su faktiniu veikimu. GA4 paskyros Realtime duomenų gavimas dar nepatvirtintas.

## CMS CSP pataisa — 2026-10-21

Produkcijos `/admin/` antraštėje patvirtintas `wasm-unsafe-eval`, kuris neleidžia Decap konfigūracijos JavaScript šablonų vykdymo. Pakeista į `unsafe-eval` tik izoliuotai CMS saugumo politikai. Regresijos testas tikrina, kad admin leidimas yra, o viešuose puslapiuose ir OAuth callback jo nėra. PASS: lint, TypeScript (46 failai, 0 klaidų), 78 testai / 11 failų, production build. Tikras CMS prisijungimas po šio deployment dar nepatvirtintas.

## OAuth nustatymų diagnostika — 2026-10-21

503 atsakymas dabar nurodo tik trūkstamų runtime laukų pavadinimus arba per trumpą OAUTH_STATE_SECRET; reikšmės negrąžinamos. Tuščios / vien tarpų reikšmės atmetamos. PASS: lint, TypeScript, 79 testai / 11 failų, production build. Gyvų paskyros nustatymų turinys nematomas; realus login lieka nepatvirtintas.

## GA4 generate_lead — 2026-10-21

PASS: lint, TypeScript (46 failai, 0 klaidų), production build, 85 testai / 12 failų. Nauji UI testai tikrina, kad iki atsakymo nėra įvykio; tik `status: sent` + ID + sėkmingas HTTP siunčia vieną generate_lead; HTTP klaida, trūkstama sent būsena ir tinklo klaida jo nesiunčia. Pakartotinis submit ir padėkos atnaujinimas jo nedubliuoja. Vienetiniai testai tikrina session ID dedupe, fiksuotus parametrus be PII, neveikiantį / blokuotą gtag bei 1,5 s fallback. Esamas serverio testas patvirtina, kad atsakymas laukia Cloudflare EMAIL priėmimo ir siuntimo klaida grąžina 503. Tikras laiškas nesiųstas; GA4 Realtime gavimas ir naujo commit deployment gyvai dar nepatvirtinti.
