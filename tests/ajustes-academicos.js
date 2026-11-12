'use strict';

// DAT-01: correcciones externas por IDs, sin efectos en otras carreras.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {aplicarAjustes,localizar} = require('../scripts/aplicar-ajustes-academicos.js');
const root = path.join(__dirname,'..');
const cargar = p => JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
const contrato = cargar('datos/programas/mecatronica/academico.json');
const registro = cargar('data/programas/mecatronica/ajustes.json');

assert.equal(registro.programaId,'mecatronica');
assert(registro.ajustes.length>=3);
const base=JSON.stringify(contrato);
const verificado=aplicarAjustes(contrato,registro);
assert.deepEqual(verificado.cambios,[], 'Las correcciones documentadas deben estar integradas');
assert.equal(JSON.stringify(verificado.contrato),base);
assert.equal(JSON.stringify(contrato),base,'La verificación no puede mutar el original');

const cambiable=structuredClone(contrato);
const ruta=registro.ajustes[0].ruta;
const grupo=localizar(cambiable,ruta,'prueba');
const horarioAnterior=[{dia:'L',inicio:'13:00',fin:'15:00'}];
grupo.horarios=horarioAnterior;
assert.throws(()=>aplicarAjustes(cambiable,registro),/Valor anterior no verificado/);
const editable=structuredClone(registro);
editable.ajustes[0].anterior=horarioAnterior;
const resultado=aplicarAjustes(cambiable,editable);
assert.deepEqual(resultado.cambios,['tpi-horario-grupo-1']);
assert.deepEqual(localizar(resultado.contrato,ruta,'prueba').horarios,
  registro.ajustes[0].valor);
assert.deepEqual(aplicarAjustes(resultado.contrato,editable).cambios,[],
  'Aplicar dos veces debe ser idempotente');
assert.equal(JSON.stringify(contrato),base,'Nunca debe modificar el archivo de referencia');

const otro=structuredClone(contrato);
otro.programa.id='electrica';
assert.throws(()=>aplicarAjustes(otro,registro),/incompatibles/);
const otroRegistro=structuredClone(registro);
otroRegistro.programaId='electrica';
assert.deepEqual(aplicarAjustes(otro,otroRegistro).cambios,[],
  'Los mismos valores pueden verificarse sin tocar los datos de otro contexto');

const roto=structuredClone(registro);
roto.ajustes[0].ruta[2]={id:'sin-actividad'};
assert.throws(()=>aplicarAjustes(contrato,roto),/inexistente o ambigua|fuera de lista/);
const repetido=structuredClone(registro);
repetido.ajustes.push({...repetido.ajustes[0]});
assert.throws(()=>aplicarAjustes(contrato,repetido),/ID repetido/);
console.log('OK: ajustes por carrera, verificaciones, protección e idempotencia.');
