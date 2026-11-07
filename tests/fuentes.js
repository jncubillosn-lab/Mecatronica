'use strict';
// Pruebas de fuentes independientes y datos parciales: node tests/fuentes.js
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname, '..');
const read = p => fs.readFileSync(path.join(root, p), 'utf8');
const payload = read('js/catalogo.js') + '\n' + read('js/oferta-fuente.js') + '\n' +
  read('js/datos.js') + '\n' + read('js/fuentes.js') +
  '\nreturn { CATALOGO_ACADEMICO, OFERTA_ACADEMICA, RAW, FuentesAcademicas };';
const { CATALOGO_ACADEMICO, OFERTA_ACADEMICA, RAW, FuentesAcademicas } = new Function(payload)();
const fuentes = new FuentesAcademicas({
  catalogo: CATALOGO_ACADEMICO,
  oferta: OFERTA_ACADEMICA,
  malla: RAW.malla,
  vinculosCatalogo: RAW.vinculosCatalogo
});
function comprobar(nombre, trabajo) { trabajo(); console.log('OK: '+ nombre); }

comprobar('Las fuentes se conservan por separado sin duplicar registros por código', () => {
  assert.equal(new Set(CATALOGO_ACADEMICO.map(x=>x.codigo)).size, CATALOGO_ACADEMICO.length);
  assert.equal(new Set(OFERTA_ACADEMICA.map(x=>x.codigo)).size, OFERTA_ACADEMICA.length);
  assert(RAW.malla.length > 0);
});

comprobar('Los vínculos de malla se basan solo en correspondencias explícitas', () => {
  RAW.vinculosCatalogo.forEach(([nombre,codigo]) => {
    assert(fuentes.posicion(nombre));
    assert(fuentes.consultar(codigo).catalogo);
    assert(fuentes.consultarPosicion(nombre).catalogo);
  });
  const sinCodigo = RAW.malla.find(x=>!fuentes.codigoEnMalla(x[0]));
  if (sinCodigo) {
    const dato=fuentes.consultarPosicion(sinCodigo[0]);
    assert.equal(dato.catalogo,null);
    assert.equal(dato.oferta,null);
  }
});

comprobar('Inglés figura como Nivelación en la malla y como E en el catálogo', () => {
  const ingles=RAW.malla.filter(x=>/^Inglés (I|II|III|IV)$/.test(x[0]));
  assert(ingles.length>0);
  for (const item of ingles){
    const dato=fuentes.consultarPosicion(item[0]);
    assert.equal(item[4],'N');
    assert.equal(dato.catalogo?.tipologia,'E');
  }
  assert(RAW.componentes.some(([id,,enPlan])=>id==='N'&&enPlan===false));
  assert(!RAW.componentes.some(([id])=>id==='LE'));
});

comprobar('Los grupos sin horario siguen existiendo en la referencia', () => {
  const sinHorario=OFERTA_ACADEMICA.flatMap(c=>c.actividades.flatMap(a=>(a.grupos||[])
    .filter(g=>g.horarios.length===0).map(g=>({codigo:c.codigo,g}))));
  assert(sinHorario.length>0);
  sinHorario.forEach(({codigo,g})=> {
    assert(fuentes.grupos(codigo).some(x=>x.id===g.id));
  });
});

comprobar('Los cupos cero no se interpretan como ausencia de grupo', () => {
  const dato=OFERTA_ACADEMICA.find(c=>c.actividades.some(a=>a.grupos.some(g=>g.cuposDisponibles===0)));
  assert(dato);
  assert(fuentes.grupos(dato.codigo).some(g=>g.cuposDisponibles===0));
});

comprobar('La ausencia de datos devuelve null o colecciones vacías sin fallar', () => {
  const parcial=new FuentesAcademicas({catalogo:[{codigo:'ABC',nombre:'Una'}]});
  assert.equal(parcial.consultar('ABC').oferta,null);
  assert.equal(parcial.consultar('ABC').posiciones.length,0);
  assert.deepEqual(parcial.grupos('ABC'),[]);
  assert.deepEqual(parcial.bloques('ABC'),[]);
  assert.equal(parcial.consultar('OTRA').catalogo,null);
  assert.deepEqual(new FuentesAcademicas().grupos('SIN-DATOS'),[]);
});

comprobar('La fuente de oferta mantiene sus actividades sin emparejarlas automáticamente', () => {
  const varios=OFERTA_ACADEMICA.find(c=>c.actividades.length>1);
  assert(varios);
  const todos=varios.actividades.reduce((n,a)=>n+a.grupos.length,0);
  assert.equal(fuentes.grupos(varios.codigo).length,todos);
  const bloques=fuentes.bloques(varios.codigo);
  assert(bloques.every(b=>b.actividad&&b.grupo&&b.dia&&b.inicio&&b.fin));
});

console.log('Comprobaciones de fuentes finalizadas.');
