/* sklypolyginimas.lt — motion (design-to-motion, website context)
   - [data-mg] group: revealed once when ~30% visible; children [data-m] rise/blur in, staggered in reading order
   - [data-story] visual: acts out its story on a JS clock after its group has landed; paused off screen
   - prefers-reduced-motion: html has no .m class → final state, no stories */
(function () {
  'use strict';
  var root = document.documentElement;
  var MOTION = root.classList.contains('m');
  window.__m = 1;
  var qsa = function (s, el) { return Array.prototype.slice.call((el || document).querySelectorAll(s)); };
  var now = function () { return performance.now() / 1000; };

  /* ---------- easing + keyframe tracks ---------- */
  var io = function (t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };
  var out = function (t) { return 1 - Math.pow(1 - t, 3); };
  var lin = function (t) { return t; };
  function track(keys, t, ease) {
    ease = ease || io;
    if (t <= keys[0][0]) return keys[0][1];
    for (var i = 1; i < keys.length; i++) {
      var t1 = keys[i][0], v1 = keys[i][1], t0 = keys[i - 1][0], v0 = keys[i - 1][1];
      if (t <= t1) {
        var k = ease(Math.min(1, (t - t0) / (t1 - t0 || 1)));
        return Array.isArray(v0) ? v0.map(function (v, j) { return v + (v1[j] - v) * k; }) : v0 + (v1 - v0) * k;
      }
    }
    return keys[keys.length - 1][1];
  }
  window.__track = track;

  /* ---------- counters ---------- */
  var nf = function (n) { return Math.round(n).toLocaleString('lt-LT'); };
  function countText(el, k) {
    var parts = el.dataset.count.split(',').map(Number);
    return parts.map(function (v) { return nf(v * k); }).join('–');
  }
  function runCounter(el, delay, dur) {
    if (!MOTION) return;
    el.textContent = countText(el, 0);
    var t0 = now() + delay;
    var step = function () {
      var t = (now() - t0) / dur;
      if (t < 0) return requestAnimationFrame(step);
      el.textContent = countText(el, out(Math.min(1, t)));
      if (t < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }
  window.__count = runCounter;

  /* ---------- groups: reveal once on scroll ---------- */
  var groups = qsa('[data-mg]');
  function itemsOf(g) { return qsa('[data-m]', g).filter(function (el) { return el.closest('[data-mg]') === g; }); }
  function reveal(g) {
    if (g.__in) return;
    g.__in = true;
    var step = +(g.dataset.stagger || 70), base = +(g.dataset.base || 0), max = 0;
    var items = itemsOf(g);
    items.forEach(function (el, i) {
      var d = el.dataset.d != null ? +el.dataset.d : base + i * step;
      max = Math.max(max, d);
      el.__d = d;
      el.style.setProperty('--d', d + 'ms');
    });
    g.__landed = now() + (MOTION ? (max + 1050) / 1000 : 0);
    qsa('[data-count]', g).forEach(function (c) {
      var host = c.closest('[data-m]');
      runCounter(c, ((host && host.__d) || 0) / 1000 + 0.15, 1.1);
    });
    requestAnimationFrame(function () { requestAnimationFrame(function () { items.forEach(function (el) { el.classList.add('on'); }); }); });
  }
  if (!MOTION || !('IntersectionObserver' in window)) {
    groups.forEach(function (g) { g.__in = true; g.__landed = 0; qsa('[data-m]', g).forEach(function (el) { el.classList.add('on'); }); });
  } else {
    var gio = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        var enough = e.intersectionRatio >= 0.3 || e.intersectionRect.height >= window.innerHeight * 0.3;
        if (enough) { reveal(e.target); gio.unobserve(e.target); }
      });
    }, { threshold: [0, 0.1, 0.2, 0.3, 0.5] });
    groups.forEach(function (g) { gio.observe(g); });
  }

  /* ---------- stories ---------- */
  var STORIES = {};
  var running = [];
  function register(el, def) {
    var s = { el: el, g: el.closest('[data-mg]') || document.body, len: def.len, delay: def.delay || 0, tick: def.tick, t: 0, vis: false, rest: def.rest };
    running.push(s);
    return s;
  }

  // visibility (pause off screen)
  var vio = 'IntersectionObserver' in window ? new IntersectionObserver(function (entries) {
    entries.forEach(function (e) { running.forEach(function (s) { if (s.el === e.target) s.vis = e.isIntersecting; }); });
  }, { threshold: 0 }) : null;

  var last = now();
  function loop() {
    var t = now(), dt = Math.min(0.1, t - last);
    last = t;
    for (var i = 0; i < running.length; i++) {
      var s = running[i];
      if (!s.g.__in || !s.vis || t < s.g.__landed + s.delay) continue;
      s.t += dt;
      s.tick(s.t % s.len, s.t);
    }
    requestAnimationFrame(loop);
  }

  /* ===== story library ===== */

  // Price list / table rows: a soft highlight steps down the rows, then rests
  STORIES.rows = function (el) {
    var list = el.querySelector('.hl-wrap') || el;
    var hl = list.querySelector('.hl');
    var rows = qsa(':scope > div', list);
    var per = 1.4, len = rows.length * per + 2.2;
    return {
      len: len,
      tick: function (t) {
        var i = Math.min(rows.length - 1, Math.floor(t / per));
        var r = rows[i], next = rows[Math.min(rows.length - 1, i + 1)];
        var k = io(Math.max(0, Math.min(1, (t - i * per - (per - 0.45)) / 0.45)));
        var y = r.offsetTop + (next.offsetTop - r.offsetTop) * (i < rows.length - 1 ? k : 0);
        var h = r.offsetHeight + (next.offsetHeight - r.offsetHeight) * (i < rows.length - 1 ? k : 0);
        var end = rows.length * per;
        var op = track([[0, 0], [0.35, 1], [end - 0.2, 1], [end + 0.4, 0]], t);
        hl.style.transform = 'translateY(' + y + 'px)';
        hl.style.height = h + 'px';
        hl.style.opacity = op;
      },
    };
  };

  STORIES.trows = function (el) {
    var rows = qsa('tbody tr', el), per = 1.1, len = rows.length * per + 2;
    return {
      len: len,
      tick: function (t) {
        var i = Math.floor(t / per);
        rows.forEach(function (r, k) { r.classList.toggle('lit', k === i && t < rows.length * per); });
      },
    };
  };

  // Pills light up one by one
  STORIES.lightup = function (el) {
    var pills = qsa('.pill', el), per = 0.55, len = pills.length * per + 2.4;
    return {
      len: len,
      tick: function (t) {
        var i = Math.floor(t / per);
        pills.forEach(function (p, k) { p.classList.toggle('lit', k === i && t < pills.length * per); });
      },
    };
  };

  // Tech section: A→B→C→D — layer stands out, marker pulses, matching row highlights
  STORIES.layers = function (el) {
    var keys = ['A', 'B', 'C', 'D'], per = 1.8, len = keys.length * per + 1.6;
    var sec = el.closest('[data-mg]');
    var layers = {}, marks = {}, rows = {};
    keys.forEach(function (k) {
      layers[k] = el.querySelector('[data-layer="' + k + '"]');
      marks[k] = el.querySelector('[data-mark="' + k + '"] [data-pulse]');
      rows[k] = sec.querySelector('[data-abcd] [data-k="' + k + '"]');
    });
    return {
      len: len,
      tick: function (t) {
        var i = Math.floor(t / per), active = t < keys.length * per ? keys[i] : null;
        var lt = t - i * per;
        keys.forEach(function (k) {
          var on = k === active;
          var dim = active && !on ? track([[0, 1], [0.35, 0.5], [per - 0.35, 0.5], [per, 1]], lt) : 1;
          if (layers[k]) layers[k].style.opacity = dim;
          if (rows[k]) rows[k].classList.toggle('lit', on);
          if (marks[k]) {
            var p = on ? Math.min(1, lt / 1.2) : 1;
            marks[k].style.transform = 'scale(' + (1 + 1.4 * out(p)) + ')';
            marks[k].style.opacity = on ? 0.7 * (1 - p) : 0;
          }
        });
      },
    };
  };

  // Services thumbnails
  STORIES.regrade = function (svg) {
    var line = svg.querySelector('[data-draw]');
    return { len: 5, tick: function (t) { line.style.strokeDashoffset = track([[0, 0], [0.5, 1], [0.8, 1], [2.1, 0]], t); } };
  };
  STORIES.roll = function (svg) {
    var g = svg.querySelector('[data-roller]'), sp = svg.querySelector('[data-spoke]');
    return {
      len: 5,
      tick: function (t) {
        var x = track([[0, 0], [1.9, -66], [2.5, -66], [4.3, 0]], t);
        g.setAttribute('transform', 'translate(' + x + ' 0)');
        sp.setAttribute('transform', 'rotate(' + (x / 9) * 57.3 + ' 88 24)');
      },
    };
  };
  STORIES.flow = function (svg) {
    var dash = svg.querySelector('[data-dash]'), drop = svg.querySelector('[data-drop]');
    return {
      len: 4,
      tick: function (t, abs) {
        dash.style.strokeDashoffset = -abs * 12;
        var k = Math.min(1, t / 2.2);
        drop.setAttribute('cx', 40 + 70 * io(k));
        drop.setAttribute('cy', 43 + 8 * io(k));
        drop.setAttribute('opacity', track([[0, 0], [0.3, 1], [1.9, 1], [2.3, 0]], t, lin));
      },
    };
  };
  STORIES.spread = function (svg) {
    var pile = svg.querySelector('[data-pile]'), layer = svg.querySelector('[data-layer]');
    return {
      len: 5,
      tick: function (t) {
        layer.style.transform = 'scaleX(' + track([[0, 1], [0.4, 0.05], [0.7, 0.05], [2.3, 1]], t) + ')';
        pile.style.transform = 'scaleY(' + track([[0, 1], [0.7, 1], [2.3, 0.35], [3.1, 0.35], [4, 1]], t) + ')';
      },
    };
  };
  STORIES.stump = function (svg) {
    var s = svg.querySelector('[data-stump]');
    return {
      len: 4.5,
      tick: function (t) {
        var y = track([[0, 0], [0.9, -12], [2.2, -12], [2.3, 8], [3.2, 0]], t);
        var r = track([[0, 0], [0.9, -10], [2.2, -10], [2.3, 0]], t);
        s.style.transform = 'translateY(' + y + 'px) rotate(' + r + 'deg)';
        s.style.opacity = track([[0, 1], [0.6, 1], [1.1, 0], [2.3, 0], [3.2, 1]], t, lin);
      },
    };
  };

  /* ----- Paslaugos page figures ----- */
  STORIES.cutfill = function (svg) {
    var cuts = qsa('[data-cut]', svg), fills = qsa('[data-fill]', svg), line = svg.querySelector('[data-draw]');
    return {
      len: 6,
      tick: function (t) {
        line.style.strokeDashoffset = track([[0, 0], [0.5, 1], [0.7, 1], [2.2, 0]], t);
        var c = track([[0, 1], [2.4, 1], [3.4, 0.08], [4.4, 0.08], [5.4, 1]], t);
        var f = track([[0, 1], [2.4, 1], [2.6, 0.15], [3.6, 1]], t);
        cuts.forEach(function (p) { p.style.opacity = c; });
        fills.forEach(function (p) { p.style.transform = 'scaleY(' + f + ')'; });
      },
    };
  };
  STORIES.roller = function (svg) {
    var g = svg.querySelector('[data-roller]'), sp = svg.querySelector('[data-spoke]'), flats = qsa('[data-flat]', svg);
    return {
      len: 6.5,
      tick: function (t) {
        var x = track([[0, 0], [2.6, -360], [3.4, -360], [5.8, 0]], t);
        g.setAttribute('transform', 'translate(' + x + ' 0)');
        sp.setAttribute('transform', 'rotate(' + (x / 24) * 57.3 + ' 420 112)');
        // where the roller has passed, the surface is pressed flat
        var edge = Math.max(30, 420 + x);
        var op = track([[0, 1], [3.4, 1], [3.9, 0], [6.5, 0]], t, lin);
        flats.forEach(function (f) { f.setAttribute('x', edge); f.setAttribute('width', Math.max(0, 420 - edge)); f.style.opacity = op; });
      },
    };
  };
  STORIES.planflow = function (svg) {
    var arrows = qsa('[data-arrow]', svg), drop = svg.querySelector('[data-drop]'), ditch = svg.querySelector('[data-ditch]');
    return {
      len: 6,
      tick: function (t, abs) {
        arrows.forEach(function (a, i) {
          var k = Math.max(0, Math.min(1, (t - i * 0.35) / 0.9));
          a.style.strokeDashoffset = 1 - out(k);
        });
        ditch.style.strokeDashoffset = -abs * 18;
        var p = Math.max(0, Math.min(1, (t - 2.2) / 2.6));
        drop.setAttribute('cx', 60 + 460 * io(p));
        drop.setAttribute('cy', 334 - (p > 0.92 ? (p - 0.92) / 0.08 * 38 : 0));
        drop.setAttribute('opacity', track([[0, 0], [2.2, 0], [2.5, 1], [4.6, 1], [5, 0]], t, lin));
      },
    };
  };
  STORIES.stones = function (svg) {
    var st = qsa('[data-stone]', svg);
    return {
      len: 6,
      tick: function (t) {
        st.forEach(function (s, i) {
          var t0 = 0.3 + i * 0.5;
          var y = track([[t0, 0], [t0 + 0.8, -46], [4.2, -46], [4.25, 0]], t);
          var o = track([[t0, 1], [t0 + 0.4, 1], [t0 + 0.9, 0], [4.25, 0], [5, 1]], t, lin);
          s.style.transform = 'translateY(' + y + 'px)';
          s.style.opacity = o;
        });
      },
    };
  };
  STORIES.volume = function (svg) {
    var side1 = svg.querySelector('[data-v1]'), side2 = svg.querySelector('[data-v2]'), top = svg.querySelector('[data-top]'), num = svg.querySelector('[data-vnum]');
    return {
      len: 6,
      tick: function (t) {
        // the 15 cm layer grows from the ground up while the volume counts to 15 m³
        var k = track([[0, 1], [0.5, 0], [0.8, 0], [3.2, 1]], t);
        side1.style.transform = 'scaleY(' + Math.max(0.001, k) + ')';
        side2.style.transform = 'scaleY(' + Math.max(0.001, k) + ')';
        top.setAttribute('transform', 'translate(0 ' + (32 * (1 - k)).toFixed(2) + ')');
        num.textContent = nf(15 * k) + ' m³';
      },
    };
  };
  STORIES.clear = function (svg) {
    var xs = qsa('[data-x-mark]', svg), road = svg.querySelector('[data-road]');
    return {
      len: 7,
      tick: function (t) {
        xs.forEach(function (x, i) {
          var t0 = 0.2 + i * 0.45;
          x.style.opacity = track([[t0, 1], [t0 + 0.4, 0], [5.2, 0], [5.9, 1]], t, lin);
          x.style.transform = 'scale(' + track([[t0, 1], [t0 + 0.4, 0.6], [5.2, 0.6], [5.9, 1]], t) + ')';
        });
        road.style.strokeDashoffset = track([[0, 0], [2.6, 0], [2.8, 1], [4.4, 0]], t);
      },
    };
  };

  /* ----- Rangovams: lead stack ----- */
  STORIES.leadstack = function (el) {
    var cards = qsa('.lead-card', el);
    var data = JSON.parse(el.dataset.leads);
    var per = 3.2, N = data.length, gap = 132;
    var measure = function () {
      var h = 0;
      cards.forEach(function (c) { h = Math.max(h, c.offsetHeight); });
      gap = h + 14;
      el.style.height = (gap * 3 - 14 + 8) + 'px';
    };
    measure();
    window.addEventListener('resize', measure);
    var fill = function (card, d, isNew) {
      card.querySelector('.lc-place').textContent = d[0];
      card.querySelector('.lc-meta').textContent = d[1];
      card.querySelector('.lc-tags').innerHTML = d[2].map(function (x) { return '<span>' + x + '</span>'; }).join('');
      card.querySelector('.lc-time').textContent = isNew ? 'ką tik' : d[3];
      var b = card.querySelector('.lc-new'); if (b) b.style.display = isNew ? '' : 'none';
    };
    // cards[0..3]: s=0 incoming, s=1..3 the visible stack (s=3 leaves)
    var api = {
      len: per * N,
      init: function () { measure(); api.tick(0); },
      tick: function (t) {
        var beat = Math.floor(t / per), lt = t - beat * per;
        var k = io(Math.max(0, Math.min(1, (lt - 0.2) / 1.1)));
        for (var s = 0; s < 4; s++) {
          var card = cards[s];
          var idx = (N * 10 + beat - s + 1) % N; // s=0 is the incoming card
          fill(card, data[idx], s === 0);
          var slotFrom = s - 1, slotTo = s;      // incoming starts at slot -1
          var slot = slotFrom + (slotTo - slotFrom) * k;
          var y = slot * gap;
          var o = s === 0 ? k : s === 3 ? 1 - k : 1;
          var blur = s === 0 ? 6 * (1 - k) : s === 3 ? 6 * k : 0;
          var sc = 1 - Math.max(0, slot) * 0.025;
          card.style.transform = 'translateY(' + (s === 0 ? -24 * (1 - k) : y) + 'px) scale(' + sc + ')';
          card.style.opacity = o;
          card.style.filter = blur ? 'blur(' + blur.toFixed(2) + 'px)' : 'none';
          card.style.zIndex = 10 - s;
        }
      },
    };
    return api;
  };

  /* ----- Hero: before / after cross-section ----- */
  STORIES.hero = function (fig) {
    var input = fig.querySelector('.scrub');
    var clip = fig.querySelector('[data-clip]');
    var line = fig.querySelector('[data-handle-line]');
    var handle = fig.querySelector('[data-handle]');
    var laser = fig.querySelector('[data-laser]');
    var emitter = fig.querySelector('[data-emitter]');
    var rain = qsa('[data-rain]', fig);
    var ring = fig.querySelector('[data-ring]');
    var touched = false, pos = 50;
    var set = function (p) {
      pos = p;
      var x = Math.round(p * 12);
      clip.setAttribute('x', x);
      line.setAttribute('x1', x); line.setAttribute('x2', x);
      handle.setAttribute('transform', 'translate(' + x + ' 230)');
    };
    var touch = function () { touched = true; fig.classList.add('touched'); };
    input.addEventListener('input', function () { touch(); set(+input.value); });
    var dragging = false, decided = false, sx = 0, sy = 0;
    var posFrom = function (e) { var r = fig.getBoundingClientRect(); return Math.max(2, Math.min(98, ((e.clientX - r.left) / r.width) * 100)); };
    var apply = function (e) { var p = posFrom(e); set(p); input.value = Math.round(p); };
    fig.addEventListener('pointerdown', function (e) {
      if (e.button !== undefined && e.button !== 0) return;
      dragging = true; decided = e.pointerType !== 'touch'; sx = e.clientX; sy = e.clientY; touch();
      if (decided) { try { fig.setPointerCapture(e.pointerId); } catch (_) {} fig.classList.add('dragging'); apply(e); }
    });
    fig.addEventListener('pointermove', function (e) {
      if (!dragging) return;
      if (!decided) {
        var dx = Math.abs(e.clientX - sx), dy = Math.abs(e.clientY - sy);
        if (dx < 6 && dy < 6) return;
        if (dy > dx) { dragging = false; return; }
        decided = true; try { fig.setPointerCapture(e.pointerId); } catch (_) {} fig.classList.add('dragging');
      }
      e.preventDefault(); apply(e);
    });
    var end = function (e) { if (dragging && !decided && e.type === 'pointerup') apply(e); dragging = false; fig.classList.remove('dragging'); };
    fig.addEventListener('pointerup', end);
    fig.addEventListener('pointercancel', end);
    set(50);

    var surfY = function (x) { return 294 + (x - 250) * 20 / 950 - 5; };
    return {
      len: 9,
      tick: function (t, abs) {
        // 1) handle demo: shows more of the "after" side, then returns to the design (50%)
        if (!touched) {
          var p = track([[0, 50], [0.3, 50], [1.9, 22], [3.6, 22], [5.4, 50]], t);
          set(p); input.value = Math.round(p);
        }
        // 2) laser: marching beam + blinking emitter
        laser.style.strokeDashoffset = -abs * 16;
        emitter.setAttribute('opacity', (0.5 + 0.5 * Math.sin(abs * Math.PI * 2)) * 0.9);
        // 3) rain runs off the slope away from the house (after side)
        rain.forEach(function (d, i) {
          var c = ((abs + i * 0.9) % 2.7) / 2.7;
          var x = 280 + 880 * c;
          d.setAttribute('cx', x); d.setAttribute('cy', surfY(x));
          d.setAttribute('opacity', c < 0.08 ? c / 0.08 : c > 0.9 ? (1 - c) / 0.1 : 1);
        });
        // 4) puddle ripple (before side)
        var r = (abs % 2.2) / 2.2;
        ring.style.transform = 'scale(' + (1 + 1.8 * out(r)) + ')';
        ring.setAttribute('opacity', 0.9 * (1 - r));
      },
    };
  };

  /* ---------- boot ---------- */
  function boot() {
    qsa('[data-story]').forEach(function (el) {
      var name = el.dataset.story, f = STORIES[name];
      if (!f) return;
      if (!MOTION && name !== 'hero') { var d0 = f(el); if (d0.init) d0.init(); return; } // reduced motion: final state only
      var def = f(el);
      if (def.init) def.init();
      var sib = el.closest('[data-mg]');
      var order = sib ? qsa('[data-story]', sib).indexOf(el) : 0;
      def.delay = (def.delay || 0) + order * 0.9 + (el.dataset.offset ? +el.dataset.offset : 0);
      var s = register(el, def);
      if (!MOTION) { s.tick = function () {}; }
      if (vio) vio.observe(el); else s.vis = true;
    });
    requestAnimationFrame(loop);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
