'use strict';
// Integración del sitio estático: navegación y carga de una sola entrada académica.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { JSDOM, VirtualConsole } = require('jsdom');

async function main() {
  const root = path.join(__dirname, '..');
  const errors = [];
  const vc = new VirtualConsole();
  vc.on('jsdomError', e => errors.push(e.message));
  const dom = await JSDOM.fromFile(path.join(root, 'index.html'), {
    resources: 'usable',
    runScripts: 'dangerously',
    pretendToBeVisual: true,
    virtualConsole: vc,
    beforeParse(window) {
      window.scrollTo = () => {};
      window.Element.prototype.scrollIntoView = () => {};
      window.fetch = async function (url) {
        assert.match(String(url), /^datos\/academico\.json(?:\?|$)/);
        return {
          ok: true,
          json: async () => JSON.parse(fs.readFileSync(
            path.join(root, 'datos/academico.json'), 'utf8'
          ))
        };
      };
    }
  });
  try {
    const d = dom.window.document;
    const start = Date.now();
    while (!d.querySelector('#view h1') && Date.now() - start < 12000) {
      await new Promise(resolve => setTimeout(resolve, 25));
    }
    assert(d.querySelector('#view h1'), 'La aplicación no inició después de leer el JSON');
    assert.equal(d.querySelectorAll('[data-act="nav"]').length >= 7, true);
    const titles = [
      ['inicio', 'Resumen de cruces'],
      ['inter', 'Interferencias'],
      ['asig', 'Asignaturas'],
      ['grupos', 'Grupos'],
      ['hor', 'Horarios'],
      ['heat', 'Mapa de calor'],
      ['malla', 'Prerrequisitos']
    ];
    for (const [page, heading] of titles) {
      const btn = d.querySelector('[data-act="nav"][data-p="' + page + '"]');
      assert(btn, 'No existe navegación ' + page);
      btn.click();
      assert(d.querySelector('#view h1')?.textContent.includes(heading),
        'No se presentó ' + heading);
    }
    assert(d.querySelector('#view h1'), 'La vista final está vacía');
    const scriptErrors = errors.filter(msg => /Uncaught|Could not load script/i.test(msg));
    assert.deepEqual(scriptErrors, [], 'Error en scripts de la aplicación: ' + scriptErrors.join(' | '));
    console.log('OK: carga normalizada y navegación de siete vistas en navegador simulado.');
  } finally {
    dom.window.close();
  }
}
main().catch(e => { console.error(e); process.exitCode = 1; });
