/* Capyverso · Cielo: mapa estelar real para una fecha, hora y lugar */
(() => {
  'use strict';
  const RAD = Math.PI / 180;
  const mod = (a, n) => ((a % n) + n) % n;

  /* ---- astronomía (fórmulas de baja precisión, suficientes para un cielo bonito y correcto) ---- */
  const julian = d => d.getTime() / 864e5 + 2440587.5;
  function lst(jd, lon) { return mod(280.46061837 + 360.98564736629 * (jd - 2451545.0) + lon, 360); }
  function altaz(ra, dec, lstDeg, lat) {
    const H = (lstDeg - ra) * RAD, d = dec * RAD, f = lat * RAD;
    const sinAlt = Math.sin(d) * Math.sin(f) + Math.cos(d) * Math.cos(f) * Math.cos(H);
    const alt = Math.asin(sinAlt);
    const az = Math.atan2(-Math.cos(d) * Math.sin(H), Math.sin(d) * Math.cos(f) - Math.cos(d) * Math.cos(H) * Math.sin(f));
    return { alt: alt / RAD, az: mod(az / RAD, 360) };
  }
  function sunPos(jd) {
    const n = jd - 2451545.0, L = mod(280.460 + 0.9856474 * n, 360), g = mod(357.528 + 0.9856003 * n, 360) * RAD;
    const lam = (L + 1.915 * Math.sin(g) + 0.020 * Math.sin(2 * g)) * RAD, eps = (23.439 - 4e-7 * n) * RAD;
    return { ra: mod(Math.atan2(Math.cos(eps) * Math.sin(lam), Math.cos(lam)) / RAD, 360), dec: Math.asin(Math.sin(eps) * Math.sin(lam)) / RAD, lam: lam / RAD };
  }
  function moonPos(jd) {
    const T = (jd - 2451545.0) / 36525, s = (a, b) => Math.sin((a + b * T) * RAD);
    const lam = 218.32 + 481267.881 * T + 6.29 * s(135.0, 477198.87) - 1.27 * s(259.3, -413335.36) + 0.66 * s(235.7, 890534.22) + 0.21 * s(269.9, 954397.74) - 0.19 * s(357.5, 35999.05) - 0.11 * s(186.5, 966404.03);
    const bet = 5.13 * s(93.3, 483202.02) + 0.28 * s(228.2, 960400.89) - 0.28 * s(318.3, 6003.15) - 0.17 * s(217.6, -407332.21);
    const l = Math.cos(bet * RAD) * Math.cos(lam * RAD), m = 0.9175 * Math.cos(bet * RAD) * Math.sin(lam * RAD) - 0.3978 * Math.sin(bet * RAD), n = 0.3978 * Math.cos(bet * RAD) * Math.sin(lam * RAD) + 0.9175 * Math.sin(bet * RAD);
    return { ra: mod(Math.atan2(m, l) / RAD, 360), dec: Math.asin(n) / RAD, lam: mod(lam, 360) };
  }
  function moonPhase(jd) {
    const el = mod(moonPos(jd).lam - sunPos(jd).lam, 360), k = (1 - Math.cos(el * RAD)) / 2;
    const names = [[22.5, 'luna nueva'], [67.5, 'luna creciente'], [112.5, 'cuarto creciente'], [157.5, 'gibosa creciente'], [202.5, 'luna llena'], [247.5, 'gibosa menguante'], [292.5, 'cuarto menguante'], [337.5, 'luna menguante'], [361, 'luna nueva']];
    return { k, name: names.find(n => el < n[0])[1], el };
  }
  /* B-V → color */
  function starColor(ci) {
    if (ci < 0) return [155, 176, 255]; if (ci < .3) return [215, 225, 255]; if (ci < .6) return [255, 248, 235];
    if (ci < .9) return [255, 232, 180]; if (ci < 1.3) return [255, 205, 150]; return [255, 165, 130];
  }
  const ES_NAMES = { Sirius: 'Sirio', Canopus: 'Canopo', Arcturus: 'Arturo', Rigil: 'Rigil Kent', Vega: 'Vega', Capella: 'Capella', Rigel: 'Rigel', Procyon: 'Proción', Betelgeuse: 'Betelgeuse', Achernar: 'Achernar', Hadar: 'Hadar', Altair: 'Altair', Acrux: 'Acrux', Aldebaran: 'Aldebarán', Antares: 'Antares', Spica: 'Espiga', Pollux: 'Pólux', Fomalhaut: 'Fomalhaut', Deneb: 'Deneb', Mimosa: 'Mimosa', Regulus: 'Régulo' };

  /* zona horaria: desfase (horas) de una zona IANA en un instante */
  function tzOffsetH(tz, utc) {
    const f = new Intl.DateTimeFormat('en-US', { timeZone: tz, hourCycle: 'h23', year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric' });
    const p = Object.fromEntries(f.formatToParts(utc).map(x => [x.type, x.value]));
    return (Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second) - Math.floor(utc.getTime() / 1000) * 1000) / 3600e3;
  }
  function localToUtc(iso, hour, place) {
    const [y, m, d] = iso.split('-').map(Number), base = Date.UTC(y, m - 1, d) + hour * 3600e3;
    if (!place.tz) return new Date(base - Math.round(place.lon / 15) * 3600e3);
    let utc = base - tzOffsetH(place.tz, new Date(base)) * 3600e3;
    utc = base - tzOffsetH(place.tz, new Date(utc)) * 3600e3;
    return new Date(utc);
  }

  function openSky(cap) {
    const cfg = cap.cfg.sky;
    const d = window.SKYDATA;
    if (!d) { cap.toast('El cielo todavía se está despertando. Prueba en un segundo.'); return; }
    const stars = d.s, byHip = new Map(); stars.forEach((s, i) => { if (s[4]) byHip.set(s[4], i); });
    const segs = d.l.map(([a, b]) => [byHip.get(a), byHip.get(b)]).filter(x => x[0] !== undefined && x[1] !== undefined);

    const sh = cap.openSheet('Cielo', `
      <div class="sky-wrap"><canvas id="skyCv" aria-label="Mapa del cielo"></canvas><div id="starCard"></div><div id="placePrompt" class="place-prompt" hidden></div></div>
      <div class="sky-ui">
        <div class="pills" id="datePills"></div>
        <label class="hour"><span id="hourLbl">21:00</span><input type="range" id="hourSl" min="0" max="23.5" step="0.5" value="21" aria-label="Hora local"></label>
        <p class="sky-info" id="skyInfo"></p>
        <div class="row" id="placeRow" style="justify-content:flex-start"></div>
      </div>`, { full: true, dark: true, onClose: () => { alive = false; } });
    let alive = true;
    const $ = q => sh.body.querySelector(q);
    const cv = $('#skyCv'), ctx = cv.getContext('2d');
    const state = { di: 0, hour: cfg.dates[0].hour, sel: -1, geoPlace: null };
    const todayIso = cap.dkey();
    const isoOf = i => cfg.dates[i].iso === 'today' ? todayIso : cfg.dates[i].iso;
    const placeFor = i => { const dd = cfg.dates[i]; return dd.place || (dd.chooser ? cap.S.bdayPlace : state.geoPlace) || null; };

    const dp = $('#datePills');
    dp.innerHTML = cfg.dates.map((x, i) => `<button class="pill" data-d="${i}" type="button">${x.label}</button>`).join('');
    const sl = $('#hourSl'), hl = $('#hourLbl');
    const fmtH = h => `${String(Math.floor(h)).padStart(2, '0')}:${h % 1 ? '30' : '00'}`;
    function syncUI() { dp.querySelectorAll('.pill').forEach((b, i) => b.classList.toggle('on', i === state.di)); sl.value = state.hour; hl.textContent = fmtH(state.hour); }
    dp.addEventListener('click', e => { const b = e.target.closest('[data-d]'); if (!b) return; state.di = +b.dataset.d; state.hour = cfg.dates[state.di].hour; state.sel = -1; $('#starCard').innerHTML = ''; syncUI(); compute(); });
    sl.addEventListener('input', () => { state.hour = +sl.value; syncUI(); compute(); });

    /* ---- elegir lugar (buscador + ubicación) ---- */
    const prompt = $('#placePrompt');
    function setPlace(pl) { if (cfg.dates[state.di].chooser) { cap.S.bdayPlace = pl; cap.save(); cap.notify('Eligió su lugar de cumpleaños', `${pl.name}\nhttps://www.google.com/maps?q=${pl.lat},${pl.lon}`, ['round_pushpin']); } else state.geoPlace = pl; state.sel = -1; compute(); }
    async function tzFor(lat, lon) {
      try { const r = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m&timezone=auto`); return (await r.json()).timezone || null; } catch { return null; }
    }
    function renderPrompt() {
      const dd = cfg.dates[state.di];
      prompt.innerHTML = `<div class="pp-card"><h4>${dd.chooser ? '¿Dónde te gustaría pasar tu cumpleaños?' : 'Tu cielo de esta noche'}</h4>
        <p>${dd.chooser ? 'Busca un lugar bonito: una ciudad, una playa, un lago, un mirador… Verás el cielo que tendrías ahí esa noche.' : 'Usa tu ubicación o busca un lugar para ver su cielo.'}</p>
        <form id="ppForm" class="pp-form"><input type="text" id="ppQ" placeholder="Ej.: Cusco, Máncora, Cabo Polonio…" maxlength="60" autocomplete="off"><button class="btn small" type="submit">Buscar</button></form>
        <button class="btn small alt" id="ppGeo" type="button">Usar mi ubicación</button>
        <div id="ppRes" class="pp-res" role="status"></div></div>`;
      const res = prompt.querySelector('#ppRes');
      prompt.querySelector('#ppForm').addEventListener('submit', async e => {
        e.preventDefault(); const q = prompt.querySelector('#ppQ').value.trim(); if (!q) return;
        res.textContent = 'Buscando…';
        try {
          const r = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=jsonv2&limit=5&accept-language=es`); const j = await r.json();
          if (!j.length) { res.textContent = 'No encontré ese lugar. Prueba con otro nombre o una ciudad cercana.'; return; }
          res.innerHTML = j.map((x, i) => `<button type="button" class="pp-opt" data-i="${i}">${cap.esc(x.display_name.split(',').slice(0, 2).join(',').trim())}<small>${cap.esc(x.display_name.split(',').slice(-1)[0].trim())}</small></button>`).join('');
          res.onclick = async ev => {
            const b = ev.target.closest('[data-i]'); if (!b) return; const x = j[+b.dataset.i]; res.textContent = 'Cargando su cielo…';
            const lat = +x.lat, lon = +x.lon; const tz = await tzFor(lat, lon);
            setPlace({ name: x.display_name.split(',').slice(0, 2).join(',').trim(), lat, lon, tz });
          };
        } catch { res.textContent = 'No pude buscar ahora (¿sin internet?). Prueba «Usar mi ubicación».'; }
      });
      prompt.querySelector('#ppGeo').addEventListener('click', () => {
        if (!navigator.geolocation) { res.textContent = 'Este navegador no da la ubicación. Usa el buscador.'; return; }
        res.textContent = 'Pidiendo tu ubicación…';
        navigator.geolocation.getCurrentPosition(pos => setPlace({ name: 'Tu ubicación', lat: pos.coords.latitude, lon: pos.coords.longitude, tz: Intl.DateTimeFormat().resolvedOptions().timeZone }),
          () => { res.textContent = 'No pude obtenerla (permiso denegado). Usa el buscador.'; }, { timeout: 10000 });
      });
    }
    function renderPlaceRow() {
      const dd = cfg.dates[state.di], pl = placeFor(state.di), row = $('#placeRow');
      let h = '';
      if (dd.place && dd.place.link) h += `<a class="pill" target="_blank" rel="noopener" href="${dd.place.link}">Ver el lugar en Maps</a>`;
      if (!dd.place && pl) {
        h += `<button class="pill" id="chgPlace" type="button">Cambiar lugar</button>`;
        if (dd.chooser) h += `<a class="pill on" target="_blank" rel="noopener" href="${cap.waLink(`Quiero pasar mi cumpleaños bajo el cielo de ${pl.name} 🌌🐹`)}">Proponérselo a Javier</a>`;
      }
      row.innerHTML = h;
      const c = row.querySelector('#chgPlace'); if (c) c.onclick = () => { if (dd.chooser) delete cap.S.bdayPlace; else state.geoPlace = null; compute(); };
    }

    let W = 0, H = 0, R = 0, cx0 = 0, cy0 = 0, dpr = 1;
    function resize() {
      const r = cv.getBoundingClientRect(); dpr = devicePixelRatio || 1;
      W = r.width; H = r.height; cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      R = Math.min(W, H) / 2 - 26; cx0 = W / 2; cy0 = H / 2; compute();
    }
    new ResizeObserver(resize).observe(cv);

    let proj = [], sunP = null, moonP = null, sunAlt = -30, moonInfo = null, night = 1, hasPlace = false;
    const project = (alt, az) => { const r = (90 - alt) / 90 * R; return { x: cx0 - r * Math.sin(az * RAD), y: cy0 - r * Math.cos(az * RAD) }; };
    function compute() {
      const dd = cfg.dates[state.di], pl = placeFor(state.di);
      hasPlace = !!pl;
      prompt.hidden = hasPlace; if (!hasPlace) renderPrompt();
      renderPlaceRow();
      const place = pl || cfg.dates[0].place;
      const utc = localToUtc(isoOf(state.di), state.hour, place);
      const jd = julian(utc), L = lst(jd, place.lon);
      proj = stars.map((s, i) => { const p = altaz(s[0], s[1], L, place.lat); return p.alt > -1 ? { i, ...p, ...project(p.alt, p.az) } : null; });
      const sp = sunPos(jd), sa = altaz(sp.ra, sp.dec, L, place.lat); sunAlt = sa.alt; sunP = { ...sa, ...project(sa.alt, sa.az) };
      const mp = moonPos(jd), ma = altaz(mp.ra, mp.dec, L, place.lat); moonP = { ...ma, ...project(ma.alt, ma.az) };
      moonInfo = moonPhase(jd);
      night = Math.min(1, Math.max(0, (-sunAlt + 2) / 14)); // 0 día · 1 noche cerrada
      const pct = Math.min(99, Math.round(moonInfo.k * 100));
      $('#skyInfo').innerHTML = hasPlace
        ? `<b>${dd.label}</b> · ${fmtH(state.hour)} · ${cap.esc(place.name)}<br>${dd.chooser ? 'Así se vería el cielo la noche de tu cumpleaños.' : dd.note} ` +
          (moonP.alt > 0 ? `Luna: ${moonInfo.name}, ${pct}% iluminada.` : `Luna bajo el horizonte (${moonInfo.name}, ${pct}%).`) + (sunAlt > -6 ? ' <i>Todavía hay luz del sol.</i>' : '')
        : `<b>${dd.label}</b><br>${dd.note}`;
    }

    /* estrellas fugaces */
    let shoot = null, nextShoot = performance.now() + 4000;
    function draw(t) {
      if (!alive) return;
      requestAnimationFrame(draw);
      if (!W) return;
      ctx.clearRect(0, 0, W, H);
      // fondo: cielo con luz según el sol
      const day = [90, 160, 215], twi = [190, 110, 90], nightC = [9, 12, 28];
      const mix = (a, b, k) => a.map((v, i) => Math.round(v + (b[i] - v) * k));
      let col = night > .55 ? mix([28, 34, 70], nightC, (night - .55) / .45) : night > .25 ? mix(twi, [28, 34, 70], (night - .25) / .3) : mix(day, twi, night / .25);
      const g = ctx.createRadialGradient(cx0, cy0, R * .1, cx0, cy0, R * 1.02);
      g.addColorStop(0, `rgb(${col[0]},${col[1]},${col[2]})`); g.addColorStop(1, `rgb(${Math.max(0, col[0] - 12)},${Math.max(0, col[1] - 8)},${Math.min(255, col[2] + 4)})`);
      ctx.fillStyle = '#05070f'; ctx.fillRect(0, 0, W, H);
      ctx.beginPath(); ctx.arc(cx0, cy0, R, 0, 7); ctx.fillStyle = g; ctx.fill();
      ctx.save(); ctx.beginPath(); ctx.arc(cx0, cy0, R, 0, 7); ctx.clip();
      const vis = Math.min(1, night * 1.5 + .05);
      // constelaciones
      ctx.strokeStyle = `rgba(190,205,255,${.22 * vis})`; ctx.lineWidth = 1; ctx.beginPath();
      for (const [a, b] of segs) { const pa = proj[a], pb = proj[b]; if (pa && pb && pa.alt > 0 && pb.alt > 0) { ctx.moveTo(pa.x, pa.y); ctx.lineTo(pb.x, pb.y); } }
      ctx.stroke();
      // estrellas
      for (const p of proj) {
        if (!p || p.alt < 0) continue; const s = stars[p.i], mag = s[2];
        const fade = Math.min(1, (p.alt + 1) / 8); const bright = Math.max(0, Math.min(1, (6.2 - mag) / 5));
        let a = Math.min(1, vis * (.35 + bright * .9)) * fade; if (mag > 4.2 && night < .5) a *= night * 2;
        if (a <= .02) continue;
        const tw = mag < 3.2 ? 1 + .12 * Math.sin(t / 380 + p.i) : 1, r = Math.max(.55, (5.9 - mag) * .55) * tw;
        const c = starColor(s[3]);
        if (mag < 2.3) { const gr = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r * 4); gr.addColorStop(0, `rgba(${c},${.4 * a})`); gr.addColorStop(1, `rgba(${c},0)`); ctx.fillStyle = gr; ctx.beginPath(); ctx.arc(p.x, p.y, r * 4, 0, 7); ctx.fill(); }
        ctx.fillStyle = `rgba(${c[0]},${c[1]},${c[2]},${a})`; ctx.beginPath(); ctx.arc(p.x, p.y, r, 0, 7); ctx.fill();
        if (vis > .4 && mag < 1.6 && s[5]) { ctx.fillStyle = `rgba(255,248,232,${.6 * vis})`; ctx.font = '11px Nunito,sans-serif'; ctx.fillText(cap.S.stars[s[4]] || ES_NAMES[s[5]] || s[5], p.x + r + 4, p.y + 3); }
        else if (s[4] && cap.S.stars[s[4]]) { ctx.fillStyle = 'rgba(246,197,107,.95)'; ctx.font = '12px Nunito,sans-serif'; ctx.fillText(cap.S.stars[s[4]], p.x + r + 5, p.y + 3); }
      }
      // sol
      if (sunP && sunP.alt > -2) { const gr = ctx.createRadialGradient(sunP.x, sunP.y, 0, sunP.x, sunP.y, 40); gr.addColorStop(0, 'rgba(255,240,170,.95)'); gr.addColorStop(.3, 'rgba(255,200,90,.5)'); gr.addColorStop(1, 'rgba(255,190,90,0)'); ctx.fillStyle = gr; ctx.beginPath(); ctx.arc(sunP.x, sunP.y, 40, 0, 7); ctx.fill(); }
      // luna con fase
      if (moonP && moonP.alt > -1) drawMoon(ctx, moonP, sunP, moonInfo, Math.max(.3, Math.min(1, (moonP.alt + 1) / 6)));
      // estrella fugaz
      if (t > nextShoot && night > .7) { const a = Math.random() * Math.PI * 2; shoot = { x: cx0 + Math.cos(a) * R * .6, y: cy0 + Math.sin(a) * R * .6, vx: -4 - Math.random() * 3, vy: 2 + Math.random() * 2, life: 0 }; nextShoot = t + 6000 + Math.random() * 9000; }
      if (shoot) { shoot.x += shoot.vx; shoot.y += shoot.vy; shoot.life++; const al = 1 - shoot.life / 30; if (al <= 0) shoot = null; else { const gr = ctx.createLinearGradient(shoot.x, shoot.y, shoot.x - shoot.vx * 9, shoot.y - shoot.vy * 9); gr.addColorStop(0, `rgba(255,255,255,${al})`); gr.addColorStop(1, 'rgba(255,255,255,0)'); ctx.strokeStyle = gr; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(shoot.x, shoot.y); ctx.lineTo(shoot.x - shoot.vx * 9, shoot.y - shoot.vy * 9); ctx.stroke(); } }
      // selección
      if (state.sel >= 0 && proj[state.sel]) { const p = proj[state.sel]; ctx.strokeStyle = '#f6c56b'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(p.x, p.y, 11 + Math.sin(t / 220) * 1.5, 0, 7); ctx.stroke(); }
      ctx.restore();
      // horizonte
      ctx.strokeStyle = 'rgba(246,233,208,.5)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(cx0, cy0, R, 0, 7); ctx.stroke();
      ctx.fillStyle = 'rgba(246,233,208,.9)'; ctx.font = '700 13px Nunito,sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      [['N', 0], ['E', 90], ['S', 180], ['O', 270]].forEach(([l, az]) => { const p = project(-13, az); ctx.fillText(l, p.x, p.y); });
      ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
    }
    function drawMoon(c, m, s, info, alpha) {
      const r = Math.max(11, R * .045);
      c.save(); c.translate(m.x, m.y); c.globalAlpha = alpha;
      const gl = c.createRadialGradient(0, 0, r * .8, 0, 0, r * 3.4); gl.addColorStop(0, `rgba(255,244,200,${.28 * Math.max(.2, info.k)})`); gl.addColorStop(1, 'rgba(255,244,200,0)'); c.fillStyle = gl; c.beginPath(); c.arc(0, 0, r * 3.4, 0, 7); c.fill();
      const ang = s ? Math.atan2(s.y - m.y, s.x - m.x) : 0; c.rotate(ang);
      c.fillStyle = 'rgba(70,74,96,.95)'; c.beginPath(); c.arc(0, 0, r, 0, 7); c.fill();
      // parte iluminada: semicírculo hacia el sol + elipse del terminador
      const k = info.k, waxingSide = 1, tx = r * (1 - 2 * k);
      c.fillStyle = '#f7efd0'; c.beginPath(); c.arc(0, 0, r, -Math.PI / 2, Math.PI / 2, false);
      c.ellipse(0, 0, Math.abs(tx), r, 0, Math.PI / 2, -Math.PI / 2, tx > 0 ? true : false); c.closePath(); c.fill();
      void waxingSide; c.restore();
    }
    requestAnimationFrame(draw);

    /* toque: elegir estrella cercana */
    const card = sh.body.querySelector('#starCard');
    cv.addEventListener('click', e => {
      const r = cv.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
      let best = -1, bd = 26 * 26;
      proj.forEach((p, i) => { if (!p || p.alt < 2 || stars[i][2] > 4.6) return; const dd = (p.x - x) ** 2 + (p.y - y) ** 2 - (5 - stars[i][2]) * 5; if (dd < bd) { bd = dd; best = i; } });
      if (best < 0) { state.sel = -1; card.innerHTML = ''; return; }
      state.sel = best; const s = stars[best];
      const nm = s[4] && cap.S.stars[s[4]];
      const label = nm || ES_NAMES[s[5]] || s[5] || (s[4] ? `Estrella HIP ${s[4]}` : 'Estrella sin nombre');
      if (!s[4]) { card.innerHTML = `<div class="starcard"><span><b>${cap.esc(label)}</b> · brillo ${s[2].toFixed(1)}</span><button class="x" type="button" data-cs aria-label="Cerrar">✕</button></div>`; return; }
      card.innerHTML = `<div class="starcard"><span style="flex-basis:100%"><b>${cap.esc(label)}</b> · brillo ${s[2].toFixed(1)}. ${nm ? 'Ya tiene nombre tuyo.' : 'Esta puede ser tuya.'}</span>
        <input type="text" id="starName" maxlength="20" placeholder="Ponle un nombre" value="${cap.esc(nm || '')}"><button class="btn small" id="starSave" type="button">Guardar</button><button class="x" type="button" data-cs aria-label="Cerrar">✕</button></div>`;
    });
    card.addEventListener('click', e => {
      if (e.target.closest('[data-cs]')) { card.innerHTML = ''; state.sel = -1; }
      if (e.target.id === 'starSave') {
        const v = card.querySelector('#starName').value.trim(), hip = stars[state.sel][4];
        if (v) { cap.S.stars[hip] = v; cap.notify('Bautizó una estrella', `«${v}»`, ['star']); cap.toast(`Estrella bautizada: ${v}`); cap.confetti(30, .5, .3); } else delete cap.S.stars[hip];
        cap.save(); card.innerHTML = ''; state.sel = -1;
      }
    });
    syncUI(); resize();
  }
  window.openSky = openSky;
  window.__sky = { julian, lst, altaz, sunPos, moonPos, moonPhase, tzOffsetH, localToUtc };
})();
