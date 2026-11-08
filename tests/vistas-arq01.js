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
 read('js/app.js').split("document.addEventListener('click'")[0];
const api=new Function('RAW','localStorage','window','document',appCode+
  '\nrender=()=>{};return {S,S0,R,ui,changes,onAct,pageInicio,pageInter,pageAsig,pageGrupos,pageHor,pageHeat,pageMalla,renderTop,drawerPair,getVista:()=>RV};')(
  raw,{getItem:()=>null,setItem(){},removeItem(){}},
  {innerWidth:1200,fuentesAcademicas:{datos:contrato}},{}
);
function verificar(nombre,trabajo){trabajo();console.log('OK '+nombre);}

verificar('Siete vistas se generan desde el contrato normalizado',()=>{
 const paginas=[api.pageInicio,api.pageInter,api.pageAsig,api.pageGrupos,api.pageHor,api.pageHeat,api.pageMalla];
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
 assert(api.pageHeat().includes('Mapa de calor'));
 assert(api.pageGrupos().includes('Dibujo básico'));
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

console.log('Vistas y selección: comprobaciones finalizadas.');
