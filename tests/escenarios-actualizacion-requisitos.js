'use strict';
// REG-01: reproducción del defecto de actualización de referencia académica.
// Estos ensayos NO dependen del nombre ni del código SIA de PAI.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {EntradaAcademica}=require('../js/entrada.js');
const {EscenarioPersonal}=require('../js/escenarios.js');
const {fromRaw}=require('../js/analisis.js');
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
console.log('OK: actualización de reglas académicas y modificaciones personales aisladas.');
