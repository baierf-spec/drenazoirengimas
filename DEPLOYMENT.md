# Cloudflare diegimas

Nustatymų šaltinis – **site.config.json**. Išsami migracija / pirkėjo instrukcija: CONFIGURATION.md. PUBLIC_* build variables nebereikia. D1, R2, migracijos, cron ir Access nereikalingi.

## Workers Builds

Saugykla: https://github.com/baierf-spec/drenazoirengimas , main.

| Laukas        | Reikšmė                                      |
| ------------- | -------------------------------------------- |
| Worker vardas | drenazoirengimas                             |
| Build         | npm run build:production                     |
| Deploy        | npx wrangler deploy                          |
| Root          | saugyklos pagrindas                          |
| Node          | 24                                           |
| Entrypoint    | worker/index.ts                              |
| Assets        | dist/client / ASSETS / run_worker_first=true |
| Kitas binding | EMAIL (send_email)                           |

Runtime secret: TURNSTILE_SECRET_KEY. Tik jei JSON email lauke pasirinkta env: nuoroda, reikia atitinkamo EMAIL_FROM / ADMIN_EMAIL / BUSINESS_REPLY_TO. Tai neprivalomi privatumo pasirinkimai, ne antras reikšmių prioriteto mechanizmas. Literalūs config adresai nekreipia dėmesio į senus Cloudflare adresus.

Patvirtink faktinį notification gavėją Email Routing, prijunk siuntėjo domeną ir sukurk Turnstile valdiklį drenazoirengimas.lt. Viešą Site key įrašyk į site.config.json; Secret key laikyk tik Cloudflare. Prieš aktyvuodamas tikrus duomenis patvirtink valdytojo kontaktus.

## Komandos

```bash
npm ci
npm run config:check
npm run check
npm run check:secrets
npm run build:production
npx wrangler deploy
```

Build tikrina JSON ir tikrus viešus kontaktus. Pakeitus config reikia naujo build/deploy. Užklausų priėmimą valdo features.leadsEnabled; indeksavimą vienu metu HTML ir Worker valdo features.indexingEnabled. Alternatyvūs hostai visada noindex. SITE_AUDIT_MODE skirtas tik testams, ne Cloudflare aplinkai.

## Domenas ir perdavimas

Cloudflare Worker Custom Domains pridėk drenazoirengimas.lt ir www.drenazoirengimas.lt. Kodas nukreipia www / HTTP į site.origin HTTPS, išlaikydamas kelią ir query. Naudok tik Cloudflare pateiktus DNS / sertifikato įrašus, nekeisk veikiančių pašto MX/SPF/DKIM aklai. Domeno registracija / DNS zona pati neprijungia domeno prie Worker.

Perleidžiant saugyklą ir config perduodami GitHub; naujoje Cloudflare paskyroje prijungiami domenas, GitHub, EMAIL / Email Routing, patvirtinamas gavėjas ir sukuriamas naujas Turnstile valdiklis. Raktai tarp savininkų nepernaudojami. Išsaugojus domeną ir projektų slug vieši URL nesikeičia. Esamų nereikalingų D1 išteklių šis pakeitimas automatiškai netrina.

## Senų nustatymų valymas

Po sėkmingo diegimo gali pašalinti senus PUBLIC_* build ir SITE_ORIGIN / ALLOWED_ORIGINS / LEADS_ENABLED / SEO_INDEXABLE runtime laukus. Jie kode ignoruojami. Neliesk TURNSTILE_SECRET_KEY ir reikšmių, į kurias JSON dar rodo per env:. keep_vars=true apsaugo esamus privačius Text adresus migracijos metu.

## Gyva patikra

Tikra kontrolinė užklausa su nuotraukomis: Inbox / Spam, priedai ir Reply-To. Patikrink Turnstile, siuntimo klaidą / retry, mobilius failus, privatumo pasirinkimą, telefono off/on ir source consent. Reikia faktinės Cloudflare paskyros; automatinių testų mock nėra tikro pristatymo įrodymas. Patikrink HTTPS, 404, canonical, robots ir sitemap. Search Console ir field CWV tikrinami jau veikiančiame domene.
