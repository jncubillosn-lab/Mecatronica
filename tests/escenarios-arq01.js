'use strict';
// Escenarios y migraciones ARQ-01: node tests/escenarios-arq01.js
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { EntradaAcademica } = require('../js/entrada.js');
const { EscenarioPersonal } = require('../js/escenarios.js');
const raiz=path.join(__dirname,'..');
const leer=p=>fs.readFileSync(path.join(raiz,p),'utf8');
const contrato=JSON.parse(leer('datos/academico.json'));
const raw=new EntradaAcademica(contrato).generarEscenarioBase();
const modulo=new Function('RAW',leer('js/modelo.js')+'\n'+leer('js/entrada.js')+'\n'+
  leer('js/app.js').split('/* ===== APLICACIÓN')[0]+'\nreturn {fromRaw,compute}')(raw);
const base=modulo.fromRaw(raw);
const copiar=EscenarioPersonal.copia;
function probar(nombre,trabajo){trabajo();console.log('OK '+nombre);}

probar('Escenario sin modificaciones produce diferencias vacías',()=>{
 const patch=EscenarioPersonal.empaquetar(base,base);
 const nuevo=EscenarioPersonal.aplicar(base,patch.cambios);
 assert.deepEqual(nuevo,base);
 assert.equal(patch.tipo,'escenario-personal');
 assert(JSON.stringify(patch).length<JSON.stringify(base).length);
});

probar('Ediciones personales se guardan, recuperan y no modifican la referencia',()=>{
 const s=copiar(base),original=copiar(base);
 const grupo=s.grupos[0];s.grupos.splice(0,1);
 s.bloques=s.bloques.filter(b=>!(b.a===grupo.a&&b.c===grupo.c1));
 const movido=s.bloques.find(b=>b.ref);
 movido.d='V';movido.s=17;movido.e=19;
 s.malla[0].s=s.malla[0].s+1;
 s.asg.pop();
 const p=s.pre.pop();
 const patch=EscenarioPersonal.empaquetar(base,s);
 const reconstructed=EscenarioPersonal.aplicar(base,patch.cambios);
 assert(!reconstructed.grupos.some(g=>g.a===grupo.a&&g.g===grupo.g));
 assert(reconstructed.bloques.some(b=>b.ref===movido.ref&&b.s===17&&b.d==='V'));
 assert.equal(reconstructed.malla[0].s,s.malla[0].s);
 assert.equal(reconstructed.asg.length,s.asg.length);
 assert.equal(reconstructed.pre.length,s.pre.length);
 assert.deepEqual(base,original);
});

probar('Referencia ampliada se combina con cambios personales sin borrarlos',()=>{
 const s=copiar(base);
 const quitado=s.grupos[0];s.grupos.splice(0,1);
 const patch=EscenarioPersonal.empaquetar(base,s);
 const d=copiar(contrato),ejemplo=d.agrupaciones[0];
 d.agrupaciones.push({
   id:ejemplo.posicionId+'|G-OTRA',posicionId:ejemplo.posicionId,
   etiqueta:'G-OTRA',componentes:[{id:'G-OTRA',bloques:[]}],
   procedencia:'oferta-actividad-unica',introducidoEn:'0.6.0'
 });
 const nuevoRaw=new EntradaAcademica(d).generarEscenarioBase();
 const actualizado=EscenarioPersonal.aplicar(modulo.fromRaw(nuevoRaw),patch.cambios);
 assert(actualizado.grupos.some(g=>g.g==='G-OTRA'));
 assert(!actualizado.grupos.some(g=>g.a===quitado.a&&g.g===quitado.g));
});

function anterior(version){
 const d={...contrato,agrupaciones:contrato.agrupaciones.filter(g=>
   g.introducidoEn==='0.4.2'||(version==='0.4.3'&&g.introducidoEn==='0.4.3'))};
 const s=modulo.fromRaw(new EntradaAcademica(d).generarEscenarioBase());
 s.bloques.forEach(b=>{b.id=b.idAnterior??b.id;b.ref=null;});
 if(version==='0.4.3')s.incorporacionesOferta=['BN-oferta-20261107'];
 return s;
}

probar('Referencia antigua v0.4.3 se recupera sin falsas modificaciones',()=>{
 const antiguo=anterior('0.4.3');
 const actual=EscenarioPersonal.migrarAnterior(base,antiguo,contrato,modulo.fromRaw,EntradaAcademica);
 assert.equal(actual.grupos.length,base.grupos.length);
 assert.equal(actual.bloques.length,base.bloques.length);
 assert.deepEqual(EscenarioPersonal.diferencias(base,actual).grupos.quitar,[]);
 assert.deepEqual(EscenarioPersonal.diferencias(base,actual).bloques.modificar,[]);
});

probar('Referencia anterior a la incorporación B/N recupera grupos nuevos',()=>{
 const antiguo=anterior('0.4.2');
 const actual=EscenarioPersonal.migrarAnterior(base,antiguo,contrato,modulo.fromRaw,EntradaAcademica);
 assert.equal(actual.grupos.length,base.grupos.length);
 assert.equal(actual.asg.length,base.asg.length);
});

probar('Una eliminación personal y un bloque editado sobreviven a la migración',()=>{
 const antiguo=anterior('0.4.3');
 const g=antiguo.grupos[0];antiguo.grupos.splice(0,1);
 antiguo.bloques=antiguo.bloques.filter(b=>!(b.a===g.a&&b.c===g.c1));
 const mod=antiguo.bloques.find(b=>b.idAnterior!=null);
 mod.d='V';mod.s=17;mod.e=19;
 const actual=EscenarioPersonal.migrarAnterior(base,antiguo,contrato,modulo.fromRaw,EntradaAcademica);
 assert(!actual.grupos.some(x=>x.a===g.a&&x.g===g.g));
 assert(actual.bloques.some(x=>x.idAnterior===mod.idAnterior&&x.d==='V'&&x.s===17));
});

console.log('Persistencia y compatibilidad: comprobaciones finalizadas.');
