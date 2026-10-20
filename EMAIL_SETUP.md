# Užklausų siuntimas per Cloudflare

Patikrinta pagal oficialią Cloudflare dokumentaciją 2026-10-20. Kodas paruoštas; paskyros nustatymai ir tikras bandomasis laiškas dar neatlikti. Svetainės dizainas nesikeičia.

## 1. Patvirtink gavėjo paštą

Cloudflare valdymo lange atverk Email Service / Email Routing → Destination Addresses. Pridėk paštą, į kurį turi ateiti užklausos, ir paspausk Cloudflare atsiųsto patvirtinimo nuorodą. Tai gali būti tavo esama Gmail ar kita dėžutė. Projekto administratorius ir viešas kontaktinis paštas gali skirtis.

Domenui drenazoirengimas.lt įjunk Email Routing ir priimk tik Cloudflare pateiktus domeno DNS įrašus. Jei domene jau veikia kitas paštas, pirmiausia įvertink esamus MX/SPF įrašus: jų neperrašyk aklai. Sukurk, pavyzdžiui, užklausų adreso persiuntimo taisyklę į patvirtintą gavėją. Konkretaus adreso projektas neprimeta.

## 2. Prijunk laiškų siuntimą prie Worker

Projekto wrangler.jsonc jau yra:

```json
"send_email": [{ "name": "EMAIL" }]
```

Šis numatytasis binding leidžia siųsti į paskyroje patvirtintus gavėjų adresus. Siuntėjo adresas turi priklausyti Cloudflare Email Service prijungtam domenui. Griežtesniam tik vieno savininko režimui prie EMAIL įrašo pridėk `destination_address` su tikru ADMIN_EMAIL adresu. Tikro gavėjo kodo saugykloje saugoti nebūtina: binding galima sukonfigūruoti paskyroje, tačiau būsimi Wrangler diegimai turi išlaikyti tą patį nustatymą.

## 3. Įrašyk Worker runtime reikšmes

Worker → Settings → Variables and Secrets. Tai vykdymo aplinkos reikšmės, ne vien Build variables.

| Pavadinimas           | Ką įrašyti                                                                    |
| --------------------- | ----------------------------------------------------------------------------- |
| EMAIL_FROM            | Paprastas siuntėjo adresas prijungtame domene, be vardo ar kampinių skliaustų |
| ADMIN_EMAIL           | Patvirtintas tavo gavėjo paštas                                               |
| BUSINESS_REPLY_TO     | Veikianti tavo dėžutė arba persiunčiamas adresas klientų atsakymams           |
| CUSTOMER_CONFIRMATION | Pradžioje false                                                               |
| TURNSTILE_SECRET_KEY  | Tikro šio domeno Turnstile valdiklio slaptas raktas                           |
| IP_HASH_SECRET        | Atsitiktinė bent 32 simbolių reikšmė                                          |
| PHOTO_SIGNING_SECRET  | Kita nepriklausoma atsitiktinė bent 32 simbolių reikšmė                       |

API raktų pokalbyje ar GitHub saugykloje neskelbk. Resend paskyros ir rakto nereikia.

## 4. Prijunk užklausų saugojimą ir apsaugą

Privalomi binding: D1 `DB`, privatus R2 `PHOTOS` ir el. pašto `EMAIL`. D1 sukūrimas, ID įrašymas į wrangler.jsonc ir migracijos aprašyti DEPLOYMENT.md. Failų saugykla viešai neatveriama.

Turnstile valdikliui leisk drenazoirengimas.lt. Jo viešą raktą pateik kaip `PUBLIC_TURNSTILE_SITE_KEY` build metu, slaptą raktą – tik Worker aplinkoje. Veiksmas `lead` ir domenas tikrinami serveryje.

Build aplinkoje taip pat užpildyk tikrus PUBLIC_PHONE, PUBLIC_CONTACT_EMAIL, PUBLIC_CONTROLLER_NAME, PUBLIC_CONTROLLER_ADDRESS ir PUBLIC_SITE_MODE=production. Paleisk naują build. Vien runtime kontaktų pakeitimas statinių puslapių neatnaujina.

## 5. Įjunk ir patikrink

Pateik naują Worker versiją, nustatyk `LEADS_ENABLED=true` Wrangler runtime vars ir iš naujo pateik konfigūraciją. Jei keiti reikšmę valdymo lange, suderink ją su Wrangler: vėlesnis deploy neturi jos grąžinti į false. `SITE_ORIGIN` ir `ALLOWED_ORIGINS` turi būti https://drenazoirengimas.lt.

Išsiųsk pažymėtą bandomąją užklausą su nuotrauka. Patikrink gavėjo Inbox ir Spam, informaciją laiške, privačią nuotraukos nuorodą. Paspaudus Atsakyti administratoriaus laiške turi būti kliento paštas, jei jis pateiktas, kitu atveju BUSINESS_REPLY_TO. Pirmiausia išsaugomi duomenys: svetainės sėkmės pranešimas reiškia užklausos priėmimą, ne garantuotą patekimą į Inbox. D1 admin_sent turi tapti 1; nepristatytus pranešimus kartoja 15 min. cron, paisydamas retry laiko.

## Pasirenkama: patvirtinimas klientui

Siuntimas į bet kokį kliento adresą skiriasi nuo siuntimo patvirtintam savininkui. Cloudflare Email Sending beta reikalauja tinkamos paskyros / Workers Paid plano ir domeno siuntimo patvirtinimo. Be tavo patvirtinimo mokamas planas nejungiamas.

Kai ši galimybė tavo paskyroje aktyvi, pagal Cloudflare instrukciją patvirtink domeną ir sukonfigūruok siuntėjo apribojimą `allowed_sender_addresses` vietoje tik patvirtintų gavėjų režimo. Tik tada nustatyk CUSTOMER_CONFIRMATION=true. Patikrink su atskira kontroliuojama kliento dėžute. Kliento laiško Reply-To bus BUSINESS_REPLY_TO. Vien Email Routing persiuntimas nėra leidimas siųsti visiems klientams.

## Diagnostika

- Forma rodo, kad priėmimas neaktyvus: patikrink LEADS_ENABLED, DB, PHOTOS, EMAIL ir visas būtinas reikšmes.
- Užklausa priimta, laiško nėra: patikrink patvirtintą ADMIN_EMAIL, prijungtą EMAIL_FROM domeną, binding apribojimus, Cloudflare Email veiklos žurnalą ir D1 admin_sent / attempts / next_attempt. Neskelbk klientų duomenų viešuose žurnaluose.
- Pakeitus nustatymus vėl neveikia: patikrink build ir runtime aplinkų skirtumą bei wrangler.jsonc reikšmes.

Cloudflare negarantuoja siuntimo idempotentiškumo. Retu atveju, kai procesas nutrūksta po laiško priėmimo prieš D1 įrašo atnaujinimą, pakartojimas gali atsiųsti antrą laišką. Užklausos numeris padeda juos atpažinti.

## Šaltiniai

- https://developers.cloudflare.com/email-service/
- https://developers.cloudflare.com/email-service/api/send-emails/workers-api/
- https://developers.cloudflare.com/email-service/configuration/send-bindings/
- https://developers.cloudflare.com/email-service/get-started/route-emails/
