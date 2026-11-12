'use strict';
// REQ-C-01: reglas específicas del plan de Mecatrónica introducidas como
// datos del contrato normalizado. No se fijan límites de otra carrera en el motor.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {EntradaAcademica}=require('../js/entrada.js');
const {PlanCurricular}=require('../js/modelo.js');
const d=JSON.parse(fs.readFileSync(path.join(__dirname,'../datos/programas/mecatronica/academico.json'),'utf8'));
const reglas=[
  {nombre:'Taller de Proyectos Interdisciplinarios',id:'mecatronica:pos:taller-de-proyectos-interdisciplinarios',codigo:'2024045',creditos:3,minimo:52},
  {nombre:'Proyecto Aplicado de Ingeniería',id:'mecatronica:pos:proyecto-aplicado-de-ingenieria',codigo:'2017275',creditos:4,minimo:65}
];
const proyeccion=new EntradaAcademica(d).generarEscenarioBase();
for(const item of reglas){
  const posiciones=d.malla.filter(x=>x.id===item.id);
  const catalogo=d.catalogo.filter(x=>x.codigo===item.codigo);
  const minimos=d.requisitos.minimosCreditos.filter(x=>x.destino===item.id);
  assert.equal(posiciones.length,1,'Debe existir una única posición '+item.codigo);
  assert.equal(catalogo.length,1,'Debe existir un único registro SIA '+item.codigo);
  assert.equal(minimos.length,1,'Debe haber un solo requisito para '+item.codigo);
  assert.equal(posiciones[0].nombre,item.nombre);
  assert.equal(posiciones[0].codigoAsignatura,item.codigo);
  assert.equal(posiciones[0].creditos,item.creditos);
  assert.equal(catalogo[0].creditos,item.creditos);
  assert.deepEqual(minimos[0].componentes,['C']);
  assert.equal(minimos[0].minimo,item.minimo);
  assert.equal(posiciones[0].nota,'Requiere '+item.minimo+' créditos aprobados del componente disciplinar (C)');
  // Integridad contrato único -> adaptador transitorio de la interfaz.
  const convertido=proyeccion.reqCred.find(r=>r[3]===item.id);
  assert(convertido,'No se proyectó el requisito de '+item.codigo);
  assert.equal(convertido[1],item.minimo);
  assert.deepEqual(convertido[2],['C']);
}
// El tercer mínimo no fue autorizado para modificarlo.
const grado=d.requisitos.minimosCreditos.find(r=>r.destino==='mecatronica:pos:trabajo-de-grado');
assert.equal(grado.minimo,69);
assert.deepEqual(grado.componentes,['B','C','L']);

// El cálculo de escenarios curriculares suma únicamente créditos C previos:
// B/L/N, aunque sumen muchos créditos, no satisfacen el requisito.
for(const item of reglas){
  const posicion={n:item.nombre,idPos:item.id,s:4,cr:item.creditos,comp:'C'};
  const estado={
    tipos:{componentes:d.componentes},
    malla:[
      {n:'Disciplinar previo',s:1,cr:item.minimo-1,comp:'C'},
      {n:'Fundamentación previo',s:2,cr:100,comp:'B'},
      {n:'Libre previo',s:2,cr:100,comp:'L'},
      {n:'Nivelación previo',s:2,cr:100,comp:'N'},
      posicion
    ],
    reqCred:[{n:item.nombre,posicionId:item.id,min:item.minimo,componentes:['C']}]
  };
  const plan=new PlanCurricular(estado),regla=plan.requisitoCreditos(item.nombre);
  const antes=plan.evaluarCreditos(posicion,regla);
  assert.equal(antes.total,item.minimo-1);
  assert.equal(antes.low,true,'B, L y N no sustituyen créditos C');
  estado.malla[0].cr++;
  const despues=plan.evaluarCreditos(posicion,regla);
  assert.equal(despues.total,item.minimo);
  assert.equal(despues.low,false,'La condición se cumple exactamente en su mínimo C');
}
console.log('OK: TPI (2024045) 3 cr/52 C; PAI (2017275) 4 cr/65 C, sin cambios de grado.');
