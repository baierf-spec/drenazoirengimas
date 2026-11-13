// Shared components and helpers for the pages (HTML strings rendered by src/layouts/Base.astro).
export const SITE = {
  url: 'https://sklypolyginimas.lt',
  name: 'sklypolyginimas.lt',
  updated: '2026-10-24',
  updatedLt: '2026 m. spalio 24 d.',
  // Public Turnstile site key (secret TURNSTILE_SECRET_KEY lives on the Worker).
  turnstileSiteKey: '0x4AAAAAAFljSi-oxU4KlJqh',
};

export const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

export const MUNICIPALITIES = ['Vilniaus m.', 'Vilniaus r.', 'Kauno m.', 'Kauno r.', 'Klaipėdos m.', 'Klaipėdos r.', 'Šiaulių m.', 'Šiaulių r.', 'Panevėžio m.', 'Panevėžio r.', 'Alytaus', 'Marijampolės', 'Trakų r.', 'Elektrėnų', 'Kita'];

export const logoMark = (size = 38) => `<svg width="${size}" height="${size}" viewBox="0 0 36 36" aria-hidden="true"><rect width="36" height="36" rx="10" fill="#16291C"/><path d="M7.5 14.2c2.6-3.4 5 2.8 7.8-.2s5.2-3.4 8.2-.3 3.8 1.4 5 0" fill="none" stroke="#8DB48E" stroke-width="2.2" stroke-linecap="round"/><path d="M7.5 23.2L28.5 25" stroke="#EEF2EC" stroke-width="3.4" stroke-linecap="round"/></svg>`;

export const checkIcon = (size = 20) => `<svg width="${size}" height="${size}" viewBox="0 0 18 18" aria-hidden="true"><circle cx="9" cy="9" r="8.25" fill="none" stroke="#2E5B3A" stroke-width="1.5"/><path d="M5.5 9.3l2.3 2.3 4.7-5" fill="none" stroke="#2E5B3A" stroke-width="1.8"/></svg>`;

const plusIcon = `<svg class="ic" width="20" height="20" viewBox="0 0 20 20" aria-hidden="true"><path d="M10 3v14M3 10h14" stroke="#2E5B3A" stroke-width="2" stroke-linecap="round"/></svg>`;

const photoIcon = (dark) => `<svg width="40" height="40" viewBox="0 0 40 40" aria-hidden="true" style="flex:none"><rect width="40" height="40" rx="12" fill="${dark ? '#2E5B3A' : '#E1ECDF'}"/><path d="M11 27l5.5-6.5 4 4 3-3 5.5 5.5" fill="none" stroke="${dark ? '#EEF2EC' : '#2E5B3A'}" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/><circle cx="25" cy="14.5" r="2.2" fill="${dark ? '#EEF2EC' : '#2E5B3A'}"/></svg>`;

const phoneIcon = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z"/></svg>`;

const doneIcon = `<svg width="48" height="48" viewBox="0 0 48 48" aria-hidden="true"><circle cx="24" cy="24" r="23" fill="#E1ECDF"/><path d="M14 24.5l6.5 6.5L34 17" fill="none" stroke="#2E5B3A" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

export const faq = (items, cls = '') => `<div class="faq ${cls}">${items.map((q, i) => `
<details${i === 0 && cls !== 'compact' ? ' open' : ''}><summary>${q.q}${plusIcon}</summary><p>${q.a}</p></details>`).join('')}
</div>`;

export const faqSchema = (items) => ({
  '@type': 'FAQPage',
  mainEntity: items.map((q) => ({ '@type': 'Question', name: q.q, acceptedAnswer: { '@type': 'Answer', text: q.a.replace(/<[^>]+>/g, '') } })),
});

export const crumbs = (items) => `<nav aria-label="Kelias"><ol class="crumbs">${items.map((c, i) => i === items.length - 1 ? `<li aria-current="page">${c.name}</li>` : `<li><a href="${c.path}">${c.name}</a></li>`).join('')}</ol></nav>`;

export const crumbsSchema = (items) => ({
  '@type': 'BreadcrumbList',
  itemListElement: items.map((c, i) => ({ '@type': 'ListItem', position: i + 1, name: c.name, item: SITE.url + c.path })),
});

export const photoDrop = ({ dark = false, name = 'foto' } = {}) => `
<div class="stack" style="gap:10px">
<label class="drop" data-drop>
<input type="file" name="${name}" accept="image/*" multiple data-photos>
${photoIcon(dark)}
<span style="display:flex;flex-direction:column;gap:2px"><span class="t1" data-photo-label>Pridėti sklypo nuotraukų</span><span class="t2">Nebūtina, bet kaina bus tikslesnė. Iki 6 nuotraukų.</span></span>
</label>
<div class="thumbs" data-thumbs></div>
</div>`;

const turnstile = () => SITE.turnstileSiteKey ? `<div class="cf-turnstile" data-sitekey="${SITE.turnstileSiteKey}" data-language="lt" data-appearance="interaction-only" data-action="lead"></div>` : '';

const munOptions = (placeholder = true) => (placeholder ? '<option value="">Pasirinkite</option>' : '') + MUNICIPALITIES.map((m) => `<option>${m}</option>`).join('');

export const consent = () => `<label class="check"><input type="checkbox" name="sutikimas" value="taip" required><span>Sutinku, kad mano duomenys būtų naudojami šiai užklausai pagal <a href="/privatumo-politika/">privatumo politiką</a>.</span></label>`;

/** Short lead form: 2 steps (plot + situation, contacts). */
export const shortForm = ({ source, dark = false, municipality, villages } = {}) => {
  const place = villages
    ? `<label class="lbl">Vietovė<select class="f" name="vieta">${villages.map((v) => `<option>${v}</option>`).join('')}</select></label>`
    : `<label class="lbl">Savivaldybė<select class="f" name="savivaldybe" required>${munOptions()}</select></label>`;
  return `
<div data-lead class="${dark ? 'dark-form' : ''}">
<div class="lh-card" data-lh-card hidden></div>
<form class="form" action="/api/leads" method="post" enctype="multipart/form-data" novalidate>
<input type="hidden" name="saltinis" value="${esc(source)}">
${municipality ? `<input type="hidden" name="savivaldybe" value="${esc(municipality)}">` : ''}
<div class="hp" aria-hidden="true"><label>Svetainė<input type="text" name="website" tabindex="-1" autocomplete="off"></label></div>
<ol class="fsteps" data-stepper aria-label="Užklausos žingsniai"><li class="now" aria-current="step"><span class="dot">1</span>Sklypas</li><li><span class="dot">2</span>Kontaktai</li></ol>
<div class="step" data-step="1">
<div class="grid2">
${place}
<label class="lbl"><span>Plotas arais <span class="hint">apytiksliai</span></span><input class="f tnum" type="number" name="arai" min="1" max="100000" inputmode="numeric" placeholder="Pvz., 12" required></label>
</div>
<fieldset class="fs"><legend>Kokia situacija dabar?</legend>
<div class="picks">
<label class="pick pick-sm"><input type="radio" name="bukle" value="Kauburiai, duobės">Kauburiai, duobės</label>
<label class="pick pick-sm"><input type="radio" name="bukle" value="Po statybų">Po statybų</label>
<label class="pick pick-sm"><input type="radio" name="bukle" value="Telkšo vanduo">Telkšo vanduo</label>
<label class="pick pick-sm"><input type="radio" name="bukle" value="Reikia vejos">Reikia vejos</label>
</div></fieldset>
<label class="lbl"><span>Aprašykite situaciją <span class="hint">Nebūtina</span></span><textarea class="f" name="pastabos" rows="3" maxlength="2000" placeholder="Pvz., po namo statybos liko grunto krūvos, reikia nuolydžio nuo pamatų ir vejos. Įvažiavimas per 3 m vartus."></textarea></label>
${photoDrop({ dark })}
</div>
<div class="step" data-step="2" hidden>
<div class="grid2">
<label class="lbl">Vardas<input class="f" type="text" name="vardas" autocomplete="given-name" required maxlength="80"></label>
<label class="lbl">Telefono numeris<input class="f" type="tel" name="tel" autocomplete="tel" placeholder="+370" required maxlength="30"></label>
</div>
<label class="lbl"><span>El. paštas <span class="hint">Sąmatai atsiųsti, nebūtina</span></span><input class="f" type="email" name="email" autocomplete="email" maxlength="120"></label>
${consent()}
${turnstile()}
</div>
<p class="form-err" role="alert" data-err></p>
<div class="step-nav tight">
<button type="button" class="btn-o back" data-back hidden aria-label="Atgal"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M19 12H5M11 6l-6 6 6 6"/></svg></button>
<button type="button" class="btn grow" data-next>Toliau</button>
<button type="submit" class="btn grow" data-submit hidden>Gauti pasiūlymą</button>
</div>
</form>
<div class="done" role="status" tabindex="-1">
${doneIcon}
<h3 class="h2" style="font-size:32px">Užklausa išsiųsta</h3>
<p style="font-size:17px;line-height:1.6" class="${dark ? '' : 'muted'}">Paskambinsime tą pačią arba kitą darbo dieną ir suderinsime nemokamo matavimo laiką.</p>
</div>
</div>`;
};

export { munOptions, doneIcon, turnstile };

const NAV = [
  { href: '/paslaugos/', label: 'Paslaugos' },
  { href: '/kaina/', label: 'Kainos' },
  { href: '/#miestai', label: 'Miestai' },
  { href: '/#duk', label: 'Klausimai' },
];

export const header = (current, { minimal = false, partner = false } = {}) => `
<a class="skip" href="#turinys">Pereiti prie turinio</a>
<header class="site-head"><div class="wrap">
<a href="/" class="brand" aria-label="sklypolyginimas.lt, pradžia">${logoMark()}<span class="brand-name">sklypolyginimas<span>.lt</span></span>${partner ? '<span class="badge">rangovams</span>' : ''}</a>
${minimal ? `<a href="/" style="font-size:16px;font-weight:500">Grįžti į pradžią</a>` : partner ? `<a href="#partneris" class="btn btn-sm">Tapti partneriu</a>` : `<nav class="nav" aria-label="Pagrindinė navigacija">
${NAV.map((n) => `<a href="${n.href}"${n.href === current ? ' aria-current="page"' : ''}>${n.label}</a>`).join('\n')}
<a class="btn-o btn-sm lh-call" data-lh-call hidden href="/uzklausa/">${phoneIcon}<span data-lh-phone></span></a>
<a href="/uzklausa/" class="btn btn-sm">Gauti pasiūlymą</a>
</nav>`}
</div></header>`;

export const footer = () => `
<footer class="site-foot"><div class="wrap">
<div class="foot-grid">
<div class="stack" style="gap:14px">
<a href="/" class="brand" aria-label="sklypolyginimas.lt">${logoMark(32)}<span class="brand-name">sklypolyginimas<span>.lt</span></span></a>
<p class="small" style="font-size:15px;max-width:22em">Sklypų lyginimas, nuolydžiai ir paruošimas vejai visoje Lietuvoje. <span data-lh-legal>Užklausas perduodame patikrintiems rangovams.</span></p>
</div>
<nav aria-label="Puslapiai"><a href="/paslaugos/">Sklypo lyginimo paslaugos</a><a href="/kaina/">Kainos ir skaičiuoklė</a><a href="/uzklausa/">Užklausa</a><a href="/privatumo-politika/">Privatumo politika</a><button type="button" class="link-btn" data-ck-open>Slapukų nustatymai</button></nav>
<nav aria-label="Miestai"><a href="/vilnius/">Sklypo lyginimas Vilniuje</a><a href="/kaunas/">Sklypo lyginimas Kaune</a></nav>
<div class="stack" style="gap:12px;font-size:16px"><span class="ttl" style="font-weight:600">Užklausos</span><a href="/uzklausa/">Gauti pasiūlymą</a><span class="muted" style="font-size:15px">Matavimas nemokamas</span><div class="lh-foot stack" data-lh-foot hidden></div></div>
</div>
<p class="small">© 2026 sklypolyginimas.lt</p>
</div></footer>`;
