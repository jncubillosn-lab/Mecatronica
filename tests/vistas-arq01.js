'use strict';
// Vistas y filtros sobre la entrada única: node tests/vistas-arq01.js
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.join(__dirname,'..'), read=p=>fs.readFileSync(path.join(root,p),'utf8');
const contrato=JSON.parse(read('datos/programas/mecatronica/academico.json'));
const {EntradaAcademica}=require('../js/entrada.js');
const programas=require('../js/programas.js');
const raw=new EntradaAcademica(contrato).generarEscenarioBase();
const appCode=read('js/modelo.js')+'\n'+read('js/entrada.js')+'\n'+read('js/escenarios.js')+'\n'+
 read('js/analisis.js')+'\n'+read('js/demanda.js')+'\n'+read('js/vistas.js')+'\n'+
 'window.CONTEXTO_ACADEMICO = { estadoBase: fromRaw(RAW), opciones: RAW.opciones, programa: RAW.programa, calendario: RAW.calendario, almacenamiento: RAW.almacenamiento, metadatos: RAW.metadatos };\n'+
 read('js/app.js').split("document.addEventListener('click'")[0];
const api=new Function('RAW','localStorage','window','document',appCode+
  '\nrender=()=>{};toast=()=>{};return {S,S0,R,ui,changes,onAct,onChange,pageInicio,pageInter,pageAsig,pageGrupos,pageHor,pageHeat,pageDemanda,pageMalla,renderTop,drawerPair,getVista:()=>RV};')(
  raw,{getItem:()=>null,setItem(){},removeItem(){}},
  {innerWidth:1200,ProgramasUniversitarios:programas},{}
);
function verificar(nombre,trabajo){trabajo();console.log('OK '+nombre);}

verificar('Ocho vistas se generan desde el contrato normalizado',()=>{
 const paginas=[api.pageInicio,api.pageInter,api.pageAsig,api.pageGrupos,api.pageHor,api.pageHeat,api.pageDemanda,api.pageMalla];
 for(const fn of paginas)assert(fn().length>200);
});

verificar('Combinaciones de filtros desde el contrato sin alterar S ni sus deltas',()=>{
 const componentes=contrato.configuracion.opciones.componentesComparables;
 const inicial=JSON.stringify(api.S),inicialCambios=JSON.stringify(api.changes());
 const seleccionar=ids=>{
   for(const id of componentes){
     if(api.ui.componentes.has(id)!==ids.includes(id))
       api.onAct('comp-toggle',{comp:id},{},{preventDefault(){}});
   }
   const nombres=new Set(api.S.malla.filter(m=>ids.includes(m.comp)).map(m=>m.n));
   assert.deepEqual(api.getVista().names.slice().sort(),
     api.S.asg.filter(n=>nombres.has(n)).slice().sort());
   assert.equal(JSON.stringify(api.S),inicial);
   assert.equal(JSON.stringify(api.changes()),inicialCambios);
 };
 seleccionar(componentes);
 const completos=api.getVista().pairs.map(p=>p.key).sort();
 for(const id of componentes)seleccionar([id]);
 for(let i=0;i<componentes.length;i++)for(let j=i+1;j<componentes.length;j++)
   seleccionar([componentes[i],componentes[j]]);
 seleccionar([]);
 assert.equal(api.getVista().pairs.length,0);
 seleccionar(componentes);
 assert.deepEqual(api.getVista().pairs.map(p=>p.key).sort(),completos);
});

verificar('Los filtros solo modifican los resultados de consulta',()=>{
 const antes=JSON.stringify(api.S),cambios=api.changes().length;
 for(const id of [...api.ui.componentes]){
   api.onAct('comp-toggle',{comp:id},{},{preventDefault(){}});
 }
 assert.equal(api.getVista().pairs.length,0);
 assert.equal(JSON.stringify(api.S),antes);
 assert.equal(api.changes().length,cambios);
 assert(api.pageHeat().includes('Mapa de calor'))
 assert(api.pageDemanda().includes('Demanda de preinscripción'));
 assert(!api.pageGrupos().includes('data-aname="Dibujo básico"'),
     'El filtro global también debe excluir asignaturas de Grupos');
 for(const id of contrato.configuracion.opciones.componentesComparables){
   api.onAct('comp-toggle',{comp:id},{},{preventDefault(){}});
 }
 assert.equal(api.getVista().names.length,api.R.names.length);
});

verificar('Un panel no muestra una pareja excluida por los filtros',()=>{
 const par=api.R.pairs.find(p=>p.enRango);
 assert(par);
 api.ui.drawer={type:'pair',key:par.key};
 assert(api.drawerPair(api.ui.drawer));
 for(const id of [...api.ui.componentes]){
   api.onAct('comp-toggle',{comp:id},{},{preventDefault(){}});
 }
 assert.equal(api.getVista().pairs.length,0);
 assert.equal(api.drawerPair(api.ui.drawer),null);
});

verificar('La oferta nueva no inventa horarios ausentes',()=>{
 const sinHorario=api.S.grupos.filter(g=>![g.c1,g.c2].filter(Boolean).some(c=>
   api.S.bloques.some(b=>b.a===g.a&&b.c===c)));
 assert(sinHorario.length>0);
 assert(sinHorario.every(g=>g.a&&g.g));
});


verificar('Las otras sedes están disponibles para consulta pero no afectan mapa ni matrices',()=>{
  const externo=api.S.grupos.find(g=>g.analizable===false);
  assert(externo);
  // La prueba anterior deja los filtros apagados: restituir la selección de consulta.
  for(const id of contrato.configuracion.opciones.componentesComparables){
    if(!api.ui.componentes.has(id))api.onAct('comp-toggle',{comp:id},{},{preventDefault(){}});
  }
  assert(api.pageGrupos().includes('otra sede'));
  const antes=api.pageHeat();
  const horarios=api.S.bloques.filter(b=>b.a===externo.a&&[externo.c1,externo.c2].includes(b.c));
  const previos=horarios.map(b=>({b,s:b.s,e:b.e}));
  horarios.forEach(b=>{b.s+=1;b.e+=1;});
  assert.equal(api.pageHeat(),antes,'Los horarios informativos no deben afectar el mapa');
  previos.forEach(({b,s,e})=>{b.s=s;b.e=e;});
  const par=api.R.pairs.find(p=>p.enRango&&
    [p.A,p.B].some(n=>api.R.allGroupsOf[n].some(g=>g.analizable===false)));
  assert(par);
  assert(api.drawerPair({type:'pair',key:par.key}));
});


verificar('Tipología y unidad están visibles y actúan en las ocho secciones',()=>{
 const paginas=['inicio','inter','asig','grupos','hor','heat','demanda','malla'];
 for(const page of paginas){
   api.ui.page=page;
   assert(api.renderTop().includes('data-act="comp-toggle"'));
   assert(api.renderTop().includes('data-chg="unidad-filtro"'));
 }
 const nombre=api.S.asg[0],unidad='Departamento de Ingeniería Mecánica y Mecatrónica · Facultad de Ingeniería';
 const cambioAnterior=api.changes().length;
 api.onChange('unidad-asig',{dataset:{n:nombre},value:unidad});
 assert.equal(api.S.malla.find(m=>m.n===nombre).unidad,unidad);
 assert(api.changes().length>cambioAnterior,'La unidad se reconoce como edición personal');
 const escenario=JSON.stringify(api.S);
 const cambios=JSON.stringify(api.changes());
 api.onChange('unidad-filtro',{value:unidad});
 assert.deepEqual(api.getVista().names,[nombre]);
 assert.equal((api.pageAsig().match(/class="arow /g)||[]).length,1);
 assert.equal((api.pageGrupos().match(/class="card gcard"/g)||[]).length,1);
 assert(api.pageHor().includes('<h1>Horarios</h1>'));
 assert.equal((api.pageMalla().match(/class="mcard /g)||[]).length,1);
 assert(api.pageHeat().includes('Mapa de calor'));
 assert(api.pageInicio().includes('Resumen de cruces'));
 assert(api.pageInter().includes('<h1>Interferencias</h1>'));
 assert.equal(JSON.stringify(api.S),escenario,'El filtro no altera el escenario');
 assert.equal(JSON.stringify(api.changes()),cambios,'El filtro no se exporta como edición');
 api.onChange('unidad-filtro',{value:'__sin_unidad__'});
 assert(!api.getVista().names.includes(nombre));
 assert.equal(api.getVista().names.length,api.S.asg.length-1);
 api.onChange('unidad-filtro',{value:''});
 assert.equal(api.getVista().names.length,api.S.asg.length);
});

verificar('El tono de la asignatura sigue al escenario, sin cambiar estadísticas',()=>{
  const nombre=api.R.names.find(n=>api.S.malla.some(m=>m.n===n&&m.comp==='B'));
  assert(nombre,'Se necesita al menos una asignatura B visible');
  const materia=api.S.malla.find(m=>m.n===nombre);
  const snapshot=JSON.stringify(api.S);
  const antes=api.pageAsig();
  assert(antes.includes('data-tipologia="B" data-aname="'+nombre+'"'));
  materia.comp='C';
  const despues=api.pageAsig();
  assert(despues.includes('data-tipologia="C" data-aname="'+nombre+'"'),
    'La tipología no puede deducirse de un nombre fijo');
  materia.comp='B';
  assert.equal(JSON.stringify(api.S),snapshot);
  assert.equal(api.pageAsig(),antes,'La presentación es reversible al restaurar el dato');
});

console.log('Vistas y selección: comprobaciones finalizadas.');
