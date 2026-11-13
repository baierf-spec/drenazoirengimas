# Vienas nustatymų failas – site.config.json

Svetainės savininkui ir pirkėjui reikia redaguoti **site.config.json** GitHub saugyklos pagrinde. Pakeitus failą ir išsaugojus commit į main, Cloudflare sukuria naują svetainės versiją. Public_* build kintamųjų ir atskirų Cloudflare veiklos jungiklių nebereikia.

## Kas keičiama faile

| Nustatymas                   | Paskirtis                                                                       |
| ---------------------------- | ------------------------------------------------------------------------------- |
| site.origin                  | Kanoninis HTTPS domenas be kelio ar parametrų                                   |
| site.name                    | Svetainės pavadinimas                                                           |
| contact.showPhone            | true – rodyti veiklos telefoną, false – slėpti                                  |
| contact.phone                | Veiklos numeris +370 formatu; nereikalingas, kol telefonas paslėptas            |
| contact.email                | Viešas kontaktinis / privatumo paštas                                           |
| privacy.controllerName       | Tikras duomenų valdytojo asmens / įmonės pavadinimas                            |
| privacy.controllerAddress    | Valdytojo kontaktinis adresas                                                   |
| turnstile.siteKey            | Viešas Turnstile Site key. Čia **negalima** rašyti Secret key                   |
| features.leadsEnabled        | Įjungti / išjungti užklausų priėmimą                                            |
| features.indexingEnabled     | Įjungti / išjungti indeksavimą: HTML, robots, sitemap ir Worker vienu metu      |
| features.referrerAttribution | Įjungti / išjungti atėjimo šaltinio domeno įsiminimą po sutikimo                |
| analytics.ga4Id              | Pasirenkamas G-… identifikatorius, tuščia eilutė išjungia integraciją           |
| analytics.cloudflareToken    | Pasirenkamas viešas analitikos beacon token, tuščia eilutė išjungia integraciją |
| analytics.googleVerification | Pasirenkamas Search Console viešas meta verification token                      |
| email.from                   | Patvirtinto siuntimo domeno siuntėjo paštas                                     |
| email.to                     | Gavėjas, į kurį siunčiamos užklausos                                            |
| email.replyTo                | Veikiantis veiklos paštas atsakymams, kai klientas nepateikė savo pašto         |

Telefonas dabar paslėptas. Užklausos įjungtos. Indeksavimas perkeltas pagal patikrintą veikiančios svetainės būseną – įjungtas. Viešas kontaktas, valdytojo tekstas ir Site key perkelti iš jau veikiančios svetainės; tai nėra naujo juridinio asmens sukūrimas ar tapatybės patvirtinimas. Prieš perleidimą savininkas turi pakeisti juos tikrais savo duomenimis.

## El. pašto adresai – tiesiogiai arba privačiai

**Ši GitHub saugykla šiuo metu vieša.** Viskas, ką įrašysi į failą, bus matoma GitHub ir jo istorijoje. Slaptų raktų čia nelaikyk. Administratoriaus paštas svetainės puslapiuose nerodomas, tačiau įrašius jį į viešą saugyklą jis vis tiek bus viešas GitHub.

Kad nesugadintume jau veikiančio siuntimo, dabartiniame faile yra aiškios nuorodos:

```json
"email": {
  "from": "env:EMAIL_FROM",
  "to": "env:ADMIN_EMAIL",
  "replyTo": "env:BUSINESS_REPLY_TO"
}
```

Tai reiškia: paimti būtent šio lauko reikšmę iš esamo Cloudflare nustatymo. Nėra paslėpto reikšmių prioriteto ar automatinio persijungimo į kitą gavėją.

Jei adresus galima laikyti viešai, pakeisk nuorodas tikrais el. pašto adresais **tame pačiame site.config.json** faile. Tada Cloudflare EMAIL_FROM, ADMIN_EMAIL ir BUSINESS_REPLY_TO daugiau nenaudojami ir po patikros gali būti pašalinti. Jei nori juos išlaikyti privačius, palik env: nuorodas. Nuorodą galima pasirinkti kiekvienam laukui atskirai. Nepildyk gavėjo iš kliento formos duomenų – užklausos siunčiamos tik savininko nustatytu adresu.

Siuntėjo domenas turi būti prijungtas Cloudflare Email Routing, gavėjas patvirtintas. Keičiant tik email.to GitHub faile, naują gavėją vis tiek reikia patvirtinti Cloudflare paskyroje. GitHub negali pakeisti paskyros lygmens siuntimo teisių.

## Kas privalomai lieka Cloudflare

1. **TURNSTILE_SECRET_KEY** – vienintelis privalomas programos slaptas raktas. Secret key neskelbiamas GitHub. Viešas Site key yra site.config.json.
2. **EMAIL binding**, domeno Email Routing ir gavėjo patvirtinimas – paskyros infrastruktūra, ne antras veiklos nustatymų failas.
3. Domeno DNS / Worker Custom Domain ir GitHub prijungimas. Jų negalima perkelti vien nukopijavus JSON.
4. Tik jei pasirenkamos env: nuorodos – atitinkami privatūs pašto adresai.

## Senų Cloudflare reikšmių valymas

Po sėkmingo šios versijos diegimo galima pašalinti visus senus PUBLIC_* build kintamuosius. Jie **nebeužgožia** GitHub failo ir kodas jų nebeskaito.

Seni runtime LEADS_ENABLED, SEO_INDEXABLE, SITE_ORIGIN ir ALLOWED_ORIGINS taip pat nebeskaitomi; juos galima pašalinti. Ankstesni D1/R2/Access/Resend nustatymai šioje architektūroje nereikalingi. Neliesk TURNSTILE_SECRET_KEY ir pašto reikšmių, kol JSON faile liko jų env: nuorodos.

wrangler.jsonc turi keep_vars=true, kad pirmas migracijos diegimas neištrintų veikiančių privačių adresų, jeigu jie Cloudflare buvo įrašyti kaip Text, o ne Secret. Kode senų jungiklių reikšmės ignoruojamos. Įrašius literalų adresą į config jis galioja net jei Cloudflare liko sena to lauko reikšmė.

## Pirkėjo perkėlimo seka

1. Perduoti / nukopijuoti GitHub saugyklą su nuotraukomis ir src/content/projects/.
2. Pakeisti site.config.json kontaktus, valdytoją, pašto adresus ir naujo Turnstile valdiklio viešą Site key. Jokio PUBLIC_* kopijavimo nereikia.
3. Pirkėjo Cloudflare paskyroje prijungti domeną, GitHub saugyklą ir Email Routing; patvirtinti jo gavėjo paštą.
4. Worker aplinkoje įrašyti naujo valdiklio TURNSTILE_SECRET_KEY. Jei pasirinktos privačios env: nuorodos, įrašyti ir jas.
5. Build command – npm run build:production; deploy command – npx wrangler deploy. Wrangler deklaruoja EMAIL ir ASSETS, be D1/R2.
6. Patikrinti tikrą užklausą su nuotraukomis, Inbox / Spam, Reply-To, domeną ir robots/sitemap. Jungikliai valdomi tik JSON.

## Patikros ir techninės išimtys

site.config.schema.json padeda redaktoriui rasti klaidas; bendras validavimo kodas tikrina tipą, reikšmes ir nežinomus laukus. `npm run config:check` tikrina realiam paleidimui būtinus kontaktus ir Site key. `npm run check` tikrina programą, metaduomenis, formas ir galeriją. Netaisyklingas JSON ar netinkami nustatymai sustabdo build.

SITE_AUDIT_MODE naudojamas tik automatinių testų ir izoliuoto SEO audito viduje. Jo nereikia nustatyti Cloudflare. Nei šis testinis jungiklis, nei senos Cloudflare veiklos reikšmės nėra pirkėjo konfigūravimo eiga.

wrangler.jsonc saugo techninį Worker vardą, assets / EMAIL binding ir suderinamumo datą. Įprastai parduodant tą pačią drenazoirengimas.lt svetainę jų keisti nereikia. Projektų turinys ir kainų tyrimo šaltiniai lieka jiems skirtuose turinio failuose; jie nėra infrastruktūros nustatymai.

## Turinio valdymas

Decap `/admin/` redaguoja tą patį site.config.json — antros nustatymų kopijos nėra. Nauji business laukai saugo CTA, teritorijas ir poraštės tekstą. Canonical / indeksavimo infrastruktūra CMS paslėpta. OAuth raktai pridedami tik Cloudflare; jie nepriskiriami veiklos konfigūracijai. Žr. CMS_SETUP.md.

## Google Analytics

analytics.ga4Id dabar G-NF15227P2D (savininko pateiktas viešas matavimo ID). Google pateiktas standartinis async gtag skriptas ir inicializacija įterpiami tiesiai po bendro viešų puslapių <head> pradžios. Gtag įkeliamas atidarius puslapį. Papildomų conversion events, Cloudflare analitikos ir referrer įsiminimo sutikimo logika išlieka atskira. Senas dinaminis GA4 įkėlimas pašalintas, todėl gaunama tik viena inicializacija / page view kiekviename puslapyje. CMS/OAuth žyma nekraunama. Cloudflare papildomo GA4 kintamojo nereikia.

### Gautų užklausų skaičiavimas GA4

`generate_lead` siunčiamas standartiniu bendro head `gtag` po POST `/api/leads` sėkmės ir tik kai atsakyme yra `id` ir `status: "sent"`. Worker grąžina šią būseną tik po `await sendLead(...)` / Cloudflare EMAIL priėmimo. Tai patvirtina siuntimo sistemos priėmimą, ne galutinį pristatymą į Inbox. Įvykio parametrai: `form_name: "kontaktinė_forma"`, `lead_type: "užklausa"`; kontaktai, aprašymas, nuotraukos ir request ID Analytics nesiunčiami. Įvykis, kaip ir pagrindinis Google tag, nepriklauso nuo papildomų įvykių pasirinkimo.

Prieš perėjimą į padėkos puslapį laukiama `event_callback`, daugiausia 1,5 s. Blokuota analitika netrukdo sėkmei. Dubliavimas stabdomas aktyvioje formoje, atmintyje ir skirtuko sessionStorage pagal serverio ID (saugoma iki 50 ID). Padėkos puslapis įvykio nesiunčia. Naršyklės blokatoriai, užvertas langas ar nutrūkęs ryšys gali neleisti GA4 gauti įvykio — tai nėra serverio apskaitos registras; naujų secrets / Measurement Protocol rakto nereikia.

GA4: Admin → Data display → Events → `generate_lead` → Mark as key event. Jei įvykis dar negautas, galima sukurti jį pasirinkus Create with code ir tą patį pavadinimą. Skaičiavimas Once per event. Nekurkite antro `generate_lead` iš `form_submit`, `quote_submitted` ar `/aciu/` page_view — jie neatitinka šios siuntimo sąlygos / dubliuotų įvykį. Tikrinkite Realtime po realios sėkmingos užklausos. LeadHub/API užklausų skaičiui filtruokite būtent `eventName = generate_lead`, metrika `eventCount`.
