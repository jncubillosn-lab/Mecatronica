'use strict';
// Pruebas del filtro de componentes. Ejecutar: node tests/filtros.js
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname, '..');
const modelo = fs.readFileSync(path.join(root, 'js/modelo.js'), 'utf8');
const datos = fs.readFileSync(path.join(root, 'js/datos.js'), 'utf8');
const app = fs.readFileSync(path.join(root, 'js/app.js'), 'utf8');
const antesEventos = app.slice(0, app.indexOf("document.addEventListener('click'"));

const analisis = fs.readFileSync(path.join(root, 'js/analisis.js'), 'utf8');
const codigo = modelo + '\n' + datos + '\n' + analisis + '\n' + antesEventos + '\n' +
  "render = () => {}; return { S, R, ui, getRV: () => RV, getRV0: () => RV0, pageInicio, pageInter, pageAsig, pageHeat, pageGrupos, pageHor, pageMalla, renderTop, changes, onAct };";
const tester = new Function('window','document',codigo)({ innerWidth:1200 }, {});
const { S, R, ui } = tester;
const original = JSON.stringify(S);
const cambiosOriginales = JSON.stringify(tester.changes());
const elegibles = new Set(new Function(datos + '\nreturn RAW.opciones.componentesComparables;')());
assert.deepEqual([...ui.componentes], [...elegibles]);
assert(!elegibles.has('L'), 'Libre elección no debe tener selector');
assert(!elegibles.has('LE'), 'Lengua Extranjera no debe confundirse con Nivelación');

const seleccionar = identificadores => {
  for (const id of elegibles) {
    if (ui.componentes.has(id) !== identificadores.includes(id)) {
      tester.onAct('comp-toggle',{comp:id},{},{preventDefault(){}});
    }
  }
  const resultado = tester.getRV();
  const asignaturas = new Set(S.malla.filter(m => identificadores.includes(m.comp)).map(m => m.n));
  assert.deepEqual(resultado.names.slice().sort(),S.asg.filter(n => asignaturas.has(n)).slice().sort());
  assert(tester.pageInicio().includes('Resumen de cruces de horario'));
  assert(tester.pageInter().includes('<h1>Interferencias</h1>'));
  assert(tester.pageHeat().includes('Mapa de calor'));
  assert.equal(JSON.stringify(S),original,'Ningún filtro debe modificar el escenario');
  assert.equal(JSON.stringify(tester.changes()),cambiosOriginales);
  return resultado;
};

const todas = seleccionar([...elegibles]);
assert.deepEqual(todas.pairs.map(p=>p.key).sort(),R.pairs.map(p=>p.key).sort(),
  'Con todos los componentes seleccionados se conservan los cruces actuales');
for (const componente of elegibles) {
  const solo = seleccionar([componente]);
  assert(solo.names.every(nombre=>S.malla.find(m=>m.n===nombre)?.comp===componente));
}
const sinSeleccion = seleccionar([]);
assert.equal(sinSeleccion.names.length,0);
assert.equal(sinSeleccion.pairs.length,0);
assert(tester.pageHeat().includes('0/0'));

for (const c1 of elegibles) for (const c2 of elegibles) {
  seleccionar(c1===c2?[c1]:[c1,c2]);
}
const restaurado = seleccionar([...elegibles]);
assert.deepEqual(restaurado.pairs.map(p=>p.key),todas.pairs.map(p=>p.key));

// Los filtros de informes no limitan la edición de la malla, grupos ni horarios.
seleccionar([]);
assert(tester.pageGrupos().includes('Dibujo básico'));
assert(tester.pageHor().includes('Horarios'));
assert(tester.pageMalla().includes('Prerrequisitos'));
assert(tester.renderTop().includes('data-comp="N"'));
assert(!tester.renderTop().includes('data-comp="L"'));
seleccionar([...elegibles]);

console.log('OK: filtros independientes, cálculos, mapa de calor, datos y edición.');
