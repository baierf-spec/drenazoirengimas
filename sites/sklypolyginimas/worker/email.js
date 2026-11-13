// E-mail layout for enquiries and partner sign-ups (table layout, inline styles: Gmail, Outlook, mobile).
export const LEAD_FIELDS = [
  ['savivaldybe', 'Savivaldybė'], ['vieta', 'Vietovė'], ['arai', 'Plotas, a'], ['bukle', 'Situacija'],
  ['darbai', 'Darbai'], ['kada', 'Kada'], ['savininkas', 'Savininkas'], ['biudzetas', 'Biudžetas'],
  ['pastabos', 'Pastabos'], ['vardas', 'Vardas'], ['tel', 'Telefonas'], ['email', 'El. paštas'], ['laikas', 'Patogu skambinti'],
];
export const META_FIELDS = [['saltinis', 'Forma'], ['puslapis', 'Puslapis'], ['referrer', 'Atėjo iš'], ['utm_source', 'utm_source'], ['utm_medium', 'utm_medium'], ['utm_campaign', 'utm_campaign'], ['utm_term', 'utm_term'], ['gclid', 'gclid']];
export const PARTNER_FIELDS = [['imone', 'Įmonė'], ['regionas', 'Regionas'], ['vardas', 'Kontaktinis asmuo'], ['tel', 'Telefonas'], ['email', 'El. paštas']];

export const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
// Strips control characters that could break e-mail headers or layout.
// eslint-disable-next-line no-control-regex
export const clean = (v, max = 500) => String(v ?? '').replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '').trim().slice(0, max);
// ---------- E-mail template (table layout, inline styles: works in Gmail, Outlook, mobile) ----------
const C = { bg: '#EEF2EC', card: '#FFFFFF', ink: '#16291C', moss: '#2E5B3A', muted: '#5C6B60', line: '#E1E7DF', pale: '#E1ECDF', fern: '#8DB48E' };
const FONT = "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif";

export function emailHtml({ kicker, title, chips = /** @type {string[]} */ ([]), data, sections, attachments, when, id, country }) {
  const tel = data.tel ? data.tel.replace(/[^\d+]/g, '') : '';
  const row = (label, value) => `<tr><td style="padding:11px 0;border-bottom:1px solid ${C.line};color:${C.muted};font-size:14px;width:40%;vertical-align:top">${esc(label)}</td><td style="padding:11px 0;border-bottom:1px solid ${C.line};font-size:15px;font-weight:600;color:${C.ink};vertical-align:top">${value}</td></tr>`;
  const sectionHtml = ([name, list]) => {
    const items = list.map(([k, label]) => {
      if (data[k]) return row(label, esc(data[k]) + (k === 'arai' ? ' a' : ''));
      if (k === 'arai') return row(label, `<span style="color:#A4472F;font-weight:600">nenurodyta</span>`);
      return '';
    }).join('');
    return items ? `<tr><td style="padding:22px 28px 0"><div style="font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:${C.moss};font-weight:700;margin-bottom:4px">${esc(name)}</div><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse">${items}</table></td></tr>` : '';
  };
  const chipHtml = chips.map((c) => `<span style="display:inline-block;margin:0 6px 6px 0;padding:5px 12px;border-radius:999px;background:#2E4A36;color:#E1ECDF;font-size:13px;font-weight:600">${esc(c)}</span>`).join('');
  const contact = data.vardas || data.tel || data.email ? `
<tr><td style="padding:24px 28px 0">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:separate;background:${C.pale};border-radius:14px"><tr><td style="padding:18px 20px">
<div style="font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:${C.moss};font-weight:700">Klientas</div>
<div style="font-size:20px;font-weight:700;color:${C.ink};margin:4px 0 2px">${esc(data.vardas || '')}</div>
${data.email ? `<div style="font-size:14px"><a href="mailto:${esc(data.email)}" style="color:${C.moss}">${esc(data.email)}</a></div>` : ''}
${tel ? `<table role="presentation" cellpadding="0" cellspacing="0" style="margin-top:14px"><tr><td style="background:${C.ink};border-radius:999px"><a href="tel:${esc(tel)}" style="display:inline-block;padding:12px 22px;color:#FFFFFF;font-size:16px;font-weight:700;text-decoration:none">Skambinti ${esc(data.tel)}</a></td></tr></table>` : ''}
</td></tr></table></td></tr>` : '';
  const comment = data.pastabos ? `
<tr><td style="padding:22px 28px 0">
<div style="font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:${C.moss};font-weight:700;margin-bottom:8px">Kliento komentaras</div>
<div style="border-left:4px solid ${C.fern};background:#F6F8F4;border-radius:0 10px 10px 0;padding:14px 16px;font-size:15px;line-height:1.55;color:${C.ink};white-space:pre-wrap">${esc(data.pastabos)}</div>
</td></tr>` : '';
  const photos = attachments.length ? `
<tr><td style="padding:18px 28px 0"><div style="font-size:14px;color:${C.ink};background:#F6F8F4;border-radius:10px;padding:12px 16px">📎 Prisegta sklypo nuotraukų: <b>${attachments.length}</b></div></td></tr>` : '';
  const meta = META_FIELDS.filter(([k]) => data[k]).map(([k, l]) => `${esc(l)}: ${esc(data[k])}`).join(' · ');
  return `<!doctype html><html lang="lt"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light"></head>
<body style="margin:0;padding:0;background:${C.bg};font-family:${FONT};color:${C.ink}">
<div style="display:none;max-height:0;overflow:hidden;opacity:0">${esc([title, ...chips, data.vardas].filter(Boolean).join(' · '))}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${C.bg}"><tr><td align="center" style="padding:24px 12px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:${C.card};border-radius:18px;overflow:hidden">
<tr><td style="background:${C.ink};padding:24px 28px 20px">
<div style="font-size:13px;color:${C.fern};font-weight:700;letter-spacing:.04em">${esc(kicker)}</div>
<div style="font-size:24px;line-height:1.25;font-weight:700;color:#F8FAF6;margin:6px 0 14px">${esc(title || '')}</div>
${chipHtml}
</td></tr>
${contact}
${comment}
${sections.map(sectionHtml).join('')}
${photos}
<tr><td style="padding:24px 28px 26px"><div style="font-size:12px;line-height:1.6;color:${C.muted}">${esc(when)} · ${esc(country)} · ID ${id}${meta ? `<br>${meta}` : ''}</div></td></tr>
</table>
<div style="font-size:12px;color:${C.muted};padding:14px 0 0">sklypolyginimas.lt</div>
</td></tr></table></body></html>`;
}
