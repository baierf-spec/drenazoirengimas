# Projektų galerijos valdymas ir perdavimas

Parengta 2026-10-20. Tai vienas privatus nuotraukų ir projektų redaktorius, ne administravimo platforma. Nėra vartotojų, rolių, analitikos ar nustatymų skydelių. Debesijos paskyros resursai šiuo etapu nekurti ir neaktyvuoti.

## Kasdienis savininko darbas

1. Atidaryti `https://drenazoirengimas.lt/gallery-manager/`.
2. Cloudflare Access lange įvesti leidžiamą savo el. paštą ir gautą vienkartinį PIN. Svetainė nesaugo slaptažodžių.
3. Paspausti „Naujas projektas“, pasirinkti nuotraukas arba nutempti failus. Pirmą kartą įkeliant sukuriamas privatus juodraštis.
4. Įrašyti tikrą pavadinimą ir aprašymą. Vietovė, tipas, metai arba data neprivalomi. Nenurodyti kliento vardo ar tikslaus adreso be tinkamo pagrindo.
5. Žvaigždute pasirinkti viršelį. Nuotraukas perkelti rodyklėmis arba tempimu; telefone naudoti didelius rodyklių mygtukus. Galima įrašyti nuotraukos aprašymą (alt).
6. „Išsaugoti juodraštį“ palieka privatų įrašą. „Publikuoti“ patikrina pavadinimą, ≥20 simbolių aprašymą ir viršelį. Projektas pasirodo viešai be deploy.
7. Esamą projektą redaguoti tame pačiame lange; „Paslėpti iš galerijos“ panaikina viešą prieigą ir sitemap įrašą. „Ištrinti“ prašo patvirtinimo. Projektus galima perrikiuoti sąrašo rodyklėmis.

Įkėlimo eiga rodoma kiekvienai nuotraukai; failai apdorojami paeiliui, kad telefonui nereikėtų vienu metu dekoduoti viso rinkinio. Nesėkmingą failą galima kartoti arba pašalinti iš eilės. Serverio išsaugotos nuotraukos ištrinamos per jų kortelę. Sėkmingos nuotraukos iš liekančios eilės pašalinamos, atlaisvinant atmintį. Pereinant į kitą projektą klausiama apie neišsaugotus pakeitimus; uždarius naršyklę pasirinkti, bet dar neišsiųsti failai nebus išsaugoti.

## Architektūra

- Astro išsaugo esamą statinę svetainę ir jos dizainą.
- Worker pirmiausia vykdo autorizaciją, paskui skaito D1 ir į esamą projekto puslapio HTML šabloną įrašo publikuotą turinį bei SEO. Tai serverio HTML, ne SEO turinio parsisiuntimas per kliento JS.
- R2 binding `PHOTOS`: tas pats privatus bucket gali aptarnauti dvi atskiras sritis. Užklausų failai yra `leads/`, galerija – `gallery/`. Galerijos failams **netaikyti** užklausų 90 dienų lifecycle taisyklės.
- D1 binding `DB`: atskiros `gallery_projects`, `gallery_images`, `gallery_deletions` lentelės, migracija `migrations/0002_gallery.sql`. Esami lead įrašai nekeičiami. `gallery_deletions` – nedidelė nepavykusių R2 ištrynimų pakartojimo eilė, ne papildomas CMS modulis.
- `worker/gallery-access.ts`: jose RS256 parašo tikrinimas per fiksuoto Access team hosto JWKS; tikrinami issuer, audience, galiojimas ir tikslus savininko el. paštas. Vien email ar Access header egzistavimo nepakanka.
- `worker/gallery-api.ts`: privatūs CRUD, įkėlimo, tvarkos ir alt endpointai. POST/PATCH/DELETE papildomai tikrina tos pačios kilmės Origin. Optimistinė `updated_at` versija saugo nuo tyliai perrašytų metaduomenų kitame lange.
- `worker/gallery-public.ts`: listing, detail, sitemap. `worker/gallery-images.ts`: ribojamas multipart dydis, tikrinami WebP konteineriai ir matmenys, šalinami EXIF/XMP/ICC bei kiti nereikalingi metadata blokai.
- `src/scripts/gallery-photos.ts`: JPEG/PNG/WebP ir HEIC/HEIF paruošimas naršyklėje; `heic-to/csp` atsisiunčiamas tik prireikus HEIC atsarginio dekoderio. Kliento API niekada negauna R2 ar Cloudflare paskyros raktų.

## Binding ir runtime konfigūracija

| Pavadinimas            | Kur                   | Reikšmė / paskirtis                                                                                                           |
| ---------------------- | --------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `DB`                   | Wrangler D1 binding   | Savininko D1 database ID, migrations_dir `migrations`.                                                                        |
| `PHOTOS`               | Wrangler R2 binding   | Savininko privatus bucket, vieši r2.dev ir public domain išjungti.                                                            |
| `ASSETS`               | Workers Static Assets | `dist/client`; `run_worker_first=true` yra būtinas, kitaip privataus puslapio HTML gali apeiti Worker apsaugą.                |
| `GALLERY_ENABLED`      | Worker runtime var    | Numatyta `false`. `true` tik po migracijos, R2 ir Access patikros.                                                            |
| `ACCESS_TEAM_DOMAIN`   | Worker runtime var    | Tikras `<team>.cloudflareaccess.com`, ne savavališkas JWKS adresas.                                                           |
| `ACCESS_AUD`           | Worker runtime var    | Vienos Access aplikacijos tikras Application Audience tag.                                                                    |
| `GALLERY_OWNER_EMAILS` | Worker runtime var    | Tikslus leidžiamas el. paštas; trumpam perdavimui galima kableliu atskirti du adresus. Ne PUBLIC_* ir ne frontend nustatymas. |
| `SEO_INDEXABLE`        | Worker runtime var    | `true` tik tikrame aktyvuotame domene; nepriklauso nuo galerijos ir užklausų priėmimo jungiklių.                              |
| `PUBLIC_SITE_MODE`     | Build                 | `production` būtina produkciniam indeksavimui; preview lieka noindex.                                                         |

`GALLERY_ENABLED` neveikia kaip prieigos slaptažodis: net esant true privalomas galiojantis Access žetonas ir leidžiamas el. paštas. Nėra dev slaptažodžio, universalaus token ar autentifikacijos apeinančio režimo. Astro dev serveris skirtas vietiniam UI darbui, ne viešam hostingui; tikras privatus kelias saugomas Worker.

## Account savininko konfigūravimas (šiame darbe nevykdytas)

1. Cloudflare paskyroje sukurti / parinkti D1 ir privatų R2. `wrangler.jsonc` įrašyti grąžintą D1 ID bei tikrą bucket vardą; binding vardų nekeisti.
2. Pritaikyti migracijas su `npm run db:migrate:remote`. Migracija yra pridedanti lenteles. Prieš esamos paskyros pakeitimą padaryti DB kopiją. Galerijos schema šiuo pakeitimu nėra automatiškai taikoma Sites review D1.
3. Zero Trust → Integrations / Identity providers: įjungti One-time PIN. Access controls → Applications: sukurti vieną Self-hosted aplikaciją kanoniniam hostui, apimančią **abi** `/gallery-manager` (ir visus jo subpaths/HTML alias) bei `/api/gallery` (ir visus subpaths) sritis. Naudoti tos pačios aplikacijos AUD abiem; nekurti skirtingų nesuderinamų AUD.
4. Access Allow policy: Include → Emails → tik tikras savininko adresas. Nenaudoti „Everyone“, Bypass ar vien bendro pašto domeno. Tikslūs keliai ir wildcard nustatymai turi apimti `/gallery-manager/`, `/gallery-manager/index.html`, `/gallery-manager.html`, `/api/gallery/projects` ir nuotraukų preview endpointus. Backend bet kuriuo atveju šias alias formas tikrina.
5. Iš Access aplikacijos nukopijuoti Application Audience tag į `ACCESS_AUD`, team hostą į `ACCESS_TEAM_DOMAIN`, leidžiamą adresą į `GALLERY_OWNER_EMAILS`. Tai paskyros konfigūracija, ne į repo įrašomi prisijungimo duomenys.
6. Priskirti D1/R2 ir nustatyti `GALLERY_ENABLED=true`; išdeployinti parengtą aplikaciją. Šis pirmas pajungimas yra techninis darbas. Kasdienė galerijos priežiūra po to nereikalauja GitHub, terminalo ar redeploy.
7. Patikrinti tikrą PIN prisijungimą, neleistiną el. paštą, be žetono tiesiogiai į Worker/API, pasibaigusią sesiją, upload, publikavimą/slėpimą, sitemap ir nuotraukos URL po slėpimo. Uždrausti cache-everything taisykles valdymui, API ir dinaminei galerijai.

Savininko pašto pakeitimas: Access Allow policy pakeisti adresą ir Worker `GALLERY_OWNER_EMAILS` pakeisti į tą patį. Po perdavimo pašalinti ankstesnį adresą ir Access pusėje nutraukti ankstesnes sesijas. Serverio papildomas sąrašas nebeleidžia ankstesniam adresui naudoti net dar galiojančio JWT. Nereikia keisti slaptažodžių duomenų bazės.

## Nuotraukų saugojimas ir apribojimai

Iki 20 nuotraukų projektui. Pradinis failas ≤20 MiB, dekoduotas vaizdas ≤60 MP. Naršyklė pirmiausia bando natūralų HEIC dekodavimą, o jei nepavyksta – automatiškai naudoja CSP suderinamą libheif konverterį. Rankinio konvertavimo į JPG sraute nereikalaujama. HEIC Live Photo vaizdo įrašai nėra portfolio nuotraukos; naudojamas pasirinktas nejudantis atvaizdas. Retų HEIF profilių ir realių senų telefonų palaikymas dar turi būti patikrintas.

Paruošiami WebP 480, 960 ir 1600 px ilgesnės kraštinės variantai (mažesni vaizdai nedidinami), ≤2 MiB kiekvienas, kokybė 84 %. JPEG/PNG įvestis taip pat perkoduojama. Į serverį siunčiami tik variantai; originalai nesaugomi. Kiekvienos nuotraukos multipart ≤7 MiB. Serveris tikrina MIME, RIFF/WebP struktūrą, neanimuotą kadrą, matmenis ir variantų proporcijas; tai nėra pilnas serverio vaizdo dekoderis ar malware skeneris. Pačios galerijos rašymas leidžiamas tik autentifikuotam savininkui.

R2 raktas: `gallery/{project-id}/{image-id}/{upload-attempt-id}/{480|960|1600}.webp`. Atsitiktiniai raktai ir pirmiau už D1 išsaugomi failai. Nesėkmingi DB įrašai sutvarko savo failus; pakartotas tas pats image ID ir fingerprint nesukuria dublikatų. R2 klaidos trinant įrašomos į `gallery_deletions` ir kartojamos po keitimų / native cron. Staigus Worker nutrūkimas tarp R2 put ir DB commit gali palikti privatų nenaudojamą failą; prieš periodinį orphan valymą palyginti su visais D1 variants raktais ir užtikrinti, kad nevyksta įkėlimai. Jokios bendros gallery/ automatinio trynimo taisyklės nenustatyti.

Lankytojai gauna tik Worker adresus `/projektu-nuotraukos/{image-id}/{slot}.webp` ir tik kol tėvinis projektas published. Privačios savininko peržiūros eina per Access apsaugotą `/api/gallery/images/...`. Dinaminis HTML, API ir nuotraukos no-store: slėpimas nepalieka aplikacijos valdomos senos viešos kopijos. Jau lankytojo parsisiųsto failo atšaukti neįmanoma. srcset/sizes/matmenys ir lazy antrinėms nuotraukoms pateikiami HTML.

## Modelis ir vieši URL

`gallery_projects`: id, slug, title, nullable location / project_type / completion_date / cover_image_id, description, status, sort_order, created_at, updated_at, published_at. Papildomas published_at leidžia po pirmo publikavimo išlaikyti slug, net pakeitus pavadinimą.

`gallery_images`: id, project_id (FK su cascade), storage_key, variants JSON, fingerprint, nullable alt_text, sort_order, width, height, created_at. DB trigger riboja 20 nuotraukų ir neleidžia publikuoti be savo viršelio; ištrynus paskutinę nuotrauką projektas tampa draft. Ištrynus viršelį parenkama kita nuotrauka.

`/projektai/` rodo tik published. `/projektai/{slug}/` duoda pilną serverio HTML, individualias metadata, canonical, cover OG, vieną H1 ir BreadcrumbList. Tikri published URL įtraukiami į sitemap su updated_at pagrįstu lastmod; listing pridedamas tik kai yra projektų. Draft URL → 404, draft nuotraukos viešu keliu → 404. Nekonfigūruotas backend → profesionali tuščia galerija; nėra išgalvotų atvejų. Duomenų bazės laikinos klaidos detalėje → saugus 503, ne techninė išklotinė.

## Atsarginė kopija

Visą kopiją sudaro **metaduomenys ir R2 objektai**. Juodraščiai gali būti privatūs, todėl kopijas laikyti už repo ir public/ ribų. Neperduoti lead klientų duomenų kartu su vien galerija.

Techniniam prižiūrėtojui:

```bash
node scripts/gallery-backup.mjs export /private/drenazo-gallery-backup
```

Skriptas per autentifikuotą Wrangler read-only eksportuoja tik gallery_projects ir gallery_images į `gallery.json`. Vietinei bazei pridėti `--local`. R2 failai į šį JSON neįeina. Native DB SQL eksportas irgi galimas (`wrangler d1 export --table`), bet tiesioginis published eilučių importas prasilenktų su draft-first trigger; naudoti žemiau pateiktą atkūrimo generatorių.

R2 `gallery/` prefiksą kopijuoti su Cloudflare S3 suderinamu įrankiu, pvz. rclone (įdiegiamas prižiūrėtojo kompiuteryje). Sukonfigūruoti read-only šaltinio ir write paskirties R2 remote naudojant Cloudflare grąžintus account endpointus ir trumpalaikius, tik reikiamam bucket skirtus S3 raktus. Raktų nedėti į komandų istoriją / repo, naudoti įrankio saugų konfigūravimą.

```bash
rclone copy drainage-source:BUCKET/gallery /private/drenazo-gallery-backup/gallery
rclone check drainage-source:BUCKET/gallery /private/drenazo-gallery-backup/gallery --download
```

BUCKET pakeičiamas tikru vardu. Kopijuojami tik gallery objektai, ne leads. Baigti aktyvius pakeitimus / laikinai išjungti galeriją prieš kopiją, kad D1 ir R2 atitiktų tą patį momentą. Patikrinti failų kiekį ir kopijos vientisumą; ištestuoti atkūrimą atskiroje testinėje paskyroje prieš remiantis kopija.

## Perkėlimas į kitą Cloudflare paskyrą ir atkūrimas

1. Sustabdyti galerijos keitimus ir atlikti galutinę metaduomenų + R2 kopiją. Esamų klientų užklausų perkėlimas yra atskiras, privatumo taisyklių reikalaujantis darbas.
2. Naujo savininko paskyroje sukurti tuščią D1 / privatų R2; palikti tuos pačius binding vardus. Pritaikyti abi native migracijas. Galerijos lentelės prieš atkūrimą turi būti tuščios; generatorius nenaudoja DROP/DELETE ir neperrašo esamų duomenų.
3. Naujame bucket atkurti objektus **su tais pačiais pilnais raktais** prieš įjungiant public galeriją:

```bash
rclone copy /private/drenazo-gallery-backup/gallery drainage-destination:NEW_BUCKET/gallery
rclone check /private/drenazo-gallery-backup/gallery drainage-destination:NEW_BUCKET/gallery --download
node scripts/gallery-backup.mjs prepare-restore /private/drenazo-gallery-backup
npx wrangler d1 execute drenazoirengimas-leads --remote --file /private/drenazo-gallery-backup/gallery-restore.sql
```

Generatorius pirmiausia įterpia draft projektus, tada nuotraukas, tada atkuria cover/status. SQL escaping ir vietinis tikro SQLite round-trip patikrintas automatiniu testu. Naudoti naujos paskyros `wrangler.jsonc`, ID ir prisijungimą; pats prepare-restore jokio remote įrašo neatlieka.

4. Sukurti naują Access aplikaciją, naują policy ir tos paskyros team / AUD / savininko el. paštą. Perkelti tik reikalingą aplikacijos konfigūraciją; ankstesnės paskyros API / S3 raktų nepernaudoti. Lead Turnstile, email ir pasirašymo raktai konfigūruojami atskirai.
5. Testiniame hoste palikti SEO noindex. Patikrinti kiekvieno projekto / nuotraukų skaičių, viršelį, viešus / privačius adresus, tikrą OTP ir įkėlimą.
6. Perkelti domeno DNS/Worker Custom Domain į naują paskyrą tik sutarus su savininku. Išsaugant drenazoirengimas.lt, slugs ir IDs, visi projekto bei nuotraukų URL išlieka tie patys. Vien bucket / D1 ID pakeitimas viešų URL nekeičia. Nekeisti slug ranka; jei adresas sąmoningai keičiamas, prieš tai sukurti senas→naujas 301 žemėlapį.
7. Patvirtinus atkūrimą, įjungti GALLERY_ENABLED ir produkcinio indeksavimo jungiklius pagal DEPLOYMENT.md. Seną infrastruktūrą išjungti / raktus panaikinti tik savininkui patvirtinus migraciją ir kopijas.

## Šaltiniai ir nebaigtas live patikrinimas

Dokumentacija tikrinta 2026-10-20:

- https://developers.cloudflare.com/cloudflare-one/access-controls/applications/http-apps/authorization-cookie/validating-json/
- https://developers.cloudflare.com/cloudflare-one/integrations/identity-providers/one-time-pin/
- https://developers.cloudflare.com/cloudflare-one/access-controls/applications/http-apps/self-hosted-public-app/
- https://developers.cloudflare.com/workers/static-assets/routing/worker-script/
- https://hoppergee.github.io/heic-to/

Tikra Access OTP sesija, Cloudflare D1/R2, R2 perkėlimas ir iPhone / Android HEIC failai realiame įrenginyje šiame darbe nebuvo pajungti / išbandyti. Automated tests tikrina tikrą JWT parašą su vietiniais raktais ir imituojamu JWKS, tikrą SQLite migraciją, R2 imitaciją ir kliento konvertavimo šaką. Tai nėra teiginys, kad paskyrų integracijos jau gyvos.
