'use strict';
// RESP-01: guardas de estructura responsive y contratos de presentación.
// Las verificaciones de tamaño real requieren además revisión en navegador.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.join(__dirname,'..');
const css=fs.readFileSync(path.join(root,'css/estilos.css'),'utf8');
const vistas=fs.readFileSync(path.join(root,'js/vistas.js'),'utf8');
const demanda=fs.readFileSync(path.join(root,'js/demanda.js'),'utf8');
const app=fs.readFileSync(path.join(root,'js/app.js'),'utf8');
assert.match(css,/\/\* RESP-01/,'Existe una capa de reglas globales para tamaños');
assert.match(css,/main\{width:100%;max-width:/,'El contenido principal respeta el ancho disponible');
assert.match(css,/\.top\{position:static\}/,'La cabecera no tapa los títulos durante la lectura');
assert.match(css,/\.weekgrid-scroll\{[^}]*overflow-x:auto/,'Las semanas usan scroll local');
assert.match(css,/\.dem-grafico\{[^}]*max-width:950px;min-width:730px;height:auto/,
  'El gráfico no crece verticalmente sin límite ni recorta sus ejes');
assert.match(css,/\.malla-panel--ampliado\{position:fixed/,'La malla dispone de una vista que cubre el viewport');
assert.match(css,/@media\(max-width:720px\)/,'Hay reglas de pantalla móvil');
assert.match(css,/@media\(hover:none\),\(pointer:coarse\)/,'Hay dimensiones apropiadas para el tacto');
assert.equal((vistas.match(/class="weekgrid-scroll"/g)||[]).length,2,
  'Horarios y mapa de calor conservan sus cuadrículas dentro de un scroll propio');
assert.match(vistas,/data-act="m-zoom-reset"/);
assert.match(vistas,/data-act="m-ampliar"/);
assert.match(vistas,/id="malla-stage"/);
assert.match(demanda,/role="region" tabindex="0" aria-label="Gráfica de demanda desplazable"/);
assert.match(app,/ui\.malla\.ampliado = false/);
assert.match(app,/centroX\*escala/);
console.log('OK: base responsive, visor de malla y gráfica legible con scroll local.');
