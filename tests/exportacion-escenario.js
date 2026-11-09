'use strict';
/**
 * RF-10 — Exportación del formato personal vigente. Conserva modificaciones
 * y puede cargarse sobre una referencia académica actualizada por ID.
 * No necesita archivos completos ni reglas de conciliación de desarrollo.
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.join(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const fuente=JSON.parse(read('datos/academico.json'));
const {EntradaAcademica}=require('../js/entrada.js');
const raw=new EntradaAcademica(fuente).generarEscenarioBase();
const code=['js/modelo.js','js/entrada.js','js/escenarios.js','js/analisis.js',
  'js/demanda.js','js/vistas.js'].map(read).join('\n')+'\n'+
  'window.CONTEXTO_ACADEMICO={estadoBase:fromRaw(RAW),opciones:RAW.opciones,programa:RAW.programa,calendario:RAW.calendario,almacenamiento:RAW.almacenamiento,metadatos:RAW.metadatos};\n'+
  read('js/app.js').split("document.addEventListener('click'")[0];
const app=new Function('RAW','window','localStorage','document',code+
  '\nrender=()=>{};toast=()=>{};'+
  '\ndownload=(name,content,type)=>({name,content:JSON.parse(content),type});'+
  '\nreturn {S,S0,onAct,EscenarioPersonal};')(
  raw,{innerWidth:1200},{getItem(){return null;},setItem(){},removeItem(){}},{});
const base=JSON.parse(JSON.stringify(app.S0));
const m=app.S.malla[0];m.s+=1;m.unidad='Departamento de ejemplo';
const regla=app.S.reqCred.find(r=>r.posicionId);assert(regla);
regla.min++;
const exportado=app.onAct('export',{},null,{preventDefault(){}});
assert.equal(exportado.name,'escenario-horarios.json');
assert(app.EscenarioPersonal.esFormatoVigente(exportado.content));
assert.equal(exportado.content.version,1);
assert(!Object.hasOwn(exportado.content.cambios,'reqCred'));
assert(!Object.hasOwn(exportado.content.cambios,'reqCredAmbiguos'));
assert(exportado.content.cambios.reqCredCambios);
const recuperado=app.EscenarioPersonal.aplicar(base,exportado.content.cambios);
assert.equal(recuperado.malla[0].s,m.s);
assert.equal(recuperado.malla[0].unidad,m.unidad);
assert.equal(recuperado.reqCred.find(r=>r.posicionId===regla.posicionId).min,regla.min);
assert.deepEqual(base,app.S0,'Exportar e importar no modifican S0');
console.log('OK: exportación de escenario personal vigente, sin lectores históricos.');
