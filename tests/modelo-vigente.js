'use strict';
// RC-01/RC-04/RC-06: el núcleo se prueba solo con FuentesAcadémicas vigente.
// No lee js/datos.js, RAW histórico ni generadores externos.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const baseDir=path.join(__dirname,'..');
const read=p=>fs.readFileSync(path.join(baseDir,p),'utf8');
const {EntradaAcademica}=require('../js/entrada.js');
const {fromRaw,compute,overlap,maxSemester,PlanCurricular,CalendarioAcademico}
 =new Function(read('js/modelo.js')+'\n'+read('js/analisis.js')+
   '\nreturn {fromRaw,compute,overlap,maxSemester,PlanCurricular,CalendarioAcademico};')();
const fuente=JSON.parse(read('datos/academico.json'));
const crear=()=>fromRaw(new EntradaAcademica(fuente).generarEscenarioBase());
const copia=x=>JSON.parse(JSON.stringify(x));
function probar(etiqueta,fn){fn();console.log('OK '+etiqueta);}

probar('Modelo vigente y valores del contrato',()=>{
 const S=crear(),componentes=new Set(fuente.componentes.map(c=>c.id));
 assert.deepEqual([...new Set(S.malla.map(m=>m.comp))].every(c=>componentes.has(c)),true);
 assert.equal(S.reqCred.length,fuente.requisitos.minimosCreditos.length);
 assert(S.malla.every(m=>m.cr==null||Number.isFinite(m.cr)));
 assert(S.reqCred.every(r=>r.componentes.every(c=>componentes.has(c))));
});

probar('Cruces independientes de clasificación curricular, sin tocar horarios',()=>{
 const S=crear(),original=copia(S),cambiado=copia(S);
 cambiado.malla.forEach(m=>{m.comp='otra';m.car='otro';});
 const firma=x=>{const q=compute(x);return [q.totalPairs,q.totalClash,q.totalCombos,
   q.pairs.map(p=>[p.key,p.clash,p.total])];};
 assert.deepEqual(firma(S),firma(cambiado));
 assert.deepEqual(S,original);
});

probar('Créditos anteriores se cuentan solo por componentes declarados',()=>{
 const S=crear(),plan=new PlanCurricular(S);
 for(const r of S.reqCred){
   const m=plan.asignatura(r.n);
   const elegibles=S.malla.filter(x=>x.s<m.s&&r.componentes.includes(x.comp));
   const total=elegibles.reduce((sum,x)=>sum+(Number.isFinite(x.cr)?x.cr:0),0);
   const resultado=plan.evaluarCreditos(m,r);
   assert.equal(resultado.total,total);
   if(!resultado.unknown)assert.equal(resultado.low,total<r.min);
 }
});

probar('Plan de prueba con IDs arbitrarios y créditos desconocidos',()=>{
 const S={
  malla:[
    {n:'Base',s:1,cr:2,comp:'F',car:'obl'},
    {n:'Especialidad',s:2,cr:5,comp:'E',car:'obl'},
    {n:'Proyecto',s:3,cr:2,comp:'E',car:'obl'}],
  tipos:{componentes:[{id:'F',nombre:'Base',enPlan:true},{id:'E',nombre:'Especialidad',enPlan:true}],
    caracteres:[{id:'obl',nombre:'Obligatoria'}]},
  reqCred:[{n:'Proyecto',min:7,componentes:['E']}]
 };
 const plan=new PlanCurricular(S),m=plan.asignatura('Proyecto'),r=plan.requisitoCreditos('Proyecto');
 assert.equal(plan.evaluarCreditos(m,r).total,5);
 assert.equal(plan.evaluarCreditos(m,r).low,true);
 plan.ajustarCreditos('Especialidad',3);
 assert.equal(plan.evaluarCreditos(m,r).total,8);
 assert.equal(plan.evaluarCreditos(m,r).low,false);
 plan.moverSemestre('Especialidad',3);
 assert.equal(plan.evaluarCreditos(m,r).total,0);
 r.componentes=['F','E'];
 assert.equal(plan.evaluarCreditos(m,r).total,2);
 S.malla[0].cr=null;
 assert.equal(plan.evaluarCreditos(m,r).unknown,true);
 assert.equal(plan.evaluarCreditos(m,r).low,false);
});

probar('Nivelación fuera del plan y semestre máximo según datos',()=>{
 const S=crear(),plan=new PlanCurricular(S);
 const adicional=S.malla.find(m=>plan.componente(m.comp)?.enPlan===false);
 assert(adicional);
 const anterior=plan.resumenSemestre(adicional.s);
 adicional.n='Nombre sin pista de componente';
 assert.equal(plan.resumenSemestre(adicional.s).adicionales,anterior.adicionales);
 const max=maxSemester(S);
 S.malla.push({n:'Nueva posición',s:max+2,cr:3,comp:S.tipos.componentes[0].id,car:''});
 assert.equal(maxSemester(S),max+2);
});

probar('Edición curricular y calendario variables',()=>{
 const S=crear(),plan=new PlanCurricular(S),m=S.malla[0],ant=m.cr;
 assert.equal(plan.ajustarCreditos(m.n,1).cr,ant+1);
 assert.equal(plan.ajustarCreditos(m.n,-1).cr,ant);
 assert.equal(plan.cambiarComponente(m.n,'SIN-EQUIVALENCIA'),null);
 const cal=new CalendarioAcademico({dias:[['A','Alfa','A'],['B','Beta','B']],inicio:8,fin:12});
 assert.deepEqual(cal.ids(),['A','B']);
 assert.deepEqual(cal.horas(),[8,9,10,11]);
 assert.equal(cal.nombre('B'),'Beta');
});

probar('Horarios ausentes y bloques contiguos nunca inventan choques',()=>{
 const S=crear();
 S.bloques=[];
 assert.equal(compute(S).totalClash,0);
 assert.equal(overlap({d:'L',s:9,e:11},{d:'L',s:11,e:13}),false);
 assert.equal(overlap({d:'L',s:9,e:12},{d:'L',s:11,e:13}),true);
});
console.log('OK: modelo vigente verificado exclusivamente desde FuentesAcadémicas.');
