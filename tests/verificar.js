'use strict';
// Pruebas del modelo de dominio; no dependen de totales fijos de Mecatrónica.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname, '..');
const data = fs.readFileSync(path.join(root, 'pruebas/historico/js/datos.js'), 'utf8');
const modelo = fs.readFileSync(path.join(root, 'js/modelo.js'), 'utf8');
const app = fs.readFileSync(path.join(root, 'js/app.js'), 'utf8');
const core = fs.readFileSync(path.join(root, 'js/analisis.js'), 'utf8');
const helpers = app.slice(app.indexOf('const planActual'), app.indexOf('const norm ='));
const migration = app.match(/function fixMalla\(s\) \{[\s\S]*?\n\}/)?.[0];
assert(core.includes('function compute(S)'));
assert(helpers.includes('const creditStatus ='));
assert(migration);

const api = new Function(
  modelo + '\n' + data + '\n' + core +
  '\nconst CONTEXTO = { estadoBase: fromRaw(RAW), opciones: RAW.opciones, incrementosOferta: RAW.incrementosOferta };' +
  '\nconst OPCIONES = CONTEXTO.opciones; let S = fromRaw(RAW); const esc = x => String(x);\n' +
  helpers + '\n' + migration +
  '\nreturn { RAW, fromRaw, compute, clone, overlap, maxSemester, fixMalla, creditRuleFor, creditStatus, PlanCurricular, CalendarioAcademico, setState: x => S=x };'
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
  const base = api.fromRaw(api.RAW), modificado = api.clone(base);
  modificado.malla.forEach(m => { m.comp = 'otro'; m.car = 'otro'; });
  const metricas = S => {
    const r = api.compute(S);
    return [r.totalPairs, r.totalClash, r.totalCombos, r.pairs.map(p => [p.key,p.clash,p.total])];
  };
  assert.deepEqual(metricas(base), metricas(modificado));
});

verificar('Las reglas cuentan los componentes de los datos cargados', () => {
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

verificar('Otra malla con valores distintos funciona sin cambiar el modelo', () => {
  const D = {
    malla: [
      ['Fundamento', 1, '', 2, 'F', 'obl'],
      ['Especialidad', 2, '', 5, 'E', 'obl'],
      ['Proyecto', 3, '', 2, 'E', 'obl']
    ],
    componentes: [['F','Fundamento',true],['E','Especialidad',true]],
    caracteres: [['obl','Obligatoria']],
    reqCred: [['Proyecto',7,['E']]],
    asg: [], pre: [], gr: [], bl: [],
    opciones: { distanciasIniciales:[0], excluirIndirectos:false }
  };
  const S = api.fromRaw(D);
  api.setState(S);
  const plan = new api.PlanCurricular(S);
  const m = plan.asignatura('Proyecto'), r = plan.requisitoCreditos('Proyecto');
  assert.equal(plan.evaluarCreditos(m,r).total,5);
  assert.equal(plan.evaluarCreditos(m,r).low,true);
  plan.ajustarCreditos('Especialidad',3);
  assert.equal(plan.evaluarCreditos(m,r).total,8);
  assert.equal(plan.evaluarCreditos(m,r).low,false);
  plan.moverSemestre('Especialidad',3);
  assert.equal(plan.evaluarCreditos(m,r).total,0);
  r.componentes = ['F','E'];
  assert.equal(plan.evaluarCreditos(m,r).total,2);
});

verificar('Los créditos desconocidos no producen falsas advertencias', () => {
  const S = api.fromRaw(api.RAW);
  const plan = new api.PlanCurricular(S);
  const regla = S.reqCred[0], materia = plan.asignatura(regla.n);
  const previa = S.malla.find(a => a.s < materia.s && regla.componentes.includes(a.comp));
  assert(previa);
  previa.cr = null;
  const q = plan.evaluarCreditos(materia, regla);
  assert.equal(q.unknown, true);
  assert.equal(q.low, false);
});

verificar('El número de semestres se toma de la malla', () => {
  const S = api.fromRaw(api.RAW);
  const actual = Math.max(1, ...S.malla.map(m => m.s));
  assert.equal(api.maxSemester(S), actual);
  S.malla.push({ n:'Otra',s:actual+2,nota:'',cr:2,comp:S.tipos.componentes[0].id,car:'' });
  assert.equal(api.maxSemester(S),actual+2);
});

verificar('Créditos del plan vs adicionales: componente, nunca nombre', () => {
  const S = api.fromRaw(api.RAW), plan = new api.PlanCurricular(S);
  const ex = S.malla.find(a => plan.componente(a.comp)?.enPlan === false);
  assert(ex);
  const antes = plan.resumenSemestre(ex.s);
  ex.n = 'Nombre que no contiene la palabra Inglés';
  assert.equal(plan.resumenSemestre(ex.s).adicionales,antes.adicionales);
  plan.componente(ex.comp).enPlan = true;
  assert.equal(plan.resumenSemestre(ex.s).adicionales,antes.adicionales - S.malla.filter(a => a.s === ex.s && a.comp===ex.comp).reduce((t,a)=>t+a.cr,0));
});

verificar('Objeto curricular edita datos y comprueba catálogos', () => {
  const S = api.fromRaw(api.RAW), plan = new api.PlanCurricular(S);
  const materia = S.malla[0], anterior = materia.cr;
  assert.equal(plan.ajustarCreditos(materia.n,1).cr,anterior+1);
  assert.equal(plan.ajustarCreditos(materia.n,-1).cr,anterior);
  assert.equal(plan.cambiarComponente(materia.n,S.tipos.componentes[0].id).comp,S.tipos.componentes[0].id);
  assert.equal(plan.cambiarComponente(materia.n,'NO_EXISTE'),null);
});

verificar('Calendario con días y horas distintos', () => {
  const calendario = new api.CalendarioAcademico({
    dias:[['A','Día Alfa','Alf'],['B','Día Beta','Bet']],
    inicio:8, fin:12
  });
  assert.deepEqual(calendario.ids(),['A','B']);
  assert.deepEqual(calendario.horas(),[8,9,10,11]);
  assert.equal(calendario.nombre('B'),'Día Beta');
});

verificar('La eliminación voluntaria de prerrequisitos persiste', () => {
  const S = api.fixMalla(api.fromRaw(api.RAW));
  const antiguo = S.pre[0];
  S.pre = S.pre.filter(p => p !== antiguo);
  const recuperado = api.fixMalla(api.clone(S));
  assert.equal(recuperado.pre.some(p => p.r===antiguo.r && p.t===antiguo.t),false);
});

verificar('Los escenarios antiguos se recuperan', () => {
  const S = api.fromRaw(api.RAW);
  const semestre = S.malla[0].s + 1;
  S.malla[0].s = semestre;
  delete S.tipos; delete S.reqCred;
  S.malla.forEach(m => { delete m.comp; delete m.car; });
  const recuperado = api.fixMalla(JSON.parse(JSON.stringify({ S })).S);
  assert.equal(recuperado.malla[0].s,semestre);
  assert(recuperado.malla[0].comp);
  assert(recuperado.tipos.componentes.length);
  assert.equal(recuperado.reqCred.length,api.RAW.reqCred.length);
});

verificar('Se conserva carácter «No aplica»', () => {
  const S = api.fromRaw(api.RAW);
  S.malla[0].car = '';
  assert.equal(api.fixMalla(api.clone(S)).malla[0].car,'');
});

verificar('Grupos sin horarios no generan conflictos', () => {
  const S = api.fromRaw(api.RAW);
  S.bloques = [];
  assert.equal(api.compute(S).totalClash,0);
});

verificar('Bloques contiguos no chocan y bloques superpuestos sí', () => {
  assert.equal(api.overlap({d:'L',s:9,e:11},{d:'L',s:11,e:13}),false);
  assert.equal(api.overlap({d:'L',s:9,e:12},{d:'L',s:11,e:13}),true);
});

console.log('Comprobaciones finalizadas.');
