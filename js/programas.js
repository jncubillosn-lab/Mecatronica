'use strict';

/**
 * Selector de programa y disponibilidad académica.
 * Reutiliza exclusivamente el catálogo de presentación de IdentidadUniversitaria;
 * aquí se registran SOLO rutas de FuentesAcadémicas disponibles, nunca
 * asignaturas, horarios ni fuentes institucionales sin normalizar.
 * La selección cambia el contexto de arranque, no el motor del programa.
 */
(function (global) {
  const identidad = global.IdentidadUniversitaria ||
    (typeof require === 'function' ? require('./identidad.js') : null);
  if (!identidad) throw new Error('Falta el catálogo de identidad universitaria');

  const fuentes = Object.freeze({
    mecatronica: 'datos/academico.json'
  });
  const paginas = Object.freeze([
    ['inicio','Inicio'],['inter','Interferencias'],['asig','Asignaturas'],
    ['grupos','Grupos'],['hor','Horarios'],['heat','Mapa de calor'],
    ['demanda','Demanda'],['malla','Prerrequisitos']
  ].map(p => Object.freeze(p)));
  const ids = Object.freeze(Object.keys(identidad.catalogo));
  const principal = 'mecatronica';

  function resolver(id) {
    const elegido = identidad.temaParaPrograma(id).id;
    return Object.hasOwn(identidad.catalogo, elegido) ? elegido : principal;
  }
  function desdeBusqueda(busqueda) {
    return resolver(new URLSearchParams(busqueda || '').get('programa'));
  }
  function fuentePara(id) {
    return Object.hasOwn(fuentes, id) ? fuentes[id] : null;
  }
  function urlPara(id, actual) {
    const url = new URL(actual);
    const programa = resolver(id);
    if (programa === principal) url.searchParams.delete('programa');
    else url.searchParams.set('programa', programa);
    return url.href;
  }
  function claveEscenario(id, claveContrato) {
    // Mantener intacta la clave ya usada por usuarios de Mecatrónica.
    if (id === principal) return claveContrato;
    // Una clave institucional mal configurada jamás mezcla carreras.
    return 'escenario-personal:' + resolver(id);
  }

  /** Único componente de cabecera reutilizado por el programa y el estado vacío. */
  function cabecera(id) {
    const programa = resolver(id);
    const opciones = ids.map(k => {
      const meta = identidad.catalogo[k];
      const estado = fuentePara(k) ? '' : ' · sin datos';
      return '<option value="' + k + '"' +
        (programa === k ? ' selected' : '') + '>' +
        meta.nombre + estado + '</option>';
    }).join('');
    return '<div class="brand-wrap">' +
      '<div class="brand"><b>Gestor de horarios</b><span>Comunidad UNAL · sitio no oficial</span></div>' +
      '<div class="programa-actual">' +
        '<span class="programa-senal" aria-hidden="true"></span>' +
        '<label class="programa-etiqueta" for="selector-programa">' +
          '<small>Programa académico</small>' +
          '<select id="selector-programa" aria-label="Seleccionar carrera">' + opciones + '</select>' +
        '</label>' +
      '</div></div>';
  }
  function paginaActual(hash) {
    const pagina = String(hash || '').replace(/^#/, '');
    return paginas.some(([id]) => id === pagina) ? pagina : 'inicio';
  }
  function mostrarEstado(id, clase, detalle) {
    if (!global.document) return;
    const d = global.document;
    const programa = resolver(id);
    const meta = identidad.catalogo[programa];
    const pagina = paginaActual(global.location?.hash);
    const nombrePagina = paginas.find(([k]) => k === pagina)[1];
    const navegacion = paginas.map(([k, nombre]) =>
      '<a href="#' + k + '"' + (pagina === k ? ' aria-current="page"' : '') +
      '>' + nombre + '</a>').join('');
    const cab = d.getElementById('top');
    if (cab) cab.innerHTML = '<div class="top-in">' + cabecera(programa) +
      '<nav class="nav" aria-label="Secciones">' + navegacion + '</nav></div>';
    const vista = d.getElementById('view');
    if (vista) {
      const titulo = clase === 'sin-datos' ? 'Información académica no disponible' :
        'No fue posible cargar los datos académicos';
      const mensaje = clase === 'sin-datos'
        ? 'Todavía no se han incorporado datos normalizados de esta carrera. ' +
          'Esto no significa que no existan asignaturas, grupos u horarios.'
        : 'Se produjo un error técnico al leer o validar la fuente del programa. ' +
          'Los datos no se han sustituido por información de otra carrera.';
      vista.innerHTML = '<section class="card programa-sin-datos" role="status">' +
        '<div class="eyebrow">' + nombrePagina + ' · ' + meta.nombre + '</div>' +
        '<h1>' + titulo + '</h1><p>' + mensaje + '</p>' +
        (detalle ? '<p class="faint">Prueba de nuevo más tarde o selecciona otra carrera.</p>' : '') +
        '</section>';
    }
    const pie = d.getElementById('pie-datos');
    if (pie) pie.textContent = clase === 'sin-datos'
      ? 'Sin datos académicos cargados para ' + meta.nombre + '.'
      : 'Fuente académica no disponible por error técnico.';
    d.title = 'Gestor de horarios · ' + meta.nombre;
  }

  if (global.document?.addEventListener) {
    global.document.addEventListener('change', e => {
      const selector = e.target?.closest?.('#selector-programa');
      if (!selector) return;
      const destino = resolver(selector.value);
      if (destino === desdeBusqueda(global.location.search)) return;
      global.location.assign(urlPara(destino, global.location.href));
    });
  }

  const api = Object.freeze({
    fuentes, paginas, ids, resolver, desdeBusqueda, fuentePara,
    urlPara, claveEscenario, cabecera, paginaActual, mostrarEstado
  });
  global.ProgramasUniversitarios = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window === 'undefined' ? globalThis : window);
