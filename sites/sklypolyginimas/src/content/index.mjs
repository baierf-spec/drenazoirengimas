import { SITE, faq, faqSchema, shortForm, checkIcon } from './site.mjs';

const FAQ = [
  { q: 'Kiek kainuoja išlyginti 10 arų sklypą?', a: 'Dirbame 30–45 € už technikos valandą su operatoriumi. Kiek valandų prireiks, priklauso nuo reljefo ir grunto: lygiam sklypui – mažiau, kauburiuotam ar po statybų – daugiau. Tikslią kainą pasakome po nemokamo matavimo, o orientacinę galite paskaičiuoti <a href="/kaina/">skaičiuoklėje</a>.' },
  { q: 'Kada geriausia lyginti sklypą?', a: 'Dirbame nuo pavasario, kai žemė pradžiūsta, iki vėlyvo rudens. Molingo grunto po liūčių neliečiame – technika jį suspaustų, ir vanduo nebesigertų. Tokiu atveju palaukiame sausesnių dienų.' },
  { q: 'Kiek juodžemio reikia vejai?', a: 'Vejai reikia 15–18 cm derlingo sluoksnio: vienam arui – 15–18 m³, dešimčiai arų – 150–180 m³. Matuodami įvertiname, kiek geros žemės sklype jau yra, ir pasakome, kiek reikia atvežti.' },
  { q: 'Kokia technika dirbate?', a: 'Kiemams tarp tvorų naudojame mini krautuvą, dideliems plotams ir aukščių skirtumams – buldozerį. Nuolydžius tikriname lazeriniu nivelyru, paviršių sutankiname volu.' },
  { q: 'Ar atvažiuojate apžiūrėti sklypo?', a: 'Taip. Matavimas nemokamas ir nieko neįpareigoja: išmatuojame aukščius, įvertiname gruntą ir privažiavimą, o kainą atsiunčiame raštu.' },
];

const REQ = [
  ['„Kaina sutartinė“, o sąskaita už valandas išauga dvigubai.', 'Kainą pateikiame raštu prieš darbus – su aiškia darbų apimtimi.'],
  ['Pažadama atvažiuoti „kitą savaitę“, o paskui nebeatsiliepiama.', 'Darbų datą suderiname iš anksto ir jos laikomės.'],
  ['Po pirmo lietaus atsiranda balos, vanduo bėga link pamatų.', 'Nuolydį nuo namo išmatuojame nivelyru, o ne „iš akies“.'],
  ['Atvežtame juodžemyje – molis, akmenys ir piktžolių šaknys.', 'Pasakome, iš kur atvežame žemę, ir parodome ją prieš paskleidžiant.'],
  ['Molingas gruntas lyginamas po liūties ir suspaudžiamas.', 'Molingo grunto po liūties neliečiame – palaukiame sausų dienų.'],
  ['Išvažinėta veja, įskilusios trinkelės, užkabinta tvora.', 'Techniką parenkame pagal privažiavimą ir po darbų viską sutvarkome.'],
];

// Thumbnails: each carries hooks for its story (see app.js → stories)
const SVC = [
  ['s1', 'Grubus lyginimas ir planiravimas', 'Nukasame kauburius, užpildome duobes, aukščius susiejame su namu ir keliu.', 'regrade',
    '<path d="M8 40 C 26 20, 40 52, 60 34 S 92 22, 112 38" fill="none" stroke="#8A6A4E" stroke-width="2" stroke-dasharray="4 4"/><path data-draw d="M8 44 L112 48" stroke="#2E5B3A" stroke-width="3" stroke-linecap="round" pathLength="1" stroke-dasharray="1" stroke-dashoffset="0"/>'],
  ['s2', 'Paruošimas vejai', 'Išfrezuojame, išrenkame akmenis, išlyginame ir privoluojame prieš sėją.', 'roll',
    '<rect x="8" y="34" width="104" height="6" rx="3" fill="#4F8A4C"/><rect x="8" y="40" width="104" height="12" fill="#5B4130"/><g data-roller><circle cx="88" cy="24" r="9" fill="none" stroke="#16291C" stroke-width="2"/><path data-spoke d="M88 17 V31 M81 24 H95" stroke="#16291C" stroke-width="1.5"/></g>'],
  ['s3', 'Nuolydžiai ir vandens nuvedimas', 'Nukreipiame vandenį nuo pamatų į drenažą ar griovį.', 'flow',
    '<rect x="10" y="16" width="26" height="30" rx="2" fill="#16291C"/><path d="M36 44 L112 52" stroke="#2E5B3A" stroke-width="3" stroke-linecap="round"/><path data-dash d="M54 34 h36" stroke="#4E86B0" stroke-width="2" fill="none" stroke-linecap="round" stroke-dasharray="6 4"/><path d="M84 29 l7 5 -7 5" stroke="#4E86B0" stroke-width="2" fill="none" stroke-linecap="round"/><circle data-drop cx="40" cy="43" r="2.6" fill="#4E86B0" opacity="0"/>'],
  ['s5', 'Juodžemio atvežimas', 'Atvežame ir paskleidžiame 15–18 cm derlingo sluoksnio – apie 15–18 m³ arui.', 'spread',
    '<path class="sx" data-pile d="M16 50 L36 20 L56 50 Z" fill="#5B4130" style="transform-origin:center bottom"/><rect class="sx" data-layer x="56" y="44" width="56" height="6" rx="3" fill="#5B4130" style="transform-origin:left center"/><rect x="56" y="40" width="56" height="4" rx="2" fill="#4F8A4C"/>'],
  ['s6', 'Sklypo paruošimas statyboms', 'Pašaliname krūmus, kelmus, statybines atliekas ir įrengiame privažiavimą.', 'stump',
    '<path class="sx" data-stump d="M26 52 V30 M26 30 l-8 -8 M26 30 l8 -11" stroke="#8A6A4E" stroke-width="2.2" fill="none" stroke-linecap="round"/><rect x="58" y="30" width="20" height="22" rx="2" fill="none" stroke="#5C6B60" stroke-width="2"/><path d="M8 52 h104" stroke="#2E5B3A" stroke-width="3" stroke-linecap="round"/>'],
];

const heroSvg = `
<svg viewBox="0 0 1200 460" role="img" aria-label="Sklypo pjūvis prieš ir po lyginimo: kairėje duobėtas sklypas su bala, dešinėje lygi veja su nuolydžiu nuo namo">
<defs>
<linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#E4ECE1"/><stop offset="1" stop-color="#D3DFCF"/></linearGradient>
<pattern id="sub" width="14" height="14" patternUnits="userSpaceOnUse"><rect width="14" height="14" fill="#CDBF9F"/><circle cx="3" cy="4" r="1.3" fill="#B5A57F"/><circle cx="10" cy="10" r="1" fill="#B5A57F"/></pattern>
<pattern id="clay" width="18" height="10" patternUnits="userSpaceOnUse"><rect width="18" height="10" fill="#8A6A4E"/><path d="M0 6 Q4.5 3 9 6 T18 6" fill="none" stroke="#7A5C42" stroke-width="1.2"/></pattern>
<clipPath id="after"><rect data-clip x="600" y="0" width="1200" height="460"/></clipPath>
</defs>
<rect width="1200" height="460" fill="url(#sky)"/>
<g>
<path d="M250 318 C 310 262, 360 352, 440 318 S 560 248, 640 306 S 760 366, 840 314 S 980 254, 1060 312 S 1160 340, 1200 322 L1200 460 L250 460 Z" fill="url(#clay)"/>
<path d="M250 318 C 310 262, 360 352, 440 318 S 560 248, 640 306 S 760 366, 840 314 S 980 254, 1060 312 S 1160 340, 1200 322" fill="none" stroke="#5E4430" stroke-width="2.5"/>
<ellipse cx="742" cy="346" rx="58" ry="9" fill="#9FC0D6"/><ellipse class="sx" data-ripple cx="742" cy="345" rx="40" ry="4" fill="#C7DCE8"/>
<ellipse class="sx" data-ring cx="742" cy="346" rx="20" ry="3.2" fill="none" stroke="#EAF3F8" stroke-width="1.6" opacity="0"/>
<circle cx="520" cy="290" r="9" fill="#9C9686"/><circle cx="538" cy="296" r="6" fill="#B1AB9B"/><circle cx="960" cy="276" r="11" fill="#9C9686"/>
<rect x="1010" y="284" width="38" height="12" rx="2" fill="#A8A297" transform="rotate(-14 1029 290)"/>
<path d="M600 268 l-6 -14 M604 268 l2 -16 M609 268 l8 -12" stroke="#6F8A5A" stroke-width="2" fill="none"/>
<path d="M880 312 l-5 -12 M884 312 l3 -14" stroke="#6F8A5A" stroke-width="2" fill="none"/>
</g>
<g clip-path="url(#after)">
<rect width="1200" height="460" fill="url(#sky)"/>
<path d="M250 300 L1200 320 L1200 460 L250 460 Z" fill="url(#sub)"/>
<path d="M250 300 L1200 320 L1200 346 L250 326 Z" fill="#5B4130"/>
<path d="M250 294 L1200 314 L1200 322 L250 302 Z" fill="#4F8A4C"/>
<path d="M250 294 L1200 314" stroke="#3E733D" stroke-width="2.5" fill="none"/>
<path d="M1112 204 L1096 314 M1112 204 L1128 316 M1112 204 L1112 315" stroke="#16291C" stroke-width="2" fill="none"/>
<rect x="1100" y="186" width="24" height="18" rx="4" fill="#16291C"/>
<circle class="sx" data-emitter cx="1104" cy="194" r="4" fill="#D93A2B" opacity="0"/>
<line data-laser x1="1100" y1="194" x2="250" y2="176" stroke="#D93A2B" stroke-width="1.6" stroke-dasharray="2 5"/>
<circle data-rain cx="270" cy="289" r="4.5" fill="#6FA6D6" opacity="0"/><circle data-rain cx="270" cy="289" r="4.5" fill="#6FA6D6" opacity="0"/><circle data-rain cx="270" cy="289" r="4.5" fill="#6FA6D6" opacity="0"/>
<g font-family="Bricolage Grotesque, sans-serif" fill="#16291C">
<path d="M520 262 L690 266" stroke="#16291C" stroke-width="1.5"/><path d="M682 260 L691 266 L682 272" stroke="#16291C" stroke-width="1.5" fill="none"/>
<text x="520" y="250" font-size="18" font-weight="600">Nuolydis 2 % nuo namo</text>
<line x1="980" y1="333" x2="980" y2="392" stroke="#16291C" stroke-width="1.2"/>
<text x="880" y="414" font-size="16">15–18 cm juodžemio</text>
</g>
</g>
<rect x="70" y="190" width="180" height="128" rx="4" fill="#16291C"/>
<path d="M58 194 L160 124 L262 194 Z" fill="#2E5B3A"/>
<rect x="104" y="228" width="34" height="40" rx="2" fill="#EEF2EC" opacity=".85"/>
<rect x="178" y="236" width="40" height="82" rx="2" fill="#5C6B60"/>
<rect x="70" y="318" width="180" height="142" fill="#C3CEC1"/>
<line data-handle-line x1="600" y1="0" x2="600" y2="460" stroke="#F8FAF6" stroke-width="3"/>
<g data-handle transform="translate(600 230)"><circle r="26" fill="#F8FAF6"/><path d="M-8 -7 L-15 0 L-8 7 M8 -7 L15 0 L8 7" stroke="#16291C" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/></g>
<g font-family="Bricolage Grotesque, sans-serif" font-size="17" font-weight="600">
<rect x="292" y="24" width="76" height="34" rx="17" fill="#16291C" opacity=".85"/><text x="330" y="47" text-anchor="middle" fill="#F8FAF6">Prieš</text>
<rect x="1100" y="24" width="64" height="34" rx="17" fill="#F8FAF6"/><text x="1132" y="47" text-anchor="middle" fill="#16291C">Po</text>
</g>
</svg>`;

const techSvg = `<svg viewBox="0 0 600 400" role="img" aria-label="Pjūvis: veja, 15–18 cm juodžemis, sutankintas gruntas, drenažas prie pamatų, nuolydis nuo namo">
<defs><pattern id="cp" width="14" height="14" patternUnits="userSpaceOnUse"><rect width="14" height="14" fill="#D8CBB0"/><circle cx="3" cy="4" r="1.4" fill="#BBAA86"/><circle cx="10" cy="11" r="1" fill="#BBAA86"/></pattern>
<pattern id="gp" width="12" height="12" patternUnits="userSpaceOnUse"><rect width="12" height="12" fill="#E6E2D8"/><circle cx="6" cy="6" r="3.2" fill="#C9C3B4"/></pattern></defs>
<rect x="20" y="44" width="92" height="336" rx="4" fill="#16291C"/>
<path data-layer="B" d="M112 120 L580 150 L580 380 L112 380 Z" fill="url(#cp)"/>
<path data-layer="C" d="M112 112 L580 142 L580 186 L112 156 Z" fill="#5B4130"/>
<path data-layer="A" d="M112 104 L580 134 L580 142 L112 112 Z" fill="#4F8A4C"/>
<g data-layer="D"><rect x="114" y="292" width="76" height="64" fill="url(#gp)"/><circle cx="152" cy="324" r="15" fill="#F8FAF6" stroke="#4E86B0" stroke-width="3"/></g>
<g font-family="Bricolage Grotesque, sans-serif" font-size="15" fill="#16291C" font-weight="600">
<path data-m="line" d="M210 84 L340 92" stroke="#16291C" stroke-width="1.5"/><path d="M332 86 L341 92 L332 98" fill="none" stroke="#16291C" stroke-width="1.5"/>
<text x="210" y="72">2–5 %</text>
<g data-mark="A" data-m="pop"><circle class="sx" data-pulse r="13" cx="420" cy="127" fill="none" stroke="#2E5B3A" stroke-width="2" opacity="0"/><circle cx="420" cy="127" r="13" fill="#16291C"/><text x="420" y="132" text-anchor="middle" fill="#EEF2EC" font-size="13">A</text></g>
<g data-mark="C" data-m="pop"><circle class="sx" data-pulse r="13" cx="360" cy="165" fill="none" stroke="#2E5B3A" stroke-width="2" opacity="0"/><circle cx="360" cy="165" r="13" fill="#16291C"/><text x="360" y="170" text-anchor="middle" fill="#EEF2EC" font-size="13">C</text></g>
<g data-mark="B" data-m="pop"><circle class="sx" data-pulse r="13" cx="440" cy="270" fill="none" stroke="#2E5B3A" stroke-width="2" opacity="0"/><circle cx="440" cy="270" r="13" fill="#16291C"/><text x="440" y="275" text-anchor="middle" fill="#EEF2EC" font-size="13">B</text></g>
<g data-mark="D" data-m="pop"><circle class="sx" data-pulse r="13" cx="214" cy="324" fill="none" stroke="#2E5B3A" stroke-width="2" opacity="0"/><circle cx="214" cy="324" r="13" fill="#16291C"/><text x="214" y="329" text-anchor="middle" fill="#EEF2EC" font-size="13">D</text></g>
<line x1="540" y1="139" x2="540" y2="183" stroke="#16291C" stroke-width="1.5"/><text x="486" y="210" font-weight="500">15–18 cm</text>
</g></svg>`;

const price = (label, a, b, unit) => `<div data-m="up"><dt>${label}</dt><dd><span class="count" data-count="${a},${b}">${a}–${b}</span> €<span> / ${unit}</span></dd></div>`;

export default {
  path: '/',
  title: 'Sklypo lyginimas ir planiravimas – kaina nuo 30 €/val.',
  description: 'Lyginame sklypus, formuojame nuolydžius ir paruošiame vejai Vilniuje, Kaune ir visoje Lietuvoje. Nuo 30 €/val., nemokamas matavimas, kaina raštu.',
  body: `
<section data-mg data-stagger="90">
<div class="wrap stack" style="gap:40px;padding-top:40px">
<div class="split end" style="gap:32px 64px">
<h1 class="disp h1-xl" data-m="up">Sklypo lyginimas, po kurio nelieka balų</h1>
<div class="stack" style="gap:28px;padding-bottom:8px">
<p class="lead" data-m="up">Išlyginame sklypus, suformuojame nuolydžius nuo namo ir paruošiame vejai. Atvažiuojame, išmatuojame nivelyru ir pateikiame kainą raštu – dar prieš pradedant darbus.</p>
<div class="row" data-m="up"><a href="/uzklausa/" class="btn">Gauti pasiūlymą</a><a href="/kaina/" class="btn-o">Kiek tai kainuoja?</a></div>
</div>
</div>
<figure class="slider" data-slider data-m="card" data-story="hero">${heroSvg}
<input class="scrub" type="range" min="2" max="98" step="1" value="50" aria-label="Palyginkite sklypą prieš ir po lyginimo. Naudokite rodykles kairėn ir dešinėn.">
<span class="slider-hint" aria-hidden="true">Tempkite, kad pamatytumėte skirtumą</span>
</figure>
<ul class="ticks">
<li data-m="up">${checkIcon(18)}Nemokamas matavimas</li>
<li data-m="up">${checkIcon(18)}Nuolydžiai matuojami nivelyru</li>
<li data-m="up">${checkIcon(18)}Kaina raštu prieš darbus</li>
</ul>
</div>
</section>

<section class="sec" data-mg>
<div class="wrap split" style="gap:48px 80px">
<div class="stack" style="gap:24px;max-width:34em">
<h2 class="h2 h2-l" data-m="up">Kiek kainuoja sklypo lyginimas</h2>
<p style="font-size:19px;line-height:1.6;color:var(--ink-2)" data-m="up">Dirbame už technikos valandą su operatoriumi: mini krautuvu – 30–45 €, buldozeriu – 50–70 €. Buldozeris brangesnis, bet didelius plotus išlygina gerokai greičiau. Prie sumos pridedamas technikos atvežimas ir juodžemis, jei jo trūksta.</p>
<p class="muted" data-m="up">Tikslią kainą pasakome po nemokamo matavimo ir pateikiame raštu – su kiekvienu darbu atskira eilute.</p>
<a href="/kaina/" style="font-weight:600" data-m="up">Atidaryti kainų skaičiuoklę</a>
</div>
<div class="panel" style="padding-block:12px 24px" data-m="card" data-story="rows">
<dl class="price-dl tnum hl-wrap" style="position:relative"><span class="hl" aria-hidden="true"></span>
${price('Sklypo lyginimas', 30, 45, 'val.')}
${price('Buldozeris', 50, 70, 'val.')}
${price('Mini ekskavatorius', 25, 35, 'val.')}
${price('Juodžemis, smėlis, žvyras', 3, 16, 'm³')}
</dl>
<p class="small" style="margin-top:8px" data-m="up">Orientaciniai įkainiai 2026 m. Galutinė kaina – po matavimo.</p>
</div>
</div>
</section>

<section class="sec" data-mg>
<div class="wrap stack" style="gap:56px">
<div class="split end" style="gap:24px 80px">
<h2 class="h2 h2-l" data-m="up">Kaip dirbame, kad nereikėtų perdarinėti</h2>
<p class="body-l" data-m="up">Šios situacijos dažniausiai nutinka, kai sklypas lyginamas paskubomis. Kiekvienai iš jų turime aiškią taisyklę.</p>
</div>
<div class="req">${REQ.map(([w, n]) => `<div data-m="up"><p class="was">${w}</p><p class="need">${n}</p></div>`).join('')}</div>
</div>
</section>

<section class="dark" style="margin-top:var(--sec);padding-block:var(--sec)" data-mg data-stagger="110">
<div class="wrap stack" style="gap:64px">
<h2 class="h2 h2-l" style="max-width:14em" data-m="up">Nuo užklausos iki lygaus sklypo – trys žingsniai</h2>
<ol class="steps">
<li data-m="up"><span class="disp tnum n">1</span><h3>Aprašote sklypą</h3><p>Vieta, plotas, ko reikia ir, jei norite, kelios nuotraukos. Užtrunka dvi minutes.</p></li>
<li data-m="up"><span class="disp tnum n">2</span><h3>Atvažiuojame išmatuoti</h3><p>Paskambiname tą pačią arba kitą darbo dieną ir suderiname laiką. Matavimas nemokamas.</p></li>
<li data-m="up"><span class="disp tnum n">3</span><h3>Išlyginame sklypą</h3><p>Atsiunčiame kainą raštu. Jums sutikus, sutartą dieną atliekame darbus ir kartu patikriname nuolydžius.</p></li>
</ol>
<div data-m="up"><a href="/uzklausa/" class="btn-l">Pradėti užklausą</a></div>
</div>
</section>

<section class="sec" data-mg>
<div class="wrap split" style="gap:40px 80px">
<div class="stack" style="max-width:26em">
<h2 class="h2 h2-l" data-m="up">Ką atliekame</h2>
<p class="body-l" data-m="up">Dažniausiai reikia kelių darbų iš eilės – atliekame juos visus vienu kartu, pagal vieną sąmatą.</p>
<a href="/paslaugos/" style="font-weight:600" data-m="up">Visos paslaugos su brėžiniais</a>
</div>
<div>${SVC.map(([id, t, d, story, s]) => `<a href="/paslaugos/#${id}" class="svc" data-m="left"><svg viewBox="0 0 120 64" aria-hidden="true" data-story="${story}">${s}</svg><div><h3>${t}</h3><p>${d}</p></div></a>`).join('')}</div>
</div>
</section>

<section class="sec" data-mg>
<div class="wrap">
<div class="panel split center" style="gap:48px 64px" data-m="card">
<div class="stack" style="gap:22px">
<h2 class="h2 h2-m" data-m="up">Taip paruošiame kiekvieną sklypą</h2>
<p class="body-l" data-m="up">Balos, išdžiūvę lopai ir nusėdę takai atsiranda ne dėl žolės, o dėl blogai paruošto pagrindo. Todėl kiekviename sklype darome keturis dalykus:</p>
<dl class="abcd" data-abcd>
<div data-m="up" data-k="A"><dt>A</dt><dd><strong>Nuolydis 2–5 % nuo pamatų</strong> pirmuosius tris metrus.</dd></div>
<div data-m="up" data-k="B"><dt>B</dt><dd><strong>Sutankintas gruntas</strong> po takais ir terasa.</dd></div>
<div data-m="up" data-k="C"><dt>C</dt><dd><strong>15–18 cm juodžemio</strong>, kad veja neišdžiūtų vasarą.</dd></div>
<div data-m="up" data-k="D"><dt>D</dt><dd><strong>Drenažas prie pamatų</strong>, kai gruntas molingas.</dd></div>
</dl>
</div>
<figure style="margin:0" data-story="layers">${techSvg}</figure>
</div>
</div>
</section>

<section id="miestai" class="sec" data-mg data-stagger="50">
<div class="wrap split" style="gap:32px 80px">
<div class="stack" style="gap:16px;max-width:26em">
<h2 class="h2 h2-m" data-m="up">Dirbame visoje Lietuvoje</h2>
<p class="body-l" data-m="up">Daugiausia dirbame Vilniaus ir Kauno regionuose, bet atvažiuojame ir į kitus miestus. Į tolimesnes vietas gali būti didesnis technikos atvežimo mokestis.</p>
</div>
<div class="stack" style="gap:16px" data-story="lightup">
<div class="pills"><a href="/vilnius/" class="pill" data-m="up">Vilnius ir rajonas</a><a href="/kaunas/" class="pill" data-m="up">Kaunas ir rajonas</a></div>
<div class="pills">${['Klaipėda', 'Šiauliai', 'Panevėžys', 'Alytus', 'Marijampolė', 'Trakai', 'Elektrėnai'].map((c) => `<span class="pill" data-m="up">${c}</span>`).join('')}</div>
</div>
</div>
</section>

<section id="duk" class="sec" data-mg>
<div class="wrap split" style="gap:32px 80px">
<h2 class="h2 h2-m" style="max-width:10em" data-m="up">Dažniausi klausimai</h2>
<div data-m="up">${faq(FAQ)}</div>
</div>
</section>

<section id="uzklausa" class="sec sec-b" data-mg>
<div class="wrap">
<div class="panel-dark split" style="gap:48px 72px" data-m="card">
<div class="stack">
<h2 class="h2 h2-l" data-m="up">Sužinokite, kiek kainuos jūsų sklypas</h2>
<p style="font-size:18px;line-height:1.6;color:var(--on-dark);max-width:26em" data-m="up">Du trumpi žingsniai: apie sklypą ir kontaktai. Paskambinsime ir suderinsime nemokamą matavimą. Daugiau detalių galite pridėti <a href="/uzklausa/">išsamioje užklausoje</a>.</p>
</div>
<div style="background:var(--paper);color:var(--forest);border-radius:var(--r-lg);padding:clamp(24px,3.4vw,40px)" data-m="up">
${shortForm({ source: 'pagrindinis' })}
</div>
</div>
</div>
</section>`,
  schema: [
    { '@type': 'Service', name: 'Sklypo lyginimas', serviceType: 'Sklypo lyginimas ir planiravimas', areaServed: { '@type': 'Country', name: 'Lietuva' }, provider: { '@id': SITE.url + '/#org' }, offers: { '@type': 'AggregateOffer', priceCurrency: 'EUR', lowPrice: 30, highPrice: 45, description: 'Kaina už technikos valandą' } },
    faqSchema(FAQ),
    { '@type': 'HowTo', name: 'Kaip užsakyti sklypo lyginimą', totalTime: 'P2D', step: [
      { '@type': 'HowToStep', position: 1, name: 'Aprašote sklypą', text: 'Užpildote užklausą: vieta, plotas, reikalingi darbai, nuotraukos.', url: SITE.url + '/uzklausa/' },
      { '@type': 'HowToStep', position: 2, name: 'Atvažiuojame išmatuoti', text: 'Paskambiname tą pačią arba kitą darbo dieną ir nemokamai išmatuojame sklypą nivelyru.' },
      { '@type': 'HowToStep', position: 3, name: 'Išlyginame sklypą', text: 'Atsiunčiame kainą raštu ir sutartą dieną atliekame darbus, patikriname nuolydžius.' },
    ] },
  ],
};
