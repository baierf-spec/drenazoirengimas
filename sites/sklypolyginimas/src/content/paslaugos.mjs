import { crumbs, crumbsSchema, SITE } from './site.mjs';

const C = [{ name: 'Pradžia', path: '/' }, { name: 'Paslaugos', path: '/paslaugos/' }];

const fact = (k, v) => `<div class="fact" data-m="up"><span>${k}</span><span class="tnum">${v}</span></div>`;

const block = ({ id, title, text, facts, svg, label, flip, extra = '', story }) => {
  const txt = `<div class="stack" style="max-width:30em"><h2 class="h2" style="font-size:clamp(32px,3.6vw,48px)" data-m="up">${title}</h2><p style="font-size:18px;line-height:1.6;color:var(--ink-3)" data-m="up">${text}</p>${extra}<div>${facts.map(([k, v]) => fact(k, v)).join('')}</div></div>`;
  const fig = `<figure class="figure" data-m="card" data-d="${flip ? 0 : 160}"><svg viewBox="${svg[0]}" role="img" aria-label="${label}" data-story="${story}">${svg[1]}</svg></figure>`;
  return `<section id="${id}" class="sec-b" data-mg><div class="wrap split center">${flip ? fig + txt : txt + fig}</div></section>`;
};

const F = 'font-family="Bricolage Grotesque, sans-serif"';

const blocks = [
  { id: 's1', story: 'cutfill', title: 'Grubus lyginimas ir planiravimas', text: 'Nukasame kauburius, o žemumas užpildome tuo pačiu gruntu – todėl dažnai nereikia nei išvežti, nei pirkti žemės. Aukščius susiejame su namo cokoliu, keliu ir kaimynų sklypais.', facts: [['Kada reikia', 'Nauja statyba, sena pieva, krūvos po kasimo'], ['Kaina', '30–45 € už technikos valandą']], label: 'Pjūvis: kauburiai nukasami, duobės užpildomos iki projektinio paviršiaus', svg: ['0 0 600 300', `
<path data-cut d="M30 160 C 80 92, 140 92, 190 150 L190 158 L30 155 Z" fill="#D9A27B"/><path class="sx" data-fill d="M190 158 C 230 200, 280 230, 330 180 L330 165 Z" fill="#A9C5DA" style="transform-origin:center top"/>
<path data-cut d="M330 165 L330 180 C 360 150, 400 100, 440 120 L 470 150 L470 168 Z" fill="#D9A27B"/><path class="sx" data-fill d="M470 168 C 510 190, 540 205, 570 165 L570 172 Z" fill="#A9C5DA" style="transform-origin:center top"/>
<path d="M30 160 C 80 92, 140 92, 190 150 S 280 230, 330 180 S 400 100, 440 120 S 540 210, 570 165" fill="none" stroke="#8A6A4E" stroke-width="2" stroke-dasharray="6 6"/>
<path data-draw d="M30 155 L570 172" stroke="#16291C" stroke-width="3.5" stroke-linecap="round" pathLength="1" stroke-dasharray="1" stroke-dashoffset="0"/>
<g ${F} font-size="16" font-weight="600" fill="#16291C"><text x="64" y="80">Nukasama</text><text x="214" y="252">Užpilama</text><text x="368" y="88">Nukasama</text><text x="30" y="282" font-weight="500" fill="#4C5A4F">Ištisinė linija – būsimas paviršius</text></g>`] },
  { id: 's2', story: 'roller', flip: true, title: 'Paruošimas vejai', text: 'Paskutinis žingsnis prieš sėją ar ritininę veją. Išfrezuojame, išrenkame akmenis, išlyginame ir privoluojame – kad vejapjovė pjautų tolygiai ir neliktų įdubų, kuriose kaupiasi vanduo.', facts: [['Kas įeina', 'Frezavimas, akmenų išrinkimas, lyginimas, volavimas'], ['Kaina', '30–45 € už technikos valandą']], label: 'Paruošimas vejai: paviršius lyginamas ir volojamas, leistinas nuokrypis plius minus 2 cm', svg: ['0 0 600 300', `
<rect x="30" y="140" width="540" height="28" rx="6" fill="#E1ECDF"/>
<path d="M30 154 Q 60 149 90 155 T 150 152 T 210 156 T 270 151 T 330 155 T 390 153 T 450 156 T 510 151 T 570 154" fill="none" stroke="#16291C" stroke-width="3"/>
<rect data-flat x="420" y="141" width="0" height="26" fill="#E1ECDF"/><rect data-flat x="420" y="152.5" width="0" height="3" fill="#16291C"/>
<path d="M30 168 L570 168 L570 250 L30 250 Z" fill="#5B4130"/>
<g data-roller><circle cx="420" cy="112" r="24" fill="#F8FAF6" stroke="#16291C" stroke-width="3"/><path data-spoke d="M420 92 V132 M400 112 H440" stroke="#16291C" stroke-width="2" stroke-linecap="round"/><circle cx="420" cy="112" r="5" fill="#16291C"/>
<path d="M420 112 L 470 66 L 506 66" stroke="#16291C" stroke-width="3" fill="none" stroke-linecap="round"/></g>
<g ${F} font-size="16" font-weight="600" fill="#16291C"><text x="30" y="128">Leistinas nuokrypis ±2 cm</text><text x="30" y="282" font-weight="500" fill="#4C5A4F">Volas sutankina paviršių prieš sėją</text></g>`] },
  { id: 's3', story: 'planflow', title: 'Nuolydžiai ir vandens nuvedimas', text: 'Vanduo visada bėga žemyn – mes nusprendžiame, kur. Nuolydžius formuojame nuo pamatų, terasos ir takų link vietos, kur vanduo gali susigerti ar nutekėti. Taisome ir balas jau įrengtuose sklypuose.', facts: [['Nuolydis prie namo', '2–5 % pirmuosius 3 metrus'], ['Drenažas', '10–30 € už metrą']], label: 'Sklypo planas: namas centre, rodyklės rodo nuolydžius nuo namo link griovio ir įgerinimo šulinio', svg: ['0 0 600 380', `
<rect x="30" y="30" width="540" height="320" rx="18" fill="none" stroke="#C3CEC1" stroke-width="2"/>
<path d="M60 76 C 200 56, 400 66, 540 86 M60 130 C 200 110, 400 120, 540 140 M60 250 C 200 270, 400 260, 540 240 M60 304 C 200 324, 400 314, 540 294" fill="none" stroke="#DCE3DA" stroke-width="2"/>
<rect x="220" y="150" width="150" height="90" rx="6" fill="#16291C"/><rect x="370" y="168" width="58" height="54" rx="4" fill="#C3CEC1"/>
<g stroke="#2E5B3A" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round">
<path data-arrow pathLength="1" stroke-dasharray="1" stroke-dashoffset="0" d="M295 146 L295 96 M287 106 L295 94 L303 106"/>
<path data-arrow pathLength="1" stroke-dasharray="1" stroke-dashoffset="0" d="M432 195 L500 195 M490 187 L502 195 L490 203"/>
<path data-arrow pathLength="1" stroke-dasharray="1" stroke-dashoffset="0" d="M295 244 L295 294 M287 284 L295 296 L303 284"/>
<path data-arrow pathLength="1" stroke-dasharray="1" stroke-dashoffset="0" d="M216 195 L136 195 M146 187 L134 195 L146 203"/>
</g>
<path data-ditch d="M50 334 L550 334" stroke="#4E86B0" stroke-width="4" stroke-linecap="round" stroke-dasharray="12 8"/><circle cx="520" cy="296" r="13" fill="#F8FAF6" stroke="#4E86B0" stroke-width="3"/>
<circle data-drop cx="60" cy="334" r="6" fill="#4E86B0" stroke="#F8FAF6" stroke-width="2" opacity="0"/>
<g ${F} font-size="15" font-weight="600" fill="#16291C"><text x="295" y="200" text-anchor="middle" fill="#EEF2EC">Namas</text><text x="305" y="124">3 %</text><text x="305" y="276">3 %</text><text x="146" y="182">2 %</text><text x="446" y="182">2 %</text><text x="60" y="324" fill="#2F6A94">Griovys</text><text x="436" y="270" fill="#2F6A94">Įgerinimo šulinys</text></g>`] },
  { id: 's4', story: 'stones', flip: true, title: 'Frezavimas ir akmenų rinkimas', text: 'Po statybų žemė būna suspausta beveik kaip asfaltas. Išfrezuojame ją, kad šaknys ir vanduo prasiskverbtų, o akmenis išrenkame anksčiau, nei jie sugadina vejapjovę.', facts: [['Svarbu', 'Frezuojame tik išdžiūvusią žemę'], ['Kaina', 'Pagal plotą ir gruntą']], label: 'Frezavimas: suslūgęs sluoksnis su akmenimis tampa purus', svg: ['0 0 600 280', `
<rect x="30" y="90" width="262" height="72" rx="6" fill="#8A6A4E"/><rect x="308" y="90" width="262" height="72" rx="6" fill="#B08A67"/><rect x="30" y="170" width="540" height="70" rx="6" fill="#D8CBB0"/>
<circle data-stone cx="90" cy="124" r="11" fill="#5C6B60"/><circle data-stone cx="170" cy="112" r="8" fill="#5C6B60"/><circle data-stone cx="240" cy="140" r="9" fill="#5C6B60"/>
<g fill="#7A5C42"><circle cx="340" cy="110" r="2"/><circle cx="380" cy="132" r="2"/><circle cx="430" cy="114" r="2"/><circle cx="480" cy="140" r="2"/><circle cx="530" cy="118" r="2"/><circle cx="360" cy="148" r="2"/><circle cx="456" cy="104" r="2"/><circle cx="510" cy="150" r="2"/></g>
<g ${F} font-size="16" font-weight="600" fill="#16291C"><text x="30" y="74">Prieš: suslūgęs, su akmenimis</text><text x="308" y="74">Po: purus, be akmenų</text><text x="30" y="268" font-weight="500" fill="#4C5A4F">Paprastai frezuojama 15–20 cm gylio</text></g>`] },
  { id: 's5', story: 'volume', title: 'Juodžemio atvežimas ir paskleidimas', text: 'Juodžemio kiekį paskaičiuojame iš anksto, kad nepirktumėte per daug ar per mažai. Prieš paskleisdami parodome atvežtą žemę – joje neturi būti molio grumstų ir šaknų.', facts: [['Kaina', 'Pagal kiekį ir atstumą, atvežimas nuo 30 €']], extra: `<div data-m="up" style="background:var(--forest);color:var(--mist);border-radius:18px;padding:24px 26px;display:flex;flex-direction:column;gap:6px"><span style="font-size:15px;color:var(--on-dark)">Greitas skaičiavimas</span><span class="tnum" style="font-size:28px;font-weight:700;letter-spacing:-.02em">1 aras × 15 cm = 15 m³</span><span style="font-size:15px;color:var(--on-dark)">Dešimčiai arų vejos reikia apie 150–180 m³.</span></div>`, label: 'Schema: 10 × 10 metrų plotas su 15 cm juodžemio sluoksniu lygu 15 kubinių metrų', svg: ['0 0 600 300', `
<path d="M100 178 L300 258 L500 178 L300 98 Z" fill="#D8CBB0" opacity=".6"/>
<path class="sx" data-v1 d="M100 146 L300 226 L300 258 L100 178 Z" fill="#5B4130" style="transform-origin:center bottom"/>
<path class="sx" data-v2 d="M300 226 L500 146 L500 178 L300 258 Z" fill="#7A5C42" style="transform-origin:center bottom"/>
<path data-top d="M300 66 L500 146 L300 226 L100 146 Z" fill="#4F8A4C"/>
<g ${F} font-size="16" font-weight="600" fill="#16291C"><text x="150" y="88" transform="rotate(-22 150 88)">10 m</text><text x="408" y="84" transform="rotate(22 408 84)">10 m</text><line x1="524" y1="146" x2="524" y2="178" stroke="#16291C" stroke-width="2"/><text x="534" y="168">15 cm</text><text data-vnum class="count" x="300" y="290" text-anchor="middle" font-size="20" font-weight="700">15 m³</text></g>`] },
  { id: 's6', story: 'clear', flip: true, title: 'Sklypo paruošimas statyboms', text: 'Prieš pamatus išvalome ir išlyginame statybos dėmę, įrengiame privažiavimą technikai. Po statybų surenkame atliekas ir paruošiame sklypą aplinkos tvarkymui.', facts: [['Kas įeina', 'Krūmai, kelmai, šaknys, atliekos, skaldos privažiavimas'], ['Kaina', 'Po apžiūros vietoje']], label: 'Sklypo planas: pažymėti šalinami kelmai ir krūmai, statybos dėmė ir laikinas privažiavimas', svg: ['0 0 600 340', `
<rect x="30" y="30" width="540" height="280" rx="18" fill="none" stroke="#C3CEC1" stroke-width="2"/>
<path data-road d="M30 266 L156 266 L214 218" fill="none" stroke="#D8CBB0" stroke-width="26" stroke-linecap="round" stroke-linejoin="round" pathLength="1" stroke-dasharray="1" stroke-dashoffset="0"/>
<rect x="210" y="110" width="170" height="110" rx="8" fill="#E1ECDF" stroke="#2E5B3A" stroke-width="2.5" stroke-dasharray="8 6"/>
<g stroke="#8A6A4E" stroke-width="3" stroke-linecap="round"><path class="sx" data-x-mark d="M90 80 l14 14 M104 80 l-14 14"/><path class="sx" data-x-mark d="M150 140 l14 14 M164 140 l-14 14"/><path class="sx" data-x-mark d="M460 80 l14 14 M474 80 l-14 14"/><path class="sx" data-x-mark d="M480 220 l14 14 M494 220 l-14 14"/><path class="sx" data-x-mark d="M420 260 l14 14 M434 260 l-14 14"/></g>
<g ${F} font-size="15" font-weight="600" fill="#16291C"><text x="295" y="170" text-anchor="middle">Statybos dėmė</text><text x="48" y="300">Laikinas privažiavimas</text><text x="420" y="60" fill="#6E4B33">Kelmai ir krūmai</text></g>`] },
];

export default {
  path: '/paslaugos/',
  current: '/paslaugos/',
  title: 'Sklypo lyginimo paslaugos: planiravimas, nuolydžiai, veja',
  description: 'Grubus sklypo lyginimas, paruošimas vejai, nuolydžiai ir drenažas, frezavimas, juodžemio atvežimas, paruošimas statyboms. Nemokamas matavimas.',
  body: `
<section style="padding:40px 0 clamp(56px,7vw,88px)" data-mg data-stagger="90">
<div class="wrap stack" style="gap:36px">
<div data-m="up">${crumbs(C)}</div>
<div class="split end" style="gap:28px 64px">
<h1 class="disp h1-l" data-m="up">Sklypo lyginimo paslaugos</h1>
<p class="lead" style="padding-bottom:8px" data-m="up">Atliekame visus sklypo paruošimo darbus – nuo grubaus lyginimo iki paruošimo vejai. Štai kaip atrodo kiekvienas darbas ir kiek jis kainuoja.</p>
</div>
<div class="pills" data-m="up"><a href="#s1" class="pill">Grubus lyginimas</a><a href="#s2" class="pill">Paruošimas vejai</a><a href="#s3" class="pill">Nuolydžiai</a><a href="#s4" class="pill">Frezavimas</a><a href="#s5" class="pill">Juodžemis</a><a href="#s6" class="pill">Paruošimas statyboms</a></div>
</div>
</section>
${blocks.map(block).join('\n')}
<section class="sec-b" data-mg><div class="wrap"><div class="panel-dark" style="display:flex;flex-wrap:wrap;justify-content:space-between;align-items:center;gap:28px" data-m="card">
<h2 class="h2" style="font-size:clamp(30px,3.6vw,48px);max-width:16em">Nežinote, kurių darbų reikia? Atvažiuosime ir įvertinsime.</h2>
<a href="/uzklausa/" class="btn-l">Gauti pasiūlymą</a>
</div></div></section>`,
  schema: [
    crumbsSchema(C),
    { '@type': 'ItemList', name: 'Sklypo lyginimo paslaugos', itemListElement: blocks.map((b, i) => ({ '@type': 'ListItem', position: i + 1, item: { '@type': 'Service', name: b.title, description: b.text, url: SITE.url + '/paslaugos/#' + b.id } })) },
  ],
};
