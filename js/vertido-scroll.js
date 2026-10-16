/* Fondo de las páginas de Regiones: el chorro de café baja desde el gotero V60 a medida que lees
   y, al llegar al final del artículo, cae en la taza y la llena. */
(function () {
  var capa = document.querySelector('.rg-vertido-fondo');
  if (!capa) return;
  var reducido = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reducido) {
    capa.style.setProperty('--p', 1);
    capa.style.setProperty('--lleno', 1);
    return;
  }
  var pista = capa.querySelector('.rg-vf-pista');
  var pendiente = false;

  function medir() {
    pendiente = false;
    var r = pista.getBoundingClientRect();
    // La punta del chorro va a la altura de lectura (60 % de la pantalla); al llegar a la taza, la llena.
    var lectura = window.innerHeight * 0.6;
    var p = r.height > 0 ? (lectura - r.top) / r.height : 1;
    p = Math.max(0, Math.min(1, p));
    var lleno = Math.max(0, Math.min(1, (lectura - r.bottom) / 160));
    capa.style.setProperty('--p', p.toFixed(4));
    capa.style.setProperty('--lleno', lleno.toFixed(3));
    capa.classList.toggle('rg-vf-servido', lleno >= 1);
  }

  function pedir() {
    if (!pendiente) { pendiente = true; requestAnimationFrame(medir); }
  }

  window.addEventListener('scroll', pedir, { passive: true });
  window.addEventListener('resize', pedir);
  medir();
})();
