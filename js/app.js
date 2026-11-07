
/* ===== NÚCLEO DE CÁLCULO (sin DOM) ===== */
const CALENDARIO = new CalendarioAcademico(RAW.calendario);
const DAYS = CALENDARIO.ids();
const DAY_NAMES = Object.fromEntries(DAYS.map(id => [id, CALENDARIO.nombre(id)]));
const DAY_SHORT = Object.fromEntries(DAYS.map(id => [id, CALENDARIO.corto(id)]));
const H_MIN = CALENDARIO.inicio, H_MAX = CALENDARIO.fin;

function clone(o) { return JSON.parse(JSON.stringify(o)); }

/* Estado de datos:
   { params:{maxDist, indirect}, malla:[{n,s}], pre:[{r,t,m}], asg:[nombre],
     grupos:[{a,g,c1,c2,on}], bloques:[{id,a,c,d,s,e,o}] } */
function fromRaw(D) {
  return {
    params: { dists: [...D.opciones.distanciasIniciales], indirect: D.opciones.excluirIndirectos ? 1 : 0 },
    malla: D.malla.map(([n, s, nota, cr, comp, car]) => ({ n, s, nota: nota || '', cr: cr == null ? null : cr, comp: comp || '', car: car || '' })),
    pre: D.pre.map(([r, t, m]) => ({ r, t, m: m || '' })),
    asg: D.asg.map(a => a[0]),
    grupos: D.gr.map(([a, g, c1, c2]) => ({ a, g, c1, c2: c2 || '', on: true })),
    bloques: D.bl.map(([a, c, d, s, e, o], i) => ({ id: i + 1, a, c, d, s, e, o: o || '' })),
    reqCred: (D.reqCred || []).map(([n, min, componentes]) => ({ n, min, componentes: [...componentes] })),
    tipos: { componentes: (D.componentes || []).map(([id, nombre, enPlan]) => ({ id, nombre, enPlan })), caracteres: (D.caracteres || []).map(([id, nombre]) => ({ id, nombre })) },
  };
}

/* Etiqueta pública de un grupo: lo que el estudiante ve al matricular (G1, G2…). */
function glabel(g) {
  if (!/\+/.test(g.g)) return g.g;
  const m = (g.c2 || g.c1 || '').match(/(\d+)$/);
  return m ? 'G' + m[1] : g.g;
}
const natKey = s => { const m = String(s).match(/\d+/); return m ? +m[0] : 1e9; };
function semOf(S, name) { const m = S.malla.find(x => x.n === name); return m ? m.s : 0; }
function maxSemester(S) { return new PlanCurricular(S).maxSemestre(); }

/* Cierre transitivo del grafo de prerrequisitos (req -> t). */
function closure(S) {
  const adj = new Map();
  S.malla.forEach(m => adj.set(m.n, []));
  S.pre.forEach(p => { if (!adj.has(p.r)) adj.set(p.r, []); adj.get(p.r).push(p.t); });
  const desc = new Map();
  for (const n of adj.keys()) {
    const seen = new Set(), st = [...(adj.get(n) || [])];
    while (st.length) { const x = st.pop(); if (seen.has(x)) continue; seen.add(x); (adj.get(x) || []).forEach(y => st.push(y)); }
    desc.set(n, seen);
  }
  const direct = new Set(S.pre.map(p => p.r + '\u0001' + p.t));
  return { desc, direct };
}

/* ¿Dos bloques se traslapan? */
function overlap(a, b) { return a.d === b.d && a.s < b.e && b.s < a.e; }

/* Calcula todo: pares, estadísticas por asignatura, resumen por nivel, choques por grupo. */
function compute(S) {
  const indirect = S.params.indirect, dists = S.params.dists || [0, 1];
  const cl = closure(S);
  const byComp = new Map();
  S.bloques.forEach(b => { const k = b.a + '\u0001' + b.c; if (!byComp.has(k)) byComp.set(k, []); byComp.get(k).push(b); });
  const gBlocks = g => [...(byComp.get(g.a + '\u0001' + g.c1) || []), ...(g.c2 ? byComp.get(g.a + '\u0001' + g.c2) || [] : [])];

  const names = S.asg.map((n, i) => ({ n, i, s: semOf(S, n) })).sort((x, y) => x.s - y.s || x.i - y.i).map(x => x.n);
  const groupsOf = {}, allGroupsOf = {};
  names.forEach(n => { allGroupsOf[n] = S.grupos.filter(g => g.a === n).sort((x, y) => natKey(glabel(x)) - natKey(glabel(y)) || glabel(x).localeCompare(glabel(y))); groupsOf[n] = allGroupsOf[n].filter(g => g.on); });

  const pairs = [];
  const groupClash = new Map();
  const addGC = (x, y) => { const k = x.a + '\u0001' + x.g; if (!groupClash.has(k)) groupClash.set(k, []); groupClash.get(k).push({ a: y.a, g: y.g }); };

  for (let i = 0; i < names.length; i++) for (let j = i + 1; j < names.length; j++) {
    const A = names[i], B = names[j];
    const gA = groupsOf[A], gB = groupsOf[B];
    const total = gA.length * gB.length;
    const matrix = []; let clash = 0;
    gA.forEach(x => {
      const bx = gBlocks(x), row = [];
      gB.forEach(y => {
        const by = gBlocks(y);
        const hit = bx.some(p => by.some(q => overlap(p, q)));
        row.push(hit); if (hit) clash++;
      });
      matrix.push(row);
    });
    const sA = semOf(S, A), sB = semOf(S, B), dist = Math.abs(sA - sB);
    let pre = '—';
    if (cl.direct.has(A + '\u0001' + B) || cl.direct.has(B + '\u0001' + A)) pre = 'Directo';
    else if ((cl.desc.get(A) && cl.desc.get(A).has(B)) || (cl.desc.get(B) && cl.desc.get(B).has(A))) pre = 'Indirecto';
    const aplica = pre === 'Directo' ? 0 : (pre === 'Indirecto' && indirect ? 0 : 1);
    const enRango = aplica && dists.includes(dist) ? 1 : 0;
    const idx = total ? clash / total : 0;
    const nivel = clash === 0 ? 'sin choque' : dist + (clash === total ? 'a' : 'b');
    const p = { key: A + '|' + B, A, B, sA, sB, nA: gA.length, nB: gB.length, total, clash, idx, dist, pre, aplica, enRango, nivel, matrix, gA: gA.map(g => g.g), gB: gB.map(g => g.g) };
    pairs.push(p);
    if (enRango && clash) gA.forEach((x, a) => gB.forEach((y, b) => { if (matrix[a][b]) { addGC(x, y); addGC(y, x); } }));
  }

  const stats = names.map(n => ({ n, s: semOf(S, n), grupos: groupsOf[n].length, gruposTotal: allGroupsOf[n].length, pares: 0, conChoque: 0, sumClash: 0, sumTotal: 0, idxG: 0, idxMax: 0, rankPares: 0, rankIdx: 0 }));
  const st = Object.fromEntries(stats.map(x => [x.n, x]));
  pairs.forEach(p => {
    if (!p.enRango) return;
    [p.A, p.B].forEach(n => {
      const x = st[n]; x.pares++; if (p.clash) x.conChoque++; x.sumClash += p.clash; x.sumTotal += p.total; x.idxMax = Math.max(x.idxMax, p.idx);
    });
  });
  stats.forEach(x => { x.idxG = x.sumTotal ? x.sumClash / x.sumTotal : 0; });
  stats.forEach(x => {
    x.rankPares = 1 + stats.filter(y => y.conChoque > x.conChoque).length;
    x.rankIdx = 1 + stats.filter(y => y.idxG > x.idxG + 1e-12).length;
  });

  const levels = {};
  pairs.forEach(p => {
    if (!p.enRango || !p.clash) return;
    const l = levels[p.nivel] || (levels[p.nivel] = { n: 0, sum: 0, max: 0 });
    l.n++; l.sum += p.idx; l.max = Math.max(l.max, p.idx);
  });
  const totalPairs = pairs.filter(p => p.enRango && p.clash).length;
  const totalClash = pairs.filter(p => p.enRango).reduce((a, p) => a + p.clash, 0);
  const totalCombos = pairs.filter(p => p.enRango).reduce((a, p) => a + p.total, 0);
  return { pairs, stats, st, levels, totalPairs, totalClash, totalCombos, names, groupClash, groupsOf, allGroupsOf, gBlocks, closure: cl };
}

/* Traslapes entre dos grupos concretos. */
function clashDetail(R, gx, gy) {
  const bx = R.gBlocks(gx), by = R.gBlocks(gy), out = [];
  bx.forEach(p => by.forEach(q => { if (overlap(p, q)) out.push({ d: p.d, s: Math.max(p.s, q.s), e: Math.min(p.e, q.e) }); }));
  return out;
}

/* ¿Agregar r -> t crearía un ciclo? */
function wouldCycle(S, r, t) {
  if (r === t) return true;
  const { desc } = closure(S);
  return !!(desc.get(t) && desc.get(t).has(r));
}

/* Ascendientes (requisitos) y descendientes (lo que abre), con profundidad. */
function lineage(S, n) {
  const up = new Map(), down = new Map();
  const walk = (start, store, nextFn) => {
    let frontier = [start], d = 0; const seen = new Set([start]);
    while (frontier.length) {
      d++; const nxt = [];
      frontier.forEach(x => nextFn(x).forEach(y => { if (!seen.has(y)) { seen.add(y); store.set(y, d); nxt.push(y); } }));
      frontier = nxt;
    }
  };
  walk(n, up, x => S.pre.filter(p => p.t === x).map(p => p.r));
  walk(n, down, x => S.pre.filter(p => p.r === x).map(p => p.t));
  return { up, down };
}

if (typeof module !== 'undefined') module.exports = { glabel, fromRaw, compute, closure, clone, wouldCycle, lineage, clashDetail, semOf, overlap };

/* ===== APLICACIÓN: estado, utilidades, cabecera, Inicio, Interferencias, panel lateral ===== */
const KEY = RAW.almacenamiento.clave;
const PAGES_ORDER = [['inicio', 'Inicio'], ['inter', 'Interferencias'], ['asig', 'Asignaturas'], ['grupos', 'Grupos'], ['hor', 'Horarios'], ['heat', 'Mapa de calor'], ['malla', 'Prerrequisitos']];

let S = fromRaw(RAW), S0 = clone(S), restored = false;
try {
  const t = localStorage.getItem(KEY);
  if (t) { const o = JSON.parse(t); if (o && o.S && Array.isArray(o.S.bloques) && o.S.params) { S = o.S; restored = true; } }
} catch (e) { /* sin almacenamiento: la herramienta funciona igual */ }
/* Completa escenarios guardados con asignaturas nuevas de la malla (Inglés, libre elección, proyecto, trabajo de grado…). */
function fixMalla(s) {
  const base = fromRaw(RAW);
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
  // No restaurar aquí requisitos que el usuario retiró deliberadamente de su escenario.
  return s;
}
function fixParams(s) {
  if (!Array.isArray(s.params.dists)) {
    const d = RAW.opciones.distanciasDisponibles;
    const max = s.params.maxDist == null ? Math.max(...RAW.opciones.distanciasIniciales) : s.params.maxDist;
    s.params.dists = d.filter(x => x <= max);
    if (!s.params.dists.length) s.params.dists = [...RAW.opciones.distanciasIniciales];
  }
  return s;
}
fixParams(S); fixMalla(S);
fixParams(S0); fixMalla(S0);
let R = compute(S), R0 = compute(S0);

const ui = {
  page: 'inicio',
  componentes: new Set(RAW.opciones.componentesComparables || []),
  inter: { view: 'lista', dists: new Set(), grav: new Set(), sems: new Set(), asig: '', soloChoque: true, q: '', sort: 'idx' },
  asig: { sort: 'idx', open: null },
  grp: { sel: null },
  hor: { a: S.asg.includes(RAW.opciones.asignaturaInicial) ? RAW.opciones.asignaturaInicial : S.asg[0], comp: null, ov: [] },
  heat: { off: new Set() }, // asignaturas excluidas del mapa; por defecto entran todas
  malla: { sel: null, edges: 'all', soloHor: false },
  drawer: null, // {type:'pair', key, ga, gb} | {type:'cambios'}
};

/* El filtro es solo de visualización: grupos, horarios, malla y escenarios se conservan. */
let RV, RV0;
function actualizarVistaComponentes() {
  const nombres = (estado) => new PlanCurricular(estado).seleccionarPorComponentes(
    estado.asg, ui.componentes
  );
  RV = compute({ ...S, asg: nombres(S) });
  RV0 = compute({ ...S0, asg: nombres(S0) });
}
actualizarVistaComponentes();

/* ---------- utilidades ---------- */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const pct = (x, d = 0) => (x * 100).toFixed(d) + '%';
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
function save() { try { localStorage.setItem(KEY, JSON.stringify({ S })); } catch (e) { } }

/* Aplica un cambio de datos: recalcula, avisa si algún par entra o sale del análisis, repinta. */
function commit(extraMsg) {
  const prev = R; R = compute(S); actualizarVistaComponentes(); save();
  const flips = [];
  R.pairs.forEach(p => { const q = prev.pairs.find(x => x.key === p.key); if (q && q.enRango !== p.enRango && (p.clash || q.clash)) flips.push(`${p.A} ⇄ ${p.B} ${p.enRango ? 'ahora cuenta' : 'deja de contar'}`); });
  const msg = [extraMsg, flips.slice(0, 2).join(' · ') + (flips.length > 2 ? ` (+${flips.length - 2} más)` : '')].filter(Boolean).join(' — ');
  render();
  if (msg) toast(msg);
}

/* ---------- diferencias respecto a la fuente inicial del programa ---------- */
function changes() {
  const out = [];
  if (S.params.dists.join() !== S0.params.dists.join()) out.push(['Parámetro', `Distancia entre semestres: ${distNames(S0.params.dists)} → ${distNames(S.params.dists)}`]);
  if (S.params.indirect !== S0.params.indirect) out.push(['Parámetro', `Excluir prerrequisitos indirectos: ${S0.params.indirect ? 'sí' : 'no'} → ${S.params.indirect ? 'sí' : 'no'}`]);
  S.malla.forEach(m => { const o = S0.malla.find(x => x.n === m.n); if (!o) out.push(['Malla', `Asignatura nueva: ${m.n} (sem ${m.s})`]); else { if (o.s !== m.s) out.push(['Semestre', `${m.n}: semestre ${o.s} → ${m.s}`]); if (o.cr !== m.cr) out.push(['Créditos', `${m.n}: ${o.cr} → ${m.cr} créditos`]); if (o.comp !== m.comp) out.push(['Tipología', `${m.n}: ${compName(o.comp)} → ${compName(m.comp)}`]); if (o.car !== m.car) out.push(['Tipología', `${m.n}: ${carName(o.car) || '—'} → ${carName(m.car) || '—'}`]); } });
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
  return out;
}
function pairDeltas() {
  const out = [];
  R.pairs.forEach(p => {
    const q = R0.pairs.find(x => x.key === p.key);
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
  const nChg = changes().length;
  const dirty = nChg > 0;
  const filtroAnalisis = ['inicio', 'inter', 'asig', 'heat'].includes(ui.page);
  const componentes = (RAW.opciones.componentesComparables || []).map(id => {
    const tipo = new PlanCurricular(S).componente(id);
    const nombre = tipo?.nombre || id;
    const total = new PlanCurricular(S).seleccionarPorComponentes(S.asg, [id]).length;
    return `<button type="button" class="component-toggle" data-act="comp-toggle" data-comp="${esc(id)}" aria-pressed="${ui.componentes.has(id)}" title="${total} asignaturas de ${esc(nombre)} incorporadas al análisis">${esc(nombre)}</button>`;
  }).join('');
  return `<a class="cta-bar" href="https://www.instagram.com/repremecatronicaun/" target="_blank" rel="noopener noreferrer"><span class="cta-in"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/></svg><span class="cta-t"><b>Queremos tu opinión.</b> ¿Encontraste un error o tienes una idea para optimizar esta herramienta?</span><span class="cta-b">Escríbenos en Instagram · @repremecatronicaun →</span></span></a>
  <div class="top-in">
    <div class="brand-wrap"><div class="brand"><b>Interferencias de horario</b><span>${esc(RAW.programa.nombre)}</span></div><span class="rep-badge">Representación estudiantil 26 - 28</span></div>
    <nav class="nav" aria-label="Secciones">${PAGES_ORDER.map(([k, l]) => `<button data-act="nav" data-p="${k}" ${ui.page === k ? 'aria-current="page"' : ''}>${l}</button>`).join('')}</nav>
    <div class="chg">
      <div class="pill-stat ${dirty ? 'dirty' : ''}">
        <span>${dirty ? `<b>${nChg}</b> cambio${nChg > 1 ? 's' : ''} · parejas con choque <b class="num">${R0.totalPairs} → ${R.totalPairs}</b> ${dlt(R.totalPairs, R0.totalPairs)}` : 'Datos de referencia del programa'}</span>
        ${dirty ? `<button class="btn sm" data-act="drawer-cambios">Ver cambios</button><button class="btn sm danger" data-act="reset">${resetLabel()}</button>` : ''}
      </div>
      <button class="btn sm" data-act="export" title="Descargar tu escenario como archivo">Guardar</button>
      <button class="btn sm" data-act="import" title="Cargar un escenario guardado">Cargar</button>
      <input type="file" id="file-in" accept=".json,application/json" class="sr" tabindex="-1">
      ${filtroAnalisis ? `<div class="componentes-bar" role="group" aria-label="Componentes incluidos en los análisis"><span class="componentes-label">Incluir:</span>${componentes}</div>` : ''}
    </div>
  </div>`;
}

/* ---------- INICIO ---------- */
function gl(a, gname) { const g = S.grupos.find(x => x.a === a && x.g === gname); return g ? glabel(g) : gname; }
function sev(p) { return p.clash === 0 ? ['ok', 'Compatibles'] : p.clash === p.total ? ['a', 'Incompatibles'] : ['b', 'Depende del grupo']; }
const distLabel = d => d === 0 ? 'mismo semestre' : d + (d === 1 ? ' semestre de diferencia' : ' semestres de diferencia');
function semCred(s, n) { return new PlanCurricular({malla:n, tipos:S.tipos}).resumenSemestre(s); }
function distNames(ds) { return [...ds].sort((a,b)=>a-b).map(distLabel).join(' · '); }
function distSummary() { const l = [...S.params.dists].sort((a,b)=>a-b).map(distLabel); return l.length > 1 ? l.slice(0, -1).join(', ') + ' o ' + l[l.length - 1] : (l[0] || 'sin selección'); }
function distChips(counts) {
  return RAW.opciones.distanciasDisponibles.map(d => { const n = counts ? RV.pairs.filter(p => p.aplica && p.dist === d && p.clash).length : null; return `<button class="chip" data-act="dist" data-d="${d}" aria-pressed="${S.params.dists.includes(d)}">${d === 0 ? 'Mismo semestre' : d + (d === 1 ? ' semestre' : ' semestres')}${n === null ? '' : `<span class="n" title="parejas con choque">${n}</span>`}</button>`; }).join('');
}
function distText(p) { return p.dist === 0 ? 'Mismo semestre' : p.dist === 1 ? '1 semestre de diferencia' : p.dist + ' semestres de diferencia'; }
function compGroups(A, c) { return S.grupos.filter(g => g.a === A && (g.c1 === c || g.c2 === c)).sort((x, y) => natKey(glabel(x)) - natKey(glabel(y))); }
function compLabel(A, c) { const gs = compGroups(A, c); return gs.length ? gs.map(glabel).join(' · ') : 'Sin grupo'; }

function pageInicio() {
  const R = RV, R0 = RV0;
  const P = S.params;
  const inr = R.pairs.filter(p => p.enRango), con = inr.filter(p => p.clash), sie = inr.filter(p => p.clash && p.clash === p.total);
  const gIdx = R.totalCombos ? R.totalClash / R.totalCombos : 0;
  const topP = [...con].sort((a, b) => b.idx - a.idx || b.clash - a.clash).slice(0, 6);
  const topA = [...R.stats].sort((a, b) => b.idxG - a.idxG).slice(0, 5);
  const txt = p => p.clash === p.total ? 'incompatibles: todas las combinaciones de grupos chocan' : `${p.clash} de ${p.total} combinaciones de grupos chocan`;
  return `
  <div class="page-title"><div><h1>Resumen de cruces de horario</h1>
  <p>Aquí ves qué tan difícil es armar un horario sin choques, y dónde está el problema.</p></div></div>
  <section class="card hero"><div>
      <div class="eyebrow">En pocas palabras</div>
      <p class="hero-s">Entre asignaturas que se pueden cursar a la vez hay <b class="num">${R.totalCombos}</b> combinaciones posibles de grupos. <b class="num hl">${R.totalClash}</b> de ellas (${pct(gIdx, 1)}) tienen choque de horario. ${dlt(R.totalClash, R0.totalClash)}</p></div>
    <div class="hero-k">
      <div><b class="num">${inr.length}</b><span>parejas de asignaturas que se podrían cursar a la vez</span></div>
      <div><b class="num">${con.length} ${dlt(con.length, R0.totalPairs)}</b><span>tienen al menos una combinación de grupos que choca</span></div>
      <div><b class="num">${sie.length}</b><span>son incompatibles: ningún grupo de una cabe con ningún grupo de la otra</span></div>
    </div></section>
  <div class="grid2" style="margin-top:16px">
    <section class="card"><div class="card-h"><h2>Parejas con más choque</h2><button class="btn sm ghost" data-act="nav" data-p="inter">Ver todos →</button></div>
      <div class="card-b" style="display:grid;gap:2px">${topP.map(p => `<button class="toprow" data-act="pair-open" data-k="${esc(p.key)}"><span><b>${esc(p.A)}</b> <span class="sem">S${p.sA}</span> <span class="faint">y</span> <b>${esc(p.B)}</b> <span class="sem">S${p.sB}</span><br><span class="hint">${txt(p)}</span></span><span class="bar"><i style="width:${p.idx * 100}%"></i></span><b class="num">${pct(p.idx)}</b></button>`).join('') || '<div class="hint">No hay choques con los parámetros actuales.</div>'}</div></section>
    <section class="card"><div class="card-h"><h2>Asignaturas más afectadas</h2><button class="btn sm ghost" data-act="nav" data-p="asig">Ver todas →</button></div>
      <div class="card-b" style="display:grid;gap:2px">${topA.map(s => `<button class="toprow" data-act="a-go" data-n="${esc(s.n)}"><span><b>${esc(s.n)}</b> <span class="sem">S${s.s}</span><br><span class="hint">se cruza con ${s.conChoque} de ${s.pares} asignaturas con las que se compara</span></span><span class="bar"><i style="width:${Math.min(100, s.idxG * 100 / (topA[0].idxG || 1))}%"></i></span><b class="num">${pct(s.idxG)}</b></button>`).join('')}</div></section>
  </div>
  <section class="card" style="margin-top:16px"><div class="card-h"><h2>Qué se compara y cómo se calcula</h2></div>
    <div class="card-b grid2" style="gap:24px">
      <div style="display:grid;gap:16px">
        <div class="field"><label>Distancia entre semestres a comparar</label>
          <div class="chips">${distChips(false)}</div>
          <span class="hint">Puedes elegir varias. Asignaturas más alejadas casi nunca se cursan juntas, por eso no se comparan.</span></div>
        <label class="switch"><input type="checkbox" data-chg="indirect" ${P.indirect ? 'checked' : ''}><i></i><span>No comparar si una es prerrequisito de la otra (directo o por cadena)</span></label>
      </div>
      <ol class="steps"><li>Se toma una <b>pareja de asignaturas</b> que un estudiante podría cursar a la vez.</li><li>Se prueba cada grupo de la primera con cada grupo de la segunda: son las <b>combinaciones</b>.</li><li>Una combinación <b>choca</b> si sus horarios se traslapan aunque sea una hora. Los bloques pegados (9–11 y 11–13) no chocan.</li><li>El <b>porcentaje</b> es qué parte de las combinaciones choca. 100 % = <b>incompatibles</b> (ninguna funciona); entre 0 y 100 % = <b>depende del grupo</b> que elijas.</li></ol>
    </div></section>
  <details class="fold"><summary>Supuestos de los datos</summary><dl>
    <dt>Asignaturas incluidas</dt><dd>Las que están incorporadas al análisis y pertenecen a los componentes seleccionados (${R.names.length}). La malla conserva también las asignaturas sin grupos cargados.</dd>
    <dt>Horas</dt><dd>Franja y días definidos en la configuración de la oferta.</dd>
    <dt>Prerrequisitos</dt><dd>Tomados de la malla vigente (Acuerdo 6 de 2022 del Consejo de Facultad de Ingeniería). Los requisitos de créditos se consultan en la malla, pero no modifican los cálculos de interferencias.</dd>
    <dt>Control</dt><dd>Cada grupo (G1 a G8) combina una magistral con un laboratorio. El emparejamiento de la magistral 3 (grupos G5 y G6) no está confirmado.</dd>
    <dt>Tus cambios</dt><dd>Se guardan solos en este navegador. «Guardar» descarga el escenario, «Cargar» lo recupera y «Restablecer» vuelve a los datos de referencia del programa.</dd></dl></details>`;
}

/* ---------- INTERFERENCIAS ---------- */
function pairMatches(p) {
  const f = ui.inter;
  if (!p.enRango) return false;
  if (f.soloChoque && p.clash === 0) return false;
  if (f.dists.size && !f.dists.has(p.dist)) return false;
  if (f.grav.size && !f.grav.has({ ok: 'ok', a: 'siempre', b: 'aveces' }[sev(p)[0]])) return false;
  if (f.sems.size && !(f.sems.has(p.sA) || f.sems.has(p.sB))) return false;
  if (f.asig && p.A !== f.asig && p.B !== f.asig) return false;
  if (f.q && !norm(p.A + ' ' + p.B).includes(norm(f.q))) return false;
  return true;
}
function sortPairs(arr) {
  const s = ui.inter.sort, c = (a, b) => a.A.localeCompare(b.A) || a.B.localeCompare(b.B);
  const fn = { idx: (a, b) => b.idx - a.idx || b.clash - a.clash || c(a, b), clash: (a, b) => b.clash - a.clash || b.idx - a.idx, dist: (a, b) => a.dist - b.dist || b.idx - a.idx, sem: (a, b) => a.sA - b.sA || a.sB - b.sB || c(a, b), nombre: c }[s];
  return arr.sort(fn);
}
function whyOff(p) {
  if (!p.aplica) return `No cuenta: prerrequisito ${p.pre.toLowerCase()}`;
  if (!S.params.dists.includes(p.dist)) return `No se compara (${p.dist} semestres de diferencia)`;
  return '';
}
function fingerprint(p) {
  if (!p.total || p.total > 100) return '';
  return `<span class="finger" style="grid-template-columns:repeat(${p.nB},7px)" title="Filas: grupos de A · Columnas: grupos de B. Rojo = chocan.">${p.matrix.map(r => r.map(x => `<i class="${x ? 'x' : ''}"></i>`).join('')).join('')}</span>`;
}
function prow(p) {
  const [c, t] = sev(p);
  return `<button class="prow" data-act="pair-open" data-k="${esc(p.key)}">
    <span class="names"><span class="a"><i class="dotA"></i>${esc(p.A)} <span class="sem">S${p.sA}</span></span><span class="x">⇄</span><span class="b"><i class="dotB"></i>${esc(p.B)} <span class="sem">S${p.sB}</span></span></span>
    ${fingerprint(p)}
    <span class="sub"><span class="lvl ${c}">${t}</span><span>${distText(p)}</span><span>· ${p.nA} y ${p.nB} grupos ofertados</span></span>
    <span class="idxcol"><span class="big"><b class="num">${pct(p.idx)}</b><span class="num">${p.clash} de ${p.total} combinaciones</span></span><span class="bar"><i style="width:${p.idx * 100}%"></i></span></span></button>`;
}
function matrixView() {
  const R = RV;
  const N = R.names, f = ui.inter;
  const cells = N.map((a, i) => `<tr class="${i && R.st[a].s !== R.st[N[i - 1]].s ? 'semgap' : ''}"><th class="rowh" scope="row">${esc(a)} <span class="sem">S${R.st[a].s}</span></th>${N.map((b, j) => {
    const sg = j && R.st[b].s !== R.st[N[j - 1]].s ? 'semgap' : '';
    if (i === j) return `<td class="${sg}"><div class="cell none"></div></td>`;
    const p = R.pairs.find(x => (x.A === a && x.B === b) || (x.A === b && x.B === a));
    const m = pairMatches(p);
    let cls = 'cell', style = '', txt = '';
    if (!p.enRango) { cls += ' off'; txt = ''; }
    else if (p.clash === 0) { cls += ' ok'; txt = '✓'; }
    else { style = `background:${heatBg(p.idx)};color:${p.idx > .5 ? '#fff' : 'var(--ink)'}`; txt = Math.round(p.idx * 100); }
    if (!m) cls += ' dim';
    return `<td class="${sg}"><button class="${cls}" style="${style}" data-act="pair-open" data-k="${esc(p.key)}" title="${esc(p.A)} ⇄ ${esc(p.B)}: ${p.clash} de ${p.total} (${pct(p.idx)})${whyOff(p) ? ' · ' + whyOff(p) : ''}">${txt}</button></td>`;
  }).join('')}</tr>`).join('');
  return `<div class="card"><div class="mxwrap"><table class="mx"><thead><tr><th></th>${N.map((b, j) => `<th class="colh ${j && R.st[b].s !== R.st[N[j - 1]].s ? 'semgap' : ''}" scope="col"><div>${esc(b)} · S${R.st[b].s}</div></th>`).join('')}</tr></thead><tbody>${cells}</tbody></table></div>
  <div class="legend" style="padding:0 16px 14px"><span>Cada celda = índice de solape (%)</span><span><i class="sw" style="background:var(--surface2)"></i>0<i class="heatscale"></i>100</span><span><i class="sw" style="background:var(--ok-soft)"></i>sin choque</span><span><i class="sw" style="background:repeating-linear-gradient(135deg,transparent 0 3px,var(--line2) 3px 4px);border:1px solid var(--line)"></i>no se compara (prerrequisito o distancia no elegida)</span><span class="faint">Las celdas atenuadas no cumplen los filtros.</span></div></div>`;
}
function pageInter() {
  const R = RV;
  const f = ui.inter;
  const sems = [...new Set(R.names.map(n => R.st[n].s))].sort((a, b) => a - b);
  const list = sortPairs(R.pairs.filter(p => pairMatches(p)));
  const active = f.dists.size || f.grav.size || f.sems.size || f.asig || f.q || !f.soloChoque;
  const cntD = d => R.pairs.filter(p => p.enRango && p.dist === d && (!f.soloChoque || p.clash)).length;
  return `
  <div class="page-title"><div><h1>Interferencias</h1><p>Cada fila es una pareja de asignaturas que se podrían cursar a la vez (${distSummary()}; sin ser prerrequisito una de otra). Ábrela para ver qué grupos chocan y cuándo.</p></div>
    <div class="row"><div class="seg" role="group" aria-label="Vista"><button data-act="i-view" data-v="lista" aria-pressed="${f.view === 'lista'}">Lista</button><button data-act="i-view" data-v="matriz" aria-pressed="${f.view === 'matriz'}">Matriz</button></div></div></div>
  <details class="card filters" ${(window.innerWidth > 720 || ui.fopen) ? 'open' : ''}><summary class="fsum">Filtros${active ? ' · activos' : ''}</summary><div class="fbody">
    <div class="line">
      <div class="field"><label>Distancia entre semestres</label><div class="chips">${distChips(true)}</div></div>
      <div class="field"><label>Tipo de choque</label><div class="chips">${[['siempre', 'Incompatibles'], ['aveces', 'Depende del grupo']].map(([k, l]) => `<button class="chip" data-act="i-grav" data-k="${k}" aria-pressed="${f.grav.has(k)}">${l}</button>`).join('')}</div></div>
      <div class="field"><label>Semestre de alguna de las dos</label><div class="chips">${sems.map(s => `<button class="chip" data-act="i-sem" data-s="${s}" aria-pressed="${f.sems.has(s)}">${s}</button>`).join('')}</div></div>
    </div>
    <div class="line">
      <div class="field"><label for="f-asig">Asignatura</label><select id="f-asig" data-chg="i-asig"><option value="">Todas</option>${R.names.map(n => `<option ${f.asig === n ? 'selected' : ''}>${esc(n)}</option>`).join('')}</select></div>
      <div class="field"><label for="f-sort">Ordenar por</label><select id="f-sort" data-chg="i-sort">${[['idx', 'Mayor % de choque'], ['dist', 'Distancia'], ['sem', 'Semestre'], ['nombre', 'Nombre']].map(([v, l]) => `<option value="${v}" ${f.sort === v ? 'selected' : ''}>${l}</option>`).join('')}</select></div>
      <div class="field" style="flex:1 1 160px"><label for="f-q">Buscar</label><input id="f-q" type="search" placeholder="Nombre de asignatura…" value="${esc(f.q)}" data-inp="i-q"></div>
      <label class="switch"><input type="checkbox" data-chg="i-choque" ${f.soloChoque ? '' : 'checked'}><i></i>Incluir las que no chocan</label>
    </div></div>
  </details>
  <div class="count-line"><span><b class="num">${list.length}</b> parejas de asignaturas${active ? ' · <button class="btn sm ghost" data-act="i-clear">Limpiar filtros</button>' : ''}${f.view === 'lista' ? ' <span class="faint">· Cada cuadrito es una combinación de grupos (rojo = choca)</span>' : ''}</span><button class="btn sm" data-act="i-csv">Descargar CSV</button></div>
  ${f.view === 'matriz' ? matrixView() : (list.length ? `<div class="plist">${list.map(prow).join('')}</div>` : '<div class="empty-state">Ninguna pareja cumple estos filtros.<br><button class="btn sm" style="margin-top:10px" data-act="i-clear">Limpiar filtros</button></div>')}`;
}

/* ---------- PANEL LATERAL (par / cambios) ---------- */
function miniWeek(bA, bB, ov) {
  const all = [...bA, ...bB]; if (!all.length) return '<div class="hint">Sin bloques.</div>';
  const lo = Math.min(...all.map(b => b.s)), hi = Math.max(...all.map(b => b.e)), RH = 22, rows = hi - lo;
  const col = d => {
    const mk = (b, c, lbl) => `<div class="bk ${c}" style="top:${(b.s - lo) * RH}px;height:${(b.e - b.s) * RH - 1}px" title="${lbl}">${lbl}</div>`;
    return `<div class="dc" style="height:${rows * RH}px">${Array.from({ length: rows }, (_, i) => `<div class="ln" style="height:${RH}px"></div>`).join('')}${bA.filter(b => b.d === d).map(b => mk(b, 'A', b.s + '–' + b.e)).join('')}${bB.filter(b => b.d === d).map(b => mk(b, 'B', b.s + '–' + b.e)).join('')}${ov.filter(o => o.d === d).map(o => `<div class="bk X" style="top:${(o.s - lo) * RH}px;height:${(o.e - o.s) * RH - 1}px">choque</div>`).join('')}</div>`;
  };
  return `<div class="wk" style="--numero-dias:${DAYS.length}"><div></div>${DAYS.map(d => `<div class="dh">${DAY_SHORT[d]}</div>`).join('')}<div>${Array.from({ length: rows }, (_, i) => `<div class="hr" style="height:${RH}px">${lo + i}</div>`).join('')}</div>${DAYS.map(col).join('')}</div>`;
}
function drawerPair(dw) {
  const p = R.pairs.find(x => x.key === dw.key);
  if (!p) return null;
  const GA = R.allGroupsOf[p.A], GB = R.allGroupsOf[p.B];
  const actA = GA.filter(g => g.on), actB = GB.filter(g => g.on);
  if (!dw.ga || !actA.find(g => g.g === dw.ga) || !dw.gb || !actB.find(g => g.g === dw.gb)) {
    let found = false;
    actA.forEach((g, i) => actB.forEach((h, j) => { if (!found && p.matrix[i] && p.matrix[i][j]) { dw.ga = g.g; dw.gb = h.g; found = true; } }));
    if (!found) { dw.ga = actA[0] && actA[0].g; dw.gb = actB[0] && actB[0].g; }
  }
  const gx = actA.find(g => g.g === dw.ga), gy = actB.find(g => g.g === dw.gb);
  const ov = gx && gy ? clashDetail(R, gx, gy) : [];
  const rowTot = actA.map((g, i) => p.matrix[i] ? p.matrix[i].filter(Boolean).length : 0);
  const colTot = actB.map((g, j) => p.matrix.reduce((n, r) => n + (r[j] ? 1 : 0), 0));
  let ai = -1;
  const body = GA.map(g => {
    if (!g.on) return `<tr><th class="rh offg"><button data-act="gtoggle" data-a="${esc(p.A)}" data-g="${esc(g.g)}" title="Volver a ofertar este grupo">${esc(glabel(g))}</button></th>${GB.map(() => '<td></td>').join('')}<td class="tot">·</td></tr>`;
    ai++; let bi = -1; const i = ai;
    return `<tr><th class="rh"><button data-act="gtoggle" data-a="${esc(p.A)}" data-g="${esc(g.g)}" title="Simular que este grupo no se oferta">${esc(glabel(g))}</button></th>${GB.map(h => {
      if (!h.on) return '<td></td>'; bi++;
      const x = p.matrix[i][bi], sel = g.g === dw.ga && h.g === dw.gb;
      return `<td><button class="${x ? 'x' : ''} ${sel ? 'sel' : ''}" data-act="cell" data-ga="${esc(g.g)}" data-gb="${esc(h.g)}" title="${esc(glabel(g))} con ${esc(glabel(h))}: ${x ? 'chocan' : 'caben'}" aria-label="${esc(glabel(g))} con ${esc(glabel(h))}: ${x ? 'chocan' : 'caben'}"></button></td>`;
    }).join('')}<td class="tot">${rowTot[i]}</td></tr>`;
  }).join('');
  let cj = -1;
  const foot = `<tr><th></th>${GB.map(h => h.on ? `<td class="tot">${colTot[++cj]}</td>` : '<td></td>').join('')}<td></td></tr>`;
  const why = whyOff(p), [sc, st] = sev(p);
  const bAx = gx ? R.gBlocks(gx) : [], bBx = gy ? R.gBlocks(gy) : [];
  return `<div class="dr-h"><div><div class="row" style="gap:8px;margin-bottom:6px"><span class="lvl ${sc}">${st}</span><span class="eyebrow">Pareja de asignaturas</span></div>
      <h2><span style="color:var(--ca)">${esc(p.A)}</span> <span class="faint">⇄</span> <span style="color:var(--cb)">${esc(p.B)}</span></h2>
      <div class="hint" style="margin-top:4px">Semestres ${p.sA} y ${p.sB} · ${distText(p).toLowerCase()}</div></div>
    <button class="xbtn" data-act="drawer-close" aria-label="Cerrar">×</button></div>
  <div class="dr-b">
    ${why ? `<div class="note heat"><b>${why}.</b> Esta pareja ya no entra en los totales; la ves aquí solo como referencia.</div>` : ''}
    <div class="kv"><div><div class="k">Porcentaje en choque</div><div class="v num">${pct(p.idx, 0)}</div></div><div><div class="k">Combinaciones en choque</div><div class="v num">${p.clash} <span class="faint" style="font-size:14px">de ${p.total}</span></div></div><div><div class="k">Grupos ofertados</div><div class="v num">${p.nA} y ${p.nB}</div></div></div>
    <section><div class="lab" style="margin-bottom:8px">Cada grupo con cada grupo <span style="text-transform:none;letter-spacing:0;font-weight:500">· rojo = chocan, verde = caben</span></div>
      ${p.total || GA.length ? `<div style="overflow:auto"><table class="gmx"><thead><tr><th class="rh" style="vertical-align:bottom"><span style="color:var(--ca)">${esc(p.A.split(' ')[0])} ↓</span> <span style="color:var(--cb)">${esc(p.B.split(' ')[0])} →</span></th>${GB.map(h => `<th class="ch ${h.on ? '' : 'offg'}"><div><button data-act="gtoggle" data-a="${esc(p.B)}" data-g="${esc(h.g)}" title="${h.on ? 'Simular que este grupo no se oferta' : 'Volver a ofertar este grupo'}" ${h.on ? '' : 'style="text-decoration:line-through;opacity:.55"'}>${esc(glabel(h))}</button></div></th>`).join('')}<th class="tot ch"><div>total</div></th></tr></thead><tbody>${body}${foot}</tbody></table></div>
      <div class="hint" style="margin-top:6px">Clic en una celda para ver los horarios de esos dos grupos. Clic en el nombre de un grupo para simular que no se oferta.</div>` : '<div class="hint">Alguna de las dos asignaturas no tiene grupos activos.</div>'}
    </section>
    ${gx && gy ? `<section><div class="lab" style="margin-bottom:8px"><span style="color:var(--ca)">${esc(gx.a)} ${esc(glabel(gx))}</span> <span style="text-transform:none">con</span> <span style="color:var(--cb)">${esc(gy.a)} ${esc(glabel(gy))}</span></div>
      ${miniWeek(bAx, bBx, ov)}
      <div class="note ${ov.length ? 'heat' : 'ok'}" style="margin-top:10px">${ov.length ? '<b>Chocan:</b> ' + ov.map(o => `${DAY_NAMES[o.d]} ${o.s}–${o.e}`).join(' · ') : '<b>Caben:</b> no se traslapan en ninguna hora.'}</div></section>` : ''}
    <div class="row"><button class="btn" data-act="hor-go" data-n="${esc(p.A)}">Editar horarios de ${esc(p.A)}</button><button class="btn" data-act="hor-go" data-n="${esc(p.B)}">Editar horarios de ${esc(p.B)}</button></div>
  </div>`;
}
function drawerCambios() {
  const ch = changes(), pd = pairDeltas();
  return `<div class="dr-h"><div><span class="eyebrow">Escenario vs. datos de referencia</span><h2>${ch.length} cambio${ch.length === 1 ? '' : 's'}</h2></div><button class="xbtn" data-act="drawer-close" aria-label="Cerrar">×</button></div>
  <div class="dr-b">
    <div class="kv"><div><div class="k">Pares con choque</div><div class="v num">${R0.totalPairs} → ${R.totalPairs}</div></div><div><div class="k">Parejas en choque</div><div class="v num">${R0.totalClash} → ${R.totalClash}</div></div><div><div class="k">Índice global</div><div class="v num">${pct(R0.totalCombos ? R0.totalClash / R0.totalCombos : 0, 1)} → ${pct(R.totalCombos ? R.totalClash / R.totalCombos : 0, 1)}</div></div></div>
    <section><div class="lab" style="margin-bottom:6px">Qué cambiaste</div>${ch.length ? ch.map(([k, t]) => `<div class="chg-item"><span class="tag">${k}</span><span>${esc(t)}</span></div>`).join('') : '<div class="hint">Nada: estás viendo los datos originales.</div>'}</section>
    <section><div class="lab" style="margin-bottom:6px">Pares afectados</div>${pd.length ? pd.slice(0, 40).map(x => { const up = x.ni > x.bi + 1e-9, dn = x.ni < x.bi - 1e-9; return `<button class="prt" style="grid-template-columns:minmax(0,1fr) auto" data-act="pair-open" data-k="${esc(x.p.key)}"><span>${esc(x.p.A)} <span class="faint">⇄</span> ${esc(x.p.B)}</span><span class="num"><span class="faint">${pct(x.bi)}</span> → <b class="delta ${up ? 'up' : dn ? 'down' : 'zero'}">${pct(x.ni)}</b></span></button>`; }).join('') : '<div class="hint">Ningún par cambió todavía.</div>'}</section>
    <div class="row"><button class="btn danger" data-act="reset">${resetLabel(true)}</button></div>
  </div>`;
}
function renderDrawer() {
  const host = $('#drawer'); const dw = ui.drawer;
  if (!dw) { host.innerHTML = ''; return; }
  const keepScroll = $('.dr-b', host) ? $('.dr-b', host).scrollTop : 0;
  const inner = dw.type === 'pair' ? drawerPair(dw) : drawerCambios();
  if (!inner) { ui.drawer = null; host.innerHTML = ''; return; }
  const fresh = !$('.drawer', host);
  host.innerHTML = `<div class="scrim" data-act="drawer-close"></div><aside class="drawer" role="dialog" aria-modal="true" aria-label="Detalle" ${fresh ? '' : 'style="animation:none"'}>${inner}</aside>`;
  const b = $('.dr-b', host); if (b) b.scrollTop = keepScroll;
  if (fresh) { const x = $('.xbtn', host); if (x) x.focus({ preventScroll: true }); }
}

/* ===== ASIGNATURAS ===== */
function pageAsig() {
  const R = RV, R0 = RV0;
  const f = ui.asig;
  const L = [...R.stats].sort({
    pares: (a, b) => b.conChoque - a.conChoque || b.idxG - a.idxG,
    idx: (a, b) => b.idxG - a.idxG || b.conChoque - a.conChoque,
    sem: (a, b) => a.s - b.s || a.n.localeCompare(b.n),
  }[f.sort]);
  const maxIdx = Math.max(.01, ...R.stats.map(x => x.idxG));
  const rows = L.map(x => {
    const mine = R.pairs.filter(p => p.enRango && (p.A === x.n || p.B === x.n)).map(p => ({ p, o: p.A === x.n ? p.B : p.A, os: p.A === x.n ? p.sB : p.sA }));
    const worst = [...mine].sort((a, b) => b.p.idx - a.p.idx)[0];
    const open = f.open === x.n;
    const rk = f.sort === 'idx' ? x.rankIdx : f.sort === 'pares' ? x.rankPares : null;
    return `<div class="arow ${open ? 'open' : ''}" data-aname="${esc(x.n)}"><button class="head" data-act="a-open" data-n="${esc(x.n)}" aria-expanded="${open}">
      <span class="rank ${rk && rk <= 3 ? 'top' : ''}">${rk ? '#' + rk : 'S' + x.s}</span>
      <span><b>${esc(x.n)}</b> <span class="sem">S${x.s}</span><br><span class="hint">${x.grupos} grupo${x.grupos === 1 ? '' : 's'}${x.gruposTotal !== x.grupos ? ` (${x.gruposTotal - x.grupos} desactivado${x.gruposTotal - x.grupos > 1 ? 's' : ''})` : ''}</span></span>
      <span class="met"><span class="l"><span>Se cruza con</span><b class="num">${x.conChoque} de ${x.pares} asignaturas</b></span><span class="bar"><i style="width:${x.pares ? x.conChoque / x.pares * 100 : 0}%"></i></span><span class="l"><span>${dlt(x.conChoque, (R0.st[x.n] || x).conChoque)}</span></span></span>
      <span class="met"><span class="l"><span>Combinaciones que chocan</span><b class="num">${pct(x.idxG)}</b></span><span class="bar"><i style="width:${x.idxG / maxIdx * 100}%"></i></span><span class="l"><span>${worst && worst.p.clash ? `peor cruce: ${esc(worst.o)} (${pct(worst.p.idx)})` : 'sin choques'}</span>${dlt(x.idxG, (R0.st[x.n] || x).idxG, 1)}</span></span>
      <span class="chev">›</span></button>
      ${open ? `<div class="body"><div class="row" style="justify-content:space-between;padding:10px 0 4px"><span class="lab">Se cruza con ${mine.length} asignaturas</span><span class="row"><button class="btn sm" data-act="grp-go" data-n="${esc(x.n)}">Ver grupos</button><button class="btn sm" data-act="hor-go" data-n="${esc(x.n)}">Ver horarios</button></span></div>
      ${[...mine].sort((a, b) => b.p.idx - a.p.idx).map(m => `<button class="prt" data-act="pair-open" data-k="${esc(m.p.key)}"><span class="lvl ${sev(m.p)[0]}" style="min-width:0">${sev(m.p)[1]}</span><span>${esc(m.o)} <span class="sem">S${m.os}</span><br><span class="hint">${m.p.clash} de ${m.p.total} combinaciones de grupos chocan</span></span><span class="bar"><i style="width:${m.p.idx * 100}%"></i></span><b class="num">${pct(m.p.idx)}</b></button>`).join('')}</div>` : ''}</div>`;
  }).join('');
  return `<div class="page-title"><div><h1>Asignaturas</h1><p>Cada asignatura se cruza con las que podría cursar a la vez (${distSummary()}; sin contar las que son prerrequisito suyo). Aquí ves con cuántas de ellas tiene conflicto y qué porcentaje de sus combinaciones de grupos choca. El semestre se cambia en <a href="#malla" data-act="nav" data-p="malla">Prerrequisitos</a>.</p></div>
    <div class="row" style="gap:20px;align-items:flex-end"><div class="field"><label>Distancia entre semestres</label><div class="chips">${distChips(false)}</div></div><div class="field"><label>Ordenar por</label><div class="seg"><button data-act="a-sort" data-s="idx" aria-pressed="${f.sort === 'idx'}">Mayor % de choque</button><button data-act="a-sort" data-s="pares" aria-pressed="${f.sort === 'pares'}">Más asignaturas en conflicto</button><button data-act="a-sort" data-s="sem" aria-pressed="${f.sort === 'sem'}">Semestre</button></div></div></div></div>
    <div style="display:grid;gap:8px">${rows}</div>`;
}

/* ===== GRUPOS ===== */
function compsOf(a) {
  const out = [];
  S.bloques.filter(b => b.a === a).forEach(b => { if (!out.includes(b.c)) out.push(b.c); });
  S.grupos.filter(g => g.a === a).forEach(g => { [g.c1, g.c2].forEach(c => { if (c && !out.includes(c)) out.push(c); }); });
  return out;
}
function compText(a, c) {
  const bs = S.bloques.filter(b => b.a === a && b.c === c);
  return bs.length ? bs.map(fmtB).join(' · ') : 'sin bloques';
}
function groupDetail(a, g) {
  const cl = R.groupClash.get(a + '\u0001' + g.g) || [];
  const by = {}; cl.forEach(x => { (by[x.a] = by[x.a] || []).push(gl(x.a, x.g)); });
  const parts = [g.c1, g.c2].filter(Boolean).map(c => {
    const sh = S.grupos.filter(o => o.a === a && o.g !== g.g && (o.c1 === c || o.c2 === c));
    return `<div>${esc(compText(a, c))}${sh.length ? ` <span class="hint">(clase compartida con ${sh.map(o => esc(glabel(o))).join(', ')})</span>` : ''}</div>`;
  }).join('');
  return `<div class="gdet"><div><b>${esc(glabel(g))}</b> <span class="faint">${g.on ? '' : '(no se oferta en esta simulación)'}</span></div>
    ${parts}
    <div><div class="lab" style="margin-bottom:4px">Choca con</div>${g.on ? (Object.keys(by).length ? Object.entries(by).map(([n, gs]) => `<div class="cl" style="margin-bottom:4px"><button class="btn sm ghost" data-act="grp-go" data-n="${esc(n)}">${esc(n)}</button>${gs.map(x => `<span class="tag heat">${esc(x)}</span>`).join('')}</div>`).join('') : '<span class="tag ok">no choca con ningún grupo</span>') : '<span class="hint">Desactivado: no entra en los cálculos.</span>'}</div>
    <div class="row"><button class="btn sm" data-act="g-toggle" data-a="${esc(a)}" data-g="${esc(g.g)}">${g.on ? 'Dejar de ofertar' : 'Volver a ofertar'}</button><button class="btn sm" data-act="hor-go" data-n="${esc(a)}" data-c="${esc(g.c1)}">Editar horario</button><button class="btn sm danger" data-act="g-del" data-a="${esc(a)}" data-g="${esc(g.g)}">Eliminar</button></div></div>`;
}
function pageGrupos() {
  const sel = ui.grp.sel;
  const avail = S.malla.filter(m => !S.asg.includes(m.n)).sort((a, b) => a.s - b.s || a.n.localeCompare(b.n));
  const cards = R.names.map(n => {
    const gs = R.allGroupsOf[n], st = R.st[n];
    const selG = sel && sel.a === n ? gs.find(g => g.g === sel.g) : null;
    return `<section class="card gcard" data-aname="${esc(n)}">
      <div class="hd"><div><h3>${esc(n)} <span class="sem">S${st.s}</span></h3><span class="hint">${st.grupos} de ${gs.length} grupos ofertados</span></div><button class="btn sm ghost" data-act="asg-del" data-n="${esc(n)}" title="Quitar del análisis">Quitar</button></div>
      <div class="gchips">${gs.map(g => {
        const c = (R.groupClash.get(n + '\u0001' + g.g) || []).length;
        return `<button class="gchip ${g.on ? '' : 'off'} ${selG && selG.g === g.g ? 'sel' : ''}" data-act="g-sel" data-a="${esc(n)}" data-g="${esc(g.g)}">${esc(glabel(g))}${g.on ? `<span class="b ${c ? 'h' : 'o'}">${c ? c : '✓'}</span>` : ''}</button>`;
      }).join('') || '<span class="hint">Sin grupos todavía.</span>'}</div>
      ${selG ? groupDetail(n, selG) : '<div class="hint">Clic en un grupo para ver su horario y con qué choca. El número rojo es la cantidad de grupos de otras asignaturas con los que choca.</div>'}
      <div class="addrow" data-a="${esc(n)}"><input type="text" class="ng-n" placeholder="Nuevo grupo (ej. G7)" aria-label="Nombre del nuevo grupo"><button class="btn sm" data-act="g-add">Agregar</button></div>
    </section>`;
  }).join('');
  return `<div class="page-title"><div><h1>Grupos</h1><p>Los grupos que se ofertan de cada asignatura. Desactiva uno para simular que no se abre, o agrega uno nuevo y ajusta su horario en <a href="#hor" data-act="nav" data-p="hor">Horarios</a>.</p></div>
    <div class="row"><select id="asg-new" aria-label="Asignatura a agregar"><option value="">Agregar asignatura de la malla…</option>${avail.map(m => `<option value="${esc(m.n)}">${esc(m.n)} (sem ${m.s})</option>`).join('')}</select><button class="btn" data-act="asg-add">Agregar</button></div></div>
    <div class="gcards">${cards}</div>`;
}

/* ===== HORARIOS ===== */
function compColor(i) {
  const h = (i * 53 + 205) % 360;
  return `background:color-mix(in srgb,hsl(${h} 68% 52%) 24%,var(--surface));border-color:hsl(${h} 55% 48%);color:color-mix(in srgb,hsl(${h} 65% 42%) 70%,var(--ink))`;
}
function swatchColor(i) { return `hsl(${(i * 53 + 205) % 360} 55% 48%)`; }
function lanes(blocks) {
  const res = new Map(), byDay = {};
  blocks.forEach(b => (byDay[b.d] = byDay[b.d] || []).push(b));
  Object.values(byDay).forEach(arr => {
    arr.sort((x, y) => x.s - y.s || x.e - y.e);
    let cl = [], end = 0;
    const flush = () => { const ends = []; cl.forEach(b => { let l = ends.findIndex(e => e <= b.s); if (l < 0) { l = ends.length; ends.push(b.e); } else ends[l] = b.e; res.set(b, { lane: l }); }); cl.forEach(b => res.get(b).n = ends.length); cl = []; };
    arr.forEach(b => { if (cl.length && b.s >= end) { flush(); end = 0; } cl.push(b); end = Math.max(end, b.e); });
    if (cl.length) flush();
  });
  return res;
}
function pageHor() {
  if (!S.asg.length) return `<div class="page-title"><div><h1>Horarios</h1><p>No hay asignaturas incorporadas al análisis de horarios. Puedes agregarlas desde <a href="#grupos" data-act="nav" data-p="grupos">Grupos</a>.</p></div></div>`;
  const h = ui.hor;
  if (!S.asg.includes(h.a)) h.a = S.asg[0];
  const A = h.a, comps = compsOf(A), mine = S.bloques.filter(b => b.a === A);
  h.ov = h.ov.filter(n => S.asg.includes(n) && n !== A);
  const ovBlocks = S.bloques.filter(b => h.ov.includes(b.a));
  const hasOv = ovBlocks.length > 0, ZW = hasOv ? 62 : 100;
  const lm = lanes(mine), lo = lanes(ovBlocks);
  const hot = new Set(), hitSet = new Set();
  ovBlocks.forEach(o => mine.forEach(m => { if (overlap(o, m)) { hitSet.add(o); for (let x = Math.max(o.s, m.s); x < Math.min(o.e, m.e); x++) hot.add(o.d + ':' + x); } }));
  const hours = Array.from({ length: H_MAX - H_MIN }, (_, i) => H_MIN + i);
  const cols = DAYS.map(d => `<div class="dcol" data-d="${d}">${hours.map(hr => `<div class="hc ${hot.has(d + ':' + hr) ? 'hot' : ''}" data-d="${d}" data-h="${hr}"></div>`).join('')}
    ${mine.filter(b => b.d === d).map(b => { const l = lm.get(b), w = ZW / l.n, ci = comps.indexOf(b.c), lb = compLabel(A, b.c); return `<div class="hb ${h.comp === b.c ? 'sel' : ''}" draggable="true" data-bid="${b.id}" data-act="h-comp" data-c="${esc(b.c)}" style="top:${(b.s - H_MIN) * 34}px;height:${(b.e - b.s) * 34 - 1}px;left:calc(${l.lane * w}% + 1px);width:calc(${w}% - 2px);${compColor(ci)}" title="${esc(lb)} · ${DAY_NAMES[b.d]} ${b.s}–${b.e} (arrastra para mover)">${esc(lb)}<small>${b.s}–${b.e}</small></div>`; }).join('')}
    ${ovBlocks.filter(b => b.d === d).map(b => { const l = lo.get(b), w = (100 - ZW - 2) / l.n; return `<div class="hb ov ${hitSet.has(b) ? 'hit' : ''}" style="top:${(b.s - H_MIN) * 34}px;height:${(b.e - b.s) * 34 - 1}px;left:calc(${ZW + 2 + l.lane * w}% + 1px)!important;width:calc(${w}% - 2px)!important" title="${esc(b.a)} · ${esc(compLabel(b.a, b.c))} ${b.s}–${b.e}">${esc(b.a.split(' ')[0])}<small>${esc(compLabel(b.a, b.c))}</small></div>`; }).join('')}
  </div>`).join('');
  const st = R.st[A], st0 = R0.st[A];
  const pdiff = R.pairs.filter(p => (p.A === A || p.B === A)).map(p => { const q = R0.pairs.find(x => x.key === p.key); return { p, o: p.A === A ? p.B : p.A, bi: q && q.enRango ? q.idx : 0, ni: p.enRango ? p.idx : 0, bc: q && q.enRango ? q.clash : 0, nc: p.enRango ? p.clash : 0 }; }).filter(x => Math.abs(x.bi - x.ni) > 1e-9 || x.bc !== x.nc).sort((x, y) => Math.abs(y.ni - y.bi) - Math.abs(x.ni - x.bi));
  const impact = `<section class="card impact"><div class="lab">Impacto en ${esc(A)}</div>
    <div class="imp-row"><span>Asignaturas con las que se cruza</span><span class="arrow num">${st0 ? st0.conChoque : '–'} → <b>${st.conChoque}</b> ${st0 ? dlt(st.conChoque, st0.conChoque) : ''}</span></div>
    <div class="imp-row"><span>Combinaciones que chocan</span><span class="arrow num">${st0 ? pct(st0.idxG, 1) : '–'} → <b>${pct(st.idxG, 1)}</b> ${st0 ? dlt(st.idxG, st0.idxG, 1) : ''}</span></div>
    ${pdiff.length ? `<div class="lab" style="margin-top:4px">Parejas que cambiaron</div>${pdiff.slice(0, 6).map(x => `<div class="imp-row"><button class="btn sm ghost" style="text-align:left;justify-content:flex-start" data-act="pair-open" data-k="${esc(x.p.key)}">${esc(x.o)}</button><span class="arrow num">${pct(x.bi)} → <b class="delta ${x.ni > x.bi ? 'up' : 'down'}">${pct(x.ni)}</b></span></div>`).join('')}` : '<div class="hint">Mueve un bloque o cambia sus horas y aquí verás el efecto sobre esta asignatura.</div>'}</section>`;
  const hourOpts = (from, to, sel) => Array.from({ length: to - from + 1 }, (_, i) => from + i).map(x => `<option ${x === sel ? 'selected' : ''}>${x}</option>`).join('');
  const ordered = [...comps].sort((a, b) => { const ga = compGroups(A, a)[0], gb = compGroups(A, b)[0]; return (ga ? natKey(glabel(ga)) : 1e9) - (gb ? natKey(glabel(gb)) : 1e9); });
  const compCards = ordered.map(c => {
    const i = comps.indexOf(c), bs = mine.filter(b => b.c === c), used = compGroups(A, c);
    return `<div class="compcard ${h.comp === c ? 'sel' : ''}" data-comp="${esc(c)}">
      <div class="hd"><i class="swatch" style="background:${swatchColor(i)}"></i><b>${esc(compLabel(A, c))}</b>${used.length > 1 ? `<span class="tag warn">compartido por ${used.length} grupos</span>` : ''}</div>
      ${used.length > 1 ? '<div class="hint">Un cambio aquí afecta a todos estos grupos.</div>' : ''}
      ${bs.map(b => `<div class="brow"><select data-chg="h-day" data-id="${b.id}" aria-label="Día">${DAYS.map(d => `<option value="${d}" ${b.d === d ? 'selected' : ''}>${DAY_NAMES[d]}</option>`).join('')}</select><select data-chg="h-s" data-id="${b.id}" aria-label="Inicio">${hourOpts(H_MIN, H_MAX - 1, b.s)}</select><select data-chg="h-e" data-id="${b.id}" aria-label="Fin">${hourOpts(H_MIN + 1, H_MAX, b.e)}</select><button class="xbtn" style="width:26px;height:26px;font-size:15px" data-act="h-delb" data-id="${b.id}" aria-label="Quitar bloque">×</button></div>`).join('') || '<span class="hint">Sin bloques: este grupo nunca choca.</span>'}
      <div class="row"><button class="btn sm" data-act="h-addb" data-c="${esc(c)}">+ Bloque</button>${used.length ? '' : `<button class="btn sm danger" data-act="h-delc" data-c="${esc(c)}">Eliminar</button>`}</div></div>`;
  }).join('');
  const sems = [...new Set(R.names.map(n => R.st[n].s))];
  const choques = R.pairs.filter(p => p.enRango && p.clash && (p.A === A || p.B === A)).map(p => p.A === A ? p.B : p.A);
  return `<div class="page-title"><div><h1>Horarios</h1><p>La semana de cada asignatura con todos sus grupos superpuestos. <b>Arrastra un bloque</b> a otro día u hora (o edítalo a la derecha) y mira cómo cambia el impacto. Superpón otras asignaturas para ver dónde se pisan.</p></div></div>
  <div class="hor">
    <aside class="card sidelist" aria-label="Asignaturas">${sems.map(s => `<div class="sg">Semestre ${s}</div>${R.names.filter(n => R.st[n].s === s).map(n => `<button data-act="h-sel" data-n="${esc(n)}" aria-current="${n === A}"><span>${esc(n)}</span><i class="hdot" title="${pct(R.st[n].idxG)} de combinaciones chocan" style="background:${heatBg(R.st[n].idxG * 2)}"></i></button>`).join('')}`).join('')}</aside>
    <div>
      <select class="mobile-only" data-chg="h-pick" aria-label="Asignatura" style="width:100%;margin-bottom:10px">${R.names.map(n => `<option ${n === A ? 'selected' : ''}>${esc(n)}</option>`).join('')}</select>
      <div class="row" style="margin-bottom:10px"><h2 style="font:650 20px var(--serif)">${esc(A)}</h2><span class="sem">S${R.st[A].s}</span><span style="flex:1"></span>
        <select data-chg="h-ov-add" aria-label="Superponer asignatura"><option value="">Superponer otra asignatura…</option>${R.names.filter(n => n !== A && !h.ov.includes(n)).map(n => `<option>${esc(n)}</option>`).join('')}</select>
        <button class="btn sm" data-act="h-ov-clash" ${choques.length ? '' : 'disabled'} title="Superpone las asignaturas con las que choca">Las que chocan (${choques.length})</button></div>
      ${h.ov.length ? `<div class="chips" style="margin-bottom:10px">${h.ov.map(n => `<button class="chip" data-act="h-ov-del" data-n="${esc(n)}">${esc(n)} ×</button>`).join('')}<button class="btn sm ghost" data-act="h-ov-none">Quitar todas</button></div>` : ''}
      <div class="weekgrid" style="--numero-dias:${DAYS.length}"><div class="dh" style="border-left:0"></div>${DAYS.map(d => `<div class="dh"><span class="full">${DAY_NAMES[d]}</span><span class="short">${DAY_SHORT[d]}</span></div>`).join('')}<div class="hrs">${hours.map(x => `<div>${x}</div>`).join('')}</div>${cols}</div>
      <div class="legend" style="margin-top:8px"><span>Cada bloque lleva el nombre del grupo (o grupos) que lo usan; bloques lado a lado son grupos alternativos a la misma hora.</span>${hasOv ? '<span><i class="sw" style="background:color-mix(in srgb,var(--heat) 22%,transparent)"></i>horas donde se pisan con lo superpuesto</span>' : ''}</div>
    </div>
    <div class="right" style="display:grid;gap:12px">${impact}
      <div class="lab">Horario por grupo</div>${compCards}
    </div>
  </div>`;
}
/* ===== MAPA DE CALOR / OCUPACIÓN DE HORARIOS ===== */
function pageHeat() {
  const off = ui.heat.off;
  const names = new PlanCurricular(S).seleccionarPorComponentes(S.asg, ui.componentes).sort((a, b) => semOf(S, a) - semOf(S, b) || a.localeCompare(b, 'es'));
  const selected = names.filter(n => !off.has(n));
  const selectedSet = new Set(selected);
  const groups = S.grupos.filter(g => selectedSet.has(g.a) && g.on);
  const slots = {};
  DAYS.forEach(d => { slots[d] = Array.from({ length: H_MAX - H_MIN }, () => ({ groups: new Set(), subjects: new Set() })); });
  const scheduledGroups = new Set();
  const scheduledSubjects = new Set();

  // Cada grupo se cuenta una sola vez por franja, aunque tenga dos componentes.
  groups.forEach(g => {
    const components = new Set([g.c1, g.c2].filter(Boolean));
    const blocks = S.bloques.filter(b => b.a === g.a && components.has(b.c));
    if (blocks.length) {
      const key = g.a + '\u0001' + g.g;
      scheduledGroups.add(key);
      scheduledSubjects.add(g.a);
      blocks.forEach(b => {
        const start = Math.max(H_MIN, b.s), end = Math.min(H_MAX, b.e);
        for (let h = start; h < end; h++) {
          const cell = slots[b.d] && slots[b.d][h - H_MIN];
          if (!cell) continue;
          cell.groups.add(key);
          cell.subjects.add(g.a);
        }
      });
    }
  });

  const flat = DAYS.flatMap(d => slots[d].map((cell, i) => ({ d, h: H_MIN + i, ...cell })));
  const peak = flat.reduce((m, x) => Math.max(m, x.groups.size), 0);
  const empty = flat.filter(x => x.groups.size === 0).length;
  const occupied = flat.length - empty;
  const top = peak ? flat.find(x => x.groups.size === peak) : null;
  const dayLoad = DAYS.map(d => ({ d, n: slots[d].reduce((sum, x) => sum + x.groups.size, 0) }));
  const maxDay = Math.max(1, ...dayLoad.map(x => x.n));
  const sems = [...new Set(names.map(n => semOf(S, n)))];
  const sidebar = sems.map(sem => {
    const ns = names.filter(n => semOf(S, n) === sem);
    const on = ns.filter(n => !off.has(n)).length;
    return `<div class="sg">Semestre ${sem} <span class="faint">· ${on}/${ns.length}</span></div>${ns.map(n => `<button class="hm-asg" data-act="hm-toggle" data-n="${esc(n)}" aria-pressed="${!off.has(n)}" title="${off.has(n) ? 'Incluir en el mapa' : 'Excluir del mapa'}"><i class="hm-check">✓</i><span>${esc(n)}</span><i class="hm-dot" title="Tiene horario cargado"></i></button>`).join('')}`;
  }).join('');
  const columns = DAYS.map(d => `<div class="dcol" data-d="${d}">${slots[d].map((cell, i) => {
    const h = H_MIN + i, count = cell.groups.size, subjectCount = cell.subjects.size;
    const intensity = peak && count ? Math.round(14 + (count / peak) * 72) : 0;
    const subjectNames = [...cell.subjects].sort((a, b) => a.localeCompare(b, 'es'));
    const groupNames = [...cell.groups].map(k => k.split('\u0001').join(' · ')).sort((a, b) => a.localeCompare(b, 'es'));
    const title = `${DAY_NAMES[d]} ${h}:00–${h + 1}:00\n${count} grupos · ${subjectCount} asignaturas\n${groupNames.join('; ') || 'Sin grupos programados'}\nAsignaturas: ${subjectNames.join(', ') || '—'}`;
    return `<div class="hc ${count ? 'has-groups' : ''}" ${count ? `style="background:color-mix(in srgb,var(--heat) ${intensity}%,var(--surface2))"` : ''} title="${esc(title)}">${count || ''}</div>`;
  }).join('')}</div>`).join('');
  const dayRows = dayLoad.map(x => `<div class="hm-day"><span>${DAY_SHORT[x.d]}</span><div class="bar"><i style="width:${x.n / maxDay * 100}%"></i></div><strong>${x.n}</strong></div>`).join('');
  const topText = top ? `${DAY_NAMES[top.d]} · ${top.h}:00–${top.h + 1}:00` : 'Sin horarios seleccionados';
  const topDetail = top ? `${top.groups.size} grupos de ${top.subjects.size} asignaturas en esa franja` : 'Selecciona asignaturas que tengan grupos y horarios.';

  return `<div class="page-title"><div><h1>Mapa de calor de horarios</h1><p>Concentra los grupos ofertados en una sola semana. Se muestran los componentes marcados arriba y puedes excluir o incorporar asignaturas individualmente.</p></div></div>
  <div class="hor">
    <aside class="card sidelist hm-sidelist" aria-label="Asignaturas incluidas en el mapa">
      <div class="hm-tools"><div class="lab">Asignaturas <span class="faint">${selected.length}/${names.length}</span></div><div class="row"><button class="btn sm" data-act="hm-all">Todas</button><button class="btn sm" data-act="hm-none">Ninguna</button></div><span class="hint">Activa o desactiva materias para recalcular el mapa.</span></div>
      ${sidebar || '<div class="hint">No hay asignaturas incorporadas al análisis.</div>'}
    </aside>
    <div class="hm-main">
      <div class="row" style="justify-content:space-between"><div><span class="eyebrow">Vista semanal</span><div class="hint">${selected.length} asignaturas seleccionadas · ${scheduledGroups.size} grupos activos con horario</div></div><span class="sem">${H_MIN}:00–${H_MAX}:00</span></div>
      <div class="weekgrid hm-grid" style="--numero-dias:${DAYS.length}"><div class="dh" style="border-left:0"></div>${DAYS.map(d => `<div class="dh"><span class="full">${DAY_NAMES[d]}</span><span class="short">${DAY_SHORT[d]}</span></div>`).join('')}<div class="hrs">${Array.from({ length: H_MAX - H_MIN }, (_, i) => `<div>${H_MIN + i}</div>`).join('')}</div>${columns}</div>
      <div class="hm-legend"><span>Grupos programados por franja de una hora:</span><span class="hm-scale"><i style="--v:14%"></i><i style="--v:32%"></i><i style="--v:50%"></i><i style="--v:68%"></i><i style="--v:86%"></i></span><span>menor → mayor concentración</span><span class="faint">El número en cada celda es la cantidad de grupos.</span></div>
    </div>
    <div class="right" style="display:grid;gap:12px;align-content:start">
      <section class="card impact"><div class="lab">Resumen de selección</div>
        <div class="hm-kpis"><div class="hm-kpi"><span>Asignaturas incluidas</span><b class="num">${selected.length}/${names.length}</b></div><div class="hm-kpi"><span>Grupos con horario</span><b class="num">${scheduledGroups.size}</b></div><div class="hm-kpi"><span>Mayor concentración</span><b class="num">${peak}</b></div><div class="hm-kpi"><span>Franjas vacías</span><b class="num">${empty}/${flat.length}</b></div></div>
        <div class="hint">${occupied} de ${flat.length} franjas tienen al menos un grupo (${pct(occupied / flat.length, 1)} de la semana visible).</div>
      </section>
      <section class="card impact"><div class="lab">Franja de mayor concentración</div><div class="hm-top"><b>${esc(topText)}</b><span>${esc(topDetail)}</span></div><div class="lab" style="margin-top:5px">Carga por día · grupos-hora</div>${dayRows}<div class="hint">Suma los grupos presentes en cada hora del día. No representa estudiantes matriculados ni salones ocupados.</div></section>
      <section class="card impact"><div class="lab">Cómo leer el mapa</div><div class="hint">Cada celda corresponde a una hora. Se cuenta cada grupo activo una sola vez por franja, aunque tenga más de un componente horario. Los grupos alternativos sí se cuentan por separado.</div><div class="hint">Una celda vacía indica que ninguna de las asignaturas seleccionadas tiene un grupo programado allí. La intensidad del color se escala respecto al máximo de la selección actual.</div></section>
    </div>
  </div>`;
}
/* ===== MALLA / PRERREQUISITOS ===== */
function semHead(s) {
  const c = semCred(s, S.malla);
  return `<span class="semcr" title="${c.incompleto ? 'Créditos registrados (hay asignaturas sin créditos definidos): ' : ''}${c.total} créditos en total${c.adicionales ? ` (${c.plan} del plan + ${c.adicionales} adicionales)` : ''}"><b class="num">${c.plan}${c.adicionales ? '+' + c.adicionales : ''}</b></span>`;
}
function pageMalla() {
  const M = ui.malla, sel = M.sel;
  if (sel && !S.malla.find(m => m.n === sel)) M.sel = null;
  const L = M.sel ? lineage(S, M.sel) : null;
  const maxSem = maxSemester(S);
  const cols = Array.from({ length: maxSem }, (_, i) => i + 1).map(s => {
    const cs = S.malla.filter(m => m.s === s && (!M.soloHor || S.asg.includes(m.n)));
    return `<div class="mcol" data-sem="${s}"><h4>Semestre ${s} ${semHead(s)}</h4>${cs.map(m => {
      const sc = R.st[m.n], req = creditRuleFor(m.n), check = req ? creditStatus(m, req) : null;
      let cls = sc ? '' : 'nosched';
      if (L) cls += m.n === M.sel ? ' sel' : L.up.has(m.n) ? ' up' : L.down.has(m.n) ? ' down' : ' dim';
      return `<button class="mcard ${cls}" draggable="true" data-act="m-sel" data-n="${esc(m.n)}" aria-pressed="${m.n === M.sel}" title="Arrastra a otra columna para cambiarla de semestre"><span class="mt"><span>${esc(m.n)}</span><span class="cr" title="Créditos">${m.cr == null ? '—' : m.cr} cr</span></span><small><span>${esc(compName(m.comp))}${m.car ? ' · ' + esc(carName(m.car)) : ''}</span></small>${check && check.low ? `<small><span class="tag heat">Faltan ${req.min - check.total} cr. previos</span></small>` : ''}${sc ? `<small><span>${sc.grupos} grupos</span><span class="num">${pct(sc.idxG)} chocan</span></small><span class="heatbar"><i style="width:${Math.min(100, sc.idxG * 200)}%"></i></span>` : `<small><span>sin horario</span></small>${!req && m.nota ? `<small title="${esc(m.nota)}"><span>${esc(m.nota.replace('Requiere el ', '').replace(' de los créditos del plan', ' de créditos'))}</span></small>` : ''}`}</button>`;
    }).join('')}</div>`;
  }).join('');
  return `<div class="page-title"><div><h1>Prerrequisitos</h1><p>La malla como grafo. Selecciona una asignatura para ver su cadena de requisitos (azul) y lo que abre (verde). <b>Arrastra</b> una asignatura a otra columna para cambiarla de semestre y mira cómo cambia la carga de créditos de cada uno, o edita sus relaciones en el panel: las comparaciones entre asignaturas que dejan de poder cursarse juntas salen del análisis.</p></div>
    <div class="row"><div class="seg"><button data-act="m-edges" data-v="all" aria-pressed="${M.edges === 'all'}">Todas las flechas</button><button data-act="m-edges" data-v="sel" aria-pressed="${M.edges === 'sel'}">Solo la selección</button></div>
    <label class="switch"><input type="checkbox" data-chg="m-solo" ${M.soloHor ? 'checked' : ''}><i></i>Solo con horario</label></div></div>
  <div class="mallawrap"><div class="card canvas" id="canvas"><svg class="edges" id="edges" aria-hidden="true"></svg><div class="mcols" id="mcols">${cols}</div></div>${mallaSide(L)}</div>
  <div class="legend" style="margin-top:10px"><span><i class="sw" style="background:var(--surface);border:1px solid var(--line2)"></i>con horario (barra = % de combinaciones que chocan)</span><span><i class="sw" style="border:1px dashed var(--line2)"></i>sin horario (no entra al análisis)</span><span><i class="sw" style="background:var(--ca-soft);border:1px solid var(--ca)"></i>requisitos</span><span><i class="sw" style="background:var(--ok-soft);border:1px solid var(--ok)"></i>la requieren</span><span style="color:var(--heat)">⟲ flecha roja punteada = requisito en el mismo semestre o posterior</span></div>`;
}
function mallaSide(L) {
  const n = ui.malla.sel;
  if (!n) return `<aside class="card sidecard"><h2>Selecciona una asignatura</h2><p class="hint" style="margin:0">Verás aquí sus requisitos directos e indirectos, lo que abre, y podrás cambiar su semestre o agregar y quitar relaciones.</p><p class="hint" style="margin:0">Los totales de ${S.pre.length} relaciones y ${S.malla.length} asignaturas corresponden al escenario curricular actual.</p></aside>`;
  const m = S.malla.find(x => x.n === n), sc = R.st[n];
  const dirIn = S.pre.filter(p => p.t === n), dirOut = S.pre.filter(p => p.r === n);
  const indUp = [...L.up.keys()].filter(x => !dirIn.some(p => p.r === x)), indDown = [...L.down.keys()].filter(x => !dirOut.some(p => p.t === x));
  const optsReq = S.malla.filter(c => c.n !== n && !dirIn.some(p => p.r === c.n) && !wouldCycle(S, c.n, n)).sort((a, b) => a.s - b.s || a.n.localeCompare(b.n));
  const optsOut = S.malla.filter(c => c.n !== n && !dirOut.some(p => p.t === c.n) && !wouldCycle(S, n, c.n)).sort((a, b) => a.s - b.s || a.n.localeCompare(b.n));
  const rel = (list, key, other) => list.length ? list.map(p => { const o = p[other], om = S.malla.find(x => x.n === o); const bad = key === 'in' ? om.s >= m.s : om.s <= m.s; return `<div class="it"><span><button style="all:unset;cursor:pointer;text-decoration:underline dotted" data-act="m-sel" data-n="${esc(o)}">${esc(o)}</button> <span class="sem">S${om.s}</span>${bad ? ' <span class="tag heat">mismo sem. o posterior</span>' : ''}</span><button data-act="m-del" data-r="${esc(p.r)}" data-t="${esc(p.t)}" aria-label="Quitar relación" title="Quitar relación">×</button></div>`; }).join('') : '<span class="hint">Ninguno.</span>';
  return `<aside class="card sidecard">
    <div><span class="eyebrow">Asignatura</span><h2 style="font:650 18px/1.25 var(--serif);margin-top:2px">${esc(n)}</h2></div>
    <div class="row" style="justify-content:space-between"><span class="lab">Créditos</span><span class="stepper"><button data-act="m-cr" data-dx="-1" aria-label="Un crédito menos" ${m.cr <= 0 ? 'disabled' : ''}>−</button><b>${m.cr == null ? '—' : m.cr}</b><button data-act="m-cr" data-dx="1" aria-label="Un crédito más">+</button></span></div>
    <div class="row" style="justify-content:space-between;align-items:center"><span class="lab">Componente</span><select data-chg="m-comp" aria-label="Componente de la asignatura">${(S.tipos?.componentes || []).map(({id,nombre}) => `<option value="${esc(id)}" ${m.comp === id ? 'selected' : ''}>${esc(nombre)}</option>`).join('')}</select></div>
    <div class="row" style="justify-content:space-between;align-items:center"><span class="lab">Carácter</span><select data-chg="m-car" aria-label="Carácter de la asignatura">${[['','No aplica'], ...(S.tipos?.caracteres || []).map(({id,nombre})=>[id,nombre])].map(([k,v]) => `<option value="${esc(k)}" ${m.car === k ? 'selected' : ''}>${esc(v)}</option>`).join('')}</select></div>
    <div class="row" style="justify-content:space-between"><span class="lab">Semestre</span><span class="stepper"><button data-act="m-sem" data-dx="-1" aria-label="Un semestre antes" ${m.s <= 1 ? 'disabled' : ''}>−</button><b>${m.s}</b><button data-act="m-sem" data-dx="1" aria-label="Un semestre después" ${m.s >= maxSemester(S) ? 'disabled' : ''}>+</button></span></div>
    ${sc ? `<div class="note ok" style="background:var(--surface2)"><b>${sc.grupos} grupos</b> · choca el <b>${pct(sc.idxG, 1)}</b> de sus combinaciones (se cruza con ${sc.conChoque} de ${sc.pares} asignaturas).<div class="row" style="margin-top:6px"><button class="btn sm" data-act="inter-go" data-n="${esc(n)}">Ver sus choques</button><button class="btn sm" data-act="hor-go" data-n="${esc(n)}">Horarios</button></div></div>` : '<div class="hint">Sin horario cargado: no entra al análisis. Agrégala en <a href="#grupos" data-act="nav" data-p="grupos">Grupos</a>.</div>'}
    ${creditRequirementNote(m)}
    <div><div class="lab" style="margin-bottom:6px">Requiere (directos)</div><div class="rel">${rel(dirIn, 'in', 'r')}</div>
      <select data-chg="m-addreq" aria-label="Agregar requisito" style="margin-top:6px;width:100%"><option value="">+ Agregar requisito…</option>${optsReq.map(c => `<option value="${esc(c.n)}">${esc(c.n)} (sem ${c.s})</option>`).join('')}</select>
      ${indUp.length ? `<div class="hint" style="margin-top:6px">Indirectos: ${indUp.map(esc).join(', ')}</div>` : ''}</div>
    <div><div class="lab" style="margin-bottom:6px">La requieren (abre)</div><div class="rel">${rel(dirOut, 'out', 't')}</div>
      <select data-chg="m-addopen" aria-label="Agregar asignatura que la requiere" style="margin-top:6px;width:100%"><option value="">+ Agregar asignatura que la requiere…</option>${optsOut.map(c => `<option value="${esc(c.n)}">${esc(c.n)} (sem ${c.s})</option>`).join('')}</select>
      ${indDown.length ? `<div class="hint" style="margin-top:6px">Indirectos: ${indDown.map(esc).join(', ')}</div>` : ''}</div>
    <button class="btn sm ghost" data-act="m-sel" data-n="${esc(n)}">Quitar selección</button></aside>`;
}
function drawEdges() {
  const cv = $('#canvas'), svg = $('#edges'), cols = $('#mcols'); if (!cv || !svg) return;
  const M = ui.malla, L = M.sel ? lineage(S, M.sel) : null;
  const cr = cv.getBoundingClientRect(), pos = new Map();
  $$('.mcard', cv).forEach(c => { const r = c.getBoundingClientRect(); pos.set(c.dataset.n, { l: r.left - cr.left + cv.scrollLeft, r: r.right - cr.left + cv.scrollLeft, y: r.top - cr.top + cv.scrollTop + r.height / 2 }); });
  const W = Math.max(cv.scrollWidth, cols.scrollWidth + 30), H = Math.max(cv.scrollHeight, cols.scrollHeight + 30);
  svg.setAttribute('width', W); svg.setAttribute('height', H);
  const semOf2 = n => (S.malla.find(m => m.n === n) || {}).s;
  let out = `<defs>${[['n', 'var(--ink3)'], ['u', 'var(--ca)'], ['d', 'var(--ok)'], ['w', 'var(--heat)']].map(([k, c]) => `<marker id="ar-${k}" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L8 4L0 8z" fill="${c}"/></marker>`).join('')}</defs>`;
  const edges = S.pre.map(p => {
    const a = pos.get(p.r), b = pos.get(p.t); if (!a || !b) return null;
    let kind = 'n';
    if (L) {
      const inUp = (L.up.has(p.r) && (L.up.has(p.t) || p.t === M.sel)), inDown = ((L.down.has(p.t)) && (L.down.has(p.r) || p.r === M.sel));
      kind = inUp ? 'u' : inDown ? 'd' : 'x';
    }
    return { p, a, b, kind, back: semOf2(p.r) >= semOf2(p.t) };
  }).filter(Boolean).sort((x, y) => (x.kind === 'x' || x.kind === 'n' ? 0 : 1) - (y.kind === 'x' || y.kind === 'n' ? 0 : 1));
  edges.forEach(e => {
    if (e.kind === 'x' && M.edges === 'sel') return;
    const { a, b } = e; let d;
    if (!e.back) { const dx = Math.max(30, (b.l - a.r) * .5); d = `M${a.r} ${a.y} C${a.r + dx} ${a.y} ${b.l - dx} ${b.y} ${b.l} ${b.y}`; }
    else if (Math.abs(a.l - b.l) < 5) { d = `M${a.r} ${a.y} C${a.r + 36} ${a.y} ${b.r + 36} ${b.y} ${b.r} ${b.y}`; }
    else { d = `M${a.l} ${a.y} C${a.l - 50} ${a.y} ${b.r + 50} ${b.y} ${b.r} ${b.y}`; }
    const strong = e.kind === 'u' || e.kind === 'd';
    const col = e.back ? 'var(--heat)' : e.kind === 'u' ? 'var(--ca)' : e.kind === 'd' ? 'var(--ok)' : 'var(--ink3)';
    const op = strong ? 0.95 : (L ? 0.1 : 0.4);
    const mk = e.back ? 'w' : strong ? e.kind : 'n';
    out += `<path d="${d}" stroke="${col}" stroke-width="${strong ? 2.2 : 1.3}" opacity="${op}" ${e.back ? 'stroke-dasharray="5 4"' : ''} marker-end="url(#ar-${mk})"/>`;
  });
  svg.innerHTML = out;
}

/* ===== RENDER ===== */
const PAGES = { inicio: pageInicio, inter: pageInter, asig: pageAsig, grupos: pageGrupos, hor: pageHor, heat: pageHeat, malla: pageMalla };
function render() {
  const ae = document.activeElement, fid = ae && ae.id, ss = ae && ae.selectionStart, se = ae && ae.selectionEnd;
  const keep = {}; ['canvas', 'mxwrap'].forEach(k => { const el = $(k === 'canvas' ? '#canvas' : '.mxwrap'); if (el) keep[k] = [el.scrollLeft, el.scrollTop]; });
  const sideEl = $('.sidelist'), sideTop = sideEl ? sideEl.scrollTop : 0;
  $('#top').innerHTML = renderTop();
  $('#view').innerHTML = PAGES[ui.page]();
  renderDrawer();
  if (keep.canvas && $('#canvas')) { $('#canvas').scrollLeft = keep.canvas[0]; $('#canvas').scrollTop = keep.canvas[1]; }
  if (keep.mxwrap && $('.mxwrap')) { $('.mxwrap').scrollLeft = keep.mxwrap[0]; $('.mxwrap').scrollTop = keep.mxwrap[1]; }
  if ($('.sidelist')) $('.sidelist').scrollTop = sideTop;
  const cur = $('.nav [aria-current]'); if (cur) cur.parentElement.scrollLeft = cur.offsetLeft - 24;
  if (ui.page === 'malla') drawEdges();
  if (fid) { const n = document.getElementById(fid); if (n) { n.focus(); try { if (ss != null && n.setSelectionRange) n.setSelectionRange(ss, se); } catch (e) { } } }
}

/* ===== ACCIONES ===== */
function go(p) { ui.page = p; ui.drawer = null; window.scrollTo(0, 0); try { history.replaceState(null, '', '#' + p); } catch (e) { } render(); }
function findGroup(a, g) { return S.grupos.find(x => x.a === a && x.g === g); }
/* tras borrar un grupo, un componente queda huérfano si ningún grupo lo usa */
function compsGone(a, c) { return !S.grupos.some(g => g.a === a && (g.c1 === c || g.c2 === c)); }
function download(name, text, type) { const u = URL.createObjectURL(new Blob([text], { type })); const a = document.createElement('a'); a.href = u; a.download = name; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(u), 1000); }

function onAct(act, d, el, ev) {
  const f = ui.inter;
  switch (act) {
    case 'nav': ev.preventDefault(); return go(d.p);
    case 'comp-toggle': {
      if (!(RAW.opciones.componentesComparables || []).includes(d.comp)) return;
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
    case 'h-ov-clash': ui.hor.ov = R.pairs.filter(p => p.enRango && p.clash && (p.A === ui.hor.a || p.B === ui.hor.a)).map(p => p.A === ui.hor.a ? p.B : p.A); return render();
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
    /* malla */
    case 'm-sel': ui.malla.sel = ui.malla.sel === d.n ? null : d.n; return render();
    case 'm-edges': ui.malla.edges = d.v; return render();
    case 'm-cr': { if (!planActual().ajustarCreditos(ui.malla.sel, +d.dx)) return; return commit(); }
    case 'm-sem': { const m = planActual().asignatura(ui.malla.sel); if (!m) return; const o = m.s; planActual().moverSemestre(m.n, m.s + +d.dx); return commit(`${m.n}: semestre ${o} → ${m.s}`); }
    case 'm-del': S.pre = S.pre.filter(p => !(p.r === d.r && p.t === d.t)); return commit(`Quitado: ${d.r} → ${d.t}`);
    case 'reset': if (!ui.confirmReset) { ui.confirmReset = true; render(); setTimeout(() => { if (ui.confirmReset) { ui.confirmReset = false; render(); } }, 4000); return; } ui.confirmReset = false; S = clone(S0); try { localStorage.removeItem(KEY); } catch (e) { } ui.drawer = null; R = compute(S); actualizarVistaComponentes(); render(); return toast('Volviste a los datos de referencia del programa.');
    case 'export': return download('escenario-horarios.json', JSON.stringify({ app: 'interferencias-horarios', v: 1, S }, null, 1), 'application/json');
    case 'import': return $('#file-in').click();
  }
}
function onChange(k, el) {
  const f = ui.inter;
  switch (k) {
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
          const o = JSON.parse(rd.result); const n = o && o.S;
          if (!n || !n.params || !Array.isArray(n.bloques) || !Array.isArray(n.grupos) || !Array.isArray(n.malla) || !Array.isArray(n.pre) || !Array.isArray(n.asg)) throw new Error('formato');
          S = fixMalla(fixParams(n)); ui.drawer = null; commit('Escenario cargado.');
        } catch (e) { toast('Ese archivo no es un escenario válido.'); }
      };
      rd.readAsText(file); el.value = ''; return;
    }
  }
}

document.addEventListener('click', e => { const el = e.target.closest('[data-act]'); if (!el) return; onAct(el.dataset.act, el.dataset, el, e); });
document.addEventListener('change', e => { const el = e.target.closest('[data-chg]'); if (el) onChange(el.dataset.chg, el); else if (e.target.id === 'file-in') onChange('import-file', e.target); });
document.addEventListener('input', e => { const el = e.target.closest('[data-inp]'); if (el && el.dataset.inp === 'i-q') { ui.inter.q = el.value; render(); } });
document.addEventListener('toggle', e => { if (e.target.classList && e.target.classList.contains('filters')) ui.fopen = e.target.open; }, true);
document.addEventListener('keydown', e => { if (e.key === 'Escape' && ui.drawer) { ui.drawer = null; render(); } });
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
    if (!m || m.s === ns) return render();
    const o = m.s; planActual().moverSemestre(m.n, ns); ui.malla.sel = m.n; commit(`${m.n}: semestre ${o} → ${m.s}`);
  }
});

/* ---- inicio ---- */
(function init() {
  const h = (location.hash || '').replace('#', '');
  if (PAGES[h]) ui.page = h;
  render();
  if (RAW.programa?.nombre) document.title = 'Interferencias de horario · ' + RAW.programa.nombre;
  const meta = RAW.metadatos || {};
  const pie = document.getElementById('pie-datos');
  if (pie) pie.textContent = ['Malla: ' + (meta.malla || 'fecha no registrada'), 'Tipologías: ' + (meta.tipologias || 'fecha no registrada'), 'Horarios: ' + (meta.horarios || 'fecha no registrada')].join(' · ');
  if (restored && changes().length) toast('Recuperé los cambios que tenías guardados en este navegador.');
})();

