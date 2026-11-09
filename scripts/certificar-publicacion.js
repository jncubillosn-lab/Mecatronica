'use strict';

/**
 * Certificación de publicación real, distinta de las pruebas de CI.
 * Exige que la página accesible y cada recurso productivo sirvan exactamente
 * los bytes de la revisión local. No interpreta datos académicos ni depende
 * de una API ajena a GitHub Pages. No certifica pestañas antiguas sin recargar.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { setTimeout: dormir } = require('node:timers/promises');

const raiz = path.resolve(__dirname, '..');
const predeterminada = 'https://jncubillosn-lab.github.io/Mecatronica/';
const leer = p => fs.readFileSync(path.join(raiz, p));
const huella = b => crypto.createHash('sha256').update(b).digest('hex');

function planDeVersion() {
  const version = JSON.parse(leer('package.json').toString('utf8')).version;
  const html = leer('index.html').toString('utf8');
  const arranque = leer('js/iniciar.js').toString('utf8');
  assert(html.includes('name="version" content="' + version + '"'),
    'Metadato de versión diferente del paquete');
  assert(html.includes('>Versión ' + version + ' '),
    'El pie no anuncia la versión del paquete');

  const recursos = [...html.matchAll(/<(?:script|link)\b[^>]*(?:src|href)="([^"]+)"/g)]
    .map(m => m[1]).filter(u => /^(?:js\/.*\.js|css\/.*\.css)\?v=/.test(u));
  assert(recursos.length >= 6, 'No se detectan los recursos enlazados del sitio');
  for (const p of ['datos/academico.json', 'js/app.js']) {
    const url = p + '?v=' + version;
    assert(arranque.includes("'" + url + "'"), 'El arranque no referencia ' + url);
    recursos.push(url);
  }
  const referencias = [...new Set(recursos)];
  for (const url of referencias) {
    const u = new URL(url, predeterminada);
    assert.equal(u.searchParams.get('v'), version,
      'Referencia de recurso con versión diferente: ' + url);
    assert(fs.existsSync(path.join(raiz, url.split('?')[0])),
      'Falta el recurso local ' + url);
  }
  return { version, referencias };
}

async function verificarUnaVez(base = predeterminada, solicitar = fetch, identificador = Date.now().toString()) {
  const { version, referencias } = planDeVersion();
  const raizPublica = new URL(base.endsWith('/') ? base : base + '/');
  const entradas = [
    { ruta: 'index.html', url: '', etiqueta: 'página principal sin parámetro' },
    { ruta: 'index.html', url: '?certificacion=' + identificador,
      etiqueta: 'página principal con recarga de caché' },
    { ruta: 'index.html', url: 'index.html?certificacion=' + identificador,
      etiqueta: 'index.html con recarga de caché' },
    ...referencias.map(url => ({
      ruta: url.split('?')[0], url, etiqueta: url.split('?')[0]
    }))
  ];
  const comprobados = [];
  for (const e of entradas) {
    const objetivo = new URL(e.url, raizPublica);
    const r = await solicitar(objetivo.href, {
      cache: 'no-store',
      headers: { 'Cache-Control': 'no-cache', Pragma: 'no-cache' },
      signal: AbortSignal.timeout(12000)
    });
    if (!r.ok) throw new Error('HTTP ' + r.status + ' al consultar ' + e.etiqueta);
    const publicado = Buffer.from(await r.arrayBuffer());
    const esperado = leer(e.ruta);
    if (!publicado.equals(esperado)) {
      throw new Error('Publicación distinta de la revisión local en ' + e.etiqueta +
        ' (local SHA256 ' + huella(esperado).slice(0, 12) +
        ', público SHA256 ' + huella(publicado).slice(0, 12) + ')');
    }
    comprobados.push({ ruta: e.etiqueta, sha256: huella(publicado) });
  }
  return { version, comprobados, url: raizPublica.href };
}

function resumen(estado, datos, error) {
  const version = datos?.version || planDeVersion().version;
  const lines = [
    '## Certificación de versión publicada',
    '',
    '**Resultado:** ' + estado,
    '**Versión esperada:** ' + version,
    '**Commit esperado:** ' + (process.env.GITHUB_SHA || 'ejecución local'),
    '**Sitio:** ' + (datos?.url || process.env.PUBLIC_BASE_URL || predeterminada),
    ''
  ];
  if (datos) {
    lines.push('Se compararon ' + datos.comprobados.length +
      ' respuestas públicas con archivos locales mediante igualdad íntegra de bytes (SHA-256).',
      '', '| Recurso | SHA-256 |', '|---|---|');
    for (const c of datos.comprobados)
      lines.push('| ' + c.ruta + ' | ' + c.sha256.slice(0, 16) + '… |');
  }
  if (error) lines.push('**Fallo:** ' + String(error.message || error));
  if (process.env.GITHUB_STEP_SUMMARY)
    fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, lines.join('\n') + '\n');
  return lines.join('\n');
}

async function principal() {
  const reintentar = process.argv.includes('--retry');
  const intentos = reintentar ? 28 : 1;
  let ultimo;
  for (let i = 1; i <= intentos; i++) {
    try {
      const datos = await verificarUnaVez(
        process.env.PUBLIC_BASE_URL || predeterminada);
      console.log('CERTIFICADO: versión ' + datos.version +
        ', ' + datos.comprobados.length + ' respuestas públicas coinciden.');
      console.log(resumen('CONFIRMADA', datos));
      return;
    } catch (e) {
      ultimo = e;
      console.error('Certificación intento ' + i + '/' + intentos +
        ': ' + e.message);
      if (i < intentos) await dormir(15000);
    }
  }
  console.error(resumen('NO CERTIFICADA', null, ultimo));
  process.exitCode = 1;
}

module.exports = { planDeVersion, verificarUnaVez };
if (require.main === module) principal().catch(e => {
  console.error('Certificación no realizada: ' + e.message);
  process.exitCode = 1;
});
