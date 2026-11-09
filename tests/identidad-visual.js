'use strict';

/**
 * Pruebas del sistema visual: los temas son presentación, no nuevas entradas
 * académicas. El selector multicarrera permite programas sin datos.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const identidad = require('../js/identidad.js');

const colores = {
  electrica: '#7C3AED',
  electronica: '#00A36C',
  civil: '#D6452B',
  agricola: '#8CC63F',
  sistemas: '#FFD23F',
  industrial: '#F2A900',
  mecanica: '#7B8CA0',
  mecatronica: '#FF5F1F',
  quimica: '#FFFFFF'
};
assert.equal(Object.keys(identidad.catalogo).length, 9);
for (const [id, color] of Object.entries(colores)) {
  const tema = identidad.temaParaPrograma({ id, nombre: 'No usar como fuente de ID' });
  assert.equal(tema.id, id);
  assert.equal(tema.color, color);
}
assert.equal(identidad.temaParaPrograma('sistemas-y-computacion').id, 'sistemas');
assert.equal(identidad.temaParaPrograma({ id: 'programa-nuevo' }).id, 'sin-definir',
  'Un ID nuevo recibe un estilo neutro; nunca se identifica por conjetura');
assert.equal(identidad.temaParaPrograma(null).id, 'sin-definir');

const estilos = {};
const raiz = {
  dataset: {},
  style: { setProperty: (clave, valor) => { estilos[clave] = valor; } }
};
assert.equal(identidad.aplicarTema({ id: 'mecatronica' }, raiz).id, 'mecatronica');
assert.equal(raiz.dataset.programa, 'mecatronica');
assert.equal(estilos['--programa-acento'], '#FF5F1F');
identidad.aplicarTema('quimica', raiz);
assert.equal(estilos['--programa-borde'], '#8793A2',
  'El blanco se delinea para no desaparecer sobre fondos claros');
identidad.aplicarTema('carrera-futura', raiz);
assert.equal(raiz.dataset.programa, 'sin-definir');

const css = fs.readFileSync(path.join(__dirname, '../css/estilos.css'), 'utf8');
const html = fs.readFileSync(path.join(__dirname, '../index.html'), 'utf8');
const iniciar = fs.readFileSync(path.join(__dirname, '../js/iniciar.js'), 'utf8');
assert.match(css, /--programa-acento/);
assert.match(css, /--programa-borde/);
for (const varSemantica of ['--heat', '--ok', '--warn', '--ca', '--cb']) {
  assert(css.includes(varSemantica), 'Debe conservarse el color analítico ' + varSemantica);
}
assert(html.indexOf('<script src="js/identidad.js') < html.indexOf('<script src="js/iniciar.js'),
  'El tema visual se carga antes de resolver el programa normalizado');
assert.match(iniciar, /IdentidadUniversitaria\.aplicarTema\(proyeccion\.programa\)/);
assert.match(html, /Sitio no oficial/);
console.log('OK: identidad visual de nueve programas, fallback y semántica analítica conservada.');
