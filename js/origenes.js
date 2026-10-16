/* Donde nace nuestro café: al tocar un país pequeño, ocupa una de las dos tarjetas grandes
   con una transición de café que se sirve, llena la tarjeta y se escurre para revelar el nuevo país. */
(function () {
  var PAISES = window.EADC_PAISES || [];
  var seccion = document.getElementById('origenes');
  if (!seccion || !PAISES.length) return;

  var porId = {};
  PAISES.forEach(function (c) { porId[c.id] = c; });
  var INICIALES = ['hn', 'gt'];
  var slots = INICIALES.slice();
  var siguiente = 1;
  var ocupado = false;
  var uid = 0;
  var reducido = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var tarjetas = Array.prototype.slice.call(seccion.querySelectorAll('article.entra'), 0, 2);
  var primerMini = seccion.querySelector('button.mini');
  if (tarjetas.length < 2 || !primerMini) return;
  var contMinis = primerMini.parentNode;

  // Cada tarjeta guarda su contenido en un envoltorio para poder cambiarlo sin tocar la capa del café.
  var contenidos = tarjetas.map(function (art) {
    art.style.position = 'relative';
    var envoltorio = document.createElement('div');
    while (art.firstChild) envoltorio.appendChild(art.firstChild);
    art.appendChild(envoltorio);
    return envoltorio;
  });

  // Botón para volver al inicio y aviso para lectores de pantalla.
  var filaVolver = document.createElement('div');
  filaVolver.style.cssText = 'display: flex; justify-content: flex-end; min-height: 52px; margin: 16px 0 0;';
  var volver = document.createElement('button');
  volver.type = 'button';
  volver.textContent = 'Volver a Honduras y Guatemala';
  volver.hidden = true;
  volver.style.cssText = "min-height: 48px; padding: 0 22px; border-radius: 999px; border: 1.5px solid #1C1A2E; background: transparent; color: #1C1A2E; font-family: 'Figtree', sans-serif; font-size: 16px; font-weight: 600; cursor: pointer;";
  filaVolver.appendChild(volver);
  tarjetas[0].parentNode.parentNode.insertBefore(filaVolver, tarjetas[0].parentNode.nextSibling);
  var aviso = document.createElement('p');
  aviso.setAttribute('aria-live', 'polite');
  aviso.style.cssText = 'position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0);';
  seccion.appendChild(aviso);

  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function bordado(c, k) {
    var id = 'bordado-' + k;
    return '<svg width="100%" height="16" style="display: block;" aria-hidden="true"><defs><pattern id="' + id + '" width="48" height="32" patternUnits="userSpaceOnUse" patternTransform="scale(0.5)"><rect width="48" height="32" fill="' + c.bg + '"></rect><polyline points="0,5 6,1 12,5 18,1 24,5 30,1 36,5 42,1 48,5" fill="none" stroke="#1FA3A0" stroke-width="2"></polyline><polyline points="0,27 6,31 12,27 18,31 24,27 30,31 36,27 42,31 48,27" fill="none" stroke="#1FA3A0" stroke-width="2"></polyline><polygon points="24,7 33,16 24,25 15,16" fill="#C8287A"></polygon><polygon points="24,11 29,16 24,21 19,16" fill="#F2B33D"></polygon><polygon points="0,10 6,16 0,22 -6,16" fill="#C62B36"></polygon><polygon points="48,10 54,16 48,22 42,16" fill="#C62B36"></polygon></pattern></defs><rect width="100%" height="16" fill="url(#' + id + ')"></rect></svg>';
  }

  function contenidoGrande(c) {
    var k = c.id + '-x' + (++uid);
    var regiones = c.regions.map(function (r) {
      return '<li style="padding: 6px 14px; border: 1px solid ' + c.chip + '; border-radius: 999px; font-size: 15px;">' + esc(r) + '</li>';
    }).join('');
    return '<div style="position: relative;">' +
      '<svg viewBox="0 0 600 300" preserveAspectRatio="xMidYMid slice" style="display: block; width: 100%; height: 300px;" role="img" aria-label="' + esc(c.label + ', ' + c.name) + '">' +
      '<defs><linearGradient id="cielo-' + k + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + c.sky1 + '"></stop><stop offset="0.62" stop-color="' + c.sky2 + '"></stop><stop offset="1" stop-color="' + c.sky3 + '"></stop></linearGradient>' +
      '<filter id="bruma-' + k + '" x="-20%" y="-100%" width="140%" height="300%"><feGaussianBlur stdDeviation="9"></feGaussianBlur></filter>' +
      '<filter id="brillo-' + k + '" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="14"></feGaussianBlur></filter>' +
      '<filter id="humo-' + k + '" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="3"></feGaussianBlur></filter></defs>' +
      '<rect width="600" height="300" fill="url(#cielo-' + k + ')"></rect>' +
      '<g class="sol"><circle cx="' + c.sunX + '" cy="' + c.sunY + '" r="48" fill="' + c.sunFill + '" opacity="0.55" filter="url(#brillo-' + k + ')"></circle><circle cx="' + c.sunX + '" cy="' + c.sunY + '" r="20" fill="' + c.sunFill + '"></circle></g>' +
      '<g class="asc-far"><path d="' + c.far + '" fill="' + c.farFill + '"></path><path d="' + c.farSnow + '" fill="#F4F6FB" opacity="0.92"></path></g>' +
      '<g class="bruma"><path d="' + c.mistA + '" fill="#FFFFFF" opacity="' + c.mistOp + '" filter="url(#bruma-' + k + ')"></path></g>' +
      '<g class="asc-mid"><path d="' + c.mid + '" fill="' + c.midFill + '"></path><path d="' + c.midShade + '" fill="#000000" opacity="0.2"></path><path d="' + c.midGully + '" fill="#FFFFFF" opacity="0.06"></path><path d="' + c.midSnow + '" fill="#F4F6FB" opacity="0.95"></path>' +
      '<path class="ruta" d="' + c.trail + '" fill="none" stroke="#F2B33D" stroke-width="2.4" stroke-linecap="round" stroke-dasharray="1 6"></path>' +
      '<g opacity="' + (c.plume ? 1 : 0) + '" transform="translate(' + c.plumeX + ',' + c.plumeY + ')" filter="url(#humo-' + k + ')"><circle class="humo" cx="3" cy="-5" r="6" fill="#DCD9EA"></circle><circle class="humo h2" cx="3" cy="-5" r="6" fill="#DCD9EA"></circle><circle class="humo h3" cx="3" cy="-5" r="6" fill="#DCD9EA"></circle></g>' +
      '<g class="cumbre"><circle class="pulso" cx="' + c.sumX + '" cy="' + c.sumY + '" r="9" fill="#C8287A"></circle><circle cx="' + c.sumX + '" cy="' + c.sumY + '" r="4.5" fill="#C8287A" stroke="#FFFFFF" stroke-width="1.6"></circle></g></g>' +
      '<g class="bruma b2"><path d="' + c.mistB + '" fill="#FFFFFF" opacity="' + c.mistOp + '" filter="url(#bruma-' + k + ')"></path></g>' +
      '<g class="asc-near"><path d="' + c.near + '" fill="' + c.nearFill + '"></path><path d="' + c.palms + '" fill="' + c.nearFill + '"></path></g>' +
      '<g class="asc-front"><path d="' + c.front + '" fill="' + c.frontFill + '"></path></g></svg>' +
      '<span style="position: absolute; left: 16px; bottom: 14px; display: inline-flex; align-items: center; gap: 8px; padding: 7px 14px; border-radius: 999px; background: rgba(20, 18, 36, 0.62); color: #FFFDF8; font-size: 14px; font-weight: 600;"><svg viewBox="0 0 16 16" style="width: 16px; height: 16px;" aria-hidden="true" fill="none" stroke="#F2B33D" stroke-width="1.6" stroke-linejoin="round"><path d="M1,14 L6,5 L9,10 L11,7 L15,14 Z"></path></svg>' + esc(c.label) + '</span></div>' +
      bordado(c, k) +
      '<div style="padding: 24px clamp(28px, 4vw, 44px) clamp(28px, 4vw, 44px);">' +
      '<h3 style="font-family: \'Young Serif\', Georgia, serif; font-weight: 400; font-size: 46px; line-height: 1.05; margin: 0 0 6px;">' + esc(c.name) + '</h3>' +
      '<p style="margin: 0 0 18px; font-size: 18px; font-weight: 600; color: #F2B33D;">' + esc(c.tagline) + '</p>' +
      '<p style="margin: 0 0 28px; font-size: 18px; line-height: 1.65; color: ' + c.muted + ';">' + esc(c.desc) + '</p>' +
      '<h4 style="margin: 0 0 12px; font-size: 15px; font-weight: 600; color: #FFFDF8;">Regiones cafetaleras</h4>' +
      '<ul style="list-style: none; margin: 0; padding: 0; display: flex; flex-wrap: wrap; gap: 8px;">' + regiones + '</ul></div>';
  }

  function mini(c) {
    var k = c.id + '-m' + (++uid);
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'mini';
    b.setAttribute('data-pais', c.id);
    b.setAttribute('aria-label', 'Ver ' + c.name + ' en grande');
    b.style.cssText = "flex: 1 1 210px; min-width: 0; padding: 0; border: none; border-radius: 20px; overflow: hidden; background: " + c.bg + "; color: #FFFDF8; text-align: left; cursor: pointer; font-family: 'Figtree', sans-serif; display: flex; flex-direction: column;";
    b.innerHTML = '<svg viewBox="0 0 600 300" preserveAspectRatio="xMidYMid slice" style="display: block; width: 100%; height: 112px;" aria-hidden="true">' +
      '<defs><linearGradient id="cielo-' + k + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + c.sky1 + '"></stop><stop offset="0.62" stop-color="' + c.sky2 + '"></stop><stop offset="1" stop-color="' + c.sky3 + '"></stop></linearGradient></defs>' +
      '<rect width="600" height="300" fill="url(#cielo-' + k + ')"></rect>' +
      '<circle cx="' + c.sunX + '" cy="' + c.sunY + '" r="20" fill="' + c.sunFill + '"></circle>' +
      '<path d="' + c.far + '" fill="' + c.farFill + '"></path><path d="' + c.farSnow + '" fill="#F4F6FB" opacity="0.92"></path>' +
      '<path d="' + c.mid + '" fill="' + c.midFill + '"></path><path d="' + c.midShade + '" fill="#000000" opacity="0.2"></path><path d="' + c.midSnow + '" fill="#F4F6FB" opacity="0.95"></path>' +
      '<path d="' + c.near + '" fill="' + c.nearFill + '"></path><path d="' + c.palms + '" fill="' + c.nearFill + '"></path>' +
      '<path d="' + c.front + '" fill="' + c.frontFill + '"></path></svg>' +
      '<span style="display: block; padding: 14px 16px 18px;"><span style="display: block; font-family: \'Young Serif\', Georgia, serif; font-size: 22px; line-height: 1.15;">' + esc(c.name) + '</span><span style="display: block; margin-top: 6px; font-size: 14px; line-height: 1.4; color: ' + c.muted + ';">' + esc(c.tagline) + '</span></span>';
    return b;
  }

  function pintarMinis() {
    contMinis.innerHTML = '';
    PAISES.forEach(function (c) {
      if (slots.indexOf(c.id) === -1) contMinis.appendChild(mini(c));
    });
    volver.hidden = slots[0] === INICIALES[0] && slots[1] === INICIALES[1];
  }

  // La capa del café: chorro, granos que caen, líquido con ola y el nombre del país con vapor.
  function capaCafe(c, alto) {
    var capa = document.createElement('div');
    capa.className = 'vertido';
    capa.setAttribute('aria-hidden', 'true');
    capa.style.setProperty('--caida', Math.round(alto * 0.55) + 'px');
    var granos = '';
    [14, 30, 47, 63, 80].forEach(function (x, i) {
      granos += '<svg class="grano" viewBox="0 0 20 28" style="left: ' + x + '%; animation-delay: ' + (i * 0.07 + (i % 2) * 0.05).toFixed(2) + 's;"><ellipse cx="10" cy="14" rx="8.5" ry="12.5" fill="#6B3A22"></ellipse><path d="M10,2.5 C5,9 15,19 10,25.5" fill="none" stroke="#2A160E" stroke-width="2" stroke-linecap="round"></path></svg>';
    });
    capa.innerHTML = '<div class="vertido-chorro"></div>' + granos +
      '<div class="vertido-liquido"><svg class="vertido-ola" viewBox="0 0 1200 40" preserveAspectRatio="none"><path d="M0,22 C100,6 200,6 300,22 C400,38 500,38 600,22 C700,6 800,6 900,22 C1000,38 1100,38 1200,22 L1200,40 L0,40 Z" fill="#9A6236"></path></svg></div>' +
      '<div class="vertido-titulo"><svg viewBox="0 0 120 60" class="vertido-vapor"><path class="vapor" d="M36,58 C26,44 46,36 36,20" fill="none" stroke="#FFFDF8" stroke-width="4" stroke-linecap="round" opacity="0.8"></path><path class="vapor v2" d="M60,58 C50,42 70,34 60,14" fill="none" stroke="#FFFDF8" stroke-width="4" stroke-linecap="round" opacity="0.8"></path><path class="vapor v3" d="M84,58 C74,44 94,36 84,20" fill="none" stroke="#FFFDF8" stroke-width="4" stroke-linecap="round" opacity="0.8"></path></svg>' +
      '<span class="vertido-nombre">' + esc(c.name) + '</span><span class="vertido-sub">' + esc(c.tagline) + '</span></div>';
    return capa;
  }

  function servir(i, id, listo) {
    var art = tarjetas[i];
    var c = porId[id];
    function cambiar() {
      art.style.background = c.bg;
      contenidos[i].innerHTML = contenidoGrande(c);
    }
    if (reducido) { cambiar(); listo(); return; }
    var capa = capaCafe(c, art.offsetHeight);
    art.appendChild(capa);
    void capa.offsetWidth;
    capa.classList.add('llena');
    setTimeout(cambiar, 900);
    setTimeout(function () { capa.classList.add('vacia'); }, 1600);
    setTimeout(function () { capa.remove(); listo(); }, 2650);
  }

  function mostrar(cambios, mensaje) {
    if (ocupado || !cambios.length) return;
    ocupado = true;
    cambios.forEach(function (x) { slots[x.i] = x.id; });
    pintarMinis();
    var objetivo = tarjetas[cambios[0].i];
    var r = objetivo.getBoundingClientRect();
    if (r.top < 0 || r.top > window.innerHeight * 0.5) {
      objetivo.scrollIntoView({ behavior: reducido ? 'auto' : 'smooth', block: 'start' });
    }
    var pendientes = cambios.length;
    cambios.forEach(function (x) {
      servir(x.i, x.id, function () { if (--pendientes === 0) ocupado = false; });
    });
    aviso.textContent = mensaje;
  }

  contMinis.addEventListener('click', function (e) {
    var b = e.target.closest('button.mini');
    if (!b || ocupado) return;
    var id = b.getAttribute('data-pais');
    if (!id) {
      var nombre = (b.getAttribute('aria-label') || '').replace(/^Ver /, '').replace(/ en grande$/, '');
      PAISES.forEach(function (c) { if (c.name === nombre) id = c.id; });
    }
    if (!porId[id]) return;
    var i = siguiente;
    siguiente = 1 - siguiente;
    mostrar([{ i: i, id: id }], 'Mostrando ' + porId[id].name + ' en grande');
  });

  volver.addEventListener('click', function () {
    var cambios = [];
    INICIALES.forEach(function (id, i) { if (slots[i] !== id) cambios.push({ i: i, id: id }); });
    siguiente = 1;
    mostrar(cambios, 'Mostrando Honduras y Guatemala');
  });
})();
