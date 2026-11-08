'use strict';
// TEMA-01: la preferencia visual es independiente del contrato y del navegador.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const source=fs.readFileSync(path.join(__dirname,'../js/tema.js'),'utf8');
const css=fs.readFileSync(path.join(__dirname,'../css/estilos.css'),'utf8');
const html=fs.readFileSync(path.join(__dirname,'../index.html'),'utf8');
function cargar(valor) {
  const almacen={};
  if(valor!==undefined)almacen['gestor-horarios-tema-visual']=valor;
  const window={
    document:{documentElement:{dataset:{theme:'dark'},style:{}}},
    localStorage:{
      getItem(k){return almacen[k]??null;},
      setItem(k,v){almacen[k]=v;}
    }
  };
  vm.runInNewContext(source,{window});
  return {tema:window.TemaVisual, html:window.document.documentElement,almacen};
}
const primera=cargar();
assert.equal(primera.tema.actual(),'dark');
assert.equal(primera.html.dataset.theme,'dark');
assert.equal(primera.tema.alternar(),'light');
assert.equal(primera.html.style.colorScheme,'light');
assert.equal(primera.almacen['gestor-horarios-tema-visual'],'light');
assert.equal(primera.tema.alternar(),'dark');
assert.equal(primera.almacen['gestor-horarios-tema-visual'],'dark');
const segunda=cargar('light');
assert.equal(segunda.tema.actual(),'light','La preferencia clara explícita se restituye');
assert.equal(cargar('auto').tema.actual(),'dark','No depende del tema del sistema');
assert.equal(cargar('bad').tema.actual(),'dark','Valores inesperados vuelven a oscuro');
assert.match(css, /:root\[data-theme="light"\]\{[\s\S]*?--bg:#f7f8fa;/);
assert.match(css, /\/\* TEMA-01/);
assert.match(html, /<html lang="es" data-theme="dark">/);
assert(html.indexOf('js/tema.js')<html.indexOf('css/estilos.css'),
  'El tema guardado se aplica antes de pintar los estilos');
console.log('OK: tema oscuro predeterminado y preferencia clara persistente independiente.');
