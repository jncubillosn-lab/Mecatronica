'use strict';

/** Multicarrera: mismo lector, nueve contratos y ocho vistas por programa. */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {pathToFileURL}=require('node:url');
const {JSDOM,VirtualConsole}=require('jsdom');
const identidad=require('../js/identidad.js');
const programas=require('../js/programas.js');
const raiz=path.join(__dirname,'..');
const ids=Object.keys(identidad.catalogo);
const cargar=id=>JSON.parse(fs.readFileSync(path.join(raiz,programas.fuentePara(id)),'utf8'));
const contratos=Object.fromEntries(ids.map(id=>[id,cargar(id)]));
assert.equal(ids.length,9);
assert.equal(Object.keys(programas.fuentes).length,9);
assert.equal(programas.desdeBusqueda('?programa=civil'),'civil');
assert.equal(programas.desdeBusqueda('?programa=sistemas-y-computacion'),'sistemas');
assert.equal(programas.desdeBusqueda('?programa=inexistente'),'mecatronica');
assert.equal(programas.urlPara('mecatronica','https://ejemplo.test/?programa=civil#heat'),'https://ejemplo.test/#heat');
assert.equal(programas.claveEscenario('mecatronica',contratos.mecatronica.configuracion.almacenamiento.clave),
 contratos.mecatronica.configuracion.almacenamiento.clave);
assert.notEqual(programas.claveEscenario('civil','x'),programas.claveEscenario('sistemas','x'));

async function abrir(id,otroContrato=false){
 const errores=[],consultas=[];
 const vc=new VirtualConsole();
 vc.on('jsdomError',e=>errores.push(e.message));
 const filename=path.join(raiz,'index.html');
 const url=pathToFileURL(filename);
 url.searchParams.set('programa',id);
 const dom=await JSDOM.fromFile(filename,{
   url:url.href,resources:'usable',runScripts:'dangerously',
   pretendToBeVisual:true,virtualConsole:vc,
   beforeParse(window){
     window.scrollTo=()=>{};
     window.Element.prototype.scrollIntoView=()=>{};
     window.fetch=async path=>{
       consultas.push(String(path));
       assert.equal(String(path),programas.fuentePara(id)+'?v=1.1.4');
       return {ok:true,json:async()=>otroContrato?contratos.mecatronica:contratos[id]};
     };
   }
 });
 const document=dom.window.document;
 const start=Date.now();
 while(Date.now()-start<12000 &&
       !document.querySelector('#top [data-act="nav"]') &&
       !document.querySelector('#view .programa-sin-datos')){
   await new Promise(resolve=>setTimeout(resolve,25));
 }
 return {dom,document,errores,consultas};
}
async function main(){
 for(const id of ids){
   const {dom,document,errores,consultas}=await abrir(id);
   try{
     assert.deepEqual(consultas,[programas.fuentePara(id)+'?v=1.1.4'],
       'Una sola fuente consultada en '+id);
     const contexto=dom.window.CONTEXTO_ACADEMICO;
     assert(contexto?.estadoBase, 'No inició el contrato de '+id);
     assert.equal(contexto.programa.id,id);
     assert.equal(contexto.estadoBase.malla.length,contratos[id].malla.length);
     assert.equal(contexto.estadoBase.grupos.length,contratos[id].agrupaciones.length);
     assert.equal(document.querySelector('#selector-programa')?.value,id);
     assert.equal(document.querySelectorAll('#selector-programa option').length,9);
     assert.equal(document.querySelectorAll('#top [data-act="nav"]').length,8);
     assert.equal(document.documentElement.dataset.programa,id);
     assert(!document.querySelector('.sin-datos-banner'),
       'La malla cargada no debe presentarse como un programa sin contrato');
     if(id!=='mecatronica'){
       assert(document.querySelector('.oferta-no-informada'), 'No se advirtió la falta de oferta: '+id);
       assert([...document.querySelectorAll('.hero-k .num')].every(el=>el.textContent.trim()==='—'),
         'Sin grupos no se pueden mostrar ceros como ausencia de choques: '+id);
       const textosInicio=document.querySelector('#view').textContent;
       assert(!/Acuerdo 6 de 2022|G1 a G8/.test(textosInicio),
         'Se filtraron supuestos de Mecatrónica a '+id);
       assert(textosInicio.includes('Se consideran las 0 relaciones') || id==='civil' || id==='agricola');
       assert.equal(contexto.estadoBase.grupos.length,0);
       assert.equal(contexto.estadoBase.bloques.length,0);
     }
     for(const pagina of ['inicio','inter','asig','grupos','hor','heat','demanda','malla']){
       const nav=document.querySelector('[data-act="nav"][data-p="'+pagina+'"]');
       assert(nav,'Falta navegación '+id+'/'+pagina);
       nav.click();
       assert(document.querySelector('#view h1'), 'Vista no renderizada '+id+'/'+pagina);
     }
     if(id!=='mecatronica'){
       assert(document.querySelector('#mcols .mcard'),
         'Malla con posiciones reales no visible en '+id);
       if(id==='quimica'){
         const malla=document.querySelector('#mcols').textContent;
         assert(malla.includes('Principios de química') && malla.includes('Balance de materia'));
         assert(!malla.includes('Tec. Mecánica Básica'),'Química no debe recibir la malla de Mecatrónica');
       }
     }
     assert.deepEqual(errores.filter(e=>/Uncaught|Could not load/i.test(e)),[],
       'Errores de scripts en '+id);
   }finally{dom.window.close();}
 }
 const equivocado=await abrir('civil',true);
 try{
   assert.equal(equivocado.consultas.length,1);
   assert.match(equivocado.document.querySelector('#view h1')?.textContent||'',
     /No fue posible cargar/i);
   assert(!Object.hasOwn(equivocado.dom.window,'CONTEXTO_ACADEMICO'));
 }finally{equivocado.dom.window.close();}
 console.log('OK: nueve carreras, ocho vistas, identidad y aislamiento sin modificar motor.');
}
main().catch(e=>{console.error(e);process.exitCode=1;});
