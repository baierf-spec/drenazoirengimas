# Projektų galerija per GitHub

Dabartinė architektūra (2026-10-20): galerija statinė, atnaujinama per GitHub ir automatinį Cloudflare build. D1, R2 ir Cloudflare Access nereikalingi. Senoji /gallery-manager/ sąsaja ir jos API grąžina 404. Ankstesnis cloud CMS kodas išlieka Git istorijoje, bet nėra aktyvios programos dalis.

## Įkelti tikrą projektą

1. Paruošk tikras atlikto darbo nuotraukas. Gauk leidimą jas viešinti, pašalink klientų adresus, veidus ir dokumentus. Klientų užklausų nuotraukų automatiškai galerijoje neskelbk.
2. Nuotraukas optimizuok į WebP (apie 480, 960 ir 1600 px), pašalink EXIF. Programuotojui skirtas įrankis: `node scripts/prepare-project-photo.mjs /kelias/foto.jpg projekto-slug nuotrauka`. Išveda JSON nuotraukos įrašą ir sukuria metaduomenų neturinčias versijas public/images/projects/projekto-slug/. Kai kurie HEIC failai priklauso nuo vietinio sharp/libvips palaikymo; galerijos GitHub įkėlimui naudok paruoštą WebP/JPEG.
3. GitHub saugykloje atverk public/images/projects/ ir per Add file → Upload files įkelk paruoštas nuotraukas, išlaikydamas aplankus. Jei reikia, įkelk visą aplanką per kompiuterio naršyklę. Originalų į saugyklą nekelk.
4. Atverk src/data/projects.json → Edit. Dabar faile yra tuščias masyvas `[]`. Pridėk projekto objektą pagal žemiau aprašytą struktūrą. Tai turinio failas, ne užklausų duomenų bazė.
5. Commit changes į main. Cloudflare automatiškai sukuria naują versiją; projektas pasirodo po sėkmingo build. Projekte nėra sugalvotų darbų pavyzdžių.

## Turinio struktūra

Kiekvienas objektas turi:

- slug: unikalus adresas lotyniškomis mažosiomis raidėmis ir brūkšneliais. Paskelbus nekeisk jo, jei nori išsaugoti viešą adresą.
- title: tikras projekto pavadinimas (3–120 simbolių).
- description: tikras situacijos / sprendimo aprašymas (10–2000 simbolių).
- status: published arba draft. Draft projektas negeneruoja detalės puslapio ir nepatenka į sitemap.
- location, completion_date: neprivalomi; data YYYY arba YYYY-MM-DD.
- project_type: neprivalomas foundation, plot, rain arba other.
- sort_order: mažesnis skaičius rodomas anksčiau, numatyta 0.
- cover: viršelio nuotraukos indeksas, skaičiuojamas nuo 0.
- images: bent viena nuotrauka. Kiekviena turi src (kelias /images/projects/... su WebP/JPG/PNG/AVIF plėtiniu), alt (tikras aprašymas), width ir height. Pasirenkamas variants masyvas su src ir width pateikia srcset.

Projekto nuotraukų ir projekto eiliškumas keičiamas images masyvo tvarka ir sort_order. Viršelis – cover. Redaguoti / išpublikuoti: pakeisk objektą. Ištrinti: pašalink objektą ir nereikalingus viešus failus. Privatūs juodraščio vaizdai neturi būti keliami: GitHub istorijoje ir public/ aplanke failai yra vieši net jei projekto status=draft.

## Atsarginės kopijos ir perdavimas

GitHub saugo turinio istoriją. Pilnai kopijai parsisiųsk saugyklą arba git clone --mirror; išsaugok nuotraukas ir projects.json. Perduodant galima perkelti GitHub saugyklą arba importuoti į naujo savininko paskyrą. Naujas Cloudflare Worker jungiamas prie tos pačios struktūros; D1/R2 eksportas nereikalingas. Svetainės nustatymai perduodami site.config.json; privatus Turnstile Secret key ir pasirinktos env: nuorodos perkeliami atskirai. Žr. CONFIGURATION.md. Nepakeitus domeno, slug ir nuotraukų kelių vieši URL išlieka tie patys. DNS perjungimą atlik tik po naujo Worker patikros.
