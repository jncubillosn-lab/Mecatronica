'use strict';
/**
 * RF-01 — Verificación de la ruta de producción: un solo contrato académico.
 * Las herramientas externas SIA no se cargan por HTML ni JS del navegador.
 */
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.join(__dirname,'..'),exists=p=>fs.existsSync(path.join(root,p));
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const obsoletos=[
  'js/datos.js','js/catalogo.js','js/oferta-fuente.js','js/fuentes.js',
  'pruebas/historico/js/datos.js','pruebas/historico/js/catalogo.js',
  'pruebas/historico/js/oferta-fuente.js','pruebas/historico/js/fuentes.js',
  'pruebas/referencia/index.html','pruebas/compare.js','pruebas/mutar.sh',
  'scripts/dividir.py','scripts/generar_datos.py','scripts/migrar_raw.py',
  'tests/filtros.js','tests/fuentes.js','tests/verificar.js'
];
for(const p of obsoletos)assert(!exists(p),'Archivo exclusivo de versión anterior: '+p);
for(const p of ['datos/academico.json','js/entrada.js','js/analisis.js','js/escenarios.js',
  'scripts/normalizar_oferta.py','pruebas/test_normalizador.py','pruebas/fixtures/oferta_mini.txt'])
  assert(exists(p),'Falta módulo vigente o herramienta externa útil: '+p);
const html=read('index.html'),inicio=read('js/iniciar.js');
const programas=require('../js/programas.js');
assert.equal(programas.fuentePara('mecatronica'),'datos/academico.json');
assert.equal(programas.fuentePara('civil'),null);
assert(inicio.includes("fetch(rutaAcademica + '?v="));
assert(!inicio.includes('window.fuentesAcademicas'));
for(const p of obsoletos)assert(!html.includes(p)&&!inicio.includes(p),
  'No deben reaparecer rutas obsoletas en el navegador: '+p);
const pkg=JSON.parse(read('package.json'));
assert(!Object.hasOwn(pkg.scripts,'test:historico'));
assert(!pkg.scripts.test.includes('tests/verificar.js'));
console.log('OK: entrada única y solo herramientas externas actuales.');
