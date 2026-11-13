# GEO / generatyvios paieškos strategija

2026-10-19. Svetainė ruošiama patikimam supratimui ir citavimui. Negarantuojamas patekimas į AI atsakymus, Google indeksą ar konkreti paieškos pozicija.

## Įgyvendintas pagrindas

Svarbus turinys yra Astro sugeneruotame lietuviškame HTML. Jis nepriklauso nuo kliento JS, o DUK atsakymai yra įprastuose `details` elementuose. Aiški paslaugų, problemų ir kainos struktūra leidžia atsakymą perskaityti su jo kontekstu. Terminai atskiria vandenį grunte, paviršinį vandenį, lietaus sistemą ir hidroizoliaciją.

| Klausimas                               | Matoma atsakymo vieta                                  | Ką atsakymas paaiškina                                                                                            |
| --------------------------------------- | ------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------- |
| Kada reikalingas drenažas?              | Pradžia ir `/duk/`                                     | Kartotinis vandens kaupimasis yra priežastis įvertinti situaciją; vien simptomas nepatvirtina būtinybės kasti.    |
| Kaip suprasti problemos priežastį?      | `/duk/`, `/vanduo-sklype/`                             | Stebėti vietą, laiką ir pasikartojimą; nuotraukos ir klausimynas nėra patikima galutinė diagnozė.                 |
| Kuo skiriasi pamatų ir sklypo drenažas? | Pradžia, `/duk/`, paslaugų puslapiai                   | Skiriasi vertinama zona; sprendimas priklauso nuo grunto ir nuvedimo, pamatų drenažas neatstoja hidroizoliacijos. |
| Ar tinka molingam gruntui?              | Pradžia, `/duk/`, `/sklypo-drenazas/#molingas-gruntas` | Filtro, drenuojančio sluoksnio ir priėmimo sąlygos vertinamos konkrečiai; infiltracija nežadama iš anksto.        |
| Kur nuvedamas vanduo?                   | Pradžia, schema, `/duk/`, lietaus puslapis             | Būtina techniškai tinkama ir leistina priėmimo vieta. Šulinys nėra savaime galutinė priėmimo vieta.               |
| Ar lietaus vanduo ir drenažas tas pats? | `/duk/`, `/drenazas-ar-lietaus-nuotekos/`              | Atskirta abiejų sistemų paskirtis ir bendro vertinimo poreikis.                                                   |
| Kas lemia kainą?                        | Pradžia, `/duk/`, `/drenazo-kaina/`                    | Darbų apimtis, sąlygos, medžiagos, nuvedimas ir atkūrimas; skaičiuoklė aiškiai atskirta nuo pasiūlymo.            |
| Kiek trunka darbai?                     | `/duk/`                                                | Trukmė tikslinama įvertinus trasą, sąlygas ir derinimus; visiems objektams vienodas terminas neišgalvojamas.      |
| Kada reikia apžiūros?                   | Pradžia ir `/duk/`                                     | Kai iš pateiktos informacijos neaiškus reljefas, vandens šaltinis, tinklai ar priėmimas.                          |

12 DUK atsakymų laikomi viename `src/data/site.ts` šaltinyje. Pirmi šeši rodomi pradžioje, visi – DUK puslapyje. JSON-LD kuriamas iš tų pačių duomenų, automatizuotas palyginimas patikrina atitikimą matomam tekstui. FAQ žymėjimas nėra pažadas gauti išplėstinį rezultatą.

## Patikimumo ribos ir įrodymų planas

- Nepateikiami išgalvoti autoriai, ekspertų kvalifikacijos, patirties metai, projektų skaičiai, atsiliepimai ar garantijos. Faktinis valdytojas ir paslaugos modelis turi būti aiškūs prieš viešą paleidimą.
- Techninė schema pažymėta principine iliustracija. Nenurodomi universalūs kasimo gyliai, atstumai ar nuolydžiai. Fotografijos yra iliustracijos, ne atliktų darbų įrodymas.
- Molingo grunto skiltyje pateikiamos gamintojo Wavin nuorodos. Jos pagrindžia vertinimo poreikį, bet nėra konkretaus objekto projektas ar rekomendacija visur naudoti tą patį filtrą.
- Ateityje publikuoti tikrų atvejų paaiškinimus, nurodyti peržiūrėjusį specialistą tik kai jis iš tikrųjų dalyvavo ir sutiko, parodyti patikrintus šaltinius ir faktinę atnaujinimo datą.
- Miesto pavadinimas savaime nesuteikia ekspertinio autoriteto. Vietiniai puslapiai galimi pagal SEO_CONTENT_PLAN.md įrodymų reikalavimus.

## Ko papildomai nedarome

Nekuriamas atskiras „AI SEO“ tekstas, specialus slaptažodžių/užklausų blokas robotams, `llms.txt` kaip tariama būtina sąlyga, neegzistuojanti schema ar masiškai dauginami miestų puslapiai. AI paieškai skirtas turinys nesiskiria nuo lankytojui matomo turinio.

## Matavimas po tikro paleidimo

Search Console tikrinti indeksavimo būklę ir paslaugų, problemų, kainos bei geografinių užklausų grupes. Su sutikimu matuoti `primary_cta_click`, `phone_click`, `quote_started`, `quote_submitted`, `photo_uploaded`, diagnostikos ir skaičiuoklės užbaigimą. Vertinti realias užklausas ir jų tinkamumą, o ne vien citavimo ar peržiūrų skaičių. Atskirų AI platformų referalų ataskaitas galima vertinti analitikoje tik laikantis faktiškai įjungtų įrankių privatumo nustatymų. Nei vardų, nei formos teksto, nei nuotraukų pavadinimų į įvykius nesiųsti.

## Naudoti oficialūs šaltiniai

Patikrinta 2026-10-19:

- [Google: AI optimization guide](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide) – galioja įprasti naudingo turinio ir techninio SEO principai, atskiras AI žymėjimas nereikalingas.
- [Google: Spam policies](https://developers.google.com/search/docs/essentials/spam-policies) – doorway ir masiškai be vertės kuriamo turinio rizika.
- [Wavin: drenažo vamzdžiai](https://wavin.com/lt/s/C02_F006_S079/Drenazo-vamzdziai) – paskirtis ir filtro parinkimo priklausomybė nuo grunto.
- [Wavin: kaupimo ir infiltracijos skaičiavimo gairės](https://wavin.com/lt/solutions/spotlight/vandens-kaupimo-ir-infiltravimo-rezervuaru-susidedanciu-is-moduliniu-deziu-skaiciavimo-gaires) – objekto ir grunto sąlygų vertinimas.
