# Projektų galerija

Savininkas valdo tikrus darbus per **https://drenazoirengimas.lt/admin/** → **Projektai ir galerija**. Pilnas prijungimas, naudojimas, nuotraukos, atsarginė kopija ir perdavimas: [CMS_SETUP.md](CMS_SETUP.md).

Decap CMS → GitHub `main` → automatinis Cloudflare build/deploy. Nėra D1, R2 ar Cloudflare Access. Senoji `/gallery-manager/` ir jos API lieka 404. Prieigą suteikia GitHub Write ir OAuth, ne bendras administratoriaus slaptažodis.

Vienas projektas — `src/content/projects/[slug].json`; nuotraukos `public/images/projects/`. Naršyklė konvertuoja / mažina įkeliamus failus, build generuoja WebP 480/960/1600 ir pašalina EXIF. Viešame build lieka tik optimizuotos naudojamų nuotraukų versijos. Generated manifestai nekeliami į GitHub. `npm run build` juos atkuria.

Tik `published` įrašai generuoja listingą, `/projektai/[slug]/` ir sitemap. Tuščioje galerijoje rodomas „Projektų galerija ruošiama“. Jokių sugalvotų darbų nėra. Pavadinimo keitimas nepakeičia išsaugoto failo slug.

Saugykla ir jos istorija yra viešos, įskaitant juodraščius bei įkeltus failus. Formų nuotraukos į galeriją nepatenka — jos išlieka tik el. pašto sraute. Niekada nekelk privačių klientų nuotraukų be leidimo viešinti.

Programuotojui išlieka `scripts/prepare-project-photo.mjs`, tačiau CMS įkėlimui terminalo nereikia. Backup — pilnas GitHub repo/mirror, atskirai saugiai perduoti Cloudflare secrets. Perkeliant nekeisti domeno ir projektų failų vardų; jų vieši adresai liks tokie patys.
