# SEO auditas — 2026-10-20

**PRE-LAUNCH STATUS: NOT READY** viešam drenazoirengimas.lt aktyvavimui. Kodas ir produkcinio režimo HTML patikrinti; Cloudflare account integracijos sąmoningai nepajungtos. Ši ataskaita pakeičia ankstesnio audito rezultatus.

## Išsaugota ir patikslinta

Išsaugotas esamas dizainas, sekcijų struktūra, spalvos, tipografija, tarpai ir navigacija su „Projektai“. Naujų išgalvotų projektų, lokacijų, atsiliepimų, rezultatų ar statistikos nėra. Projektų laukimo būsena dabar sąmoninga: „Projektų galerija ruošiama“. Pridėtas tik galerijos valdymo UI ir tam reikalingi serverio maršrutai.

Veikimo sekcijoje paryškinta „Nepradedame nuo vamzdžių. Pradedame nuo vandens priežasties.“ H1 liko „Drenažo įrengimas sklypui ir pamatams“. Straipsniuose ir diagnostikoje sutrumpinti pasikartojantys perspėjimai; būtinas vienas paaiškinimas prie schemos, diagnostikos ir orientacinių kainų paliktas. Privatumo puslapis nebevadina svetainės parengiamąja versija; valdytojo duomenys užpildomi per konfigūraciją, jų trūkumas vis dar blokuoja produkcinę preflight patikrą.

Kainų puslapyje veikia išskleidžiamas „Iš kur šie kainų intervalai?“ blokas. Viešų šaltinių nuorodų registre nėra, todėl skaičiai vadinami modelio prielaidomis, o ne patvirtintais rinkos tarifais. 2026-10-20 data aiškiai reiškia modelio peržiūrą. Tikrų kainoraščių URL, apimtį ir atskirą šaltinio peržiūros datą galima pridėti `src/data/price-sources.ts`.

## Tiesiogiai patikrinta

- Lint ir Astro / Worker TypeScript: praėjo, 42 failai, 0 errors/warnings/hints.
- 69 testai: praėjo. Jie apima ir tikrą vietinę SQLite migraciją, pasirašytus Access JWT su testiniais raktais, R2 / JWKS / laiškų imitacijas ir kliento scenarijus.
- 15 statinių HTML puslapių: vienas H1, lt, unikalūs head title / description, canonical, OG, socialinis vaizdas ir JSON-LD. SVG prieinamumo title nepainiojamas su dokumento title.
- 467 nuorodų / resursų nuorodos ir inkarai, 13 img elementų su alt bei matmenimis, 45 statiniai JSON-LD objektai. Nerasta svarbių nutrūkusių vidinių nuorodų.
- `npm run audit:seo`: atskiras production režimo build, 9 baziniai indeksuojami kanoniniai URL; sitemap / noindex atitikimas, breadcrumb ir matomo FAQ teksto atitikimas schemai.
- Worker bundle smoke: turinio 200, nežinomi keliai ir neegzistuojantis projektas 404, preview robots/sitemap, neaktyvus intake 503.
- Galerijos SSR testas: publikuotam projektui individualūs title/description/canonical/cover OG, H1, BreadcrumbList, srcset/sizes. Slėpimas pašalina detail URL iš sitemap ir viešą nuotraukos prieigą. Po publikavimo pakeitus pavadinimą slug išlieka.

JSON-LD tikrinamas struktūriškai ir lyginamas su HTML; Google Rich Results Test / išorinis validator šiame darbe nevykdytas. Nėra pažado apie išplėstinius rezultatus ar indeksavimą.

## Galutinis statinių puslapių metadata / schema žemėlapis

Lentelė iš production režimo sugeneruoto HTML. Dabartinė preview versija visiems puslapiams papildomai taiko noindex.

| URL                              | Po aktyvavimo | Title                                                                     | Meta description                                                                                                                                   | JSON-LD                                   |
| -------------------------------- | ------------- | ------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------- |
| `/`                              | Indeksuojamas | Drenažo įrengimas sklypui ir pamatams &#124; drenazoirengimas.lt          | Sklypo ir pamatų drenažas, lietaus vandens nuvedimas. Aprašykite problemą Vilniuje, Kaune ar kitoje Lietuvos vietovėje ir pateikite užklausą.      | WebSite, WebPage, Service, FAQPage        |
| `/404.html`                      | Noindex       | Puslapis nerastas &#124; drenazoirengimas.lt                              | Šio puslapio nėra. Grįžkite į pradžią ir raskite informaciją apie sklypo, pamatų drenažą bei lietaus vandens nuvedimą.                             | WebSite, WebPage                          |
| `/aciu/`                         | Noindex       | Užklausos patvirtinimas &#124; drenazoirengimas.lt                        | Informacija apie pateiktos drenažo užklausos gavimą ir kitą žingsnį. Atidarius puslapį savaime užklausa nėra pateikiama.                           | WebSite, WebPage                          |
| `/diagnostika/`                  | Noindex       | Ar reikia drenažo? Situacijos klausimynas &#124; drenazoirengimas.lt      | Pasirinkite vandens problemą ir atsakykite į kelis klausimus. Rezultatas padės pasiruošti pokalbiui, bet neatstos objekto apžiūros.                | WebSite, WebPage                          |
| `/drenazas-ar-lietaus-nuotekos/` | Indeksuojamas | Drenažas ir lietaus nuotekos: kuo skiriasi? &#124; drenazoirengimas.lt    | Aiškus palyginimas: vanduo grunte ir nuo stogo bei dangų surinktas lietaus vanduo. Kaip pasirinkti tinkamą sprendimą?                              | WebSite, WebPage, BreadcrumbList          |
| `/drenazo-kaina/`                | Indeksuojamas | Drenažo įrengimo kaina ir skaičiuoklė &#124; drenazoirengimas.lt          | Kas lemia drenažo įrengimo kainą? Palyginkite darbų apimtį, kasimo sąlygas, medžiagas ir atkūrimą. Išbandykite paaiškintą orientacinę skaičiuoklę. | WebSite, WebPage, BreadcrumbList          |
| `/duk/`                          | Indeksuojamas | Dažniausi klausimai apie drenažą &#124; drenazoirengimas.lt               | Kada reikalingas drenažas, ar jis tinka molingam gruntui, kur nuvedamas vanduo ir kas lemia kainą? Trumpi atsakymai prieš tariantis su rangovu.    | WebSite, WebPage, FAQPage, BreadcrumbList |
| `/gallery-manager/`              | Noindex       | Privatus projektų galerijos valdymas &#124; drenazoirengimas.lt           | Svetainės savininko privati sąsaja projektams ir nuotraukoms tvarkyti.                                                                             | WebSite, WebPage                          |
| `/gauti-pasiulyma/`              | Noindex       | Gauti drenažo pasiūlymą &#124; drenazoirengimas.lt                        | Nurodykite objekto vietą, vandens problemą ir kontaktus. Jei galite, pridėkite nuotraukų. Užklausą pateikite per trijų žingsnių formą.             | WebSite, WebPage                          |
| `/lietaus-vandens-nuvedimas/`    | Indeksuojamas | Lietaus vandens surinkimas ir nuvedimas &#124; drenazoirengimas.lt        | Lietaus vanduo nuo stogo ir dangų: surinkimo, nuvedimo bei priėmimo principai. Kodėl lietaus sistema nėra tas pats, kas drenažas?                  | WebSite, WebPage, BreadcrumbList, Service |
| `/pamatu-drenazas/`              | Indeksuojamas | Pamatų drenažas aplink namą &#124; drenazoirengimas.lt                    | Kada verta įvertinti pamatų drenažą, kuo jis skiriasi nuo lietaus vandens nuvedimo ir kas lemia darbų apimtį bei kainą.                            | WebSite, WebPage, BreadcrumbList, Service |
| `/privatumo-politika/`           | Indeksuojamas | Privatumo ir slapukų informacija &#124; drenazoirengimas.lt               | Kaip tvarkomi užklausos kontaktai, aprašymas ir nuotraukos. Duomenų gavėjai, saugojimas, analitikos pasirinkimas bei jūsų teisės.                  | WebSite, WebPage, BreadcrumbList          |
| `/projektai/`                    | Noindex       | Drenažo projektai ir darbų galerija &#124; drenazoirengimas.lt            | Drenažo ir lietaus vandens nuvedimo projektai: darbų nuotraukos, pradinė situacija ir pasirinkti sprendimai.                                       | WebSite, WebPage, BreadcrumbList          |
| `/sklypo-drenazas/`              | Indeksuojamas | Sklypo drenažas ir užmirkusio kiemo sausinimas &#124; drenazoirengimas.lt | Ilgai stovintis vanduo, klampi veja ar molingas sklypas? Sužinokite, kaip vertinamas sklypo drenažo poreikis ir vandens nuvedimo galimybės.        | WebSite, WebPage, BreadcrumbList, Service |
| `/vanduo-sklype/`                | Indeksuojamas | Vanduo sklype: priežastys ir galimi sprendimai &#124; drenazoirengimas.lt | Ką stebėti, kai kieme laikosi balos, šlampa veja ar rūsys? Praktiškas pasiruošimas vandens problemos įvertinimui.                                  | WebSite, WebPage, BreadcrumbList          |

## Dinaminiai projektų puslapiai

| Maršrutas                                    | Metadata ir schema                                                                                                                                      | Indeksavimas                                                                                                 |
| -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| `/projektai/`, kai yra published įrašų       | „Įgyvendinti projektai“, individualus galerijos description, canonical į apex, WebSite / WebPage / BreadcrumbList                                       | Įtraukiamas į sitemap tik su tikrais publikuotais projektais ir produkciniais indeksavimo jungikliais.       |
| `/projektai/{slug}/`                         | Savininko pavadinimas + domenas; description iš pavadinimo ir aprašymo; cover OG; WebSite / WebPage su tikru updated_at ir ImageObject / BreadcrumbList | Tik published. Vienodas publikuoto projekto pavadinimas neleidžiamas; raktažodžiai automatiškai nepridedami. |
| Juodraštis / paslėptas / ištrintas projektas | Tikras 404 su noindex                                                                                                                                   | Nėra sitemap.                                                                                                |
| `/gallery-manager*`, `/api/gallery*`         | Access apsauga, noindex / no-store                                                                                                                      | Nėra sitemap; be konfigūracijos 503, be galiojančio žetono 401, netinkamas savininkas 403.                   |
| `/projektu-nuotraukos/{id}/{slot}.webp`      | Tik publikuoto projekto optimizuotas vaizdas; privatus R2                                                                                               | Ne atskiras HTML sitemap įrašas; paslėpus parent 404.                                                        |

Organization, LocalBusiness, atsiliepimų / reitingų ar neegzistuojančio rangovo adreso schema nepridėta. Projektai neturi automatiškai sukurtų klientų vardų ar techninių rezultatų pažadų.

## Canonical, robots ir sitemap

Vienintelė produkcinė kilmė – `https://drenazoirengimas.lt`. Statiniai ir dinaminiai canonical / OG / JSON-LD / sitemap naudoja ją. Užklausos parametrai į canonical neperkeliami. Statinių resursų href/src/srcset nerasta localhost ar chatgpt.site; peržiūros URL dokumentacijoje yra tik administracinė nuoroda.

WWW ir HTTP → HTTPS apex 301, išsaugant kelią / query. `/index.html` ir `.html` alias → švarūs URL. Static Assets nėra SPA fallback, tikras 404 paliktas. Realaus domeno DNS, sertifikatai ir redirect grandinė po pajungimo dar turi būti patikrinti.

Production indeksavimui būtini **abu** build `PUBLIC_SITE_MODE=production` ir runtime `SEO_INDEXABLE=true`. Galerijos bei lead intake jungikliai nepriklausomi. Preview hostai gauna deny robots, tuščią sitemap ir noindex header net jei galerijos duomenys prijungti.

Produkcinis robots leidžia `/`, draudžia `/api/` ir `/gallery-manager`, nurodo kanoninį sitemap. CSS, JS, vaizdai bei SEO turinys neužblokuojami. Robots nepakeičia serverio autorizacijos.

Bazinis sitemap turi 9 URL. Worker gyvai prideda `/projektai/` ir tik published projektų detail URL, kai yra realių įrašų. Projektų lastmod remiasi tikru updated_at; statiniams puslapiams dirbtinio build laiko lastmod nėra. Tuščia galerija, privatus manager, juodraščiai, forma, diagnostika, aciu ir 404 neįtraukiami. Viešų projektų dabar nėra, todėl jų URL šiandienos baziniame sitemap nėra. Laikina DB klaida dinaminiame sitemap pateikia 503, ne klaidinančią publikacijų būseną.

## Vidinės nuorodos

Pradžia → trys paslaugos, problemų informacija, kaina, diagnostika, DUK ir užklausa. Navigacijos „Projektai“ → galerija. Published kortelė → tikras projekto puslapis. Projektas → breadcrumb pradžia / projektai, susijusios paslaugos ir „Turite panašią problemą?“ CTA į esamą formą. Empty būsena taip pat turi užklausos CTA. Private manager nėra įtrauktas į viešą navigaciją. Miestų doorway puslapių ir fiktyvių projektų nuorodų nesukurta.

## Našumas ir tikrinimo ribos

Vieša galerija pateikiama pilname serverio HTML; listing cover įrašai nuskaitomi bendra užklausa, ne atskiru SELECT kiekvienam projektui. Nuotraukos turi 480/960/1600 variantus, matmenis, srcset/sizes; antrinės lazy. Originalai nesaugomi, metadata šalinami. HEIC dekoderis yra didelis, bet įkeliamas tik savininko HEIC fallback šakoje, ne pradžios puslapyje. Vite apie jo dydį perspėja; globalus limitas neslepiamas.

Chrome vietiniame Astro UI per iframe viewport patikrinti pradžios, empty projektų, manager redaktoriaus, kainos ir užklausos pirmo žingsnio pločiai 360/390/430/768/1024/1440. Po manager failo valdiklio pataisos visur scrollWidth sutapo su clientWidth. Tai ne fizinių iPhone/Android, native Access OTP ar Worker CSP sertifikavimas. CWV / Lighthouse / lauko LCP-INP-CLS nematuoti.

## Liko prieš viešą domeną

Savininko tapatybė / kontaktai / privatumo ir kainų patvirtinimas; D1 ID ir migracijos, privatus R2, Access OTP su tikru savininko el. paštu bei runtime konfigūracija; Turnstile / Resend ir reali lead užklausa; tikra nuotraukų / laiškų / Access sesijos patikra, iPhone/Android HEIC ir touch; DNS / HTTPS / WWW. Search Console ir gyvas indeksavimo patikrinimas – po domeno pajungimo. Išorinių resursų kūrimas šiame etape sąmoningai nevykdytas.

Nuorodos: GALLERY_MANAGEMENT.md, DEPLOYMENT.md, QA.md ir ankstesnės turinio architektūros SEO_CONTENT_PLAN.md. Oficialūs SEO principai: https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap , https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls , https://developers.google.com/search/docs/crawling-indexing/block-indexing .
