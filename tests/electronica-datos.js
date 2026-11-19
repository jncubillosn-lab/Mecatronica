'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {EntradaAcademica}=require('../js/entrada.js');
const root=path.resolve(__dirname,'..');
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
const d=read('datos/programas/electronica/academico.json');
const r=read('data/programas/electronica/revision-prerrequisitos-2026.json');
assert.equal(d.versionEsquema,1);
assert.equal(d.programa.id,'electronica');
assert.equal(d.programa.planId,'plan-2545');
assert.equal(d.malla.length,56);
assert.equal(new Set(d.malla.map(x=>x.id)).size,56);
assert.equal(d.catalogo.length,63);
assert.equal(new Set(d.catalogo.map(x=>x.codigo)).size,63);
assert.equal(d.oferta.length,23);
assert.equal(d.agrupaciones.length,31);
assert.equal(d.exclusionesAgrupacion.length,9);
assert(d.exclusionesAgrupacion.some(x=>x.codigoAsignatura==='2016493'));
const groups=d.oferta.flatMap(o=>o.actividades.flatMap(a=>a.grupos));
assert.equal(groups.length,146);
const peama=d.oferta.find(x=>x.codigoAsignatura==='2016502');
assert.equal(peama.actividades.flatMap(a=>a.grupos).filter(g=>g.id==='SUMA-01').length,2);
assert(peama.actividades.flatMap(a=>a.grupos).filter(g=>g.id==='SUMA-01').every(g=>g.horarios.length===0));
assert(!d.agrupaciones.some(x=>x.posicionId==='electronica:pos:7:2016493'));
const reserved=d.oferta.find(x=>x.codigoAsignatura==='2024045');
assert(reserved.actividades.flatMap(a=>a.grupos).some(g=>g.id==='40'));
assert(reserved.actividades.flatMap(a=>a.grupos).some(g=>g.id==='41'));
assert.equal(d.requisitos.prerrequisitos.length,32);
assert.equal(d.requisitos.minimosCreditos.length,3);
const pos=new Set(d.malla.map(x=>x.id));
const pairs=new Set();
for(const edge of d.requisitos.prerrequisitos){
 assert(pos.has(edge.desde)&&pos.has(edge.hasta));
 const id=edge.desde+'|'+edge.hasta;assert(!pairs.has(id));pairs.add(id);
}
for(const q of d.requisitos.minimosCreditos)assert(pos.has(q.destino));
assert.deepEqual(d.requisitos.minimosCreditos,[
 {destino:'electronica:pos:9:2016510',minimo:121,componentes:['B','C','L']},
 {destino:'electronica:pos:10:diseno-de-sistemas-electronicos',minimo:121,componentes:['B','C','L']},
 {destino:'electronica:pos:10:2015316',minimo:63,componentes:['C']}
]);
const credits={B:0,C:0,L:0,N:0},sem={};
for(const m of d.malla){assert(Object.hasOwn(credits,m.componente));credits[m.componente]+=m.creditos;if(m.semestre>0)sem[m.semestre]=(sem[m.semestre]||0)+m.creditos;}
assert.deepEqual(credits,{B:60,C:78,L:34,N:20});
assert.deepEqual([...Array(10)].map((_,i)=>sem[i+1]),[17,18,18,19,17,17,16,16,16,18]);
assert.equal(d.malla.find(x=>x.id==='electronica:pos:7:2016493')?.codigoAsignatura,'2016493');
assert(!d.malla.some(x=>x.id==='electronica:pos:8:optativa-sin-asignatura-especificada:10'));
assert.equal(d.malla.find(x=>x.id==='electronica:pos:10:diseno-de-sistemas-electronicos')?.codigoAsignatura,null);
assert.equal(r.programaId,'electronica');
assert.equal(r.condicionesOriginalesSIA.reduce((n,x)=>n+x.condiciones.length,0),27);
assert.equal(r.evidencias.filter(x=>x.fuente==='SIA-2026').length,23);
assert.equal(r.evidencias.filter(x=>x.fuente==='MALLA-2023').length,9);
assert.equal(r.condicionesPendientes.length,4);
const raw=new EntradaAcademica(d).generarEscenarioBase();
assert.equal(raw.pre.length,32);
assert.equal(raw.reqCred.length,3);
assert.equal(raw.gr.length,31);
assert(raw.bl.length>0);
console.log('OK: Electrónica, plan 2545 — malla, grupos, límites de créditos y evidencia.');
