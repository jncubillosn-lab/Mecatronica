'use strict';

/**
 * ARQ-01: una única entrada FuentesAcadémicas normalizada por contexto.
 * Seleccionar carrera resuelve la ruta del contrato externo; no transforma
 * documentos institucionales ni crea una oferta académica vacía ficticia.
 */
(async function iniciar() {
  const programas = window.ProgramasUniversitarios;
  const seleccionado = programas.desdeBusqueda(window.location.search);
  const rutaAcademica = programas.fuentePara(seleccionado);

  window.IdentidadUniversitaria.aplicarTema(seleccionado);
  if (!rutaAcademica) {
    // No hay archivo para esta carrera, NO equivalen a cero las asignaturas.
    const mostrar = () => programas.mostrarEstado(seleccionado, 'sin-datos');
    window.addEventListener('hashchange', mostrar);
    mostrar();
    return;
  }

  try {
    // Una sola consulta a la ruta declarada. La herramienta externa del SIA
    // no se carga en el navegador y nunca se usa otra carrera como respaldo.
    const respuesta = await fetch(rutaAcademica + '?v=1.1.0');
    if (!respuesta.ok) throw new Error('HTTP ' + respuesta.status);
    const contrato = await respuesta.json();
    if (contrato?.programa?.id !== seleccionado)
      throw new Error('El contrato no corresponde al programa seleccionado');
    const lector = new EntradaAcademica(contrato);
    const proyeccion = lector.generarEscenarioBase();
    window.IdentidadUniversitaria.aplicarTema(proyeccion.programa);
    window.CONTEXTO_ACADEMICO = {
      programa: proyeccion.programa,
      calendario: proyeccion.calendario,
      opciones: proyeccion.opciones,
      almacenamiento: {
        clave: programas.claveEscenario(seleccionado, proyeccion.almacenamiento.clave)
      },
      metadatos: proyeccion.metadatos,
      estadoBase: fromRaw(proyeccion)
    };
    // El núcleo y sus ocho vistas arrancan SOLO si existe contrato validado.
    const script = document.createElement('script');
    script.src = 'js/app.js?v=1.1.0';
    script.onerror = () => {
      console.error('No se pudo cargar la interfaz académica');
      programas.mostrarEstado(seleccionado, 'error');
    };
    document.body.appendChild(script);
  } catch (error) {
    console.error('Error técnico al leer la entrada académica normalizada:', error);
    const mostrar = () => programas.mostrarEstado(seleccionado, 'error', true);
    window.addEventListener('hashchange', mostrar);
    mostrar();
  }
})();
