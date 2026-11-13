import { SITE, crumbs, crumbsSchema, faq, faqSchema, shortForm } from './site.mjs';

const CITIES = [
  {
    slug: 'vilnius', name: 'Vilnius', loc: 'Vilniuje', gen: 'Vilniaus', municipality: 'Vilniaus m./r.',
    avg: 37, providers: 35,
    villages: ['Vilniaus miestas', 'Avižienių sen.', 'Riešės sen.', 'Pagirių sen.', 'Mickūnų sen.', 'Nemenčinės sen.', 'Rudaminos sen.', 'Sužionių sen.', 'Kita Vilniaus r. vieta'],
    areas: ['Vilniaus miestas', 'Avižieniai', 'Riešė', 'Pagiriai', 'Mickūnai', 'Nemenčinė', 'Rudamina', 'Sužionys', 'Bezdonys', 'Marijampolis', 'Maišiagala'],
    local: 'Vilnius ir jo apylinkės kalvotos, todėl čia dažnai ne tik lyginame, bet ir formuojame nuolydžius ar terasas, kad vanduo nebėgtų link namo. Naujuose priemiesčių kvartaluose – Riešėje, Avižieniuose, Pagiriuose – po statybų sklypuose dažnai lieka iškastos žemės krūvos ir suvažinėtas gruntas, todėl jį pirmiausia supureniame.',
    near: ['Trakai', 'Elektrėnai', 'Širvintos'],
  },
  {
    slug: 'kaunas', name: 'Kaunas', loc: 'Kaune', gen: 'Kauno', municipality: 'Kauno m./r.',
    avg: 37, providers: 30,
    villages: ['Kauno miestas', 'Garliava', 'Domeikava', 'Karmėlava', 'Ringaudai', 'Akademija', 'Neveronys', 'Raudondvaris', 'Samylai', 'Kita Kauno r. vieta'],
    areas: ['Kauno miestas', 'Garliava', 'Domeikava', 'Karmėlava', 'Ringaudai', 'Akademija', 'Neveronys', 'Raudondvaris', 'Samylai', 'Užliedžiai'],
    local: 'Kauno rajone daug naujų individualių namų – ypač Garliavoje, Domeikavoje, Ringauduose ir Neveronyse. Žemesnėse vietose prie Nemuno ir Neries slėnių iš anksto numatome, kur nuvesti lietaus vandenį, todėl nuolydžiai ir drenažas čia dažnai įeina į sąmatą kartu su lyginimu.',
    near: ['Kaišiadorys', 'Jonava', 'Prienai'],
  },
];

const page = (c) => {
  const C = [{ name: 'Pradžia', path: '/' }, { name: 'Miestai', path: '/#miestai' }, { name: c.name, path: `/${c.slug}/` }];
  const QA = [
    { q: `Kiek kainuoja sklypo lyginimas ${c.loc}?`, a: `Sklypus ${c.loc} lyginame už 30–45 € technikos valandą. Galutinė kaina priklauso nuo reljefo, grunto ir atstumo – tikslią pasakome po nemokamo matavimo.` },
    { q: `Ar dirbate ${c.gen} rajone?`, a: `Taip, dirbame visame ${c.gen} mieste ir rajone. Į atokesnes vietas technikos atvežimas gali kainuoti daugiau.` },
    { q: 'Kaip greitai galite pradėti?', a: 'Priklauso nuo sezono. Pavasarį ir rudenį darbų daugiausia, todėl verta užsisakyti bent viena–dviem savaitėmis anksčiau.' },
  ];
  return {
    path: `/${c.slug}/`,
    title: `Sklypo lyginimas ${c.loc} ir rajone – nuo 30 €/val.`,
    description: `Sklypo lyginimas ${c.loc} ir ${c.gen} rajone: planiravimas, nuolydžiai, paruošimas vejai. Nuo 30 €/val., nemokamas matavimas, kaina raštu prieš darbus.`,
    body: `
<section style="padding:40px 0 var(--sec)" data-mg data-stagger="90">
<div class="wrap stack" style="gap:36px">
<div data-m="up">${crumbs(C)}</div>
<div class="split" style="gap:48px 72px">
<div class="stack" style="gap:28px">
<h1 class="disp h1-l" data-m="up">Sklypo lyginimas ${c.loc} ir ${c.gen} rajone</h1>
<p class="lead" style="color:var(--ink-2)" data-m="up">Lyginame sklypus ${c.loc} ir visame ${c.gen} rajone – nuo grubaus planiravimo iki paruošimo vejai. Atvažiuojame, išmatuojame nivelyru ir pateikiame kainą raštu prieš darbus.</p>
<dl class="stats" data-m="up">
<div><dt>už technikos valandą</dt><dd class="disp tnum"><span class="count" data-count="30,45">30–45</span> €</dd></div>
<div><dt>matavimas</dt><dd class="disp tnum"><span class="count" data-count="0">0</span> €</dd></div>
</dl>
<p class="small" data-m="up">Atnaujinta <time datetime="${SITE.updated}">${SITE.updatedLt}</time>.</p>
</div>
<div id="greita" class="panel-dark" style="padding:clamp(24px,3.6vw,44px)" data-m="card" data-d="200">
<h2 class="h2" style="font-size:32px;margin-bottom:20px">Gaukite kainą ${c.gen} regione</h2>
${shortForm({ source: c.slug, dark: true, municipality: c.municipality, villages: c.villages })}
</div>
</div>
</div>
</section>

<section class="sec-b" data-mg data-stagger="45">
<div class="wrap split" style="gap:32px 80px">
<h2 class="h2 h2-m" style="max-width:12em" data-m="up">Kur dirbame</h2>
<div class="pills" data-story="lightup">${c.areas.map((a) => `<span class="pill" style="color:var(--forest)" data-m="up">${a}</span>`).join('')}</div>
</div>
</section>

<section class="sec-b" data-mg>
<div class="wrap" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(min(440px,100%),1fr));gap:24px">
<div class="panel stack" data-m="card">
<h2 class="h2 h2-s">Sklypai ${c.gen} rajone</h2>
<p class="muted" style="line-height:1.65">${c.local}</p>
<ol class="stepper">
<li class="now" style="font-weight:600">Matuodami visada patikriname:</li>
<li class="now"><span class="dot">1</span>Sklypo ribas ir kaimynų sklypų aukščius.</li>
<li class="now"><span class="dot">2</span>Kur galima nuvesti lietaus vandenį.</li>
<li class="now"><span class="dot">3</span>Privažiavimą technikai: vartų plotį, dangas, medžius.</li>
</ol>
</div>
<div class="panel stack" style="gap:8px" data-m="card">
<h2 class="h2 h2-s" style="margin-bottom:12px">Klausimai apie ${c.name === 'Vilnius' ? 'Vilnių' : 'Kauną'}</h2>
${faq(QA, 'compact')}
</div>
</div>
</section>

<section class="sec-b" data-mg>
<div class="wrap stack" data-m="up">
<h2 style="font-size:22px;font-weight:650">Kitos paslaugos</h2>
<div class="pills"><a href="/paslaugos/#s2" class="pill">Paruošimas vejai</a><a href="/paslaugos/#s3" class="pill">Nuolydžiai ir balos</a><a href="/paslaugos/#s5" class="pill">Juodžemio kiekis</a><a href="/kaina/" class="pill">Kainų skaičiuoklė</a>${CITIES.filter((x) => x.slug !== c.slug).map((x) => `<a href="/${x.slug}/" class="pill">Sklypo lyginimas ${x.loc}</a>`).join('')}</div>
</div>
</section>`,
    schema: [
      crumbsSchema(C),
      { '@type': 'Service', name: `Sklypo lyginimas ${c.loc}`, serviceType: 'Sklypo lyginimas', areaServed: c.areas.map((a) => ({ '@type': 'Place', name: a })), provider: { '@id': SITE.url + '/#org' }, offers: { '@type': 'AggregateOffer', priceCurrency: 'EUR', lowPrice: 30, highPrice: 45 } },
      faqSchema(QA),
    ],
  };
};

export default CITIES.map(page);
