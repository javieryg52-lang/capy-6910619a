/* Capyverso · Pastel: sopla las velas (micrófono o toque) y sella un deseo hasta el próximo cumpleaños */
(() => {
  'use strict';
  const XS = [58, 88, 120, 152, 182];
  const cakeSvg = n => {
    const cs = XS.slice(0, Math.min(n, 5));
    return `<svg class="cakesvg" viewBox="0 0 240 230" role="img" aria-label="Pastel con velas">
      <ellipse cx="120" cy="212" rx="106" ry="12" fill="rgba(0,0,0,.18)"/>
      <ellipse cx="120" cy="200" rx="102" ry="14" fill="#f6e9d0" stroke="#5a3820" stroke-width="3"/>
      <path d="M32 200 V124 a10 10 0 0 1 10 -10 H198 a10 10 0 0 1 10 10 V200 a88 12 0 0 1 -176 0z" fill="#c98a55" stroke="#5a3820" stroke-width="3" stroke-linejoin="round"/>
      <path d="M32 150 H208" stroke="#5a3820" stroke-width="3" opacity=".25"/>
      <path d="M30 124 a10 10 0 0 1 10 -12 H200 a10 10 0 0 1 10 12 v14 q-8 12 -16 0 q-8 16 -18 0 q-8 12 -16 0 q-9 18 -20 0 q-8 12 -16 0 q-9 16 -20 0 q-8 12 -16 0 q-9 14 -18 0 q-8 12 -16 0z" fill="#fbf3e4" stroke="#5a3820" stroke-width="3" stroke-linejoin="round"/>
      <circle cx="70" cy="176" r="5" fill="#f2a6a1"/><circle cx="120" cy="184" r="5" fill="#f2a6a1"/><circle cx="170" cy="176" r="5" fill="#f2a6a1"/>
      ${cs.map((x, i) => `
        <g class="cndl" data-c="${i}">
          <rect x="${x - 5}" y="72" width="10" height="42" rx="3" fill="${['#f2a6a1', '#9fd3ee', '#f6c56b', '#a6c98a', '#e9a6e0'][i % 5]}" stroke="#5a3820" stroke-width="2.5"/>
          <path d="M${x - 5} 84 l10 6 M${x - 5} 96 l10 6" stroke="#fff" stroke-width="2.5" opacity=".7"/>
          <g class="flame" style="transform-origin:${x}px 70px"><path d="M${x} 42 c8 10 8 18 0 28 c-8 -10 -8 -18 0 -28z" fill="#ffd25e" stroke="#e08a4a" stroke-width="2"/><ellipse cx="${x}" cy="62" rx="3" ry="5" fill="#fff6c9"/></g>
          <path class="smoke" d="M${x} 66 q-6 -10 0 -18 q6 -8 0 -18" fill="none" stroke="#ddd" stroke-width="3" stroke-linecap="round"/>
        </g>`).join('')}
    </svg>`;
  };

  async function listen(onLevel) {
    const s = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false } });
    const AC = window.AudioContext || window.webkitAudioContext, ac = new AC(), src = ac.createMediaStreamSource(s), an = ac.createAnalyser();
    an.fftSize = 1024; src.connect(an); const buf = new Uint8Array(an.fftSize); let stop = false;
    (function loop() {
      if (stop) return; an.getByteTimeDomainData(buf); let sum = 0;
      for (const v of buf) { const x = (v - 128) / 128; sum += x * x; }
      onLevel(Math.sqrt(sum / buf.length)); requestAnimationFrame(loop);
    })();
    return () => { stop = true; s.getTracks().forEach(t => t.stop()); try { ac.close(); } catch {} };
  }

  function openCake(cap) {
    const cfg = cap.C.cake, n = cfg.candles;
    let stopMic = null, alive = true;
    const sh = cap.openSheet('Pastel', '', { onClose: () => { alive = false; if (stopMic) stopMic(); } });
    const S = () => cap.S;
    const $ = q => sh.body.querySelector(q);

    function viewLit() {
      sh.body.innerHTML = `<div class="cakebox">${cakeSvg(n)}
        <p class="note" style="text-align:center;margin:8px 0 4px"><b>Pide un deseo.</b> Y sopla las velas: acerca la boca al celular (usa el micrófono) o toca el botón.</p>
        <div class="row"><button class="btn" id="cMic" type="button">Soplar con el micrófono</button><button class="btn alt small" id="cTap" type="button">Toque para soplar</button></div>
        <p class="muted" id="cMsg" style="text-align:center;margin:8px 0 0"></p></div>`;
      const cnd = [...sh.body.querySelectorAll('.cndl')]; let out = 0, breath = 0;
      const snuff = () => {
        const c = cnd.find(x => !x.classList.contains('out')); if (!c) return;
        c.classList.add('out'); out++;
        if (out >= n) { cap.notify('Apagó todas las velas', 'Está por pedir su deseo', ['candle']); if (stopMic) { stopMic(); stopMic = null; } setTimeout(() => done(), 900); }
      };
      $('#cTap').addEventListener('click', () => { if (out < n) { snuff(); if (out < n) setTimeout(snuff, 220); } });
      cnd.forEach(c => c.addEventListener('click', snuff));
      $('#cMic').addEventListener('click', async () => {
        const msg = $('#cMsg');
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) { msg.textContent = 'Este navegador no deja usar el micrófono. Usa el botón de toque.'; return; }
        try {
          msg.textContent = 'Escuchando… sopla fuerte, como si de verdad hubiera fuego.';
          stopMic = await listen(rms => { if (!alive) return; breath += rms > .09 ? 1 : -.6; if (breath < 0) breath = 0; if (breath > 9) { breath = 0; snuff(); } });
          if (!alive && stopMic) stopMic();
        } catch { msg.textContent = 'No pude usar el micrófono (¿permiso denegado?). Usa el botón de toque.'; }
      });
    }
    function done() {
      if (!alive) return; cap.confetti(180, .5, .4);
      const s = S();
      sh.body.innerHTML = `<div class="cakebox">${cakeSvg(n).replace(/class="cndl"/g, 'class="cndl out"')}
        <h4 class="wishh">¡Deseo pedido!</h4>
        <p class="note" style="text-align:center;margin:0 0 10px">Escríbelo aquí. Se guarda <b>sellado</b> en tu celular hasta tu próximo cumpleaños (${cap.fmtLong(cfg.sealUntil)} de ${cfg.sealUntil.slice(0, 4)}). El capibara me avisa lo que dice, para que yo intente cumplirlo.</p>
        <textarea id="wish" rows="3" maxlength="240" placeholder="Mi deseo es…" aria-label="Tu deseo"></textarea>
        <div class="row" style="margin-top:10px"><button class="btn" id="wSeal" type="button">Sellar deseo</button></div></div>`;
      $('#wSeal').onclick = () => {
        const t = $('#wish').value.trim(); if (!t) { cap.toast('Escribe algo, aunque sea chiquito.'); return; }
        s.wish = { text: t, date: cap.dkey() }; cap.save(); cap.notify('Selló su deseo', t, ['birthday']); cap.confetti(60, .5, .6); viewSealed();
      };
    }
    function viewSealed() {
      const w = S().wish, open = cap.dkey() >= cfg.sealUntil || cap.DEV;
      sh.body.innerHTML = `<div class="cakebox soon-box"><img class="sticker" src="assets/capi-top.png" alt="" style="width:120px">
        ${open ? `<h4>Tu deseo del ${w.date.slice(0, 4)}</h4><p class="letter" style="font-family:var(--font-h);font-size:1.5rem;line-height:1.3;text-align:center">${cap.esc(w.text)}</p>`
               : `<h4>Deseo sellado</h4><p>Está guardado. Se abre el <b>${cap.fmtLong(cfg.sealUntil)} de ${cfg.sealUntil.slice(0, 4)}</b>. El capibara ya le avisó a Javier, así que hay alguien intentando cumplirlo.</p>`}
        <div class="row" style="margin-top:10px">
          <a class="btn small" target="_blank" rel="noopener" href="${cap.waLink(open ? `Mi deseo del ${w.date.slice(0, 4)} era: ${w.text} 🎂🐹` : 'Sobre mi deseo del Capyverso 🎂🐹: ')}">${open ? 'Contárselo a Javier' : 'Escribirle a Javier'}</a>
          <button class="btn alt small" id="cAgain" type="button">Encender velas otra vez</button></div></div>`;
      $('#cAgain').onclick = viewLit;
    }
    S().wish ? viewSealed() : viewLit();
  }
  window.openCake = openCake;
})();
