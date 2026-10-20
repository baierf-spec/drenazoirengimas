# QA — GitHub galerija ir nuotraukų siuntimas paštu

Data: 2026-10-20. Dabartinė architektūra pakeičia ankstesnį D1/R2/Access CMS ir patvarios užklausų eilės variantą pagal savininko prašymą. Ankstesni 70 testų rezultatai priklausė senai architektūrai; dabartiniai rezultatai pateikti žemiau.

## Atlikta

- PASS: lint, Astro/TypeScript (42 failai, 0 errors / warnings / hints), Astro build (14 puslapių), production-mode SEO audit (9 baziniai canonical sitemap URL), 50/50 automatinių testų penkiuose failuose.
- PASS: built HTML / 458 vidinių nuorodų ir resursų / 43 JSON-LD objektai, robots ir sitemap, packaged Worker 404 ir neaktyvios formos saugus atsakymas. Visų maršrutų JS apie 95 kB; pašalintas seno privataus redaktoriaus HEIC/WASM bundle.
- API testai: administratoriaus gavėjas, kliento Reply-To, tikri binary priedai su saugiais failų vardais, sėkmė tik po email acceptance, siuntimo klaida ir retry, vienalaikių vienodos užklausos siuntimų sujungimas viename isolate, pakitusio turinio atmetimas, Turnstile hostname/action, Origin, laukų/sutikimo/honeypot validacija, failų parašai / skaičius / bendras 3 MiB biudžetas, trūkstamo binding atmetimas.
- Testuose Cloudflare EMAIL ir Turnstile imituojami. D1/R2 nėra ir jiems jokie testų mock nereikalingi.
- UI testai: esami formos žingsniai, loading / error / network / double-submit, patvirtinimo puslapio būsenos, diagnostika, skaičiuoklė, meniu ir consent srautas.
- Naujo GitHub galerijos modelio validacija, slug unikalumas, viršelis, tvarka, draft filtravimas. Izoliuotas tikros Astro generacijos testas scripts/audit-projects.mjs tikrina published listing/detail/metadata/OG cover/schema/sitemap ir draft maršruto nebuvimą. Jo fiktyvus turinys niekada nepublikuojamas ir pašalinamas finally bloke.
- Išsaugota svetainės vizualinė kalba ir Projektai navigacija. Nėra išgalvotų atliktų darbų.

## Integracijų ir patikimumo ribos

- Tikras Cloudflare EMAIL binding, domeno Email Routing, gavėjo patvirtinimas, Turnstile ir tikras Inbox / Spam / priedų testas dar reikalauja paskyros savininko nustatymų.
- EMAIL.send acceptance nėra Inbox garantija. Nėra užklausų saugojimo / patvarios eilės / foninių retry. Klaidos atveju klientas bando dar kartą. Atminties dedupe ir skaitikliai galioja viename isolate, nusinulina jį pakeitus. Absoliuti visuotinio exactly-once siuntimo garantija neteikiama.
- LEADS_ENABLED=false ir SEO_INDEXABLE=false palikti iki aktyvavimo. Public production build preflight vis dar reikalauja tikrų kontaktų / duomenų valdytojo / Turnstile reikšmių. Šiame pakeitime tikri vartotojo duomenys nesugalvoti.
- Tikri iPhone/Android failai, fizinių telefonų UX, native Cloudflare galutinė versija, DNS / HTTPS, Search Console, realūs CWV ir screen reader patikra šiame pakeitime neatlikti. Ankstesnė responsive patikra buvo su išsaugotu viešu dizainu; šį kartą nepaskelbiama nauja rankinės naršyklės QA išvada.
- Klientų nuotraukos nepridedamos prie viešos galerijos ar GitHub. Vieši galerijos failai ir Git istorija nėra privati juodraščių saugykla.

## Telefono jungiklis, laiško išdėstymas ir atėjimo šaltinis

2026-10-20: PASS `npm run check` (lint, TypeScript 44 failai be klaidų / perspėjimų, build, SEO, 57/57 testų, 458 resursų ir nuorodų, 43 JSON-LD, Worker smoke, atskiras galerijos generavimo testas). Pridėti testai tikrina telefono off/on, HTML escaping, glaustą laiško turinį / tuščių laukų praleidimą, referrer sanitizavimą, sutikimą, šaltinio išlaikymą tarp vidinių puslapių, atsisakymą ir galiojimą.

PUBLIC_SHOW_PHONE pagal nutylėjimą off; telefono įvedimas kliento formoje nekeistas. Galerija ir bendras dizainas išsaugoti. HTML laiškas naudoja inline stilius ir lenteles, turi plain-text alternatyvą; tikro Gmail/iPhone siuntimo išvaizda po šio pakeitimo dar nepatikrinta. Atėjimo šaltinis – pasirenkamas ir nepatikimas lankytojo pateiktas domenas, nesaugomas iki analitikos sutikimo, be URL parametrų / paieškos žodžių / kelių. Tikras šaltinis ne visada pasiekiamas.
