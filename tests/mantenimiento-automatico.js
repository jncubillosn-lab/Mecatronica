'use strict';

/** Regresiones negativas: el auditor debe detectar archivos y pruebas olvidados. */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {clasificar,inventarioGit,evaluar}=require('../scripts/mantenimiento-auditar.js');
const root=path.resolve(__dirname,'..');
const archivos=inventarioGit(root);
const lectura=p=>fs.readFileSync(path.join(root,p),'utf8');
const base=evaluar({archivos,leer:lectura,sha:'PRUEBA'});
assert.equal(base.resumen.errores,0,
  'No puede establecerse el auditor con violaciones estructurales iniciales: '+
  JSON.stringify(base.hallazgos.filter(h=>h.gravedad==='error')));
assert.equal(base.cobertura.archivosClasificados,archivos.length);
assert.equal(clasificar('js/vistas.js'),'aplicacion');
assert.equal(clasificar('data/programas/mecatronica/oferta.json'),'fuentes_externas');
assert.equal(clasificar('inventado.bin'),null);
function conArchivo(archivo,contenido=''){
  const lista=[...archivos,archivo];
  const r=evaluar({archivos:lista,leer:p=>p===archivo?contenido:lectura(p),sha:'PRUEBA'});
  return r.hallazgos;
}
assert(conArchivo('cosa-temporal.md','x').some(h=>h.id==='SIN_CLASIFICAR'));
assert(conArchivo('js/olvidado.js','function olvidado(){}')
  .some(h=>h.id==='RECURSO_SIN_ENTRADA'));
assert(conArchivo('tests/sin-ejecutar.js','')
  .some(h=>h.id==='PRUEBA_NO_EJECUTADA'));
assert(conArchivo('pruebas/__pycache__/resto.pyc','x')
  .some(h=>h.id==='ARTEFACTO_RESIDUAL'));
assert(conArchivo('js/sintaxis-rota.js','function (')
  .some(h=>h.id==='JAVASCRIPT_INVALIDO'));
const cambios=new Set(base.hallazgos.map(h=>h.id));
assert(!cambios.has('SIN_CLASIFICAR'));
console.log('OK: auditoría autoejecutable detecta omisiones, código suelto y residuos.');
