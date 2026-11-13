import { SITE, crumbs, crumbsSchema, checkIcon, faqSchema } from './site.mjs';

const C = [{ name: 'Pradžia', path: '/' }, { name: 'Kainos', path: '/kaina/' }];

const ROWS = [
  ['Sklypo lyginimas mini krautuvu', '30–45 € / val.'],
  ['Sklypo lyginimas buldozeriu', '50–70 € / val.'],
  ['Kasimo darbai mini ekskavatoriumi', '25–35 € / val.'],
  ['Juodžemis, smėlis, žvyras', 'pagal kiekį, nuo 3 € / m³'],
  ['Drenažas', '10–30 € / m'],
  ['Technikos atvežimas', 'nuo 30 €'],
  ['Matavimas', 'nemokamai'],
];

const QA = [
  { q: 'Kiek kainuoja sklypo lyginimas?', a: 'Sklypus lyginame už 30–45 € technikos valandą su operatoriumi, buldozeriu – 50–70 € už valandą. Prie to pridedamas technikos atvežimas (nuo 30 €) ir juodžemis, jei jo reikia. Matavimas nemokamas.' },
  { q: 'Per kiek laiko išlyginate sklypą?', a: 'Įprastą 10–15 arų sklypą dažniausiai išlyginame per vieną–dvi darbo dienas. Tikslų terminą pasakome po matavimo.' },
];

const condBtn = (id, label, hint, path, on) => `<button type="button" class="opt" data-cond="${id}" aria-pressed="${on}"><svg width="72" height="22" viewBox="0 0 64 20" aria-hidden="true"><path d="${path}" fill="none" stroke="#6E4B33" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg><b>${label}</b><small>${hint}</small></button>`;

export default {
  path: '/kaina/',
  current: '/kaina/',
  title: 'Sklypo lyginimo kaina 2026 – įkainiai ir skaičiuoklė',
  description: 'Kiek kainuoja sklypo lyginimas? 30–45 €/val., buldozeriu 50–70 €/val. Paskaičiuokite kainą skaičiuoklėje – tikslią pateiksime po nemokamo matavimo.',
  ogType: 'article',
  body: `
<section style="padding:40px 0 clamp(48px,6vw,72px)" data-mg data-stagger="90">
<div class="wrap stack" style="gap:36px">
<div data-m="up">${crumbs(C)}</div>
<div class="split end" style="gap:28px 64px">
<h1 class="disp h1-l" data-m="up">Sklypo lyginimo kaina</h1>
<div class="stack" style="gap:14px;padding-bottom:8px">
<p class="lead" style="color:var(--ink-2)" data-m="up">Sklypus lyginame už 30–45 € technikos valandą, buldozeriu – 50–70 €. Įprastą 10–15 arų sklypą dažniausiai išlyginame per vieną–dvi darbo dienas. Matavimas nemokamas.</p>
<p class="small" style="font-size:15px" data-m="up">Atnaujinta <time datetime="${SITE.updated}">${SITE.updatedLt}</time></p>
</div>
</div>
</div>
</section>

<section class="sec-b" data-mg>
<div class="wrap">
<div class="calc" data-calc data-m="card">
<div class="calc-in">
<h2 class="h2 h2-s">Paskaičiuokite savo sklypą</h2>
<div class="stack" style="gap:14px">
<div style="display:flex;justify-content:space-between;align-items:baseline;gap:12px"><label for="area" class="lbl-l" style="font-size:18px;font-weight:650">Plotas</label><output class="tnum" for="area" data-area-out style="font-size:30px;font-weight:700;letter-spacing:-.02em">12 a</output></div>
<input id="area" type="range" min="1" max="100" step="1" value="12" data-area>
<div class="tnum small" style="display:flex;justify-content:space-between;font-size:14px"><span>1 a</span><span>50 a</span><span>100 a</span></div>
</div>
<fieldset><legend>Kokia žemė dabar</legend><div class="opts">
${condBtn('flat', 'Beveik lygi', 'Pieva, nedideli nelygumai', 'M2 12 C 16 10, 30 13, 44 11 S 58 12, 62 11', false)}
${condBtn('mid', 'Kauburiuota', 'Duobės, krūvos, provėžos', 'M2 14 C 10 4, 18 18, 28 10 S 44 4, 52 14 S 60 10, 62 9', true)}
${condBtn('rough', 'Po statybų', 'Molis, atliekos, dideli skirtumai', 'M2 16 L10 4 L18 14 L26 2 L36 18 L46 6 L54 16 L62 4', false)}
</div></fieldset>
<fieldset><legend>Technika</legend><div class="opts" style="grid-template-columns:repeat(auto-fit,minmax(min(240px,100%),1fr))">
<button type="button" class="opt" data-mach="bobcat" aria-pressed="true"><b>Mini krautuvas</b><small class="tnum">30–45 € / val., kiemams</small></button>
<button type="button" class="opt" data-mach="dozer" aria-pressed="false"><b>Buldozeris</b><small class="tnum">50–70 € / val., dideliems plotams</small></button>
</div></fieldset>
<fieldset><legend>Papildomai</legend>
<div class="row" style="gap:10px">
<label class="tg"><input type="checkbox" data-x="mill" checked>Frezavimas</label>
<label class="tg"><input type="checkbox" data-x="stones">Akmenų rinkimas</label>
<label class="tg"><input type="checkbox" data-x="soil">Juodžemio atvežimas</label>
</div>
<div data-soil-box hidden style="margin-top:16px;padding:20px;border-radius:18px;background:var(--mist)" class="stack">
<div style="display:flex;justify-content:space-between;align-items:baseline;gap:12px"><label for="depth" style="font-size:16px;font-weight:600">Sluoksnio storis</label><output class="tnum" for="depth" data-depth-out style="font-size:18px;font-weight:700">15 cm</output></div>
<input id="depth" type="range" min="5" max="30" step="1" value="15" data-depth>
<span class="small">Vejai rekomenduojama 15–18 cm.</span>
</div>
</fieldset>
</div>
<aside class="calc-out" aria-live="polite">
<span style="font-size:16px;color:var(--on-dark)">Orientacinė kaina</span>
<div class="stack" style="gap:8px"><span class="disp tnum" style="font-size:clamp(44px,4.6vw,64px)" data-total>–</span><span class="tnum" style="font-size:16px;color:var(--on-dark)" data-hours></span></div>
<div class="calc-lines tnum" data-lines></div>
<p class="small" style="color:var(--on-dark-2)">Skaičiuojama pagal mūsų orientacinius įkainius ir tipinį technikos našumą. Tikslią kainą pateiksime raštu po nemokamo matavimo.</p>
<a href="/uzklausa/" class="btn-l" style="width:100%" data-calc-cta>Gauti tikslią kainą</a>
</aside>
</div>
</div>
</section>

<section class="sec-b" data-mg>
<div class="wrap split" style="gap:32px 80px">
<div class="stack" style="gap:18px;max-width:26em">
<h2 class="h2 h2-m" data-m="up">Mūsų įkainiai</h2>
<p class="body-l" data-m="up">Dirbame už technikos valandą su operatoriumi. Kiek valandų prireiks jūsų sklypui, pasakome po matavimo – ir įrašome į sąmatą.</p>
</div>
<div>
<div class="tbl-wrap" data-m="up" data-story="trows"><table class="tbl tnum"><caption class="sr">Sklypo lyginimo įkainiai</caption><thead><tr><th scope="col">Paslauga</th><th scope="col">Kaina</th></tr></thead><tbody>
${ROWS.map((r) => `<tr><td>${r[0]}</td><td>${r[1]}</td></tr>`).join('')}
</tbody></table></div>
<p class="small" style="margin-top:16px" data-m="up">Kainos orientacinės. Galutinę sumą pateikiame raštu prieš pradedant darbus.</p>
</div>
</div>
</section>

<section class="sec-b" data-mg>
<div class="wrap" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(min(440px,100%),1fr));gap:24px">
<div class="panel stack" style="gap:24px" data-m="card">
<h2 class="h2 h2-s">Nuo ko priklauso kaina</h2>
<dl style="margin:0;display:flex;flex-direction:column;gap:18px">
<div><dt style="font-size:18px;font-weight:650">Reljefas</dt><dd style="margin:4px 0 0" class="muted">Kuo didesni aukščių skirtumai, tuo daugiau valandų ir sunkesnės technikos.</dd></div>
<div><dt style="font-size:18px;font-weight:650">Gruntas</dt><dd style="margin:4px 0 0" class="muted">Molis, akmenys ir statybinės atliekos lėtina darbą.</dd></div>
<div><dt style="font-size:18px;font-weight:650">Žemės balansas</dt><dd style="margin:4px 0 0" class="muted">Ar gruntą reikia atvežti, išvežti, ar užtenka perstumdyti sklype.</dd></div>
<div><dt style="font-size:18px;font-weight:650">Privažiavimas ir atstumas</dt><dd style="margin:4px 0 0" class="muted">Siauri vartai riboja technikos dydį, tolimesnis rajonas – brangesnis atvežimas.</dd></div>
</dl>
</div>
<div class="panel stack" style="gap:24px" data-m="card">
<h2 class="h2 h2-s">Kas visada įskaičiuota</h2>
<ul class="cl">
<li>${checkIcon()}Nemokamas matavimas nivelyru prieš darbus.</li>
<li>${checkIcon()}Sąmata raštu – kiekvienas darbas atskira eilute.</li>
<li>${checkIcon()}Juodžemio kiekio paskaičiavimas: 1 aras × 15 cm = 15 m³.</li>
<li>${checkIcon()}Nuolydžių patikrinimas ir sutvarkyta vieta po darbų.</li>
</ul>
</div>
</div>
</section>

<section class="sec-b" data-mg><div class="wrap"><div class="panel-dark" data-m="card" style="display:flex;flex-wrap:wrap;justify-content:space-between;align-items:center;gap:28px">
<h2 class="h2" style="font-size:clamp(30px,3.6vw,48px);max-width:16em">Tikslią kainą pasakysime išmatavę sklypą. Matavimas nemokamas.</h2>
<a href="/uzklausa/" class="btn-l">Gauti pasiūlymą</a>
</div></div></section>`,
  schema: [
    crumbsSchema(C),
    { '@type': 'Article', headline: 'Sklypo lyginimo kaina', dateModified: SITE.updated, inLanguage: 'lt-LT', publisher: { '@id': SITE.url + '/#org' }, mainEntityOfPage: SITE.url + '/kaina/' },
    faqSchema(QA),
  ],
};
