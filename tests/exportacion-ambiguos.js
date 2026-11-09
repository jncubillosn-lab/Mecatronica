'use strict';
// REG-01/RC-03: escenario exportado debe conservar revisión pendiente,
// igual que la persistencia local. No aplica reglas especiales de asignaturas.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.join(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const fuente=JSON.parse(read('datos/academico.json'));
const {EntradaAcademica}=require('../js/entrada.js');
const raw=new EntradaAcademica(fuente).generarEscenarioBase();
const appCode=[
  'js/modelo.js','js/entrada.js','js/escenarios.js','js/analisis.js',
  'js/demanda.js','js/vistas.js'
].map(read).join('\n')+'\n'+
'window.CONTEXTO_ACADEMICO = { estadoBase: fromRaw(RAW), opciones: RAW.opciones, programa: RAW.programa, calendario: RAW.calendario, almacenamiento: RAW.almacenamiento, metadatos: RAW.metadatos, incrementosOferta: RAW.incrementosOferta };\n'+
read('js/app.js').split("document.addEventListener('click'")[0];
const app=new Function('RAW','window','localStorage','document',appCode+
  '\nrender=()=>{}; toast=()=>{};'+
  '\ndownload=(name,content,type)=>({name,content:JSON.parse(content),type});'+
  '\nreturn {S,S0,onAct,setPendientes:x=>{pendientesRequisitos=x},EscenarioPersonal};'
)(raw,{innerWidth:1200,fuentesAcademicas:{datos:fuente}},
  {getItem(){return null;},setItem(){},removeItem(){}},{});
const p=app.S.reqCred.find(r=>r.posicionId);
assert(p,'La referencia debe contener al menos un requisito por ID');
const key='id:'+p.posicionId,actual=app.S.reqCred.find(r=>r.posicionId===p.posicionId);
const anterior=JSON.parse(JSON.stringify(actual));
const actualizada=app.S0.reqCred.find(r=>r.posicionId===p.posicionId);
actual.componentes=actual.componentes.includes('B')?['C']:['B','C'];
const pendientes=[{key,nombre:actual.n,guardado:JSON.parse(JSON.stringify(actual)),
  vigente:JSON.parse(JSON.stringify(actualizada))}];
app.setPendientes(pendientes);
const exportacion=app.onAct('export',{},null,{preventDefault(){}});
assert.equal(exportacion.name,'escenario-horarios.json');
assert.equal(exportacion.content.tipo,'escenario-personal');
assert.equal(exportacion.content.version,1);
assert.deepEqual(exportacion.content.cambios.reqCredAmbiguos,[key],
  'La exportación debe preservar las revisiones no resueltas, igual que save()');
const restaurado=app.EscenarioPersonal.aplicar(app.S0,exportacion.content.cambios);
const revisit=app.EscenarioPersonal.requisitosAmbiguos(app.S0,exportacion.content,restaurado);
assert.equal(revisit.length,1,'Importar no debe resolver silenciosamente la duda');
assert.equal(revisit[0].key,key);
assert.deepEqual(restaurado.reqCred.find(r=>r.posicionId===p.posicionId).componentes,actual.componentes,
  'La revisión pendiente no borra otros valores del escenario');
app.setPendientes([]);
const confirmado=app.onAct('export',{},null,{preventDefault(){}});
assert(!Object.hasOwn(confirmado.content.cambios,'reqCredAmbiguos'),
  'Al confirmar el requisito, no debe exportarse como ambigüedad pendiente');
console.log('OK: exportar/importar conserva dudas no resueltas sin alterar datos.');
