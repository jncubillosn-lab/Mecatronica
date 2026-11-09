'use strict';
/**
 * RC-01 / RF-01 / RF-10 — Contratos vigentes sin dependencia histórica.
 * Las personas usuarias confirmaron que no hay escenarios de formatos
 * antiguos que recuperar. Los editores actuales y futuros programas deben
 * poder seguir usando FuentesAcadémicas incompleta pero válida.
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const raiz=path.join(__dirname,'..');
const read=p=>fs.readFileSync(path.join(raiz,p),'utf8');
const fuente=JSON.parse(read('datos/academico.json'));
const {EntradaAcademica}=require('../js/entrada.js');
const {EscenarioPersonal}=require('../js/escenarios.js');
const {fromRaw,compute}=new Function(
  read('js/entrada.js')+'\n'+read('js/modelo.js')+'\n'+read('js/analisis.js')+
  '\nreturn {fromRaw,compute};')();
const copia=x=>JSON.parse(JSON.stringify(x));
const base=fromRaw(new EntradaAcademica(fuente).generarEscenarioBase());

assert(fuente.agrupaciones.every(g=>!Object.hasOwn(g,'introducidoEn')));
assert(fuente.agrupaciones.every(g=>(g.componentes||[]).every(c=>
  (c.bloques||[]).every(b=>!Object.hasOwn(b,'idAnterior')))));
assert(base.bloques.every(b=>!Object.hasOwn(b,'idAnterior')));
assert.equal(typeof EscenarioPersonal.migrarAnterior,'undefined');
assert.equal(typeof EscenarioPersonal.requisitosAmbiguos,'undefined');
const codigo=read('js/app.js');
assert(!codigo.includes('function fixMalla('));
assert(!codigo.includes('function fixParams('));
assert(!codigo.includes('pendientesRequisitos'));
assert(!codigo.includes('incorporacionesOferta'));
assert(!codigo.includes('mig1')&&!codigo.includes('mig2')&&!codigo.includes('mig3')&&!codigo.includes('mig4'));
assert(!read('js/iniciar.js').includes('incrementosOferta'));

// Un archivo {S} y una lista reqCred completa anterior no son formatos
// soportados. No se necesitan decisiones de conciliación ficticias.
assert(!EscenarioPersonal.esFormatoVigente({S:copia(base)}));
assert(!EscenarioPersonal.esFormatoVigente({
  tipo:'escenario-personal',version:1,cambios:{reqCred:copia(base.reqCred)}
}));
assert(!EscenarioPersonal.esFormatoVigente({
  tipo:'escenario-personal',version:1,cambios:{reqCredAmbiguos:['id:antiguo']}
}));

// Continúan siendo compatibles los datos incompletos del contrato actual:
// falta de agrupaciones no inventa clases ni conflictos.
const sinGrupos=copia(fuente);
sinGrupos.agrupaciones=[];
const vacio=fromRaw(new EntradaAcademica(sinGrupos).generarEscenarioBase());
assert.deepEqual(vacio.bloques,[]);
assert.equal(compute(vacio).totalClash,0);

// El escenario actual se reconstruye sobre S0 y conserva deltas del usuario.
const cambio=copia(base);
cambio.malla[0].s++;
if(cambio.grupos.length)cambio.grupos[0].on=false;
const req=cambio.reqCred.find(x=>x.posicionId);
assert(req);req.min++;
const paquete=EscenarioPersonal.empaquetar(base,cambio);
assert(EscenarioPersonal.esFormatoVigente(paquete));
assert(paquete.cambios.reqCredCambios);
const destino=EscenarioPersonal.aplicar(base,paquete.cambios);
assert.equal(destino.malla[0].s,cambio.malla[0].s);
assert.equal(destino.reqCred.find(x=>x.posicionId===req.posicionId).min,req.min);
if(cambio.grupos.length)assert.equal(destino.grupos[0].on,false);
assert.equal(base.reqCred.find(x=>x.posicionId===req.posicionId).min,req.min-1);

// El motor sigue siendo independiente de los nombres/IDs de Mecatrónica.
const otro=copia(fuente);
otro.programa={id:'programa-futuro',nombre:'Programa futuro'};
assert(new EntradaAcademica(otro).generarEscenarioBase().programa.id==='programa-futuro');
console.log('OK: únicamente contratos actuales y escenarios personales vigentes.');
