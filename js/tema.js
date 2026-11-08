'use strict';

/**
 * Tema de presentación independiente de FuentesAcadémicas y de escenarios.
 * El oscuro es predeterminado en todos los sistemas, no depende de la
 * preferencia del navegador. Solo una elección explícita permite modo claro.
 */
(function (root) {
  const CLAVE = 'gestor-horarios-tema-visual';
  function leer() {
    try { return root.localStorage?.getItem(CLAVE) === 'light' ? 'light' : 'dark'; }
    catch (_) { return 'dark'; }
  }
  function actual() {
    return root.document?.documentElement?.dataset.theme === 'light' ? 'light' : 'dark';
  }
  function aplicar(modo, guardar = true) {
    const siguiente = modo === 'light' ? 'light' : 'dark';
    const html = root.document?.documentElement;
    if (html) {
      html.dataset.theme = siguiente;
      html.style.colorScheme = siguiente;
    }
    if (guardar) {
      try { root.localStorage?.setItem(CLAVE, siguiente); }
      catch (_) { /* Safari privado / políticas de almacenamiento. */ }
    }
    return siguiente;
  }
  const API = Object.freeze({ leer, actual, aplicar, alternar: () => aplicar(actual() === 'dark' ? 'light' : 'dark') });
  root.TemaVisual = API;
  if (root.document) aplicar(leer(), false);
  if (typeof module !== 'undefined' && module.exports) module.exports = API;
})(typeof window === 'undefined' ? globalThis : window);
