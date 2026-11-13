/* sklypolyginimas.lt — progressive enhancement (no dependencies) */
(function () {
  'use strict';
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fmt = function (n) { return Math.round(n).toLocaleString('lt-LT'); };
  var r10 = function (n) { return fmt(Math.round(n / 10) * 10); };

  /* ---------- Calculator ---------- */
  document.querySelectorAll('[data-calc]').forEach(function (root) {
    var st = { area: 12, cond: 'mid', mach: 'bobcat', mill: true, stones: false, soil: false, depth: 15 };
    var HPA = { flat: 0.3, mid: 0.5, rough: 0.9 };
    var MACH = { bobcat: { min: 30, max: 45, speed: 1 }, dozer: { min: 50, max: 70, speed: 0.5 } };
    var $ = function (s) { return root.querySelector(s); };
    var shown = null, raf = 0;
    var totalEl = $('[data-total]');
    var tweenTotal = function (lo, hi) {
      var reduce2 = !document.documentElement.classList.contains('m');
      if (!shown || reduce2) { shown = [lo, hi]; totalEl.textContent = fmt(lo) + '–' + fmt(hi) + ' €'; return; }
      var from = shown.slice(), t0 = performance.now(), dur = 450;
      cancelAnimationFrame(raf);
      var step = function (ts) {
        var k = Math.min(1, (ts - t0) / dur), e = 1 - Math.pow(1 - k, 3);
        shown = [from[0] + (lo - from[0]) * e, from[1] + (hi - from[1]) * e];
        totalEl.textContent = fmt(shown[0]) + '–' + fmt(shown[1]) + ' €';
        if (k < 1) raf = requestAnimationFrame(step); else shown = [lo, hi];
      };
      raf = requestAnimationFrame(step);
    };
    var render = function () {
      var m = MACH[st.mach];
      var h = st.area * HPA[st.cond] * m.speed + (st.mill ? st.area * 0.15 : 0) + (st.stones ? st.area * 0.1 : 0);
      var hLo = Math.max(1, h) * 0.85, hHi = Math.max(1.5, h) * 1.25;
      var lines = [], lo = 0, hi = 0;
      var add = function (n, a, b) { lines.push([n, r10(a) + '–' + r10(b) + ' €']); lo += a; hi += b; };
      add('Technikos darbas, ' + st.area + ' a', hLo * m.min, hHi * m.max);
      var m3 = Math.round(st.area * st.depth);
      if (st.soil) add('Juodžemis, ' + m3 + ' m³', m3 * 3, m3 * 16);
      add('Technikos atvežimas', 30, 80);
      tweenTotal(Math.round(lo / 10) * 10, Math.round(hi / 10) * 10);
      $('[data-hours]').textContent = 'apie ' + (Math.round(hLo * 10) / 10).toLocaleString('lt-LT') + '–' + (Math.round(hHi * 10) / 10).toLocaleString('lt-LT') + ' val. technikos darbo';
      $('[data-lines]').innerHTML = lines.map(function (l) { return '<div><span>' + l[0] + '</span><span>' + l[1] + '</span></div>'; }).join('');
      $('[data-area-out]').textContent = st.area + ' a';
      $('[data-depth-out]').textContent = st.depth + ' cm, ' + m3 + ' m³';
      $('[data-soil-box]').hidden = !st.soil;
      var cta = $('[data-calc-cta]');
      if (cta) cta.href = '/uzklausa/?arai=' + st.area;
    };
    $('[data-area]').addEventListener('input', function (e) { st.area = +e.target.value; render(); });
    $('[data-depth]').addEventListener('input', function (e) { st.depth = +e.target.value; render(); });
    root.querySelectorAll('[data-cond]').forEach(function (b) {
      b.addEventListener('click', function () {
        st.cond = b.dataset.cond;
        root.querySelectorAll('[data-cond]').forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
        render();
      });
    });
    root.querySelectorAll('[data-mach]').forEach(function (b) {
      b.addEventListener('click', function () {
        st.mach = b.dataset.mach;
        root.querySelectorAll('[data-mach]').forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
        render();
      });
    });
    root.querySelectorAll('[data-x]').forEach(function (c) {
      c.addEventListener('change', function () { st[c.dataset.x] = c.checked; render(); });
    });
    render();
  });

  /* ---------- Photos: resize in browser before upload ---------- */
  var MAX_PHOTOS = 6, MAX_SIDE = 1600, QUALITY = 0.8;
  function resize(file) {
    return new Promise(function (resolve) {
      if (!/^image\//.test(file.type)) return resolve(null);
      var img = new Image();
      var url = URL.createObjectURL(file);
      img.onload = function () {
        var s = Math.min(1, MAX_SIDE / Math.max(img.width, img.height));
        var c = document.createElement('canvas');
        c.width = Math.round(img.width * s); c.height = Math.round(img.height * s);
        c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
        URL.revokeObjectURL(url);
        c.toBlob(function (b) { resolve(b ? { blob: b, name: file.name.replace(/\.[^.]+$/, '') + '.jpg', thumb: c.toDataURL('image/jpeg', 0.5) } : null); }, 'image/jpeg', QUALITY);
      };
      img.onerror = function () { URL.revokeObjectURL(url); resolve(null); };
      img.src = url;
    });
  }

  function setupPhotos(scope) {
    var input = scope.querySelector('[data-photos]');
    if (!input) return { get: function () { return []; } };
    var drop = input.closest('[data-drop]');
    var label = scope.querySelector('[data-photo-label]');
    var thumbs = scope.querySelector('[data-thumbs]');
    var photos = [];
    var show = function () {
      label.textContent = photos.length ? 'Pridėta nuotraukų: ' + photos.length + '. Pridėti dar' : 'Pridėti sklypo nuotraukų';
      thumbs.innerHTML = photos.map(function (p, i) { return '<img src="' + p.thumb + '" alt="Nuotrauka ' + (i + 1) + '">'; }).join('');
    };
    var addFiles = function (files) {
      var list = Array.prototype.slice.call(files, 0, MAX_PHOTOS - photos.length);
      Promise.all(list.map(resize)).then(function (res) {
        res.forEach(function (r) { if (r) photos.push(r); });
        show();
      });
    };
    input.addEventListener('change', function () { addFiles(input.files); input.value = ''; });
    ['dragenter', 'dragover'].forEach(function (ev) { drop.addEventListener(ev, function (e) { e.preventDefault(); drop.classList.add('over'); }); });
    ['dragleave', 'drop'].forEach(function (ev) { drop.addEventListener(ev, function (e) { e.preventDefault(); drop.classList.remove('over'); }); });
    drop.addEventListener('drop', function (e) { if (e.dataTransfer && e.dataTransfer.files) addFiles(e.dataTransfer.files); });
    return { get: function () { return photos; } };
  }

  /* ---------- Forms ---------- */
  var TXT = {
    required: 'Užpildykite pažymėtus laukus.',
    phone: 'Patikrinkite telefono numerį.',
    consent: 'Pažymėkite sutikimą, kad galėtume perduoti užklausą rangovui.',
    network: 'Nepavyko išsiųsti. Patikrinkite interneto ryšį ir bandykite dar kartą.',
    server: 'Nepavyko išsiųsti užklausos. Bandykite dar kartą po minutės.',
  };

  function validate(fields) {
    var bad = [];
    fields.forEach(function (el) {
      el.removeAttribute('aria-invalid');
      if (el.type === 'checkbox') { if (el.required && !el.checked) bad.push(el); return; }
      if (el.required && !String(el.value).trim()) bad.push(el);
      if (el.type === 'tel' && el.value && String(el.value).replace(/\D/g, '').length < 8) bad.push(el);
      if (el.type === 'email' && el.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(el.value)) bad.push(el);
    });
    bad.forEach(function (el) { if (el.type !== 'checkbox') el.setAttribute('aria-invalid', 'true'); });
    return bad;
  }

  function errText(bad) {
    if (bad.some(function (e) { return e.type === 'checkbox'; }) && bad.length === 1) return TXT.consent;
    if (bad.some(function (e) { return e.type === 'tel' && e.value; })) return TXT.phone;
    return TXT.required;
  }

  document.querySelectorAll('[data-lead]').forEach(function (box) {
    var form = box.querySelector('form');
    var err = box.querySelector('[data-err]');
    var photos = setupPhotos(box);
    var endpoint = box.dataset.endpoint || '/api/leads';
    // One id per enquiry: a double click or a retry after a network error is delivered once.
    var newId = function () { try { return crypto.randomUUID(); } catch (_) { return '10000000-1000-4000-8000-100000000000'.replace(/[018]/g, function (c) { return (c ^ (Math.random() * 16) >> (c / 4)).toString(16); }); } };
    var requestId = newId();
    var showErr = function (t) { err.textContent = t; err.classList.add('show'); };
    var hideErr = function () { err.classList.remove('show'); };

    // prefill area from calculator
    var q = new URLSearchParams(location.search);
    var arai = form.querySelector('[name="arai"]');
    if (arai && q.get('arai')) arai.value = q.get('arai');

    /* multistep */
    var steps = Array.prototype.slice.call(box.querySelectorAll('[data-step]'));
    var cur = 0;
    var stepper = box.querySelector('[data-stepper]') || (box.hasAttribute('data-multistep') ? document.querySelector('[data-stepper]') : null);
    var nav = {
      back: box.querySelector('[data-back]'), next: box.querySelector('[data-next]'),
      submit: box.querySelector('[data-submit]'), hint: box.querySelector('[data-hint]'),
    };
    var go = function (i) {
      cur = i;
      steps.forEach(function (s, k) { s.hidden = k !== i; });
      if (nav.back) nav.back.hidden = i === 0;
      if (nav.hint) nav.hint.hidden = i !== 0;
      if (nav.next) nav.next.hidden = i === steps.length - 1;
      if (nav.submit) nav.submit.hidden = i !== steps.length - 1;
      if (stepper) stepper.querySelectorAll('li').forEach(function (li, k) { li.className = k === i ? 'now' : k < i ? 'ok' : ''; if (k === i) li.setAttribute('aria-current', 'step'); else li.removeAttribute('aria-current'); });
      hideErr();
      var h = steps[i].querySelector('h2');
      if (h) { h.setAttribute('tabindex', '-1'); h.focus({ preventScroll: true }); }
      else { var f1 = steps[i].querySelector('input:not([type=hidden]):not([type=radio]):not([type=checkbox]),select,textarea'); if (f1 && window.matchMedia('(pointer:fine)').matches) f1.focus({ preventScroll: true }); }
      if (box.getBoundingClientRect().top < 0) box.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
    };
    if (steps.length) {
      nav.next.addEventListener('click', function () {
        var bad = validate(Array.prototype.slice.call(steps[cur].querySelectorAll('input,select,textarea')));
        if (bad.length) { showErr(errText(bad)); bad[0].focus(); return; }
        go(cur + 1);
      });
      nav.back.addEventListener('click', function () { go(cur - 1); });
      form.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA' && cur < steps.length - 1) { e.preventDefault(); nav.next.click(); }
      });
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      hideErr();
      var bad = validate(Array.prototype.slice.call(form.querySelectorAll('input,select,textarea')));
      if (bad.length) {
        if (steps.length) { var k = steps.findIndex(function (s) { return s.contains(bad[0]); }); if (k > -1 && k !== cur) go(k); }
        showErr(errText(bad)); bad[0].focus(); return;
      }
      var fd = new FormData(form);
      fd.delete('foto');
      photos.get().forEach(function (p) { fd.append('foto', p.blob, p.name); });
      fd.append('puslapis', location.pathname);
      var ref = document.referrer; if (ref) fd.append('referrer', ref);
      var ck = document.cookie, cid = /(?:^|;\s*)_ga=GA\d\.\d\.(\d+\.\d+)/.exec(ck), sc = /(?:^|;\s*)_ga_TDK1DCZ6MP=([^;]+)/.exec(ck);
      var sid = sc && (/\$?s(\d{9,})/.exec(sc[1]) || /^GS1\.\d\.(\d{9,})/.exec(sc[1]));
      // GA ids go as headers so the server can count the lead even with ad blockers (no personal data).
      var headers = { Accept: 'application/json' };
      if (cid) headers['X-GA-Client-Id'] = cid[1];
      if (sid) headers['X-GA-Session-Id'] = sid[1];
      fd.append('requestId', requestId);
      ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'gclid'].forEach(function (k) { var v = q.get(k); if (v) fd.append(k, v); });
      var btn = form.querySelector('[type="submit"]');
      btn.disabled = true; var old = btn.textContent; btn.textContent = 'Siunčiama…';
      fetch(endpoint, { method: 'POST', body: fd, headers: headers })
        .then(function (r) { return r.json().catch(function () { return {}; }).then(function (j) { return { ok: r.ok, j: j }; }); })
        .then(function (res) {
          if (!res.ok || !(res.j.ok || res.j.status === 'sent')) {
            var fieldErr = res.j.fields && Object.keys(res.j.fields).map(function (k) { return res.j.fields[k] && res.j.fields[k][0]; }).filter(Boolean)[0];
            throw new Error(fieldErr || res.j.error || 'server');
          }
          requestId = newId();
          box.classList.add('is-sent');
          if (stepper) stepper.querySelectorAll('li').forEach(function (li) { li.className = 'ok'; });
          var d = box.querySelector('.done'); if (d) d.focus();
          if (endpoint === '/api/leads' && !res.j.tracked && typeof window.gtag === 'function') {
            window.gtag('event', 'generate_lead', {
              form_name: 'kontaktinė_forma',
              lead_type: 'užklausa',
              form_location: String(fd.get('saltinis') || ''),
              photos: photos.get().length,
            });
          }
        })
        .catch(function (x) {
          showErr(x && x.message && x.message !== 'server' && x.message.length < 160 ? x.message : (navigator.onLine === false ? TXT.network : TXT.server));
          btn.disabled = false; btn.textContent = old;
          if (window.turnstile) try { window.turnstile.reset(); } catch (_) {}
        });
    });
  });

  /* ---------- LeadHub: tenant contacts and work photos (only while the site is rented) ---------- */
  (function () {
    var esc = function (v) { var d = document.createElement('div'); d.textContent = v == null ? '' : String(v); return d.innerHTML; };
    var telHref = function (p) { return 'tel:' + String(p).replace(/[^\d+]/g, ''); };
    var sent = {};
    var track = function (kind) {
      if (sent[kind]) return; sent[kind] = 1;
      var body = JSON.stringify({ kind: kind });
      try { if (navigator.sendBeacon && navigator.sendBeacon('/api/leadhub/event', new Blob([body], { type: 'text/plain;charset=UTF-8' }))) return; } catch (e) {}
      fetch('/api/leadhub/event', { method: 'POST', headers: { 'content-type': 'application/json' }, body: body, keepalive: true }).catch(function () {});
    };
    document.addEventListener('click', function (e) {
      var a = e.target.closest && e.target.closest('a[href^="tel:"],a[href^="mailto:"]');
      if (a && a.closest('[data-lh-call],[data-lh-card],[data-lh-foot]')) track(a.getAttribute('href').indexOf('tel:') === 0 ? 'phone_click' : 'email_click');
    });
    // Google Analytics cookies only with consent (consent mode default "denied" is set in the page head).
    var ck = document.querySelector('[data-ck]');
    var choice = null;
    try { var saved = JSON.parse(localStorage.getItem('sl-consent') || 'null'); if (saved && Date.now() - saved.at < 180 * 864e5) choice = saved.v; } catch (e) {}
    if (ck && !choice) ck.hidden = false;
    document.querySelectorAll('[data-ck-v]').forEach(function (b) {
      b.addEventListener('click', function () {
        var v = b.getAttribute('data-ck-v');
        try { localStorage.setItem('sl-consent', JSON.stringify({ v: v, at: Date.now() })); } catch (e) {}
        if (typeof window.gtag === 'function') window.gtag('consent', 'update', { analytics_storage: v });
        if (v === 'denied') document.cookie.split(';').forEach(function (c) {
          var n = c.trim().split('=')[0];
          if (n === '_ga' || n.indexOf('_ga_') === 0) ['', location.hostname, '.' + location.hostname].forEach(function (d) { document.cookie = n + '=; Max-Age=0; path=/;' + (d ? ' domain=' + d + ';' : ''); });
        });
        if (ck) ck.hidden = true;
      });
    });
    document.querySelectorAll('[data-ck-open]').forEach(function (b) { b.addEventListener('click', function () { if (ck) ck.hidden = false; }); });

    // Privacy page: who runs the site and who currently receives enquiries.
    var legalLoad = function (c) {
      var o = c && c.operator, t = c && c.tenant;
      if (o) document.querySelectorAll('[data-lh-operator]').forEach(function (el) {
        el.innerHTML = esc([o.name, o.activity_cert ? 'individualios veiklos pažymos Nr. ' + o.activity_cert : '', o.vat_code ? 'PVM mokėtojo kodas ' + o.vat_code : '', o.address].filter(Boolean).join(', ')) + '.' +
          (o.email ? ' El. paštas: <a href="mailto:' + esc(o.email) + '">' + esc(o.email) + '</a>.' : '');
      });
      if (t) document.querySelectorAll('[data-lh-provider]').forEach(function (el) {
        el.textContent = 'Šiuo metu užklausas gauna ir paslaugas teikia ' + [t.company_name, t.company_code ? 'įm. k. ' + t.company_code : '', t.address].filter(Boolean).join(', ') + '.';
        el.hidden = false;
      });
    };
    fetch('/api/leadhub/config', { credentials: 'omit' }).then(function (r) { return r.ok ? r.json() : null; }).then(function (c) {
      legalLoad(c);
      var t = c && c.tenant;
      if (!t) return;
      var phone = t.phone && t.phone.trim();
      if (phone) {
        document.querySelectorAll('[data-lh-phone]').forEach(function (el) { el.textContent = phone; });
        document.querySelectorAll('[data-lh-call]').forEach(function (el) { el.setAttribute('href', telHref(phone)); el.hidden = false; });
        document.documentElement.classList.add('lh-has-call');
      }
      var legal = [t.company_name, t.company_code ? 'įm. k. ' + t.company_code : '', t.vat_code ? 'PVM k. ' + t.vat_code : ''].filter(Boolean).join(', ');
      document.querySelectorAll('[data-lh-legal]').forEach(function (el) { if (legal) el.textContent = 'Paslaugas teikia ' + legal + '.'; });
      var contacts = (phone ? '<a href="' + telHref(phone) + '">' + esc(phone) + '</a>' : '') +
        (t.email ? '<a href="mailto:' + esc(t.email) + '">' + esc(t.email) + '</a>' : '') +
        (t.hours ? '<span class="muted">' + esc(t.hours) + '</span>' : '') +
        (t.address ? '<span class="muted">' + esc(t.address) + '</span>' : '');
      document.querySelectorAll('[data-lh-foot]').forEach(function (el) { el.innerHTML = contacts; el.hidden = !contacts; });
      document.querySelectorAll('[data-lh-card]').forEach(function (el) {
        el.innerHTML = '<span class="lh-k">Darbus atlieka</span><strong>' + esc(t.company_name || 'Rangovas') + '</strong>' +
          (t.about ? '<p>' + esc(t.about) + '</p>' : '') +
          '<div class="lh-row">' + (phone ? '<a class="btn btn-sm" href="' + telHref(phone) + '">Skambinti ' + esc(phone) + '</a>' : '') +
          (t.hours ? '<span class="muted">' + esc(t.hours) + '</span>' : '') + '</div>';
        el.hidden = false;
      });
      var photos = (c.gallery || []).slice(0, 12);
      document.querySelectorAll('[data-lh-gallery]').forEach(function (sec) {
        if (!photos.length) return;
        var grid = sec.querySelector('[data-lh-gal-grid]');
        var sub = sec.querySelector('[data-lh-gal-sub]');
        if (sub) sub.textContent = (t.company_name ? t.company_name + ' – ' : '') + 'atliktų darbų pavyzdžiai.';
        grid.innerHTML = photos.map(function (p) {
          return '<figure><img src="' + esc(p.src) + '" srcset="' + esc(p.srcSet) + '" sizes="(max-width: 760px) 100vw, 33vw" alt="' + esc(p.caption || 'Atliktas darbas') + '" loading="lazy" decoding="async">' +
            (p.caption ? '<figcaption>' + esc(p.caption) + '</figcaption>' : '') + '</figure>';
        }).join('');
        sec.hidden = false;
      });
    }).catch(function () {});
  })();
})();
