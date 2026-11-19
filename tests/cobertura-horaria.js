'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { EntradaAcademica } = require('../js/entrada.js');
global.EntradaAcademica = EntradaAcademica;
const { fromRaw, compute } = require('../js/analisis.js');

const leer = id => JSON.parse(fs.readFileSync(
  path.join(__dirname, '..', 'datos', 'programas', id, 'academico.json'), 'utf8'));
const ref = leer('mecatronica');
const franjas = bloques => bloques.map(({dia, inicio, fin}) => [dia, inicio, fin]);
const hora = minutos => Number(minutos.slice(0, 2)) + Number(minutos.slice(3)) / 60;
const sinPosicion = {
  electronica: ['2016488'],
  mecanica: [],
  quimica: ['2024045', '2017256', '1000038-B', '2024929', '2015729', '2015738', '2015739']
};

function comprobarReferencia(d, codigo, etiquetaComponente) {
  const agrupar = base => {
    const posicion = base.malla.find(p => p.codigoAsignatura === codigo);
    return base.agrupaciones.filter(g => g.posicionId === posicion.id);
  };
  const origen = agrupar(ref), destino = agrupar(d);
  assert.deepEqual(destino.map(g => g.etiqueta), origen.map(g => g.etiqueta));
  for (const [i, g] of destino.entries()) {
    assert.notEqual(g.analizable, false);
    assert.deepEqual(g.componentes.map(c => [etiquetaComponente(c.id), franjas(c.bloques)]),
      origen[i].componentes.map(c => [c.id, franjas(c.bloques)]));
  }
}

for (const id of Object.keys(sinPosicion)) {
  const d = leer(id);
  const posiciones = new Map(d.malla.map(p => [p.id, p]));
  const materiaDe = new Map();
  const vistos = new Set();
  const excluidas = new Set(d.exclusionesAgrupacion.map(x => x.posicionId));
  const oferta = new Map();
  const estado = fromRaw(new EntradaAcademica(d).generarEscenarioBase());
  const resultado = compute(estado);
  for (const curso of d.oferta) for (const a of curso.actividades) for (const g of a.grupos) {
    const key = a.id + ':G' + g.id;
    assert(!oferta.has(key), 'Identidad de oferta repetida: ' + key);
    oferta.set(key, {curso, g});
  }
  for (const ag of d.agrupaciones) {
    const materia = posiciones.get(ag.posicionId).nombre;
    const grupo = resultado.allGroupsOf[materia].find(g => g.ref === ag.id);
    assert(grupo);
    assert.equal(resultado.groupsOf[materia].includes(grupo), ag.analizable !== false);
    if (excluidas.has(ag.posicionId)) {
      assert.equal(ag.analizable, false);
      assert.equal(ag.componentes.length, 1);
    }
    const bloquesEsperados = [];
    for (const c of ag.componentes) {
      const {curso, g} = oferta.get(c.id);
      assert.equal(sinPosicion[id].includes(curso.codigoAsignatura), false);
      assert(!/PEAMA|ORINOQUIA/i.test([g.nombre, g.facultad].join(' ')));
      assert.notEqual(g.duracion, 'Validación');
      assert.deepEqual(franjas(c.bloques), franjas(g.horarios), id + '/' + c.id);
      assert(!materiaDe.has(c.id) || materiaDe.get(c.id) === materia);
      materiaDe.set(c.id, materia);
      vistos.add(c.id);
      bloquesEsperados.push(...g.horarios.map(b => [b.dia, hora(b.inicio), hora(b.fin)]));
    }
    assert.deepEqual(resultado.gBlocks(grupo).map(b => [b.d, b.s, b.e]), bloquesEsperados);
  }
  for (const [key, {curso, g}] of oferta) {
    const soloOferta = sinPosicion[id].includes(curso.codigoAsignatura) ||
      g.duracion === 'Validación' || /PEAMA/i.test(g.nombre);
    assert.equal(vistos.has(key), !soloOferta, id + '/' + key);
  }
  // El lector comparte bloques por actividad aunque varios grupos la utilicen.
  assert.equal(estado.bloques.length,
    [...vistos].reduce((n, key) => n + oferta.get(key).g.horarios.length, 0));

  // Oráculo a partir de las franjas de la oferta, independiente del motor.
  const horariosPorGrupo = new Map(d.agrupaciones.map(ag => [ag.id,
    ag.componentes.flatMap(c => oferta.get(c.id).g.horarios)]));
  let comparaciones = 0, cruces = 0;
  for (const p of resultado.pairs) {
    const opcionesA = resultado.groupsOf[p.A], opcionesB = resultado.groupsOf[p.B];
    const matriz = opcionesA.map(a => opcionesB.map(b => horariosPorGrupo.get(a.ref).some(x =>
      horariosPorGrupo.get(b.ref).some(y => x.dia === y.dia && x.inicio < y.fin && y.inicio < x.fin))));
    const total = opcionesA.length * opcionesB.length;
    assert.equal(p.total, total);
    assert.deepEqual(p.matrix, matriz);
    assert.equal(p.clash, matriz.flat().filter(Boolean).length);
    if (!total) {
      assert.equal(p.enRango, 0);
      assert.equal(p.nivel, 'sin grupos comparables');
    }
    if (p.enRango) { comparaciones += total; cruces += p.clash; }
  }
  assert.equal(resultado.totalCombos, comparaciones);
  assert.equal(resultado.totalClash, cruces);
  if (id === 'electronica') comprobarReferencia(d, '2016493', comp => {
    const [, , actividad, grupo] = comp.split(':');
    return (actividad === '1' ? 'M' : 'L') + grupo.slice(1);
  });
  if (id === 'mecanica') comprobarReferencia(d, '2017265', comp => {
    const [, , actividad, grupo] = comp.split(':');
    return actividad === '1' ? 'T' + grupo.slice(1) : 'Mag';
  });
  console.log(`OK ${id}: ${vistos.size}/${oferta.size} grupos de actividad proyectados, ${estado.bloques.length} franjas; matriz y totales verificados.`);
}
