'use strict';
// Pruebas de regresión sin dependencias: node tests/verificar.js
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const data = fs.readFileSync(path.join(root, 'js/datos.js'), 'utf8');
const app = fs.readFileSync(path.join(root, 'js/app.js'), 'utf8');
const core = app.slice(0, app.indexOf('/* ===== APLICACIÓN'));
const helpers = app.slice(app.indexOf('const COMPONENT_LABELS'), app.indexOf('const norm ='));
const migration = app.match(/function fixMalla\(s\) \{[\s\S]*?\n\}/)?.[0];

assert(core.includes('function compute(S)'), 'Falta el núcleo de cálculo');
assert(helpers.includes('function creditStatus(m, r)'), 'Falta la comprobación de créditos');
assert(migration, 'Falta la adaptación de escenarios anteriores');

// Se evalúa el código real del núcleo, sin ejecutar la interfaz ni usar el DOM.
const api = new Function(
  data + '\n' + core +
  '\nlet S = fromRaw(RAW); const esc = s => String(s);\n' +
  helpers + '\n' + migration +
  '\nreturn { RAW, fromRaw, compute, clone, fixMalla, creditRuleFor, creditStatus, setState: s => { S = s; }, getState: () => S };'
)();

function comprobar(nombre, fn) {
  fn();
  console.log('OK  ' + nombre);
}

comprobar('59 asignaturas y totales por componente', () => {
  assert.equal(api.RAW.malla.length, 59);
  const total = {};
  api.RAW.malla.forEach(([, , , cr, comp]) => { total[comp] = (total[comp] || 0) + cr; });
  assert.deepEqual(total, { B: 56, C: 87, N: 12, L: 36 });
});

comprobar('cálculos de interferencias sin cambios en datos originales', () => {
  const R = api.compute(api.fromRaw(api.RAW));
  assert.equal(R.names.length, 16);
  assert.equal(R.pairs.length, 120);
  assert.equal(R.totalPairs, 20);
  assert.equal(R.totalClash, 67);
  assert.equal(R.totalCombos, 389);
});

comprobar('sin bloques horarios no hay interferencias', () => {
  const s = api.fromRaw(api.RAW);
  s.bloques = [];
  assert.equal(api.compute(s).totalClash, 0);
});

comprobar('TPI utiliza créditos disciplinares anteriores', () => {
  const S = api.fromRaw(api.RAW);
  api.setState(S);
  const m = S.malla.find(x => x.n === 'Taller de Proyectos Interdisciplinarios');
  const r = api.creditRuleFor(m.n);
  const q = api.creditStatus(m, r);
  assert.equal(r.scope, 'C');
  assert.equal(q.total, 36);
  assert.equal(q.low, true);
  m.s = 10;
  assert.equal(api.creditStatus(m, r).low, false);
});

comprobar('Proyecto Aplicado y Trabajo de Grado usan créditos previos del plan', () => {
  const S = api.fromRaw(api.RAW);
  api.setState(S);
  for (const [nombre, total] of [['Proyecto Aplicado de Ingeniería', 145], ['Trabajo de Grado', 161]]) {
    const m = S.malla.find(x => x.n === nombre), r = api.creditRuleFor(nombre);
    assert.equal(r.scope, 'PLAN');
    assert.equal(api.creditStatus(m, r).total, total);
    assert.equal(api.creditStatus(m, r).low, false);
  }
});

comprobar('archivo anterior sin tipologías sigue siendo recuperable', () => {
  const old = api.fromRaw(api.RAW);
  delete old.reqCred;
  old.malla.forEach(m => { delete m.comp; delete m.car; });
  old.malla.find(m => m.n === 'Cálculo Diferencial').s = 2;
  const recovered = api.fixMalla(JSON.parse(JSON.stringify(old)));
  assert.equal(recovered.malla.find(m => m.n === 'Cálculo Diferencial').s, 2);
  assert.equal(recovered.malla.find(m => m.n === 'Cálculo Diferencial').comp, 'B');
  assert.equal(recovered.reqCred.length, 3);
});

comprobar('cambio de carácter a «No aplica» se conserva', () => {
  const s = api.fromRaw(api.RAW);
  const m = s.malla.find(x => x.n === 'Cálculo Diferencial');
  m.car = '';
  const recovered = api.fixMalla(JSON.parse(JSON.stringify(s)));
  assert.equal(recovered.malla.find(x => x.n === 'Cálculo Diferencial').car, '');
});

console.log('Todas las comprobaciones terminaron correctamente.');
