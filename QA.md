# QA — dabartinė centralizuota konfigūracija

2026-10-20. Naujausia patikra pakeičia ankstesnių versijų PUBLIC_* / runtime jungiklių instrukcijas. Pagrindinis savininko failas – site.config.json; žr. CONFIGURATION.md.

## Rezultatai

- PASS: npm run check – lint, Astro/TypeScript (44 failai, 0 errors / warnings / hints), 14 puslapių build, izoliuotas production SEO audit (9 baziniai URL), 63/63 testai 8 failuose, 458 nuorodų / resursų, 43 JSON-LD objektai, packaged Worker ir atskiras galerijos generavimo testas.
- PASS: npm run build:production – veikia su JSON nustatymais, nebereikalauja PUBLIC_* Cloudflare reikšmių. Vieši kontaktai / valdytojo tekstas / Site key perkelti iš veikiančios svetainės, jokio naujo juridinio asmens nesugalvota.
- PASS: Wrangler dry-run – tik EMAIL ir ASSETS, be D1/R2/cron. keep_vars=true leidžia išsaugoti esamas privačias pašto Text reikšmes per migraciją.
- Nauji konfigūracijos testai: vienas failas valdo backend/frontend, pasenę Cloudflare jungikliai nebeužgožia GitHub, literalūs pašto adresai nenaudoja senų reikšmių, env: nuorodos yra aiškios ir be fallback, privatūs gavėjai nepatenka į public settings projection, neteisingos reikšmės / nežinomi raktai / neleistinos nuorodos atmetami, telefono on/off ir kanoninis origin.
- Ankstesni funkcijų testai išsaugoti: HTML/text laiškas ir escaping, binary priedai / saugūs vardai, Reply-To, email acceptance prieš sėkmę, klaida / retry, dedupe tame pačiame isolate, validacija, failų ir request dydžio ribos, Turnstile / Origin, formos loading / network / double-submit, diagnostika / skaičiuoklė, consent, source sanitizavimas / expiry / withdrawal, projektų schema / publikavimo filtrai / routing / SEO.
- Izoliuoto galerijos testo turinys nepublikuojamas; jis finally bloke pašalinamas, tikras projects.json atkuriamas. Vieša galerija be sugalvotų darbų.

## Išsaugota būsena

- Telefonas paslėptas, forma prašo kliento telefono kaip anksčiau.
- Užklausos įjungtos. Indeksavimo reikšmė paimta iš veikiančio domeno patikros: robots leidžia crawl, nėra noindex response header. Tai išsaugo esamą viešą būseną ir panaikina senos GitHub false / Cloudflare true reikšmių konfliktą.
- Pašto adresai šiuo metu yra env: nuorodos, kad būtų išsaugotas tikras veikiantis siuntimas nepublikuojant nežinomų privačių adresų. Juos galima tame pačiame faile pakeisti literalais; saugykla vieša. Slaptas Turnstile raktas lieka tik Cloudflare.
- Dizainas, galerija, domenas ir paslaugos apimtis nekeisti.

## Patikimumo ir gyvos patikros ribos

- Testai imituoja EMAIL ir Turnstile. Tikras Inbox / Spam / nuotraukų gavimas ir Reply-To po šios migracijos reikalauja kontrolinės užklausos jau įdiegus. Senos veikiančios Cloudflare reikšmės nepakeistos, nauji paskyros ištekliai nesukurti.
- EMAIL.send acceptance nėra galutinio Inbox pristatymo garantija. Nėra D1 / R2 / patvarios eilės ar foninių retry. Atminties dedupe ir dažnio ribos galioja viename isolate ir nėra exactly-once garantija.
- Fizinių telefonų, Gmail/iOS HTML išvaizdos, screen reader, lauko CWV, Search Console / Rich Results patikra šiame konfigūracijos pakeitime neatlikta. Tai nėra naujas vizualinio dizaino pakeitimas.
- Vieši galerijos failai ir Git istorija yra vieši, todėl klientų užklausų nuotraukos ten nekeliamos. Referrer domenas yra neprivaloma, nepatvirtinta lankytojo informacija, renkama tik po sutikimo.
