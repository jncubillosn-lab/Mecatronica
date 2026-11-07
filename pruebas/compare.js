// Etapa de comparación: ejecuta original y migrada con el mismo guion de interacciones y compara lo que dibujan.
const http = require('http'), fs = require('fs'), path = require('path'), crypto = require('crypto');
const { JSDOM, VirtualConsole } = require('jsdom');
const KEY = 'interferencias-horarios-v3';
const sleep = ms => new Promise(r => setTimeout(r, ms));
const MIME = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.json': 'application/json' };

function serve(dir, port) {
  return new Promise(res => {
    const s = http.createServer((q, r) => {
      const f = path.join(dir, decodeURIComponent(q.url.split('?')[0]).replace(/\/$/, '/index.html'));
      fs.readFile(f, (e, b) => { if (e) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'content-type': MIME[path.extname(f)] || 'application/octet-stream' }); r.end(b); });
    }).listen(port, () => res(s));
  });
}

async function load(url, presetLS) {
  const errors = [];
  const vc = new VirtualConsole(); vc.on('jsdomError', e => { if (!/Not implemented/.test(e.message)) errors.push(e.message); }); vc.on('error', m => errors.push(String(m)));
  const dom = await JSDOM.fromURL(url, {
    runScripts: 'dangerously', resources: 'usable', pretendToBeVisual: true, virtualConsole: vc,
    beforeParse(w) {
      w.scrollTo = () => {}; w.Element.prototype.scrollIntoView = () => {}; w.__blobs = [];
      w.URL.createObjectURL = b => { w.__blobs.push(b); return 'blob:' + w.__blobs.length; }; w.URL.revokeObjectURL = () => {};
      if (presetLS != null) w.localStorage.setItem(KEY, presetLS);
    },
  });
  await new Promise(r => dom.window.addEventListener('load', r)); await sleep(30);
  return { w: dom.window, errors };
}

const readBlob = (w, b) => new Promise(r => { const f = new w.FileReader(); f.onload = () => r(f.result); f.readAsText(b); });

function helpers(w) {
  const d = w.document, $$ = s => [...d.querySelectorAll(s)];
  const ev = (el, type, init = {}) => el.dispatchEvent(new w.Event(type, { bubbles: true, cancelable: true, ...init }));
  const miss = (s, i) => 'FALTA ' + s + '[' + i + ']';
  return {
    click: (s, i = 0) => { const el = $$(s)[i]; if (!el) return miss(s, i); el.dispatchEvent(new w.MouseEvent('click', { bubbles: true, cancelable: true })); return 'ok'; },
    set: (s, v, type = 'change', i = 0) => { const el = $$(s)[i]; if (!el) return miss(s, i); el.value = v; ev(el, type); return 'ok'; },
    check: (s, v, i = 0) => { const el = $$(s)[i]; if (!el) return miss(s, i); el.checked = v; ev(el, 'change'); return 'ok'; },
    nth: (s, n, i = 0) => { const el = $$(s)[i]; if (!el) return miss(s, i); const o = [...el.options][n]; if (!o) return 'FALTA opción ' + n; el.value = o.value; ev(el, 'change'); return 'ok'; },
    key: k => { d.dispatchEvent(new w.KeyboardEvent('keydown', { key: k, bubbles: true })); return 'ok'; },
    drag: (from, to, i = 0, j = 0) => { const a = $$(from)[i], b = $$(to)[j]; if (!a || !b) return miss(!a ? from : to, !a ? i : j); ev(a, 'dragstart'); ev(b, 'dragover'); ev(b, 'drop'); ev(a, 'dragend'); return 'ok'; },
    count: s => $$(s).length,
  };
}

const nav = p => h => h.click(`[data-act=nav][data-p=${p}]`);
const STEPS = [
  ['inicio', nav('inicio')], ['dist2 on', h => h.click('[data-act=dist][data-d="2"]')], ['dist2 off', h => h.click('[data-act=dist][data-d="2"]')],
  ['dist0 off', h => h.click('[data-act=dist][data-d="0"]')], ['dist0 on', h => h.click('[data-act=dist][data-d="0"]')],
  ['indirect off', h => h.check('[data-chg=indirect]', false)], ['indirect on', h => h.check('[data-chg=indirect]', true)],
  ['nav inter', nav('inter')], ['inter matriz', h => h.click('[data-act=i-view][data-v=matriz]')], ['inter lista', h => h.click('[data-act=i-view][data-v=lista]')],
  ['i-sem', h => h.click('[data-act=i-sem]')], ['i-grav', h => h.click('[data-act=i-grav]')], ['i-dist', h => h.click('[data-act=i-dist]')],
  ['i-q', h => h.set('[data-inp=i-q]', 'est', 'input')], ['i-clear', h => h.click('[data-act=i-clear]')],
  ['i-choque', h => h.check('[data-chg=i-choque]', true)], ['i-sort', h => h.nth('[data-chg=i-sort]', 1)], ['i-asig', h => h.nth('[data-chg=i-asig]', 3)],
  ['i-clear 2', h => h.click('[data-act=i-clear]')], ['csv', h => h.click('[data-act=i-csv]'), 'blob'],
  ['pair-open', h => h.click('[data-act=pair-open]')], ['cell', h => h.click('[data-act=cell]', 2)], ['gtoggle', h => h.click('[data-act=gtoggle]')],
  ['Escape', h => h.key('Escape')], ['drawer-cambios', h => h.click('[data-act=drawer-cambios]')], ['drawer-close', h => h.click('[data-act=drawer-close]')],
  ['nav asig', nav('asig')], ['a-sort 1', h => h.click('[data-act=a-sort]', 1)], ['a-sort 2', h => h.click('[data-act=a-sort]', 2)], ['a-open', h => h.click('[data-act=a-open]')],
  ['inter-go', h => h.click('[data-act=inter-go]')], ['nav asig 2', nav('asig')], ['a-open 3', h => h.click('[data-act=a-open]', 3)], ['hor-go', h => h.click('[data-act=hor-go]')],
  ['nav grupos', nav('grupos')], ['g-sel', h => h.click('[data-act=g-sel]')], ['g-toggle', h => h.click('[data-act=g-toggle]')],
  ['g-add vacío', h => h.click('[data-act=g-add]')], ['g-add G99', h => { const r = h.set('input[placeholder^="Nuevo grupo"]', 'G99', 'input'); return r + h.click('[data-act=g-add]'); }],
  ['g-add repetido', h => { h.set('input[placeholder^="Nuevo grupo"]', 'G99', 'input'); return h.click('[data-act=g-add]'); }],
  ['g-del', h => h.click('[data-act=g-del]')], ['asg-add', h => h.nth('#asg-new', 1) + h.click('[data-act=asg-add]')], ['asg-del', h => h.click('[data-act=asg-del]')],
  ['nav hor', nav('hor')], ['h-pick', h => h.nth('[data-chg=h-pick]', 4)], ['h-addb', h => h.click('[data-act=h-addb]')],
  ['h-day', h => h.set('[data-chg=h-day]', 'J')], ['h-s', h => h.set('[data-chg=h-s]', '10')], ['h-e', h => h.set('[data-chg=h-e]', '9')],
  ['drag bloque', h => h.drag('.hb[data-bid]', '.hc[data-d="V"]', 0, 5)], ['h-comp otra', h => h.click('[data-act=h-comp]', 1)],
  ['h-addc vacío', h => h.click('[data-act=h-addc]')], ['h-addc nuevo', h => h.set('#nc-name', 'Nuevo comp', 'input') + h.click('[data-act=h-addc]')],
  ['h-addc repetido', h => h.set('#nc-name', 'Nuevo comp', 'input') + h.click('[data-act=h-addc]')],
  ['h-ov-add', h => h.nth('[data-chg=h-ov-add]', 2)], ['h-ov-clash', h => h.click('[data-act=h-ov-clash]')], ['h-ov-del', h => h.click('[data-act=h-ov-del]')], ['h-ov-none', h => h.click('[data-act=h-ov-none]')],
  ['h-rename', h => h.set('[data-chg=h-rename]', 'Renombrado', 'change')], ['h-delb', h => h.click('[data-act=h-delb]')], ['h-comp 0', h => h.click('[data-act=h-comp]', 0)], ['h-delc', h => h.click('[data-act=h-delc]')],
  ['nav heat', nav('heat')], ['hm-toggle', h => h.click('[data-act=hm-toggle]', 1)], ['hm-none', h => h.click('[data-act=hm-none]')], ['hm-all', h => h.click('[data-act=hm-all]')],
  ['nav malla', nav('malla')], ['m-sel', h => h.click('[data-act=m-sel]', 4)], ['m-edges', h => h.click('[data-act=m-edges]', 1)], ['m-solo', h => h.check('[data-chg=m-solo]', true)],
  ['m-cr', h => h.click('[data-act=m-cr]', 1)], ['m-sem', h => h.click('[data-act=m-sem]', 1)], ['drag asignatura', h => h.drag('.mcard[data-n]', '.mcol[data-sem="9"]', 3, 0)],
  ['m-addreq', h => h.nth('[data-chg=m-addreq]', 2)], ['m-addopen', h => h.nth('[data-chg=m-addopen]', 3)], ['m-del', h => h.click('[data-act=m-del]')], ['m-inter-go', h => h.click('[data-act=inter-go]')], ['nav malla 2', nav('malla')],
  ['export', h => h.click('[data-act=export]'), 'blob'], ['reset 1', h => h.click('[data-act=reset]')], ['reset 2', h => h.click('[data-act=reset]')],
];

async function snap(w, label, res, wantBlob) {
  await sleep(8);
  const d = w.document, g = s => { const e = d.querySelector(s); return e ? e.innerHTML : null; };
  let blob = null; if (wantBlob && w.__blobs.length) blob = await readBlob(w, w.__blobs[w.__blobs.length - 1]);
  let ls = null; try { ls = w.localStorage.getItem(KEY); } catch (e) { }
  const toast = [...d.querySelectorAll('.toast')].map(x => x.textContent).join('|');
  return { label, res, hash: w.location.hash, top: g('#top'), view: g('#view'), drawer: g('#drawer'), toast, ls, blob };
}

async function recorrer(base) {
  const { w, errors } = await load(base + '/index.html'); const h = helpers(w); const out = [];
  out.push(await snap(w, 'carga inicial', 'ok'));
  for (const [label, fn, flag] of STEPS) {
    let res; try { res = fn(h); } catch (e) { res = 'EXCEPCION ' + e.message; }
    out.push(await snap(w, label, res, flag === 'blob'));
  }
  // importar el escenario exportado
  const exp = out.find(s => s.label === 'export').blob;
  const input = w.document.querySelector('#file-in');
  if (input && exp) { const f = new w.File([exp], 'e.json'); Object.defineProperty(input, 'files', { value: [f], configurable: true }); input.dispatchEvent(new w.Event('change', { bubbles: true })); await sleep(60); }
  out.push(await snap(w, 'import escenario', 'ok'));
  // persistencia: recargar con un escenario guardado
  const lsFinal = out.find(s => s.label === 'import escenario').ls;
  if (input) { const f = new w.File(['esto no es json'], 'x.json'); Object.defineProperty(input, 'files', { value: [f], configurable: true }); input.dispatchEvent(new w.Event('change', { bubbles: true })); await sleep(60); }
  out.push(await snap(w, 'import archivo inválido', 'ok'));
  const viejo = JSON.parse(exp); const S = viejo.S; ['mig1', 'mig2', 'mig3', 'mig4'].forEach(k => delete S[k]);
  S.malla.push({ n: 'Libre elección (X-5)', s: 10, nota: '', cr: 6 }); S.malla.find(m => m.n === 'Libre elección (X-1)').cr = 6;
  S.malla = S.malla.filter(m => m.n !== 'Trabajo de Grado'); S.pre.push({ r: 'Proyecto Aplicado de Ingeniería', t: 'Trabajo de Grado', m: 'agregado' });
  const rv = await load(base + '/index.html', JSON.stringify({ S })); out.push(await snap(rv.w, 'carga con escenario de versión antigua', 'ok')); rv.w.close();
  const r2 = await load(base + '/index.html', lsFinal); out.push(await snap(r2.w, 'recarga con escenario guardado', 'ok'));
  const r3 = await load(base + '/index.html#malla'); out.push(await snap(r3.w, 'carga directa #malla', 'ok'));
  r2.w.close(); r3.w.close(); w.close();
  return { out, errors: errors.concat(r2.errors, r3.errors) };
}

function primeraDif(a, b) { a = String(a); b = String(b); let i = 0; while (i < a.length && a[i] === b[i]) i++; return `pos ${i}: «${a.slice(Math.max(0, i - 40), i + 70)}» vs «${b.slice(Math.max(0, i - 40), i + 70)}»`; }

(async () => {
  const [, , dirA, dirB] = process.argv;
  const sa = await serve(dirA, 8101), sb = await serve(dirB, 8102);
  const A = await recorrer('http://localhost:8101'), B = await recorrer('http://localhost:8102');
  let ok = 0; const difs = [];
  A.out.forEach((x, i) => {
    const y = B.out[i]; const campos = ['res', 'hash', 'top', 'view', 'drawer', 'toast', 'ls', 'blob'].filter(k => x[k] !== y[k]);
    if (!campos.length) ok++; else difs.push({ paso: x.label, campos, ejemplo: primeraDif(x[campos[0]], y[campos[0]]).slice(0, 300) });
  });
  const faltas = A.out.filter(s => String(s.res).startsWith('FALTA') || String(s.res).startsWith('EXC')).map(s => s.label + ' → ' + s.res);
  console.log(`PASOS COMPARADOS: ${A.out.length} | IDÉNTICOS: ${ok} | CON DIFERENCIAS: ${difs.length}`);
  console.log('Errores de script  original:', A.errors.length, '| migrada:', B.errors.length, B.errors.slice(0, 2));
  console.log('Pasos del guion que no encontraron su elemento en el ORIGINAL (cobertura a mejorar):', faltas.length ? '\n  ' + faltas.join('\n  ') : 'ninguno');
  difs.forEach(d => console.log('\n✗', d.paso, '[' + d.campos.join(',') + ']\n   ', d.ejemplo));
  fs.writeFileSync('ultimo_informe.json', JSON.stringify({ total: A.out.length, identicos: ok, difs, faltas }, null, 1));
  const h = s => crypto.createHash('sha256').update(s).digest('hex').slice(0, 12), rd = f => fs.existsSync(f) ? fs.readFileSync(f, 'utf8') : null;
  const ref = rd(path.join(dirA, 'index.html')), css = ref.match(/<style>([\s\S]*?)<\/style>/)[1], js = ref.match(/<script>([\s\S]*?)<\/script>/)[1].replace(/^const RAW=.*\n/m, '');
  const cm = rd(path.join(dirB, 'css/estilos.css')), jm = rd(path.join(dirB, 'js/app.js')), im = rd(path.join(dirB, 'index.html'));
  console.log('\nESTÁTICO  CSS idéntico al original:', cm !== null && h(cm) === h(css), '| JS idéntico al original:', jm !== null && h(jm) === h(js));
  const v = im && im.match(/<span class="pie-version"[^>]*>([^<]+)<\/span>/), mv = im && im.match(/<meta name="version" content="([^"]+)"/);
  console.log('ESTÁTICO  Pie con versión en el HTML:', v ? v[1] : 'NO HAY', '| meta version:', mv ? mv[1] : 'NO HAY', '| coherentes:', !!(v && mv && v[1].includes(mv[1])));
  sa.close(); sb.close(); process.exit(0);
})();
