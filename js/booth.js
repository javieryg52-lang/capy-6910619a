/* Capyverso · Cabina de fotos con retos, marcos y capibaras */
(() => {
  'use strict';
  const STICKERS = [
    { id: 'left',  src: 'assets/capi-left.png',  label: 'Gorro' },
    { id: 'top',   src: 'assets/capi-top.png',   label: 'Corona' },
    { id: 'right', src: 'assets/capi-right.png', label: 'Pastel' }
  ];
  const FRAMES = [
    { id: 'cream', bg: '#fbf3e4', fg: '#5a3820' },
    { id: 'olive', bg: '#6e6b2f', fg: '#fbf3e4' },
    { id: 'blush', bg: '#f2a6a1', fg: '#5a3820' },
    { id: 'night', bg: '#15203a', fg: '#fbf3e4' }
  ];
  const imgs = {};
  STICKERS.forEach(s => { const i = new Image(); i.src = s.src; imgs[s.id] = i; });
  const sleep = ms => new Promise(r => setTimeout(r, ms));

  function openBooth(cap) {
    let stream = null, alive = true, busy = false;
    const prompts = cap.C.boothPrompts || [];
    const st = { sticker: 'top', frame: 'cream', mode: 'strip' };
    const defCaption = () => { const d = cap.now(); return `${cap.cfg.herName} · ${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}.${d.getFullYear()}`; };
    const sh = cap.openSheet('Cabina', `
      <div class="booth">
        <details class="guide" ${cap.S.seen.boothGuide ? '' : 'open'}>
          <summary>Cómo funciona</summary>
          <ol>
            <li>Elige el modo: <b>Tira de 4</b> (cuatro fotos con un reto cada una) o <b>Polaroid</b> (una sola).</li>
            <li>Escoge tu capibara y el color del marco. Escribe el texto que irá al pie.</li>
            <li>Toca <b>Tomar fotos</b> y permite la cámara. Verás el reto, y luego una cuenta de 3 segundos.</li>
            <li>Al final puedes <b>compartirla</b> por WhatsApp, descargarla o repetir.</li>
          </ol>
          <p class="muted"><b>Ideas:</b> hacer el <i>reto a distancia</i> (cada uno se toma la tira con los mismos 4 retos y se las manda; gana la más tonta); una polaroid cada día 20 para armar una colección; o una polaroid de cumpleaños para guardar.</p>
        </details>
        <div class="cam" id="cam"><video id="camV" autoplay playsinline muted></video><img class="ov sticker" id="camOv" alt="" src="assets/capi-top.png"><div class="cprompt" id="camPr"></div><div class="cd" id="camCd"></div><div class="flash" id="camFl"></div></div>
        <div class="pills" id="modeRow"><button class="pill on" data-m="strip" type="button">Tira de 4</button><button class="pill" data-m="polaroid" type="button">Polaroid</button></div>
        <div>
          <p class="muted" style="margin:0 0 6px">Capibara y marco:</p>
          <div class="pickrow" id="stRow">${STICKERS.map(s => `<button class="pick ${s.id === st.sticker ? 'on' : ''}" data-s="${s.id}" type="button" aria-label="${s.label}"><img src="${s.src}" alt=""></button>`).join('')}<button class="pick" data-s="none" type="button" aria-label="Sin capibara"><span style="font-size:.75rem;font-weight:800">Sin</span></button>
          <span style="width:8px"></span>${FRAMES.map(f => `<button class="swatch ${f.id === st.frame ? 'on' : ''}" data-f="${f.id}" type="button" style="background:${f.bg}" aria-label="Marco ${f.id}"></button>`).join('')}</div>
        </div>
        <input type="text" id="caption" maxlength="30" value="${defCaption()}" aria-label="Texto al pie de la foto">
        <div class="row"><button class="btn" id="bStart" type="button">Tomar fotos</button>
          <label class="btn alt small" style="cursor:pointer">Usar fotos mías<input id="bFile" type="file" accept="image/*" multiple hidden></label></div>
        <p class="muted" id="camMsg" style="text-align:center;margin:0">Las fotos se quedan en tu celular, no se suben a ningún lado.</p>
      </div>`, { onClose: () => { alive = false; if (stream) stream.getTracks().forEach(t => t.stop()); } });
    cap.S.seen.boothGuide = 1; cap.save();
    const $ = s => sh.body.querySelector(s);
    const vid = $('#camV'), msg = $('#camMsg');

    async function startCam() {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) { msg.textContent = 'Este navegador no deja usar la cámara. Puedes usar fotos tuyas.'; $('#bStart').disabled = true; return; }
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 1280 } }, audio: false });
        if (!alive) { stream.getTracks().forEach(t => t.stop()); return; }
        vid.srcObject = stream;
      } catch { msg.textContent = 'No pude abrir la cámara (¿permiso denegado?). Puedes usar fotos tuyas.'; $('#bStart').disabled = true; }
    }
    startCam();

    sh.body.addEventListener('click', e => {
      const s = e.target.closest('[data-s]'), f = e.target.closest('[data-f]'), m = e.target.closest('[data-m]');
      if (s) { st.sticker = s.dataset.s; sh.body.querySelectorAll('[data-s]').forEach(b => b.classList.toggle('on', b === s)); const ov = $('#camOv'); if (st.sticker === 'none') ov.style.display = 'none'; else { ov.style.display = ''; ov.src = imgs[st.sticker].src; } }
      if (f) { st.frame = f.dataset.f; sh.body.querySelectorAll('[data-f]').forEach(b => b.classList.toggle('on', b === f)); }
      if (m) { st.mode = m.dataset.m; sh.body.querySelectorAll('[data-m]').forEach(b => b.classList.toggle('on', b === m)); $('#bStart').textContent = st.mode === 'strip' ? 'Tomar 4 fotos' : 'Tomar polaroid'; }
    });
    $('#bStart').textContent = 'Tomar 4 fotos';

    function grabFrame() {
      const c = document.createElement('canvas'), n = 720; c.width = c.height = n; const x = c.getContext('2d');
      const vw = vid.videoWidth, vh = vid.videoHeight, m = Math.min(vw, vh);
      x.translate(n, 0); x.scale(-1, 1); x.drawImage(vid, (vw - m) / 2, (vh - m) / 2, m, m, 0, 0, n, n);
      return c;
    }
    $('#bStart').addEventListener('click', async () => {
      if (busy || !vid.videoWidth) return; busy = true; const shots = [];
      const cd = $('#camCd'), fl = $('#camFl'), pr = $('#camPr'); $('#bStart').disabled = true;
      $('#cam').scrollIntoView({ block: 'center', behavior: 'smooth' });
      const total = st.mode === 'strip' ? 4 : 1;
      for (let i = 0; i < total; i++) {
        msg.textContent = total > 1 ? `Foto ${i + 1} de ${total}` : 'Prepárate…';
        pr.textContent = total > 1 ? (prompts[i] || '¡Sonríe!') : '¡Tu mejor cara!'; pr.classList.add('on'); await sleep(2200); if (!alive) return;
        for (let n = 3; n >= 1; n--) { cd.textContent = n; await sleep(900); if (!alive) return; }
        cd.textContent = ''; pr.classList.remove('on'); fl.classList.remove('go'); void fl.offsetWidth; fl.classList.add('go');
        shots.push(grabFrame()); await sleep(600); if (!alive) return;
      }
      busy = false; await compose(shots);
    });
    $('#bFile').addEventListener('change', async e => {
      const files = [...e.target.files].slice(0, st.mode === 'strip' ? 4 : 1); if (!files.length) return;
      const shots = [];
      for (const f of files) {
        const bmp = await createImageBitmap(f).catch(() => null); if (!bmp) continue;
        const c = document.createElement('canvas'); c.width = c.height = 720; const m = Math.min(bmp.width, bmp.height);
        c.getContext('2d').drawImage(bmp, (bmp.width - m) / 2, (bmp.height - m) / 2, m, m, 0, 0, 720, 720); shots.push(c);
      }
      if (shots.length) compose(shots);
    });

    async function compose(shots) {
      try { await document.fonts.load('700 60px Caveat'); await document.fonts.load('700 30px Fraunces'); } catch {}
      const fr = FRAMES.find(f => f.id === st.frame), caption = ($('#caption').value.trim() || defCaption()), n = shots.length;
      const polaroid = n === 1;
      const PW = polaroid ? 520 : 480, PAD = polaroid ? 40 : 36, TOP = polaroid ? 40 : 96, FOOT = polaroid ? 170 : 170;
      const W = PW + PAD * 2, Hh = TOP + n * PW + (n - 1) * 24 + FOOT;
      const c = document.createElement('canvas'); c.width = W; c.height = Hh; const x = c.getContext('2d');
      x.fillStyle = fr.bg; x.fillRect(0, 0, W, Hh);
      x.fillStyle = fr.fg; x.textAlign = 'center';
      if (!polaroid) { x.font = '700 34px Fraunces, serif'; x.fillText('CAPYVERSO', W / 2, 62); }
      shots.forEach((s, i) => {
        const y = TOP + i * (PW + 24); x.save(); x.shadowColor = 'rgba(0,0,0,.25)'; x.shadowBlur = 12; x.shadowOffsetY = 4; x.fillStyle = '#fff'; x.fillRect(PAD - 5, y - 5, PW + 10, PW + 10); x.restore();
        x.drawImage(s, PAD, y, PW, PW);
        if (st.sticker !== 'none') { const im = imgs[st.sticker], w = PW * (polaroid ? .4 : .34), h = w * im.height / im.width, k = i % 2 ? -1 : 1; x.save(); x.translate(PAD + PW - w / 2 - 6, y + PW - h / 2 - 6); x.rotate(k * .09); x.drawImage(im, -w / 2, -h / 2, w, h); x.restore(); }
      });
      x.fillStyle = fr.fg; x.font = '700 64px Caveat, cursive'; x.fillText(caption, W / 2, Hh - 84);
      x.font = '600 22px Nunito, sans-serif'; x.globalAlpha = .75; x.fillText('un capibara estuvo aquí', W / 2, Hh - 40); x.globalAlpha = 1;
      const url = c.toDataURL('image/png');
      sh.body.innerHTML = `<div class="booth"><img class="strip-out" src="${url}" alt="Tu foto">
        <div class="row"><button class="btn" id="bShare" type="button">Compartir</button><button class="btn alt" id="bDl" type="button">Descargar</button><button class="btn small" id="bAgain" type="button">Otra vez</button></div>
        <p class="muted" style="text-align:center;margin:0">Mándamela por WhatsApp: prometo enmarcarla (en digital).</p></div>`;
      sh.body.querySelector('#bDl').onclick = () => { const a = document.createElement('a'); a.href = url; a.download = 'capyverso-fotos.png'; a.click(); };
      sh.body.querySelector('#bShare').onclick = async () => {
        const blob = await new Promise(r => c.toBlob(r, 'image/png')); const file = new File([blob], 'capyverso-fotos.png', { type: 'image/png' });
        if (navigator.canShare && navigator.canShare({ files: [file] })) { try { await navigator.share({ files: [file], text: 'Desde el Capyverso 🐹' }); } catch {} }
        else { sh.body.querySelector('#bDl').click(); cap.toast('Se descargó la imagen: envíala desde tu galería.'); }
      };
      sh.body.querySelector('#bAgain').onclick = () => { if (stream) stream.getTracks().forEach(t => t.stop()); openBooth(cap); };
      cap.confetti(40, .5, .3);
    }
  }
  window.openBooth = openBooth;
})();
