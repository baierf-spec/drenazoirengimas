# SEO turinio planas

Atnaujinta 2026-10-19. Tikslas – padėti namo ar sklypo savininkui suprasti vandens problemą ir pateikti informuotą užklausą. Nėra patvirtintos rangovų aprėpties, tikrų darbų archyvo ar viešintino valdytojo duomenų. Viešas paleidimas kol kas blokuojamas; žemiau nurodytas numatytas indeksavimas po aktyvavimo.

## Dabartinė struktūra

| URL / tema                                     | Sprendimas                        | Skirtingas lankytojo poreikis ir turinio apimtis                                                                                              |
| ---------------------------------------------- | --------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| `/`                                            | Palikti, indeksuoti               | Paslauga, simptomai, trys sprendimų tipai, veikimas, procesas, kainos veiksniai, užklausų geografija, DUK ir CTA.                             |
| `/pamatu-drenazas/`                            | Palikti, indeksuoti               | Vanduo prie konstrukcijų, drėgnas rūsys, hidroizoliacijos skirtumas, esamų pamatų ir aplinkos įvertinimas.                                    |
| `/sklypo-drenazas/`                            | Palikti, indeksuoti               | Užmirkęs kiemas, paviršinis ir grunto vanduo, reljefas, privažiavimas ir dangų atkūrimas. Molio tema turi atskirą `#molingas-gruntas` skiltį. |
| `/lietaus-vandens-nuvedimas/`                  | Palikti, indeksuoti               | Vanduo nuo stogo ir kietų dangų, surinkimo taškai, kaupimo, infiltracijos ir priėmimo sąlygos.                                                |
| `/drenazo-kaina/`                              | Palikti, indeksuoti               | Kainos veiksniai ir pasiūlymų palyginimas; paaiškinamas orientacinis modelis su prielaidomis ir išimtimis. Tai ne patvirtintas kainoraštis.   |
| `/vanduo-sklype/`                              | Palikti, indeksuoti               | Problemos atpažinimas: kada ir kur kaupiasi vanduo, ką stebėti ir fotografuoti prieš pokalbį.                                                 |
| `/drenazas-ar-lietaus-nuotekos/`               | Palikti, indeksuoti               | Abiejų sistemų paskirties palyginimas, bendro vertinimo poreikis ir pasiūlymų skirtumai.                                                      |
| `/duk/`                                        | Palikti, indeksuoti               | 12 glaustų atsakymų; nukreipimas į išsamesnes paslaugų ir problemų temas.                                                                     |
| `/privatumo-politika/`                         | Palikti, indeksuoti po aktyvavimo | Faktinis duomenų srautas ir lankytojo teisės. Prieš paleidimą būtina užpildyti bei patvirtinti valdytojo ir gavėjų informaciją.               |
| `/gauti-pasiulyma/`, `/diagnostika/`, `/aciu/` | Palikti, `noindex, follow`        | Pagalbinės konversijos priemonės; nėra atskiri SEO straipsniai.                                                                               |
| `/projektai/`                                  | Palikti, `noindex, follow`        | Kol nėra patvirtintų atvejų, paaiškinama dokumentavimo svarba. Netvirtinama, kad iliustracijos rodo atliktus darbus.                          |
| `/404.html` ir nežinomi keliai                 | 404, `noindex`                    | Tikras nerasto puslapio atsakymas; ne sitemap dalis.                                                                                          |

## Užklausoje pasiūlyti papildomi URL

| Siūlomas URL                   | Sprendimas dabar        | Kada verta atskira publikacija                                                                                                                                                                                                            |
| ------------------------------ | ----------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/drenazo-irengimas-vilniuje/` | Nekurti                 | Rangovo patvirtinta reali teritorija, miestui aktualių sąlygų analizė, vieši šaltiniai, unikalus patikrintas vietinis atvejis su leidimu ir konkretus paslaugos procesas. Negalima iš miesto pavadinimo spręsti grunto ar leidimų sąlygų. |
| `/drenazo-irengimas-kaune/`    | Nekurti                 | Tokie pat faktiniai įrodymai Kaunui. Vilniaus tekstas su pakeistu miesto vardu netinka.                                                                                                                                                   |
| `/dregsta-pamatai/`            | Kol kas nekuriama       | Dabar turinys pateiktas pamatų puslapyje. Atskiras straipsnis prasmingas tik turint specialistų peržiūrėtą priežasčių atskyrimą, apžiūros pavyzdžių ir aiškiai savitą diagnostinį tikslą.                                                 |
| `/sklype-stovi-vanduo/`        | Nekurti dublikato       | Šį poreikį jau tenkina `/vanduo-sklype/`. Siūlomas URL neturi atskiro turinio ir šiuo metu grąžina 404; fiktyvus alias nereikalingas. Jei ateityje keičiamas tikras esamas URL, naudoti vieną 301 į išlikusį kanoninį puslapį.            |
| `/drenazas-molingame-grunte/`  | Kol kas atskira skiltis | Dabar `/sklypo-drenazas/#molingas-gruntas`. Atskiras straipsnis tik su išsamesniais patikrintais grunto, filtro parinkimo bei nuvedimo scenarijais ir savarankiška nauda; tada sutrumpinti dubliuojamą skiltį ir susieti nuorodomis.      |

## Miestų turinio plėtimas kode

`src/data/locations.ts` pateikia vieną redaguojamą tuščią registrą. Kiekvienam įrašui reikalaujama `coverageConfirmed: true`, `reviewed: true`, tinkamo URL, šaltinių ir turinio skyrių. `[slug].astro` iš jo kuria straipsnius; bendras `pages.ts` įrašo tik patvirtintus kelius į metadata ir sitemap registrą.

Šie techniniai požymiai neįrodo kokybės. Redaktorius turi perskaityti vietinį turinį, patikrinti šaltinius ir faktinę aprėptį. Nėra miestų masyvo automatinio dauginimo, paslėptų SEO puslapių, vietovardžių debesų ar automatiškai indeksuojamų juodraščių. Prieš pridedant pirmą miestą reikia įvertinti, ar jo turinys skiriasi nuo bendros paslaugos ir kito miesto. Pridėjus puslapį atnaujinti šį planą ir paleisti `npm run check` bei `npm run audit:seo`.

## Tolimesni darbai pagal prioritetą

1. **Prieš viešą domeną:** patvirtinti valdytoją, veiklos modelį, tikrus kontaktus, rangovų teritorijas, kainų pateikimą ir privatumo tekstą. Išbandyti realią užklausą bei mobilų maketą.
2. **Pirmi tikri atvejai:** rinkti situaciją, tikrą vietovę be perteklinių asmens duomenų, vertinimo pagrindą, sutartą apimtį, darbų nuotraukas prieš užpilant, schemą ir leidimą publikuoti. Rezultatų nevadinti garantija kitiems objektams.
3. **Pirmi miestai:** pradėti tik nuo patvirtinto Vilniaus ir/ar Kauno; nenurodyti neegzistuojančio vietinio biuro, adreso ar Google Business Profile. Tikras verslo profilio tinkamumas tikrinamas pagal faktinį veiklos modelį.
4. **Po indeksavimo:** Search Console tikrinti užklausų grupes, puslapių tarpusavio konkurenciją ir prasmę lankytojui. Plėsti pagal realius neatsakytus klausimus, o ne puslapių skaičiaus tikslą.

Atnaujinant skaičius ar kainas nurodyti patikrinimo datą ir pagrindą. `lastmod` pridėti tik turint tikrą konkretaus puslapio pakeitimo datą. Nenaudoti kiekvieno build laiko kaip tariamo turinio atnaujinimo.

## 2026-10-20 galerijos papildymas

`/projektai/` paliktas navigacijoje, kol tuščias – sąmoninga būsena ir noindex. Savininkui prijungus Cloudflare galeriją, tikri published įrašai gyvai sukuria `/projektai/{slug}/`, listing ir sitemap be deploy. Private `/gallery-manager/` bei draft puslapiai neindeksuojami. Miestų turinio vartai nesikeičia; projekto vietovė nėra pagrindas automatiškai sugeneruoti miesto landing.
