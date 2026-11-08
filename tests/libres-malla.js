'use strict';
// LIB-01: distribución VISUAL de Libre elección, no conversión de fuentes.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.join(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const s=read('js/vistas.js'),a=s.indexOf('function idComponenteLibre('),b=s.indexOf('function semHead(s, visibles)');
assert(a>=0&&b>a,'Los cálculos de la vista están documentados junto a la malla');
const {idComponenteLibre,proyeccionLibresMalla}=new Function(s.slice(a,b)+'\nreturn {idComponenteLibre,proyeccionLibresMalla};')();
const fuente=JSON.parse(read('datos/academico.json'));
const estado={
  tipos:{componentes:fuente.componentes},
  malla:fuente.malla.map(m=>({n:m.nombre,s:m.semestre,cr:m.creditos,comp:m.componente,idPos:m.id}))
};
const referencia=JSON.parse(JSON.stringify(estado));
const antes=JSON.stringify(estado);
assert.equal(idComponenteLibre(estado.tipos),'L');
const originales=proyeccionLibresMalla(estado,referencia,new Set(),false);
const equilibradas=proyeccionLibresMalla(estado,referencia,new Set(),true);
assert.equal(originales.creditos,36,'El contrato Mecatrónica informa 36 créditos L');
assert.equal(originales.posiciones.length,12,'Ya existen doce posiciones de 3 créditos');
assert(originales.posiciones.every(m=>m.cr===3&&!m._libreVirtual));
assert.deepEqual(originales.posiciones.map(m=>m.s),estado.malla.filter(m=>m.comp==='L').map(m=>m.s));
assert.equal(equilibradas.creditos,36);
assert.equal(equilibradas.posiciones.reduce((a,m)=>a+(m.cr||0),0),36);
assert.equal(equilibradas.cargas.reduce((a,n)=>a+n,0),179,
  'La carga del plan excluye los 12 créditos de Nivelación');
const amplitud=a=>Math.max(...a)-Math.min(...a);
assert(amplitud(equilibradas.cargas)<=amplitud(originales.cargas),
  'El equilibrado no puede empeorar la amplitud de cargas del plan');
assert.deepEqual(equilibradas.posiciones.map(m=>m.s),originales.posiciones.map(m=>m.s),
  'Si la malla original ya está igual de equilibrada se conservan sus semestres');
assert.equal(JSON.stringify(estado),antes,'La sugerencia no edita el escenario ni la fuente');

// Programa hipotético con 8 créditos L: 3 + 3 + 2, sin fijar 36.
const otra={
  tipos:{componentes:[
    {id:'F',nombre:'Fundamentación',enPlan:true},
    {id:'E',nombre:'Libre elección',enPlan:true},
    {id:'N',nombre:'Nivelación',enPlan:false}]},
  malla:[
    {n:'Base I',s:1,cr:12,comp:'F',idPos:'b1'},
    {n:'Base II',s:2,cr:4,comp:'F',idPos:'b2'},
    {n:'Nivelación',s:2,cr:90,comp:'N',idPos:'n'},
    {n:'Libres',s:2,cr:8,comp:'E',idPos:'l'}]
};
const otraAntes=JSON.stringify(otra);
const extra=proyeccionLibresMalla(otra,otra,new Set(),true);
assert.equal(idComponenteLibre(otra.tipos),'E','No depende del ID L');
assert.equal(extra.creditos,8);
assert.deepEqual(extra.posiciones.map(x=>x.cr),[3,3,2]);
assert(extra.posiciones.every(x=>x._libreVirtual),'No inventa asignaturas editables');
assert.equal(extra.cargas.reduce((a,n)=>a+n,0),24,'Nivelación no se suma');
assert.equal(JSON.stringify(otra),otraAntes);
// Un plan desbalanceado sí debe redistribuir posiciones visuales.
const desequilibrada=JSON.parse(JSON.stringify(otra));
desequilibrada.malla.find(m=>m.idPos==='b1').cr=3;
const previa=proyeccionLibresMalla(desequilibrada,desequilibrada,new Set(),false);
const mejorada=proyeccionLibresMalla(desequilibrada,desequilibrada,new Set(),true);
assert(amplitud(mejorada.cargas)<amplitud(previa.cargas),
  'Los totales de un plan desbalanceado se redistribuyen');
const fijo=proyeccionLibresMalla(otra,otra,new Set(['Libres']),true);
assert(fijo.posiciones.every(x=>x.s===2),'Una ubicación manual permanece fija');
const modificado=JSON.parse(JSON.stringify(otra));
modificado.malla.find(x=>x.idPos==='l').s=1;
const fijadoPorDelta=proyeccionLibresMalla(modificado,otra,new Set(),true);
assert(fijadoPorDelta.posiciones.every(x=>x.s===1),
  'Una edición guardada se respeta aunque la sesión no conozca el arrastre');
const sinDato=JSON.parse(JSON.stringify(otra));
sinDato.malla.find(x=>x.idPos==='l').cr=null;
const incompleta=proyeccionLibresMalla(sinDato,otra,new Set(),true);
assert.equal(incompleta.incompleto,true);
assert.equal(incompleta.creditos,0,'Un crédito desconocido no se inventa');
console.log('OK: Libre elección desde contrato, reparto y residuos sin mutar plan.');
