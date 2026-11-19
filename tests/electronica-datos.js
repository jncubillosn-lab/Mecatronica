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
assert.equal(d.agrupaciones.length,100);
assert.equal(d.exclusionesAgrupacion.length,2);
assert(!d.exclusionesAgrupacion.some(x=>x.codigoAsignatura==='2016493'));
const groups=d.oferta.flatMap(o=>o.actividades.flatMap(a=>a.grupos));
assert.equal(groups.length,125);
const peama=d.oferta.find(x=>x.codigoAsignatura==='2016502');
assert.equal(peama.actividades.flatMap(a=>a.grupos).filter(g=>g.id==='SUMA-01').length,2);
assert(peama.actividades.flatMap(a=>a.grupos).filter(g=>g.id==='SUMA-01').every(g=>g.horarios.length===0));
assert.equal(d.agrupaciones.filter(x=>x.posicionId==='electronica:pos:7:2016493').length,8);
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
// Regresión de la segunda exportación SIA: tres cupos sin descartar grupos.
function grupo(codigo,actividad,id){
 const curso=d.oferta.find(x=>x.codigoAsignatura===codigo);
 assert(curso,'Falta curso '+codigo);
 const act=curso.actividades.find(x=>x.id===actividad);
 assert(act,'Falta actividad '+actividad);
 const g=act.grupos.find(x=>x.id===id);
 assert(g,'Falta grupo '+id);
 return g;
}
assert.equal(grupo('2016502','2016502:act:1','1').cuposDisponibles,3);
assert.equal(grupo('2016502','2016502:act:2','1').cuposDisponibles,2);
assert.equal(grupo('2016509','2016509:act:1','4').cuposDisponibles,2);
assert.equal(r.actualizacionOfertaPosterior.cambiosCupos.length,3);
assert.equal(r.actualizacionOfertaPosterior.gruposExistentesPreservados,146);
const raw=new EntradaAcademica(d).generarEscenarioBase();
assert.equal(raw.pre.length,32);
assert.equal(raw.reqCred.length,3);
assert.equal(raw.gr.length,100);
assert(raw.bl.length>0);

assert.equal(d.oferta.reduce((n,o)=>n+o.actividades.length,0),33);
assert.equal(d.agrupaciones.filter(g=>g.analizable===false).length,26);
assert.equal(d.agrupaciones.filter(g=>g.analizable!==false).length,74);
assert.equal(raw.bl.length,174);
assert.equal(r.reconstruccionDesdeFuentes.resultados.agrupacionesNuevas,139);
assert.equal(r.reconstruccionDesdeFuentes.resultados.soloEnOferta,7);
const vinculadas = new Set(["2016493","2016490","2016496","2016497","2016498","2016499","2016502"]);
for (const codigo of vinculadas) {
 const curso = d.oferta.find(o => o.codigoAsignatura === codigo);
 const [principal, secundaria] = curso.actividades;
 const posicion = d.malla.find(p => p.codigoAsignatura === codigo);
 const opciones = d.agrupaciones.filter(g => g.posicionId === posicion.id);
 const esperados = secundaria.grupos.filter(g => /^\d+$/.test(g.id)).map(g => Number(g.id)).sort((a,b) => a-b);
 assert.equal(opciones.length, esperados.length);
 for (const k of esperados) {
   const ids = [principal.id + ':G' + Math.ceil(k/2), secundaria.id + ':G' + k];
   assert(opciones.some(g => g.analizable !== false && JSON.stringify(g.componentes.map(c => c.id)) === JSON.stringify(ids)), codigo + ' grupo ' + k);
 }
}
const wanted = new Map([
 ['2016499',['electronica:pos:6:2016499',4]],
 ['2016497',['electronica:pos:8:2016497',4]],
 ['2016493',['electronica:pos:7:2016493',8]],
 ['2016501',['electronica:pos:5:2016501',5]],
 ['2016502',['electronica:pos:1:2016502',2]],
 ['2028816',['electronica:pos:10:diseno-de-sistemas-electronicos',2]],
 ['2024045',['electronica:pos:9:2016510',1]]
]);
for(const [codigo,[id,n]] of wanted){
 const actual=d.agrupaciones.filter(g=>g.posicionId===id);
 assert.equal(actual.length,n,'Faltan grupos en '+codigo);
 assert(actual.every(g=>g.componentes.length===(vinculadas.has(codigo)?2:1)),'Número de componentes documentados');
}
const verify=new Map(d.agrupaciones.flatMap(g=>g.componentes.map(c=>[c.id,{grupo:g,bloques:c.bloques}])));
assert.equal(verify.size,120,'Cada actividad ofertada y proyectada tiene una identidad única');
let accounted=0,onlyOffer=0;
for(const curso of d.oferta)for(const actividad of curso.actividades)for(const grupo of actividad.grupos){
 const key=actividad.id+':G'+grupo.id;
 const item=verify.get(key);
 if(!item){
  onlyOffer++;
  assert(curso.codigoAsignatura==='2016488'
    || (curso.codigoAsignatura==='2016502'&&grupo.id==='SUMA-01'), 'Grupo ofertado omitido: '+key);
  continue;
 }
 accounted++;
 assert.equal(item.bloques.length,grupo.horarios.length,'Bloques de '+key);
 for(let i=0;i<grupo.horarios.length;i++){
  const src=grupo.horarios[i],out=item.bloques[i];
  assert.deepEqual([out.dia,out.inicio,out.fin],[src.dia,src.inicio,src.fin],'Franja incorrecta '+key);
 }
 if(curso.actividades.length>1 && !vinculadas.has(curso.codigoAsignatura))assert.equal(item.grupo.analizable,false,'Combinación no acreditada '+key);
}
assert.equal(accounted,120);
assert.equal(onlyOffer,5);
for(const nombre of ['Electrónica digital II','Electrónica de potencia','Control','Instrumentación y medidas','Introducción a ingeniería electrónica','Diseño de sistemas electrónicos']){
 assert(raw.asg.some(a=>a[0]===nombre),'Materia sin grupos en interfaz: '+nombre);
 assert(raw.bl.some(b=>b[0]===nombre),'Materia sin bloques de horario: '+nombre);
}
assert.equal(r.condicionesOriginalesSIA.reduce((n,x)=>n+x.condiciones.length,0),27);

console.log('OK: Electrónica, plan 2545 — malla, grupos, límites de créditos y evidencia.');
