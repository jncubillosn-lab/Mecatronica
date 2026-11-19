'use strict';

/**
 * DAT-01: nueve fuentes académicas independientes; los contratos preliminares
 * no convierten ausencia de oferta en horarios ni grupos imaginarios.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {EntradaAcademica} = require('../js/entrada.js');
const identidad = require('../js/identidad.js');
const programas = require('../js/programas.js');
const {aplicarAjustes} = require('../scripts/aplicar-ajustes-academicos.js');
const raiz = path.resolve(__dirname, '..');
const leer = p => JSON.parse(fs.readFileSync(path.join(raiz,p), 'utf8'));
const ids = Object.keys(identidad.catalogo);
assert.equal(ids.length,9);
assert.deepEqual(Object.keys(programas.fuentes).sort(), ids.sort());
const esperado = {
 agricola:[66,61,0,0], civil:[66,60,0,0], electrica:[65,54,0,0],
 electronica:[63,56,23,93], industrial:[67,49,34,20],
 mecanica:[59,58,24,86], quimica:[72,63,29,56], sistemas:[96,55,0,0]
};
const ofertaDocumentada = new Set(['electronica','industrial','mecanica','quimica']);
for(const id of ids){
 const ruta = programas.fuentePara(id);
 assert.equal(ruta, 'datos/programas/'+id+'/academico.json');
 const data = leer(ruta);
 assert.equal(data.versionEsquema,1);
 assert.equal(data.programa.id,id);
 assert(new Set(data.malla.map(p=>p.id)).size===data.malla.length);
 const posiciones = new Set(data.malla.map(p=>p.id));
 const componentes = new Set(data.componentes.map(c=>c.id));
 for(const p of data.malla){
   assert(p.id.startsWith(id+':pos:') || id==='mecatronica');
   assert(Number.isInteger(p.semestre) && p.semestre>=0);
   assert(p.creditos==null || Number.isFinite(p.creditos));
   assert(!p.componente || componentes.has(p.componente));
 }
 for(const r of data.requisitos?.prerrequisitos || []){
   assert(posiciones.has(r.desde)&&posiciones.has(r.hasta),
     'Referencia de prerrequisito inexistente: '+id);
 }
 for(const r of data.requisitos?.minimosCreditos || []){
   assert(posiciones.has(r.destino),'Destino de créditos inexistente: '+id);
   assert((r.componentes||[]).every(c=>componentes.has(c)));
 }
 const proyeccion=new EntradaAcademica(data).generarEscenarioBase();
 assert.equal(proyeccion.malla.length,data.malla.length);
 assert.equal(proyeccion.programa.id,id);
 if(id!=='mecatronica'){
   assert.deepEqual([data.catalogo.length,data.malla.length,
     data.oferta.length,data.agrupaciones.length],esperado[id]);
   const idsAgrupaciones=data.agrupaciones.map(g=>g.id);
   assert.equal(new Set(idsAgrupaciones).size,idsAgrupaciones.length,
     'Agrupaciones duplicadas: '+id);
   for(const g of data.agrupaciones){
     assert(posiciones.has(g.posicionId),'Agrupación sin malla: '+id);
     assert(g.componentes?.length>0,'Sin componentes: '+id);
     const dias=new Set(data.configuracion.calendario.dias.map(d=>d.id));
     for(const c of g.componentes)for(const b of c.bloques||[]){
       assert(dias.has(b.dia),'Día fuera de calendario: '+id);
       assert(/^\d{2}:\d{2}$/.test(b.inicio)&&/^\d{2}:\d{2}$/.test(b.fin),
         'Franja inválida: '+id);
     }
   }
   assert.equal(proyeccion.gr.length,data.agrupaciones.length);
   if(ofertaDocumentada.has(id)){
     assert(data.oferta.length>0&&data.agrupaciones.length>0,
       'Falta oferta verificada: '+id);
     assert(proyeccion.bl.length>0,'No aparecen los bloques: '+id);
     const revision=leer('data/programas/'+id+'/revision-oferta-2026.json');
     assert.equal(revision.programa,id);
     assert(Array.isArray(revision.alertas));
     assert(Array.isArray(revision.condicionesPrerrequisitosPendientes));
   } else {
     assert.deepEqual(data.oferta,[],'No se debe inventar oferta: '+id);
     assert.deepEqual(data.agrupaciones,[],'No se deben inferir grupos: '+id);
     assert.deepEqual(proyeccion.bl,[]);
   }
 }
 const ajuste=leer('data/programas/'+id+'/ajustes.json');
 assert.equal(ajuste.versionAjustes,1);
 assert.equal(ajuste.programaId,id);
 assert(Array.isArray(ajuste.ajustes));
 if (['mecanica', 'quimica', 'electronica'].includes(id)) {
   const horarios = [
     {dia: 'L', inicio: '14:00', fin: '16:00'},
     {dia: 'X', inicio: '14:00', fin: '16:00'}
   ];
   const actividades = data.oferta.filter(o => o.codigoAsignatura === '2024045')
     .flatMap(o => o.actividades);
   const grupos = actividades.flatMap(a => a.grupos);
   assert.deepEqual(grupos.map(g => g.id), ['1'], 'Oferta única de TPI en ' + id);
   assert.deepEqual(grupos[0].horarios, horarios);
   const prefijo = actividades[0].id + ':G';
   const agrupacionesTpi = data.agrupaciones.filter(g =>
     g.componentes.some(c => c.id.startsWith(prefijo)));
   assert.equal(agrupacionesTpi.length, id === 'quimica' ? 0 : 1, 'Agrupaciones de TPI en ' + id);
   for (const grupo of agrupacionesTpi) {
     assert.equal(grupo.etiqueta, 'G1');
     assert.deepEqual(grupo.componentes.map(c => c.id), [prefijo + '1']);
     assert.deepEqual(grupo.componentes[0].bloques.map(({dia, inicio, fin}) =>
       ({dia, inicio, fin})), horarios);
   }
   assert(ajuste.ajustes.some(a => a.id === 'tpi-horario-grupo-unico'));
   assert.deepEqual(aplicarAjustes(data, ajuste).cambios, []);
 } else if (id !== 'mecatronica') {
   assert.deepEqual(ajuste.ajustes, []);
 }
}
// Regresión integral del contrato normalizado de Mecánica (malla 2018 + SIA 2026-2).
const mecanica=leer('datos/programas/mecanica/academico.json');
const suma={B:0,C:0,L:0,N:0};
for(const p of mecanica.malla)suma[p.componente]+=p.creditos;
assert.deepEqual(suma,{B:58,C:86,L:36,N:12});
assert.equal(mecanica.requisitos.prerrequisitos.length,41);
assert.equal(new Set(mecanica.requisitos.prerrequisitos.map(r=>r.desde+'|'+r.hasta)).size,41);
assert.deepEqual(mecanica.requisitos.minimosCreditos,[],
  'Los porcentajes sin base normativa verificada no son mínimos absolutos');
const conocidos=new Set(mecanica.malla.map(p=>p.id));
for(const r of mecanica.requisitos.prerrequisitos){
  assert(conocidos.has(r.desde)&&conocidos.has(r.hasta));
  assert.equal(r.metodo,'flecha');
}
const gruposMecanica=mecanica.oferta.flatMap(a=>a.actividades.flatMap(t=>t.grupos));
assert.equal(gruposMecanica.length,90);
assert.equal(gruposMecanica.filter(g=>g.horarios.length===0).length,3);
assert.equal(mecanica.agrupaciones.filter(g=>g.analizable!==false).length,55);
for(const c of ['2017278','2017265'])
  assert.equal(mecanica.malla.find(x=>x.codigoAsignatura===c).componente,'C');
const revisionMecanica=leer('data/programas/mecanica/revision-prerrequisitos-2026.json');
assert.equal(revisionMecanica.condicionesOriginalesSIA.length,30);
assert.equal(revisionMecanica.evidenciaRelaciones.length,41);
assert.deepEqual(revisionMecanica.porcentajesSinConversionAReglaDeCreditos
  .map(r=>r.porcentajePlan),[55,75,80]);
assert.equal(leer('datos/programas/mecatronica/academico.json').agrupaciones.length,432);
assert.equal(programas.contextoSinDatos('civil').sinDatos,true,
 'El estado sin fuente sigue disponible como estado visual futuro');
console.log('OK: nueve contratos aislados; cuatro ofertas verificadas sin inferir combinaciones.');
