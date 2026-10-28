/* Capyverso · núcleo: adopción, mundo, mascota y secciones */
(() => {
  'use strict';
  const C = window.CAPY, cfg = C.config;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const params = new URLSearchParams(location.search);
  const DEV = params.has('dev');
  const KEY = 'capyverso.v1';
  const MONTHS = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
  const norm = s => (s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const pick = a => a[Math.floor(Math.random() * a.length)];

  /* ---------- estado ---------- */
  const defaults = () => ({ adopted: false, pet: 'Capi', seen: {}, letters: {}, vouchers: {}, taps: 0, eggs: {}, visits: [], mood: { v: 3, t: Date.now() }, stars: {}, lastDay: '', outbox: [] });
  if (params.has('reset')) { try { localStorage.removeItem(KEY); } catch {} }
  let S = (() => { try { return Object.assign(defaults(), JSON.parse(localStorage.getItem(KEY) || '{}')); } catch { return defaults(); } })();
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch {} };

  /* ---------- tiempo ---------- */
  const now = () => {
    const d = new Date();
    if (params.get('fecha')) { const [y, m, dd] = params.get('fecha').split('-').map(Number); d.setFullYear(y, m - 1, dd); }
    return d;
  };
  const hourNow = () => params.get('hora') ? Number(params.get('hora')) : (() => { const d = new Date(); return d.getHours() + d.getMinutes() / 60; })();
  const dkey = (d = now()) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  const ddiff = (a, b) => { const p = k => k.split('-').map(Number); const [y1, m1, d1] = p(a), [y2, m2, d2] = p(b); return Math.round((Date.UTC(y2, m2 - 1, d2) - Date.UTC(y1, m1 - 1, d1)) / 864e5); };
  const isBirthday = () => { const d = now(); return d.getMonth() + 1 === cfg.birthday.month && d.getDate() === cfg.birthday.day; };
  const fmtLong = k => { const [y, m, d] = k.split('-').map(Number); return `${d} de ${MONTHS[m - 1]}`; };

  /* ---------- utilidades UI ---------- */
  function toast(msg, ms = 3200) {
    $$('.toast').forEach(t => t.remove());
    const t = document.createElement('div'); t.className = 'toast'; t.textContent = msg; t.setAttribute('role', 'status');
    document.body.appendChild(t); setTimeout(() => t.remove(), ms);
  }
  const waLink = text => `https://wa.me/${cfg.waNumber || ''}?text=${encodeURIComponent(text)}`;

  let sheetState = null, pushed = false;
  function openSheet(title, html, opts = {}) {
    doClose();
    const wrap = $('#sheetWrap'), sheet = $('#sheet');
    sheet.className = 'sheet' + (opts.full ? ' full' : '') + (opts.dark ? ' dark' : '');
    $('#sheetTitle').textContent = title;
    const body = $('#sheetBody'); body.innerHTML = html;
    wrap.hidden = false; document.body.style.overflow = 'hidden';
    sheetState = { prev: document.activeElement, onClose: opts.onClose };
    if (!pushed) { try { history.pushState({ capySheet: 1 }, ''); pushed = true; } catch {} }
    $('.x', sheet).focus({ preventScroll: true });
    return { body, sheet, close: closeSheet, setTitle: t => { $('#sheetTitle').textContent = t; } };
  }
  function doClose() {
    const wrap = $('#sheetWrap');
    if (wrap.hidden) return;
    wrap.hidden = true; document.body.style.overflow = '';
    const st = sheetState; sheetState = null;
    $('#sheetBody').innerHTML = '';
    if (st) { try { st.onClose && st.onClose(); } catch {} try { st.prev && st.prev.focus({ preventScroll: true }); } catch {} }
  }
  function closeSheet() { if (pushed) { history.back(); } else doClose(); }
  addEventListener('popstate', () => { pushed = false; doClose(); });
  document.addEventListener('click', e => { if (e.target.closest('[data-close]')) closeSheet(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeSheet(); });

  /* ---------- avisos a Javier (ntfy.sh) ---------- */
  const LIVE = (location.protocol === 'https:' && location.hostname !== 'localhost') || params.has('notify');
  let flushing = false;
  async function flush() {
    if (flushing || !cfg.notify || !cfg.notify.topic) return; flushing = true;
    try {
      while (S.outbox && S.outbox.length) {
        const it = S.outbox[0];
        const r = await fetch('https://ntfy.sh/', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ topic: cfg.notify.topic, title: it.title, message: it.message, tags: it.tags || [] }) });
        if (!r.ok) break; S.outbox.shift(); save();
      }
    } catch {}
    flushing = false;
  }
  function notify(title, message, tags) {
    if (!LIVE || !cfg.notify || !cfg.notify.topic) return;
    (S.outbox = S.outbox || []).push({ title, message: message || '.', tags: tags || [] }); save(); flush();
  }
  addEventListener('online', flush);

  /* ---------- confeti ---------- */
  const cv = $('#confetti'), cx = cv.getContext('2d');
  let parts = [], raf = 0;
  const stickerImgs = ['capi-left', 'capi-top', 'capi-right'].map(n => { const i = new Image(); i.src = `assets/${n}.png`; return i; });
  function sizeCanvas() { const r = devicePixelRatio || 1; cv.width = innerWidth * r; cv.height = innerHeight * r; cx.setTransform(r, 0, 0, r, 0, 0); }
  addEventListener('resize', sizeCanvas); sizeCanvas();
  function confetti(n = 150, ox = 0.5, oy = 0.4) {
    const cols = ['#f2a6a1', '#f6c56b', '#a8683a', '#6e6b2f', '#fbf3e4', '#e08a80', '#9fd3ee'];
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2, v = 5 + Math.random() * 11;
      parts.push({ x: innerWidth * ox, y: innerHeight * oy, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 6, r: Math.random() * 6, vr: (Math.random() - .5) * .3,
        w: 6 + Math.random() * 8, h: 4 + Math.random() * 6, c: pick(cols), s: Math.random() < .12 ? pick(stickerImgs) : null, life: 0 });
    }
    if (!raf) raf = requestAnimationFrame(tick);
  }
  function tick() {
    cx.clearRect(0, 0, innerWidth, innerHeight);
    parts = parts.filter(p => p.y < innerHeight + 60 && p.life < 260);
    for (const p of parts) {
      p.vy += .28; p.vx *= .992; p.x += p.vx; p.y += p.vy; p.r += p.vr; p.life++;
      cx.save(); cx.translate(p.x, p.y); cx.rotate(p.r); cx.globalAlpha = Math.min(1, (260 - p.life) / 60);
      if (p.s && p.s.complete) cx.drawImage(p.s, -14, -14, 28, 28 * p.s.height / p.s.width);
      else { cx.fillStyle = p.c; cx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h); }
      cx.restore();
    }
    raf = parts.length ? requestAnimationFrame(tick) : 0;
  }

  /* ---------- paisaje: hora del día, estrellas, luciérnagas ---------- */
  function timeClass() { const h = hourNow(); return h >= 5 && h < 7.5 ? 't-dawn' : h >= 7.5 && h < 17.5 ? 't-day' : h >= 17.5 && h < 19.5 ? 't-dusk' : 't-night'; }
  function setTheme(cls) {
    document.body.classList.remove('t-day', 't-dawn', 't-dusk', 't-night'); document.body.classList.add(cls);
    $('meta[name=theme-color]').setAttribute('content', { 't-day': '#8fcbea', 't-dawn': '#9b8fc7', 't-dusk': '#4c3f7a', 't-night': '#0f1630' }[cls]);
  }
  (function seedScene() {
    const st = $('#stars');
    for (let i = 0; i < 70; i++) { const s = document.createElement('i'); s.style.left = Math.random() * 100 + '%'; s.style.top = Math.random() * 100 + '%'; s.style.animationDelay = (Math.random() * 3) + 's'; s.style.opacity = .4 + Math.random() * .6; st.appendChild(s); }
    const ff = $('#fireflies'); let caught = 0;
    for (let i = 0; i < 14; i++) {
      const f = document.createElement('i'); f.style.left = (5 + Math.random() * 90) + '%'; f.style.top = (40 + Math.random() * 45) + '%'; f.style.animationDelay = (-Math.random() * 9) + 's'; f.style.animationDuration = (7 + Math.random() * 6) + 's';
      f.addEventListener('click', () => { f.remove(); caught++; if (caught === 10) foundEgg('fire', C.eggFire); else if (caught < 10) toast(`Luciérnagas: ${caught}/10`, 1200); });
      ff.appendChild(f);
    }
  })();

  /* ---------- secretos ---------- */
  function foundEgg(key, msg) {
    if (S.eggs[key]) { showBubble(msg); return; }
    S.eggs[key] = 1; save(); confetti(120, .5, .45); showBubble(msg, 9000);
    toast(`Secreto descubierto (${Object.keys(S.eggs).length}/3)`);
    notify('Descubrió un secreto', `Secreto: ${key} (${Object.keys(S.eggs).length}/3)`, ['sparkles']);
  }

  /* ---------- mascota ---------- */
  const pet = $('#pet'), bubble = $('#bubble'), petBtn = $('#petBtn');
  let bubbleT = 0;
  function showBubble(text, ms = 6500) {
    bubble.textContent = text; bubble.classList.add('show'); clearTimeout(bubbleT);
    bubbleT = setTimeout(() => bubble.classList.remove('show'), ms);
  }
  const asleep = () => { const h = hourNow(); return !isBirthday() && (h >= 23.5 || h < 5.5); };
  function applySleep() { const a = asleep(); pet.classList.toggle('asleep', a); $('#zzz').hidden = !a; }
  const HOURS8 = 8 * 3600 * 1000;
  function moodNow() { return Math.max(0, S.mood.v - Math.floor((Date.now() - S.mood.t) / HOURS8)); }
  function setMood(v) { S.mood = { v: Math.min(5, v), t: Date.now() }; save(); renderMood(); }
  function renderMood() { const v = moodNow(); $('#mood').innerHTML = Array.from({ length: 5 }, (_, i) => `<svg class="${i < v ? '' : 'off'}"><use href="#i-heart"/></svg>`).join(''); }
  function floatEmoji(txt, el = petBtn, n = 5) {
    const r = el.getBoundingClientRect();
    for (let i = 0; i < n; i++) setTimeout(() => {
      const f = document.createElement('span'); f.className = 'float'; f.textContent = txt;
      f.style.left = (r.left + r.width * (.2 + Math.random() * .6)) + 'px'; f.style.top = (r.top + r.height * (.1 + Math.random() * .4)) + 'px';
      document.body.appendChild(f); setTimeout(() => f.remove(), 1400);
    }, i * 120);
  }
  function boing() { petBtn.classList.remove('boing'); void petBtn.offsetWidth; petBtn.classList.add('boing'); }
  let tapStreak = 0, tapT = 0;
  petBtn.addEventListener('click', () => {
    boing(); S.taps++; save();
    const t = Date.now(); tapStreak = t - tapT < 1500 ? tapStreak + 1 : 1; tapT = t;
    if (tapStreak === 7) { foundEgg('tap7', C.eggTap7); tapStreak = 0; return; }
    showBubble(asleep() ? pick(C.sleepLines) : `${pick(C.tapLines)}`);
  });
  $('#actPet').addEventListener('click', () => {
    boing(); floatEmoji('💛'); setMood(moodNow() + 1);
    showBubble(asleep() ? 'zzz… mmm… gracias… zzz' : pick(['Ay, qué rico. Sigue.', 'Ronroneo de capibara: brrrrr.', 'Mejor día del año. Cada día.', 'Estoy a punto de derretirme.']));
  });
  $('#actFeed').addEventListener('click', () => {
    const r = petBtn.getBoundingClientRect(); const m = document.createElement('span'); m.className = 'melon'; m.textContent = '🍉';
    m.style.left = (r.left + r.width / 2 - 16) + 'px'; m.style.top = (r.top + r.height * .45) + 'px'; document.body.appendChild(m);
    setTimeout(() => { m.remove(); boing(); floatEmoji('🍉', petBtn, 3); setMood(moodNow() + 2); showBubble(pick(['Ñam ñam ñam. Sin comentarios.', 'La sandía no falla nunca.', 'Esto lo pongo en mi lista de cosas favoritas. Es una lista corta.'])); }, 900);
  });
  $('#orb').addEventListener('click', (() => { let n = 0, t = 0; return () => { const x = Date.now(); n = x - t < 1500 ? n + 1 : 1; t = x; if (n === 5) { n = 0; foundEgg('moon', C.eggMoon); } }; })());

  /* ---------- saludo, días, mensaje del día ---------- */
  function greetWord() { const h = hourNow(); return h < 6 ? 'Buenas noches' : h < 12 ? 'Buenos días' : h < 19 ? 'Buenas tardes' : 'Buenas noches'; }
  function dailyMessage() {
    const list = C.daily; const off = ddiff(cfg.giftDate, dkey());
    if (off <= 0) return list[0];
    return list[((off - 1) % (list.length - 1)) + 1];
  }
  const daysTogether = () => ddiff(cfg.startDate, dkey());
  $('#daysBtn').addEventListener('click', () => {
    const n = daysTogether();
    toast(`${n} días desde aquel 20 de julio de 2024. Y contando, sin hacer trampa.`, 4500);
  });

  /* ---------- puntos de novedad ---------- */
  const letterOpen = l => (!l.unlock || dkey() >= l.unlock) && (!l.after || S.letters[l.after]);
  const availableLetters = () => C.letters.filter(letterOpen);
  function refreshDots() {
    $$('.obj[data-open]').forEach(o => {
      const k = o.dataset.open;
      if (o.classList.contains('soon')) return;
      const isNew = k === 'mail' ? availableLetters().some(l => !S.letters[l.id]) : !S.seen[k];
      o.classList.toggle('new', isNew);
    });
  }

  /* ---------- entrada al mundo ---------- */
  let ambient = 0;
  function enterWorld(first) {
    $('#gate').hidden = true; $('#world').hidden = false;
    setTheme(timeClass()); applySleep(); renderMood();
    $('#daysNum').textContent = daysTogether();
    $('#greeting').textContent = `${greetWord()}, ${cfg.herName}`;
    $('#petImg').alt = `${S.pet}, el capibara`;
    const today = dkey(); const firstToday = S.lastDay !== today;
    if (!S.visits.includes(today)) { S.visits.push(today); }
    S.lastDay = today; save(); refreshDots();
    setTimeout(() => {
      if (first) showBubble(`Soy ${S.pet}. ${C.daily[0]}`, 10000);
      else if (asleep()) showBubble(pick(C.sleepLines));
      else if (firstToday) showBubble(dailyMessage(), 9000);
      else if (moodNow() <= 1) showBubble('Tengo un poquito de hambre… ¿me das sandía?');
      else showBubble(pick(['Volviste. Bien.', 'Hola de nuevo. Iba a echarme una siesta.', 'Justo pensaba en ti… y en sandía.']));
    }, 900);
    if (first || (isBirthday() && firstToday)) setTimeout(() => confetti(160, .5, .35), 500);
    clearInterval(ambient);
    ambient = setInterval(() => { if (document.hidden || !$('#sheetWrap').hidden || bubble.classList.contains('show')) return; showBubble(asleep() ? pick(C.sleepLines) : pick(C.tapLines), 4500); }, 45000);
  }

  /* ---------- gate: adopción ---------- */
  const wrongHints = ['Mmm. Ese no es el nombre que me dijeron.', 'Seguro que no eres otro adoptante tonto intentando colarse, ¿verdad?', 'El capibara arruga la nariz. Prueba de nuevo.', 'Pista: es el nombre con el que te firman los cumpleaños.'];
  function startGate() {
    setTheme('t-night'); $('#gate').hidden = false;
    const chips = $('#petChips');
    chips.innerHTML = cfg.petSuggestions.map(n => `<button type="button" class="chip">${esc(n)}</button>`).join('');
    chips.addEventListener('click', e => { const c = e.target.closest('.chip'); if (c) { $('#petName').value = c.textContent; $('#petName').focus(); } });
    $('#certDate').textContent = (d => `${String(d.getDate()).padStart(2, '0')} · ${String(d.getMonth() + 1).padStart(2, '0')} · ${d.getFullYear()}`)(now());
    let wrong = 0, signed = '';
    $('#signForm').addEventListener('submit', e => {
      e.preventDefault();
      const v = norm($('#signName').value), hint = $('#signHint'), card = $('#stepSign .card');
      if (!v) { hint.textContent = 'Primero tu nombre, tonta.'; return; }
      if (cfg.namesOk.some(n => v.startsWith(n))) { signed = $('#signName').value.trim(); showCert(); return; }
      card.classList.remove('shake'); void card.offsetWidth; card.classList.add('shake');
      hint.textContent = (v === 'tonta' || v === 'tonto') ? 'Ese es el apodo que te dice él. Necesito tu nombre de verdad.' : wrongHints[wrong++ % wrongHints.length];
    });
    $('#nameForm').addEventListener('submit', e => {
      e.preventDefault();
      S.pet = ($('#petName').value.trim() || 'Capi').slice(0, 16); S.adopted = true; save();
      notify(`${cfg.herName} adoptó al capibara`, `Firmó como: «${signed}»\nNombre del capibara: ${S.pet}`, ['tada']);
      confetti(180, .5, .5); showVideoStep();
    });
    $('#welcomePlay').addEventListener('click', () => {
      const v = $('#welcomeVideo'); v.controls = true; $('#welcomePlay').hidden = true;
      v.play().catch(() => { v.controls = true; });
    });
    $('#welcomeVideo').addEventListener('ended', () => { confetti(120, .5, .3); $('#enterWorld').focus(); });
    $('#enterWorld').addEventListener('click', () => { $('#welcomeVideo').pause(); enterWorld(true); });
  }
  function showCert() {
    $('#certName').textContent = cfg.herName;
    $('#stepSign').hidden = true; $('#stepCert').hidden = false;
    setTimeout(() => $('#petName').focus({ preventScroll: true }), 900);
  }
  function showVideoStep() {
    $('#stepCert').hidden = true; $('#stepVideo').hidden = false;
    $('#videoEyebrow').textContent = `${S.pet} y un amigo vinieron a saludarte`;
  }

  /* ---------- secciones ---------- */
  function markSeen(k) { S.seen[k] = 1; save(); refreshDots(); }

  function openRadio() {
    markSeen('radio');
    const h = `
      <div class="radio-box">
        <div class="radio-top"><span>Capi FM</span><div class="dial"><i></i></div><span>20·09</span></div>
        <iframe title="Playlist de Spotify" src="https://open.spotify.com/embed/playlist/${cfg.playlistId}?utm_source=generator" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe>
      </div>
      <p class="muted" style="margin:10px 2px 0">¿Solo suenan fragmentos? Es cosa de Spotify: inicia sesión o <a href="https://open.spotify.com/playlist/${cfg.playlistId}" target="_blank" rel="noopener">ábrela en la app</a>.</p>
      <h4 style="font-family:var(--font-d);margin:20px 2px 4px;font-size:1.15rem;color:var(--brown-d)">Canciones con dueño</h4>
      <p class="note" style="margin:0 2px 8px">Cada quien tiene su recuerdo con estas. No hace falta contarlos: solo pensarlos, al mismo tiempo.</p>
      <div class="songs">${C.songs.map((s, i) => `
        <article class="song">
          <h4>${esc(s.title)}</h4><small>${esc(s.artist)}</small>
          <p>${esc(s.text)}</p>
          <button class="btn small alt" data-song="${i}" type="button">Pensar en mi recuerdo</button>
        </article>`).join('')}
      </div>`;
    const sh = openSheet('Radio', h);
    sh.body.addEventListener('click', e => { const b = e.target.closest('[data-song]'); if (b) ritual(C.songs[b.dataset.song]); });
  }
  async function ritual(song) {
    const o = document.createElement('div'); o.className = 'ritual';
    o.innerHTML = '<div><p id="rt"></p><div class="big" id="rb"></div><div id="ra"></div></div>'; document.body.appendChild(o);
    let alive = true; const stop = () => { alive = false; o.remove(); };
    const say = t => { $('#rt', o).textContent = t; }, num = t => { $('#rb', o).textContent = t; };
    notify('Hizo el ritual de una canción', `«${song.title}» — ${song.artist}`, ['musical_note']);
    say('Cierra los ojos un momento.'); await sleep(3200); if (!alive) return;
    say(`Piensa en tu recuerdo con «${song.title}». No hace falta contármelo todavía.`); await sleep(4200); if (!alive) return;
    say('Yo pensaré en el mío. Al mismo tiempo. Listos en…');
    for (let n = 5; n >= 1; n--) { num(n); await sleep(1000); if (!alive) return; }
    num('♥'); say('Ahora.'); await sleep(3200); if (!alive) return;
    num(''); say('¿Coincidimos? Cuéntamelo cuando quieras. Sin trampa.');
    $('#ra', o).innerHTML = `<a class="btn" target="_blank" rel="noopener" href="${waLink(`Mi recuerdo con «${song.title}» es… 🐹`)}">Contárselo por WhatsApp</a><button class="btn alt" type="button" id="rc">Cerrar</button>`;
    $('#rc', o).onclick = stop;
  }

  function openMail() {
    const render = () => {
      const html = `<p class="note" style="margin:0 2px 12px">Cada día 20 se abre una nueva. Las cerradas esperan su fecha.</p>
        <div class="env-grid">${C.letters.filter(l => letterOpen(l) || l.unlock || DEV).map(l => {
          const open = letterOpen(l) || DEV;
          return `<button class="env ${open ? '' : 'locked'} ${S.letters[l.id] ? 'read' : ''}" data-l="${l.id}" type="button">
            <span class="seal">${open ? '<svg><use href="#i-heart"/></svg>' : '<svg><use href="#i-lock"/></svg>'}</span>
            <small>${esc(l.tag || '')}</small><b>${esc(l.title)}</b>
            ${open ? '' : `<span class="when">Se abre el ${fmtLong(l.unlock)}</span>`}
          </button>`;
        }).join('')}</div>`;
      sh.body.innerHTML = html; sh.setTitle('Buzón');
    };
    const sh = openSheet('Buzón', '');
    render();
    sh.body.addEventListener('click', e => {
      const back = e.target.closest('[data-back]'); if (back) { render(); return; }
      const b = e.target.closest('[data-l]'); if (!b) return;
      const l = C.letters.find(x => x.id === b.dataset.l);
      if (!letterOpen(l) && !DEV) {
        if (l.unlock && dkey() < l.unlock) { const n = ddiff(dkey(), l.unlock); toast(`Todavía no. Se abre el ${fmtLong(l.unlock)} (faltan ${n} ${n === 1 ? 'día' : 'días'}).`); }
        return;
      }
      if (!S.letters[l.id]) notify('Abrió una carta', `«${l.title}»`, ['love_letter']);
      S.letters[l.id] = 1; save(); refreshDots();
      sh.setTitle(l.tag || 'Carta');
      sh.body.innerHTML = `<button class="btn small back" data-back type="button">← Volver al buzón</button>
        <article class="letter"><h4>${esc(l.title)}</h4>${l.body.split(/\n\s*\n/).map(p => `<p>${esc(p).replace(/\n/g, '<br>')}</p>`).join('')}</article>`;
      sh.body.scrollTop = 0;
      if (l.id === 'cumple') confetti(60, .5, .2);
    });
  }

  function openVouchers() {
    markSeen('vouchers');
    const render = () => {
      sh.body.innerHTML = `<p class="note" style="margin:0 2px 12px">Cada vale se puede canjear una vez. Al tocar «Canjear» te llega el aviso a mí por WhatsApp. Tú mandas.</p>` +
        C.vouchers.map(v => {
          const used = S.vouchers[v.id];
          return `<div class="voucher ${used ? 'used' : ''}"><span class="em">${v.emoji}</span>
            <div><h4>${esc(v.title)}</h4><p>${esc(v.text)}</p>
            ${used ? `<span class="used-mark">Canjeado</span>` : `<button class="btn small" data-v="${v.id}" type="button">Canjear</button>`}</div></div>`;
        }).join('');
    };
    const sh = openSheet('Vales', ''); render();
    sh.body.addEventListener('click', e => {
      const b = e.target.closest('[data-v]'); if (!b) return;
      if (!b.dataset.sure) { b.dataset.sure = 1; b.textContent = '¿Seguro? Toca otra vez'; setTimeout(() => { if (b.isConnected) { delete b.dataset.sure; b.textContent = 'Canjear'; } }, 3500); return; }
      const v = C.vouchers.find(x => x.id === b.dataset.v);
      S.vouchers[v.id] = Date.now(); save(); confetti(70, .5, .5);
      notify('Canjeó un vale', `${v.emoji} ${v.title}`, ['ticket']);
      window.open(waLink(`Canjeo mi vale: «${v.title}» 🎟️🐹`), '_blank', 'noopener');
      render();
    });
  }

  function openCine() {
    markSeen('cine');
    const cine = C.cine || {};
    if (!cine.src) {
      openSheet(cine.title || 'Cine', `
        <div class="soon-box">
          <img class="sticker" src="assets/capi-top.png" alt="">
          <h4>Sala en preparación</h4>
          <p>La película especial se está terminando de montar. ${esc(cine.note || '')}</p>
          <p class="muted">Vuelve pronto: el capibara ya reservó las palomitas.</p>
        </div>`);
      return;
    }
    const sh = openSheet(cine.title || 'Cine', `
      <div class="cinema" id="cinema"><video id="cineVid" controls playsinline preload="metadata" ${cine.poster ? `poster="${cine.poster}"` : ''} src="${cine.src}"></video><i class="cur l"></i><i class="cur r"></i></div>
      <p class="credits"><b>${esc(cine.title || 'Función especial')}.</b> ${esc(cine.note || '')}</p>
      <div class="row" style="margin-top:8px"><button class="btn small alt" id="cineAgain" type="button">Verla otra vez</button></div>`);
    setTimeout(() => { const c = $('#cinema'); if (c) c.classList.add('open'); }, 200);
    sh.body.addEventListener('click', e => { if (e.target.id === 'cineAgain') { const v = $('#cineVid'); v.currentTime = 0; v.play(); } });
  }

  let installEvt = null;
  addEventListener('beforeinstallprompt', e => { e.preventDefault(); installEvt = e; });
  function openInfo() {
    const n = Object.keys(S.eggs).length;
    const sh = openSheet('Sobre este regalo', `
      <p class="note">Esto es un mundo para ti. Vuelve cuando quieras: el capibara cambia de humor, el paisaje sigue tu hora real y cada día 20 se abre algo nuevo en el buzón.</p>
      <ul class="info-list note">
        <li><b>Llévalo en tu celular:</b> en iPhone (Safari) toca Compartir → «Añadir a pantalla de inicio». En Android (Chrome) abre el menú ⋮ → «Instalar app».</li>
        <li><b>Secretos escondidos:</b> ${n}/3 descubiertos. Pista: toca, mira arriba y mira cuando anochece.</li>
        <li><b>Un secreto a voces:</b> el capibara le cuenta a Javier lo que escribas, elijas y canjees aquí (tus fotos y tu ubicación no).</li>
        <li><b>Me has visitado</b> ${S.visits.length} ${S.visits.length === 1 ? 'día' : 'días'}.</li>
      </ul>
      <div class="row" style="margin:12px 0">
        ${installEvt ? '<button class="btn small" id="doInstall" type="button">Instalar en este equipo</button>' : ''}
        <a class="btn small alt" target="_blank" rel="noopener" href="${waLink('Vi el Capyverso. Tengo un comentario, tonto: ')}">Escribirle a Javier</a>
      </div>
      <p class="muted">Hecho a mano, con más cariño que sueño.</p>
      <p class="muted"><button id="doReset" type="button" style="text-decoration:underline">Volver a empezar</button></p>`);
    sh.body.addEventListener('click', async e => {
      if (e.target.id === 'doInstall' && installEvt) { installEvt.prompt(); installEvt = null; closeSheet(); }
      if (e.target.id === 'doReset') { if (confirm('¿Borrar tu progreso y volver a la adopción?')) { try { localStorage.removeItem(KEY); } catch {} location.href = location.pathname; } }
    });
  }
  $('#actInfo').addEventListener('click', openInfo);

  /* ---------- despacho de objetos ---------- */
  const ctx = { get S() { return S; }, notify, save, cfg, C, openSheet, closeSheet, toast, confetti, now, hourNow, dkey, norm, esc, waLink, markSeen, DEV, fmtLong };
  window.Capy = ctx;
  $$('.obj').forEach(o => o.addEventListener('click', () => {
    const k = o.dataset.open;
    if (k === 'sky') { markSeen('sky'); window.openSky && window.openSky(ctx); }
    else if (k === 'radio') openRadio();
    else if (k === 'booth') { markSeen('booth'); window.openBooth && window.openBooth(ctx); }
    else if (k === 'cine') openCine();
    else if (k === 'mail') openMail();
    else if (k === 'vouchers') openVouchers();
    else if (k === 'map') { markSeen('map'); window.openMap && window.openMap(ctx); }
    else if (k === 'cake') { markSeen('cake'); window.openCake && window.openCake(ctx); }
  }));
  document.addEventListener('visibilitychange', () => { if (!document.hidden && !$('#world').hidden) { setTheme(timeClass()); applySleep(); renderMood(); refreshDots(); } });

  /* ---------- arranque ---------- */
  document.title = 'Capyverso';
  flush();
  if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost')) {
    addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
  }
  if (S.adopted) enterWorld(false); else startGate();
})();
