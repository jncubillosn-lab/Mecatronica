'use strict';
// Prueba de integridad entre entrada NORMALIZADA y escenario efectivo.
// node tests/oferta-activa.js
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {EntradaAcademica}=require('../js/entrada.js');
const contrato=JSON.parse(fs.readFileSync(path.join(__dirname,'../datos/programas/mecatronica/academico.json'),'utf8'));
const lector=new EntradaAcademica(contrato);
const raw=lector.generarEscenarioBase();
const nombres=new Map(contrato.malla.map(p=>[p.id,p.nombre]));
const generados=new Map(raw.bl.map(b=>[b[6],b]));
const grupos=new Set(raw.gr.map(g=>g[0]+'\u0001'+g[1]));
const esperados=new Map();
for(const opcion of contrato.agrupaciones){
 const nombre=nombres.get(opcion.posicionId);
 assert(nombre,'Agrupación sin posición');
 assert(grupos.has(nombre+'\u0001'+opcion.etiqueta),'Grupo omitido: '+nombre+' '+opcion.etiqueta);
 const compacto=opcion.componentes.length>2;
 for(const componente of opcion.componentes){
   const codigo=compacto?opcion.etiqueta:componente.id;
   componente.bloques.forEach((horario,i)=>{
     const id=opcion.posicionId+'\u0001'+(compacto?opcion.etiqueta+'\u0001'+componente.id:componente.id)+'\u0001'+i;
     const valor=[nombre,codigo,horario.dia,lector.hora(horario.inicio),lector.hora(horario.fin),horario.nota||null];
     if(esperados.has(id))assert.deepEqual(esperados.get(id),valor,'Bloque compartido contradictorio');
     esperados.set(id,valor);
   });
 }
}
assert.equal(generados.size,esperados.size,'Se omitieron o duplicaron bloques');
for(const [ref,valor]of esperados){
 const bloque=generados.get(ref);
 assert(bloque,'Bloque no generado: '+ref);
 assert.deepEqual(bloque.slice(0,6),valor,'Horario incorrecto: '+ref);
}
const conAgrupacion=new Set(contrato.agrupaciones.map(g=>g.posicionId));
assert.equal(raw.asg.length,conAgrupacion.size,'No se incorporaron asignaturas con grupos');
console.log('OK: escenario generado sin omisiones ni alteraciones de días, horas y actividades.');
