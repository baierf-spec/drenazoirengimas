# Užklausos ir nuotraukos tiesiai į paštą

Dabartinė versija siunčia vieną administratoriaus laišką su klientų nuotraukų priedais per Cloudflare EMAIL binding. Nėra Resend, D1, R2, migracijų ar cron. Klientui automatinis patvirtinimo laiškas nesiunčiamas.

1. Cloudflare Email Service → Email Routing prijunk drenazoirengimas.lt. Jei domene jau yra kito pašto MX/SPF įrašai, jų neperrašyk aklai: patikrink suderinamumą.
2. Destination Addresses pridėk savo gavėjo paštą ir paspausk gautą patvirtinimo nuorodą. Siuntimas į patvirtintus paskyros gavėjus galimas nemokamu režimu. Siuntėjo adresas turi būti iš prijungto routing domeno. Naudok tik Cloudflare pateiktus DNS įrašus.
3. Worker runtime Variables and Secrets įrašyk EMAIL_FROM (paprastas siuntėjo adresas), ADMIN_EMAIL (patvirtintas gavėjas), BUSINESS_REPLY_TO (tavo veikiantis atsakymų paštas), TURNSTILE_SECRET_KEY. EMAIL yra konfigūracijoje esantis send_email binding, ne API raktas.
4. Build variables įrašyk PUBLIC_PHONE, PUBLIC_CONTACT_EMAIL, PUBLIC_CONTROLLER_NAME, PUBLIC_CONTROLLER_ADDRESS, PUBLIC_TURNSTILE_SITE_KEY, PUBLIC_SITE_MODE=production. Viešas kontaktinis paštas ir privatus ADMIN_EMAIL gali skirtis. PUBLIC_* reikšmėms pritaikyti reikia naujo build.
5. Kai domenas ir siuntimas paruošti, wrangler.jsonc nustatyk LEADS_ENABLED=true. Serverio reikšmes derink su Wrangler, kad vėlesnis deploy jų neatšauktų. Iki aktyvavimo palik false. SEO_INDEXABLE įjunk atskirai po domeno / turinio patikros.
6. Išsiųsk bandomąją užklausą su keliomis nuotraukomis. Patikrink Inbox / Spam, priedų atidarymą ir Atsakyti: jeigu klientas pateikė el. paštą, atsakymas adresuojamas jam, kitaip BUSINESS_REPLY_TO.

Iki 5 nuotraukų; naršyklė mažina iki 1600 px ir perrašo JPEG be originalių EXIF. Serveris leidžia iki 2 MiB vienai nuotraukai ir 3 MiB visoms kartu. Laukelyje tinka JPG/PNG/WebP. Per didelį rinkinį sumažink arba pašalink dalį nuotraukų. Failų originalūs vardai gavėjui nesiunčiami.

Sėkmė rodoma tik EMAIL.send priėmus laišką, tačiau tai nėra galutinio pristatymo į Inbox garantija. Siuntimo klaidos atveju forma rodo klaidą ir leidžia bandyti dar kartą. Nėra foninio pakartojimo iš duomenų bazės. Retais tinklo sutrikimo atvejais galimas dubliuotas laiškas su tuo pačiu užklausos numeriu.

Šaltiniai (tikrinta 2026-10-20):

- https://developers.cloudflare.com/email-service/
- https://developers.cloudflare.com/email-service/api/send-emails/workers-api/
- https://developers.cloudflare.com/email-service/configuration/send-bindings/
- https://developers.cloudflare.com/email-service/platform/limits/
