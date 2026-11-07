/* Capyverso · Jugar: minijuegos que suben el ánimo (nunca la salud) */
(() => {
  'use strict';
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const pick = a => a[Math.floor(Math.random() * a.length)];
  const EMO = ['🍉', '🎈', '🌙', '✨', '🎵', '🪲'];
  const PADS = [{ e: '🍉', c: '#f2a6a1' }, { e: '🌙', c: '#9fd3ee' }, { e: '✨', c: '#f6c56b' }, { e: '🎵', c: '#a6c98a' }];

  function openMemory(cap, sh) {
    const deck = [...EMO, ...EMO].map((e, i) => ({ e, i })).sort(() => Math.random() - .5);
    let first = null, lock = false, found = 0, moves = 0;
    const $ = q => sh.body.querySelector(q);
    sh.body.innerHTML = `<p class="muted" style="text-align:center;margin:0 0 10px">Encuentra las parejas.</p>
      <div class="memo-grid" id="memoGrid">${deck.map((c, i) => `<button class="memo-card" data-i="${i}" type="button"><span class="back">?</span><span class="front">${c.e}</span></button>`).join('')}</div>
      <p class="muted" id="memoMoves" style="text-align:center;margin-top:10px">Intentos: 0</p>`;
    $('#memoGrid').addEventListener('click', e => {
      const b = e.target.closest('.memo-card'); if (!b || lock || b.classList.contains('up')) return;
      b.classList.add('up');
      if (!first) { first = b; return; }
      moves++; $('#memoMoves').textContent = `Intentos: ${moves}`;
      const a = deck[+first.dataset.i], z = deck[+b.dataset.i];
      if (first !== b && a.e === z.e) {
        first.classList.add('matched'); b.classList.add('matched'); first = null; found++;
        if (found === EMO.length) { cap.bumpMood(2); cap.noteGame(); cap.confetti(70, .5, .5); setTimeout(() => showWin(cap, sh, moves), 500); }
      } else {
        const f = first; lock = true;
        setTimeout(() => { f.classList.remove('up'); b.classList.remove('up'); lock = false; }, 700);
        first = null;
      }
    });
  }
  function showWin(cap, sh, moves) {
    sh.body.innerHTML = `<div class="soon-box"><img class="sticker" src="assets/capi-top.png" alt="" style="width:110px">
      <h4>¡Memoria perfecta!</h4><p>${cap.esc(pick(cap.C.play?.winLines || ['¡Ganamos!']))}</p>
      <p class="muted">Intentos: ${moves}</p>
      <div class="row" style="justify-content:center;margin-top:10px"><button class="btn small" id="pAgain" type="button">Otra vez</button><button class="btn small alt" id="pBack" type="button">Elegir otro juego</button></div></div>`;
    sh.body.querySelector('#pAgain').onclick = () => openMemory(cap, sh);
    sh.body.querySelector('#pBack').onclick = () => openPlay(cap, sh);
  }

  function openSimon(cap, sh) {
    const $ = q => sh.body.querySelector(q);
    let seq = [], idx = 0, playing = false;
    sh.body.innerHTML = `<p class="muted" style="text-align:center;margin:0 0 10px">Mira la secuencia y repítela.</p>
      <div class="simon-grid">${PADS.map((p, i) => `<button class="simon-pad" data-i="${i}" style="--c:${p.c}" type="button">${p.e}</button>`).join('')}</div>
      <p class="muted" id="simonMsg" style="text-align:center;margin-top:10px">Toca «Empezar» cuando quieras.</p>
      <div class="row" style="justify-content:center;margin-top:8px"><button class="btn small" id="simonStart" type="button">Empezar</button></div>`;
    const pads = [...sh.body.querySelectorAll('.simon-pad')];
    const msg = t => { $('#simonMsg').textContent = t; };
    async function flash(i) { pads[i].classList.add('on'); await sleep(360); pads[i].classList.remove('on'); await sleep(180); }
    async function playSeq() { playing = true; msg('Mira…'); for (const i of seq) await flash(i); playing = false; idx = 0; msg('Tu turno.'); }
    function next() { seq.push(Math.floor(Math.random() * 4)); playSeq(); }
    $('#simonStart').addEventListener('click', () => { seq = []; next(); });
    sh.body.addEventListener('click', e => {
      const b = e.target.closest('.simon-pad'); if (!b || playing || !seq.length) return;
      const i = +b.dataset.i; flash(i);
      if (i !== seq[idx]) {
        const got = seq.length - 1;
        msg(got >= 3 ? `Llegaste a ${got}. ¡Nada mal!` : 'Casi. Toca «Empezar» para otra ronda.');
        if (got >= 3) cap.bumpMood(1);
        seq = []; idx = 0; return;
      }
      idx++;
      if (idx === seq.length) {
        if (seq.length >= 5) { cap.bumpMood(2); cap.noteGame(); cap.confetti(50, .5, .5); msg(`¡${seq.length} seguidas! Memoria de capibara.`); }
        setTimeout(next, 700);
      }
    });
  }

  function openPlay(cap) {
    const sh = cap.openSheet('Jugar', `
      <p class="muted" style="text-align:center;margin:0 0 14px">Elige a qué jugar.</p>
      <div class="row" style="justify-content:center"><button class="btn" id="pMemo" type="button">Memorama</button><button class="btn alt" id="pSimon" type="button">Simón dice</button></div>
      <p class="muted" style="text-align:center;margin-top:14px">Pronto: atrapa la sandía y salta el estanque.</p>`);
    sh.body.addEventListener('click', e => {
      if (e.target.id === 'pMemo') openMemory(cap, sh);
      if (e.target.id === 'pSimon') openSimon(cap, sh);
    });
  }
  window.openPlay = openPlay;
})();
