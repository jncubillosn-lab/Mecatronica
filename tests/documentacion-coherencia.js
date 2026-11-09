'use strict';
/**
 * Regresión de los tres niveles documentales del sistema vigente:
 * ARQ-01 define el alcance, los módulos delimitan responsabilidades y
 * las pruebas verifican la única entrada y los escenarios actuales.
 */
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.join(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const arq=read('docs/ARQUITECTURA.md');
const agentes=read('AGENTS.md');
const readme=read('README.md');
assert(arq.includes('FuentesAcadémicas')&&arq.includes('datos/academico.json'));
assert(arq.includes('multicarrera')||arq.includes('múltiples programas'));
assert(/datos incompletos|información incompleta/i.test(arq));
assert(agentes.includes('ARQ-01'));
assert(readme.includes('ocho')||readme.includes('Ocho'));
assert(arq.includes('formatos personales actuales')||arq.includes('formato personal vigente'));
const entrada=read('js/entrada.js'),esc=read('js/escenarios.js'),app=read('js/app.js');
assert(entrada.includes('ÚNICA entrada académica normalizada'));
assert(esc.includes('esFormatoVigente'));
assert(app.includes('esFormatoVigente'));
for(const code of [entrada,read('js/analisis.js'),esc,app,read('js/iniciar.js')]){
  assert(!code.includes('fixMalla('));
  assert(!code.includes('migrarAnterior('));
}
assert(read('tests/solo-formatos-vigentes.js').includes('esFormatoVigente'));
console.log('OK: guías y código describen la arquitectura vigente y sus pruebas.');
