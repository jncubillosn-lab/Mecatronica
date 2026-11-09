'use strict';

/**
 * Verificación de los nueve programas y de que un programa sin datos no
 * se transforma en una oferta vacía ni recibe el escenario de otra carrera.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {pathToFileURL}=require('node:url');
const {JSDOM,VirtualConsole} = require('jsdom');
const {EntradaAcademica} = require('../js/entrada.js');
const identidad = require('../js/identidad.js');
const programas = require('../js/programas.js');
const raiz = path.join(__dirname,'..');
const contrato = JSON.parse(fs.readFileSync(path.join(raiz,'datos/academico.json'),'utf8'));
const ids = Object.keys(identidad.catalogo);

assert.equal(ids.length,9);
assert.deepEqual([...programas.ids].sort(),[...ids].sort());
assert.equal(programas.fuentePara('mecatronica'),'datos/academico.json');
assert.equal(ids.filter(id=>programas.fuentePara(id)).length,1);
assert.equal(programas.desdeBusqueda('?programa=civil'),'civil');
assert.equal(programas.desdeBusqueda('?programa=inexistente'),'mecatronica');
assert.equal(programas.desdeBusqueda(''),'mecatronica');
assert.equal(programas.desdeBusqueda('?programa=sistemas-y-computacion'),'sistemas');
assert.equal(programas.urlPara('civil','https://ejemplo.test/Mecatronica/?a=1#inter'),
  'https://ejemplo.test/Mecatronica/?a=1&programa=civil#inter');
assert.equal(programas.urlPara('mecatronica','https://ejemplo.test/?programa=civil#heat'),
  'https://ejemplo.test/#heat');
const claveActual = contrato.configuracion.almacenamiento.clave;
assert.equal(programas.claveEscenario('mecatronica',claveActual),claveActual);
assert.equal(programas.claveEscenario('civil',claveActual),'escenario-personal:civil');
assert.notEqual(programas.claveEscenario('civil',claveActual),
  programas.claveEscenario('mecanica',claveActual));
const equivocado=structuredClone(contrato);
equivocado.programa={...contrato.programa,id:'civil'};
assert.equal(new EntradaAcademica(equivocado).generarEscenarioBase().programa.id,'civil');

async function abrir(id, opciones={}) {
  const errores=[], consultas=[];
  const vc = new VirtualConsole();
  vc.on('jsdomError', e=>errores.push(e.message));
  const ruta=path.join(raiz,'index.html');
  const url=pathToFileURL(ruta);
  url.searchParams.set('programa',id);
  const dom = await JSDOM.fromFile(ruta,{
    url:url.href,
    resources:'usable',runScripts:'dangerously',pretendToBeVisual:true,
    virtualConsole:vc,
    beforeParse(window) {
      window.scrollTo=()=>{};
      window.Element.prototype.scrollIntoView=()=>{};
      window.fetch=async url=>{
        consultas.push(String(url));
        assert.match(String(url),/^datos\/academico\.json\?v=1\.1\.0$/);
        return {ok:true,json:async()=>opciones.equivocado?equivocado:contrato};
      };
    }
  });
  const inicio=Date.now();
  while(!dom.window.document.querySelector('#view h1')&&Date.now()-inicio<8000)
    await new Promise(resolve=>setTimeout(resolve,15));
  return {dom,document:dom.window.document,consultas,errores};
}

async function main() {
  for (const id of ids.filter(x=>x!=='mecatronica')) {
    const {dom,document,consultas,errores}=await abrir(id);
    try {
      assert.deepEqual(consultas,[],'No cargar datos académicos para '+id);
      assert(!Object.hasOwn(dom.window,'CONTEXTO_ACADEMICO'),
        'No construir escenarios para una carrera sin datos');
      assert.equal(document.querySelector('#selector-programa')?.value,id);
      assert.equal(document.querySelectorAll('#selector-programa option').length,9);
      assert.equal(document.querySelectorAll('#top .nav a').length,8);
      assert.match(document.querySelector('#view h1')?.textContent||'',/no disponible/i);
      assert.match(document.querySelector('#view')?.textContent||'',
        /no significa que no existan asignaturas/);
      assert.equal(document.documentElement.dataset.programa,id);
      assert(!document.querySelector('.kpi,.prow,.dem-tabla'),
        'No fabricar estadísticas ni horarios');
      dom.window.location.hash='#heat';
      dom.window.dispatchEvent(new dom.window.HashChangeEvent('hashchange'));
      assert(document.querySelector('#view').textContent.includes('Mapa de calor'),
        'Cada una de las ocho páginas permite consultar su estado sin datos');
      assert.deepEqual(errores.filter(e=>/Uncaught|Could not load/i.test(e)),[]);
    } finally { dom.window.close(); }
  }
  const meca=await abrir('mecatronica');
  try {
    assert.equal(meca.consultas.length,1,'Mecatrónica solo consulta su contrato');
    assert.equal(meca.document.querySelector('#selector-programa')?.value,'mecatronica');
    assert.equal(meca.document.querySelectorAll('#top .nav button').length,8);
    assert(meca.dom.window.CONTEXTO_ACADEMICO?.estadoBase);
    assert.equal(meca.dom.window.CONTEXTO_ACADEMICO.almacenamiento.clave,claveActual,
      'La clave histórica debe preservar los escenarios de Mecatrónica');
    assert.equal(meca.dom.window.CONTEXTO_ACADEMICO.estadoBase.grupos.length,
      contrato.agrupaciones.length,'No se puede modificar la oferta vigente');
  } finally { meca.dom.window.close(); }
  const error=await abrir('mecatronica',{equivocado:true});
  try {
    assert.equal(error.consultas.length,1);
    assert.match(error.document.querySelector('#view h1')?.textContent||'',
      /No fue posible cargar/i);
    assert(!Object.hasOwn(error.dom.window,'CONTEXTO_ACADEMICO'));
    assert(error.document.querySelector('#selector-programa'));
  } finally { error.dom.window.close(); }
  console.log('OK: nueve carreras, ocho sin datos, aislamiento y Mecatrónica intacta.');
}
main().catch(e=>{console.error(e);process.exitCode=1;});
