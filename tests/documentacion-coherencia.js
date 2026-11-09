'use strict';
/**
 * Control editorial de tres niveles: documentos normativos, comentarios
 * técnicos y comportamiento protegido por regresiones.
 * No interpreta Markdown como una segunda autoridad académica.
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const raiz=path.join(__dirname,'..');
const leer=p=>fs.readFileSync(path.join(raiz,p),'utf8');

const docs=[
 'docs/ARQUITECTURA.md','docs/ESTADO-Y-PUBLICACION.md',
 'docs/MIGRACION-ARQ01.md','docs/REG-01.md','AGENTS.md','README.md'
];
for(const archivo of docs){
 const s=leer(archivo);
 assert(/ARQ-01/.test(s),archivo+': falta el vínculo arquitectónico');
 assert(/compatib/i.test(s),archivo+': falta distinguir compatibilidad');
 assert(/(?:cerrad|finalizad|terminad)/i.test(s),
   archivo+': no consta el cierre de la migración');
}
for(const archivo of ['docs/ARQUITECTURA.md','docs/MIGRACION-ARQ01.md',
                       'docs/REG-01.md','README.md']){
 const s=leer(archivo);
 assert(s.includes('introducidoEn')&&s.includes('idAnterior'),
   archivo+': faltan pistas históricas opcionales');
 assert(/opcional/i.test(s),archivo+': esas pistas no deben volverse requisitos');
}
const entradas=leer('js/entrada.js'),modelo=leer('js/analisis.js');
const escenarios=leer('js/escenarios.js'),app=leer('js/app.js');
assert(entradas.includes('OPCIONAL')&&entradas.includes('idAnterior ?? null'));
assert(escenarios.includes('OPCIONALES')&&
       escenarios.includes('migrarAnterior(baseVigente'));
assert(app.includes('fixMalla(anterior);')&&!app.includes('fixMalla(S0);'));
assert(modelo.includes('referencia histórica opcional'));
assert(!leer('docs/ESTADO-Y-PUBLICACION.md').includes('Transiciones aún bajo evaluación'));
assert(!leer('js/vistas.js').includes('Presentación de las siete secciones'));
const modulos=[
 'js/iniciar.js','js/entrada.js','js/analisis.js','js/modelo.js',
 'js/escenarios.js','js/app.js','js/vistas.js','js/demanda.js',
 'js/identidad.js','js/tema.js'
];
for(const archivo of modulos){
 const comienzo=leer(archivo).split('\n').slice(0,15).join('\n');
 assert(comienzo.includes('/**'),
   archivo+': falta descripción introductoria de responsabilidad y límites');
}
console.log('OK: guías, comentarios y contrato opcional mantienen una frontera coherente.');
