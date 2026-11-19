/* Homepage logic — you shouldn't need to edit this file.
   Add resources and categories in resources.js instead. */
(function () {
  const $ = (s) => document.querySelector(s);
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  const SITE = window.SITE || {};
  const CATS = window.CATEGORIES || [];
  const TYPES = [
    { id: 'all', label: 'All' },
    { id: 'interactive', label: 'Interactives', one: 'Interactive', icon: '👆' },
    { id: 'model', label: '3D models', one: '3D model', icon: '🧊' },
    { id: 'website', label: 'Websites', one: 'Website', icon: '🌐' }
  ];
  const ARROW = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
  const ALL = { id: 'all', name: 'Everything', emoji: '✨', color: '#818cf8', blurb: 'Everything in the lab, newest first.' };

  const RES = (window.RESOURCES || []).slice().sort((a, b) => String(b.added || '').localeCompare(String(a.added || '')));
  const catOf = (r) => CATS.find((c) => c.id === r.category) || { name: 'Other', emoji: '📦', color: '#94a3b8' };
  const typeOf = (r) => TYPES.find((t) => t.id === r.type) || TYPES[1];
  const isExternal = (r) => !!r.url && !r.path && !r.model;
  const hrefOf = (r) => (isExternal(r) ? r.url : 'view.html?r=' + encodeURIComponent(r.id));
  const linkAttrs = (r) => (isExternal(r) ? ' target="_blank" rel="noopener"' : '');
  const isNew = (r) => r.added && (Date.now() - new Date(r.added + 'T00:00:00')) / 864e5 < 30;

  const state = { cat: 'all', type: 'all', q: '' };
  const fromHash = () => {
    const h = decodeURIComponent(location.hash.slice(1));
    state.cat = CATS.some((c) => c.id === h) ? h : 'all';
  };

  function thumbHTML(r) {
    const c = catOf(r);
    return r.thumb
      ? `<img src="${esc(r.thumb)}" alt="" loading="lazy">`
      : `<span class="thumb-emoji" aria-hidden="true">${esc(r.emoji || c.emoji)}</span>`;
  }

  /* ---------- hero ---------- */
  function renderHero() {
    $('#tagline').textContent = SITE.tagline || '';
    const used = new Set(RES.map((r) => r.category));
    $('#stats').innerHTML =
      `<span class="stat glass"><b>${RES.length}</b>resource${RES.length === 1 ? '' : 's'}</span>` +
      `<span class="stat glass"><b>${used.size}</b>topic${used.size === 1 ? '' : 's'} covered</span>` +
      `<span class="stat glass"><b>Free</b>for students</span>`;
    $('#foot-count').textContent = `${RES.length} resource${RES.length === 1 ? '' : 's'} and counting`;

    const r = RES[0];
    if (!r) { $('#spotlight').remove(); return; }
    const c = catOf(r);
    $('#spotlight').innerHTML = `
      <a class="spot glass" href="${esc(hrefOf(r))}"${linkAttrs(r)} style="--c:${esc(c.color)}">
        <span class="float-bubble fb1"></span><span class="float-bubble fb2"></span>
        <div class="thumb">${thumbHTML(r)}</div>
        <div class="spot-body">
          <div>
            <div class="spot-label">✨ Latest addition</div>
            <h2>${esc(r.title)}</h2>
            <p>${esc(c.name)} · ${esc(r.subtitle || typeOf(r).one)}</p>
          </div>
          <span class="orb-btn" aria-hidden="true">${ARROW}</span>
        </div>
      </a>`;
  }

  /* ---------- categories ---------- */
  function renderCats() {
    const counts = {};
    RES.forEach((r) => { counts[r.category] = (counts[r.category] || 0) + 1; });
    $('#cats').innerHTML = [ALL, ...CATS].map((c) => {
      const n = c.id === 'all' ? RES.length : counts[c.id] || 0;
      const label = n ? `${n} resource${n === 1 ? '' : 's'}` : 'Coming soon';
      return `<button class="cat glass${state.cat === c.id ? ' on' : ''}${n ? '' : ' empty'}" data-cat="${esc(c.id)}"
          style="--c:${esc(c.color)}" aria-pressed="${state.cat === c.id}">
          <span class="cat-bubble" aria-hidden="true">${esc(c.emoji)}</span>
          <span class="cat-name">${esc(c.name)}</span>
          <span class="cat-count">${label}</span>
        </button>`;
    }).join('');
  }

  function renderTypes() {
    $('#types').innerHTML = TYPES.map((t) =>
      `<button data-type="${t.id}" class="${state.type === t.id ? 'on' : ''}" aria-pressed="${state.type === t.id}">${t.label}</button>`
    ).join('');
  }

  /* ---------- grid ---------- */
  function matches(r) {
    if (state.cat !== 'all' && r.category !== state.cat) return false;
    if (state.type !== 'all' && r.type !== state.type) return false;
    if (!state.q) return true;
    const hay = [r.title, r.subtitle, r.description, r.years, catOf(r).name, ...(r.tags || [])].join(' ').toLowerCase();
    return state.q.toLowerCase().split(/\s+/).filter(Boolean).every((w) => hay.includes(w));
  }

  function renderGrid() {
    const cat = state.cat === 'all' ? ALL : CATS.find((c) => c.id === state.cat);
    $('#list-title').textContent = state.q ? `Results for “${state.q}”` : (state.cat === 'all' ? 'All resources' : cat.name);
    $('#list-blurb').textContent = cat.blurb || '';

    const list = RES.filter(matches);
    if (!list.length) {
      const msg = state.q
        ? ['🔍', 'Nothing found yet', 'Try a different word, or pick another topic.']
        : ['🫧', 'Coming soon!', 'New resources for this topic are on the way. Check back soon.'];
      $('#grid').innerHTML = `<div class="empty-state glass"><div class="big">${msg[0]}</div><h3>${msg[1]}</h3><p>${msg[2]}</p></div>`;
      return;
    }
    $('#grid').innerHTML = list.map((r, i) => {
      const c = catOf(r), t = typeOf(r);
      const tags = (r.tags || []).slice(0, 3).map((x) => `<span class="tag">${esc(x)}</span>`).join('');
      return `<a class="card glass" href="${esc(hrefOf(r))}"${linkAttrs(r)} style="--c:${esc(c.color)};animation-delay:${Math.min(i, 8) * 50}ms">
        <div class="thumb">
          ${thumbHTML(r)}
          <div class="badges"><span class="badge">${t.icon} ${esc(t.one)}</span>${isNew(r) ? '<span class="badge new">New</span>' : ''}</div>
        </div>
        <div class="card-body">
          <div class="meta"><span class="dot"></span>${esc(c.name)}${r.years ? ' · ' + esc(r.years) : ''}</div>
          <h3>${esc(r.title)}</h3>
          <p>${esc(r.description)}</p>
          <div class="card-foot"><div class="tags">${tags}</div><span class="go" aria-hidden="true">${ARROW}</span></div>
        </div>
      </a>`;
    }).join('');
  }

  const render = () => { renderCats(); renderTypes(); renderGrid(); };

  /* ---------- events ---------- */
  $('#cats').addEventListener('click', (e) => {
    const b = e.target.closest('[data-cat]');
    if (!b) return;
    state.cat = b.dataset.cat;
    history.replaceState(null, '', state.cat === 'all' ? location.pathname + location.search : '#' + state.cat);
    render();
    if (window.innerWidth < 900) $('#resources').scrollIntoView({ behavior: 'smooth' });
  });
  $('#types').addEventListener('click', (e) => {
    const b = e.target.closest('[data-type]');
    if (!b) return;
    state.type = b.dataset.type;
    render();
  });
  const q = $('#q');
  let t;
  q.addEventListener('input', () => {
    clearTimeout(t);
    t = setTimeout(() => { state.q = q.value.trim(); renderGrid(); }, 120);
  });
  q.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') $('#resources').scrollIntoView({ behavior: 'smooth' });
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === '/' && document.activeElement !== q) { e.preventDefault(); q.focus(); }
  });
  window.addEventListener('hashchange', () => {
    const h = location.hash.slice(1);
    if (h === 'categories' || h === 'resources') return;
    fromHash(); render();
  });

  /* ---------- rising bubbles ---------- */
  function bubbles() {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const box = $('#bubbles');
    const n = window.innerWidth < 600 ? 8 : 16;
    for (let i = 0; i < n; i++) {
      const b = document.createElement('span');
      const size = 14 + Math.random() * 62;
      b.className = 'bubble';
      b.style.cssText = `width:${size}px;height:${size}px;left:${Math.random() * 100}%;` +
        `--sway:${(Math.random() - 0.5) * 120}px;animation-duration:${18 + Math.random() * 22}s;` +
        `animation-delay:${-Math.random() * 40}s`;
      box.appendChild(b);
    }
  }

  fromHash();
  renderHero();
  render();
  bubbles();
  if (state.cat !== 'all') requestAnimationFrame(() => $('#categories').scrollIntoView());
})();
