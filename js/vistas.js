'use strict';

/**
 * Presentación de las OCHO vistas académicas y sus paneles.
 * Solo lee el estado y los resultados creados por js/app.js y js/analisis.js.
 * No convierte fuentes académicas, no calcula referencias y no persiste
 * modificaciones personales. Se carga antes del arranque de la aplicación.
 * Usa S como escenario, R/RV como resultados completos/filtrados y UI como
 * selección transitoria. Una vista jamás convierte un dato incompleto en
 * conflicto académico, cupo institucional ni edición persistida.
 */
/* ---------- INICIO ---------- */
/**
 * Señal tipológica exclusivamente visual; los IDs proceden del escenario
 * académico vigente, no del nombre, horario o color de la carrera.
 * El CSS solo aplica tonos a IDs conocidos; los demás quedan neutros.
 */
function atributoComponente(comp) { return comp ? ' data-tipologia="'+esc(comp)+'"' : ''; }
function atributoTipologia(nombre) {
  return atributoComponente(S.malla.find(m => m.n === nombre)?.comp);
}
function gl(a, gname) { const g = S.grupos.find(x => x.a === a && x.g === gname); return g ? glabel(g) : gname; }
function sev(p) { return p.clash === 0 ? ['ok', 'Compatibles'] : p.clash === p.total ? ['a', 'Incompatibles'] : ['b', 'Depende del grupo']; }
const distLabel = d => d === 0 ? 'mismo semestre' : d + (d === 1 ? ' semestre de diferencia' : ' semestres de diferencia');
function semCred(s, n) { return new PlanCurricular({malla:n, tipos:S.tipos}).resumenSemestre(s); }
function distNames(ds) { return [...ds].sort((a,b)=>a-b).map(distLabel).join(' · '); }
function distSummary() { const l = [...S.params.dists].sort((a,b)=>a-b).map(distLabel); return l.length > 1 ? l.slice(0, -1).join(', ') + ' o ' + l[l.length - 1] : (l[0] || 'sin selección'); }
function distChips(counts) {
  return OPCIONES.distanciasDisponibles.map(d => { const n = counts && !SIN_DATOS ? RV.pairs.filter(p => p.aplica && p.dist === d && p.clash).length : null; return `<button class="chip" data-act="dist" data-d="${d}" aria-pressed="${S.params.dists.includes(d)}" ${SIN_DATOS?'disabled':''}>${d === 0 ? 'Mismo semestre' : d + (d === 1 ? ' semestre' : ' semestres')}${n === null ? '' : `<span class="n" title="parejas con choque">${n}</span>`}</button>`; }).join('');
}
function distText(p) { return p.dist === 0 ? 'Mismo semestre' : p.dist === 1 ? '1 semestre de diferencia' : p.dist + ' semestres de diferencia'; }
function compGroups(A, c) { return S.grupos.filter(g => g.a === A && (g.c1 === c || g.c2 === c)).sort((x, y) => natKey(glabel(x)) - natKey(glabel(y))); }
function compLabel(A, c) { const gs = compGroups(A, c); return gs.length ? gs.map(glabel).join(' · ') : 'Sin grupo'; }

/** Inicio: resumen de cruces del escenario actual ya filtrado; no calcula datos nuevos. */
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
      <p class="hero-s">${SIN_DATOS ? 'La comparación aparecerá aquí cuando se incorporen datos académicos de esta carrera.' : `Entre asignaturas que se pueden cursar a la vez hay <b class="num">${R.totalCombos}</b> combinaciones posibles de grupos. <b class="num hl">${R.totalClash}</b> de ellas (${pct(gIdx, 1)}) tienen choque de horario. ${dlt(R.totalClash, R0.totalClash)}`}</p></div>
    <div class="hero-k">
      <div><b class="num">${SIN_DATOS?'—':inr.length}</b><span>parejas de asignaturas que se podrían cursar a la vez</span></div>
      <div><b class="num">${SIN_DATOS?'—':con.length+' '+dlt(con.length, R0.totalPairs)}</b><span>tienen al menos una combinación de grupos que choca</span></div>
      <div><b class="num">${SIN_DATOS?'—':sie.length}</b><span>son incompatibles: ningún grupo de una cabe con ningún grupo de la otra</span></div>
    </div></section>
  <div class="grid2" style="margin-top:16px">
    <section class="card"><div class="card-h"><h2>Parejas con más choque</h2><button class="btn sm ghost" data-act="nav" data-p="inter">Ver todos →</button></div>
      <div class="card-b" style="display:grid;gap:2px">${topP.map(p => `<button class="toprow" data-act="pair-open" data-k="${esc(p.key)}"><span><b class="asig-etiqueta"${atributoTipologia(p.A)}>${esc(p.A)}</b> <span class="sem">S${p.sA}</span> <span class="faint">y</span> <b class="asig-etiqueta"${atributoTipologia(p.B)}>${esc(p.B)}</b> <span class="sem">S${p.sB}</span><br><span class="hint">${txt(p)}</span></span><span class="bar"><i style="width:${p.idx * 100}%"></i></span><b class="num">${pct(p.idx)}</b></button>`).join('') || (SIN_DATOS?'<div class="hint">Sin datos académicos para analizar.</div>':'<div class="hint">No hay choques con los parámetros actuales.</div>')}</div></section>
    <section class="card"><div class="card-h"><h2>Asignaturas más afectadas</h2><button class="btn sm ghost" data-act="nav" data-p="asig">Ver todas →</button></div>
      <div class="card-b" style="display:grid;gap:2px">${SIN_DATOS?'<div class="hint">Pendiente de datos académicos.</div>':topA.map(s => `<button class="toprow" data-act="a-go" data-n="${esc(s.n)}"><span><b class="asig-etiqueta"${atributoTipologia(s.n)}>${esc(s.n)}</b> <span class="sem">S${s.s}</span><br><span class="hint">se cruza con ${s.conChoque} de ${s.pares} asignaturas con las que se compara</span></span><span class="bar"><i style="width:${Math.min(100, s.idxG * 100 / (topA[0].idxG || 1))}%"></i></span><b class="num">${pct(s.idxG)}</b></button>`).join('')}</div></section>
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
  ${SIN_DATOS?'':'<details class="fold"><summary>Supuestos de los datos</summary>'}<dl>
    <dt>Asignaturas incluidas</dt><dd>Las que están incorporadas al análisis y pertenecen a los componentes seleccionados (${R.names.length}). La malla conserva también las asignaturas sin grupos cargados.</dd>
    <dt>Horas</dt><dd>Franja y días definidos en la configuración de la oferta.</dd>
    <dt>Prerrequisitos</dt><dd>Tomados de la malla vigente (Acuerdo 6 de 2022 del Consejo de Facultad de Ingeniería). Los requisitos de créditos se consultan en la malla, pero no modifican los cálculos de interferencias.</dd>
    <dt>Control</dt><dd>Cada grupo (G1 a G8) combina una magistral con un laboratorio. El emparejamiento de la magistral 3 (grupos G5 y G6) no está confirmado.</dd>
    <dt>Tus cambios</dt><dd>Se guardan solos en este navegador. «Guardar» descarga el escenario, «Cargar» lo recupera y «Restablecer» vuelve a los datos de referencia del programa.</dd></dl></details>'}`;
}

/* ---------- INTERFERENCIAS ---------- */
/** Determina si una pareja cumple los criterios locales de la vista. */
function pairMatches(p) {
  const f = ui.inter;
  if (!p.enRango) return false;
  if (f.soloChoque && p.clash === 0) return false;
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
    <span class="names"><span class="a"${atributoTipologia(p.A)}><i class="dotA"></i>${esc(p.A)} <span class="sem">S${p.sA}</span></span><span class="x">⇄</span><span class="b"${atributoTipologia(p.B)}><i class="dotB"></i>${esc(p.B)} <span class="sem">S${p.sB}</span></span></span>
    ${fingerprint(p)}
    <span class="sub"><span class="lvl ${c}">${t}</span><span>${distText(p)}</span><span>· ${p.nA} y ${p.nB} grupos ofertados</span></span>
    <span class="idxcol"><span class="big"><b class="num">${pct(p.idx)}</b><span class="num">${p.clash} de ${p.total} combinaciones</span></span><span class="bar"><i style="width:${p.idx * 100}%"></i></span></span></button>`;
}
/** Matriz sobre pares elegibles del resultado filtrado, sin regenerar combinaciones. */
function matrixView() {
  const R = RV;
  const N = R.names, f = ui.inter;
  const cells = N.map((a, i) => `<tr class="${i && R.st[a].s !== R.st[N[i - 1]].s ? 'semgap' : ''}"><th class="rowh" scope="row"><span class="asig-etiqueta"${atributoTipologia(a)}>${esc(a)}</span> <span class="sem">S${R.st[a].s}</span></th>${N.map((b, j) => {
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
  return `<div class="card"><div class="mxwrap"><table class="mx"><thead><tr><th></th>${N.map((b, j) => `<th class="colh ${j && R.st[b].s !== R.st[N[j - 1]].s ? 'semgap' : ''}" scope="col"><div><span class="asig-etiqueta"${atributoTipologia(b)}>${esc(b)}</span> · S${R.st[b].s}</div></th>`).join('')}</tr></thead><tbody>${cells}</tbody></table></div>
  <div class="legend" style="padding:0 16px 14px"><span>Cada celda = índice de solape (%)</span><span><i class="sw" style="background:var(--surface2)"></i>0<i class="heatscale"></i>100</span><span><i class="sw" style="background:var(--ok-soft)"></i>sin choque</span><span><i class="sw" style="background:repeating-linear-gradient(135deg,transparent 0 3px,var(--line2) 3px 4px);border:1px solid var(--line)"></i>no se compara (prerrequisito o distancia no elegida)</span><span class="faint">Las celdas atenuadas no cumplen los filtros.</span></div></div>`;
}
/** Interferencias: lista, matriz y filtros de parejas del mismo conjunto RV. */
function pageInter() {
  const R = RV;
  const f = ui.inter;
  const sems = [...new Set(R.names.map(n => R.st[n].s))].sort((a, b) => a - b);
  const list = sortPairs(R.pairs.filter(p => pairMatches(p)));
  const active = f.grav.size || f.sems.size || f.asig || f.q || !f.soloChoque;
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
/**
 * Detalle matricial de una pareja: utiliza grupos ANALIZABLES, aunque
 * `allGroupsOf` conserve también opciones de otras sedes para consulta en
 * la sección Grupos. Las celdas deben conservar el mismo orden que `matrix`.
 */
/** Detalle de una pareja y grupos concretos; sin inventar horarios faltantes. */
function drawerPair(dw) {
  const R = RV;
  const p = R.pairs.find(x => x.key === dw.key);
  if (!p) return null;
  const GA = R.allGroupsOf[p.A].filter(g => g.analizable !== false);
  const GB = R.allGroupsOf[p.B].filter(g => g.analizable !== false);
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
      <h2><span class="asig-etiqueta"${atributoTipologia(p.A)} style="color:var(--ca)">${esc(p.A)}</span> <span class="faint">⇄</span> <span class="asig-etiqueta"${atributoTipologia(p.B)} style="color:var(--cb)">${esc(p.B)}</span></h2>
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
/** Resumen visual de diferencias personales entre S0 y S. */
function drawerCambios() {
  const ch = changes(), pd = pairDeltas();
  const reporte=[RV,RV0];
  const [resultado, anterior] = reporte;
  return `<div class="dr-h"><div><span class="eyebrow">Escenario vs. datos de referencia</span><h2>${ch.length} cambio${ch.length === 1 ? '' : 's'}</h2></div><button class="xbtn" data-act="drawer-close" aria-label="Cerrar">×</button></div>
  <div class="dr-b">
    <div class="kv"><div><div class="k">Pares con choque</div><div class="v num">${anterior.totalPairs} → ${resultado.totalPairs}</div></div><div><div class="k">Parejas en choque</div><div class="v num">${anterior.totalClash} → ${resultado.totalClash}</div></div><div><div class="k">Índice global</div><div class="v num">${pct(anterior.totalCombos ? anterior.totalClash / anterior.totalCombos : 0, 1)} → ${pct(resultado.totalCombos ? resultado.totalClash / resultado.totalCombos : 0, 1)}</div></div></div>
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
/** Asignaturas: indicadores derivados del análisis, distinguiendo clases sin grupo. */
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
    return `<div class="arow ${open ? 'open' : ''}"${atributoTipologia(x.n)} data-aname="${esc(x.n)}"><button class="head" data-act="a-open" data-n="${esc(x.n)}" aria-expanded="${open}">
      <span class="rank ${rk && rk <= 3 ? 'top' : ''}">${rk ? '#' + rk : 'S' + x.s}</span>
      <span><b>${esc(x.n)}</b> <span class="sem">S${x.s}</span><br><span class="hint">${x.grupos} grupo${x.grupos === 1 ? '' : 's'}${x.gruposTotal !== x.grupos ? ` (${x.gruposTotal - x.grupos} desactivado${x.gruposTotal - x.grupos > 1 ? 's' : ''})` : ''}</span></span>
      <span class="met"><span class="l"><span>Se cruza con</span><b class="num">${x.conChoque} de ${x.pares} asignaturas</b></span><span class="bar"><i style="width:${x.pares ? x.conChoque / x.pares * 100 : 0}%"></i></span><span class="l"><span>${dlt(x.conChoque, (R0.st[x.n] || x).conChoque)}</span></span></span>
      <span class="met"><span class="l"><span>Combinaciones que chocan</span><b class="num">${pct(x.idxG)}</b></span><span class="bar"><i style="width:${x.idxG / maxIdx * 100}%"></i></span><span class="l"><span>${worst && worst.p.clash ? `peor cruce: ${esc(worst.o)} (${pct(worst.p.idx)})` : 'sin choques'}</span>${dlt(x.idxG, (R0.st[x.n] || x).idxG, 1)}</span></span>
      <span class="chev">›</span></button>
      ${open ? `<div class="body"><div class="row" style="justify-content:space-between;padding:10px 0 4px"><span class="lab">Se cruza con ${mine.length} asignaturas</span><span class="row"><button class="btn sm" data-act="grp-go" data-n="${esc(x.n)}">Ver grupos</button><button class="btn sm" data-act="hor-go" data-n="${esc(x.n)}">Ver horarios</button></span></div>
      ${editorUnidad(x.n)}
       ${[...mine].sort((a, b) => b.p.idx - a.p.idx).map(m => `<button class="prt" data-act="pair-open" data-k="${esc(m.p.key)}"><span class="lvl ${sev(m.p)[0]}" style="min-width:0">${sev(m.p)[1]}</span><span><span class="asig-etiqueta"${atributoTipologia(m.o)}>${esc(m.o)}</span> <span class="sem">S${m.os}</span><br><span class="hint">${m.p.clash} de ${m.p.total} combinaciones de grupos chocan</span></span><span class="bar"><i style="width:${m.p.idx * 100}%"></i></span><b class="num">${pct(m.p.idx)}</b></button>`).join('')}</div>` : ''}</div>`;
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
  const R=RV;
  const cl = R.groupClash.get(a + '\u0001' + g.g) || [];
  const by = {}; cl.forEach(x => { (by[x.a] = by[x.a] || []).push(gl(x.a, x.g)); });
  const parts = [g.c1, g.c2].filter(Boolean).map(c => {
    const sh = S.grupos.filter(o => o.a === a && o.g !== g.g && (o.c1 === c || o.c2 === c));
    return `<div>${esc(compText(a, c))}${sh.length ? ` <span class="hint">(clase compartida con ${sh.map(o => esc(glabel(o))).join(', ')})</span>` : ''}</div>`;
  }).join('');
  return `<div class="gdet"><div><b>${esc(glabel(g))}</b> <span class="faint">${g.analizable === false ? '(grupo de otra sede: solo consulta)' : (g.on ? '' : '(no se oferta en esta simulación)')}</span></div>
    ${parts}
    <div><div class="lab" style="margin-bottom:4px">Choca con</div>${g.analizable === false ? '<span class="hint">Registrado para consulta; no participa en los cálculos.</span>' : g.on ? (Object.keys(by).length ? Object.entries(by).map(([n, gs]) => `<div class="cl" style="margin-bottom:4px"><button class="btn sm ghost" data-act="grp-go" data-n="${esc(n)}"><span class="asig-etiqueta"${atributoTipologia(n)}>${esc(n)}</span></button>${gs.map(x => `<span class="tag heat">${esc(x)}</span>`).join('')}</div>`).join('') : '<span class="tag ok">no choca con ningún grupo</span>') : '<span class="hint">Desactivado: no entra en los cálculos.</span>'}</div>
    <div class="row">${g.analizable === false ? '' : `<button class="btn sm" data-act="g-toggle" data-a="${esc(a)}" data-g="${esc(g.g)}">${g.on ? 'Dejar de ofertar' : 'Volver a ofertar'}</button>`}<button class="btn sm" data-act="hor-go" data-n="${esc(a)}" data-c="${esc(g.c1)}">Editar horario</button><button class="btn sm danger" data-act="g-del" data-a="${esc(a)}" data-g="${esc(g.g)}">Eliminar</button></div></div>`;
}
/**
 * Consulta y edición de TODOS los grupos registrados. `analizable:false`
 * conserva información visible de otras sedes sin activarla en el cálculo;
 * ocultar estos grupos equivaldría a descartar información del contrato.
 */
/** Grupos: alternativas declaradas, incluidos los informativos no analizables. */
function pageGrupos() {
  const R=RV,sel=ui.grp.sel;
  const avail=S.malla.filter(m=>pasaFiltros(m) && !S.asg.includes(m.n))
    .sort((a,b)=>a.s-b.s||a.n.localeCompare(b.n));
  const cards=R.names.map(n=>{
    const gs = R.allGroupsOf[n], st = R.st[n];
    const selG = sel && sel.a === n ? gs.find(g => g.g === sel.g) : null;
    return `<section class="card gcard"${atributoTipologia(n)} data-aname="${esc(n)}">
      <div class="hd"><div><h3><span class="asig-etiqueta"${atributoTipologia(n)}>${esc(n)}</span> <span class="sem">S${st.s}</span></h3><span class="hint">${st.grupos} en el análisis · ${gs.length} registrados</span></div><button class="btn sm ghost" data-act="asg-del" data-n="${esc(n)}" title="Quitar del análisis">Quitar</button></div>
      <div class="gchips">${gs.map(g => {
        const c = (R.groupClash.get(n + '\u0001' + g.g) || []).length;
        return `<button class="gchip ${g.on ? '' : 'off'} ${selG && selG.g === g.g ? 'sel' : ''}" data-act="g-sel" data-a="${esc(n)}" data-g="${esc(g.g)}">${esc(glabel(g))}${g.analizable === false ? '<span class="faint"> · otra sede</span>' : g.on ? `<span class="b ${c ? 'h' : 'o'}">${c ? c : '✓'}</span>` : ''}</button>`;
      }).join('') || '<span class="hint">Sin grupos todavía.</span>'}</div>
      ${selG ? groupDetail(n, selG) : '<div class="hint">Clic en un grupo para ver su horario y con qué choca. El número rojo es la cantidad de grupos de otras asignaturas con los que choca.</div>'}
      <div class="addrow" data-a="${esc(n)}"><input type="text" class="ng-n" placeholder="Nuevo grupo (ej. G7)" aria-label="Nombre del nuevo grupo"><button class="btn sm" data-act="g-add">Agregar</button></div>
    </section>`;
  }).join('');
  return `<div class="page-title"><div><h1>Grupos</h1><p>Los grupos que se ofertan de cada asignatura. Desactiva uno para simular que no se abre, o agrega uno nuevo y ajusta su horario en <a href="#hor" data-act="nav" data-p="hor">Horarios</a>.</p></div>
    <div class="row"><select id="asg-new" aria-label="Asignatura a agregar"><option value="">Agregar asignatura de la malla…</option>${avail.map(m => `<option value="${esc(m.n)}">${esc(m.n)} (sem ${m.s})</option>`).join('')}</select><button class="btn" data-act="asg-add">Agregar</button></div></div>
    <div class="gcards">${cards||'<div class="empty-state">No hay asignaturas de la tipología o unidad seleccionada.</div>'}</div>`;
}

/* ===== HORARIOS ===== */
function compColor(i) {
  const h = (i * 53 + 205) % 360;
  return `background:color-mix(in srgb,hsl(${h} 68% 52%) 24%,var(--surface));border-color:hsl(${h} 55% 48%);color:color-mix(in srgb,hsl(${h} 65% 42%) 70%,var(--ink))`;
}
function swatchColor(i) { return `hsl(${(i * 53 + 205) % 360} 55% 48%)`; }
/** Disposición visual en columnas de bloques concurrentes; no modifica sus horas. */
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
/**
 * Consulta/edición de los horarios del escenario personal completo.
 * Mostrar un bloque informativo no implica incluirlo en estadísticas;
 * el resaltado de cruces entre superposiciones consulta elegibilidad.
 */
/** Horarios: cuadrícula editable desde S; el render no escribe en el escenario. */
function pageHor() {
  const R=RV,R0=RV0;
  if(!R.names.length)return `<div class="page-title"><div><h1>Horarios</h1><p>${S.asg.length?'Ninguna asignatura coincide con los filtros de tipología y departamento/facultad.':'No hay asignaturas incorporadas al análisis de horarios. Puedes agregarlas desde Grupos.'}</p></div></div>`;
  const h=ui.hor;
  if(!R.names.includes(h.a))h.a=R.names[0];
  const A = h.a, comps = compsOf(A), mine = S.bloques.filter(b => b.a === A);
  h.ov = h.ov.filter(n => R.names.includes(n) && n !== A);
  const ovBlocks = S.bloques.filter(b => h.ov.includes(b.a));
  const hasOv = ovBlocks.length > 0, ZW = hasOv ? 62 : 100;
  const lm = lanes(mine), lo = lanes(ovBlocks);
  const hot = new Set(), hitSet = new Set();
  const clavesAnalizables = new Set(S.grupos.filter(g => g.on && g.analizable !== false).flatMap(g =>
    [g.c1, g.c2].filter(Boolean).map(c => g.a + '\u0001' + c)));
  ovBlocks.forEach(o => mine.forEach(m => { if (clavesAnalizables.has(o.a + '\u0001' + o.c) && clavesAnalizables.has(m.a + '\u0001' + m.c) && overlap(o, m)) { hitSet.add(o); for (let x = Math.max(o.s, m.s); x < Math.min(o.e, m.e); x++) hot.add(o.d + ':' + x); } }));
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
    <aside class="card sidelist" aria-label="Asignaturas">${sems.map(s => `<div class="sg">Semestre ${s}</div>${R.names.filter(n => R.st[n].s === s).map(n => `<button data-act="h-sel" data-n="${esc(n)}" aria-current="${n === A}"${atributoTipologia(n)}><span>${esc(n)}</span><i class="hdot" title="${pct(R.st[n].idxG)} de combinaciones chocan" style="background:${heatBg(R.st[n].idxG * 2)}"></i></button>`).join('')}`).join('')}</aside>
    <div>
      <select class="mobile-only" data-chg="h-pick" aria-label="Asignatura" style="width:100%;margin-bottom:10px">${R.names.map(n => `<option ${n === A ? 'selected' : ''}>${esc(n)}</option>`).join('')}</select>
      <div class="row" style="margin-bottom:10px"><h2 style="font:650 20px var(--serif)"><span class="asig-etiqueta"${atributoTipologia(A)}>${esc(A)}</span></h2><span class="sem">S${R.st[A].s}</span><span style="flex:1"></span>
        <select data-chg="h-ov-add" aria-label="Superponer asignatura"><option value="">Superponer otra asignatura…</option>${R.names.filter(n => n !== A && !h.ov.includes(n)).map(n => `<option>${esc(n)}</option>`).join('')}</select>
        <button class="btn sm" data-act="h-ov-clash" ${choques.length ? '' : 'disabled'} title="Superpone las asignaturas con las que choca">Las que chocan (${choques.length})</button></div>
      ${editorUnidad(A)}
      ${h.ov.length ? `<div class="chips" style="margin-bottom:10px">${h.ov.map(n => `<button class="chip" data-act="h-ov-del" data-n="${esc(n)}"${atributoTipologia(n)}>${esc(n)} ×</button>`).join('')}<button class="btn sm ghost" data-act="h-ov-none">Quitar todas</button></div>` : ''}
      <div class="weekgrid-scroll" role="region" tabindex="0" aria-label="Horario semanal desplazable"><div class="weekgrid" style="--numero-dias:${DAYS.length}"><div class="dh" style="border-left:0"></div>${DAYS.map(d => `<div class="dh"><span class="full">${DAY_NAMES[d]}</span><span class="short">${DAY_SHORT[d]}</span></div>`).join('')}<div class="hrs">${hours.map(x => `<div>${x}</div>`).join('')}</div>${cols}</div></div>
      <div class="legend" style="margin-top:8px"><span>Cada bloque lleva el nombre del grupo (o grupos) que lo usan; bloques lado a lado son grupos alternativos a la misma hora.</span>${hasOv ? '<span><i class="sw" style="background:color-mix(in srgb,var(--heat) 22%,transparent)"></i>horas donde se pisan con lo superpuesto</span>' : ''}</div>
    </div>
    <div class="right" style="display:grid;gap:12px">${impact}
      <div class="lab">Horario por grupo</div>${compCards}
    </div>
  </div>`;
}
/* ===== MAPA DE CALOR / OCUPACIÓN DE HORARIOS ===== */
/**
 * Concentración de grupos activos elegibles por franja de una hora.
 * Cada grupo se cuenta una sola vez por franja aunque comparta componentes.
 * No mide estudiantes matriculados, salones ocupados ni cupos ofertados.
 * Los filtros de vista no deben cambiar los datos ni generar choques nuevos.
 */
/** Mapa de calor: cuenta franjas programadas, no aulas ni matrículas reales. */
function pageHeat() {
  const off = ui.heat.off;
  const names=[...RV.names].sort((a,b)=>semOf(S,a)-semOf(S,b)||a.localeCompare(b,'es'));
  const selected = names.filter(n => !off.has(n));
  const selectedSet = new Set(selected);
  const groups = S.grupos.filter(g => selectedSet.has(g.a) && g.on && g.analizable !== false);
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
    return `<div class="sg">Semestre ${sem} <span class="faint">· ${on}/${ns.length}</span></div>${ns.map(n => `<button class="hm-asg"${atributoTipologia(n)} data-act="hm-toggle" data-n="${esc(n)}" aria-pressed="${!off.has(n)}" title="${off.has(n) ? 'Incluir en el mapa' : 'Excluir del mapa'}"><i class="hm-check">✓</i><span>${esc(n)}</span><i class="hm-dot" title="Tiene horario cargado"></i></button>`).join('')}`;
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
      <div class="weekgrid-scroll" role="region" tabindex="0" aria-label="Mapa de calor semanal desplazable"><div class="weekgrid hm-grid" style="--numero-dias:${DAYS.length}"><div class="dh" style="border-left:0"></div>${DAYS.map(d => `<div class="dh"><span class="full">${DAY_NAMES[d]}</span><span class="short">${DAY_SHORT[d]}</span></div>`).join('')}<div class="hrs">${Array.from({ length: H_MAX - H_MIN }, (_, i) => `<div>${H_MIN + i}</div>`).join('')}</div>${columns}</div></div>
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
/**
 * Representación de Libre elección, específica de Prerrequisitos:
 * el ID de componente proviene del plan, no de un filtro global ni de un
 * porcentaje fijo. Nunca genera registros académicos ni modifica S.
 */
function idComponenteLibre(tipos) {
  return (tipos?.componentes || []).find(c =>
    /libre eleccion/i.test(String(c.nombre || '').normalize('NFD').replace(/[\u0300-\u036f]/g, ''))
  )?.id || null;
}
function mallaVisible(m) {
  if (!m) return false;
  const libre = idComponenteLibre(S.tipos);
  const unidad = !ui.unidad || (ui.unidad === SIN_UNIDAD ? !m.unidad : m.unidad === ui.unidad);
  if (libre && m.comp === libre) return !!ui.malla.libres && unidad;
  return pasaFiltros(m);
}
/**
 * @param {object} estado Escenario vigente (no se muta).
 * @param {object} referencia Escenario académico base, para respetar traslados personales.
 * @param {Set<string>} fijadas Posiciones movidas explícitamente en la sesión.
 * @param {boolean} equilibrar Si false conserva los semestres registrados.
 * @returns {{posiciones:object[], creditos:number, incompleto:boolean, cargas:number[]}}
 *
 * Las posiciones L con más de 3 créditos se desglosan SOLO visualmente en
 * tramos de 3 y un posible residuo. Los tramos virtuales nunca son asignaturas
 * ni tienen acciones de edición individual. Los 36 créditos de Mecatrónica
 * se obtienen de las posiciones L de su fuente, no de una constante.
 */
/** Distribución VISUAL opcional de posiciones L: no mueve posiciones reales en S. */
function proyeccionLibresMalla(estado, referencia, fijadas = new Set(), equilibrar = true) {
  const libre = idComponenteLibre(estado.tipos);
  const maxSem = Math.max(1, ...estado.malla.map(m => m.s));
  const componentes = new Map((estado.tipos?.componentes || []).map(c => [c.id, c]));
  const cargas = Array.from({ length: maxSem + 1 }, () => 0);
  const originales = new Map(referencia.malla.map(m => [m.idPos || m.n, m.s]));
  const libres = [];
  // La base real suma todos los componentes del plan salvo Libre elección;
  // Nivelación se identifica por enPlan=false, NO por créditos universales.
  for (const m of estado.malla) {
    if (m.comp === libre) {
      if (Number.isInteger(m.cr) && m.cr > 3) {
        let pendiente = m.cr, i = 0;
        while (pendiente > 0) {
          const cr = Math.min(3, pendiente);
          libres.push({ ...m, n: m.n + ' · tramo ' + (++i), cr, _libreVirtual: true,
            _libreOrigen: m.n, _libreReferencia: m.s });
          pendiente -= cr;
        }
      } else {
        libres.push({ ...m, _libreVirtual: false, _libreOrigen: m.n,
          _libreReferencia: m.s });
      }
    } else if (componentes.get(m.comp)?.enPlan !== false && Number.isFinite(m.cr) &&
               Number.isInteger(m.s) && m.s >= 1 && m.s <= maxSem) {
      cargas[m.s] += m.cr;
    }
  }
  const creditos = estado.malla.filter(m => m.comp === libre && Number.isFinite(m.cr))
    .reduce((sum, m) => sum + m.cr, 0);
  const fijasAhora = libres.filter(m => !equilibrar ||
    fijadas.has(m._libreOrigen) ||
    originales.get(m.idPos || m._libreOrigen) !== m._libreReferencia ||
    !Number.isFinite(m.cr) || m.cr <= 0);
  const porUbicar = libres.filter(m => !fijasAhora.includes(m));
  for (const m of fijasAhora) if (Number.isFinite(m.cr) && m.s>=1 && m.s<=maxSem)
    cargas[m.s] += m.cr;
  // Comparador de estabilidad: no se cambia una ubicación registrada por una
  // propuesta distinta cuando la referencia ya está igual de equilibrada.
  const cargasRegistradas = cargas.slice();
  for (const m of porUbicar) if (Number.isFinite(m.cr) && m.s>=1 && m.s<=maxSem)
    cargasRegistradas[m.s] += m.cr;
  // Empates por semestre más temprano y nombre estable; es una proyección
  // matemática de carga, no la certificación de un prerrequisito de avance.
  porUbicar.sort((a,b) => b.cr-a.cr ||
    a._libreReferencia-b._libreReferencia || a._libreOrigen.localeCompare(b._libreOrigen,'es'));
  for (const m of porUbicar) {
    let mejor=1;
    for (let s=2; s<=maxSem; s++) if (cargas[s] < cargas[mejor]) mejor=s;
    m.s=mejor;
    cargas[mejor]+=m.cr;
  }
  const dispersion = arr => {
    const promedio=arr.slice(1).reduce((a,n)=>a+n,0)/maxSem;
    return arr.slice(1).reduce((a,n)=>a+(n-promedio)**2,0);
  };
  if (equilibrar && dispersion(cargasRegistradas) <= dispersion(cargas) + 1e-9) {
    porUbicar.forEach(m => { m.s=m._libreReferencia; });
    cargas.splice(0,cargas.length,...cargasRegistradas);
  }
  return { posiciones:libres, creditos,
    incompleto:estado.malla.some(m => m.comp === libre && !Number.isFinite(m.cr)),
    cargas:cargas.slice(1) };
}
function semHead(s, visibles) {
  const c = semCred(s, visibles);
  return `<span class="semcr" title="${c.incompleto ? 'Créditos registrados (hay asignaturas sin créditos definidos): ' : ''}${c.total} créditos en total${c.adicionales ? ` (${c.plan} del plan + ${c.adicionales} adicionales)` : ''}"><b class="num">${c.plan}${c.adicionales ? '+' + c.adicionales : ''}</b></span>`;
}
/** Prerrequisitos: relaciones declaradas y posiciones L, sin inferir inscripción. */
function pageMalla() {
  const M=ui.malla;
  if(M.sel && !S.malla.find(m=>m.n===M.sel)) M.sel=null;
  const componentes = S.malla.filter(m => mallaVisible(m) &&
    (!M.soloHor || S.asg.includes(m.n)));
  const libres = proyeccionLibresMalla(S,S0,M.libresFijas,M.equilibrar);
  const idLibre = idComponenteLibre(S.tipos);
  const visibles = componentes.filter(m => m.comp !== idLibre)
    .concat(M.libres && !M.soloHor ?
      libres.posiciones.filter(m => mallaVisible(m)) : []);
  // Se usa exclusivamente para informar al panel de edición de la diferencia
  // entre el semestre registrado y la ubicación visual sugerida.
  M.ubicacionesLibres = new Map(visibles.filter(m => m.comp === idLibre &&
    !m._libreVirtual).map(m => [m.n,m.s]));
  const seleccionable = new Set(visibles.filter(m => !m._libreVirtual).map(m=>m.n));
  const sel=seleccionable.has(M.sel)?M.sel:null;
  const L=sel?lineage(S,sel):null;
  const maxSem=maxSemester(S);
  const cols=Array.from({length:maxSem},(_,i)=>i+1).map(s=>{
    const cs=visibles.filter(m=>m.s===s);
    return `<div class="mcol" data-sem="${s}"><h4>Semestre ${s} ${semHead(s,cs)}</h4>${cs.map(m=>{
      const virtual=!!m._libreVirtual;
      const esLibre=!!idLibre && m.comp===idLibre;
      if(virtual)return `<div class="mcard nosched mcard-libre"${atributoComponente(m.comp)} title="Tramo visual de créditos de Libre elección; no es una nueva asignatura académica"><span class="mt"><span>${esc(m.n)}</span><span class="cr">${m.cr} cr</span></span><small><span>Distribución visual de Libre elección</span></small></div>`;
      const sc=RV.st[m.n], req=creditRuleFor(m.n), check=req?creditStatus(m,req):null;
      let cls=sc?'':'nosched';
      if(esLibre)cls+=' mcard-libre';
      if(L) cls+=m.n===M.sel?' sel':L.up.has(m.n)?' up':L.down.has(m.n)?' down':' dim';
      const sugerencia = esLibre && M.equilibrar && m.s !== m._libreReferencia;
      return `<button class="mcard ${cls}"${atributoComponente(m.comp)} draggable="true" data-act="m-sel" data-n="${esc(m.n)}" aria-pressed="${m.n===M.sel}" title="${sugerencia?'Ubicación visual sugerida; ':''}Arrastra a otro semestre para cambiar tu escenario"><span class="mt"><span>${esc(m.n)}</span><span class="cr" title="Créditos">${m.cr==null?'—':m.cr} cr</span></span><small><span>${esc(compName(m.comp))}${m.car?' · '+esc(carName(m.car)):''}</span></small>${check&&check.low?`<small><span class="tag heat">Faltan ${req.min-check.total} cr. previos</span></small>`:''}${sc?`<small><span>${sc.grupos} grupos</span><span class="num">${pct(sc.idxG)} chocan</span></small><span class="heatbar"><i style="width:${Math.min(100,sc.idxG*200)}%"></i></span>`:esLibre?'<small><span>Créditos flexibles · sin asignatura definida</span></small>':'<small><span>sin horario</span></small>'}${!req&&m.nota?`<small title="${esc(m.nota)}"><span>${esc(m.nota.replace('Requiere el ','').replace(' de los créditos del plan',' de créditos'))}</span></small>`:''}</button>`;
    }).join('')}</div>`;
  }).join('');
  return `<div class="page-title"><div><h1>Prerrequisitos</h1><p>La malla como grafo. Selecciona una asignatura para ver su cadena de requisitos (azul) y lo que abre (verde). <b>Arrastra</b> una asignatura a otra columna para cambiarla de semestre y mira cómo cambia la carga de créditos de cada uno, o edita sus relaciones en el panel: las comparaciones entre asignaturas que dejan de poder cursarse juntas salen del análisis.</p></div>
    <div class="row"><div class="seg"><button data-act="m-edges" data-v="all" aria-pressed="${M.edges==='all'}">Todas las flechas</button><button data-act="m-edges" data-v="sel" aria-pressed="${M.edges==='sel'}">Solo la selección</button></div>
    <button class="btn sm malla-libre-toggle" data-act="m-libres" aria-pressed="${!!M.libres}" ${!libres.posiciones.length?'disabled':''}>Libre elección · ${!libres.posiciones.length?'sin posiciones':libres.incompleto?'≥'+libres.creditos+' cr informados':libres.creditos+' cr'}</button>
    <button class="btn sm" data-act="m-equilibrar" aria-pressed="${!!M.equilibrar}" ${!M.libres?'disabled':''}>${M.equilibrar?'Carga equilibrada':'Semestres registrados'}</button>
    <label class="switch"><input type="checkbox" data-chg="m-solo" ${M.soloHor?'checked':''}><i></i>Solo con horario</label></div></div>
  ${M.libres && M.equilibrar?'<p class="hint malla-proyeccion-aviso">Distribución visual sugerida para equilibrar créditos del plan, excluyendo Nivelación. No cambia el semestre registrado ni certifica requisitos de avance. Para guardarlo como cambio personal, mueve una posición.</p>':''}
  <div class="mallawrap"><section class="malla-panel ${M.ampliado?'malla-panel--ampliado':''}" id="malla-panel" aria-label="Mapa de prerrequisitos">
     <div class="malla-toolbar">
       <div class="malla-toolbar-titulo"><strong>Mapa curricular</strong><span>Desplaza para explorar los semestres</span></div>
       <div class="malla-controles" role="group" aria-label="Escala y tamaño del mapa">
         <button class="btn sm" type="button" data-act="m-zoom" data-dx="-0.1" aria-label="Alejar mapa" ${M.zoom<=.6?'disabled':''}>−</button>
         <output class="malla-zoom-etiqueta" aria-live="polite">${Math.round(M.zoom*100)} %</output>
         <button class="btn sm" type="button" data-act="m-zoom" data-dx="0.1" aria-label="Acercar mapa" ${M.zoom>=1.6?'disabled':''}>+</button>
         <button class="btn sm" type="button" data-act="m-zoom-reset" aria-label="Restablecer escala al 100 por ciento">100 %</button>
         <button class="btn sm malla-ampliar" type="button" data-act="m-ampliar" aria-pressed="${!!M.ampliado}">${M.ampliado?'Salir de pantalla completa':'Pantalla completa'}</button>
       </div>
     </div>
     <div class="card canvas" id="canvas" role="region" tabindex="0" aria-label="Mapa de prerrequisitos con desplazamiento horizontal y vertical">
       <div class="malla-stage" id="malla-stage" style="zoom:${M.zoom}">
         <svg class="edges" id="edges" aria-hidden="true"></svg><div class="mcols" id="mcols">${cols}</div>
       </div>
     </div>
   </section>${mallaSide(L)}</div>
  <div class="legend" style="margin-top:10px"><span><i class="sw" style="background:var(--surface);border:1px solid var(--line2)"></i>con horario (barra = % de combinaciones que chocan)</span><span><i class="sw" style="border:1px dashed var(--line2)"></i>sin horario (no entra al análisis)</span><span><i class="sw" style="background:var(--ca-soft);border:1px solid var(--ca)"></i>requisitos</span><span><i class="sw" style="background:var(--ok-soft);border:1px solid var(--ok)"></i>la requieren</span><span style="color:var(--heat)">⟲ flecha roja punteada = requisito en el mismo semestre o posterior</span></div>`;
}
function mallaSide(L) {
  const n = ui.malla.sel && mallaVisible(S.malla.find(m=>m.n===ui.malla.sel)) ? ui.malla.sel : null;
  if (!n) return `<aside class="card sidecard"><h2>Selecciona una asignatura</h2><p class="hint" style="margin:0">Verás aquí sus requisitos directos e indirectos, lo que abre, y podrás cambiar su semestre o agregar y quitar relaciones.</p><p class="hint" style="margin:0">Los totales de ${S.pre.length} relaciones y ${S.malla.length} asignaturas corresponden al escenario curricular actual.</p></aside>`;
  const m = S.malla.find(x => x.n === n), sc = RV.st[n];
  const dirIn = S.pre.filter(p => p.t === n), dirOut = S.pre.filter(p => p.r === n);
  const indUp = [...L.up.keys()].filter(x => !dirIn.some(p => p.r === x)), indDown = [...L.down.keys()].filter(x => !dirOut.some(p => p.t === x));
  const optsReq = S.malla.filter(c => c.n !== n && !dirIn.some(p => p.r === c.n) && !wouldCycle(S, c.n, n)).sort((a, b) => a.s - b.s || a.n.localeCompare(b.n));
  const optsOut = S.malla.filter(c => c.n !== n && !dirOut.some(p => p.t === c.n) && !wouldCycle(S, n, c.n)).sort((a, b) => a.s - b.s || a.n.localeCompare(b.n));
  const rel = (list, key, other) => list.length ? list.map(p => { const o = p[other], om = S.malla.find(x => x.n === o); const bad = key === 'in' ? om.s >= m.s : om.s <= m.s; return `<div class="it"><span><button style="all:unset;cursor:pointer;text-decoration:underline dotted" data-act="m-sel" data-n="${esc(o)}">${esc(o)}</button> <span class="sem">S${om.s}</span>${bad ? ' <span class="tag heat">mismo sem. o posterior</span>' : ''}</span><button data-act="m-del" data-r="${esc(p.r)}" data-t="${esc(p.t)}" aria-label="Quitar relación" title="Quitar relación">×</button></div>`; }).join('') : '<span class="hint">Ninguno.</span>';
  return `<aside class="card sidecard">
    <div><span class="eyebrow">Asignatura</span><h2 style="font:650 18px/1.25 var(--serif);margin-top:2px"><span class="asig-etiqueta"${atributoTipologia(n)}>${esc(n)}</span></h2></div>
    <div class="row" style="justify-content:space-between"><span class="lab">Créditos</span><span class="stepper"><button data-act="m-cr" data-dx="-1" aria-label="Un crédito menos" ${m.cr <= 0 ? 'disabled' : ''}>−</button><b>${m.cr == null ? '—' : m.cr}</b><button data-act="m-cr" data-dx="1" aria-label="Un crédito más">+</button></span></div>
    <div class="row" style="justify-content:space-between;align-items:center"><span class="lab">Componente</span><select data-chg="m-comp" aria-label="Componente de la asignatura">${(S.tipos?.componentes || []).map(({id,nombre}) => `<option value="${esc(id)}" ${m.comp === id ? 'selected' : ''}>${esc(nombre)}</option>`).join('')}</select></div>
    <div class="row" style="justify-content:space-between;align-items:center"><span class="lab">Carácter</span><select data-chg="m-car" aria-label="Carácter de la asignatura">${[['','No aplica'], ...(S.tipos?.caracteres || []).map(({id,nombre})=>[id,nombre])].map(([k,v]) => `<option value="${esc(k)}" ${m.car === k ? 'selected' : ''}>${esc(v)}</option>`).join('')}</select></div>
    ${ui.malla.equilibrar && mallaVisible(m) && ui.malla.ubicacionesLibres?.get(n) !== undefined && ui.malla.ubicacionesLibres.get(n) !== m.s ? `<div class="hint">Ubicación sugerida: semestre ${ui.malla.ubicacionesLibres.get(n)} · semestre registrado: ${m.s}. La sugerencia solo afecta a este mapa.</div>` : ''}
    ${editorUnidad(n)}
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
/** Dibujar conectores del grafo; solo coordenadas DOM, ninguna regla académica. */
function drawEdges() {
  const cv = $('#canvas'), svg = $('#edges'), cols = $('#mcols'), stage = $('#malla-stage');
  if (!cv || !svg || !cols || !stage) return;
  const M = ui.malla, L = M.sel && mallaVisible(S.malla.find(m=>m.n===M.sel)) ? lineage(S,M.sel) : null;
  // Coordenadas de diseño, NO coordenadas de ventana: el zoom del mapa
  // cambia la escala visual sin desalinear las flechas al desplazarlo.
  const posicionEnMapa = elemento => {
    let x = 0, y = 0, nodo = elemento;
    while (nodo && nodo !== stage) {
      x += nodo.offsetLeft || 0; y += nodo.offsetTop || 0;
      nodo = nodo.offsetParent;
    }
    return { x, y };
  };
  const pos = new Map();
  stage.querySelectorAll('.mcard').forEach(c => {
    const {x,y} = posicionEnMapa(c);
    pos.set(c.dataset.n, { l:x, r:x+c.offsetWidth, y:y+c.offsetHeight/2 });
  });
  const W = cols.scrollWidth + 28, H = cols.scrollHeight + 28;
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

