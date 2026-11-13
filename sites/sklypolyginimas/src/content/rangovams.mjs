import { checkIcon, doneIcon, turnstile } from './site.mjs';

export default {
  path: '/rangovams/',
  title: 'Rangovams – sklypo lyginimo užklausos jūsų regione | sklypolyginimas.lt',
  description: 'Žemės darbų įmonėms: gaukite sklypo lyginimo užklausas iš savo regiono be reklamos biudžeto. Mokestis už užklausą, regiono išimtinė teisė arba svetainės perėmimas.',
  headOpts: { partner: true },
  noindex: true,
  noSitemap: true,
  body: `
<section style="padding:40px 0 var(--sec)" data-mg data-stagger="90">
<div class="wrap split center" style="gap:48px 72px">
<div class="stack" style="gap:28px">
<h1 class="disp" style="font-size:clamp(46px,6vw,86px)" data-m="up">Sklypo lyginimo užsakymai be reklamos biudžeto</h1>
<p class="lead" style="color:var(--ink-2)" data-m="up">Žmonės, ieškantys „sklypo lyginimas“, randa šią svetainę. Kiekvieną užklausą perduodame vienam patikrintam rangovui regione – jums belieka paskambinti ir susitarti.</p>
<div class="row" data-m="up"><a href="#partneris" class="btn">Patikrinti, ar regionas laisvas</a></div>
</div>
<figure class="panel-dark" style="margin:0;padding:clamp(24px,3.4vw,40px)" data-m="card" data-d="200">
<div style="display:flex;justify-content:space-between;align-items:center;gap:12px;margin-bottom:18px"><span style="font-size:20px;font-weight:650">Naujos užklausos</span><span style="font-size:14px;color:var(--on-dark-2)">pavyzdys</span></div>
<div class="stack-box" data-story="leadstack" data-leads='[["Vilniaus r., Riešė", "14 a · po statybų · per dvi savaites", ["Grubus lyginimas", "Juodžemis", "Veja"], "prieš 12 min."], ["Kauno r., Garliava", "9 a · telkšo vanduo · per mėnesį", ["Nuolydžiai", "Drenažas"], "prieš 40 min."], ["Trakų r., Lentvaris", "22 a · kauburiai · per dvi savaites", ["Grubus lyginimas", "Frezavimas"], "prieš 1 val."], ["Vilniaus m., Pilaitė", "6 a · po statybų · per mėnesį", ["Veja", "Akmenys"], "prieš 2 val."], ["Kauno m., Aleksotas", "11 a · kauburiai · kitą sezoną", ["Grubus lyginimas", "Juodžemis"], "prieš 3 val."]]'>
<div class="lead-card" style="opacity:0;transform:translateY(-24px);z-index:10" aria-hidden="true"><div class="lc-top"><span class="lc-place">Kauno r., Garliava</span><span style="display:flex;gap:8px;align-items:center"><span class="lc-new">nauja</span><span class="lc-time">ką tik</span></span></div><span class="lc-meta">9 a · telkšo vanduo · per mėnesį</span><div class="lc-tags"><span>Nuolydžiai</span><span>Drenažas</span></div></div><div class="lead-card" style="transform:translateY(0px);z-index:9"><div class="lc-top"><span class="lc-place">Vilniaus r., Riešė</span><span style="display:flex;gap:8px;align-items:center"><span class="lc-new" style="display:none">nauja</span><span class="lc-time">prieš 12 min.</span></span></div><span class="lc-meta">14 a · po statybų · per dvi savaites</span><div class="lc-tags"><span>Grubus lyginimas</span><span>Juodžemis</span><span>Veja</span></div></div><div class="lead-card" style="transform:translateY(132px) scale(.975);z-index:8"><div class="lc-top"><span class="lc-place">Kauno m., Aleksotas</span><span style="display:flex;gap:8px;align-items:center"><span class="lc-new" style="display:none">nauja</span><span class="lc-time">prieš 3 val.</span></span></div><span class="lc-meta">11 a · kauburiai · kitą sezoną</span><div class="lc-tags"><span>Grubus lyginimas</span><span>Juodžemis</span></div></div><div class="lead-card" style="transform:translateY(264px) scale(.95);z-index:7" aria-hidden="true"><div class="lc-top"><span class="lc-place">Vilniaus m., Pilaitė</span><span style="display:flex;gap:8px;align-items:center"><span class="lc-new" style="display:none">nauja</span><span class="lc-time">prieš 2 val.</span></span></div><span class="lc-meta">6 a · po statybų · per mėnesį</span><div class="lc-tags"><span>Veja</span><span>Akmenys</span></div></div>
</div>
<figcaption class="small" style="margin-top:12px;color:var(--on-dark-2)">Pavyzdiniai duomenys. Kiekviena užklausa ateina el. paštu iškart po pateikimo, kartu su nuotraukomis.</figcaption>
</figure>
</div>
</section>

<section class="sec-b" data-mg data-stagger="90">
<div class="wrap stack" style="gap:40px">
<h2 class="h2 h2-m" data-m="up">Kaip galime bendradarbiauti</h2>
<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(min(320px,100%),1fr));gap:16px">
<article data-m="card" class="panel stack" style="gap:14px;border-radius:24px;padding:36px"><h3 style="font-size:22px;font-weight:650">Mokestis už užklausą</h3><p class="muted">Mokate tik už gautas užklausas. Be mėnesinio mokesčio ir įsipareigojimų.</p></article>
<article data-m="card" class="panel-dark stack" style="gap:14px;border-radius:24px;padding:36px"><h3 style="font-size:22px;font-weight:650">Visas regionas jums</h3><p style="color:var(--on-dark)">Visos regiono užklausos – tik jums. Jūsų įmonės pavadinimas ir kontaktai miesto puslapyje.</p></article>
<article data-m="card" class="panel stack" style="gap:14px;border-radius:24px;padding:36px"><h3 style="font-size:22px;font-weight:650">Svetainės perėmimas</h3><p class="muted">Perimkite visą svetainę, domeną ir pozicijas paieškoje kaip savo prekės ženklą.</p></article>
</div>
<p class="muted" data-m="up">Kainas aptariame individualiai pagal regioną ir užklausų kiekį.</p>
</div>
</section>

<section id="partneris" class="sec-b" data-mg>
<div class="wrap"><div data-m="card" class="panel split" style="gap:48px 72px">
<div class="stack">
<h2 class="h2 h2-m">Ko tikimės iš partnerio</h2>
<p class="muted">Svetainė klientams žada aiškius dalykus, todėl partneriai turi juos vykdyti.</p>
<ul class="cl">
<li>${checkIcon()}Registruota įmonė ar individuali veikla</li>
<li>${checkIcon()}Susisiekiate su klientu tą pačią arba kitą darbo dieną</li>
<li>${checkIcon()}Matuojate nivelyru, sąmatą pateikiate raštu</li>
<li>${checkIcon()}Turite patikrinamų klientų atsiliepimų</li>
</ul>
</div>
<div data-lead data-endpoint="/api/partner">
<form class="form" action="/api/partner" method="post" novalidate>
<div class="hp" aria-hidden="true"><label>Svetainė<input type="text" name="website" tabindex="-1" autocomplete="off"></label></div>
<label class="lbl">Įmonės pavadinimas<input class="f" type="text" name="imone" required maxlength="120"></label>
<label class="lbl">Regionas<select class="f" name="regionas"><option>Vilnius ir Vilniaus r.</option><option>Kaunas ir Kauno r.</option><option>Klaipėda ir Klaipėdos r.</option><option>Šiauliai</option><option>Panevėžys</option><option>Kitas</option></select></label>
<div class="grid2">
<label class="lbl">Kontaktinis asmuo<input class="f" type="text" name="vardas" maxlength="80"></label>
<label class="lbl">Telefono numeris<input class="f" type="tel" name="tel" maxlength="30"></label>
</div>
<label class="lbl">El. paštas<input class="f" type="email" name="email" required maxlength="120"></label>
${turnstile()}
<p class="form-err" role="alert" data-err></p>
<button type="submit" class="btn btn-block">Patikrinti, ar regionas laisvas</button>
</form>
<div class="done" role="status" tabindex="-1">${doneIcon}<h3 class="h2" style="font-size:32px">Ačiū, gavome</h3><p class="muted">Patikrinsime, ar jūsų regionas laisvas, ir atsakysime per vieną darbo dieną.</p></div>
</div>
</div></div>
</section>`,
};
