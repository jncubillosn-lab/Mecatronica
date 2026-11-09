'use strict';

/**
 * ARQ-01: un solo punto de entrada de información académica.
 * La carga no conoce ni consulta catálogo/oferta/malla en sus formatos anteriores.
 * El motor puro (analisis.js) debe haberse cargado antes de este arranque.
 */
(async function iniciar() {
  const contenedor = document.getElementById('view');
  try {
    // ÚNICA petición de información académica: el sitio no carga las tres
    // fuentes originales ni genera datos institucionales faltantes.
    const respuesta = await fetch('datos/academico.json?v=0.7.7');
    if (!respuesta.ok) throw new Error('No se pudo consultar el contrato académico');
    const contrato = await respuesta.json();
    const lector = new EntradaAcademica(contrato);
    // Se construye una sola vez un escenario base desde el contrato. La
    // proyección posicional es transitoria y NO se expone como entrada global.
    // fromRaw construye S0 y permite conservar compatibilidad de escenarios.
    const proyeccion = lector.generarEscenarioBase();
    // El tema procede del ID del programa ya normalizado; no introduce otra entrada.
    window.IdentidadUniversitaria.aplicarTema(proyeccion.programa);
    window.CONTEXTO_ACADEMICO = {
      programa: proyeccion.programa,
      calendario: proyeccion.calendario,
      opciones: proyeccion.opciones,
      almacenamiento: proyeccion.almacenamiento,
      metadatos: proyeccion.metadatos,
      incrementosOferta: proyeccion.incrementosOferta,
      estadoBase: fromRaw(proyeccion)
    };
    // Este lector solo se conserva para migrar escenarios personales antiguos;
    // no vuelve a leer fuentes académicas ni incorpora otra ruta de entrada.
    window.fuentesAcademicas = lector;
    const script = document.createElement('script');
    // La interfaz se carga DESPUÉS del contrato y recibe CONTEXTO_ACADEMICO.
    // Las versiones ?v= de esta ruta, del JSON y de `index.html` deben
    // coincidir con el número público; lo comprueba `tests/versionado.js`.
    script.src = 'js/app.js?v=0.7.7';
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
