import { crumbs } from './site.mjs';

export default {
  path: '/privatumo-politika/',
  title: 'Privatumo politika | sklypolyginimas.lt',
  priority: 0.2,
  description: 'Kaip sklypolyginimas.lt tvarko užklausose pateiktus asmens duomenis.',
  body: `
<section style="padding:40px 0 var(--sec)" data-mg data-stagger="90">
<div class="wrap stack" style="gap:36px">
${crumbs([{ name: 'Pradžia', path: '/' }, { name: 'Privatumo politika', path: '/privatumo-politika/' }])}
<h1 class="disp" style="font-size:clamp(40px,5vw,72px)" data-m="up">Privatumo politika</h1>
<div class="prose" data-m="up">
<p>Atnaujinta 2026 m. spalio 29 d. Ši politika paaiškina, kaip svetainė sklypolyginimas.lt tvarko asmens duomenis, kuriuos pateikiate užklausos formoje.</p>
<h2>Kas tvarko jūsų duomenis</h2>
<p>Svetainės valdytojas (duomenų valdytojas): <span data-lh-operator>fizinis asmuo, vykdantis individualią veiklą ir valdantis LeadHub svetainių tinklą.</span></p>
<p>Kai svetainėje nurodytas darbus atliekantis paslaugų teikėjas (rangovas), jūsų užklausa siunčiama tiesiai jam. Jis atsako į užklausą ir teikia paslaugą kaip savarankiškas duomenų valdytojas, todėl dėl jau gautos užklausos galite kreiptis ir tiesiai į jį.</p>
<p data-lh-provider hidden></p>
<h2>Kokius duomenis renkame</h2>
<p>Vardą, telefono numerį, el. pašto adresą (jei nurodote), sklypo vietą, plotą, situacijos aprašymą, pageidaujamą laiką ir nuotraukas, jei jas pridedate. Techniniais tikslais fiksuojamas užklausos laikas, puslapis ir apytikslė šalis.</p>
<h2>Kam naudojame ir kokiu pagrindu</h2>
<p>Kad su jumis susisiektų, išmatuotų sklypą ir pateiktų pasiūlymą – tai veiksmai jūsų prašymu prieš sudarant sutartį (BDAR 6 str. 1 d. b p.). Užklausa perduodama paslaugų teikėjui jūsų sutikimu, kurį pažymite pateikdami formą (6 str. 1 d. a p.). Rinkodaros pranešimų nesiunčiame.</p>
<h2>Kam perduodame</h2>
<p>Užklausą gauna svetainėje nurodytas paslaugų teikėjas, o kai jis nenurodytas – svetainės valdytojas, kuris jūsų sutikimu gali ją perduoti jūsų regione dirbančiam rangovui. Svetainės veikimą užtikrina paslaugų teikėjai: talpinimas ir el. pašto siuntimas – Cloudflare, Inc., lankomumo statistika (tik jums sutikus) – Google Ireland Ltd. Duomenų neparduodame.</p>
<p>Svetainės valdytojas gauna tos pačios užklausos kopiją el. paštu – kad galėtų patikrinti, ar užklausa tikra, ir pagrįsti paslaugų teikėjui išrašomą sąskaitą (teisėtas interesas, BDAR 6 str. 1 d. f p.). Kopija saugoma ne ilgiau kaip 12 mėnesių. Svetainės sistemoje lieka tik užklausos laikas ir trumpas aprašymas be kontaktų, kuris ištrinamas po 180 dienų.</p>
<h2 id="slapukai">Slapukai ir lankomumo statistika</h2>
<p>Lankomumui matuoti naudojame Google Analytics. Kol nepaspaudžiate „Sutinku“, Google Analytics veikia sutikimo režimu: slapukų nenaudoja ir gauna tik nuasmenintus signalus. Jums sutikus naudojami <code>_ga</code> ir <code>_ga_*</code> slapukai (iki 2 metų), kad matytume, kuriuos puslapius peržiūrite ir ar pateikiate užklausą. Formos turinys į Google Analytics neperduodamas. Pasirinkimą galite pakeisti bet kada – puslapio apačioje spauskite „Slapukų nustatymai“.</p>
<h2>Kiek laiko saugome</h2>
<p>Svetainė užklausų nesaugo: jos iškart siunčiamos el. paštu paslaugų teikėjui ir svetainės valdytojui. Apsaugai nuo piktnaudžiavimo valandą saugoma tik IP adreso maišos reikšmė (be paties adreso). Paslaugų teikėjas gautas užklausas saugo pagal savo taisykles, tiek, kiek reikia atsakyti ir suteikti paslaugą.</p>
<h2>Jūsų teisės</h2>
<p>Galite prašyti susipažinti su savo duomenimis, juos ištaisyti ar ištrinti, apriboti tvarkymą, nesutikti su tvarkymu ir atšaukti sutikimą – parašykite svetainės valdytojui nurodytu el. paštu. Atšaukimas neturi įtakos iki tol atliktam tvarkymui. Skundą galite pateikti <a href="https://vdai.lrv.lt/" target="_blank" rel="noopener">Valstybinei duomenų apsaugos inspekcijai</a>.</p>
</div>
</div>
</section>`,
};
