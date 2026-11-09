'use strict';

/**
 * Motor de análisis académico y adaptación posicional interna.
 * No accede a DOM, red ni almacenamiento; recibe escenarios explícitos.
 *
 * La función `fromRaw` adapta la proyección transitoria de la entrada única
 * al escenario base. No inspecciona otras versiones ni abre fuentes externas.
 * Contrato único: datos/academico.json -> EntradaAcademica.
 */
function clone(o) { return JSON.parse(JSON.stringify(o)); }

/**
 * Escenario de trabajo (S), distinto del JSON académico de referencia:
 * - params: {dists: número[], indirect: 0|1} para seleccionar comparaciones;
 * - malla: posiciones {n,s,nota,cr,comp,car,idPos}, con créditos nulos válidos;
 * - pre: relaciones {r,t,m}; asg: nombres incorporados al escenario;
 * - grupos: {a,g,c1,c2,on,ref,analizable}; on = decisión de simulación,
 *   analizable = elegibilidad ACADÉMICA declarada en el contrato;
 * - bloques: {id,a,c,d,s,e,o,ref}, sin horarios inventados;
 * - reqCred y tipos: reglas/clasificaciones del programa en el escenario.
 * La proyección posicional proviene de EntradaAcademica, no es un contrato
 * alternativo ni una estructura institucional editable.
 */
/**
 * Construye un escenario mutable NUEVO a partir de la referencia proyectada.
 * `idPos` y `ref` identifican posiciones y bloques del contrato actual;
 * no se requieren identificadores de otras versiones.
 * `analizable` NO equivale a `on`: una edición personal no activa una
 * agrupación de otra sede que el contrato declaró solo informativa.
 * @param {object} D Proyección RAW interna, no archivo académico adicional.
 * @returns {object} Escenario inicial de análisis y edición.
 */
function fromRaw(D) {
  // Cada arreglo posicional produce un objeto nuevo. No se modifica la
  // fuente original ni se exige correspondencia con IDs de otro periodo.
  return {
    params: { dists: [...D.opciones.distanciasIniciales], indirect: D.opciones.excluirIndirectos ? 1 : 0 },
    malla: D.malla.map(([n, s, nota, cr, comp, car, idPos]) => ({ n, s, nota: nota || '', cr: cr == null ? null : cr, comp: comp || '', car: car || '', idPos: idPos || null, unidad: '' })),
    pre: D.pre.map(([r, t, m, rId, tId]) => ({ r, t, m: m || '', rId: rId || null, tId: tId || null })), // IDs del contrato, nombres solo para UI/legado
    asg: D.asg.map(a => a[0]),
    grupos: D.gr.map(([a, g, c1, c2, ref, analizable]) => ({ a, g, c1, c2: c2 || '', on: true, ref: ref || null, analizable: analizable !== false })),
    bloques: D.bl.map(([a, c, d, s, e, o, ref], i) => ({ id: ref ? EntradaAcademica.idNumerico(ref) : i + 1, a, c, d, s, e, o: o || '', ref: ref || null })),
    reqCred: (D.reqCred || []).map(([n, min, componentes, posicionId]) => ({ n, min, componentes: [...componentes], posicionId: posicionId || null })),
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

/**
 * Cierre transitivo de prerrequisitos del escenario actual: r -> t significa
 * que r es requisito de t. Se usa para evitar comparar asignaturas que el
 * plan declara dependientes, no para adivinar relaciones ausentes.
 */
function closure(S) {
  const adj = new Map();
  S.malla.forEach(m => adj.set(m.n, []));
  // El contrato utiliza IDs estables; la interfaz y los escenarios antiguos
  // todavía pueden conservar nombres. Resolver por ID evita depender del
  // texto visible cuando existe una referencia académica inequívoca.
  const nombresPorId = new Map(S.malla.filter(m => m.idPos).map(m => [m.idPos, m.n]));
  const nombre = (id, antiguo) => id && nombresPorId.has(id) ? nombresPorId.get(id) : antiguo;
  const relaciones = S.pre.map(p => ({ r: nombre(p.rId, p.r), t: nombre(p.tId, p.t) }));
  relaciones.forEach(p => { if (!adj.has(p.r)) adj.set(p.r, []); adj.get(p.r).push(p.t); });
  const desc = new Map();
  for (const n of adj.keys()) {
    const seen = new Set(), st = [...(adj.get(n) || [])];
    while (st.length) { const x = st.pop(); if (seen.has(x)) continue; seen.add(x); (adj.get(x) || []).forEach(y => st.push(y)); }
    desc.set(n, seen);
  }
  const direct = new Set(relaciones.map(p => p.r + '\u0001' + p.t));
  return { desc, direct };
}

/**
 * Intersección de intervalos semiabiertos [inicio,fin) del mismo día.
 * Dos clases que se tocan solo en el límite no se superponen.
 */
function overlap(a, b) { return a.d === b.d && a.s < b.e && b.s < a.e; }

/**
 * Motor sin DOM y sin dependencias de la interfaz. Calcula matriz de cada
 * par de asignaturas del escenario, choques de grupos, índices y totales.
 * Solo entran grupos con `on === true` Y `analizable !== false`.
 * Un grupo sin bloques NO produce choque supuesto. Con cero combinaciones,
 * el índice es 0 por decisión funcional, no un aviso de incompletitud.
 * Los filtros de componentes se aplican aparte en `actualizarVistaComponentes`
 * sin modificar grupos, bloques, referencia ni cambios personales.
 * @param {object} S Escenario efectivo de trabajo.
 * @returns {object} Resultados completos con `pairs`, `stats`, `groupsOf`,
 *   `allGroupsOf`, `totalPairs`, `totalClash` y `totalCombos`.
 */
function compute(S) {
  const indirect = S.params.indirect, dists = S.params.dists || [0, 1];
  const cl = closure(S);
  const byComp = new Map();
  S.bloques.forEach(b => { const k = b.a + '\u0001' + b.c; if (!byComp.has(k)) byComp.set(k, []); byComp.get(k).push(b); });
  const gBlocks = g => [...(byComp.get(g.a + '\u0001' + g.c1) || []), ...(g.c2 ? byComp.get(g.a + '\u0001' + g.c2) || [] : [])];

  const names = S.asg.map((n, i) => ({ n, i, s: semOf(S, n) })).sort((x, y) => x.s - y.s || x.i - y.i).map(x => x.n);
  // `allGroupsOf`: grupos registrados (también informativos/desactivados)
  // para consulta. `groupsOf`: solo opciones elegibles y activas para cálculo.
  const groupsOf = {}, allGroupsOf = {};
  names.forEach(n => { allGroupsOf[n] = S.grupos.filter(g => g.a === n).sort((x, y) => natKey(glabel(x)) - natKey(glabel(y)) || glabel(x).localeCompare(glabel(y))); groupsOf[n] = allGroupsOf[n].filter(g => g.on && g.analizable !== false); });

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
    // Si no se informó ninguna combinación, NO inventar cruces ni alertas.
    // El cero representa la ausencia de choque calculado, no un certificado
    // de compatibilidad académica definitiva.
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
  const porId=new Map(S.malla.filter(m=>m.idPos).map(m=>[m.idPos,m.n]));
  const nombre=(id, anterior)=>id&&porId.has(id)?porId.get(id):anterior;
  const relaciones=S.pre.map(p=>({r:nombre(p.rId,p.r),t:nombre(p.tId,p.t)}));
  walk(n, up, x => relaciones.filter(p => p.t === x).map(p => p.r));
  walk(n, down, x => relaciones.filter(p => p.r === x).map(p => p.t));
  return { up, down };
}

if (typeof module !== 'undefined') module.exports = { glabel, fromRaw, compute, closure, clone, wouldCycle, lineage, clashDetail, semOf, overlap };

