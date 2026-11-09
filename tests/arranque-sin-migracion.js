'use strict';
// RC-02/RC-03: demostrar que las migraciones históricas no participan en
// la construcción normal de S0; mantener la lectura de escenarios antiguos.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.join(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const datos=JSON.parse(read('datos/academico.json'));
const app=read('js/app.js');
const extraida=app.match(/function fixMalla\(s\) \{[\s\S]*?\n\}/)?.[0];
assert(extraida,'La función histórica debe seguir localizada y comprobable');
const api=new Function('contrato',read('js/entrada.js')+'\n'+
  read('js/modelo.js')+'\n'+read('js/analisis.js')+'\n'+
  'const raw=new EntradaAcademica(contrato).generarEscenarioBase();\n'+
  'const original=fromRaw(raw);\n'+
  'const CONTEXTO={estadoBase:clone(original),incrementosOferta:raw.incrementosOferta};\n'+
  extraida+'\nreturn {original,migrado:fixMalla(clone(original))};'
)(datos);
for(const campo of ['params','malla','tipos','reqCred','pre','asg','grupos','bloques']){
 assert.deepEqual(api.migrado[campo],api.original[campo],
   'La migración alteró la referencia normalizada en '+campo+
   '; no retirar la llamada sin investigar el motivo');
}
const extras=Object.keys(api.migrado).filter(k=>!Object.hasOwn(api.original,k));
assert(extras.every(k=>/^mig[1-4]$/.test(k)),
  'Los únicos añadidos actuales de fixMalla deben ser marcas históricas: '+extras);
assert.deepEqual(extras.slice().sort(),['mig1','mig2','mig3','mig4'],
  'Se necesita documentar si la referencia sigue recibiendo efectos distintos');
assert(!app.includes('fixMalla(S0);'),
  'S0 ya viene completo del contrato; migraciones históricas solo se aplican al snapshot {S}');
assert(app.includes('fixMalla(anterior);'),
  'La compatibilidad {S} debe mantenerse explícitamente en el importador');
assert(app.includes('EscenarioPersonal.migrarAnterior(S0, anterior,'),
  'No se pierde la restauración histórica por IDs de bloque y agrupación');
console.log('OK: S0 deriva del contrato sin migraciones; {S} conserva su ruta compatible.');
