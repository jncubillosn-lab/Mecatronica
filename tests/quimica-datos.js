'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {EntradaAcademica}=require('../js/entrada.js');
const raiz=path.resolve(__dirname,'..');
const read=p=>JSON.parse(fs.readFileSync(path.join(raiz,p),'utf8'));
const d=read('datos/programas/quimica/academico.json');
const rev=read('data/programas/quimica/revision-prerrequisitos-2026.json');
assert.equal(d.versionEsquema,1);
assert.equal(d.programa.id,'quimica');
assert.equal(d.malla.length,63);
assert.equal(new Set(d.malla.map(m=>m.id)).size,63);
assert.equal(d.catalogo.length,72);
assert.equal(new Set(d.catalogo.map(c=>c.codigo)).size,72);
assert.equal(d.oferta.length,29);
assert.equal(d.agrupaciones.length,48);
const grupos=d.oferta.flatMap(c=>c.actividades.flatMap(a=>a.grupos));
assert.equal(grupos.length,70);
const ort=d.oferta.find(c=>c.codigoAsignatura==='2015718');
assert.equal(ort.actividades.reduce((n,a)=>n+a.grupos.filter(g=>g.id==='ORIN-01').length,0),2);
assert(ort.actividades.every(a=>a.grupos.filter(g=>g.id==='ORIN-01')
  .every(g=>g.facultad==='SEDE ORINOQUIA')));
assert(d.agrupaciones.every(g=>g.posicionId!=='quimica:pos:9:2015737'));
assert.equal(d.requisitos.prerrequisitos.length,37);
assert.deepEqual(d.requisitos.minimosCreditos,[]);
const positions=new Set(d.malla.map(m=>m.id));
const pairs=new Set();
for(const r of d.requisitos.prerrequisitos){
 assert(positions.has(r.desde)&&positions.has(r.hasta),'Referencia no definida');
 assert(!pairs.has(r.desde+'|'+r.hasta),'Arista duplicada');
 pairs.add(r.desde+'|'+r.hasta);
}
const totals={B:0,C:0,L:0,N:0};
for(const m of d.malla){assert(Object.hasOwn(totals,m.componente));totals[m.componente]+=m.creditos;}
assert.deepEqual(totals,{B:69,C:75,L:36,N:20});
for(const [id,code] of [
 ['quimica:pos:3:biologia-molecular-y-celular','1000010-B'],
 ['quimica:pos:6:1000010','1000031-B'],
 ['quimica:pos:5:2015276','2015726']
])assert.equal(d.malla.find(m=>m.id===id)?.codigoAsignatura,code);
assert(!d.catalogo.some(c=>c.codigo==='1000010'),'Entrada histórica duplicada');
assert(d.catalogo.some(c=>c.codigo==='1000010-B'&&/Biolog/i.test(c.nombre)));
assert(d.catalogo.some(c=>c.codigo==='1000031-B'&&/Laboratorio/i.test(c.nombre)));
assert.equal(rev.programaId,'quimica');
assert.equal(rev.condicionesOriginalesSIA.reduce((n,x)=>n+x.condiciones.length,0),35);
assert.equal(rev.evidenciaAristas.filter(x=>x.tipo==='SIA-2026').length,28);
assert.equal(rev.evidenciaAristas.filter(x=>x.tipo==='MALLA-2013').length,9);
assert.equal(rev.condicionesPendientes.length,7);
assert(rev.condicionesPendientes.some(x=>x.tipo==='Y'));
const raw=new EntradaAcademica(d).generarEscenarioBase();
assert.equal(raw.pre.length,37);
assert.equal(raw.gr.length,48);
assert(raw.bl.length>0);
console.log('OK: Química — catálogo, malla, grupos, prerrequisitos y condiciones.');
