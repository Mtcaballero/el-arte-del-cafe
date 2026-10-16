/* Precio del café en vivo: llena cada bloque [data-precio-cafe] con el contrato C de arábica.
   Pide /api/precio-cafe al cargar y luego cada 5 minutos mientras la pestaña está visible. */
(function () {
  var bloques = document.querySelectorAll('[data-precio-cafe]');
  if (!bloques.length) return;
  var num = new Intl.NumberFormat('es', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  var hora = new Intl.DateTimeFormat('es', { dateStyle: 'medium', timeStyle: 'short' });

  function poner(b, campo, texto) {
    var el = b.querySelector('[data-campo="' + campo + '"]');
    if (el) el.textContent = texto;
  }

  function pintar(d) {
    Array.prototype.forEach.call(bloques, function (b) {
      b.removeAttribute('aria-busy');
      if (!d || !d.ok) {
        b.classList.add('precio-error');
        poner(b, 'principal', 'No disponible');
        poner(b, 'nota', 'No pudimos cargar el precio. Vuelve a intentarlo en unos minutos.');
        return;
      }
      b.classList.remove('precio-error');
      poner(b, 'principal', num.format(d.centavosPorLibra) + ' ¢/lb');
      poner(b, 'quintal', 'US$ ' + num.format(d.dolaresPorQuintal));
      poner(b, 'kilo', 'US$ ' + num.format(d.dolaresPorKilo));
      if (d.cambio !== null) {
        var sube = d.cambio >= 0;
        var c = b.querySelector('[data-campo="cambio"]');
        if (c) {
          c.textContent = (sube ? '▲ +' : '▼ ') + num.format(d.cambio) + ' (' + (sube ? '+' : '') + num.format(d.cambioPorcentaje) + ' %) desde el cierre anterior';
          c.classList.toggle('baja', !sube);
        }
      }
      poner(b, 'nota', 'Actualizado ' + (d.hora ? hora.format(new Date(d.hora)) : '') + '. ' + d.bolsa + ', ' + d.contrato + '. Fuente: ' + d.fuente + '.');
    });
  }

  function cargar() {
    fetch('/api/precio-cafe', { headers: { Accept: 'application/json' } })
      .then(function (r) { return r.json(); })
      .then(pintar)
      .catch(function () { pintar(null); });
  }

  cargar();
  setInterval(function () { if (!document.hidden) cargar(); }, 300000);
})();
