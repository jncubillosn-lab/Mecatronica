'use strict';

/**
 * ARQ-01: un solo punto de entrada de información académica.
 * La carga no conoce ni consulta catálogo/oferta/malla en sus formatos anteriores.
 */
(async function iniciar() {
  const contenedor = document.getElementById('view');
  try {
    // ÚNICA petición de información académica: el sitio no carga las tres
    // fuentes originales ni genera datos institucionales faltantes.
    const respuesta = await fetch('datos/academico.json?v=0.5.2');
    if (!respuesta.ok) throw new Error('No se pudo consultar el contrato académico');
    const contrato = await respuesta.json();
    const lector = new EntradaAcademica(contrato);
    // Proyección transitoria hacia las funciones existentes. NO es otra fuente.
    // `RAW` es solo la proyección de compatibilidad en memoria; la referencia
    // académica y su procedencia siguen estando únicamente en el contrato.
    window.RAW = lector.generarEscenarioBase();
    window.fuentesAcademicas = lector;
    const script = document.createElement('script');
    // La interfaz se carga DESPUÉS del contrato: `app.js` presupone `RAW`.
    // Las versiones ?v= de esta ruta, del JSON y de `index.html` deben
    // coincidir con el número público; lo comprueba `tests/versionado.js`.
    script.src = 'js/app.js?v=0.5.2';
    script.onerror = () => {
      if (contenedor) contenedor.textContent = 'No se pudo cargar la interfaz de planeación.';
    };
    document.body.appendChild(script);
  } catch (error) {
    // Error técnico de carga o lectura; no es un aviso por datos académicos
    // legítimamente incompletos. No sustituir el contrato por el JS histórico.
    if (contenedor) {
      contenedor.textContent = 'No fue posible abrir los datos académicos de esta versión. Comprueba la conexión y vuelve a cargar la página.';
    }
    console.error('Error técnico al leer la entrada académica normalizada:', error);
  }
})();
