/* Páginas de país (diseño editorial): el sifón de vidrio se vacía de arriba hacia abajo a medida que lees,
   y la barra de secciones marca en qué parte de la página estás. */
(function () {
  var cuerpo = document.querySelector('.rv-cuerpo');
  var sifon = document.querySelector('.rv-sifon');
  if (!cuerpo || !sifon) return;
  var pct = sifon.querySelector('.rv-sf-pct');
  var reducido = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var pendiente = false;

  function medir() {
    pendiente = false;
    var r = cuerpo.getBoundingClientRect();
    var alto = window.innerHeight;
    var recorrido = r.height - alto * 0.5;
    var p = recorrido > 0 ? (alto * 0.5 - r.top) / recorrido : 1;
    p = Math.max(0, Math.min(1, p));
    sifon.style.setProperty('--p', p.toFixed(4));
    sifon.classList.toggle('rv-sf-fluye', !reducido && p > 0.01 && p < 0.99);
    sifon.classList.toggle('rv-sf-visible', r.top < alto * 0.7 && r.bottom > alto * 0.3);
    if (pct) pct.textContent = Math.round(p * 100);
  }

  function pedir() {
    if (!pendiente) { pendiente = true; requestAnimationFrame(medir); }
  }

  window.addEventListener('scroll', pedir, { passive: true });
  window.addEventListener('resize', pedir);
  medir();

  // Barra de secciones: resalta la sección visible.
  var enlaces = {};
  Array.prototype.forEach.call(document.querySelectorAll('.rv-nav a'), function (a) {
    enlaces[a.getAttribute('href').slice(1)] = a;
  });
  if (!('IntersectionObserver' in window)) return;
  var obs = new IntersectionObserver(function (entradas) {
    entradas.forEach(function (e) {
      if (!e.isIntersecting) return;
      Object.keys(enlaces).forEach(function (id) {
        var activo = id === e.target.id;
        enlaces[id].classList.toggle('activo', activo);
        if (activo) enlaces[id].setAttribute('aria-current', 'true'); else enlaces[id].removeAttribute('aria-current');
      });
      var a = enlaces[e.target.id];
      if (a && a.scrollIntoView && a.parentNode.parentNode.scrollWidth > a.parentNode.parentNode.clientWidth) {
        a.parentNode.parentNode.scrollTo({ left: a.offsetLeft - 20, behavior: reducido ? 'auto' : 'smooth' });
      }
    });
  }, { rootMargin: '-35% 0px -60% 0px' });
  Object.keys(enlaces).forEach(function (id) {
    var s = document.getElementById(id);
    if (s) obs.observe(s);
  });
})();
