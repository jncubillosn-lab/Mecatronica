'use strict';
/**
 * RC-01 / RC-03 / RF-01 — Campos de compatibilidad son OPCIONALES.
 *
 * El contrato académico vigente no necesita un identificador de versión
 * anterior para abrirse, calcular horarios o construir S0.
 * Los indicadores históricos solo se leen al recuperar un snapshot {S}.
 * Esta prueba no inventa datos ni exige recuperar identidades no informadas.
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.join(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const fuente=JSON.parse(read('datos/academico.json'));
const {EntradaAcademica}=require('../js/entrada.js');
const {fromRaw,compute}=new Function(read('js/entrada.js')+'\n'+read('js/modelo.js')+
  '\n'+read('js/analisis.js')+'\nreturn {fromRaw,compute};')();
const copia=x=>JSON.parse(JSON.stringify(x));

// Una entrada normalizada SIN metadatos heredados debe conservar la operación.
// Nunca propagar esta exigencia a los productores externos de FuentesAcadémicas.
const actual=copia(fuente);
const sinLegado=copia(fuente);
for(const g of sinLegado.agrupaciones){
  delete g.introducidoEn;
  for(const c of g.componentes||[])for(const b of c.bloques||[])
    delete b.idAnterior;
}
if(sinLegado.configuracion)delete sinLegado.configuracion.incrementosOferta;
const ref=fromRaw(new EntradaAcademica(actual).generarEscenarioBase());
const limpio=fromRaw(new EntradaAcademica(sinLegado).generarEscenarioBase());
const sinAnteriores=s=>{
 const t=copia(s);
 for(const b of t.bloques)b.idAnterior=null;
 return t;
};
assert.deepEqual(sinAnteriores(ref),sinAnteriores(limpio),
  'El estado vigente no puede depender de versiones o IDs históricos opcionales');
const resumen=s=>{
 const r=compute(s);
 return {totalPairs:r.totalPairs,totalClash:r.totalClash,totalCombos:r.totalCombos,
  names:r.names,pairs:r.pairs.map(p=>[p.key,p.total,p.clash,p.idx])};
};
assert.deepEqual(resumen(ref),resumen(limpio),
  'La ausencia de metadatos históricos no cambia las estadísticas vigentes');

// Esta exigencia es solo para la ruta de recuperación vieja: no tocar S0.
const app=read('js/app.js'),inicio=read('js/iniciar.js');
assert(!app.includes('fixMalla(S0);'),
  'Ninguna regla histórica debe actualizar el estado base');
assert(app.includes('fixMalla(anterior);'),
  'El lector anterior permanece disponible cuando se importa {S}');
assert(!inicio.includes('window.RAW ='));
assert(!read('js/entrada.js').includes('throw new Error(\'Falta introducidoEn'),
  'La ausencia de procedencia histórica no invalida la entrada actual');
console.log('OK: campos de procedencia y enlaces a IDs anteriores son opcionales en el contrato actual.');
