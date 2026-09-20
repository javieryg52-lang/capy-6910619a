/* Capyverso · Mapa de nuestra historia: pines de capibara + Street View de cada lugar */
(() => {
  'use strict';
  const LEAFLET_JS = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js';
  const LEAFLET_CSS = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css';
  let loading = null;
  function loadLeaflet() {
    if (window.L) return Promise.resolve();
    if (loading) return loading;
    loading = new Promise((ok, fail) => {
      const l = document.createElement('link'); l.rel = 'stylesheet'; l.href = LEAFLET_CSS; document.head.appendChild(l);
      const s = document.createElement('script'); s.src = LEAFLET_JS; s.onload = ok; s.onerror = () => { loading = null; fail(); }; document.head.appendChild(s);
    });
    return loading;
  }
  const svUrl = p => p.view === 'map'
    ? `https://maps.google.com/maps?q=${p.lat},${p.lon}&z=18&t=k&output=embed`
    : p.pano
    ? `https://www.google.com/maps/embed?pb=!4v1!6m8!1m7!1s${p.pano.id}!2m2!1d${p.lat}!2d${p.lon}!3f${p.pano.yaw}!4f${p.pano.pitch}!5f0.7820865974627469`
    : `https://maps.google.com/maps?layer=c&cbll=${p.lat},${p.lon}&cbp=12,0,0,0,0&output=svembed`;

  async function openMap(cap) {
    const places = cap.C.places;
    let map = null;
    const sh = cap.openSheet('Mapa', `
      <div class="mapx">
        <div id="mapCv" class="mapcv"><p class="muted" style="padding:20px;text-align:center">Desplegando el mapa…</p></div>
        <div class="mapcard" id="mapCard"></div>
      </div>`, { full: true, onClose: () => { if (map) { map.remove(); map = null; } } });
    try { await loadLeaflet(); } catch { sh.body.querySelector('#mapCv').innerHTML = '<p class="muted" style="padding:20px;text-align:center">No pude cargar el mapa (¿sin internet?). Aun así puedes ver cada lugar abajo.</p>'; }
    const card = sh.body.querySelector('#mapCard'); if (!card) return;
    const L = window.L;
    let cur = 0, markers = [];
    if (L) {
      sh.body.querySelector('#mapCv').innerHTML = '';
      map = L.map(sh.body.querySelector('#mapCv'), { zoomControl: false, attributionControl: true });
      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '© OpenStreetMap' }).addTo(map);
      L.control.zoom({ position: 'topright' }).addTo(map);
      markers = places.map((p, i) => {
        const icon = L.divIcon({ className: 'pin-wrap', iconSize: [46, 54], iconAnchor: [23, 50], html: `<div class="pin ${p.star ? 'star' : ''}"><img style="width:46px;height:auto" src="assets/capi-${['left', 'top', 'right'][i % 3]}.png" alt=""></div>` });
        return L.marker([p.lat, p.lon], { icon, title: p.title }).addTo(map).on('click', () => show(i, true));
      });
      map.fitBounds(L.latLngBounds(places.map(p => [p.lat, p.lon])), { padding: [40, 40], maxZoom: 15 });
      setTimeout(() => map && map.invalidateSize(), 120);
    }
    function show(i, fly) {
      cur = (i + places.length) % places.length; const p = places[cur];
      card.innerHTML = `
        <div class="sv"><iframe title="Street View: ${cap.esc(p.title)}" src="${svUrl(p)}" loading="lazy" allowfullscreen referrerpolicy="no-referrer-when-downgrade"></iframe></div>
        <div class="mc-body">
          <div class="mc-nav"><button class="pill navb" data-n="-1" type="button" aria-label="Anterior">◀</button><span class="muted">${cur + 1} de ${places.length}</span><button class="pill navb" data-n="1" type="button" aria-label="Siguiente">▶</button></div>
          <h4>${p.star ? '✦ ' : ''}${cap.esc(p.title)}</h4>
          ${p.text ? `<p>${cap.esc(p.text)}</p>` : ''}
          <a class="btn small" target="_blank" rel="noopener" href="${p.link}">Abrir en Google Maps</a>
        </div>`;
      markers.forEach((m, k) => m.getElement() && m.getElement().classList.toggle('sel', k === cur));
      if (map && fly) map.flyTo([p.lat, p.lon], 16, { duration: 1.1 });
    }
    card.addEventListener('click', e => { const b = e.target.closest('[data-n]'); if (b) show(cur + +b.dataset.n, true); });
    show(0, false);
  }
  window.openMap = openMap;
})();
