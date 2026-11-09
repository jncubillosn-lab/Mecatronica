'use strict';

/** RF-07 / RF-09: ninguna ruta de interfaz queda sin consumidor real. */
const assert = require('node:assert/strict');
const fs = require('node:fs'), path = require('node:path');
const leer = p => fs.readFileSync(path.join(__dirname,'..',p),'utf8');
const app=leer('js/app.js'), markup=[app,leer('js/vistas.js'),leer('js/demanda.js')].join('\n');
const casos = s => new Set([...s.matchAll(/case '([a-z0-9-]+)'(?=\s*:)/g)].map(m=>m[1]));
const attrs = n => new Set([...markup.matchAll(new RegExp('data-'+n+'="([a-z0-9-]+)"','g'))].map(m=>m[1]));
const entre = (a,b) => app.split(a)[1]?.split(b)[0];
const acciones=casos(entre('function onAct(','function onChange('));
assert.deepEqual([...acciones].sort(),[...attrs('act')].sort(),
  'Acción sin control renderizable o control que apunta a una acción ausente');
const cambios=casos(entre('function onChange(', "document.addEventListener('click'"));
const indirectos = new Set(['import-file','dem-import-file']);
for(const k of indirectos)
  assert(app.includes("onChange('"+k+"'"),'No se activa el selector de archivo '+k);
assert.deepEqual([...cambios].filter(k=>!indirectos.has(k)).sort(),[...attrs('chg')].sort(),
  'Formularios sin controlador o controladores sin interfaz');
assert(!/addEventListener\('scroll',\s*\w+\s*=>\s*\{\s*\}/.test(app),
  'No debe quedar un listener sin comportamiento');
assert(!/f\.dists\b/.test(markup),'No conservar filtros imposibles de activar');
console.log('OK: acciones y controles de interfaz en correspondencia.');
