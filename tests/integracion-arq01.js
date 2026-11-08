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
    const contexto=dom.window.CONTEXTO_ACADEMICO;
    assert(contexto?.estadoBase,'El arranque no entregó el escenario académico base');
    assert.equal(Object.hasOwn(dom.window,'RAW'),false,
      'La proyección histórica no debe quedar como variable global');
    const fuente=JSON.parse(fs.readFileSync(path.join(root,'datos/academico.json'),'utf8'));
    assert.equal(contexto.estadoBase.grupos.length,fuente.agrupaciones.length);
    assert.equal(contexto.estadoBase.pre.length,fuente.requisitos.prerrequisitos.length);
    assert.equal(contexto.estadoBase.reqCred.length,fuente.requisitos.minimosCreditos.length);
    assert.equal(d.querySelectorAll('[data-act="nav"]').length >= 8, true);
    const titles = [
      ['inicio', 'Resumen de cruces'],
      ['inter', 'Interferencias'],
      ['asig', 'Asignaturas'],
      ['grupos', 'Grupos'],
      ['hor', 'Horarios'],
      ['heat', 'Mapa de calor'],
      ['demanda', 'Demanda de preinscripción'],
      ['malla', 'Prerrequisitos']
    ];
    for (const [page, heading] of titles) {
      const btn = d.querySelector('[data-act="nav"][data-p="' + page + '"]');
      assert(btn, 'No existe navegación ' + page);
      btn.click();
      assert(d.querySelector('#view h1')?.textContent.includes(heading),
        'No se presentó ' + heading);
    }
    // LIB-01: mostrar Libre elección exclusivamente en el grafo curricular.
    const beforeLibre=d.querySelector('.pill-stat')?.textContent;
    assert(d.querySelector('[data-act="m-libres"]')?.textContent.includes('36 cr'));
    assert.equal(d.querySelectorAll('#mcols .mcard-libre').length,12,
      'Las doce posiciones L de Mecatrónica vuelven a aparecer en Prerrequisitos');
    assert(d.querySelector('.malla-proyeccion-aviso'));
    assert.equal(d.querySelectorAll('#top [data-comp="L"]').length,0,
      'Libre elección no se incorpora al filtro global de ocho secciones');
    // El plan vigente de Mecatrónica ya estaba igual de equilibrado;
    // evitar cambiar arbitrariamente sus semestres en la proyección inicial.
    assert.equal(d.querySelector('.mcard-libre[data-n="Libre elección (II)"]')
      ?.closest('[data-sem]').dataset.sem,'2');
    d.querySelector('[data-act="m-equilibrar"]').click();
    assert(d.querySelector('[data-act="m-equilibrar"]').textContent.includes('Semestres registrados'));
    assert.equal(d.querySelector('.mcard-libre[data-n="Libre elección (II)"]')
      ?.closest('[data-sem]').dataset.sem,'2',
      'El cambio de modo no mueve los créditos registrados');
    d.querySelector('[data-act="m-equilibrar"]').click();
    d.querySelector('[data-act="m-libres"]').click();
    assert.equal(d.querySelectorAll('#mcols .mcard-libre').length,0,
      'El control local oculta solo las posiciones flexibles');
    d.querySelector('[data-act="m-libres"]').click();
    assert.equal(d.querySelectorAll('#mcols .mcard-libre').length,12);
    assert.equal(d.querySelector('.pill-stat')?.textContent,beforeLibre,
      'Los cambios visuales no generan modificaciones académicas');

    // RESP-01: el mapa permite explorar una malla extensa sin tocar el escenario.
    const mapa=d.querySelector('#malla-panel');
    assert(mapa && d.querySelector('#malla-stage') && d.querySelector('#canvas'),
      'La malla contiene un visor independiente con desplazamiento');
    assert(!mapa.querySelector('.sidecard'),
      'El panel de edición no forma parte de la vista ampliada del mapa');
    const estadoAntes=d.querySelector('.pill-stat')?.textContent;
    d.querySelector('[data-act="m-zoom"][data-dx="0.1"]').click();
    assert.equal(d.querySelector('.malla-zoom-etiqueta')?.textContent.trim(),'110 %');
    assert.equal(d.querySelector('#malla-stage')?.style.zoom,'1.1',
      'El zoom escala solo la presentación del mapa');
    d.querySelector('[data-act="m-zoom-reset"]').click();
    assert.equal(d.querySelector('.malla-zoom-etiqueta')?.textContent.trim(),'100 %');
    d.querySelector('[data-act="m-ampliar"]').click();
    assert(d.querySelector('#malla-panel.malla-panel--ampliado'));
    assert(d.body.classList.contains('mapa-ampliado'));
    assert.equal(d.querySelector('[data-act="m-ampliar"]')?.textContent,
      'Salir de pantalla completa');
    d.dispatchEvent(new dom.window.KeyboardEvent('keydown',{key:'Escape',bubbles:true}));
    assert(!d.body.classList.contains('mapa-ampliado'),'Escape cierra la vista ampliada');
    assert.equal(d.querySelector('.pill-stat')?.textContent,estadoAntes,
      'Zoom y ampliación no introducen cambios en el escenario');

    // DEM-01: sin encuesta, los resultados simulados se ven desde el primer
    // acceso sin almacenarse ni alterar el escenario personal.
    d.querySelector('[data-act="nav"][data-p="demanda"]').click();
    assert(d.querySelector('#view').textContent.includes('VISTA PREVIA · DATOS SIMULADOS'));
    assert(d.querySelector('#view').textContent.includes('Lectura y recomendaciones basadas en los datos'));
    assert(d.querySelectorAll('.dem-tabla tbody tr').length>0);
    const panel=d.querySelector('#view');
    const titulos=[...panel.querySelectorAll('h2')].map(h=>h.textContent.trim());
    assert.deepEqual(titulos,[
      'Mapa de demanda: solicitudes y grupos',
      'Comparación curricular por semestre',
      'Detalle estadístico',
      'Lectura y recomendaciones basadas en los datos',
      'Tabla estadística · ranking completo',
      'Demanda conjunta'
    ],'La gráfica y la lectura preceden la tabla, con demanda conjunta al final');
    assert.equal(panel.querySelectorAll('rect.dem-zona-alerta,rect.dem-zona-masiva,rect.dem-zona-baja,rect.dem-zona-amplia').length,4,
      'El gráfico incluye cuatro cuadrantes distinguibles');
    assert(panel.querySelectorAll('g.dem-marca').length>5,
      'La muestra contiene puntos seleccionables en el gráfico');
    assert(panel.querySelectorAll('g.dem-punto-alerta').length>0,
      'La simulación presenta casos en el cuadrante de alta demanda y pocos grupos');
    assert(panel.querySelectorAll('g.dem-punto-masiva').length>0,
      'La simulación presenta casos masivos de más grupos');
    assert(panel.querySelectorAll('.dem-caso').length>0,
      'Se presentan las asignaturas más concentradas en tarjetas legibles');
    // DEM-03: al seleccionar un punto debe aparecer su ASIGNATURA al lado
    // del gráfico, no exclusivamente en el detalle estadístico inferior.
    assert(d.querySelector('.dem-seleccion-ayuda'),
      'Antes de seleccionar aparece una indicación junto a la gráfica');
    const puntosAntes=[...d.querySelectorAll('g.dem-marca[data-pos]')];
    assert(puntosAntes.length>=2,'Se necesitan al menos dos puntos para comprobar la selección');
    const primero=puntosAntes[0],segundo=puntosAntes.find(x=>x.dataset.pos!==primero.dataset.pos);
    const id1=primero.dataset.pos,id2=segundo.dataset.pos;
    const etiqueta1=primero.querySelector('title').textContent.split(' · ')[0];
    primero.dispatchEvent(new dom.window.MouseEvent('click',{bubbles:true}));
    assert.equal(d.querySelector('.dem-seleccion-nombre')?.textContent,etiqueta1,
      'El clic identifica por nombre la asignatura junto a la gráfica');
    assert(d.querySelector('g.dem-marca[aria-pressed="true"][data-pos="'+id1+'"]'),
      'El punto elegido queda resaltado');
    assert(d.querySelector('.dem-etiqueta .dem-etiqueta-nombre')?.textContent,
      'Se muestra una etiqueta dentro de la propia gráfica');
    const otro=d.querySelector('g.dem-marca[data-pos="'+id2+'"]');
    const etiqueta2=otro.querySelector('title').textContent.split(' · ')[0];
    otro.dispatchEvent(new dom.window.MouseEvent('click',{bubbles:true}));
    assert.equal(d.querySelector('.dem-seleccion-nombre')?.textContent,etiqueta2,
      'Al hacer clic en otro punto se actualiza el nombre sin ambigüedad');
    assert(d.querySelector('g.dem-marca[aria-pressed="true"][data-pos="'+id2+'"]'),
      'El resaltado acompaña la segunda selección');
    const teclado=d.querySelector('g.dem-marca[data-pos="'+id1+'"]');
    teclado.dispatchEvent(new dom.window.KeyboardEvent('keydown',{key:'Enter',bubbles:true}));
    assert.equal(d.querySelector('.dem-seleccion-nombre')?.textContent,etiqueta1,
      'La selección mediante Enter muestra la misma asignatura');

    assert(panel.querySelector('.dem-edicion > summary'),
      'La edición de cantidades permanece disponible en el detalle');
    assert(d.querySelector('#top').textContent.includes('Datos de referencia del programa'), 'La vista previa no produce modificaciones');
    d.querySelector('[data-act="dem-ejemplo"]').click();
    assert(d.querySelector('#view').textContent.includes('DATOS SIMULADOS GUARDADOS'));
    assert(d.querySelector('#top [data-act="drawer-cambios"]'), 'Adoptar el ejemplo sí modifica el escenario personal');
        assert(d.querySelector('#view h1'), 'La vista final está vacía');
    const scriptErrors = errors.filter(msg => /Uncaught|Could not load script/i.test(msg));
    assert.deepEqual(scriptErrors, [], 'Error en scripts de la aplicación: ' + scriptErrors.join(' | '));
    console.log('OK: carga normalizada y navegación de ocho vistas en navegador simulado.');
  } finally {
    dom.window.close();
  }
}
main().catch(e => { console.error(e); process.exitCode = 1; });
