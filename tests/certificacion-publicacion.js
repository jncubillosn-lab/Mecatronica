'use strict';

/** Regresiones offline: detectar HTML y módulos realmente desfasados. */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { planDeVersion, verificarUnaVez } =
  require('../scripts/certificar-publicacion.js');
const raiz = path.resolve(__dirname, '..');
const base = 'https://ejemplo.test/Mecatronica/';

function servidorSimulado(variantes = {}) {
  return async url => {
    const u = new URL(url);
    let ruta = u.pathname.replace(/^\/Mecatronica\/?/, '') || 'index.html';
    if (ruta.startsWith('..')) return { ok: false, status: 400 };
    if (Object.hasOwn(variantes, ruta) && variantes[ruta] === null)
      return { ok: false, status: 404 };
    const bytes = Object.hasOwn(variantes, ruta)
      ? Buffer.from(variantes[ruta])
      : fs.readFileSync(path.join(raiz, ruta));
    return {
      ok: true, status: 200,
      arrayBuffer: async () => Uint8Array.from(bytes).buffer
    };
  };
}

(async () => {
  const plan = planDeVersion();
  assert(plan.referencias.includes('js/app.js?v=' + plan.version));
  assert(plan.referencias.includes('datos/programas/mecatronica/academico.json?v=' + plan.version));
  const bien = await verificarUnaVez(base, servidorSimulado(), 'prueba');
  assert.equal(bien.version, plan.version);
  assert.equal(bien.comprobados.length, plan.referencias.length + 3);

  const html = fs.readFileSync(path.join(raiz, 'index.html'), 'utf8');
  await assert.rejects(
    verificarUnaVez(base, servidorSimulado({
      'index.html': html.replace('content="' + plan.version + '"', 'content="0.8.0"')
    }), 'anterior'),
    /Publicación distinta.*página principal/);

  const app = fs.readFileSync(path.join(raiz, 'js/app.js'));
  await assert.rejects(
    verificarUnaVez(base, servidorSimulado({
      'js/app.js': Buffer.concat([app, Buffer.from('\n// archivo antiguo')])
    }), 'desincronizado'),
    /Publicación distinta.*js\/app\.js/);

  await assert.rejects(
    verificarUnaVez(base, servidorSimulado({ 'js/app.js': null }), 'ausente'),
    /HTTP 404.*js\/app\.js/);
  console.log('OK: certificación rechaza página vieja, JS diferente y recursos ausentes.');
})().catch(e => { console.error(e); process.exitCode = 1; });
