'use strict';

/**
 * ARQ-01: un solo punto de entrada de información académica.
 * La carga no conoce ni consulta catálogo/oferta/malla en sus formatos anteriores.
 */
(async function iniciar() {
  const contenedor = document.getElementById('view');
  try {
    const respuesta = await fetch('datos/academico.json?v=0.5.0');
    if (!respuesta.ok) throw new Error('No se pudo consultar el contrato académico');
    const contrato = await respuesta.json();
    const lector = new EntradaAcademica(contrato);
    // Proyección transitoria hacia las funciones existentes. NO es otra fuente.
    window.RAW = lector.generarEscenarioBase();
    window.fuentesAcademicas = lector;
    const script = document.createElement('script');
    script.src = 'js/app.js?v=0.5.0';
    script.onerror = () => {
      if (contenedor) contenedor.textContent = 'No se pudo cargar la interfaz de planeación.';
    };
    document.body.appendChild(script);
  } catch (error) {
    if (contenedor) {
      contenedor.textContent = 'No fue posible abrir los datos académicos de esta versión. Comprueba la conexión y vuelve a cargar la página.';
    }
    console.error('Error técnico al leer la entrada académica normalizada:', error);
  }
})();
