# Decap CMS — drenazoirengimas.lt

## Architektūra

Administravimas: **https://drenazoirengimas.lt/admin/**. Decap CMS 3.17.1 (fiksuota versija, jsDelivr, pagrindinio skripto SRI) naudoja GitHub backend, `baierf-spec/drenazoirengimas`, `main`. „Išsaugoti / publikuoti“ sukuria GitHub commit; esama Cloudflare Workers Builds integracija po sėkmingo build atnaujina viešą svetainę. Tai nėra momentinis DB įrašas: įprastai reikia palaukti build pabaigos. Naujo deploy mygtuko savininkui spausti nereikia.

Astro, esamas Worker `drenazoirengimas`, `ASSETS`, `EMAIL` ir kontaktinės formos išlieka. Nėra naujo Worker, subdomeno, D1, R2, Netlify Identity/Git Gateway, mokėjimų ar CRM. CMS priedas įkeltas tik `/admin/`; lankytojų puslapiai jo neįkelia.

OAuth tame pačiame Worker: `/auth` → GitHub → `/callback` → patikrintas CMS iššokantis langas. Papildomo DNS nereikia. Esamas kanoninis domenas lieka https://drenazoirengimas.lt.

## Vienkartinis GitHub OAuth prijungimas

Šio veiksmo negali atlikti GitHub turinio jungtis: ji nesuteikia paskyros OAuth programų administravimo teisių.

1. Prisijunk prie paskyros, kuri valdys OAuth programą: https://github.com/settings/applications/new .
2. Sukurk **OAuth App**, ne GitHub App, su šiais laukais:
   - Application name: `Drenazo irengimas CMS`
   - Homepage URL: `https://drenazoirengimas.lt`
   - Authorization callback URL: `https://drenazoirengimas.lt/callback`
   - Device flow: neįjungti.
3. Programos puslapyje gauk Client ID ir sugeneruok Client secret. Nesiųsk slapto rakto per pokalbį ar GitHub.
4. Cloudflare → Workers & Pages → **drenazoirengimas** → Settings → Variables and Secrets įrašyk:

| Laukas | Tipas | Reikšmė |
| --- | --- | --- |
| `GITHUB_CLIENT_ID` | Secret (arba Text) | Šios OAuth programos Client ID |
| `GITHUB_CLIENT_SECRET` | Secret | Šios OAuth programos Client secret |
| `OAUTH_STATE_SECRET` | Secret | Atsitiktinė bent 32 simbolių reikšmė |

`OAUTH_STATE_SECRET` sukurk slaptažodžių tvarkyklės generatoriumi arba lokaliai `openssl rand -hex 32`. Nesaugok jo saugykloje. Cloudflare išsaugok ir pritaikyk naują Worker versiją. Esamų `TURNSTILE_SECRET_KEY`, `EMAIL_FROM`, `ADMIN_EMAIL`, `BUSINESS_REPLY_TO` ir EMAIL binding nekeisk / netrink — tai atskira veikianti užklausų infrastruktūra.

5. Atverk `/admin/`, spausk **Prisijungti su GitHub**, patvirtink savo OAuth programą. Naršyklėje leisk šios svetainės iššokantį langą.
6. Išbandyk nedidelį teksto pakeitimą, patikrink GitHub commit ir Cloudflare build, tada patikrink viešą svetainę. Grąžink bandomąjį tekstą. Nuotraukų bandymui naudok neutralią savo nuotrauką; nekuriame tariamo atlikto darbo. Baigus pašalink testinį įrašą ir media failą.

Tai paskyros autorizacijos žingsniai, ne kode praleista imitacija. Kol OAuth secrets neprijungti, `/admin/` rodo tikrą GitHub login, o `/auth` aiškiai grąžina 503. Jokio viešo testinio prisijungimo ar slapto administratoriaus slaptažodžio nėra.

## Turinio skyriai ir failai

| CMS skyrius | Vienintelis turinio šaltinis |
| --- | --- |
| Pagrindinis | `src/content/home.json`, `src/content/problems.json` |
| Paslaugos ir patarimai | `src/content/services.json`, 5 esami `src/content/articles/*.json` |
| Kainos | `src/content/pricing.json` |
| Projektai ir galerija | Atskiri `src/content/projects/*.json` |
| DUK | `src/content/faq.json` |
| Kontaktai ir svetainės nustatymai | Esamas `site.config.json` |
| SEO | `src/content/seo.json`; projekto SEO — pačiame projekte |

Iš `src/data/site.ts`, `src/data/articles.ts`, `src/data/pages.ts` ir Astro puslapių perkelti esami tekstai. Šie moduliai dabar krauna JSON. Klausimai filtruojami pagal `enabled`; tas pats filtras naudojamas matomiems atsakymams ir FAQ JSON-LD. Paslaugų kortelių `enabled` slepia kortelę; esamų puslapių adresai apsaugoti, jų ištrinti CMS negalima. Iliustracijos, ikonėlės, CSS, struktūra, URL, canonical, robots, indeksavimo infrastruktūra ir analitikos raktai CMS nerodomi kaip redaguojami verslo laukai. GitHub teises turintis žmogus vis tiek gali keisti kodą tiesiogiai — tai nėra atskira leidimų smėliadėžė.

`site.config.json` lieka vienintelis veiklos nustatymų šaltinis. Jame yra telefono on/off (dabar off), kontaktai, užklausų on/off, CTA, teritorijos, poraštė, valdytojas. Canonical, email env nuorodos, Turnstile ir analitika CMS paslėpti. Tai ne nauja Cloudflare nustatymų kopija. Nepridėtos išgalvotos įmonės, socialiniai profiliai ar darbai.

Kainų skiltyje redaguojamas tik esamas kainos paaiškinimas, veiksniai ir tikrų šaltinių sąrašas. Skaičiuoklės formulė / modelio koeficientai lieka programuotojo valdoma `src/lib/estimator.ts` dalis, kad neatsirastų su paaiškinimu nesuderintų skaičiavimų. Tai orientacinis planavimo modelis, ne patvirtintas kainoraštis. Šaltinių sąrašas pradžioje tuščias; pateiktos nuorodos turi iš tikrųjų pagrįsti aprašytą intervalą.

## Naujas projektas ir nuotraukos

1. Projektai ir galerija → **Naujas projektas**.
2. Įrašyk pavadinimą ir bent trumpą aprašymą. Vietovė, tipas, užbaigimo data/metai, problema, sprendimas, darbų apimtis, trukmė ir reali kaina — neprivalomi.
3. Nuotraukų medijos lange įkelk savo tikras nuotraukas. Galima parinkti kelis failus arba juos nutempti; paskui priskirk projekto nuotraukų sąraše. Alt tekste aprašyk, kas matosi. Sąrašo tvarką keisk traukiant elementus; pašalink nereikalingą elementą. Medijos failo ištrynimas yra atskiras veiksmas, kad nesugadintų kitame įraše naudojamos nuotraukos.
4. Viršelį pasirink atskirame lauke. Jei nepasirenki, rodoma pirmoji nuotrauka. Mažesnis eiliškumo skaičius rodo projektą anksčiau.
5. Pasirink Juodraštis arba Publikuota ir išsaugok. Tik publikuotas projektas po sėkmingo build gauna `/projektai/[slug]/`, listingą ir sitemap įrašą.

Projekto failo vardas yra stabilus slug; pavadinimo redagavimas nekeičia esamo failo vardo / URL. Nekurk naujo įrašo vien tam, kad pervadintum seną. Projektą išpublikavus arba ištrynus, po kito build jo puslapis grąžina 404 ir nelieka sitemap.

**Nuotraukų ribos:** po vieną iki 20 MB, iki 30 nuotraukų projekte. JPG/PNG/WebP ir iPhone HEIC/HEIF (saugus vietinis konvertavimas naršyklėje, `heic-to/csp`, tingiai užkraunamas tik HEIC atvejui). Parenkant failus rodoma paruošimo būsena ir aiški klaida su pakartojimo galimybe; Decap rodo perdavimo / išsaugojimo būseną. Naršyklė mažina iki 1600 px ir perkuria vaizdą be EXIF; nauji vardai turi atsitiktinį sufiksą. Labai didelė raiška (>60 MP) atmetama. Konverteris gali neperskaityti pažeistų ar nepalaikomos HEIF atmainos failų — rodoma klaida, sėkmė neimituojama.

Failai saugomi `public/images/projects/` ir GitHub istorijoje. Build dar kartą tikrina faktinį formatą / dydį, perkuria WebP 480/960/1600 px (nepadidina mažesnės nuotraukos), pašalina metaduomenis. Sugeneruoti failai turi turinio hash ir patenka į `_generated/`; `src/data/generated-projects.json` yra ignoruojamas atkuriamas manifestas. Į galutinį `dist/client/images/projects/` patenka tik optimizuotos, publikuotų įrašų arba SEO nurodytos versijos. Žali ir nenaudojami upload failai į viešą build nekopijuojami. `srcset`, `sizes`, `width`, `height`, alt ir lazy loading išlaikyti.

**Saugykla vieša.** Net juodraščio JSON ir failai bei ištrintų failų istorija gali būti pasiekiami per GitHub. Tai turinio publikavimo sistema, ne privati failų saugykla. Klientų formų nuotraukos toliau siunčiamos tik paštu, jos automatiškai nepatenka į CMS.

## OAuth saugumas ir prieiga

- Priimamas tik HTTPS kanoninis origin ir GitHub provider, patikrinamas CMS `site_id`; ignoruojami vartotojo siūlomi redirect ir scope.
- 10 min. HS256 pasirašyta būsena su issuer/audience, Secure HttpOnly SameSite=Lax `__Host-` cookie ir GitHub PKCE S256.
- Callback prieš kodo keitimą tikrina cookie/būseną/galiojimą; cookie išvalomas. GitHub authorization code yra vienkartinis. Naujas login tame pačiame browser perrašo ankstesnį bandymą, todėl nereikia vienu metu kelių login langų.
- Po OAuth tikrinamas `/user` ir tik šios saugyklos `permissions.push`. Read-only ar pašalinė paskyra negauna CMS tokeno.
- Popup handshake tiksliai tikrina `event.origin`, `event.source` ir fiksuotą pranešimą; tokenas nesiunčiamas į `*`, query, redirect URL ar logus. Callback naudoja vienkartinį CSP nonce, no-store ir no-referrer.
- `/admin/`, `/auth`, `/callback` turi noindex; jų nėra sitemap. Kitų puslapių CSP nesusilpninta; CMS turi jai reikalingus GitHub/CDN/blob leidimus ir `script-src 'unsafe-eval'`, nes Decap konfigūracijos šablonai naudoja JavaScript vykdymą iš eilutės. Ši išimtis taikoma tik `/admin/` maršrutams; viešuose puslapiuose ir OAuth callback ji neleidžiama.
- Decap GitHub backend standartinis tokenas yra naršyklės administravimo sesijoje / localStorage. Atsijunk bendrame įrenginyje, nenaudok nepatikimų naršyklės plėtinių. `/admin/` login ekranas viešas; turinio keitimą saugo GitHub.
- `public_repo` OAuth leidimas GitHub pusėje apima naudotojo viešas saugyklas, ne tik šią. Proxy tikrina būtent šios saugyklos rašymo teisę, bet negali susiaurinti GitHub OAuth tokeno iki vieno repo. Neduodame `repo` / `workflow` scope; pavertus saugyklą privačia reikės atskiro saugumo sprendimo.

Pridėti redaktorių: GitHub repository → Settings → Collaborators suteik Write tik reikiamam žmogui. Jis prisijungia savo GitHub paskyra ir autorizuoja tą pačią OAuth App. CMS user/role administravimo skydelio nėra. Pašalinus žmogų iš repo jis nebegali rašyti GitHub; prireikus atšauk jo OAuth prieigą.

## Vietinis darbas ir atkūrimas

```bash
npm ci
npm run dev
npm run check
npm run build:production
npm run deploy:dry-run
```

Node 24. `cms:prepare` validuoja redaguojamą turinį, generuoja `/admin/config.json` ir `.yml`, admin HEIC adapterį, vaizdų manifestus. Šie sugeneruoti failai necommittinami. Dev, build, typecheck ir tests juos paruošia automatiškai. UI prieš CMS init naudoja config.json; config.yml yra lygiavertė standartinė Decap konfigūracija. Kolekcijų laukų aprašai — `scripts/generate-cms.mjs`; apsaugoti repo/branch/version/scope — `cms.config.json`. Versiją ir admin script SRI keisk kartu, patikrinęs oficialų paketą. Produkcijos OAuth leidžia tik produkcijos origin, vietinis HTTP login skirtas UI patikrai, ne įėjimui į produkcijos CMS.

## PERDAVIMAS NAUJAM SAVININKUI

1. Padaryk pilną repo kopiją (`git clone --mirror`) su visais projektais, media failais ir istorija. Sugeneruotų manifestų ir dist saugoti nereikia. Secrets eksportuok tik saugiu kanalu atskirai.
2. Perduok GitHub repository arba importuok į naujo savininko paskyrą. `cms.config.json` pakeisk `repository` ir, jei reikia, `branch`. Nepervadink turinio failų / projektų slug.
3. Naujoje Cloudflare paskyroje prijunk GitHub ir Workers Builds. Tie patys build/deploy / ASSETS / EMAIL nustatymai iš DEPLOYMENT.md. Jokių DB / R2 eksportų nėra.
4. OAuth App nuosavybę tinkamai perleisk, jei GitHub tai leidžia pasirinktam nuosavybės tipui, arba sukurk naują savininko OAuth App. Negalima vien perrašyti seno savininko slaptažodžio. Naujam savininkui saugiausia sukurti naujus OAuth kredencialus ir `OAUTH_STATE_SECRET` Cloudflare, atšaukti seną prieigą.
5. Nekeičiant domeno Homepage ir Callback URL lieka tie patys. Keičiant domeną pakeisk `site.config.json` → site.origin, OAuth App Homepage/Callback, Cloudflare domeną ir Turnstile leidžiamus hostname; įdiek naują build. CMS auth/base/site_url generuojami iš vieno origin. Seno domeno 301 taisyklę suplanuok prieš migraciją.
6. Patikrink naujo savininko login, redagavimą, commit, build ir produkcijos rezultatą; atnaujink valdytoją/kontaktus/pašto gavėją. Perduok ir esamą pašto/Turnstile konfigūraciją pagal EMAIL_SETUP.md; nesupainiok jų su OAuth laukais.
7. Nepakeitus domeno ir failų slug vieši projektų URL išlieka. Hash turinio vaizdų URL atkuriami deterministiškai tuo pačiu lockfile/sharp; keičiant apdorojimo versiją hash prefiksas tas pats, todėl migraciją atlik su saugomu package-lock ir cache patikra. DNS perjunk tik paruošęs naują svetainę; seną Worker palik, kol patikrinimas baigtas.

## Gedimų paieška

- `/admin/` 404: neįdiegtas CMS commit arba Worker nukreiptas į kitą repo / branch; patikrink Workers Builds rezultatą.
- Login lange „nesukonfigūruotas“ / 503: trūksta OAuth trijų laukų arba būsena trumpesnė nei 32 simboliai. Tai nėra Turnstile ar užklausų jungiklis.
- GitHub redirect_uri mismatch: App callback turi būti tiksliai `https://drenazoirengimas.lt/callback`.
- State klaida: pasibaigė 10 min., užblokuoti cookies arba atidaryti keli login langai. Uždaryk popup ir prisijunk iš naujo.
- 403: paskyra neturi repo Write, organizacijos OAuth apribojimas, nepatvirtinta OAuth App arba bandymas prisijungti iš preview / www / kito origin.
- Publish yra GitHub, bet svetainė sena: patikrink Cloudflare build. Netaisyklingas turinys sustabdo build ir palieka ankstesnę veikiančią versiją. Pataisyk įrašą arba grąžink commit.
- Iliustracijos nepakeičiamos: tai sąmoninga dizaino apsauga. Projekto nuotraukoms naudok Projektai ir galerija.
- CDN/SRI klaida: patikrink interneto prieigą ir ar versija sutampa su SRI; neišjunk patikros vien tam, kad užkrautum nežinomą failą.

## Patikrų ribos

Tikslius šio įdiegimo rezultatus ir neištestuotas paskyros priklausomybes žr. QA.md. Vietiniai mock testai nėra įrodymas, kad GitHub OAuth buvo autorizuotas ar Cloudflare priėmė CMS publikavimą. To nevadiname užbaigtu gyvu login/publish bandymu, kol nėra realaus patvirtinimo.
