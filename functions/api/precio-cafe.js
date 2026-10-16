// Cloudflare Pages Function: GET /api/precio-cafe
// Devuelve el precio del contrato "C" de café arábica (ICE Futures US, Nueva York) en centavos de dólar por libra.
// La fuente es Yahoo Finance (símbolo KC=F), con unos 10 a 15 minutos de retraso.
// La respuesta se guarda en la caché de Cloudflare 5 minutos para no pedirla en cada visita.

const FUENTE = 'https://query1.finance.yahoo.com/v8/finance/chart/KC=F?interval=1d&range=5d';
const RESPALDO = 'https://query2.finance.yahoo.com/v8/finance/chart/KC=F?interval=1d&range=5d';
const CACHE_SEGUNDOS = 300;

async function pedir(url) {
  const r = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; ElArteDelCafe/1.0)', Accept: 'application/json' },
    cf: { cacheTtl: CACHE_SEGUNDOS, cacheEverything: true }
  });
  if (!r.ok) throw new Error('HTTP ' + r.status);
  const j = await r.json();
  const m = j && j.chart && j.chart.result && j.chart.result[0] && j.chart.result[0].meta;
  if (!m || typeof m.regularMarketPrice !== 'number') throw new Error('Respuesta sin precio');
  return m;
}

function responder(cuerpo, estado, segundos) {
  return new Response(JSON.stringify(cuerpo), {
    status: estado,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'public, max-age=60, s-maxage=' + segundos,
      'Access-Control-Allow-Origin': '*'
    }
  });
}

export async function onRequestGet(context) {
  const cache = caches.default;
  const clave = new Request(new URL('/api/precio-cafe', context.request.url).toString());
  const guardada = await cache.match(clave);
  if (guardada) return guardada;

  let m;
  try {
    m = await pedir(FUENTE);
  } catch (e) {
    try {
      m = await pedir(RESPALDO);
    } catch (e2) {
      return responder({ ok: false, error: 'No pudimos obtener el precio en este momento.' }, 503, 60);
    }
  }

  const centavos = m.regularMarketPrice;
  const anterior = typeof m.chartPreviousClose === 'number' ? m.chartPreviousClose : (m.previousClose || null);
  const cambio = anterior ? centavos - anterior : null;
  const MESES = { Jan: 'enero', Feb: 'febrero', Mar: 'marzo', Apr: 'abril', May: 'mayo', Jun: 'junio', Jul: 'julio', Aug: 'agosto', Sep: 'septiembre', Oct: 'octubre', Nov: 'noviembre', Dec: 'diciembre' };
  const venc = /(\w{3}) (\d{2})$/.exec(m.shortName || '');
  const cuerpo = {
    ok: true,
    contrato: venc && MESES[venc[1]] ? 'contrato de ' + MESES[venc[1]] + ' 20' + venc[2] : 'contrato C de arábica',
    bolsa: 'ICE Futures US, Nueva York',
    centavosPorLibra: Math.round(centavos * 100) / 100,
    dolaresPorLibra: Math.round(centavos) / 100,
    dolaresPorKilo: Math.round(centavos / 100 * 2.20462 * 100) / 100,
    dolaresPorQuintal: Math.round(centavos * 100) / 100, // 1 quintal = 100 lb, así que ¢/lb = US$/quintal
    cambio: cambio === null ? null : Math.round(cambio * 100) / 100,
    cambioPorcentaje: cambio === null ? null : Math.round(cambio / anterior * 10000) / 100,
    hora: m.regularMarketTime ? new Date(m.regularMarketTime * 1000).toISOString() : null,
    consultado: new Date().toISOString(),
    fuente: 'Yahoo Finance (KC=F), con retraso de 10 a 15 minutos'
  };
  const resp = responder(cuerpo, 200, CACHE_SEGUNDOS);
  context.waitUntil(cache.put(clave, resp.clone()));
  return resp;
}
