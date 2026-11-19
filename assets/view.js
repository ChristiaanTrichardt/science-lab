/* Viewer page — shows one resource inside the site frame.
   You shouldn't need to edit this file. */
(function () {
  const $ = (s) => document.querySelector(s);
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  const SITE = window.SITE || {};
  const id = new URLSearchParams(location.search).get('r');
  const r = (window.RESOURCES || []).find((x) => x.id === id);
  const stage = $('#stage');

  if (!r) {
    document.body.classList.remove('viewer');
    document.body.innerHTML = `
      <div class="bg"><div class="blob b1"></div><div class="blob b2"></div><div class="blob b3"></div></div>
      <div style="min-height:100vh;display:flex;padding:16px">
        <div class="notfound glass">
          <div style="font-size:3rem">🫧</div>
          <h1>Hmm, that one's floated away</h1>
          <p>We couldn't find that resource. It may have been moved or renamed.</p>
          <a class="vbtn" href="./" style="display:inline-flex">Back to all resources</a>
        </div>
      </div>`;
    return;
  }

  const cat = (window.CATEGORIES || []).find((c) => c.id === r.category) || { name: 'Other', emoji: '📦', color: '#94a3b8' };
  document.title = `${r.title} · ${SITE.shortTitle || SITE.title || 'Science Lab'}`;
  $('#back').href = './#' + encodeURIComponent(cat.id || '');
  $('#vtitle').style.setProperty('--c', cat.color);
  $('#vtitle').innerHTML = `<span class="cat-dot" aria-hidden="true">${esc(cat.emoji)}</span>
    <h1>${esc(r.title)}</h1><span>${esc(cat.name)}${r.years ? ' · ' + esc(r.years) : ''}</span>`;

  const src = r.path || r.model || r.url;
  $('#newtab').href = src;
  const hideLoader = () => { $('#loader').style.opacity = 0; };

  if (r.type === 'model' && r.model) {
    stage.classList.add('light');
    const s = document.createElement('script');
    s.type = 'module';
    s.src = 'https://cdn.jsdelivr.net/npm/@google/model-viewer@3.5.0/dist/model-viewer.min.js';
    document.head.appendChild(s);
    const mv = document.createElement('model-viewer');
    mv.setAttribute('src', r.model);
    mv.setAttribute('alt', r.title);
    ['camera-controls', 'auto-rotate', 'ar', 'touch-action'].forEach((a) => mv.setAttribute(a, a === 'touch-action' ? 'pan-y' : ''));
    mv.setAttribute('shadow-intensity', '1');
    mv.setAttribute('exposure', '1');
    mv.addEventListener('load', hideLoader);
    stage.appendChild(mv);
  } else {
    const f = document.createElement('iframe');
    f.src = src;
    f.title = r.title;
    f.allow = 'fullscreen; xr-spatial-tracking; clipboard-write; autoplay; accelerometer; gyroscope';
    f.setAttribute('allowfullscreen', '');
    f.addEventListener('load', () => { hideLoader(); try { f.contentWindow.focus(); } catch (e) {} });
    stage.appendChild(f);
  }

  /* buttons */
  const toast = (msg) => {
    const t = $('#toast');
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(toast.t);
    toast.t = setTimeout(() => t.classList.remove('show'), 1800);
  };
  $('#share').addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(location.href); toast('Link copied! Paste it anywhere 🫧'); }
    catch (e) { prompt('Copy this link:', location.href); }
  });
  $('#fs').addEventListener('click', () => {
    if (document.fullscreenElement) document.exitFullscreen();
    else if (stage.requestFullscreen) stage.requestFullscreen();
  });
})();
