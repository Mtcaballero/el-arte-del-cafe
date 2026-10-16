// Plantilla editorial de página de país (diseño 2): secciones a todo el ancho, cifras grandes,
// capítulos, pasos, espacios para fotos y un sifón de vidrio que se vacía mientras lees.
// Se activa con "diseno": 2 y el bloque "v2" en data/regiones/<id>.json.
'use strict';

module.exports = function (h) {
  const { esc, cabeza, cabecera, piePagina, bordadoAncho, paisaje, precioWidget, migas, migasLd, EDITOR, SITIO, NOMBRE, HOY, ver, TODOS, tarjetaMini, FLECHA, EXTERNO, GRANO, TAZA, CHEMEX } = h;

  const NAV = [
    ['introduccion', 'Introducción'],
    ['historia', 'Historia'],
    ['produccion', 'Producción'],
    ['costo', 'Precio del grano'],
    ['organismos', 'Quién regula'],
    ['reconocidos', 'Cafés premiados']
  ];

  const CAMARA = '<svg viewBox="0 0 48 48" width="40" height="40" aria-hidden="true"><path d="M6,16 H14 L18,10 H30 L34,16 H42 V38 H6 Z" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linejoin="round"/><circle cx="24" cy="26" r="8" fill="none" stroke="currentColor" stroke-width="2.5"/></svg>';

  // Sifón de vidrio: la cámara de arriba empieza llena y el café baja a la esfera de abajo con el scroll.
  const SIFON = `<div class="rv-sifon" aria-hidden="true">
<svg viewBox="0 0 120 300">
<defs>
<clipPath id="rv-arriba"><path d="M31,14 H89 V78 C89,94 70,102 64,108 V114 H56 V108 C50,102 31,94 31,78 Z"/></clipPath>
<clipPath id="rv-abajo"><path d="M51,168 H69 V178 A40,40 0 1 1 51,178 Z"/></clipPath>
<linearGradient id="rv-cafe" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6B3A22"/><stop offset="1" stop-color="#24130C"/></linearGradient>
</defs>
<path d="M104,22 V286" stroke="#23305E" stroke-width="5" stroke-linecap="round"/>
<path d="M89,56 H104 M76,196 H104" stroke="#23305E" stroke-width="4" stroke-linecap="round"/>
<g clip-path="url(#rv-arriba)"><rect class="rv-sf-arriba" x="28" y="14" width="64" height="100" fill="url(#rv-cafe)"/><rect class="rv-sf-arriba" x="28" y="14" width="64" height="6" fill="#9A6236"/></g>
<g clip-path="url(#rv-abajo)"><rect class="rv-sf-abajo" x="18" y="168" width="84" height="100" fill="url(#rv-cafe)"/></g>
<path class="rv-sf-chorro" d="M60,108 V200" stroke="#3B2116" stroke-width="3.5" stroke-linecap="round" stroke-dasharray="6 5"/>
<path d="M31,14 H89 V78 C89,94 70,102 64,108 V176 H56 V108 C50,102 31,94 31,78 Z" fill="rgba(220,240,238,0.28)" stroke="#23305E" stroke-width="2.5" stroke-linejoin="round"/>
<path d="M51,168 H69 V178 A40,40 0 1 1 51,178 Z" fill="rgba(220,240,238,0.28)" stroke="#23305E" stroke-width="2.5" stroke-linejoin="round"/>
<path d="M27,8 H93 V14 H27 Z" fill="#23305E"/>
<path d="M38,22 V74 M40,190 C34,204 36,222 44,232" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round" opacity="0.7" fill="none"/>
<path d="M40,262 H80 L76,280 H44 Z" fill="#C8287A"/>
<path class="rv-sf-llama" d="M60,262 C52,254 56,246 60,240 C64,246 68,254 60,262 Z" fill="#F2B33D"/>
<path d="M12,288 H112" stroke="#23305E" stroke-width="6" stroke-linecap="round"/>
</svg>
<span class="rv-sf-texto">Leído <b class="rv-sf-pct">0</b> %</span>
</div>`;

  function foto(img, clase) {
    const i = img || {};
    if (i.src) return `<figure class="rv-foto ${clase || ''}"><img src="${esc(i.src)}" alt="${esc(i.alt)}" loading="lazy" decoding="async">${i.pie ? '<figcaption>' + esc(i.pie) + '</figcaption>' : ''}</figure>`;
    return `<figure class="rv-foto rv-foto-vacia ${clase || ''}" aria-hidden="true"><div>${CAMARA}<span>Espacio para foto</span><small>${esc(i.alt || '')}</small></div></figure>`;
  }

  function seccion(id, kicker, titulo, contenido, clase) {
    return `<section id="${id}" class="rv-seccion ${clase || ''}" aria-labelledby="h-${id}">
<div class="rv-in">
<p class="rv-kicker">${kicker}</p>
<h2 id="h-${id}">${titulo}</h2>
${contenido}
</div>
</section>`;
  }

  return function paginaPaisV2(c) {
    const v = c.v;
    const d = c.v2;
    const p = c.produccion || {};
    const ruta = '/regiones/' + c.slug;
    const comp = c.competencia || {};
    const titulo = `Café de ${c.nombre}: historia, producción y precio | ${NOMBRE}`;
    const rutaMigas = [['/', 'Inicio'], ['/regiones/', 'Regiones'], [ruta, c.nombre]];
    const org = {};
    (c.organismos || []).forEach((o) => { org[o.sigla || o.nombre] = o; });
    const faq = [
      { q: `¿Quién controla el precio del café en ${c.nombre}?`, a: c.quienControlaPrecio },
      { q: `¿Cómo se calcula el precio del café en ${c.nombre}?`, a: d.costoPasos.map((x) => x.texto).join(' ') + ' ' + d.costoTip },
      { q: `¿Cuánto café produce ${c.nombre}?`, a: p.volumen + '.' },
      { q: `¿Cuáles son las regiones cafetaleras de ${c.nombre}?`, a: d.regiones.map((r) => r.nombre).join(', ') + '.' }
    ].filter((x) => x.a);
    const jsonld = {
      '@context': 'https://schema.org',
      '@graph': [
        { '@type': 'Article', headline: `Café de ${c.nombre}: historia, producción y precio`, description: c.metaDescripcion, inLanguage: 'es', datePublished: HOY, dateModified: HOY, mainEntityOfPage: SITIO + ruta, author: EDITOR, publisher: EDITOR, about: { '@type': 'Country', name: c.nombre } },
        migasLd(rutaMigas),
        { '@type': 'FAQPage', mainEntity: faq.map((x) => ({ '@type': 'Question', name: x.q, acceptedAnswer: { '@type': 'Answer', text: x.a } })) }
      ]
    };
    const anios = [...new Set(d.ganadores.map((g) => g.anio))].sort().reverse();
    const otros = TODOS.filter((x) => x.id !== c.id);

    const intro = seccion('introduccion', 'Introducción al café de ' + esc(c.nombre), esc((d.titulos || {}).intro || 'Un café que nace en la montaña'), `
<div class="rv-intro">
<div class="rv-intro-texto">
<p class="rv-lead">${esc(d.lead)}</p>
${d.introduccion.map((t) => '<p>' + esc(t) + '</p>').join('\n')}
</div>
<dl class="rv-cifras">
${d.cifras.map((x) => `<div><dt>${esc(x.etiqueta)}</dt><dd>${esc(x.valor)}</dd>${x.nota ? '<span>' + esc(x.nota) + '</span>' : ''}</div>`).join('\n')}
</dl>
</div>
${foto(d.imagenes.paisaje, 'rv-foto-ancha')}
<blockquote class="rv-destacado"><p>${esc(d.destacado)}</p></blockquote>`);

    const historia = seccion('historia', 'Historia del café en ' + esc(c.nombre), esc((d.titulos || {}).historia || 'De cultivo de patio a orgullo nacional'), `
<div class="rv-capitulos">
${d.capitulos.map((k, i) => `<article class="rv-capitulo"><span class="rv-periodo">${esc(k.periodo)}</span><h3>${esc(k.titulo)}</h3><p>${esc(k.texto)}</p></article>${i === 1 ? foto(d.imagenes.historia, 'rv-foto-capitulo') : ''}`).join('\n')}
</div>
<h3 class="rv-subtitulo">Momentos que cambiaron todo</h3>
<ol class="rv-linea">
${(c.hitos || []).map((x) => `<li><span class="rv-linea-anio">${esc(x.anio)}</span><p>${esc(x.texto)}</p></li>`).join('\n')}
</ol>`, 'rv-alterna');

    const produccion = seccion('produccion', 'Producción de café en ' + esc(c.nombre), 'Así se cultiva el café ' + esc(d.gentilicio), `
<div class="rv-dos">
<div>
<h3 class="rv-subtitulo">Del cafetal a la taza</h3>
<ol class="rv-pasos">
${d.pasos.map((x, i) => `<li><span class="rv-paso-num">${i + 1}</span><div><h4>${esc(x.titulo)}</h4><p>${esc(x.texto)}</p></div></li>`).join('\n')}
</ol>
</div>
${foto(d.imagenes.cosecha, 'rv-foto-alta')}
</div>
<h3 class="rv-subtitulo">${esc(d.regionesTitulo || 'Regiones cafetaleras')}</h3>
<ul class="rv-regiones">
${d.regiones.map((r) => `<li><div class="rv-region-cab"><h4>${esc(r.nombre)}</h4>${r.altura ? '<span>' + esc(r.altura) + '</span>' : ''}</div><p>${esc(r.nota)}</p><ul class="rv-notas">${r.perfil.map((n) => '<li>' + esc(n) + '</li>').join('')}</ul></li>`).join('\n')}
</ul>
<div class="rv-variedades">
<div><h3 class="rv-subtitulo">Variedades</h3><p>${esc(d.variedadesTexto)}</p></div>
<div class="rv-grupos">${d.variedades.map((g) => `<div><h4>${esc(g.grupo)}</h4><ul class="rv-notas">${g.lista.map((n) => '<li>' + esc(n) + '</li>').join('')}</ul></div>`).join('')}</div>
</div>`);

    const costo = seccion('costo', 'Costo del grano de café', '¿Cuánto vale el café de ' + esc(c.nombre) + '?', `
<div class="rv-dos rv-dos-precio">
<div>${precioWidget(c.nombre)}</div>
<div>
<ol class="rv-flujo">
${d.costoPasos.map((x, i) => `<li><span class="rv-paso-num">${i + 1}</span><div><h4>${esc(x.titulo)}</h4><p>${esc(x.texto)}</p></div></li>`).join('\n')}
</ol>
<div class="rv-tip"><strong>Para leer el precio</strong><p>${esc(d.costoTip)}</p></div>
</div>
</div>
<div class="rv-dos rv-dos-datos">
<div class="rv-dato"><span class="rv-dato-valor">${esc(d.costoEjemplo.valor)}</span><span>${esc(d.costoEjemplo.etiqueta)}</span><small>${esc(d.costoEjemplo.nota)}</small></div>
<div class="rv-dato rv-dato-claro"><span class="rv-dato-icono">${GRANO}</span><span>${esc(d.costoEspecialidad)}</span></div>
</div>`, 'rv-alterna');

    const organismos = seccion('organismos', 'Organismos, ONG y control del precio', 'Quién regula el café en ' + esc(c.nombre), `
<div class="rv-pregunta">
<p class="rv-pregunta-q">¿Quién controla el precio del café en ${esc(c.nombre)}?</p>
<p class="rv-pregunta-a">${esc(d.quienCorto)}</p>
<p>${esc(d.quienLargo)}</p>
</div>
<div class="rv-niveles" style="--n: ${d.niveles.length};">
${d.niveles.map((n, i) => `<div class="rv-nivel"><p class="rv-nivel-tit"><span>${i + 1}</span>${esc(n.titulo)}</p><ul>${n.siglas.map((s) => org[s]).filter(Boolean).map((o) => `<li><h4>${esc(o.sigla || o.nombre)}</h4>${o.sigla ? '<p class="rv-org-nombre">' + esc(o.nombre) + '</p>' : ''}<p>${esc(o.rol)}</p>${o.url ? '<a href="' + esc(o.url) + '" target="_blank" rel="noopener">Visitar sitio ' + EXTERNO + '<span class="rg-oculto"> (se abre en otra pestaña)</span></a>' : ''}</li>`).join('')}</ul></div>`).join('\n')}
</div>
<p class="rv-aparte">${esc(d.organismosNota)}</p>`);

    const reconocidos = seccion('reconocidos', 'Cafés reconocidos de ' + esc(c.nombre), 'Los cafés ' + esc(d.gentilicioPlural) + ' más premiados', `
<div class="rv-dos">
<p class="rv-lead rv-lead-claro">${esc(d.reconocidosIntro)}</p>
${foto(d.imagenes.premios, 'rv-foto-media')}
</div>
<div class="rv-records">
${d.records.map((r) => `<div class="rv-record"><span class="rv-record-valor">${esc(r.valor)}<small>${esc(r.unidad)}</small></span><h3>${esc(r.titulo)}</h3><p>${esc(r.texto)}</p></div>`).join('\n')}
</div>
${anios.map((a) => `<h3 class="rv-subtitulo">Ganadores de la Taza de Excelencia ${esc(a)}</h3>
<ul class="rv-ganadores">
${d.ganadores.filter((g) => g.anio === a).map((g) => `<li><span class="rv-puntos">${esc(g.puntos)}<small>puntos</small></span><p class="rv-categoria">${esc(g.puesto || '1.er lugar')} · ${esc(g.categoria)}</p><h4>${esc(g.finca)}</h4>${g.productor ? '<p>' + esc(g.productor) + '</p>' : ''}<p class="rv-region-tag">${esc(g.region)} · ${esc(g.cafe)}</p></li>`).join('\n')}
</ul>`).join('\n')}
${comp.url ? '<p class="rv-mas"><a href="' + esc(comp.url) + '" target="_blank" rel="noopener">Ver todos los resultados de la ' + esc(comp.nombre.replace(/\s*\(.*\)$/, '')) + ' ' + EXTERNO + '</a></p>' : ''}`, 'rv-oscura');

    return cabeza({ titulo, descripcion: c.metaDescripcion, ruta, tipo: 'article', jsonld }) + `
<body>
<div style="font-family: 'Figtree', 'Segoe UI', Helvetica, sans-serif; color: #1C1A2E; background: #FFFDF8;">
${cabecera()}
<main>
<section class="rg-hero" style="background: ${v.bg};" aria-labelledby="titulo-pais">
<div class="rg-hero-in">
<div class="rg-hero-texto">
${migas(rutaMigas)}
<p class="rg-cejilla">Regiones cafetaleras · ${esc(v.tagline)}</p>
<h1 id="titulo-pais">Café de ${esc(c.nombre)}</h1>
<p class="rg-intro" style="color: ${v.muted};">${esc(c.intro)}</p>
</div>
<figure class="rg-hero-paisaje">
${c.heroVideo
    ? `<video autoplay muted loop playsinline preload="metadata" aria-label="${esc('Café de ' + c.nombre)}"><source src="${esc(c.heroVideo)}" type="video/mp4"></video>`
    : paisaje(v, c.id + '-h', '100%', true) + '<figcaption>' + esc(v.label) + '</figcaption>'}
</figure>
</div>
</section>
${bordadoAncho('bordado-hero', v.bg)}
<nav class="rv-nav" aria-label="Secciones de la página"><div class="rv-in"><ul>${NAV.map(([id, t]) => '<li><a href="#' + id + '">' + t + '</a></li>').join('')}</ul></div></nav>
<div class="rv-cuerpo">
${SIFON}
${intro}
${historia}
${produccion}
${costo}
${organismos}
${reconocidos}
</div>
<section class="rv-explora" aria-labelledby="h-explora" style="background: ${v.bg};">
<div class="rv-in">
<h2 id="h-explora">Sigue explorando ${esc(c.nombre)}</h2>
<div class="rg-ctas">
<a class="rg-cta" href="/cafeterias.html#ranking">${TAZA}<span>Ver cafeterías premiadas</span>${FLECHA}</a>
${comp.url ? `<a class="rg-cta" href="${esc(comp.url)}" target="_blank" rel="noopener">${GRANO}<span>Ver café premiado de ${esc(c.nombre)}</span>${EXTERNO}<span class="rg-oculto"> (se abre en otra pestaña)</span></a>` : ''}
<a class="rg-cta" href="/guias.html">${CHEMEX}<span>Aprende a prepararlo</span>${FLECHA}</a>
</div>
</div>
</section>
<section class="rg-otros" aria-labelledby="h-otros">
<div class="rg-otros-in">
<h2 id="h-otros">Otros países cafetaleros</h2>
<ul class="rg-rejilla">
${otros.map((o) => tarjetaMini(o)).join('\n')}
</ul>
<details class="rv-fuentes">
<summary>Fuentes consultadas (${(c.fuentes || []).length})</summary>
<ol>${(c.fuentes || []).map((f) => '<li><a href="' + esc(f.url) + '" target="_blank" rel="noopener nofollow">' + esc(f.titulo) + '</a></li>').join('')}</ol>
<p>Datos revisados el ${HOY}. Si ves algo desactualizado, escríbenos.</p>
</details>
</div>
</section>
</main>
${piePagina()}
</div>
<script src="${ver('js/precio-cafe.js')}" defer></script>
<script src="${ver('js/sifon-scroll.js')}" defer></script>
</body>
</html>
`;
  };
};
