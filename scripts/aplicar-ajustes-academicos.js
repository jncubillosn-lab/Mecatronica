'use strict';

/**
 * DAT-01: aplicar ajustes verificados a un contrato por carrera, FUERA del
 * navegador. No cambia reglas de lectura, agrupa actividades ni toca S/S0.
 * --verificar es lectura pura; --aplicar escribe solo si hay diferencias.
 */
const fs = require('node:fs');
const path = require('node:path');

const raiz = path.resolve(__dirname, '..');
const igual = (a, b) => JSON.stringify(a) === JSON.stringify(b);

function localizar(objeto, ruta, ajusteId) {
  if (!Array.isArray(ruta) || !ruta.length)
    throw new Error('Ruta de ajuste vacía: ' + ajusteId);
  let actual = objeto;
  for (const paso of ruta) {
    if (typeof paso === 'string') {
      if (!actual || typeof actual !== 'object' || !Object.hasOwn(actual, paso))
        throw new Error('Ruta inexistente (' + paso + '): ' + ajusteId);
      actual = actual[paso];
    } else if (paso && typeof paso === 'object' &&
               !Array.isArray(paso) && Object.keys(paso).length) {
      if (!Array.isArray(actual)) throw new Error('Selector fuera de lista: ' + ajusteId);
      const encontrados = actual.filter(x => x && typeof x === 'object' &&
        Object.entries(paso).every(([k,v]) => Object.hasOwn(x,k) && x[k] === v));
      if (encontrados.length !== 1)
        throw new Error('Referencia inexistente o ambigua: ' + ajusteId);
      actual = encontrados[0];
    } else {
      throw new Error('Paso de ruta inválido: ' + ajusteId);
    }
  }
  return actual;
}

function aplicarAjustes(contrato, registro) {
  if (!contrato || contrato.versionEsquema !== 1 ||
      typeof contrato.programa?.id !== 'string' ||
      !registro || registro.versionAjustes !== 1 ||
      registro.programaId !== contrato.programa.id ||
      !Array.isArray(registro.ajustes))
    throw new Error('Contrato y registro de ajustes incompatibles');
  const copia = structuredClone(contrato);
  const cambios = [], ids = new Set(), destinos = new Set();
  for (const a of registro.ajustes) {
    if (!a || typeof a.id !== 'string' || !a.id.trim() ||
        typeof a.motivo !== 'string' || !a.motivo.trim() ||
        typeof a.campo !== 'string' || !a.campo.trim() ||
        !Object.hasOwn(a, 'valor') || ids.has(a.id))
      throw new Error('Ajuste mal definido o ID repetido: ' + String(a?.id));
    ids.add(a.id);
    const llave = JSON.stringify(a.ruta) + '#' + a.campo;
    if (destinos.has(llave)) throw new Error('Correcciones contradictorias: ' + a.id);
    destinos.add(llave);
    const destino = localizar(copia, a.ruta, a.id);
    if (!destino || typeof destino !== 'object' ||
        !Object.hasOwn(destino, a.campo))
      throw new Error('Campo inexistente: ' + a.id);
    if (igual(destino[a.campo], a.valor)) continue;
    if (!Object.hasOwn(a, 'anterior') || !igual(destino[a.campo], a.anterior))
      throw new Error('Valor anterior no verificado; corrección rechazada: ' + a.id);
    destino[a.campo] = structuredClone(a.valor);
    cambios.push(a.id);
  }
  return {contrato:copia,cambios};
}

function ejecutar(argv) {
  const [id, modo] = argv;
  if (!/^[a-z][a-z0-9-]*$/.test(id || '') ||
      !['--verificar','--aplicar'].includes(modo) || argv.length !== 2)
    throw new Error('Uso: node scripts/aplicar-ajustes-academicos.js <id> --verificar|--aplicar');
  const archivo = path.join(raiz, 'datos', 'programas', id, 'academico.json');
  const registroPath = path.join(raiz, 'data', 'programas', id, 'ajustes.json');
  const original = fs.readFileSync(archivo, 'utf8');
  const contrato = JSON.parse(original);
  const registro = JSON.parse(fs.readFileSync(registroPath, 'utf8'));
  if (contrato.programa?.id !== id || registro.programaId !== id)
    throw new Error('El contrato o los ajustes pertenecen a otra carrera');
  const { contrato:actualizado, cambios } = aplicarAjustes(contrato, registro);
  if (modo === '--verificar' && cambios.length)
    throw new Error('Ajustes todavía no integrados: ' + cambios.join(', '));
  if (modo === '--aplicar' && cambios.length) {
    const texto = original.includes('\n') ?
      JSON.stringify(actualizado, null, 2) + '\n' : JSON.stringify(actualizado);
    fs.writeFileSync(archivo, texto, 'utf8');
  }
  console.log('OK: ' + id + ', ' + registro.ajustes.length +
    ' ajustes comprobados; ' + cambios.length +
    (modo === '--aplicar' ? ' aplicados.' : ' pendientes.'));
}

module.exports = {localizar,aplicarAjustes,ejecutar};
if (require.main === module) {
  try { ejecutar(process.argv.slice(2)); }
  catch (error) { console.error('ERROR: ' + error.message); process.exitCode = 1; }
}
