# Guía de trabajo para agentes y colaboradores

**Referencias obligatorias antes de trabajar:** [ARQ-01 — arquitectura](docs/ARQUITECTURA.md) · [DEC-01 — decisiones y alcance](docs/DECISIONES-Y-ALCANCE.md) · [EST-01 — estado y publicación](docs/ESTADO-Y-PUBLICACION.md). El historial está en [MIG-ARQ01](docs/MIGRACION-ARQ01.md).

## Antes de cualquier cambio

- Leer ARQ-01 y verificar qué capa del sistema se verá afectada.
- **Desde la migración integrada v0.5.0, la única entrada académica es FuentesAcadémicas, representada por `datos/academico.json`.** La interfaz puede usar una proyección interna `RAW` generada desde ese contrato, nunca otra entrada.
- La extracción y conversión desde catálogo, oferta de horarios y malla sucede **íntegramente fuera del sistema**. No incorporar lectores, conversores, cargadores ni conexiones paralelas desde esos archivos a la aplicación.
- El sistema consume el contrato común, no el formato de las fuentes ni archivos históricos `js/catalogo.js`, `js/oferta-fuente.js` o `js/datos.js`. Se conservan en el repositorio como **archivos de referencia heredados**, pero la aplicación migrada no los carga.
- Los nombres, créditos, requisitos, tipologías, componentes, calendarios y vínculos académicos son **datos**, no constantes universales programadas.
- Aceptar información incompleta sin inventar valores ni generar avisos de alerta por su ausencia. Distinguir un vacío académico válido de un error técnico del contrato; el dato ausente no bloquea ni crea falsos choques.
- Los grupos de actividad no se combinan salvo relación explícita del contrato.
- Los grupos de otras sedes se conservan; `agrupaciones[].analizable === false` los excluye de cálculos sin borrarlos. No inferir esa propiedad por prefijos dentro del programa.
- Mantener separadas las modificaciones personales del escenario y los datos de referencia académica. No modificar nombres, horas, grupos, créditos o referencias académicas sin evidencia y sin justificar cualquier diferencia.
- Todas las vistas, cuadros de detalle, cálculos y exportaciones deben respetar la misma selección activa de información.
- Preservar funcionamiento estático y compatibilidad con los escenarios anteriores. Mantener las siete secciones, filtros, edición, mapa de calor, CSV, exportación/importación y restablecimiento.

## Ejecución y revisión

1. Distinguir **estado actual** de **arquitectura objetivo** antes de proponer implementaciones.
2. Preferir actualizar únicamente los datos normalizados cuando cambie información académica.
3. Justificar cualquier cambio del contrato o de la frontera arquitectónica **antes de implementarlo** y actualizar ARQ-01.
4. Verificar integridad de cobertura fuente normalizada → escenario → resultados y comparar días/horas, no solo números de registros.
5. No modificar automáticamente la arquitectura ni añadir nuevos componentes por interpretación; mantener POO como separación de responsabilidades, no como proliferación de clases.
6. **No atribuir objetivos que el proyecto no ha establecido.** La falta de funciones no solicitadas no es un defecto; cualquier recomendación técnica debe demostrar efecto real sobre el alcance existente.
7. Ejecutar `npm ci && npm test` cuando corresponda y comprobar el resultado de GitHub Actions antes de fusionar. Una prueba `jsdom` no reemplaza la revisión visual cuando cambie una vista.
8. **Incrementar y sincronizar la versión pública** si cambian recursos HTML, JS, CSS o JSON; comprobar el pie de página, el `<meta name="version">` y los parámetros `?v=` del HTML y de `js/iniciar.js`. La CI incluye `tests/versionado.js`; los cambios solo documentales no requieren incremento.
9. Tras fusionar, distinguir resultado de CI, contenido de `main` y despliegue realmente servido por GitHub Pages; no afirmar lo último sin comprobarlo.

Si hay contradicción entre README o código heredado y ARQ-01, **ARQ-01 gobierna la arquitectura**. DEC-01 registra decisiones de alcance y EST-01 refleja el estado real; ninguna propuesta futura se considera aprobada por aparecer en un ejemplo. El funcionamiento existente solo puede reemplazarse mediante una modificación consciente, justificada y probada.
