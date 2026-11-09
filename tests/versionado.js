'use strict';

// Control de versión pública: pie, metadato y parámetros de caché.
// En CI, --compare-main impide cambiar el sitio sin incrementar la versión.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

const raiz = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(raiz, 'index.html'), 'utf8');
const inicio = fs.readFileSync(path.join(raiz, 'js/iniciar.js'), 'utf8');

function extraerVersion(texto) {
  const coincidencias = [...texto.matchAll(/<meta name="version" content="(\d+\.\d+\.\d+)">/g)];
  assert.equal(coincidencias.length, 1, 'Debe existir un único metadato de versión semántica');
  return coincidencias[0][1];
}

const version = extraerVersion(html);
const paquete = JSON.parse(fs.readFileSync(path.join(raiz, 'package.json'), 'utf8'));
const bloqueo = JSON.parse(fs.readFileSync(path.join(raiz, 'package-lock.json'), 'utf8'));
assert.equal(paquete.version, version, 'package.json y HTML deben declarar la misma versión');
assert.equal(bloqueo.version, version, 'El lockfile no coincide con la versión del sitio');
assert.equal(bloqueo.packages[''].version, version, 'La raíz del lockfile no coincide');
const readme = fs.readFileSync(path.join(raiz, 'README.md'), 'utf8');
const declarado = [...readme.matchAll(/^\*\*Versión pública:\*\* (\d+\.\d+\.\d+)\b/gm)];
assert.equal(declarado.length, 1,
  'README debe declarar exactamente una versión pública vigente en su cabecera');
assert.equal(declarado[0][1], version,
  'README desactualizado respecto al paquete y el HTML');
assert(/\*\*Rama publicada:\*\* `main`/.test(readme),
  'README debe identificar main como fuente publicada');
const visibles = [...html.matchAll(/<span class="pie-version"[^>]*>Versión (\d+\.\d+\.\d+)\b/g)];
assert.equal(visibles.length, 1, 'Debe existir un único indicador de versión en el pie');
assert.equal(visibles[0][1], version, 'La versión visible no coincide con la del HTML');

const assets = [...html.matchAll(/<(?:script|link)\b[^>]*(?:src|href)="([^"]+)"/g)]
  .map(m => m[1]).filter(u => /^(?:js\/.*\.js|css\/.*\.css)(?:\?|$)/.test(u));
assert(assets.length >= 6, 'Se esperaba encontrar los recursos JavaScript y CSS del sitio');
for (const url of assets) {
  assert.equal(url.split('?v=')[1], version,
    'Recurso sin versión de caché correcta: ' + url);
  assert(fs.existsSync(path.join(raiz, url.split('?')[0])),
    'Recurso versionado inexistente: ' + url);
}
// Un módulo JS olvidado en el HTML o en el arranque es una publicación incompleta.
const jsReferenciados = new Set([...assets.map(u => u.split('?')[0]), 'js/app.js']
  .filter(u => u.startsWith('js/')));
const jsProductivos = fs.readdirSync(path.join(raiz, 'js'))
  .filter(n => n.endsWith('.js')).map(n => 'js/' + n);
assert.deepEqual([...jsReferenciados].sort(), jsProductivos.sort(),
  'Los módulos JS del sitio no corresponden a los realmente versionados');

const programas=require('../js/programas.js');
const rutas=Object.values(programas.fuentes);
assert(rutas.length>=1,'Al menos un contrato académico debe estar disponible');
assert.equal(new Set(rutas).size,rutas.length,'Una ruta académica por programa');
for(const ruta of rutas) {
  assert(/^datos\/[\w/-]+\.json$/.test(ruta),'Ruta académica no permitida: '+ruta);
  assert(fs.existsSync(path.join(raiz,ruta)),'No existe contrato académico: '+ruta);
}
assert(inicio.includes("fetch(rutaAcademica + '?v="+version+"')"),
  'El contrato dinámico no tiene versión de caché correcta');
assert(inicio.includes("'js/app.js?v="+version+"'"),
  'El módulo dinámico no tiene versión de caché correcta');
assert(inicio.includes('contrato?.programa?.id !== seleccionado'),
  'Identidad de programa no validada antes de ejecutar el motor');

if (process.argv.includes('--compare-main')) {
  const base = process.env.GITHUB_BASE_REF || 'main';
  const referencia = 'origin/' + base;
  const leerGit = args => execFileSync('git', args, {
    cwd: raiz, encoding: 'utf8'
  }).trim();
  const archivos = leerGit(['diff', '--name-only', referencia + '...HEAD'])
    .split('\n').filter(Boolean);
  const cambioPublicable = archivos.some(p =>
    p === 'index.html' || /^js\/.*\.js$/.test(p) ||
    /^css\/.*\.css$/.test(p) || /^datos\/.*\.json$/.test(p));
  if (cambioPublicable) {
    const anterior = extraerVersion(leerGit(['show', referencia + ':index.html']));
    const actual = version.split('.').map(Number);
    const previa = anterior.split('.').map(Number);
    const mayor = actual.findIndex((n, i) => n !== previa[i]);
    assert(mayor >= 0 && actual[mayor] > previa[mayor],
      'Se modificó código o datos publicados sin aumentar la versión ' +
      anterior + ' -> ' + version);
  }
}

console.log('OK: versión pública ' + version +
  ' coherente en HTML, pie, estilos, scripts y datos.');
