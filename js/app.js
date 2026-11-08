'use strict';

/**
 * Interfaz: estado de consulta, escenarios personales y ocho vistas.
 * El motor puro está en js/analisis.js, cargado antes de esta interfaz.
 * No consulta datos académicos originales ni define el algoritmo de choques.
 */
const CONTEXTO = window.CONTEXTO_ACADEMICO;
if (!CONTEXTO || !CONTEXTO.estadoBase) throw new Error('No existe un contexto académico inicializado');
const OPCIONES = CONTEXTO.opciones;
const PROGRAMA = CONTEXTO.programa;
const METADATOS = CONTEXTO.metadatos;
const CALENDARIO = new CalendarioAcademico(CONTEXTO.calendario);
const DAYS = CALENDARIO.ids();
const DAY_NAMES = Object.fromEntries(DAYS.map(id => [id, CALENDARIO.nombre(id)]));
const DAY_SHORT = Object.fromEntries(DAYS.map(id => [id, CALENDARIO.corto(id)]));
const H_MIN = CALENDARIO.inicio, H_MAX = CALENDARIO.fin;

/* ===== APLICACIÓN: estado, utilidades, cabecera, Inicio, Interferencias, panel lateral ===== */
const KEY = CONTEXTO.almacenamiento.clave;
// Autocompletado para ediciones PERSONALES, no asignaciones institucionales.
// Opción libre: algunas materias pueden tener unidades fuera de estas sugerencias.
const UNIDADES_SUGERIDAS=[
  'Departamento de Ingeniería Civil y Agrícola · Facultad de Ingeniería',
  'Departamento de Ingeniería Eléctrica y Electrónica · Facultad de Ingeniería',
  'Departamento de Ingeniería de Sistemas e Industrial · Facultad de Ingeniería',
  'Departamento de Ingeniería Mecánica y Mecatrónica · Facultad de Ingeniería',
  'Departamento de Ingeniería Química y Ambiental · Facultad de Ingeniería',
  'Facultad de Artes','Facultad de Ciencias','Facultad de Ciencias Agrarias',
  'Facultad de Ciencias Económicas','Facultad de Ciencias Humanas',
  'Facultad de Derecho, Ciencias Políticas y Sociales','Facultad de Enfermería',
  'Facultad de Medicina','Facultad de Medicina Veterinaria y de Zootecnia',
  'Facultad de Odontología'
];
const SIN_UNIDAD='__sin_unidad__';

const PAGES_ORDER = [['inicio', 'Inicio'], ['inter', 'Interferencias'], ['asig', 'Asignaturas'], ['grupos', 'Grupos'], ['hor', 'Horarios'], ['heat', 'Mapa de calor'], ['demanda', 'Demanda'], ['malla', 'Prerrequisitos']];

// S0 = referencia reconstruida desde el contrato; S = copia editable personal.
// Mantener separadas estas identidades al importar, guardar y restablecer.
let S0 = clone(CONTEXTO.estadoBase), S = clone(S0), restored = false, datosGuardados = null;
 // Ambigüedades reales de snapshots antiguos de requisitos: se conservan
 // hasta que la persona elige por regla, sin perder los demás cambios.
 let pendientesRequisitos = [];
try {
  const texto = localStorage.getItem(KEY);
  if (texto) {
    const o = JSON.parse(texto);
    if (o?.tipo === 'escenario-personal' && o.version === 1 && o.cambios) datosGuardados = o;
    else if (o?.S && Array.isArray(o.S.bloques) && o.S.params) datosGuardados = o;
  }
} catch (e) { /* la herramienta funciona sin almacenamiento */ }
/**
 * Transición de escenarios históricos, NO conversión de fuentes académicas.
 * Conserva la semántica v0.4.x y resuelve compatibilidad de datos guardados.
 * No usarla para editar `datos/academico.json` ni inventar datos del plan.
 */
function fixMalla(s) {
  const base = clone(CONTEXTO.estadoBase);
  if (!s.tipos) s.tipos = clone(base.tipos);
  else for (const tipo of ['componentes', 'caracteres']) {
    if (!Array.isArray(s.tipos[tipo])) s.tipos[tipo] = [];
    base.tipos[tipo].forEach(item => {
      const actual = s.tipos[tipo].find(x => x.id === item.id);
      if (!actual) s.tipos[tipo].push({ ...item });
      else if (tipo === 'componentes' && actual.enPlan == null) actual.enPlan = item.enPlan;
    });
  }
  if (!Array.isArray(s.reqCred)) s.reqCred = clone(base.reqCred);
  else {
    s.reqCred = s.reqCred.map(r => {
      if (Array.isArray(r.componentes)) return r;
      const baseRule = base.reqCred.find(x => x.n === r.n);
      return { n: r.n, min: r.min, componentes: clone(baseRule ? baseRule.componentes : []) };
    });
    base.reqCred.forEach(r => { if (!s.reqCred.some(x => x.n === r.n)) s.reqCred.push(clone(r)); });
  }
  base.malla.forEach(m => { const x = s.malla.find(y => y.n === m.n); if (!x) s.malla.push({ ...m }); else { if (m.nota && !x.nota) x.nota = m.nota; if (x.cr == null) x.cr = m.cr; if (!x.comp) x.comp = m.comp; if (x.car == null) x.car = m.car; } });
  if (!s.mig3) { s.mig3 = 1; s.malla = s.malla.filter(m => !['Libre elección (X-5)', 'Libre elección (X-6)'].includes(m.n)); }
  if (!s.mig2) { s.mig2 = 1; s.malla.forEach(m => { if (/^Libre elección \(X-/.test(m.n) && m.cr > 3) m.cr = 3; }); }
  if (!s.mig1) { s.mig1 = 1; s.pre = s.pre.filter(p => !(p.r === 'Proyecto Aplicado de Ingeniería' && p.t === 'Trabajo de Grado')); }
  if (!s.mig4) { s.mig4 = 1; s.pre = base.pre.map(p => ({ ...p })).concat(s.pre.filter(p => p.m === 'agregado' && !base.pre.some(q => q.r === p.r && q.t === p.t))); s.malla.forEach(m => { const o = base.malla.find(y => y.n === m.n); if (o && /créditos del plan|% de los créditos/.test(m.nota || '')) m.nota = o.nota; }); }
  // Transición histórica: Inglés dejó de tener código de componente LE separado
  // porque el catálogo institucional lo clasifica como Nivelación (E).
  // Solo se cambia el registro antiguo cuando el nuevo plan confirma la equivalencia.
  s.malla.forEach(m => {
    const actual = base.malla.find(x => x.n === m.n);
    if (m.comp === 'LE' && actual?.comp === 'N') m.comp = 'N';
  });
  if (Array.isArray(s.tipos?.componentes) && !s.malla.some(m => m.comp === 'LE')) {
    s.tipos.componentes = s.tipos.componentes.filter(c => c.id !== 'LE');
  }
  // Incorporación única de los grupos nuevos de la oferta, sin restablecer
  // grupos antiguos eliminados por el usuario ni sobrescribir horarios editados.
  const inc = CONTEXTO.incrementosOferta;
  if (inc && !(s.incorporacionesOferta || []).includes(inc.id)) {
    const nuevas = new Set(inc.nuevasAsignaturas || []);
    const extras = new Map((inc.complementarGrupos || []).map(([n, ids]) => [n, new Set(ids)]));
    nuevas.forEach(n => { if (!s.asg.includes(n) && base.asg.includes(n)) s.asg.push(n); });
    const porComponente = new Map();
    base.bloques.forEach(b => {
      const k = b.a + '\u0001' + b.c;
      if (!porComponente.has(k)) porComponente.set(k, []);
      porComponente.get(k).push(b);
    });
    let siguiente = s.bloques.reduce((id, b) => Math.max(id, b.id || 0), 0);
    base.grupos.forEach(g => {
      const aplicable = nuevas.has(g.a) || extras.get(g.a)?.has(g.g);
      if (!aplicable || !s.asg.includes(g.a) || s.grupos.some(x => x.a === g.a && x.g === g.g)) return;
      s.grupos.push({ ...g });
      const componentes = [g.c1, g.c2].filter(Boolean);
      componentes.forEach(c => (porComponente.get(g.a + '\u0001' + c) || [])
        .forEach(b => s.bloques.push({ ...b, id: ++siguiente })));
    });
    s.incorporacionesOferta = [...(s.incorporacionesOferta || []), inc.id];
  }
  // No restaurar aquí requisitos que el usuario retiró deliberadamente de su escenario.
  return s;
}
function fixParams(s) {
  if (!Array.isArray(s.params.dists)) {
    const d = OPCIONES.distanciasDisponibles;
    const max = s.params.maxDist == null ? Math.max(...OPCIONES.distanciasIniciales) : s.params.maxDist;
    s.params.dists = d.filter(x => x <= max);
    if (!s.params.dists.length) s.params.dists = [...OPCIONES.distanciasIniciales];
  }
  return s;
}
fixParams(S0); fixMalla(S0);
S = clone(S0);
/**
 * Distingue el formato actual de diferencias personales (v1) del antiguo
 * `{S}` completo. Ambos se reconstruyen sobre S0; después se validan los
 * intervalos técnicos antes de reemplazar el escenario efectivo de la UI.
 */
function recuperarEscenarioGuardado(o) {
  if (o.tipo === 'escenario-personal' && o.version === 1) {
    return EscenarioPersonal.aplicar(S0, o.cambios);
  }
  const anterior = clone(o.S);
  fixParams(anterior); fixMalla(anterior);
  return EscenarioPersonal.migrarAnterior(S0, anterior, window.fuentesAcademicas.datos, fromRaw, EntradaAcademica);
}
if (datosGuardados) {
  try {
    S = EscenarioPersonal.validarEstado(recuperarEscenarioGuardado(datosGuardados), CALENDARIO);
    pendientesRequisitos = EscenarioPersonal.requisitosAmbiguos(S0, datosGuardados, S);
    restored = true;
  } catch (e) {
    console.error('No se pudo reconstruir el escenario anterior:', e);
    S = clone(S0);
    pendientesRequisitos = [];
  }
}
// R: resultados sin filtro de componentes de la sesión; R0: referencia.
// RV/RV0 son consultas filtradas y NUNCA reemplazan al escenario S/S0.
let R = compute(S), R0 = compute(S0);

/**
 * Estado TRANSITORIO de navegación, selección y paneles. Se distingue de S:
 * los filtros de visualización no se persistirán como cambios académicos.
 */
const ui = {
  page: 'inicio',
  componentes: new Set(OPCIONES.componentesComparables || []),
  unidad: '', // filtro de vista, nunca edición del contrato
  inter: { view: 'lista', dists: new Set(), grav: new Set(), sems: new Set(), asig: '', soloChoque: true, q: '', sort: 'idx' },
  asig: { sort: 'idx', open: null },
  grp: { sel: null },
  hor: { a: S.asg.includes(OPCIONES.asignaturaInicial) ? OPCIONES.asignaturaInicial : S.asg[0], comp: null, ov: [] },
  heat: { off: new Set() }, // asignaturas excluidas del mapa; por defecto entran todas
  demanda: { orden:'porGrupo', semestre:'', seleccion:'', puntoActivo:'', sinDato:false, vistaEjemplo:false, metricaMalla:'porGrupo', confirmarEjemplo:false, confirmarBorrar:false },
  malla: { sel: null, edges: 'all', soloHor: false, zoom: 1, ampliado: false,
    libres: true, equilibrar: true, libresFijas: new Set(), ubicacionesLibres: new Map() },
  drawer: null, // {type:'pair', key, ga, gb} | {type:'cambios'}
};

/* El filtro es solo de visualización: grupos, horarios, malla y escenarios se conservan. */
let RV, RV0;
/**
 * Recalcula resultados de CONSULTA para los componentes seleccionados.
 * Se aplica a copias superficiales con `asg` filtrada; no se borran grupos,
 * ni bloques, ni ediciones personales de S o S0.
 */
/**
 * Los filtros globales limitan CONSULTAS, nunca modifican el escenario.
 * Unidad desconocida permanece vacía: no se infiere desde el profesor.
 */
function pasaFiltros(m) {
  return !!m && ui.componentes.has(m.comp) &&
    (!ui.unidad || (ui.unidad===SIN_UNIDAD ? !m.unidad : m.unidad===ui.unidad));
}
function nombresVisibles(estado, candidatos=estado.asg) {
  const indice=new Map(estado.malla.map(m=>[m.n,m]));
  return candidatos.filter(n=>pasaFiltros(indice.get(n)));
}
function actualizarVistaComponentes() {
  const nombres=nombresVisibles(S),seleccion=new Set(nombres);
  RV=compute({...S,asg:nombres});
  // Misma selección de asignaturas contra la referencia, aunque la unidad
  // solo se haya registrado como modificación personal en S.
  RV0=compute({...S0,asg:S0.asg.filter(n=>seleccion.has(n))});
}
actualizarVistaComponentes();

/* ---------- utilidades ---------- */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const pct = (x, d = 0) => (x * 100).toFixed(d) + '%';

// Editor de unidad responsable. No supone relación permanente con un docente;
// admite datos incompletos y una opción fuera del autocompletado.
function editorUnidad(nombre) {
  const m=S.malla.find(x=>x.n===nombre);
  if(!m)return '';
  return `<div class="unidad-editor"><label>Departamento / facultad responsable</label><input type="text" list="unidades-academicas" data-chg="unidad-asig" data-n="${esc(nombre)}" value="${esc(m.unidad||'')}" placeholder="Sin información · elegir o escribir" maxlength="180" aria-label="Unidad responsable de ${esc(nombre)}"><span class="hint">Dato opcional del escenario; no se deduce del docente.</span></div>`;
}

const planActual = () => new PlanCurricular(S);
const compName = id => planActual().nombreComponente(id);
const carName = id => planActual().nombreCaracter(id);
const creditRuleFor = n => planActual().requisitoCreditos(n);
const creditStatus = (m, r) => planActual().evaluarCreditos(m, r);
function creditRequirementNote(m) {
  const r = creditRuleFor(m.n);
  if (!r) return m.nota ? '<div class="note">' + esc(m.nota) + '.</div>' : '';
  const q = creditStatus(m, r);
  const which = (r.componentes || []).map(compName).join(' + ') || 'sin especificar';
  // Si no hay información suficiente, se presenta únicamente la regla conocida,
  // sin total parcial ni aviso de inconsistencia.
  if (q.unknown) return '<div class="note"><b>Requisito mínimo:</b> ' + r.min + ' créditos. Se cuentan: ' + esc(which) + '.</div>';
  const statement = q.low ? 'Inconsistencia en la distribución por semestres: faltan ' + (r.min - q.total) + ' créditos.' : 'No se detecta inconsistencia en la distribución por semestres.';
  return '<div class="note ' + (q.low ? 'heat' : '') + '"><b>Requisito mínimo:</b> ' + r.min + ' créditos. <span>Se cuentan: ' + esc(which) + '.</span><div style="margin-top:5px">Créditos anteriores: <b>' + q.total + '</b>. ' + esc(statement) + '</div><small style="display:block;margin-top:6px">Comprobación de distribución curricular, no de asignaturas aprobadas por un estudiante.</small></div>';
}
const norm = s => String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
const fmtB = b => `${DAY_SHORT[b.d]} ${b.s}–${b.e}`;
const heatBg = t => `color-mix(in srgb,var(--heat) ${Math.round(Math.min(1, Math.sqrt(t)) * 92)}%,var(--surface2))`;
const nextId = () => S.bloques.reduce((m, b) => Math.max(m, b.id), 0) + 1;
const signed = n => (n > 0 ? '+' : n < 0 ? '−' : '±') + Math.abs(n);
function dlt(now, before, d = 0, lowerBetter = true) {
  const diff = +(now - before).toFixed(6);
  if (Math.abs(diff) < 1e-9) return '';
  const good = lowerBetter ? diff < 0 : diff > 0;
  return `<span class="delta ${good ? 'down' : 'up'}" title="Antes: ${d ? pct(before, d) : before}">${d ? (diff > 0 ? '+' : '−') + Math.abs(diff * 100).toFixed(d) + ' pp' : signed(diff)}</span>`;
}
function levelDesc(k) {
  const d = parseInt(k), t = k.slice(-1);
  const dd = d === 0 ? 'Mismo semestre' : d === 1 ? 'Semestres contiguos' : `A ${d} semestres`;
  return [dd, t === 'a' ? 'Ninguna pareja de grupos cabe: no se pueden cursar juntas' : 'Solo algunas parejas caben: hay que elegir los grupos'];
}
function toast(msg) {
  /* aviso accesible */
  $$('.toast').forEach(x => x.remove());
  const t = document.createElement('div'); t.className = 'toast'; t.setAttribute('role', 'status'); t.textContent = msg; document.body.appendChild(t);
  setTimeout(() => t.remove(), 4200);
}
/**
 * Persistencia local: solo `{tipo,version,cambios}` generados por
 * EscenarioPersonal.empaquetar(S0,S), no otra fuente académica ni un S0 nuevo.
 * No depende del servidor ni altera el archivo normalizado.
 */
function save() {
  try { localStorage.setItem(KEY, JSON.stringify(EscenarioPersonal.empaquetar(S0, S, pendientesRequisitos))); }
  catch (e) { /* El escenario funciona sin almacenamiento. */ }
}

/**
 * Consolida una acción VOLUNTARIA de edición en S: recalcula R y RV,
 * guarda el delta personal y actualiza la interfaz. No es un commit de Git
 * ni debe llamarse desde filtros que solo cambian la selección de consulta.
 */
function commit(extraMsg) {
  const prev = R; R = compute(S); actualizarVistaComponentes(); save();
  const flips = [];
  R.pairs.forEach(p => { const q = prev.pairs.find(x => x.key === p.key); if (q && q.enRango !== p.enRango && (p.clash || q.clash)) flips.push(`${p.A} ⇄ ${p.B} ${p.enRango ? 'ahora cuenta' : 'deja de contar'}`); });
  const msg = [extraMsg, flips.slice(0, 2).join(' · ') + (flips.length > 2 ? ` (+${flips.length - 2} más)` : '')].filter(Boolean).join(' — ');
  render();
  if (msg) toast(msg);
}

/* ---------- diferencias respecto a la fuente inicial del programa ---------- */
/**
 * Resumen legible de cambios para paneles de la UI. La representación
 * persistida/autoritativa de las ediciones es EscenarioPersonal.diferencias,
 * no las etiquetas de esta función.
 */
function changes() {
  const out = [];
  if (S.params.dists.join() !== S0.params.dists.join()) out.push(['Parámetro', `Distancia entre semestres: ${distNames(S0.params.dists)} → ${distNames(S.params.dists)}`]);
  if (S.params.indirect !== S0.params.indirect) out.push(['Parámetro', `Excluir prerrequisitos indirectos: ${S0.params.indirect ? 'sí' : 'no'} → ${S.params.indirect ? 'sí' : 'no'}`]);
  S.malla.forEach(m => { const o = S0.malla.find(x => x.n === m.n); if (!o) out.push(['Malla', `Asignatura nueva: ${m.n} (sem ${m.s})`]); else { if (o.s !== m.s) out.push(['Semestre', `${m.n}: semestre ${o.s} → ${m.s}`]); if (o.cr !== m.cr) out.push(['Créditos', `${m.n}: ${o.cr} → ${m.cr} créditos`]); if (o.comp !== m.comp) out.push(['Tipología', `${m.n}: ${compName(o.comp)} → ${compName(m.comp)}`]); if (o.car !== m.car) out.push(['Tipología', `${m.n}: ${carName(o.car) || '—'} → ${carName(m.car) || '—'}`]); if ((o.unidad||'') !== (m.unidad||'')) out.push(['Unidad', `${m.n}: ${o.unidad||'Sin información'} → ${m.unidad||'Sin información'}`]); } });
  const pk = p => p.r + ' → ' + p.t;
  const a0 = new Set(S0.pre.map(pk)), a1 = new Set(S.pre.map(pk));
  a1.forEach(k => { if (!a0.has(k)) out.push(['Prerrequisito', `Agregado: ${k}`]); });
  a0.forEach(k => { if (!a1.has(k)) out.push(['Prerrequisito', `Quitado: ${k}`]); });
  S.asg.forEach(n => { if (!S0.asg.includes(n)) out.push(['Asignatura', `Se agregó al análisis: ${n}`]); });
  S0.asg.forEach(n => { if (!S.asg.includes(n)) out.push(['Asignatura', `Se quitó del análisis: ${n}`]); });
  const gk = g => g.a + '·' + g.g;
  const g0 = new Map(S0.grupos.map(g => [gk(g), g])), g1 = new Map(S.grupos.map(g => [gk(g), g]));
  g1.forEach((g, k) => { const o = g0.get(k); if (!o) out.push(['Grupo', `Nuevo grupo ${g.a} ${g.g}`]); else { if (o.on !== g.on) out.push(['Grupo', `${g.a} ${g.g}: ${g.on ? 'se vuelve a ofertar' : 'se deja de ofertar'}`]); if (o.c1 !== g.c1 || o.c2 !== g.c2) out.push(['Grupo', `${g.a} ${g.g}: componentes cambiaron`]); } });
  g0.forEach((g, k) => { if (!g1.has(k)) out.push(['Grupo', `Grupo eliminado: ${g.a} ${g.g}`]); });
  const b0 = new Map(S0.bloques.map(b => [b.id, b])), b1 = new Map(S.bloques.map(b => [b.id, b]));
  b1.forEach((b, id) => { const o = b0.get(id); if (!o) out.push(['Horario', `${b.a} · ${b.c}: nuevo bloque ${fmtB(b)}`]); else if (o.d !== b.d || o.s !== b.s || o.e !== b.e) out.push(['Horario', `${b.a} · ${b.c}: ${fmtB(o)} → ${fmtB(b)}`]); else if (o.c !== b.c) out.push(['Horario', `${b.a}: componente ${o.c} → ${b.c}`]); });
  b0.forEach((b, id) => { if (!b1.has(id)) out.push(['Horario', `${b.a} · ${b.c}: bloque quitado (${fmtB(b)})`]); });
  // Una encuesta es una anotación personal separada, nunca un cambio académico.
  if (JSON.stringify(S.demanda??null)!==JSON.stringify(S0.demanda??null))
    out.push(['Demanda', 'Datos de preinscripción: '+(S.demanda?.solicitudes?.length||0)+' asignaturas registradas'+(S.demanda?.simulado?' (simulación)':'')]);
  return out;
}
function pairDeltas() {
  const out = [];
  RV.pairs.forEach(p => {
    const q = RV0.pairs.find(x => x.key === p.key);
    const before = q && q.enRango ? q : null, now = p.enRango ? p : null;
    const bi = before ? before.idx : 0, ni = now ? now.idx : 0;
    const bc = before ? before.clash : 0, nc = now ? now.clash : 0;
    if (Math.abs(bi - ni) > 1e-9 || bc !== nc || (before ? 1 : 0) !== (now ? 1 : 0)) out.push({ p, q, bi, ni, bc, nc });
  });
  out.sort((x, y) => Math.abs(y.ni - y.bi) - Math.abs(x.ni - x.bi));
  return out;
}

/* ---------- cabecera ---------- */
function resetLabel(long) { return ui.confirmReset ? '¿Seguro? Clic otra vez' : (long ? 'Restablecer a datos de referencia' : 'Restablecer'); }
function renderTop() {
  // En los tests de dominio no se carga la presentación opcional tema.js.
  const modoClaro = typeof TemaVisual !== 'undefined' && TemaVisual.actual() === 'light';
  const nChg = changes().length;
  const dirty = nChg > 0;
  const resultadoVisible = RV, anteriorVisible = RV0;
  const componentes = (OPCIONES.componentesComparables || []).map(id => {
    const tipo = new PlanCurricular(S).componente(id);
    const nombre = tipo?.nombre || id;
    const total = new PlanCurricular(S).seleccionarPorComponentes(S.asg, [id]).length;
    return `<button type="button" class="component-toggle" data-act="comp-toggle" data-comp="${esc(id)}" aria-pressed="${ui.componentes.has(id)}" title="${total} asignaturas de ${esc(nombre)} incorporadas al análisis">${esc(nombre)}</button>`;
  }).join('');
  return `<a class="cta-bar" href="https://www.instagram.com/repremecatronicaun/" target="_blank" rel="noopener noreferrer"><span class="cta-in"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/></svg><span class="cta-t"><b>Queremos tu opinión.</b> ¿Encontraste un error o tienes una idea para optimizar esta herramienta?</span><span class="cta-b">Escríbenos en Instagram · @repremecatronicaun →</span></span></a>
  <div class="top-in">
    <div class="brand-wrap"><div class="brand"><b>Gestor de horarios</b><span>Comunidad UNAL · sitio no oficial</span></div><div class="programa-actual" aria-label="Programa académico en consulta"><span class="programa-senal" aria-hidden="true"></span><span class="programa-etiqueta"><small>Programa en consulta</small><strong>${esc(PROGRAMA.nombre)}</strong></span></div></div>
    <nav class="nav" aria-label="Secciones">${PAGES_ORDER.map(([k, l]) => `<button data-act="nav" data-p="${k}" ${ui.page === k ? 'aria-current="page"' : ''}>${l}</button>`).join('')}</nav>
    <button type="button" class="btn sm tema-toggle" data-act="tema-cambiar"
      aria-label="${!modoClaro?'Activar modo claro':'Activar modo oscuro'}"
      aria-pressed="${modoClaro}"
      title="Tema visual; no modifica datos ni escenarios">${!modoClaro?'☀ Modo claro':'☾ Modo oscuro'}</button>
    <div class="chg">
      <div class="pill-stat ${dirty ? 'dirty' : ''}">
        <span>${dirty ? `<b>${nChg}</b> cambio${nChg > 1 ? 's' : ''} · parejas con choque <b class="num">${anteriorVisible.totalPairs} → ${resultadoVisible.totalPairs}</b> ${dlt(resultadoVisible.totalPairs, anteriorVisible.totalPairs)}` : 'Datos de referencia del programa'}</span>
        ${dirty ? `<button class="btn sm" data-act="drawer-cambios">Ver cambios</button><button class="btn sm danger" data-act="reset">${resetLabel()}</button>` : ''}
      </div>
      <button class="btn sm" data-act="export" title="Descargar tu escenario como archivo">Guardar</button>
      <button class="btn sm" data-act="import" title="Cargar un escenario guardado">Cargar</button>
      <input type="file" id="file-in" accept=".json,application/json" class="sr" tabindex="-1">
       <div class="componentes-bar" role="group" aria-label="Filtros globales de tipología y unidad académica">
         <span class="componentes-label">Tipología:</span>${componentes}
         <label class="unidad-filtro" for="filtro-unidad">Departamento / facultad
           <select id="filtro-unidad" data-chg="unidad-filtro" aria-label="Filtrar por departamento o facultad">
             <option value="">Todas las unidades</option>
             <option value="${SIN_UNIDAD}" ${ui.unidad===SIN_UNIDAD?'selected':''}>Sin información</option>
             ${[...new Set(S.malla.map(m=>m.unidad).filter(Boolean))].sort((a,b)=>a.localeCompare(b,'es')).map(u=>`<option value="${esc(u)}" ${ui.unidad===u?'selected':''}>${esc(u)}</option>`).join('')}
           </select>
         </label>
         <button class="btn sm ghost" data-act="filtro-reset" title="Mostrar todos los componentes y unidades">Todos</button>
         <datalist id="unidades-academicas">${UNIDADES_SUGERIDAS.map(u=>`<option value="${esc(u)}"></option>`).join('')}</datalist>
       </div>
    </div>
  </div>
  ${pendientesRequisitos.length?`<section class="revision-req" aria-label="Revisión de requisitos de un escenario antiguo">
    <p><b>Revisa ${pendientesRequisitos.length} requisito${pendientesRequisitos.length===1?'':'s'} de tu escenario anterior.</b> Los valores guardados difieren de la referencia académica vigente. No se han descartado ni reemplazado automáticamente.</p>
    <details><summary>Comparar y resolver por asignatura</summary>
      <div class="revision-req-list">${pendientesRequisitos.map(p=>`<div class="revision-req-item">
        <b>${esc(p.nombre)}</b>
        <span>Guardado: ${esc(p.guardado?p.guardado.min+' cr · '+p.guardado.componentes.map(compName).join(' + '):'sin requisito')}</span>
        <span>Referencia: ${esc(p.vigente?p.vigente.min+' cr · '+p.vigente.componentes.map(compName).join(' + '):'sin requisito')}</span>
        <div class="row">
          <button class="btn sm" type="button" data-act="req-vigente" data-key="${esc(p.key)}">Usar referencia vigente</button>
          <button class="btn sm" type="button" data-act="req-conservar" data-key="${esc(p.key)}">Conservar guardado</button>
        </div>
      </div>`).join('')}</div>
    </details></section>`:''}`;
}

/* Las siete vistas previas siguen en js/vistas.js; DEM-01 está en js/demanda.js. */

/* ===== RENDER ===== */
const PAGES = { inicio: pageInicio, inter: pageInter, asig: pageAsig, grupos: pageGrupos, hor: pageHor, heat: pageHeat, demanda: pageDemanda, malla: pageMalla };
/**
 * Redibuja la vista activa a partir de resultados existentes y preserva,
 * cuando es posible, desplazamiento y foco de interacción. La selección
 * pertenece a `ui`; las modificaciones académicas simuladas pertenecen a S.
 */
function render() {
  const ae = document.activeElement, fid = ae && ae.id, ss = ae && ae.selectionStart, se = ae && ae.selectionEnd;
  // Preservar la posición de lectura al filtrar o seleccionar una asignatura.
  // También se mantiene el desplazamiento de gráficos y horarios en móvil.
  const desplazables = ['#canvas', '.mxwrap', '.weekgrid-scroll', '.dem-grafico-wrap'];
  const keep = desplazables.map(selector => {
    const el = $(selector);
    return el ? { selector, x:el.scrollLeft, y:el.scrollTop } : null;
  }).filter(Boolean);
  const sideEl = $('.sidelist'), sideTop = sideEl ? sideEl.scrollTop : 0;
  $('#top').innerHTML = renderTop();
  $('#view').innerHTML = PAGES[ui.page]();
  renderDrawer();
  keep.forEach(({ selector, x, y }) => {
    const el = $(selector);
    if (el) { el.scrollLeft = x; el.scrollTop = y; }
  });
  document.body.classList.toggle('mapa-ampliado', ui.page === 'malla' && ui.malla.ampliado);
  if ($('.sidelist')) $('.sidelist').scrollTop = sideTop;
  const cur = $('.nav [aria-current]'); if (cur) cur.parentElement.scrollLeft = cur.offsetLeft - 24;
  if (ui.page === 'malla') drawEdges();
  if (fid) { const n = document.getElementById(fid); if (n) { n.focus(); try { if (ss != null && n.setSelectionRange) n.setSelectionRange(ss, se); } catch (e) { } } }
}

/* ===== ACCIONES ===== */
function go(p) { ui.page = p; ui.drawer = null; ui.malla.ampliado = false; window.scrollTo(0, 0); try { history.replaceState(null, '', '#' + p); } catch (e) { } render(); }
/**
 * Zoom local de presentación de la malla (60–160 %).
 * Mantiene el centro visible sin alterar posiciones ni créditos académicos.
 */
function ajustarZoomMapa(nuevo) {
  const anterior = ui.malla.zoom;
  const escala = Math.max(.6, Math.min(1.6, Math.round(nuevo*10)/10));
  if (escala === anterior) return;
  const antes = $('#canvas');
  const centroX = antes ? (antes.scrollLeft + antes.clientWidth/2)/anterior : 0;
  const centroY = antes ? (antes.scrollTop + antes.clientHeight/2)/anterior : 0;
  ui.malla.zoom = escala;
  render();
  const despues = $('#canvas');
  if (despues) {
    despues.scrollLeft = Math.max(0, centroX*escala - despues.clientWidth/2);
    despues.scrollTop = Math.max(0, centroY*escala - despues.clientHeight/2);
  }
  drawEdges();
}
function findGroup(a, g) { return S.grupos.find(x => x.a === a && x.g === g); }
/* tras borrar un grupo, un componente queda huérfano si ningún grupo lo usa */
function compsGone(a, c) { return !S.grupos.some(g => g.a === a && (g.c1 === c || g.c2 === c)); }
function download(name, text, type) { const u = URL.createObjectURL(new Blob([text], { type })); const a = document.createElement('a'); a.href = u; a.download = name; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(u), 1000); }

/**
 * Acciones delegadas desde `data-act`. Las ediciones ordinarias de S
 * pasan por commit; `reset` tiene su ruta propia para limpiar el almacenamiento.
 * Navegación y filtros solo redibujan. No leer archivos originales de oferta,
 * malla o catálogo desde eventos de interfaz.
 */
function onAct(act, d, el, ev) {
  const f = ui.inter;
  switch (act) {
    case 'tema-cambiar': if (typeof TemaVisual !== 'undefined') TemaVisual.alternar(); return render();
    case 'nav': ev.preventDefault(); return go(d.p);
    case 'dem-sel': {
      // Sincronizar el detalle con la identificación junto a la gráfica.
      ui.demanda.seleccion=d.pos;
      ui.demanda.puntoActivo=d.pos;
      render();
      // Al seleccionar con teclado, conservar el foco después del redibujado.
      if(ev?.type==='keydown'&&el?.classList?.contains('dem-marca'))
        Array.from(document.querySelectorAll('.dem-marca')).find(x=>x.dataset.pos===d.pos)?.focus();
      return;
    }
    case 'dem-vista': ui.demanda.vistaEjemplo=!ui.demanda.vistaEjemplo;
      ui.demanda.confirmarEjemplo=false;ui.demanda.seleccion='';ui.demanda.puntoActivo='';return render();
    case 'dem-plantilla': return download('plantilla-demanda.json',JSON.stringify({tipo:'demanda-preinscripcion',version:1,solicitudes:[]},null,2),'application/json');
    case 'dem-export': if(S.demanda)return download('demanda-preinscripcion.json',JSON.stringify(S.demanda,null,2),'application/json');return;
    case 'dem-import': return $('#demanda-file')?.click();
    case 'dem-ejemplo': {
      if(S.demanda&&!ui.demanda.confirmarEjemplo){ui.demanda.confirmarEjemplo=true;return render();}
      ui.demanda.confirmarEjemplo=false;
      ui.demanda.vistaEjemplo=false;
      S.demanda=DemandaEstadistica.ejemplo(S.malla,S.grupos);
      ui.demanda.seleccion='';ui.demanda.puntoActivo='';
      return commit('Datos simulados cargados y claramente identificados.');
    }
    case 'dem-borrar': {
      if(!S.demanda)return;
      if(!ui.demanda.confirmarBorrar){ui.demanda.confirmarBorrar=true;return render();}
      ui.demanda.confirmarBorrar=false; S.demanda=null;ui.demanda.seleccion='';ui.demanda.puntoActivo='';
      return commit('Se retiraron los datos de demanda del escenario.');
    }
    case 'dem-guardar': {
      const pos=ui.demanda.seleccion, entrada=$('#dem-cantidad');
      if(!pos||!entrada||!S.demanda||ui.demanda.vistaEjemplo)return;
      if(S.demanda.respuestasAnonimas&&!S.demanda.simulado)
        return toast('Con respuestas anónimas reales, importa un archivo actualizado para mantener los conteos consistentes.');
      const texto=entrada.value.trim();
      if(!/^\d+$/.test(texto)||!Number.isSafeInteger(Number(texto)))return toast('Escribe un entero no negativo. Para dato desconocido usa «Marcar desconocido».');
      try{
        const o=DemandaEstadistica.normalizar(S.demanda);
        // Editar cantidades ficticias las convierte en agregados, pues una
        // muestra anónima anterior ya no respaldaría los nuevos conteos.
        if(o.simulado&&o.respuestasAnonimas)o.respuestasAnonimas=null;
        o.solicitudes=o.solicitudes.filter(x=>x.posicionId!==pos);
        o.solicitudes.push({posicionId:pos,cantidad:Number(texto)});
        S.demanda=DemandaEstadistica.normalizar(o);
        return commit('Se registró la solicitud observada.');
      }catch(e){return toast(e.message);}
    }
    case 'dem-quitar': {
      const pos=ui.demanda.seleccion;if(!pos||!S.demanda||ui.demanda.vistaEjemplo)return;
      if(S.demanda.respuestasAnonimas&&!S.demanda.simulado)
        return toast('Con respuestas anónimas reales, carga un archivo actualizado para cambiar las solicitudes.');
      S.demanda=DemandaEstadistica.normalizar({...S.demanda,
        respuestasAnonimas:null,solicitudes:S.demanda.solicitudes.filter(x=>x.posicionId!==pos)});
      return commit('La cantidad quedó desconocida, no en cero.');
    }
    case 'filtro-reset': {
      ui.componentes=new Set(OPCIONES.componentesComparables||[]);
      ui.unidad='';
      actualizarVistaComponentes();
      return render();
    }
    case 'comp-toggle': {
      if (!(OPCIONES.componentesComparables || []).includes(d.comp)) return;
      if (ui.componentes.has(d.comp)) ui.componentes.delete(d.comp);
      else ui.componentes.add(d.comp);
      actualizarVistaComponentes();
      if (ui.inter.asig && !RV.names.includes(ui.inter.asig)) ui.inter.asig = '';
      if (ui.asig.open && !RV.names.includes(ui.asig.open)) ui.asig.open = null;
      return render();
    }
    case 'dist': { const x = +d.d, ds = S.params.dists; if (ds.includes(x)) { if (ds.length === 1) return toast('Deja al menos una distancia elegida.'); S.params.dists = ds.filter(v => v !== x); } else S.params.dists = [...ds, x].sort(); return commit(); }
        case 'i-view': f.view = d.v; return render();
    case 'i-dist': { const x = +d.d; f.dists.has(x) ? f.dists.delete(x) : f.dists.add(x); return render(); }
    case 'i-grav': f.grav.has(d.k) ? f.grav.delete(d.k) : f.grav.add(d.k); return render();
    case 'a-go': ui.asig.open = d.n; go('asig'); { const c = $$('.arow').find(x => x.dataset.aname === d.n); if (c) c.scrollIntoView({ block: 'center' }); } return;
    case 'i-sem': { const s = +d.s; f.sems.has(s) ? f.sems.delete(s) : f.sems.add(s); return render(); }
    case 'i-clear': Object.assign(f, { dists: new Set(), grav: new Set(), sems: new Set(), asig: '', soloChoque: true, q: '' }); return render();
    case 'i-csv': {
      const L = sortPairs(RV.pairs.filter(p => pairMatches(p)));
      const q = v => '"' + String(v).replace(/"/g, '""') + '"';
      const rows = [['Nivel', 'Sem. A', 'Asignatura A', 'Grupos A', 'Sem. B', 'Asignatura B', 'Grupos B', 'Parejas de grupos', 'Parejas en choque', 'Índice de solape', 'Distancia', 'Prerrequisito', 'Aplica', 'En rango'], ...L.map(p => [p.nivel, p.sA, p.A, p.nA, p.sB, p.B, p.nB, p.total, p.clash, p.idx.toFixed(4), p.dist, p.pre, p.aplica, p.enRango])];
      return download('interferencias.csv', '﻿' + rows.map(r => r.map(q).join(',')).join('\n'), 'text/csv');
    }
    case 'pair-open': ui.drawer = { type: 'pair', key: d.k }; return render();
    case 'cell': ui.drawer.ga = d.ga; ui.drawer.gb = d.gb; return render();
    case 'gtoggle': { const g = findGroup(d.a, d.g); g.on = !g.on; return commit(`${d.a} ${d.g}: ${g.on ? 'vuelve a ofertarse' : 'ya no se oferta'}`); }
    case 'drawer-close': ui.drawer = null; return render();
    case 'drawer-cambios': ui.drawer = { type: 'cambios' }; return render();
    case 'hor-go': ui.hor.a = d.n; ui.hor.comp = d.c || null; return go('hor');
    case 'grp-go': ui.grp.sel = null; go('grupos'); { const c = $$('.gcard').find(x => x.querySelector('h3').textContent.startsWith(d.n)); if (c) c.scrollIntoView({ block: 'center' }); } return;
    case 'inter-go': f.asig = d.n; f.soloChoque = false; f.view = 'lista'; return go('inter');
    case 'a-sort': ui.asig.sort = d.s; return render();
    case 'a-open': ui.asig.open = ui.asig.open === d.n ? null : d.n; return render();
    case 'g-sel': ui.grp.sel = ui.grp.sel && ui.grp.sel.a === d.a && ui.grp.sel.g === d.g ? null : { a: d.a, g: d.g }; return render();
    case 'g-toggle': { const g = findGroup(d.a, d.g); g.on = !g.on; return commit(); }
    case 'g-del': {
      S.grupos = S.grupos.filter(x => !(x.a === d.a && x.g === d.g));
      S.bloques = S.bloques.filter(b => b.a !== d.a || !compsGone(d.a, b.c));
      ui.grp.sel = null; return commit('Grupo eliminado');
    }
    case 'g-add': {
      const row = el.closest('.addrow'), a = row.dataset.a, name = $('.ng-n', row).value.trim();
      if (!name) return toast('Escribe el nombre del grupo (ej. G7).');
      if (S.grupos.some(g => g.a === a && (g.g === name || glabel(g) === name))) return toast('Ya existe un grupo con ese nombre.');
      let c = name; while (compsOf(a).includes(c)) c += '*';
      S.bloques.push({ id: nextId(), a, c, d: 'L', s: 7, e: 9, o: '' });
      S.grupos.push({ a, g: name, c1: c, c2: '', on: true }); ui.grp.sel = { a, g: name };
      return commit(`Grupo ${name} creado con un bloque de prueba (Lun 7–9): ajústalo en Horarios.`);
    }
    case 'asg-add': { const v = $('#asg-new').value; if (!v) return toast('Elige una asignatura de la lista.'); S.asg.push(v); ui.hor.a = v; return commit(`${v} entra al análisis. Agrégale grupos y horarios.`); }
    case 'asg-del': S.asg = S.asg.filter(x => x !== d.n); S.grupos = S.grupos.filter(g => g.a !== d.n); S.bloques = S.bloques.filter(b => b.a !== d.n); if (ui.grp.sel && ui.grp.sel.a === d.n) ui.grp.sel = null; return commit(`${d.n} salió del análisis`);
    /* horarios */
    case 'h-sel': ui.hor.a = d.n; ui.hor.comp = null; ui.hor.ov = []; return render();
    case 'h-comp': ui.hor.comp = ui.hor.comp === d.c ? null : d.c; render(); { const c = $$('.compcard').find(x => x.dataset.comp === d.c); if (c && ui.hor.comp) c.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); } return;
    case 'h-ov-del': ui.hor.ov = ui.hor.ov.filter(x => x !== d.n); return render();
    case 'h-ov-none': ui.hor.ov = []; return render();
    case 'h-ov-clash': ui.hor.ov = RV.pairs.filter(p => p.enRango && p.clash && (p.A === ui.hor.a || p.B === ui.hor.a)).map(p => p.A === ui.hor.a ? p.B : p.A); return render();
    case 'h-addb': S.bloques.push({ id: nextId(), a: ui.hor.a, c: d.c, d: 'L', s: 7, e: 9, o: '' }); ui.hor.comp = d.c; return commit();
    case 'h-delb': S.bloques = S.bloques.filter(b => b.id !== +d.id); return commit();
    case 'h-delc': S.bloques = S.bloques.filter(b => !(b.a === ui.hor.a && b.c === d.c)); return commit();
    case 'h-addc': {
      const v = $('#nc-name').value.trim(), A = ui.hor.a;
      if (!v) return toast('Escribe el nombre del componente.');
      if (compsOf(A).includes(v)) return toast('Ya existe un componente con ese nombre.');
      S.bloques.push({ id: nextId(), a: A, c: v, d: 'L', s: 7, e: 9, o: '' }); ui.hor.comp = v; return commit(`Componente ${v} creado: asígnalo a un grupo en Grupos.`);
    }
   /* mapa de calor */
    case 'hm-toggle': { if (ui.heat.off.has(d.n)) ui.heat.off.delete(d.n); else ui.heat.off.add(d.n); return render(); }
    case 'hm-all': ui.heat.off.clear(); return render();
    case 'hm-none': S.asg.forEach(n => ui.heat.off.add(n)); return render();
    /* malla: los controles de escala y ampliación son solo estado de interfaz */
    case 'm-zoom': return ajustarZoomMapa(ui.malla.zoom + Number(d.dx));
    case 'm-zoom-reset': return ajustarZoomMapa(1);
    case 'm-ampliar': ui.malla.ampliado = !ui.malla.ampliado; return render();
    case 'm-libres': ui.malla.libres = !ui.malla.libres; return render();
    case 'm-equilibrar': ui.malla.equilibrar = !ui.malla.equilibrar; return render();
    case 'm-sel': ui.malla.sel = ui.malla.sel === d.n ? null : d.n; return render();
    case 'm-edges': ui.malla.edges = d.v; return render();
    case 'm-cr': { if (!planActual().ajustarCreditos(ui.malla.sel, +d.dx)) return; return commit(); }
    case 'm-sem': { const m = planActual().asignatura(ui.malla.sel); if (!m) return; const o = m.s; planActual().moverSemestre(m.n, m.s + +d.dx); if (m.comp === idComponenteLibre(S.tipos)) ui.malla.libresFijas.add(m.n); return commit(`${m.n}: semestre ${o} → ${m.s}`); }
    case 'm-del': S.pre = S.pre.filter(p => !(p.r === d.r && p.t === d.t)); return commit(`Quitado: ${d.r} → ${d.t}`);
    case 'req-vigente': case 'req-conservar': {
      const pendiente=pendientesRequisitos.find(p=>p.key===d.key);
      if(!pendiente)return;
      if(act==='req-vigente'){
        const ids=EscenarioPersonal.indicePosiciones(S0);
        const key=r=>EscenarioPersonal.claveReq(r,ids);
        const idx=S.reqCred.findIndex(r=>key(r)===d.key);
        if(pendiente.vigente){
          if(idx>=0)S.reqCred[idx]=clone(pendiente.vigente);
          else S.reqCred.push(clone(pendiente.vigente));
        }else if(idx>=0)S.reqCred.splice(idx,1);
      }
      pendientesRequisitos=pendientesRequisitos.filter(p=>p.key!==d.key);
      return commit((act==='req-vigente'?'Referencia vigente aplicada: ':'Requisito anterior confirmado: ')+pendiente.nombre);
    }
    case 'reset': if (!ui.confirmReset) { ui.confirmReset = true; render(); setTimeout(() => { if (ui.confirmReset) { ui.confirmReset = false; render(); } }, 4000); return; } ui.confirmReset = false; S = clone(S0); ui.unidad=''; try { localStorage.removeItem(KEY); } catch (e) { } ui.drawer = null; pendientesRequisitos = []; ui.malla.libresFijas.clear(); R = compute(S); actualizarVistaComponentes(); render(); return toast('Volviste a los datos de referencia del programa.');
    case 'export': return download('escenario-horarios.json', JSON.stringify(EscenarioPersonal.empaquetar(S0, S), null, 1), 'application/json');
    case 'import': return $('#file-in').click();
  }
}
/**
 * Cambios de formularios (`data-chg`) y archivo de escenario personal.
 * Al importar se reconstruye y valida un escenario ANTES de asignarlo a S;
 * cargar cambios personales NO equivale a cargar otra entrada académica.
 */
function onChange(k, el) {
  const f = ui.inter;
  switch (k) {
    case 'unidad-filtro': ui.unidad=el.value; actualizarVistaComponentes(); return render();
    case 'dem-orden': ui.demanda.orden=el.value;return render();
    case 'dem-mapa': ui.demanda.metricaMalla=el.value;return render();
    case 'dem-semestre': ui.demanda.semestre=el.value;ui.demanda.seleccion='';ui.demanda.puntoActivo='';return render();
    case 'dem-elegir': ui.demanda.seleccion=el.value;return render();
    case 'dem-sindato': ui.demanda.sinDato=el.checked;return render();
    case 'dem-import-file': {
      const archivo=el.files?.[0];if(!archivo)return;
      const lector=new FileReader();
      lector.onload=()=>{
        try{
          const datos=DemandaEstadistica.normalizar(JSON.parse(lector.result));
          S.demanda=datos;ui.demanda.seleccion='';ui.demanda.puntoActivo='';ui.demanda.confirmarEjemplo=false;ui.demanda.vistaEjemplo=false;
          commit('Encuesta importada: '+datos.solicitudes.length+' asignaturas.');
        }catch(e){toast('No se pudo cargar la demanda: '+e.message);}
      };
      lector.readAsText(archivo);el.value='';return;
    }
    case 'unidad-asig': {
      const m=S.malla.find(x=>x.n===el.dataset.n);
      if(!m)return;
      const valor=el.value.trim();
      if(valor.length>180)return toast('Unidad académica demasiado extensa.');
      if((m.unidad||'')===valor)return;
      m.unidad=valor;
      // Una unidad ya no registrada no debe quedar seleccionada invisible
      // mientras el desplegable aparenta mostrar «Todas».
      if(ui.unidad && ui.unidad!==SIN_UNIDAD &&
        !S.malla.some(x=>x.unidad===ui.unidad))ui.unidad='';
      return commit(m.n+': unidad '+(valor||'sin información'));
    }
    case 'indirect': S.params.indirect = el.checked ? 1 : 0; return commit();
    case 'i-asig': f.asig = el.value; return render();
    case 'i-sort': f.sort = el.value; return render();
        case 'i-choque': f.soloChoque = !el.checked; return render();
    case 'm-solo': ui.malla.soloHor = el.checked; return render();
    case 'h-day': case 'h-s': case 'h-e': {
      const b = S.bloques.find(x => x.id === +el.dataset.id); if (!b) return;
      if (k === 'h-day') b.d = el.value; else if (k === 'h-s') { b.s = +el.value; if (b.e <= b.s) b.e = Math.min(H_MAX, b.s + 1); } else { b.e = +el.value; if (b.e <= b.s) b.s = b.e - 1; }
      ui.hor.comp = b.c; return commit();
    }
    case 'h-pick': ui.hor.a = el.value; ui.hor.comp = null; ui.hor.ov = []; return render();
    case 'h-ov-add': if (el.value) { ui.hor.ov.push(el.value); } return render();
    case 'h-rename': {
      const A = ui.hor.a, old = el.dataset.c, nv = el.value.trim();
      if (!nv || nv === old) return render();
      if (compsOf(A).includes(nv)) { toast('Ya existe un componente con ese nombre.'); return render(); }
      S.bloques.forEach(b => { if (b.a === A && b.c === old) b.c = nv; });
      S.grupos.forEach(g => { if (g.a === A) { if (g.c1 === old) g.c1 = nv; if (g.c2 === old) g.c2 = nv; } });
      if (ui.hor.comp === old) ui.hor.comp = nv; return commit();
    }
    case 'm-comp': { const m = planActual().cambiarComponente(ui.malla.sel, el.value); if (!m) return; return commit('Componente de ' + m.n + ': ' + compName(m.comp)); }
    case 'm-car': { const m = planActual().cambiarCaracter(ui.malla.sel, el.value); if (!m) return; return commit('Carácter de ' + m.n + ': ' + (carName(m.car) || 'No aplica')); }
    case 'm-addreq': if (el.value) { S.pre.push({ r: el.value, t: ui.malla.sel, m: 'agregado' }); return commit(`Agregado: ${el.value} → ${ui.malla.sel}`); } return;
    case 'm-addopen': if (el.value) { S.pre.push({ r: ui.malla.sel, t: el.value, m: 'agregado' }); return commit(`Agregado: ${ui.malla.sel} → ${el.value}`); } return;
    case 'import-file': {
      const file = el.files && el.files[0]; if (!file) return;
      const rd = new FileReader();
      rd.onload = () => {
        try {
          const o = JSON.parse(rd.result);
          if (!o || !((o.tipo === 'escenario-personal' && o.version === 1 && o.cambios) ||
            (o.S && o.S.params && Array.isArray(o.S.bloques) && Array.isArray(o.S.grupos)))) throw new Error('formato');
          const recuperado = EscenarioPersonal.validarEstado(recuperarEscenarioGuardado(o), CALENDARIO);
          const pendientes=EscenarioPersonal.requisitosAmbiguos(S0,o,recuperado);
          S = recuperado; pendientesRequisitos = pendientes; ui.drawer = null; commit('Escenario cargado.');
        } catch (e) { toast('Ese archivo no es un escenario válido.'); }
      };
      rd.readAsText(file); el.value = ''; return;
    }
  }
}

document.addEventListener('click', e => { const el = e.target.closest('[data-act]'); if (!el) return; onAct(el.dataset.act, el.dataset, el, e); });
document.addEventListener('change', e => { const el = e.target.closest('[data-chg]'); if (el) onChange(el.dataset.chg, el); else if (e.target.id === 'file-in') onChange('import-file', e.target); else if(e.target.id === 'demanda-file') onChange('dem-import-file',e.target); });
document.addEventListener('input', e => { const el = e.target.closest('[data-inp]'); if (el && el.dataset.inp === 'i-q') { ui.inter.q = el.value; render(); } });
document.addEventListener('toggle', e => { if (e.target.classList && e.target.classList.contains('filters')) ui.fopen = e.target.open; }, true);
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && ui.drawer) { ui.drawer = null; return render(); }
  if (e.key === 'Escape' && ui.page === 'malla' && ui.malla.ampliado) {
    ui.malla.ampliado = false;
    return render();
  }
  // Los puntos SVG de demanda deben poder seleccionarse con teclado.
  if ((e.key === 'Enter' || e.key === ' ') &&
      e.target?.classList?.contains('dem-marca')) {
    e.preventDefault();
    if (e.target.dataset.pos) return onAct('dem-sel',{pos:e.target.dataset.pos},e.target,e);
  }
});
window.addEventListener('resize', () => { if (ui.page === 'malla') drawEdges(); });
document.addEventListener('scroll', e => { }, true);

/* ---- arrastrar y soltar: bloques de horario y asignaturas de la malla ---- */
let dragData = null;
document.addEventListener('dragstart', e => {
  const b = e.target.closest && e.target.closest('.hb[data-bid]'), c = e.target.closest && e.target.closest('.mcard[data-n]');
  if (b) { dragData = { t: 'b', id: +b.dataset.bid }; b.classList.add('dragging'); } else if (c) { dragData = { t: 'c', n: c.dataset.n }; c.classList.add('dragging'); } else return;
  try { e.dataTransfer.setData('text/plain', 'x'); e.dataTransfer.effectAllowed = 'move'; } catch (er) { }
});
document.addEventListener('dragend', () => { dragData = null; $$('.dragging,.drop').forEach(x => x.classList.remove('dragging', 'drop')); });
document.addEventListener('dragover', e => {
  if (!dragData) return;
  const t = dragData.t === 'b' ? e.target.closest('.hc') : e.target.closest('.mcol');
  if (!t) return; e.preventDefault(); $$('.drop').forEach(x => x !== t && x.classList.remove('drop')); t.classList.add('drop');
});
document.addEventListener('drop', e => {
  if (!dragData) return;
  if (dragData.t === 'b') {
    const cell = e.target.closest('.hc'); if (!cell) return; e.preventDefault();
    const b = S.bloques.find(x => x.id === dragData.id); if (!b) return;
    const dur = b.e - b.s, h = +cell.dataset.h; const old = fmtB(b);
    b.d = cell.dataset.d; b.s = Math.min(h, H_MAX - dur); b.e = b.s + dur; ui.hor.comp = b.c; dragData = null;
    commit(`${b.c}: ${old} → ${fmtB(b)}`);
  } else {
    const col = e.target.closest('.mcol'); if (!col) return; e.preventDefault();
    const m = planActual().asignatura(dragData.n), ns = +col.dataset.sem; dragData = null;
    if (!m) return render();
    if (m.comp === idComponenteLibre(S.tipos)) ui.malla.libresFijas.add(m.n);
    if (m.s === ns) { ui.malla.sel = m.n; return render(); }
    const o = m.s; planActual().moverSemestre(m.n, ns); ui.malla.sel = m.n; commit(`${m.n}: semestre ${o} → ${m.s}`);
  }
});

/* ---- inicio ---- */
(function init() {
  const h = (location.hash || '').replace('#', '');
  if (PAGES[h]) ui.page = h;
  render();
  if (PROGRAMA?.nombre) document.title = 'Interferencias de horario · ' + PROGRAMA.nombre;
  const meta = METADATOS || {};
  const pie = document.getElementById('pie-datos');
  if (pie) pie.textContent = ['Malla: ' + (meta.malla || 'fecha no registrada'), 'Tipologías: ' + (meta.tipologias || 'fecha no registrada'), 'Horarios: ' + (meta.horarios || 'fecha no registrada')].join(' · ');
  if (restored && changes().length) toast('Recuperé los cambios que tenías guardados en este navegador.');
})();

