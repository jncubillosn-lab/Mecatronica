'use strict';
// Pruebas independientes de los números vigentes del plan: node tests/verificar.js
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname, '..');
const data = fs.readFileSync(path.join(root, 'js/datos.js'), 'utf8');
const app = fs.readFileSync(path.join(root, 'js/app.js'), 'utf8');
const core = app.slice(0, app.indexOf('/* ===== APLICACIÓN'));
const helpers = app.slice(app.indexOf('function compName(id)'), app.indexOf('const norm ='));
const migration = app.match(/function fixMalla\(s\) \{[\s\S]*?\n\}/)?.[0];
assert(core.includes('function compute(S)'));
assert(helpers.includes('function creditStatus(m, r)'));
assert(migration);

const api = new Function(
  data + '\n' + core +
  '\nlet S=fromRaw(RAW); const esc=x=>String(x);\n' +
  helpers + '\n' + migration +
  '\nreturn { RAW, fromRaw, compute, clone, overlap, fixMalla, creditRuleFor, creditStatus, setState: x => S=x };'
)();

function verificar(nombre, fn) {
  fn();
  console.log('OK  ' + nombre);
}

verificar('Todos los componentes y requisitos provienen de los datos', () => {
  const S = api.fromRaw(api.RAW);
  const catalogo = new Set(S.tipos.componentes.map(x => x.id));
  for (const m of S.malla) {
    assert(catalogo.has(m.comp), 'Componente desconocido en ' + m.n);
    assert(Number.isFinite(m.cr), 'Créditos no numéricos en ' + m.n);
  }
  for (const r of S.reqCred) {
    assert(S.malla.some(m => m.n === r.n));
    assert(Number.isFinite(r.min));
    assert(r.componentes.length > 0);
    assert(r.componentes.every(c => catalogo.has(c)));
  }
});

verificar('Los resultados horarios no dependen de las tipologías', () => {
  const base = api.fromRaw(api.RAW);
  const modificado = api.clone(base);
  modificado.malla.forEach(m => { m.comp = 'otro'; m.car = 'otro'; });
  const metricas = s => {
    const r = api.compute(s);
    return [r.totalPairs, r.totalClash, r.totalCombos, r.pairs.map(p => [p.key,p.clash,p.total])];
  };
  assert.deepEqual(metricas(base), metricas(modificado));
});

verificar('Los requisitos se calculan usando los valores de la malla cargada', () => {
  const S = api.fromRaw(api.RAW);
  api.setState(S);
  for (const r of S.reqCred) {
    const m = S.malla.find(x => x.n === r.n);
    const total = S.malla.filter(x => x.s < m.s && r.componentes.includes(x.comp))
      .reduce((sum, x) => sum + x.cr, 0);
    const resultado = api.creditStatus(m, r);
    assert.equal(resultado.total, total);
    assert.equal(resultado.low, total < r.min);
  }
});

verificar('Cambiar créditos, semestres y componentes no requiere cambiar el algoritmo', () => {
  const D = {
    malla: [
      ['Fundamento',1,'',2,'F','obl'],
      ['Especialidad',2,'',5,'E','obl'],
      ['Proyecto',3,'',2,'E','obl']
    ],
    componentes: [['F','Fundamento'],['E','Especialidad']],
    caracteres: [['obl','Obligatoria']],
    reqCred: [['Proyecto',7,['E']]],
    asg: [], pre: [], gr: [], bl: []
  };
  const S = api.fromRaw(D); api.setState(S);
  const m = S.malla.find(x => x.n === 'Proyecto'), r = S.reqCred[0];
  assert.equal(api.creditStatus(m,r).total,5);
  assert.equal(api.creditStatus(m,r).low,true);
  S.malla[1].cr = 8;
  assert.equal(api.creditStatus(m,r).total,8);
  assert.equal(api.creditStatus(m,r).low,false);
  S.malla[1].s = 3;
  assert.equal(api.creditStatus(m,r).total,0);
  r.componentes = ['F','E'];
  assert.equal(api.creditStatus(m,r).total,2);
});

verificar('Los escenarios guardados previamente siguen cargando', () => {
  const S = api.fromRaw(api.RAW);
  const cambiado = S.malla[0], semestre = cambiado.s + 1;
  cambiado.s = semestre;
  delete S.tipos; delete S.reqCred;
  S.malla.forEach(m => { delete m.comp; delete m.car; });
  const guardado = JSON.stringify({ S });
  const recuperado = api.fixMalla(JSON.parse(guardado).S);
  assert.equal(recuperado.malla[0].s,semestre);
  assert(recuperado.malla[0].comp);
  assert(recuperado.tipos.componentes.length);
  assert.equal(recuperado.reqCred.length, api.RAW.reqCred.length);
});

verificar('Se respeta el carácter «No aplica»', () => {
  const S = api.fromRaw(api.RAW);
  S.malla[0].car = '';
  const recuperado = api.fixMalla(api.clone(S));
  assert.equal(recuperado.malla[0].car,'');
});

verificar('Los grupos sin horarios no generan conflictos', () => {
  const S = api.fromRaw(api.RAW);
  S.bloques = [];
  assert.equal(api.compute(S).totalClash,0);
});

verificar('Bloques contiguos no chocan y bloques superpuestos sí', () => {
  assert.equal(api.overlap({d:'L',s:9,e:11},{d:'L',s:11,e:13}),false);
  assert.equal(api.overlap({d:'L',s:9,e:12},{d:'L',s:11,e:13}),true);
});

console.log('Comprobaciones finalizadas.');
