'use strict';

/**
 * Mantenimiento recurrente: inventario del árbol Git + controles comprobables.
 * NO modifica ni elimina código. "Clasificado" significa que se conoce su
 * responsabilidad general, no que se haya demostrado ausencia de errores.
 * Los hallazgos estructurales bloquean CI; las sospechas se publican para revisión.
 */
const fs = require('node:fs');
const path = require('node:path');
const cp = require('node:child_process');
const vm = require('node:vm');

const raiz = path.resolve(__dirname, '..');
const carpetas = [
  ['.github/workflows/', 'automatizacion'],
  ['js/', 'aplicacion'],
  ['css/', 'estilos'],
  ['datos/', 'contrato_publicado'],
  ['data/', 'fuentes_externas'],
  ['tests/', 'pruebas_web'],
  ['pruebas/', 'pruebas_externas'],
  ['scripts/', 'herramientas'],
  ['docs/', 'documentacion']
];
const raizPermitida = new Map([
  ['index.html', 'aplicacion'],
  ['README.md', 'documentacion'],
  ['AGENTS.md', 'documentacion'],
  ['CHANGELOG.md', 'historial'],
  ['package.json', 'configuracion'],
  ['package-lock.json', 'configuracion'],
  ['.gitignore', 'configuracion']
]);

function clasificar(archivo) {
  if (raizPermitida.has(archivo)) return raizPermitida.get(archivo);
  const perfil = carpetas.find(([prefijo]) => archivo.startsWith(prefijo));
  if (!perfil) return null;
  if (archivo === 'docs/MIGRACION-ARQ01.md') return 'historial';
  return perfil[1];
}
function inventarioGit(directorio = raiz) {
  return cp.execFileSync('git', ['ls-files', '-z'], {
    cwd: directorio, encoding: 'utf8'
  }).split('\0').filter(Boolean).sort();
}
function encontrarReferencias(archivos, leer) {
  const html = leer('index.html');
  const inicio = leer('js/iniciar.js');
  const delHtml = [...html.matchAll(/<(?:script|link)\b[^>]*\b(?:src|href)="([^"]+)"/g)]
    .map(m => m[1].split('?')[0])
    .filter(p => /^(?:js|css)\/[\w./-]+\.(?:js|css)$/.test(p));
  const delInicio = [...inicio.matchAll(/\b(?:js|datos)\/[\w./-]+\.(?:js|json)\?v=\d+\.\d+\.\d+/g)]
    .map(m => m[0].split('?')[0]);
  const programados = new Set([...delHtml, ...delInicio]);
  const textosEjecutables = archivos.filter(p =>
    p === 'package.json' ||
    p.startsWith('.github/workflows/') ||
    p.startsWith('tests/') ||
    p.startsWith('pruebas/') ||
    p.startsWith('scripts/')).filter(p => /\.(?:json|js|py|yml|yaml|md)$/.test(p))
    .map(p => { try { return leer(p); } catch { return ''; } }).join('\n');
  return { programados, textosEjecutables };
}

function evaluar({ archivos, leer, sha = null }) {
  const hallazgos = [], controles = [];
  const agregar = (id, gravedad, archivo, detalle) => hallazgos.push({id, gravedad, archivo, detalle});
  const entrada = p => { try { return leer(p); } catch (e) {
    agregar('ARCHIVO_NO_LEIBLE', 'error', p, 'Registrado en Git, pero no se pudo leer: '+e.message);
    return '';
  }};
  const clasificados = [];
  const porCategoria = {};
  for (const archivo of archivos) {
    const categoria = clasificar(archivo);
    clasificados.push({archivo,categoria});
    if (categoria) porCategoria[categoria] = (porCategoria[categoria] || 0) + 1;
    else agregar('SIN_CLASIFICAR', 'error', archivo,
      'Archivo fuera de las responsabilidades conocidas; declarar ubicación o retirar explícitamente');
    if (/(^|\/)(?:node_modules|__pycache__|\.auditoria)(?:\/|$)|\.py[cod]$|(^|\/)\.env(?:\.|$)|\.DS_Store$|(^|\/)(?:tmp|temp)\/|(^|\/)ultimo_informe\.json$/i.test(archivo))
      agregar('ARTEFACTO_RESIDUAL', 'error', archivo,
        'Archivo generado, temporal o sensible incluido en Git');
  }
  controles.push({id:'INVENTARIO',detalle:'Clasificación automática de todos los archivos rastreados por Git'});

  const activos = encontrarReferencias(archivos,entrada);
  for (const archivo of archivos) {
    if ((archivo.startsWith('js/') && archivo.endsWith('.js')) ||
        (archivo.startsWith('css/') && archivo.endsWith('.css'))) {
      if (!activos.programados.has(archivo)) agregar('RECURSO_SIN_ENTRADA', 'error', archivo,
        'JS/CSS productivo no enlazado desde index.html ni js/iniciar.js');
    }
  }
  for (const archivo of activos.programados) {
    if (!archivos.includes(archivo)) agregar('ENTRADA_INEXISTENTE', 'error', archivo,
      'index.html o js/iniciar.js solicita un archivo que no figura en el árbol Git');
  }
  const entradasAcademicas = [...activos.programados].filter(p => p.startsWith('datos/'));
  if (entradasAcademicas.length !== 1 || entradasAcademicas[0] !== 'datos/academico.json')
    agregar('CONTRATO_UNICO', 'error', 'js/iniciar.js',
      'Solo debe cargarse datos/academico.json como entrada académica normalizada');
  controles.push({id:'RECURSOS',detalle:'Cobertura de JS/CSS productivo y entrada académica única'});

  let paquete;
  try { paquete = JSON.parse(entrada('package.json')); } catch(e) {
    agregar('CONFIGURACION_INVALIDA','error','package.json','JSON inválido: '+e.message);
    paquete = {scripts:{}};
  }
  const pruebas = String(paquete.scripts?.test || '');
  for (const archivo of archivos.filter(p => /^tests\/[^/]+\.js$/.test(p))) {
    if (!pruebas.includes('node '+archivo)) agregar('PRUEBA_NO_EJECUTADA','error',archivo,
      'Archivo de prueba que no aparece en npm test');
  }
  const workflows = archivos.filter(p => p.startsWith('.github/workflows/'));
  if (!workflows.length) agregar('SIN_CI','error','.github/workflows/','No existe un workflow de verificación');
  if (!archivos.includes('pruebas/test_normalizador.py'))
    agregar('SIN_TEST_NORMALIZADOR','error','pruebas/test_normalizador.py',
      'No se localiza la prueba del normalizador externo');
  else {
    const ci = workflows.map(entrada).join('\n');
    if (!ci.includes('pruebas/test_normalizador.py'))
      agregar('NORMALIZADOR_SIN_CI','error','pruebas/test_normalizador.py',
        'La prueba Python externa no está enlazada desde GitHub Actions');
  }
  controles.push({id:'PRUEBAS',detalle:'Pruebas JS registradas en npm test y normalizador Python conectado con CI'});

  for (const archivo of archivos.filter(p => /^scripts\/[^/]+\.(?:js|py)$/.test(p))) {
    if (!activos.textosEjecutables.includes(archivo))
      agregar('HERRAMIENTA_SIN_CONSUMIDOR','aviso',archivo,
        'No hay referencia textual en comandos, workflows o pruebas; comprobar llamadas indirectas');
  }
  controles.push({id:'HERRAMIENTAS',detalle:'Búsqueda conservadora de consumidores de scripts'});

  for (const archivo of archivos.filter(p => /^(?:js|tests|scripts)\/.*\.js$/.test(p))) {
    const fuente = entrada(archivo);
    try { new vm.Script(fuente,{filename:archivo}); } catch(e) {
      agregar('JAVASCRIPT_INVALIDO','error',archivo,e.message);
    }
  }
  controles.push({id:'SINTAXIS',detalle:'Compilación sintáctica de los archivos JavaScript rastreados'});

  const documentos = archivos.filter(p => p.endsWith('.md'));
  const vinculados = new Set();
  for (const origen of documentos) {
    const texto = entrada(origen);
    for (const m of texto.matchAll(/\[[^\]\n]*\]\(([^)\n]+)\)/g)) {
      let destino=m[1].replace(/^<|>$/g,'').split('#')[0].trim();
      if (!destino || /^(?:https?:|mailto:|data:)/i.test(destino)) continue;
      try {
        destino = decodeURIComponent(destino);
        const relativo = path.posix.normalize(path.posix.join(path.posix.dirname(origen),destino));
        vinculados.add(relativo);
      } catch { /* El test de enlaces documentales valida rutas malformadas */ }
    }
  }
  for (const archivo of documentos.filter(p => p.startsWith('docs/'))) {
    if (!vinculados.has(archivo))
      agregar('DOCUMENTO_SIN_REFERENCIAS','aviso',archivo,
        'No se encontraron enlaces entrantes desde otros documentos; comprobar si es vigente o archivo histórico');
  }
  controles.push({id:'DOCUMENTOS',detalle:'Detecta documentos sin referencias; el test de enlaces valida los destinos'});

  const documentoActivo=['README.md','AGENTS.md','docs/ESTADO-Y-PUBLICACION.md'];
  for(const archivo of documentoActivo) {
    const texto=entrada(archivo);
    for (const [clave,rx] of [
      ['MIGRACION_PENDIENTE',/\b(?:la\s+)?migraci[oó]n\s+(?:se\s+prepara|sigue\s+pendiente)\b/i],
      ['VERSION_SIN_DECLARAR',/versi[oó]n\s+(?:general\s+)?1\.0\.0\s+(?:todav[ií]a\s+)?no\s+(?:ha\s+sido\s+)?declarada/i]
    ]) {
      if(rx.test(texto)) agregar(clave,'aviso',archivo,
        'Afirmación posiblemente obsoleta en documento operativo');
    }
  }
  controles.push({id:'VIGENCIA',detalle:'Señales limitadas de documentación obsoleta, no revisión semántica'});

  const total=archivos.length, sinClasificar=clasificados.filter(x=>!x.categoria).length;
  const errores=hallazgos.filter(x=>x.gravedad==='error').length;
  const avisos=hallazgos.filter(x=>x.gravedad==='aviso').length;
  return {
    esquema:1, revision:sha, generado:new Date().toISOString(),
    cobertura:{archivosRastreados:total, archivosClasificados:total-sinClasificar,
      categorias:porCategoria, documentos:documentos.length, activos:activos.programados.size},
    controles, hallazgos, resumen:{errores,avisos},
    limites:[
      'Clasificación por ruta no equivale a revisión semántica ni a prueba de uso real.',
      'Una referencia textual no demuestra que una función sea alcanzable; la ausencia de referencia puede ser llamada dinámica.',
      'La auditoría local no confirma la calidad institucional de los datos ni el comportamiento visual del navegador.',
      'La protección de main y las ramas remotas se revisan por separado con la API de GitHub.',
      'Los avisos no autorizan borrar archivos; requieren evidencia verificable.'
    ],
    inventario:clasificados
  };
}

function markdown(r) {
  const l=[
    '# Auditoría automática del repositorio',
    '',
    '**Commit:** '+(r.revision || 'ejecución local'),
    '**Fecha:** '+r.generado,
    '**Archivos rastreados:** '+r.cobertura.archivosRastreados,
    '**Clasificados por responsabilidad:** '+r.cobertura.archivosClasificados+' de '+r.cobertura.archivosRastreados,
    '**Errores bloqueantes:** '+r.resumen.errores,
    '**Avisos para revisión:** '+r.resumen.avisos,
    '',
    '## Controles ejecutados',
    ...r.controles.map(c=>'- **'+c.id+'**: '+c.detalle),
    '',
    '## Hallazgos'
  ];
  if(!r.hallazgos.length)l.push('Sin hallazgos de estos controles; esto NO demuestra ausencia de defectos.');
  else l.push(...r.hallazgos.map(h=>'- **'+h.gravedad.toUpperCase()+' / '+h.id+'** — '+
    h.archivo+': '+h.detalle));
  l.push('','## Límites de esta comprobación',...r.limites.map(t=>'- '+t));
  return l.join('\n')+'\n';
}

function escribir(r, destino=path.join(raiz,'.auditoria')) {
  fs.mkdirSync(destino,{recursive:true});
  fs.writeFileSync(path.join(destino,'reporte.json'),JSON.stringify(r,null,2)+'\n');
  fs.writeFileSync(path.join(destino,'resumen.md'),markdown(r));
  if(process.env.GITHUB_STEP_SUMMARY)
    fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY,markdown(r));
}

function main(){
  const archivos=inventarioGit();
  const r=evaluar({
    archivos,
    leer:p=>fs.readFileSync(path.join(raiz,p),'utf8'),
    sha:process.env.GITHUB_SHA||null
  });
  escribir(r);
  console.log('Auditoría: '+r.cobertura.archivosClasificados+'/'+r.cobertura.archivosRastreados+
    ' archivos clasificados; '+r.resumen.errores+' errores; '+r.resumen.avisos+' avisos.');
  for(const h of r.hallazgos)console.log(h.gravedad.toUpperCase()+
    ' '+h.id+' '+h.archivo+' — '+h.detalle);
  if(r.resumen.errores)process.exitCode=1;
}
if(require.main===module) main();
module.exports={clasificar,inventarioGit,encontrarReferencias,evaluar,markdown,escribir};
