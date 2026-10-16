// Genera las páginas de Regiones, el sitemap, robots.txt y las etiquetas SEO del sitio.
// Uso: node scripts/generar-regiones.js
// Contenido de cada país: data/regiones/<id>.json. Paisajes y colores: js/paises.js.
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const SITIO = 'https://www.elartedelcafe.com';
const NOMBRE = 'El Arte del Café';
const HOY = new Date().toISOString().slice(0, 10);
const RAIZ = path.join(__dirname, '..');
const ORDEN = ['hn', 'gt', 'mx', 'ni', 'sv', 'cr', 'pa', 'do', 'co', 'ec', 'pe', 'bo'];

const ctx = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(RAIZ, 'js/paises.js'), 'utf8'), ctx);
const PAISAJES = {};
ctx.window.EADC_PAISES.forEach((p) => { PAISAJES[p.id] = p; });

const SLUGS = { hn: 'honduras', gt: 'guatemala', mx: 'mexico', ni: 'nicaragua', sv: 'el-salvador', cr: 'costa-rica', pa: 'panama', do: 'republica-dominicana', co: 'colombia', ec: 'ecuador', pe: 'peru', bo: 'bolivia' };

// Los 12 países aparecen en el índice; solo los que tienen "publicado": true en su archivo de datos tienen página.
const TODOS = ORDEN.map((id) => {
  const f = path.join(RAIZ, 'data/regiones', id + '.json');
  const d = fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf8').replace(/^﻿/, '')) : {};
  return Object.assign({ id, nombre: PAISAJES[id].name, slug: SLUGS[id], v: PAISAJES[id] }, d, { listo: d.publicado === true });
});
const PAISES = TODOS.filter((c) => c.listo);

// Versión de cada archivo estático para que el navegador no use una copia vieja tras publicar.
const crypto = require('crypto');
const VER = {};
['css/styles.css', 'js/paises.js', 'js/origenes.js', 'js/precio-cafe.js', 'js/vertido-scroll.js', 'js/sifon-scroll.js', 'js/regiones-listas.js'].forEach((a) => {
  const f = path.join(RAIZ, a);
  if (a === 'js/regiones-listas.js') fs.writeFileSync(f, '/* Generado por scripts/generar-regiones.js: países con página publicada en Regiones. */\nwindow.EADC_REGIONES_LISTAS = ' + JSON.stringify(PAISES.map((c) => c.slug)) + ';\n');
  VER[a] = fs.existsSync(f) ? crypto.createHash('md5').update(fs.readFileSync(f)).digest('hex').slice(0, 8) : '1';
});
const ver = (a) => '/' + a + '?v=' + VER[a];

const esc = (s) => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const json = (o) => JSON.stringify(o).replace(/</g, '\\u003c');

const SECCIONES = [
  ['introduccion', 'Introducción'],
  ['historia', 'Historia del café'],
  ['produccion', 'Producción habitual'],
  ['costo', 'Costo del grano'],
  ['organismos', 'Organismos y precio'],
  ['reconocidos', 'Cafés reconocidos'],
  ['explora', 'Sigue explorando']
];

// ---------- Piezas compartidas ----------

const LOGO = '<svg viewBox="0 0 120 120" style="width: 46px; height: 46px; display: block;" aria-hidden="true"><path d="M28,62 L46,34 L53,43 L60,24 L66,24 L88,62" fill="none" stroke="#F2B33D" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/><path d="M63,19 C59,13 67,10 63,4" fill="none" stroke="#F2B33D" stroke-width="4" stroke-linecap="round"/><path d="M20,70 H100 V76 C100,96 86,108 60,108 C34,108 20,96 20,76 Z" fill="#FFFDF8"/><path d="M100,78 C114,78 114,96 98,96" fill="none" stroke="#FFFDF8" stroke-width="7" stroke-linecap="round"/><path d="M14,115 H106" stroke="#FFFDF8" stroke-width="5" stroke-linecap="round"/></svg>';
const ENLACE = 'display: inline-flex; align-items: center; min-height: 44px; padding: 0 12px; color: #FFFDF8; font-size: 16px; font-weight: 500; text-decoration: none;';
const ACTIVO = 'display: inline-flex; align-items: center; min-height: 44px; padding: 0 12px; color: #FFFDF8; font-size: 16px; font-weight: 600; text-decoration: underline; text-decoration-color: #F2B33D; text-decoration-thickness: 2px; text-underline-offset: 8px;';
const PIE = 'color: #FFFDF8; font-size: 16px; min-height: 36px; display: inline-flex; align-items: center; text-decoration: none;';
const MENU = [['/', 'Inicio'], ['/guias.html', 'Guías'], ['/noticias.html', 'Noticias'], ['/blog.html', 'Blog'], ['/cafeterias.html', 'Cafeterías'], ['/regiones/', 'Regiones'], ['/nosotros.html', 'Nosotros']];

function submenu() {
  return '<div class="submenu">' + PAISES.map((c) => '<a href="/regiones/' + c.slug + '">' + esc(c.nombre) + '</a>').join('') + '<a href="/regiones/" class="submenu-todas">Todas las regiones</a></div>';
}

function cabecera() {
  const links = MENU.map(([href, txt]) => {
    if (txt === 'Regiones') {
      return '<div class="menu-regiones"><a href="/regiones/" aria-current="page" style="' + ACTIVO + '">Regiones</a>' + submenu() + '</div>';
    }
    return '<a href="' + href + '" style="' + ENLACE + '">' + txt + '</a>';
  }).join('\n');
  return `<header style="background: #163A2E; color: #FFFDF8;">
<div style="max-width: 1240px; margin: 0 auto; padding: 18px clamp(20px, 5vw, 64px); display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 12px 28px;">
<a href="/" aria-label="El Arte del Café, ir al inicio" style="display: flex; align-items: center; gap: 12px; color: #FFFDF8; text-decoration: none; min-height: 44px;">
${LOGO}
<span style="font-family: 'Young Serif', Georgia, serif; font-size: 25px; line-height: 1;">El Arte del Café</span>
</a>
<button class="nav-toggle" aria-label="Abrir menú" aria-expanded="false" onclick="this.setAttribute('aria-expanded',this.getAttribute('aria-expanded')==='false'?'true':'false');this.nextElementSibling.classList.toggle('open')">
<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M3 6h18M3 12h18M3 18h18"/></svg>
</button>
<nav aria-label="Principal" class="nav-links">
${links}
</nav>
</div>
</header>`;
}

function piePagina() {
  const links = MENU.map(([href, txt]) => '<a href="' + href + '" style="' + PIE + '">' + txt + '</a>').join('\n');
  return `<footer id="contacto" style="background: #23305E; color: #FFFDF8;">
${bordadoAncho('bordado-pie', '#FFFDF8')}
<div style="max-width: 1240px; margin: 0 auto; padding: 64px clamp(20px, 5vw, 64px) 40px;">
<div style="display: flex; flex-wrap: wrap; justify-content: space-between; gap: 40px 64px; margin-bottom: 48px;">
<div style="flex: 1 1 300px; min-width: 0; max-width: 400px;">
<div style="font-family: 'Young Serif', Georgia, serif; font-size: 30px; margin-bottom: 12px;">El Arte del Café</div>
<p style="margin: 0; font-size: 17px; line-height: 1.6; color: #D5DAEE;">Cada taza contiene una historia. Gracias por ser parte de la nuestra.</p>
</div>
<nav aria-label="Pie de página" style="display: flex; flex-direction: column; gap: 4px;">
${links}
</nav>
<nav aria-label="Regiones" style="display: grid; grid-template-columns: repeat(2, minmax(0, auto)); gap: 4px 28px; align-content: start;">
${PAISES.map((c) => '<a href="/regiones/' + c.slug + '" style="' + PIE + '">' + esc(c.nombre) + '</a>').join('\n')}
</nav>
</div>
<div style="padding-top: 24px; border-top: 1px solid #3E4D82; font-size: 14px; color: #C9CFE8;">© 2026 El Arte del Café</div>
</div>
</footer>`;
}

function bordadoAncho(id, fondo) {
  return `<svg width="100%" height="32" style="display: block;" aria-hidden="true"><defs><pattern id="${id}" width="48" height="32" patternUnits="userSpaceOnUse"><rect width="48" height="32" fill="${fondo}"/><polyline points="0,5 6,1 12,5 18,1 24,5 30,1 36,5 42,1 48,5" fill="none" stroke="#1FA3A0" stroke-width="2"/><polyline points="0,27 6,31 12,27 18,31 24,27 30,31 36,27 42,31 48,27" fill="none" stroke="#1FA3A0" stroke-width="2"/><polygon points="24,7 33,16 24,25 15,16" fill="#C8287A"/><polygon points="24,11 29,16 24,21 19,16" fill="#F2B33D"/><rect x="22.5" y="14.5" width="3" height="3" fill="#23305E"/><polygon points="0,10 6,16 0,22 -6,16" fill="#C62B36"/><polygon points="48,10 54,16 48,22 42,16" fill="#C62B36"/></pattern></defs><rect x="0" y="0" width="100%" height="32" fill="url(#${id})"/></svg>`;
}

function paisaje(v, k, alto, animado) {
  const a = (cls) => (animado ? ' class="' + cls + '"' : '');
  return `<svg viewBox="0 0 600 300" preserveAspectRatio="xMidYMid slice" style="display: block; width: 100%; height: ${alto};" aria-hidden="true">
<defs><linearGradient id="cielo-${k}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${v.sky1}"/><stop offset="0.62" stop-color="${v.sky2}"/><stop offset="1" stop-color="${v.sky3}"/></linearGradient>${animado ? `<filter id="bruma-${k}" x="-20%" y="-100%" width="140%" height="300%"><feGaussianBlur stdDeviation="9"/></filter><filter id="brillo-${k}" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="14"/></filter>` : ''}</defs>
<rect width="600" height="300" fill="url(#cielo-${k})"/>
<g${a('sol')}>${animado ? `<circle cx="${v.sunX}" cy="${v.sunY}" r="48" fill="${v.sunFill}" opacity="0.55" filter="url(#brillo-${k})"/>` : ''}<circle cx="${v.sunX}" cy="${v.sunY}" r="20" fill="${v.sunFill}"/></g>
<g${a('asc-far')}><path d="${v.far}" fill="${v.farFill}"/><path d="${v.farSnow}" fill="#F4F6FB" opacity="0.92"/></g>
${animado ? `<g class="bruma"><path d="${v.mistA}" fill="#FFFFFF" opacity="${v.mistOp}" filter="url(#bruma-${k})"/></g>` : ''}
<g${a('asc-mid')}><path d="${v.mid}" fill="${v.midFill}"/><path d="${v.midShade}" fill="#000000" opacity="0.2"/><path d="${v.midSnow}" fill="#F4F6FB" opacity="0.95"/></g>
${animado ? `<g class="bruma b2"><path d="${v.mistB}" fill="#FFFFFF" opacity="${v.mistOp}" filter="url(#bruma-${k})"/></g>` : ''}
<g${a('asc-near')}><path d="${v.near}" fill="${v.nearFill}"/><path d="${v.palms}" fill="${v.nearFill}"/></g>
<g${a('asc-front')}><path d="${v.front}" fill="${v.frontFill}"/></g>
</svg>`;
}

function precioWidget(pais) {
  const nota = pais
    ? `Es el precio de referencia de la bolsa de Nueva York. Lo que recibe una familia productora en ${esc(pais)} parte de este número, más o menos un diferencial por calidad y origen, y menos los costos de beneficio, transporte y exportación.`
    : 'Es el precio de referencia de la bolsa de Nueva York para el café arábica. Cada país lo ajusta con diferenciales por calidad y origen.';
  return `<div class="rg-precio" data-precio-cafe aria-busy="true">
<div class="rg-precio-cab"><span class="rg-vivo">En vivo</span><span>Precio internacional del café arábica</span></div>
<div class="rg-precio-principal" data-campo="principal" aria-live="polite">Cargando…</div>
<div class="rg-precio-cambio" data-campo="cambio"></div>
<dl class="rg-precio-equiv"><div><dt>Por quintal (100 lb)</dt><dd data-campo="quintal">—</dd></div><div><dt>Por kilo</dt><dd data-campo="kilo">—</dd></div></dl>
<p class="rg-precio-nota" data-campo="nota">Contrato C de arábica, ICE Futures US (Nueva York).</p>
<p class="rg-precio-aviso">${nota}</p>
<noscript><p class="rg-precio-aviso">Activa JavaScript para ver el precio actualizado.</p></noscript>
</div>`;
}

function cabeza({ titulo, descripcion, ruta, tipo, jsonld }) {
  const url = SITIO + ruta;
  return `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(titulo)}</title>
<meta name="description" content="${esc(descripcion)}">
<link rel="canonical" href="${url}">
<meta name="robots" content="index, follow, max-image-preview:large">
<meta property="og:type" content="${tipo}">
<meta property="og:site_name" content="${NOMBRE}">
<meta property="og:locale" content="es_LA">
<meta property="og:title" content="${esc(titulo)}">
<meta property="og:description" content="${esc(descripcion)}">
<meta property="og:url" content="${url}">
<meta name="twitter:card" content="summary">
<meta name="twitter:title" content="${esc(titulo)}">
<meta name="twitter:description" content="${esc(descripcion)}">
<meta name="theme-color" content="#163A2E">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Figtree:wght@400;500;600;700&family=Young+Serif&display=swap">
<link rel="stylesheet" href="${ver('css/styles.css')}">
${jsonld ? '<script type="application/ld+json">' + json(jsonld) + '</script>' : '<meta name="robots" content="noindex">'}
</head>`;
}

function migas(items) {
  return '<nav aria-label="Ruta de navegación" class="rg-migas"><ol>' + items.map(([href, txt], i) =>
    '<li>' + (i < items.length - 1 ? '<a href="' + href + '">' + esc(txt) + '</a>' : '<span aria-current="page">' + esc(txt) + '</span>') + '</li>').join('') + '</ol></nav>';
}

function migasLd(items) {
  return { '@type': 'BreadcrumbList', itemListElement: items.map(([href, txt], i) => ({ '@type': 'ListItem', position: i + 1, name: txt, item: SITIO + href })) };
}

const EDITOR = { '@type': 'Organization', name: NOMBRE, url: SITIO + '/' };
const FLECHA = '<svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><path d="M3,8 H13 M9,4 L13,8 L9,12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const EXTERNO = '<svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true"><path d="M6,3 H13 V10 M13,3 L4,12" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const CHEMEX = '<svg viewBox="0 0 40 40" width="28" height="28" aria-hidden="true"><path d="M10,4 H30 L22,17 L31,36 H9 L18,17 Z" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round"/><path d="M16,15 H24 L23,20 H17 Z" fill="#C08A5B"/><path d="M12,31 H28 L30,35 H10 Z" fill="#6B3A22"/></svg>';
const GRANO = '<svg viewBox="0 0 40 40" width="28" height="28" aria-hidden="true"><ellipse cx="20" cy="20" rx="12" ry="16" transform="rotate(-25 20 20)" fill="none" stroke="currentColor" stroke-width="2.4"/><path d="M15,7 C12,16 28,22 25,33" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></svg>';
const TAZA = '<svg viewBox="0 0 40 40" width="28" height="28" aria-hidden="true"><path d="M7,16 H29 V22 C29,30 24,34 18,34 C12,34 7,30 7,22 Z" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round"/><path d="M29,19 C35,19 35,27 28,27" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/><path d="M14,11 C12,8 16,7 14,4 M21,11 C19,8 23,7 21,4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';

// Fondo animado: un gotero V60 arriba, un chorro de café que baja con el scroll y una taza que se llena al final.
const VERTIDO_FONDO = `<div class="rg-vertido-fondo" aria-hidden="true">
<svg class="rg-vf-v60" viewBox="0 0 120 110"><path d="M14,18 H106 L74,70 H46 Z" fill="#C8287A"/><path d="M6,18 H114" stroke="#C8287A" stroke-width="8" stroke-linecap="round"/><path d="M40,28 L54,62 M60,28 V62 M80,28 L66,62" stroke="#FFFDF8" stroke-width="3" stroke-linecap="round" opacity="0.8"/><path d="M36,78 H84" stroke="#23305E" stroke-width="7" stroke-linecap="round"/><path d="M56,70 H64 V78 H56 Z" fill="#23305E"/><path d="M92,26 C104,26 110,36 104,48" fill="none" stroke="#C8287A" stroke-width="6" stroke-linecap="round"/></svg>
<div class="rg-vf-pista"><div class="rg-vf-chorro"></div><span class="rg-vf-gota"></span></div>
<svg class="rg-vf-taza" viewBox="0 0 140 110"><defs><clipPath id="rg-vf-clip"><path d="M18,30 H112 V52 C112,82 92,100 65,100 C38,100 18,82 18,52 Z"/></clipPath></defs><rect class="rg-vf-cafe" x="18" y="30" width="94" height="72" fill="#3B2116" clip-path="url(#rg-vf-clip)"/><rect class="rg-vf-crema" x="18" y="30" width="94" height="8" fill="#9A6236" clip-path="url(#rg-vf-clip)"/><path d="M18,30 H112 V52 C112,82 92,100 65,100 C38,100 18,82 18,52 Z" fill="none" stroke="#23305E" stroke-width="6"/><path d="M112,42 C134,42 134,74 110,74" fill="none" stroke="#23305E" stroke-width="6" stroke-linecap="round"/><path d="M6,106 H124" stroke="#23305E" stroke-width="6" stroke-linecap="round"/><g class="rg-vf-vapor"><path class="vapor" d="M48,22 C40,12 56,6 48,-6" fill="none" stroke="#9AA3C7" stroke-width="4" stroke-linecap="round"/><path class="vapor v2" d="M68,22 C60,10 76,4 68,-10" fill="none" stroke="#9AA3C7" stroke-width="4" stroke-linecap="round"/><path class="vapor v3" d="M88,22 C80,12 96,6 88,-6" fill="none" stroke="#9AA3C7" stroke-width="4" stroke-linecap="round"/></g></svg>
</div>`;

function divisor() {
  return '<div class="rg-divisor" aria-hidden="true"><span></span>' + GRANO + '<span></span></div>';
}

function encabezado(n, eyebrow, id, titulo) {
  return '<p class="rg-numero">' + String(n).padStart(2, '0') + ' · ' + eyebrow + '</p><h2 id="' + id + '">' + titulo + '</h2>';
}

// ---------- Página de cada país ----------

function paginaPais(c, i) {
  const v = c.v;
  const ruta = '/regiones/' + c.slug;
  const p = c.produccion || {};
  const titulo = `Café de ${c.nombre}: historia, producción y precio | ${NOMBRE}`;
  const rutaMigas = [['/', 'Inicio'], ['/regiones/', 'Regiones'], [ruta, c.nombre]];
  const faq = [
    { q: `¿Quién controla el precio del café en ${c.nombre}?`, a: c.quienControlaPrecio },
    { q: `¿Cómo se calcula el precio del grano de café en ${c.nombre}?`, a: (c.costo && c.costo.explicacion || '').split('\n\n')[0] }
  ].filter((x) => x.a);
  if (p.volumen) faq.push({ q: `¿Cuánto café produce ${c.nombre}?`, a: p.volumen + (p.cosecha ? ' La cosecha va de ' + p.cosecha.replace(/^de /i, '') + '.' : '') });
  const jsonld = {
    '@context': 'https://schema.org',
    '@graph': [
      { '@type': 'Article', headline: `Café de ${c.nombre}: historia, producción y precio`, description: c.metaDescripcion, inLanguage: 'es', datePublished: HOY, dateModified: HOY, mainEntityOfPage: SITIO + ruta, author: EDITOR, publisher: EDITOR, about: { '@type': 'Country', name: c.nombre } },
      migasLd(rutaMigas),
      { '@type': 'FAQPage', mainEntity: faq.map((x) => ({ '@type': 'Question', name: x.q, acceptedAnswer: { '@type': 'Answer', text: x.a } })) }
    ]
  };
  const datos = [['Producción', p.volumen], ['Cosecha', p.cosecha], ['Altitud', p.altitud], ['Productores', p.productores]].filter((x) => x[1]);
  const dc = c.datosCortos || {};
  const datosHero = [['Producción', dc.volumen || p.volumen], ['Cosecha', dc.cosecha || p.cosecha], ['Altitud', dc.altitud || p.altitud], ['Productores', dc.productores || p.productores]].filter((x) => x[1]);
  const chips = (arr) => '<ul class="rg-chips">' + (arr || []).map((x) => '<li>' + esc(x) + '</li>').join('') + '</ul>';
  const parrafos = (txt) => String(txt || '').split(/\n\n+/).map((t) => '<p>' + esc(t) + '</p>').join('\n');
  const otros = TODOS.filter((x) => x.id !== c.id);
  const comp = c.competencia || {};

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
${datosHero.length ? '<dl class="rg-datos">' + datosHero.map(([k, val]) => '<div><dt>' + k + '</dt><dd>' + esc(val) + '</dd></div>').join('') + '</dl>' : ''}
</div>
<figure class="rg-hero-paisaje">
${c.heroVideo
    ? `<video autoplay muted loop playsinline preload="metadata" aria-label="${esc('Café de ' + c.nombre)}"><source src="${esc(c.heroVideo)}" type="video/mp4"></video>`
    : paisaje(v, c.id + '-h', '100%', true) + '<figcaption>' + esc(v.label) + '</figcaption>'}
</figure>
</div>
</section>
${bordadoAncho('bordado-hero', v.bg)}
<div class="rg-cuerpo">
${VERTIDO_FONDO}
<aside class="rg-indice">
<nav aria-label="En esta página">
<h2>En esta página</h2>
<ol>${SECCIONES.map(([id, t]) => '<li><a href="#' + id + '">' + t + '</a></li>').join('')}</ol>
</nav>
</aside>
<article class="rg-articulo">

${(c.introduccion || []).length ? `<section id="introduccion" aria-labelledby="h-introduccion">
${encabezado(1, 'Introducción', 'h-introduccion', 'El café de ' + esc(c.nombre))}
<p class="rg-entrada">${esc(c.introduccion[0])}</p>
${c.introduccion.slice(1).map((t) => '<p>' + esc(t) + '</p>').join('\n')}
</section>
${divisor()}` : ''}

<section id="historia" aria-labelledby="h-historia">
${encabezado(2, 'Historia', 'h-historia', 'Historia del café en ' + esc(c.nombre))}
${(c.historia || []).map((t) => '<p>' + esc(t) + '</p>').join('\n')}
${(c.hitos || []).length ? '<h3>Momentos clave</h3><ol class="rg-hitos">' + c.hitos.map((h) => '<li><span class="rg-anio">' + esc(h.anio) + '</span><span>' + esc(h.texto) + '</span></li>').join('') + '</ol>' : ''}
</section>
${divisor()}

<section id="produccion" aria-labelledby="h-produccion">
${encabezado(3, 'Producción', 'h-produccion', 'Producción habitual')}
${parrafos(p.resumen)}
${datos.length ? '<dl class="rg-fichas">' + datos.map(([k, val]) => '<div><dt>' + k + '</dt><dd>' + esc(val) + '</dd></div>').join('') + '</dl>' : ''}
${(p.variedades || []).length ? '<h3>Variedades</h3>' + chips(p.variedades) : ''}
${(p.procesos || []).length ? '<h3>Procesos</h3>' + chips(p.procesos) : ''}
${(p.regiones || []).length ? '<h3>Regiones cafetaleras de ' + esc(c.nombre) + '</h3><ul class="rg-regiones">' + p.regiones.map((r) => '<li><h4>' + esc(r.nombre) + '</h4><p>' + esc(r.nota) + '</p></li>').join('') + '</ul>' : ''}
</section>

${divisor()}
<section id="costo" aria-labelledby="h-costo">
${encabezado(4, 'Precio', 'h-costo', 'Costo del grano de café')}
${precioWidget(c.nombre)}
${parrafos(c.costo && c.costo.explicacion)}
${c.costo && c.costo.unidadLocal ? '<p class="rg-nota">Unidad de venta local: ' + esc(c.costo.unidadLocal) + '.</p>' : ''}
</section>
${divisor()}

<section id="organismos" aria-labelledby="h-organismos">
${encabezado(5, 'Organismos', 'h-organismos', 'Organismos, ONG y quién controla el precio')}
<div class="rg-pregunta">
<h3>¿Quién controla el precio del café en ${esc(c.nombre)}?</h3>
${parrafos(c.quienControlaPrecio)}
</div>
${(c.organismosTexto || []).length ? '<h3>Cómo se organiza el sector</h3>' + c.organismosTexto.map((t) => '<p>' + esc(t) + '</p>').join('\n') : ''}
<h3>Instituciones y organizaciones</h3>
<ul class="rg-organismos">
${(c.organismos || []).map((o) => `<li><span class="rg-tipo">${esc(o.tipo)}</span><h4>${esc(o.nombre)}${o.sigla ? ' <abbr>(' + esc(o.sigla) + ')</abbr>' : ''}</h4><p>${esc(o.rol)}</p>${o.url ? '<a href="' + esc(o.url) + '" target="_blank" rel="noopener">Sitio oficial ' + EXTERNO + '<span class="rg-oculto"> (se abre en otra pestaña)</span></a>' : ''}</li>`).join('\n')}
</ul>
</section>

<section id="reconocidos" aria-labelledby="h-reconocidos" class="rg-panel">
${encabezado(6, 'Reconocimientos', 'h-reconocidos', 'Cafés reconocidos de ' + esc(c.nombre))}
${(c.reconocidosTexto || []).map((t) => '<p>' + esc(t) + '</p>').join('\n')}
${[...new Set((c.cafesReconocidos || []).map((r) => r.anio))].sort().reverse().map((anio) => `<h3>${esc(comp.nombre ? comp.nombre.replace(/\s*\(.*\)$/, '') : 'Ganadores')} ${esc(anio)}</h3>
<ul class="rg-premios">
${c.cafesReconocidos.filter((r) => r.anio === anio).map((r) => `<li>${GRANO}<div><h4>${esc(r.nombre)}</h4><p class="rg-region">${esc(r.region)}</p><p>${esc(r.logro)}</p></div></li>`).join('\n')}
</ul>`).join('\n')}
${(c.records || []).length ? `<h3>Precios récord</h3>
<ul class="rg-premios rg-records">
${c.records.map((r) => `<li>${TAZA}<div><h4>${esc(r.nombre)} · ${esc(r.anio)}</h4><p class="rg-region">${esc(r.region)}</p><p>${esc(r.logro)}</p></div></li>`).join('\n')}
</ul>` : ''}
${comp.nombre ? '<p class="rg-nota">Resultados completos en ' + (comp.url ? '<a href="' + esc(comp.url) + '" target="_blank" rel="noopener">' + esc(comp.nombre) + '</a>' : esc(comp.nombre)) + '.</p>' : ''}
</section>

<section id="explora" aria-labelledby="h-explora" class="rg-explora" style="background: ${v.bg === '#23305E' ? '#4A1F3D' : v.bg};">
<h2 id="h-explora">Sigue explorando ${esc(c.nombre)}</h2>
<div class="rg-ctas">
<a class="rg-cta" href="/cafeterias.html#ranking">${TAZA}<span>Ver cafeterías premiadas</span>${FLECHA}</a>
${comp.url ? `<a class="rg-cta" href="${esc(comp.url)}" target="_blank" rel="noopener">${GRANO}<span>Ver café premiado de ${esc(c.nombre)}</span>${EXTERNO}<span class="rg-oculto"> (se abre en otra pestaña)</span></a>` : ''}
<a class="rg-cta" href="/guias.html">${CHEMEX}<span>Aprende a prepararlo</span>${FLECHA}</a>
</div>
</section>

${(c.fuentes || []).length ? `<section id="fuentes" aria-labelledby="h-fuentes" class="rg-fuentes">
<h2 id="h-fuentes">Fuentes</h2>
<ol>${c.fuentes.map((f) => '<li><a href="' + esc(f.url) + '" target="_blank" rel="noopener nofollow">' + esc(f.titulo) + '</a></li>').join('')}</ol>
<p class="rg-nota">Última revisión: ${HOY}.</p>
</section>` : ''}
</article>
</div>

<section class="rg-otros" aria-labelledby="h-otros">
<div class="rg-otros-in">
<h2 id="h-otros">Otros países cafetaleros</h2>
<ul class="rg-rejilla">
${otros.map((o) => tarjetaMini(o)).join('\n')}
</ul>
</div>
</section>
</main>
${piePagina()}
</div>
<script src="${ver('js/precio-cafe.js')}" defer></script>
<script src="${ver('js/vertido-scroll.js')}" defer></script>
</body>
</html>
`;
}

function tarjetaMini(o, conIndice) {
  const interior = paisaje(o.v, o.id + '-mi', '112px', false) + `<span class="rg-mini-texto"><span class="rg-mini-nombre">${esc(o.nombre)}</span><span style="color: ${o.v.muted};">${esc(o.v.tagline)}</span>${o.listo ? '' : '<span class="rg-pronto">Próximamente</span>'}</span>`;
  if (!o.listo) return `<li class="rg-mini rg-mini-pronto" style="background: ${o.v.bg};"><div class="rg-mini-enlace">${interior}</div></li>`;
  return `<li class="rg-mini" style="background: ${o.v.bg};">
<a href="/regiones/${o.slug}" class="rg-mini-enlace">${interior}</a>
${conIndice ? '<ul class="rg-mini-indice">' + SECCIONES.slice(0, 6).map(([id, t]) => '<li><a href="/regiones/' + o.slug + '#' + id + '">' + t + '</a></li>').join('') + '</ul>' : ''}
</li>`;
}

// ---------- Índice de Regiones ----------

function paginaIndice() {
  const ruta = '/regiones/';
  const titulo = `Regiones cafetaleras de Latinoamérica | ${NOMBRE}`;
  const descripcion = 'Historia, producción, precio del grano, organismos y cafés premiados de los 12 países cafetaleros de Latinoamérica, con el precio del café en vivo.';
  const rutaMigas = [['/', 'Inicio'], [ruta, 'Regiones']];
  const jsonld = {
    '@context': 'https://schema.org',
    '@graph': [
      { '@type': 'CollectionPage', name: 'Regiones cafetaleras de Latinoamérica', description: descripcion, inLanguage: 'es', url: SITIO + ruta, publisher: EDITOR },
      { '@type': 'ItemList', itemListElement: PAISES.map((c, i) => ({ '@type': 'ListItem', position: i + 1, name: 'Café de ' + c.nombre, url: SITIO + '/regiones/' + c.slug })) },
      migasLd(rutaMigas)
    ]
  };
  return cabeza({ titulo, descripcion, ruta, tipo: 'website', jsonld }) + `
<body>
<div style="font-family: 'Figtree', 'Segoe UI', Helvetica, sans-serif; color: #1C1A2E; background: #FFFDF8;">
${cabecera()}
<main>
<section class="rg-hero" style="background: #163A2E;" aria-labelledby="titulo-regiones">
<div class="rg-hero-in">
<div class="rg-hero-texto">
${migas(rutaMigas)}
<p class="rg-cejilla">De México a Bolivia</p>
<h1 id="titulo-regiones">Regiones cafetaleras de Latinoamérica</h1>
<p class="rg-intro" style="color: #D5DCD9;">Doce países, una misma pasión. Conoce la historia de su café, cómo se produce, cuánto vale el grano, quién regula su precio y qué fincas han puesto su nombre en lo más alto.</p>
</div>
<div class="rg-hero-precio">${precioWidget('')}</div>
</div>
</section>
${bordadoAncho('bordado-hero', '#163A2E')}
<section class="rg-otros" aria-labelledby="h-indice" style="background: #FFFDF8;">
<div class="rg-otros-in">
<h2 id="h-indice">Índice de países</h2>
<ul class="rg-rejilla rg-rejilla-grande">
${TODOS.map((o) => tarjetaMini(o, true)).join('\n')}
</ul>
</div>
</section>
</main>
${piePagina()}
</div>
<script src="${ver('js/precio-cafe.js')}" defer></script>
</body>
</html>
`;
}

// ---------- Página 404 (evita que Cloudflare muestre el inicio en direcciones que no existen) ----------

function pagina404() {
  return cabeza({ titulo: `Página no encontrada | ${NOMBRE}`, descripcion: 'Esta página no existe o cambió de lugar.', ruta: '/404', tipo: 'website', jsonld: null }) + `
<body>
<div style="font-family: 'Figtree', 'Segoe UI', Helvetica, sans-serif; color: #1C1A2E; background: #FFFDF8;">
${cabecera()}
<main class="rg-404">
<div>
<p class="rg-cejilla" style="color: #C8287A;">Error 404</p>
<h1>Esta taza está vacía</h1>
<p>La página que buscas no existe o cambió de lugar. Vuelve al inicio o explora las regiones donde nace nuestro café.</p>
<div class="rg-ctas">
<a class="rg-cta" href="/">${TAZA}<span>Volver al inicio</span>${FLECHA}</a>
<a class="rg-cta" href="/regiones/">${GRANO}<span>Ver las regiones</span>${FLECHA}</a>
</div>
</div>
</main>
${piePagina()}
</div>
</body>
</html>
`;
}

// ---------- SEO de las páginas existentes ----------

const EXISTENTES = {
  'index.html': { ruta: '/', titulo: 'El Arte del Café | Historias, guías y regiones del café latinoamericano', descripcion: 'El Arte del Café celebra el café latinoamericano: de dónde viene, cómo prepararlo, noticias, las mejores cafeterías y las regiones donde nace.' },
  'guias.html': { ruta: '/guias', titulo: 'Guías para preparar café en casa | El Arte del Café', descripcion: 'Guías paso a paso para preparar café en casa: métodos, proporciones, molienda y temperatura del agua para una taza que sepa a origen.' },
  'noticias.html': { ruta: '/noticias', titulo: 'Noticias del café | El Arte del Café', descripcion: 'Noticias del mundo del café: cosechas, premios, mercado y las historias que llegan desde las fincas de Latinoamérica.' },
  'blog.html': { ruta: '/blog', titulo: 'Blog | El Arte del Café', descripcion: 'Historias, opiniones y cultura del café latinoamericano contadas con orgullo por El Arte del Café.' },
  'cafeterias.html': { ruta: '/cafeterias', titulo: 'Las mejores cafeterías del mundo 2026 | El Arte del Café', descripcion: 'El ranking mundial de cafeterías 2026 y las mejores de Centroamérica, Honduras y Guatemala, en un mapa interactivo.' },
  'nosotros.html': { ruta: '/nosotros', titulo: 'Nosotros | El Arte del Café', descripcion: 'Somos centroamericanos enamorados del café. Conoce quiénes somos y escríbenos si tienes una finca, una cafetería o una historia.' }
};

function seoExistente(archivo, d) {
  const f = path.join(RAIZ, archivo);
  let h = fs.readFileSync(f, 'utf8');
  const ld = archivo === 'index.html'
    ? { '@context': 'https://schema.org', '@graph': [{ '@type': 'WebSite', name: NOMBRE, url: SITIO + '/', inLanguage: 'es' }, Object.assign({ '@type': 'Organization' }, EDITOR)] }
    : { '@context': 'https://schema.org', '@type': 'WebPage', name: d.titulo, description: d.descripcion, url: SITIO + d.ruta, inLanguage: 'es', isPartOf: { '@type': 'WebSite', name: NOMBRE, url: SITIO + '/' } };
  const bloque = `<!-- seo:inicio (generado por scripts/generar-regiones.js) -->
<meta name="description" content="${esc(d.descripcion)}">
<link rel="canonical" href="${SITIO + d.ruta}">
<meta name="robots" content="index, follow, max-image-preview:large">
<meta property="og:type" content="website">
<meta property="og:site_name" content="${NOMBRE}">
<meta property="og:locale" content="es_LA">
<meta property="og:title" content="${esc(d.titulo)}">
<meta property="og:description" content="${esc(d.descripcion)}">
<meta property="og:url" content="${SITIO + d.ruta}">
<meta name="twitter:card" content="summary">
<meta name="theme-color" content="#163A2E">
<script type="application/ld+json">${json(ld)}</script>
<!-- seo:fin -->`;
  h = h.replace(/<!-- seo:inicio[\s\S]*?<!-- seo:fin -->\n?/, '');
  h = h.replace(/<title>[\s\S]*?<\/title>/, '<title>' + esc(d.titulo) + '</title>\n' + bloque);

  // Menú: agrega Regiones (con submenú de países) junto a Cafeterías, en la cabecera y en el pie.
  h = h.replace(/<div class="menu-regiones">[\s\S]*?<\/div><\/div>\r?\n?/, '');
  h = h.replace(/<a href="\/regiones\/" style="color: #FFFDF8; font-size: 16px; min-height: 36px;[^>]*>Regiones<\/a>\r?\n?/, '');
  h = h.replace(/<a href="cafeterias\.html"[^>]*min-height: 44px[^>]*>Cafeterías<\/a>\r?\n/, (m) => m + '<div class="menu-regiones"><a href="/regiones/" style="' + ENLACE + '">Regiones</a>' + submenu() + '</div>\n');
  h = h.replace(/<a href="cafeterias\.html"[^>]*min-height: 36px[^>]*>Cafeterías<\/a>\r?\n/, (m) => m + '<a href="/regiones/" style="' + PIE + '">Regiones</a>\n');

  // El menú móvil se oculta desde la hoja de estilos; el estilo en línea lo dejaba siempre abierto.
  h = h.replace('<nav aria-label="Principal" class="nav-links" style="display: flex; flex-wrap: wrap; align-items: center; gap: 2px 4px;">', '<nav aria-label="Principal" class="nav-links">');

  // Rutas absolutas y con versión para hojas de estilo, scripts y videos.
  h = h.replace(/href="\/?css\/styles\.css(\?v=[^"]*)?"/g, 'href="' + ver('css/styles.css') + '"');
  h = h.replace(/src="\/?js\/([a-z-]+\.js)(\?v=[^"]*)?"/g, (m, a) => 'src="' + (VER['js/' + a] ? ver('js/' + a) : '/js/' + a) + '"');
  h = h.replace(/src="assets\//g, 'src="/assets/');

  if (archivo === 'index.html') {
    if (!h.includes('js/regiones-listas.js')) h = h.replace(/<script src="\/js\/paises\.js[^"]*"><\/script>/, (m) => '<script src="' + ver('js/regiones-listas.js') + '"></script>\n' + m);
    // Botón de cada tarjeta: a la página del país si ya está publicada, si no al índice de Regiones.
    h = h.replace(/<a class="cta-pais" href="[^"]*">([\s\S]*?Descubre el café de ([^<]+)<\/span>)/g, (m, resto, nombre) => {
      const c = PAISES.find((x) => x.nombre === nombre);
      return '<a class="cta-pais" href="' + (c ? '/regiones/' + c.slug : '/regiones/') + '">' + resto;
    });
  }
  fs.writeFileSync(f, h);
}

// ---------- Escritura ----------

fs.mkdirSync(path.join(RAIZ, 'regiones'), { recursive: true });
fs.writeFileSync(path.join(RAIZ, 'regiones/index.html'), paginaIndice());
const paginaPaisV2 = require('./pais-v2')({ esc, cabeza, cabecera, piePagina, bordadoAncho, paisaje, precioWidget, migas, migasLd, EDITOR, SITIO, NOMBRE, HOY, ver, TODOS, tarjetaMini, FLECHA, EXTERNO, GRANO, TAZA, CHEMEX });
PAISES.forEach((c, i) => fs.writeFileSync(path.join(RAIZ, 'regiones', c.slug + '.html'), c.diseno === 2 && c.v2 ? paginaPaisV2(c) : paginaPais(c, i)));
fs.writeFileSync(path.join(RAIZ, '404.html'), pagina404());
Object.keys(EXISTENTES).forEach((a) => seoExistente(a, EXISTENTES[a]));

const urls = [
  ['/', '1.0'], ['/regiones/', '0.9'],
  ...PAISES.map((c) => ['/regiones/' + c.slug, '0.8']),
  ['/guias', '0.7'], ['/cafeterias', '0.7'], ['/noticias', '0.6'], ['/blog', '0.6'], ['/nosotros', '0.5']
];
fs.writeFileSync(path.join(RAIZ, 'sitemap.xml'), '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
  urls.map(([u, pr]) => `  <url><loc>${SITIO}${u}</loc><lastmod>${HOY}</lastmod><priority>${pr}</priority></url>`).join('\n') + '\n</urlset>\n');
fs.writeFileSync(path.join(RAIZ, 'robots.txt'), `User-agent: *\nAllow: /\nDisallow: /api/\n\nSitemap: ${SITIO}/sitemap.xml\n`);

console.log('Regiones generadas: ' + PAISES.map((c) => c.slug).join(', '));
