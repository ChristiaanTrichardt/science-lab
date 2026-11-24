/* Lab Kit: shared engine for Mr Trichardt's interactives.
   A page calls LabKit.init({...}) with a list of missions. Each mission has:
     icon, title, short     – shown in the mission list and top bar
     run(body, kit)         – builds the activity inside `body`; returns a Promise that
                              resolves when the student has finished the task
     gate                   – check-in questions [{q, o:[correct, ...wrong], ex, hint}]
     bonus (optional)       – one harder question for a star
   You shouldn't need to edit this file. */
(function () {
  'use strict';
  const $ = s => document.querySelector(s);
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const wait = ms => new Promise(r => setTimeout(r, ms));
  const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;

  let cfg, KEY, state, current = -1;
  const fresh = () => ({ name: '', done: [], stars: 0, first: 0 });
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) {} };
  const load = () => { try { return JSON.parse(localStorage.getItem(KEY)); } catch (e) { return null; } };

  /* ---------- cards ---------- */
  function card(html) {
    const m = $('#lkModal'); m.innerHTML = `<div class="lk-card glass">${html}</div>`; m.classList.remove('hidden');
    return m.firstElementChild;
  }
  function closeCard() { const m = $('#lkModal'); m.classList.add('hidden'); m.innerHTML = ''; }
  const head = (kick, title, sub) => `<div class="lk-kick">${kick}</div><h2>${title}</h2>${sub ? `<p class="sub">${sub}</p>` : ''}`;
  function choose(html, a, b) {
    return new Promise(res => {
      const c = card(html + `<div class="actions">${b ? `<button class="btn" data-r="0">${b}</button>` : ''}<button class="btn primary" data-r="1">${a}</button></div>`);
      c.querySelectorAll('[data-r]').forEach(x => x.onclick = () => { closeCard(); res(x.dataset.r === '1'); });
      c.querySelector('[data-r="1"]').focus();
    });
  }
  function shake(el) { el.classList.remove('shake'); void el.offsetWidth; el.classList.add('shake'); }
  let toastT;
  function toast(msg, ms) {
    const t = $('#lkToast'); t.textContent = msg; t.classList.add('show');
    clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('show'), ms || 2400);
  }
  function ask(q, meta) {
    return new Promise(res => {
      const opts = shuffle(q.o.map((t, i) => ({ t, ok: i === 0 })));
      const bar = meta.bonus ? '' : `<div class="qbar">${Array.from({ length: meta.n }, (_, i) => `<i class="${i < meta.k ? 'done' : i === meta.k ? 'now' : ''}"></i>`).join('')}</div>`;
      const c = card(`<div class="lk-kick">${meta.bonus ? '⭐ Bonus challenge · one try only' : `✅ Check-in · Question ${meta.k + 1} of ${meta.n}`}</div>${bar}
        <h2>${esc(q.q)}</h2>${q.img ? `<div style="margin:8px 0">${q.img}</div>` : ''}
        <div class="opts">${opts.map((o, i) => `<button class="opt" data-i="${i}">${esc(o.t)}</button>`).join('')}</div>
        <div class="fb hidden"></div><div class="actions"><button class="btn primary hidden" id="lkGo">Next ▸</button></div>`);
      let tries = 0;
      const fb = (cls, html) => { const f = c.querySelector('.fb'); f.className = 'fb ' + cls; f.innerHTML = html; };
      c.querySelector('.opts').addEventListener('click', e => {
        const b = e.target.closest('.opt'); if (!b || b.disabled) return;
        const o = opts[+b.dataset.i]; tries++;
        const lock = () => c.querySelectorAll('.opt').forEach((x, i) => { x.disabled = true; if (opts[i].ok) x.classList.add('right'); });
        if (meta.bonus) {
          lock(); if (!o.ok) b.classList.add('wrong');
          if (o.ok) { state.stars++; save(); top(); }
          fb(o.ok ? 'good' : 'info', (o.ok ? '⭐ Correct, you earned a star! ' : '💡 Good try! ') + esc(q.ex));
          c.querySelector('#lkGo').classList.remove('hidden');
        } else if (o.ok) {
          if (tries === 1 && meta.count) { state.first++; save(); }
          lock(); fb('good', '✓ ' + esc(q.ex));
          const g = c.querySelector('#lkGo'); g.classList.remove('hidden'); g.focus();
        } else {
          b.disabled = true; b.classList.add('wrong'); shake(b);
          fb('bad', '✗ Not quite. 💡 ' + esc(q.hint) + ' Try again!');
        }
      });
      c.querySelector('#lkGo').addEventListener('click', () => { closeCard(); res(); });
    });
  }

  /* ---------- shell ---------- */
  function shell() {
    document.body.insertAdjacentHTML('afterbegin', `
      <div class="lk-bg" aria-hidden="true"><i></i><i></i><i></i></div>
      <header class="lk-top glass">
        <div class="lk-brand" id="lkHome" title="Mission list"><span class="lk-logo">${cfg.icon}</span><div><small>${esc(cfg.kicker || "Mr Trichardt's Science Lab")}</small><b>${esc(cfg.title)}</b></div></div>
        <nav class="lk-steps" id="lkSteps" aria-label="Missions"></nav>
        <span class="lk-chip" title="Bonus stars">⭐ <span id="lkStars">0</span></span>
      </header>
      <main class="lk-main" id="lkMain"></main>
      <div id="lkModal" class="hidden"></div><div id="lkToast" class="glass"></div>`);
    $('#lkHome').onclick = () => home();
    if (cfg.theme) document.documentElement.style.setProperty('--theme', cfg.theme);
  }
  const unlockedUpTo = () => state.done.length; // missions are done in order
  function top() {
    $('#lkStars').textContent = state.stars;
    $('#lkSteps').innerHTML = cfg.missions.map((m, i) => {
      const done = state.done.includes(i), locked = i > unlockedUpTo();
      return `<button class="lk-step${done ? ' done' : ''}${i === current ? ' now' : ''}" data-i="${i}" ${locked ? 'disabled' : ''} title="${esc(m.title)}">
        <span class="n">${done ? '✓' : locked ? '🔒' : m.icon}</span><span class="t">${i + 1}. ${esc(m.short || m.title)}</span></button>`;
    }).join('');
    $('#lkSteps').querySelectorAll('.lk-step').forEach(b => b.onclick = () => openMission(+b.dataset.i));
  }

  function home() {
    current = -1; top(); closeCard();
    const n = state.done.length, all = cfg.missions.length;
    $('#lkMain').innerHTML = `
      <section class="lk-hero">
        <div>
          <div class="lk-kick">${esc(cfg.kicker || "Mr Trichardt's Science Lab")}</div>
          <h1>${cfg.heroTitle || esc(cfg.title)}</h1>
          <p>${cfg.intro}</p>
          <div class="lk-name">
            <input id="lkName" maxlength="24" placeholder="Your name (for your certificate)" value="${esc(state.name)}" aria-label="Your name">
            <button class="btn primary" id="lkStart">${n === 0 ? 'Start mission 1 ▸' : n >= all ? 'See my certificate ▸' : `Continue: mission ${n + 1} ▸`}</button>
          </div>
          ${n ? `<p style="margin-top:14px;font-size:.9rem"><button class="btn small" id="lkReset">↺ Start over</button></p>` : ''}
        </div>
        <ol class="lk-mlist glass">${cfg.missions.map((m, i) => `<li><span class="ic">${m.icon}</span><div><b>${i + 1}. ${esc(m.title)}</b><span>${esc(m.blurb || '')}</span></div><span class="ok">${state.done.includes(i) ? '✅' : i > unlockedUpTo() ? '🔒' : ''}</span></li>`).join('')}</ol>
      </section>`;
    const nm = $('#lkName');
    nm.oninput = () => { state.name = nm.value.trim(); save(); };
    $('#lkStart').onclick = () => { state.name = nm.value.trim(); save(); n >= all ? finish() : openMission(Math.min(n, all - 1)); };
    const r = $('#lkReset'); if (r) r.onclick = () => { if (confirm('Start again from mission 1? Your progress will be cleared.')) { state = fresh(); save(); home(); } };
  }

  async function openMission(i) {
    if (i > unlockedUpTo()) return;
    current = i; top(); closeCard();
    const m = cfg.missions[i];
    scrollTo({ top: 0, behavior: REDUCED ? 'auto' : 'smooth' });
    $('#lkMain').innerHTML = `
      <div class="lk-mhead"><div><div class="lk-kick">Mission ${i + 1} of ${cfg.missions.length}</div><h1>${m.icon} ${esc(m.title)}</h1></div></div>
      <div class="lk-guide"><span class="lk-face">${cfg.guide.emoji}</span><div class="lk-bubble glass" id="lkSay"></div></div>
      <div id="lkBody"></div>
      <div class="lk-foot" id="lkFoot"></div>`;
    const token = {};
    openMission.token = token;
    const kit = makeKit(token);
    await m.run($('#lkBody'), kit);
    if (openMission.token !== token) return; // student switched mission
    const f = $('#lkFoot');
    f.innerHTML = `<div class="lk-done glass">✅ Task complete! <button class="btn primary" id="lkGate">Check-in questions ▸</button></div>`;
    f.scrollIntoView({ behavior: REDUCED ? 'auto' : 'smooth', block: 'center' });
    $('#lkGate').onclick = async () => {
      const already = state.done.includes(i);
      for (let k = 0; k < m.gate.length; k++) await ask(m.gate[k], { k, n: m.gate.length, count: !already });
      if (m.bonus && !already && await choose(head('⭐ Bonus challenge', 'Want to earn a star?', 'A harder extension question. One try only, and no penalty for getting it wrong.'), 'Try it ⭐', 'Skip'))
        await ask(m.bonus, { bonus: true });
      if (!already) { state.done.push(i); save(); }
      top();
      const last = i === cfg.missions.length - 1;
      f.innerHTML = `<div class="lk-done glass">🎉 Mission ${i + 1} complete! <button class="btn primary" id="lkNext">${last ? 'Get my certificate 🏆' : `Mission ${i + 2}: ${esc(cfg.missions[i + 1].short || cfg.missions[i + 1].title)} ▸`}</button></div>`;
      $('#lkNext').onclick = () => last ? finish() : openMission(i + 1);
      toast(last ? '🏆 All missions complete!' : `🔓 Mission ${i + 2} unlocked!`, 2600);
    };
  }

  /* ---------- reusable game pieces (resolve when finished) ---------- */
  // Sort cards into bins. items: [{t:'text', k:'binKey', hint:'optional'}], bins: [{k, label, sub}]
  function sortDeck(el, items, bins, opts) {
    opts = opts || {};
    return new Promise(res => {
      const list = shuffle(items); let left = list.length;
      el.innerHTML = `<div class="lk-deck">${list.map((c, i) => `<div class="lk-sc" data-i="${i}"><span>${c.t}</span><span class="lk-bt">${bins.map(b => `<button class="btn small" data-to="${b.k}">${b.label}</button>`).join('')}</span></div>`).join('')}</div>
        <div class="lk-bins" style="grid-template-columns:repeat(${Math.min(bins.length, 3)},1fr)">${bins.map(b => `<div class="lk-bin" data-k="${b.k}"><h4>${b.label}</h4>${b.sub ? `<small>${b.sub}</small>` : ''}<div class="lk-got"></div></div>`).join('')}</div>
        <div class="fb hidden"></div>`;
      const fb = el.querySelector(':scope > .fb');
      el.querySelectorAll('.lk-sc').forEach(sc => sc.querySelectorAll('[data-to]').forEach(b => b.onclick = () => {
        const c = list[+sc.dataset.i]; fb.classList.remove('hidden');
        if (b.dataset.to === c.k) {
          sc.remove(); el.querySelector(`.lk-bin[data-k="${c.k}"] .lk-got`).insertAdjacentHTML('beforeend', `<span class="lk-placed">✓ ${c.t}</span>`);
          fb.className = 'fb good'; fb.innerHTML = --left ? `✓ ${c.why || 'Correct!'} <b>${left} to go.</b>` : '✓ ' + (c.why || '') + ' All sorted!';
          if (!left) res();
        } else { shake(sc); fb.className = 'fb bad'; fb.innerHTML = '✗ ' + (c.hint || opts.hint || 'Not that one. Try again!'); }
      }));
    });
  }
  // Match left items to right items. pairs: [{k, a:'left', b:'right', why}]
  function matchPairs(el, pairs, labels) {
    labels = labels || ['', ''];
    return new Promise(res => {
      let sel = null, left = pairs.length;
      el.innerHTML = `<div class="lk-match"><div class="lk-col">${labels[0] ? `<div class="lk-collab">${labels[0]}</div>` : ''}${shuffle(pairs).map(p => `<button class="lk-mb" data-s="a" data-k="${p.k}">${p.a}</button>`).join('')}</div>
        <div class="lk-col">${labels[1] ? `<div class="lk-collab">${labels[1]}</div>` : ''}${shuffle(pairs).map(p => `<button class="lk-mb" data-s="b" data-k="${p.k}">${p.b}</button>`).join('')}</div></div>`;
      el.querySelectorAll('.lk-mb').forEach(b => b.onclick = () => {
        if (b.disabled) return;
        if (!sel || sel.dataset.s === b.dataset.s) { el.querySelectorAll('.lk-mb.sel').forEach(x => x.classList.remove('sel')); sel = b; b.classList.add('sel'); return; }
        if (sel.dataset.k === b.dataset.k) {
          [sel, b].forEach(x => { x.classList.remove('sel'); x.classList.add('done'); x.disabled = true; });
          const p = pairs.find(q => q.k === b.dataset.k); if (p.why) toast('✓ ' + p.why.replace(/<[^>]+>/g, ''), 3000);
          sel = null; if (--left === 0) res();
        } else { shake(b); toast('✗ Not a match. Try again!'); sel.classList.remove('sel'); sel = null; }
      });
    });
  }
  // Tap items in the correct order. items: in CORRECT order [{t, sub}]
  function orderTap(el, items, opts) {
    opts = opts || {};
    return new Promise(res => {
      const mixed = shuffle(items.map((x, i) => ({...x, i}))); let n = 0;
      el.innerHTML = `<div class="lk-slots">${items.map((_, i) => `<div class="lk-slot"><b>${i + 1}</b><span></span></div>`).join('')}</div>
        <div class="lk-pool">${mixed.map(x => `<button class="lk-mb" data-i="${x.i}">${x.t}${x.sub ? `<small>${x.sub}</small>` : ''}</button>`).join('')}</div><div class="fb hidden"></div>`;
      const fb = el.querySelector('.fb');
      el.querySelectorAll('.lk-pool .lk-mb').forEach(b => b.onclick = () => {
        if (+b.dataset.i === n) {
          b.disabled = true; b.classList.add('done');
          const s = el.querySelectorAll('.lk-slot')[n]; s.classList.add('on'); s.querySelector('span').innerHTML = items[n].t;
          n++; fb.classList.remove('hidden'); fb.className = 'fb good'; fb.textContent = n < items.length ? '✓ Next…' : '✓ ' + (opts.done || 'All in order!');
          if (n === items.length) res();
        } else { shake(b); fb.classList.remove('hidden'); fb.className = 'fb bad'; fb.textContent = '✗ ' + (opts.hint || 'Not next. Try another!'); }
      });
    });
  }

  function makeKit(token) {
    return {
      esc, shuffle, wait, toast, card, closeCard, choose, head, shake, REDUCED, sortDeck, matchPairs, orderTap,
      say(html, who) { const s = $('#lkSay'); if (!s || openMission.token !== token) return; s.innerHTML = `<small>${esc(who || cfg.guide.name)}</small>${html}`; s.style.animation = 'none'; void s.offsetWidth; s.style.animation = ''; },
      alive() { return openMission.token === token; }
    };
  }

  function confetti() {
    if (REDUCED) return;
    const bits = cfg.confetti || ['🎉', '✨', '⭐', '🫧'];
    for (let i = 0; i < 36; i++) {
      const s = document.createElement('span'); s.className = 'lk-confetti'; s.textContent = bits[i % bits.length];
      s.style.cssText = `left:${Math.random() * 100}vw;animation-duration:${2.5 + Math.random() * 2.5}s;animation-delay:${Math.random()}s`;
      document.body.appendChild(s); setTimeout(() => s.remove(), 6000);
    }
  }
  function finish() {
    if (state.done.length < cfg.missions.length) return home();
    current = -1; top(); confetti();
    const total = cfg.missions.reduce((n, m) => n + m.gate.length, 0);
    const date = new Date().toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' });
    const nm = state.name || 'Science Explorer';
    $('#lkMain').innerHTML = `<section class="lk-panel glass" style="max-width:720px;margin:20px auto">
      <div class="lk-kick">🏁 All missions complete</div>
      <h1 style="font-family:var(--head);font-weight:600;margin:6px 0">Brilliant work, ${esc(nm)}! 🎉</h1>
      <p style="color:var(--ink2);font-weight:600;margin:0">${cfg.summary || ''}</p>
      <div class="lk-stats"><div><b>${cfg.missions.length} / ${cfg.missions.length}</b>missions</div><div><b>${state.first} / ${total}</b>right first try</div><div><b>⭐ ${state.stars}</b>bonus stars</div></div>
      <div class="lk-cert"><small>Certificate of achievement</small><h3>${esc(cfg.certTitle || cfg.title)}</h3>
        <div style="font-size:2.4rem">${cfg.icon}</div><b style="font-size:1.2rem">${esc(nm)}</b><br>
        <span style="color:var(--ink2);font-weight:600;font-size:.9rem">completed ${esc(cfg.title)} · ${esc(date)}</span></div>
      <div class="actions" style="justify-content:center"><button class="btn" id="lkMenu">📋 Mission list</button><button class="btn primary" id="lkAgain">↺ Play again</button></div>
    </section>`;
    $('#lkMenu').onclick = home;
    $('#lkAgain').onclick = () => { state = fresh(); state.name = nm === 'Science Explorer' ? '' : nm; save(); home(); };
  }

  window.LabKit = {
    init(c) {
      cfg = c; KEY = 'labkit-' + c.id;
      state = Object.assign(fresh(), load() || {});
      shell(); top();
      // Teacher shortcut: ?mission=3 opens that mission straight away (unlocking earlier ones)
      const jump = parseInt(new URLSearchParams(location.search).get('mission'), 10);
      if (jump >= 1 && jump <= c.missions.length) { for (let k = 0; k < jump - 1; k++) if (!state.done.includes(k)) state.done.push(k); openMission(jump - 1); }
      else home();
    },
    esc, shuffle, wait
  };
})();
