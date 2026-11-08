'use strict';
// REG-01: reproducción del defecto de actualización de referencia académica.
// Estos ensayos NO dependen del nombre ni del código SIA de PAI.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {EntradaAcademica}=require('../js/entrada.js');
const {EscenarioPersonal}=require('../js/escenarios.js');
const {fromRaw}=new Function(
  fs.readFileSync(path.join(__dirname,'../js/modelo.js'),'utf8')+'\n'+
  fs.readFileSync(path.join(__dirname,'../js/entrada.js'),'utf8')+'\n'+
  fs.readFileSync(path.join(__dirname,'../js/analisis.js'),'utf8')+'\nreturn {fromRaw};'
)();
const fuente=JSON.parse(fs.readFileSync(path.join(__dirname,'../datos/academico.json'),'utf8'));
const vigente=fromRaw(new EntradaAcademica(fuente).generarEscenarioBase());
const copiar=EscenarioPersonal.copia;
const old=copiar(vigente);
const idReferencia='mecatronica:pos:proyecto-aplicado-de-ingenieria';
const regla=estado=>estado.reqCred.find(r=>r.posicionId===idReferencia);
const tpi=estado=>estado.reqCred.find(r=>r.posicionId==='mecatronica:pos:taller-de-proyectos-interdisciplinarios');
assert.deepEqual(regla(vigente).componentes,['C']);
// En el contrato anterior, PAI utilizaba B+C+L.
regla(old).componentes=['B','C','L'];

// A) Una modificación de semestre no debe congelar requisitos institucionales.
const soloSemestre=copiar(old);
soloSemestre.malla[0].s++;
const patchSemestre=EscenarioPersonal.empaquetar(old,soloSemestre);
const reconstruidoSemestre=EscenarioPersonal.aplicar(vigente,patchSemestre.cambios);
assert.deepEqual(regla(reconstruidoSemestre).componentes,['C']);
assert.equal(reconstruidoSemestre.malla[0].s,soloSemestre.malla[0].s);

// B) Una modificación voluntaria de OTRO requisito no debe congelar PAI.
// Actualmente falla: se guarda un snapshot reqCred completo, no un delta.
const modificado=copiar(old);
tpi(modificado).min=53;
modificado.malla[1].s++;
const guardado=EscenarioPersonal.empaquetar(old,modificado);
assert(!Object.hasOwn(guardado.cambios,'reqCred'),
  'Un escenario nuevo no debe guardar una copia completa de requisitos');
assert.equal(guardado.cambios.reqCredCambios?.modificar.length,1);
assert.equal(guardado.cambios.reqCredCambios.modificar[0].valores.min,53);
const restaurado=EscenarioPersonal.aplicar(vigente,guardado.cambios);
assert.deepEqual(regla(restaurado).componentes,['C'],
  'Una regla académica sin edición personal debe adoptar el contrato vigente');
assert.equal(tpi(restaurado).min,53,
  'La edición de otra regla debe permanecer');
assert.equal(restaurado.malla[1].s,modificado.malla[1].s,
  'Los demás cambios personales deben permanecer');

// C) Una modificación voluntaria del requisito debería persistir sin tocar otros.
const manual=copiar(old);
tpi(manual).min=55;
const patchManual=EscenarioPersonal.empaquetar(old,manual);
assert.equal(tpi(EscenarioPersonal.aplicar(vigente,patchManual.cambios)).min,55);
// D) Un formato v1 previo sí almacenaba el listado completo.
// Como no informa su base de origen, se conserva y presenta su ambigüedad.
const anteriorGuardado={
  tipo:'escenario-personal',version:1,
  cambios:{reqCred:copiar(modificado.reqCred),
    malla:guardado.cambios.malla}
};
const estadoAntiguo=EscenarioPersonal.aplicar(vigente,anteriorGuardado.cambios);
assert.deepEqual(regla(estadoAntiguo).componentes,['B','C','L'],
  'La lectura heredada no elimina silenciosamente un posible requisito personal');
const pendientes=EscenarioPersonal.requisitosAmbiguos(vigente,anteriorGuardado,estadoAntiguo);
assert.equal(pendientes.length,2,'TPI y PAI requieren decisión explícita');
assert(pendientes.some(p=>p.key==='id:'+idReferencia));
assert(pendientes.some(p=>p.key==='id:mecatronica:pos:taller-de-proyectos-interdisciplinarios'));
const reGuardado=EscenarioPersonal.empaquetar(vigente,estadoAntiguo,pendientes);
assert.equal(reGuardado.cambios.reqCredAmbiguos.length,2);
assert(!Object.hasOwn(reGuardado.cambios,'reqCred'));
const recuperado=EscenarioPersonal.aplicar(vigente,reGuardado.cambios);
assert.deepEqual(regla(recuperado).componentes,['B','C','L']);
assert.equal(EscenarioPersonal.requisitosAmbiguos(vigente,reGuardado,recuperado).length,2,
  'Guardar otros cambios no borra la necesidad de revisar reglas ambiguas');
// Una decisión puntual de usar la referencia vigente corrige solo PAI.
const resuelto=copiar(recuperado);
const idx=resuelto.reqCred.findIndex(r=>r.posicionId===idReferencia);
resuelto.reqCred[idx]=copiar(regla(vigente));
assert.deepEqual(regla(resuelto).componentes,['C']);
assert.equal(tpi(resuelto).min,53,'La edición diferente se mantiene');
const pendientesRestantes=pendientes.filter(p=>p.key!=='id:'+idReferencia);
const finalGuardado=EscenarioPersonal.empaquetar(vigente,resuelto,pendientesRestantes);
assert.equal(EscenarioPersonal.requisitosAmbiguos(vigente,finalGuardado,
  EscenarioPersonal.aplicar(vigente,finalGuardado.cambios)).length,1,
  'Resolver PAI no decide por el usuario respecto a TPI');

// E) Operaciones granulares de alta, baja y modificación.
const sExtra=copiar(vigente);
sExtra.reqCred=sExtra.reqCred.filter(r=>r.posicionId!==idReferencia);
sExtra.reqCred.push({n:'Requisito libre del escenario',posicionId:'personal:regla:prueba',min:5,componentes:['C']});
const operaciones=EscenarioPersonal.diferencias(vigente,sExtra).reqCredCambios;
assert(operaciones.quitar.includes('id:'+idReferencia));
assert.equal(operaciones.agregar.length,1);
assert.deepEqual(EscenarioPersonal.aplicar(vigente,{reqCredCambios:operaciones}).reqCred,sExtra.reqCred);

console.log('OK: actualización de reglas académicas y modificaciones personales aisladas.');
