'use strict';

/**
 * Identidad visual, independiente de FuentesAcadémicas (ARQ-01).
 *
 * Las claves son IDs de presentación, NO una oferta de carreras cargadas:
 * únicamente el contrato académico determina qué programa se puede consultar.
 * Los acentos provienen del afiche estudiantil 2026-2028 y NO se presentan
 * como colores oficiales asignados por la Universidad a sus programas.
 */
(function (global) {
  const colores = {
    electrica:      { nombre: 'Ingeniería Eléctrica', color: '#7C3AED' },
    electronica:    { nombre: 'Ingeniería Electrónica', color: '#00A36C' },
    civil:          { nombre: 'Ingeniería Civil', color: '#D6452B' },
    agricola:       { nombre: 'Ingeniería Agrícola', color: '#8CC63F' },
    sistemas:       { nombre: 'Ingeniería de Sistemas y Computación', color: '#FFD23F' },
    industrial:     { nombre: 'Ingeniería Industrial', color: '#F2A900' },
    mecanica:       { nombre: 'Ingeniería Mecánica', color: '#7B8CA0' },
    mecatronica:    { nombre: 'Ingeniería Mecatrónica', color: '#FF5F1F' },
    quimica:        { nombre: 'Ingeniería Química', color: '#FFFFFF', borde: '#8793A2' }
  };
  const alias = Object.freeze({
    'sistemas-y-computacion': 'sistemas',
    'ingenieria-de-sistemas-y-computacion': 'sistemas'
  });
  const catalogo = Object.freeze(Object.fromEntries(
    Object.entries(colores).map(([id, valor]) => [id, Object.freeze({ id, ...valor })])
  ));
  const neutro = Object.freeze({
    id: 'sin-definir', nombre: 'Programa académico',
    color: '#5D7081', borde: '#5D7081'
  });

  /** Solo usa el ID explícito; nunca deduce la carrera de asignaturas o profesores. */
  function temaParaPrograma(programa) {
    const id = typeof programa === 'string' ? programa : programa?.id;
    if (typeof id !== 'string') return neutro;
    const clave = id.trim().toLowerCase().normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    return catalogo[alias[clave] || clave] || neutro;
  }

  /**
   * Aplica exclusivamente propiedades CSS de presentación.
   * No cambia la entrada académica, el escenario ni el almacenamiento.
   */
  function aplicarTema(programa, raiz) {
    const tema = temaParaPrograma(programa);
    const nodo = raiz || (typeof document === 'undefined' ? null : document.documentElement);
    if (nodo) {
      nodo.dataset.programa = tema.id;
      nodo.style.setProperty('--programa-acento', tema.color);
      nodo.style.setProperty('--programa-borde', tema.borde || tema.color);
    }
    return tema;
  }

  const identidad = Object.freeze({ catalogo, temaParaPrograma, aplicarTema });
  global.IdentidadUniversitaria = identidad;
  if (typeof module !== 'undefined' && module.exports) module.exports = identidad;
})(typeof window === 'undefined' ? globalThis : window);
