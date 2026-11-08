'use strict';
// Vistas y filtros sobre la entrada única: node tests/vistas-arq01.js
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.join(__dirname,'..'), read=p=>fs.readFileSync(path.join(root,p),'utf8');
const contrato=JSON.parse(read('datos/academico.json'));
const {EntradaAcademica}=require('../js/entrada.js');
const raw=new EntradaAcademica(contrato).generarEscenarioBase();
const appCode=read('js/modelo.js')+'\n'+read('js/entrada.js')+'\n'+read('js/escenarios.js')+'\n'+
 read('js/analisis.js')+'\n'+read('js/demanda.js')+'\n'+read('js/vistas.js')+'\n'+
 'window.CONTEXTO_ACADEMICO = { estadoBase: fromRaw(RAW), opciones: RAW.opciones, programa: RAW.programa, calendario: RAW.calendario, almacenamiento: RAW.almacenamiento, metadatos: RAW.metadatos, incrementosOferta: RAW.incrementosOferta };\n'+
 read('js/app.js').split("document.addEventListener('click'")[0];
const api=new Function('RAW','localStorage','window','document',appCode+
  '\nrender=()=>{};toast=()=>{};return {S,S0,R,ui,changes,onAct,onChange,pageInicio,pageInter,pageAsig,pageGrupos,pageHor,pageHeat,pageDemanda,pageMalla,renderTop,drawerPair,getVista:()=>RV,setPendientes:(list)=>{pendientesRequisitos=list;},getPendientes:()=>pendientesRequisitos};')(
  raw,{getItem:()=>null,setItem(){},removeItem(){}},
  {innerWidth:1200,fuentesAcademicas:{datos:contrato}},{}
);
function verificar(nombre,trabajo){trabajo();console.log('OK '+nombre);}

verificar('Ocho vistas se generan desde el contrato normalizado',()=>{
 const paginas=[api.pageInicio,api.pageInter,api.pageAsig,api.pageGrupos,api.pageHor,api.pageHeat,api.pageDemanda,api.pageMalla];
 for(const fn of paginas)assert(fn().length>200);
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


verificar('Tipología y unidad están visibles y actúan en las siete secciones',()=>{
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

verificar('Un requisito legado puede revisarse individualmente sin restablecer el escenario',()=>{
 const id='mecatronica:pos:proyecto-aplicado-de-ingenieria';
 const base=api.S0.reqCred.find(r=>r.posicionId===id);
 const r=api.S.reqCred.find(r=>r.posicionId===id);
 assert.deepEqual(base.componentes,['C']);
 r.componentes=['B','C','L'];
 const sem=api.S.malla[0].s;
 api.setPendientes([{key:'id:'+id,nombre:r.n,
   guardado:JSON.parse(JSON.stringify(r)),vigente:JSON.parse(JSON.stringify(base))}]);
 const alerta=api.renderTop();
 assert(alerta.includes('data-act="req-vigente"'));
 assert(alerta.includes('data-act="req-conservar"'));
 assert(alerta.includes('Fundamentación')&&alerta.includes('Disciplinar'));
 api.onAct('req-vigente',{key:'id:'+id},{},{preventDefault(){}});
 assert.deepEqual(api.S.reqCred.find(x=>x.posicionId===id).componentes,['C']);
 assert.equal(api.S.malla[0].s,sem,'La decisión no borra cambios de otras colecciones');
 assert.equal(api.getPendientes().length,0);
 assert(!api.renderTop().includes('data-act="req-vigente"'),
   'El aviso desaparece cuando se resuelve la ambigüedad');
});

console.log('Vistas y selección: comprobaciones finalizadas.');
