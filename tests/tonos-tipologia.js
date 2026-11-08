'use strict';
/**
 * TONO-01: identidad cromática de tipología únicamente en la presentación.
 * Los requisitos, cálculos y colores de estados permanecen semánticamente independientes.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname, '..');
const read = p => fs.readFileSync(path.join(root, p), 'utf8');
const css = read('css/estilos.css');
const vistas = read('js/vistas.js');
const demanda = read('js/demanda.js');
const app = read('js/app.js');
const actual = JSON.parse(read('datos/academico.json'));
const antes = read('datos/academico.json');

const begin = vistas.indexOf('function atributoComponente(');
const finish = vistas.indexOf('function gl(', begin);
assert(begin >= 0 && finish > begin);
const esc = t => String(t).replace(/"/g, '&quot;');
const S = { malla:[
  {n:'A',comp:'B'}, {n:'B',comp:'C'},
  {n:'C',comp:'L'}, {n:'D',comp:'N'},
  {n:'E',comp:'tipo-futuro'}] };
const atributos = new Function('S', 'esc', vistas.slice(begin,finish)+
  'return {atributoComponente,atributoTipologia};')(S,esc);
assert.deepEqual(['A','B','C','D'].map(atributos.atributoTipologia),
  [' data-tipologia="B"',' data-tipologia="C"',
   ' data-tipologia="L"',' data-tipologia="N"']);
assert.equal(atributos.atributoTipologia('desconocida'), '',
  'No inferir tipologías de materias que no existen');
assert.equal(atributos.atributoTipologia('E'),' data-tipologia="tipo-futuro"',
  'Un tipo futuro llega desde el dato sin pintar un color inventado');
S.malla[0].comp = 'C';
assert.equal(atributos.atributoTipologia('A'),' data-tipologia="C"',
  'La señal sigue el escenario vigente, no la tipología original');
assert.equal(atributos.atributoComponente(''), '');

const rgb = hex => hex.match(/[\da-f]{2}/gi).map(v=>parseInt(v,16)/255)
  .map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4);
const luminosidad = hex => {
  const [r,g,b] = rgb(hex.replace('#',''));
  return .2126*r+.7152*g+.0722*b;
};
const contraste = (a,b) => {
  const lum=[luminosidad(a),luminosidad(b)].sort((x,y)=>y-x);
  return (lum[0]+.05)/(lum[1]+.05);
};
const raizOscura = css.match(/\/\* TEMA-01[\s\S]*?:root\{([\s\S]*?)\}/)?.[1];
const raizClara = css.match(/:root\[data-theme="light"\]\{([\s\S]*?)\}/g)?.at(-1);
assert(raizOscura && raizClara);
const token=(txt,k)=>{
  const m=txt.match(new RegExp('--'+k+':(#[0-9a-fA-F]{6})'));
  assert(m,'Falta '+k);
  return m[1];
};
assert(contraste(token(raizOscura,'line'),token(raizOscura,'surface')) >
  contraste('#334354','#1b2530')+.10,'El borde oscuro es más distinguible');
assert(contraste(token(raizClara,'line'),token(raizClara,'surface')) >
  contraste('#e0e5ec','#ffffff')+.10,'El borde claro es más distinguible');
assert.match(css, /\[data-tipologia="B"\]\{--tipo-acento:var\(--ca\)\}/);
assert.match(css, /\[data-tipologia="C"\]\{--tipo-acento:var\(--cb\)\}/);
assert.match(css, /\[data-tipologia="L"\]\{--tipo-acento:var\(--ok\)\}/);
assert.match(css, /\[data-tipologia="N"\]\{--tipo-acento:var\(--ink3\)\}/);
assert.match(css, /\.mcard\[data-tipologia\]:not\(\.up\):not\(\.down\):not\(\.sel\)/,
  'Las relaciones y selección del mapa siguen siendo prioritarias');
assert.match(css, /\.mcard\.up\{background:var\(--ca-soft\)/);
assert.match(css, /\.mcard\.down\{background:var\(--ok-soft\)/);
assert.match(app, /data-tipologia="\$\{esc\(id\)\}" data-act="comp-toggle"/);
assert.match(demanda, /atributoComponente\(x\.componente\)/);
assert.match(css, /\/\* TONO-01/);
assert.equal(read('datos/academico.json'),antes,
  'La integración de colores no modifica FuentesAcadémicas');
assert.equal(actual.versionEsquema,1);
console.log('OK: cuatro tipologías, colores compartidos y bordes más legibles en ambos temas.');
