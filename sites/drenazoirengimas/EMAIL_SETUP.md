# Užklausų siuntimas paštu

Visi adresų pasirinkimai dabar yra **site.config.json → email**. Detalūs nustatymai ir pirkėjo perdavimas – CONFIGURATION.md. Naudojamas Cloudflare EMAIL binding; nėra Resend, D1 ar R2.

1. Cloudflare Email Routing prijunk svetainės domeną ir patvirtink tikrą užklausų gavėją per Destination Addresses.
2. JSON faile nurodyk email.from (siuntėjas iš prijungto domeno), email.to (patvirtintas savininko gavėjas), email.replyTo (veikiantis veiklos adresas). Saugykla vieša: adresus galima įrašyti tiesiogiai tik jei galima juos viešinti GitHub.
3. Esamos env:EMAIL_FROM / env:ADMIN_EMAIL / env:BUSINESS_REPLY_TO nuorodos palaiko jau veikiančius privačius Cloudflare nustatymus. Kiekvieną nuorodą gali pakeisti tikru adresu tame pačiame JSON; po to senas Cloudflare laukas nebenaudojamas. Nėra fallback į kitą gavėją.
4. JSON turnstile.siteKey turi būti tikras viešas Site key, o Cloudflare runtime – jo TURNSTILE_SECRET_KEY. Slapto rakto į GitHub nekelk.
5. JSON features.leadsEnabled=true įjungia užklausas. Išsaugok commit ir sulauk sėkmingo build/deploy. PUBLIC_* ir LEADS_ENABLED Cloudflare laukai nebereikalingi ir nebeužgožia config.
6. Išsiųsk kontrolinę užklausą ir patikrink Inbox / Spam, nuotraukų priedus, telefono ir el. pašto nuorodas. Reply-To rodo kliento paštą, jei pateiktas, kitu atveju email.replyTo.

Laiškas turi HTML ir plain-text versijas; matomi kontaktai, vieta, objektas / problema / terminas, neprivalomas komentaras, nuotraukų informacija ir atėjimo šaltinio domenas. Techniniai UUID lieka delivery header, ne laiško turinyje. Klientui automatinis laiškas šioje owner-only versijoje nesiunčiamas.

Iki 5 nuotraukų: naršyklė sumažina iki 1600 px ir perrašo JPEG be originalių EXIF. Serveris tikrina MIME / parašą, leidžia iki 2 MiB vienam failui ir 3 MiB visiems kartu. Nuotraukos niekur viešai nepublikuojamos. EMAIL.send priėmimas nėra Inbox garantija; nėra patvarios eilės ar foninio retry. Klaidos atveju duomenys lieka formoje ir klientas bando dar kartą; galimas dubliavimas retų tinklo nutrūkimų metu.

Atėjimo šaltinį valdo features.referrerAttribution. Įjungus ir lankytojui leidus analitiką, įsimenamas pirmas išorinis domenas šiame skirtuke iki 24 valandų. Pilnas adresas, paieškos užklausa ar URL parametrai nesaugomi. Jei šaltinis neperduotas / sutikimo nėra, laiške rodoma „Nenustatytas“. Tai nėra konkretaus reklamos paspaudimo įrodymas.

Šaltiniai:

- https://developers.cloudflare.com/email-service/
- https://developers.cloudflare.com/email-service/api/send-emails/workers-api/
- https://developers.cloudflare.com/email-service/configuration/send-bindings/
- https://developers.cloudflare.com/email-service/platform/limits/
