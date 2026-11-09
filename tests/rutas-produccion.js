'use strict';
// ARQ-01 RF-01 / RC-04: directorios y rutas de producción sin fuentes RAW.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const base=path.join(__dirname,'..');
const read=p=>fs.readFileSync(path.join(base,p),'utf8');
const archived=['datos.js','catalogo.js','oferta-fuente.js','fuentes.js'];
const html=read('index.html'),inicio=read('js/iniciar.js'),pkg=JSON.parse(read('package.json'));
for(const file of archived){
  assert(!fs.existsSync(path.join(base,'js',file)),
    'El directorio productivo no debe incluir el legado '+file);
  const src='pruebas/historico/js/'+file;
  assert(fs.statSync(path.join(base,src)).size>100,
    'La referencia histórica debe conservarse para pruebas o auditoría: '+src);
  assert(!html.includes('src="js/'+file),'HTML intenta leer archivo histórico '+file);
  assert(!inicio.includes('fetch("'+src) && !inicio.includes("fetch('"+src),
    'El arranque no debe cargar datos del archivo');
}
const historico=pkg.scripts['test:historico'];
assert(historico && /tests\/verificar\.js/.test(historico) &&
  /tests\/filtros\.js/.test(historico) &&
  /tests\/fuentes\.js/.test(historico));
assert(!pkg.scripts.test.includes('tests/verificar.js'));
assert(!pkg.scripts.test.includes('tests/filtros.js'));
assert(!pkg.scripts.test.includes('tests/fuentes.js'));
for(const file of ['verificar.js','filtros.js','fuentes.js']){
  const codigo=read('tests/'+file);
  assert(codigo.includes("pruebas/historico/js/"),
    'La prueba antigua debe leer el archivo archivado: '+file);
  assert(!codigo.includes("'js/datos.js'"),
    'No mantener referencias ejecutables al antiguo directorio js');
}
assert(!fs.existsSync(path.join(base,'pruebas/__pycache__/test_normalizador.cpython-312.pyc')));
assert(read('.gitignore').includes('__pycache__/'));
console.log('OK: legado archivado y separado de código, datos y pruebas de producción.');
