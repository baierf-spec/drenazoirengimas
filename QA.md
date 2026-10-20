# Galutinė QA — 2026-10-20

**PRE-LAUNCH STATUS: NOT READY** viešam drenazoirengimas.lt aktyvavimui. Galerijos kodas parengtas, bet Cloudflare account integracijos sąmoningai neaktyvuotos pagal užduotį. Ši ataskaita neskiria mock rezultatams gyvų integracijų statuso.

## Atlikta

`npm run build:production` taip pat paleistas: preflight pagrįstai BLOKUOJA dėl PUBLIC_PHONE, PUBLIC_CONTACT_EMAIL, PUBLIC_CONTROLLER_NAME, PUBLIC_CONTROLLER_ADDRESS, PUBLIC_TURNSTILE_SITE_KEY ir PUBLIC_SITE_MODE=production trūkumo. Žemiau nurodytas praėjęs production-mode HTML build nėra šio saugiklio apeita aktyvacija.

| Patikra                             | Rezultatas           | Faktinė apimtis                                                                                                                                                                           |
| ----------------------------------- | -------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Lint                                | PASS                 | ESLint šaltiniui, Worker, testams ir skriptams.                                                                                                                                           |
| Typecheck                           | PASS                 | Astro 42 failai, 0 errors / warnings / hints; Worker tsc praėjo.                                                                                                                          |
| Automatika                          | PASS                 | 69/69 testų, 7 failai.                                                                                                                                                                    |
| Astro build                         | PASS                 | 15 statinių HTML puslapių, robots / sitemap ir native assets / Sites compatibility bundle.                                                                                                |
| Production-mode SEO build           | PASS                 | Izoliuotas .audit-production: 15 puslapių, 9 baziniai indeksuojami URL, unikalios metadata, schema / FAQ / breadcrumb atitikimas. Tai ne production aktyvavimo vartų apėjimas.            |
| Nuorodų / resursų crawl             | PASS                 | 467 nuorodos / resursų nuorodos, 13 img, 45 JSON-LD objektai; 1 H1, lt, canonical ir OG.                                                                                                  |
| Supakuotas Worker                   | PASS, in-process     | Puslapių 200, nežinomi ir neegzistuojantis projekto kelias 404, preview robots / sitemap / noindex, neaktyvus API 503.                                                                    |
| Cloudflare dry-run                  | PASS                 | Wrangler 4.151.2 supakuoja native Worker ir esamų binding deklaracijas; ne tikras account deploy.                                                                                         |
| Projekto validacija                 | PASS                 | Pavadinimas, aprašymas / cover publikavimui, metų / tikros datos validacija, publikavimo pavadinimų unikalumas, versijos konfliktai.                                                      |
| Draft / publish / unpublish         | PASS                 | Tikras SQLite su nauja migracija; juodraščiai nėra vieši, cover privalomas, slėpimas pašalina viešą puslapį / nuotrauką ir sitemap URL.                                                   |
| Galerijos listing / detail          | PASS, server tests   | Tik published, serverio HTML, title/description/canonical/cover OG/BreadcrumbList/H1/srcset; pavadinimo keitimas išlaiko paskelbtą slug.                                                  |
| Saugumas                            | PASS, tests          | Access RS256 JWT su vietiniais raktais, issuer/aud/expiry/email; JWKS HTTP imituojamas. Trūkstamas / fake žetonas, neleistinas paštas, HTML/encoded alias, cross-Origin rašymas atmetami. |
| Nuotraukos                          | PASS, tests          | Tikri sharp sugeneruoti WebP konteineriai serverio teste, MIME / dydžio / matmenų / EXIF valymas, idempotent retry, privatus saugojimas, viešas no-store. R2 imituojamas.                 |
| Redaktoriaus UI                     | PASS, DOM            | Juodraščio kūrimas, laukų / versijos / cover perdavimas, publikavimo būsena, kelių failų eilė ir failed retry, neaktyvaus API klaida. DOM testai nėra fizinio telefono įrodymas.          |
| HEIC konvertavimo šaka              | PASS, mocked decoder | Native decode nesėkmė → automatinis heic-to → WebP 480/960/1600; JPEG neįkelia fallback; netinkamas / per didelis failas atmetamas. Tikras libheif konkrečiame telefone netikrintas.      |
| Tvarka / trynimas                   | PASS                 | Projektų ir nuotraukų rikiavimas, paskutinės nuotraukos trynimas → draft, R2 trynimo klaidos eilė ir pakartojimas.                                                                        |
| Backup / restore                    | PASS, actual SQLite  | Metaduomenų eksportavimo formato atkūrimo SQL išlaiko visas eilutes, IDs, slugs ir objektų raktus; realus R2/S3 kopijavimas nevykdytas.                                                   |
| Ankstesnis lead srautas             | PASS, external mocks | Validacija, Turnstile taisyklės, SQLite saugojimas, private photos, email Reply-To/retry, tinklo klaidos, busy ir duplicate submit.                                                       |
| Diagnostika / skaičiuoklė / consent | PASS                 | Ankstesni realių funkcijų bei DOM testai; klaidų / patvirtinimo būsenos išlaikytos.                                                                                                       |
| Secrets                             | PASS, scoped         | Galutinių tracked failų pattern scan ir keitimų peržiūra; realių paskyrų raktų nėra. Tai nėra visų įmanomų formatų matematinė garantija.                                                  |

`npm run check` dabar apima lint → typecheck → build → production SEO audit → tests → built crawl, todėl naujam clone netrūksta gallery testų skaitomo production HTML. `npm test` atskirai reikalauja prieš tai build ir audit:seo. HEIC lazy dekoderio chunk dydžio perspėjimas yra tikras ir dokumentuotas, ne užslėptas. Vieša landing JS šio dekoderio neįkelia.

## Naršyklės QA, kuri tikrai atlikta

Šį kartą naudota tikra Chrome naršyklė ir palaikoma vietinė Astro peržiūra. Responsive patikra atlikta per to paties origin iframe su kiekvienu nurodytu viewport pločiu. Tai CSS / maketo peržiūra, ne touch įrenginio emuliacija. Desktop scroll bar užima 15 px; todėl 360 px frame clientWidth yra 345 px ir t. t.

| Puslapis / būsena                                      | 360         | 390         | 430         | 768         | 1024        | 1440        |
| ------------------------------------------------------ | ----------- | ----------- | ----------- | ----------- | ----------- | ----------- |
| Pradžia                                                | no overflow | no overflow | no overflow | no overflow | no overflow | no overflow |
| Projektai, empty                                       | no overflow | no overflow | no overflow | no overflow | no overflow | no overflow |
| Gallery manager, atidarytas naujo projekto redaktorius | no overflow | no overflow | no overflow | no overflow | no overflow | no overflow |
| Kaina                                                  | no overflow | no overflow | no overflow | no overflow | no overflow | no overflow |
| Užklausa, pirmas žingsnis                              | no overflow | no overflow | no overflow | no overflow | no overflow | no overflow |

Pradinėje manager peržiūroje 360 / 390 px scrollWidth buvo 386 px: netinkamai paslėptas native file input. Taisyta tik naujo redaktoriaus scope; pakartojus visuose pločiuose scrollWidth sutapo su clientWidth. Išskleidžiamas kainos kilmės blokas atvertas ir tekstas perskaitytas naršyklėje. Mobilus meniu / Projektai nuoroda peržiūrėti; native klaviatūros Enter veikimas tikrintas. Vizualiai spot-check pradžios mobilus maketas ir manager redaktorius; visų puslapių pilnas screenshot / kontrasto sertifikavimas neteigiamas.

Privatus API per Astro dev nėra paleidžiamas, todėl manager pradžioje matoma nekonfigūruoto API / prisijungimo klaida. Tikras Worker autorizacijos kelias tikrinamas atskirai serverio testais. Publikuotų projektų maketas naršyklėje su tikru backend netikrintas: realių projektų neprikurta. Lokalios QA pagalbinės HTML priemonės pašalintos ir neįtrauktos į build / repo.

## Turinys ir išsaugotos ribos

Išsaugota navigacija su Projektai, esamas layout, šriftas, spalvos, CTA / lead flow. Pridėtas vienas privatus galerijos redaktorius be admin modulių. Galerijoje nėra seed projektų ar neautentiškų rezultatų. Matomas laukimo tekstas profesionalus. Core message sustiprintas vienoje veikimo sekcijoje; pasikartojančių disclaimers sumažinta. Kainos kilmės bloke nėra išgalvotų šaltinių. Privatumo puslapis nebevadina svetainės development versija; trūkstami tikri valdytojo duomenys aiškiai išvardyti tik konfigūracijoje / DEPLOYMENT.

## Dar neatlikta / savininko aktyvavimo darbai

- Tikri Cloudflare D1/R2 binding, native gallery migracija ir Access aplikacija / email OTP / owner policy. GALLERY_ENABLED=false paliktas; mokami ar negrįžtami paskyros pakeitimai nevykdyti.
- Tikri iPhone / Android HEIC / HEIF failai, pasirinkimas iš nuotraukų bibliotekos, touch drag/drop, realus XHR upload progress bei retry pagal natūralaus tinklo sutrikimą.
- Gyva Access sesija, app path policy, expired sesijos / neleistino email atmetimas edge lygiu; galutinis Worker CSP su tikru HEIC dekoderiu.
- Tikras end-to-end gallery create → R2/D1 → publish → detail/sitemap → unpublish → 404, ir pilnas R2 backup/restore kitoje paskyroje. Lokalus SQLite round-trip nėra šis testas.
- Tikri lead Turnstile / Cloudflare Email / gavėjai, admin ir customer laiškai, lifecycle ir cron.
- Faktinis valdytojas, kontaktai, privatumo / gavėjų / aprėpties / kainų patvirtinimas; build:production preflight ir toliau neleidžia paleisti su tuščiais duomenimis.
- Canonical domeno DNS / HTTPS / WWW ir HTTP redirect grandinė, Search Console ir Rich Results po aktyvavimo. GitHub paskyros publikavimas atskirai, jei savininkas jo nori; šaltinis išsaugomas esamame Sites repo ir handoff.
- Lighthouse, lauko CWV (LCP / INP / CLS), tikras screen reader ir visas kontrasto auditas nematuoti / nevykdyti.

Neatliktos account integracijos nėra pristatomos kaip veikiančios. Tiksli pajungimo ir perdavimo eiga: GALLERY_MANAGEMENT.md / DEPLOYMENT.md. Kodas paruoštas binding; viešo domeno paleidimas laukia šių darbų.

## Cloudflare Email pakeitimas — 2026-10-20

- Pašalintas išorinio el. pašto tiekėjo HTTP transportas ir API rakto poreikis; naudojamas native `EMAIL` send_email binding ir Cloudflare struktūrinis laiškas.
- PASS: `npm run check` — lint, TypeScript (0 errors/warnings/hints), build, production-mode SEO audit, 70/70 testų, 467 vidinių nuorodų / resursų patikros ir packaged Worker smoke.
- Testuose Cloudflare binding imituojamas: admin ir pasirenkamas customer gavėjas, Reply-To, nuotraukų nuorodos, retry po klaidos, išjungti klientų patvirtinimai, trūkstamo binding atmetimas. Tikro laiško pristatymas į Inbox dar nepatikrintas.
- `CUSTOMER_CONFIRMATION=false` numatyta konfigūracijoje. Patvirtintam savininkui skirtas pradinis siuntimas nesukuria pareigos įjungti mokamą klientų siuntimą.
- `EMAIL_SETUP.md` — lietuviška savininko instrukcija; runtime / build reikšmės atskirtos. Dizainas ir galerija nekeisti.
- Žinoma build pastaba: ankstesnis tingiai įkeliamas HEIC dekoderis išlaiko >500 kB chunk perspėjimą; viešiems puslapiams jis nekraunamas.
