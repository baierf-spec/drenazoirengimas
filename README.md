# drenazoirengimas.lt

Lietuviška drenažo užklausų svetainė: Astro, TypeScript, statiniai SEO puslapiai, Cloudflare Worker, nuotraukų priedai paštu ir GitHub valdoma projektų galerija. Turinys redaguojamas per Decap CMS `/admin/`, be D1, R2 ar Netlify.

## Nustatymai vienoje vietoje

**Redaguok [site.config.json](site.config.json).** Kontaktai, telefono on/off, užklausų on/off, indeksavimas, Turnstile viešas raktas, analitika ir laiškų adresai valdomi čia. Seni PUBLIC_* / Cloudflare veiklos jungikliai nebeskaitomi. Pilna savininko ir pirkėjo instrukcija: [CONFIGURATION.md](CONFIGURATION.md).

Cloudflare privalomai lieka TURNSTILE_SECRET_KEY ir EMAIL infrastruktūros susiejimas. Pašto adresus galima laikyti JSON arba pasirinktinai privačiai per aiškias env: nuorodas; dabartinės nuorodos išsaugo jau veikiantį siuntimą. Saugykla vieša, todėl slapti raktai ir privatūs klientų duomenys į ją nekeliami.

```bash
npm ci
npm run dev
npm run config:check
npm run check
npm run build:production
npm run deploy:dry-run
```

Naudok Node 24. `check` vykdo lint, TypeScript, build, SEO auditą, Vitest, HTML / nuorodų / Worker ir izoliuotą galerijos generavimo patikrą. Testai nesiunčia tikrų laiškų ir nepatvirtina galutinio pristatymo į Inbox. .env.example aprašo tik vietinius runtime slaptus / pasirenkamus privačius laukus.

Formoje duomenys ir failai tikrinami serveryje, patvirtinamas Turnstile. Sėkmė grąžinama tik Cloudflare priėmus laišką su priedais. Nėra patvarios užklausų eilės; siuntimo klaidos atveju lankytojas gali bandyti dar kartą. Dedupe ir skaitikliai atmintyje yra tik best-effort viename isolate.

Savininkui skirta **https://drenazoirengimas.lt/admin/**. Decap GitHub backend redaguoja esamus tekstus, kontaktus, DUK, SEO ir tikrus projektus. Vienkartiniam prisijungimui reikia GitHub OAuth App ir trijų Cloudflare OAuth secrets. Pilnas prijungimas ir perdavimas: [CMS_SETUP.md](CMS_SETUP.md).

Projektų įrašai yra src/content/projects/*.json. Nuotraukos įkeliamos per CMS, mažinamos naršyklėje ir build metu, į viešą išvestį patenka tik optimizuotos naudojamos versijos. Po CMS commit ir sėkmingo automatinio Cloudflare build atsinaujina listing/detail ir sitemap. Išgalvotų projektų nėra.

- [CMS_SETUP.md](CMS_SETUP.md): turinio redagavimas, GitHub login, nuotraukos, saugumas ir perdavimas.
- [CONFIGURATION.md](CONFIGURATION.md): vienas failas, adresų privatumas, migracija ir perdavimas.
- [DEPLOYMENT.md](DEPLOYMENT.md): Cloudflare diegimas ir domenas.
- [EMAIL_SETUP.md](EMAIL_SETUP.md): el. pašto prijungimas.
- [GALLERY_MANAGEMENT.md](GALLERY_MANAGEMENT.md): projektų turinys ir nuotraukos.
- [ARCHITECTURE.md](ARCHITECTURE.md), [QA.md](QA.md), [SEO_AUDIT.md](SEO_AUDIT.md): architektūra ir patikros.

Pasirenkama analitika ir atėjimo šaltinio įsiminimas įjungiami tik po sutikimo. Conversion events: phone_click, quote_started, quote_submitted, photo_uploaded, diagnostic_started, diagnostic_completed, cost_estimator_completed, primary_cta_click. PII analitikai nesiunčiama. Nekelk .dev.vars, raktų, klientų užklausų ar privačių nuotraukų į GitHub.
