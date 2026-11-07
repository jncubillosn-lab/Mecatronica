'use strict';
// node tests/oferta-activa.js
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root=path.join(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const modelo=read('js/modelo.js'),datos=read('js/datos.js'),oferta=read('js/oferta-fuente.js'),app=read('js/app.js');
const RAW=new Function(datos+'\nreturn RAW')();
const OFERTA=new Function(oferta+'\nreturn OFERTA_ACADEMICA')();
const codigos=new Map(RAW.vinculosCatalogo),ofertas=new Map(OFERTA.map(x=>[x.codigo,x]));
const grupos=new Set(RAW.gr.map(g=>g[0]+'\u0001'+g[1]));
const bloques=new Map();
RAW.bl.forEach(b=>{const k=b[0]+'\u0001'+b[1];bloques.set(k,(bloques.get(k)||0)+1)});
let comprobados=0;
for(const m of RAW.malla){
 const [nombre,,,,componente]=m;
 if(!['B','N'].includes(componente))continue;
 const registro=ofertas.get(codigos.get(nombre));
 if(!registro)continue;
 assert(RAW.asg.some(x=>x[0]===nombre),'No se incluyó '+nombre);
 const porId=new Map();
 for(const actividad of registro.actividades)for(const grupo of actividad.grupos)
   porId.set(grupo.id,(porId.get(grupo.id)||0)+grupo.horarios.length);
 for(const [id,cantidad] of porId){
   const key=nombre+'\u0001G'+id;
   assert(grupos.has(key),'Falta el grupo '+key);
   assert.equal(bloques.get(key)||0,cantidad,'Bloques incorrectos de '+key);
   comprobados++;
 }
}
assert(comprobados>0);

const codigo=modelo+'\n'+datos+'\n'+app.slice(0,app.indexOf("document.addEventListener('click'"))+
 '\nrender=()=>{};return {S,S0,R,ui,changes,pageHeat,pageInicio,onAct,getVisible:()=>RV};';
const abrir=estado=>new Function('localStorage','window','document',codigo)(
 {getItem:()=>estado?JSON.stringify({S:estado}):null},{innerWidth:1200},{});
const actual=abrir(null);
const indice=new Map(actual.S.malla.map(x=>[x.n,x.comp]));
const elegir=(instancia,cats)=>{
 for(const c of RAW.opciones.componentesComparables)
  if(instancia.ui.componentes.has(c)!==cats.includes(c))
    instancia.onAct('comp-toggle',{comp:c},{},{preventDefault(){}});
 return instancia.getVisible();
};
for(const cat of ['B','N','C']){
 const vista=elegir(actual,[cat]);
 assert(vista.names.length>0,'Componente sin grupos: '+cat);
 assert(vista.names.every(n=>indice.get(n)===cat));
 assert(actual.pageHeat().includes('Mapa de calor'));
}
elegir(actual,[...RAW.opciones.componentesComparables]);
assert.equal(actual.changes().length,0);

// Recrear un escenario de la versión anterior a partir del incremento declarado en datos.
const anterior=JSON.parse(JSON.stringify(actual.S0));
const nuevas=new Set(RAW.incrementosOferta.nuevasAsignaturas);
const extras=new Map(RAW.incrementosOferta.complementarGrupos);
const agregado=(nombre,grupo)=>nuevas.has(nombre)||extras.get(nombre)?.includes(grupo);
anterior.asg=anterior.asg.filter(n=>!nuevas.has(n));
anterior.grupos=anterior.grupos.filter(g=>!agregado(g.a,g.g));
anterior.bloques=anterior.bloques.filter(b=>!agregado(b.a,b.c));
delete anterior.incorporacionesOferta;
const recuperado=abrir(anterior);
assert.deepEqual(recuperado.S.asg,actual.S.asg);
assert.equal(recuperado.S.grupos.length,actual.S.grupos.length);
assert.equal(recuperado.S.bloques.length,actual.S.bloques.length);
assert.equal(recuperado.changes().length,0,'La migración produjo cambios falsos');

// No restaurar grupos ni asignaturas retirados deliberadamente.
const editado=JSON.parse(JSON.stringify(anterior));
const quitado=editado.grupos.find(g=>g.a==='Dibujo básico');
assert(quitado);
editado.grupos=editado.grupos.filter(g=>!(g.a===quitado.a&&g.g===quitado.g));
editado.bloques=editado.bloques.filter(b=>!(b.a===quitado.a&&b.c===quitado.c1));
editado.asg=editado.asg.filter(n=>n!=='Estática');
const respetado=abrir(editado);
assert(!respetado.S.grupos.some(g=>g.a===quitado.a&&g.g===quitado.g));
assert(!respetado.S.asg.includes('Estática'));
console.log('OK: '+comprobados+' grupos B/N contrastados, filtros operativos y escenarios preservados.');
