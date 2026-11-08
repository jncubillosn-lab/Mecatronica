# Historial de versiones

La **versión pública de la aplicación** se consulta en el pie de página y en `index.html` (metadato `version`). Las rutas de JS, CSS y `datos/academico.json` incluyen el mismo parámetro `?v=` para evitar mezclas de versiones en caché. `tests/versionado.js` comprueba esta coherencia y la CI exige incrementar la versión cuando se modifican recursos productivos. El número de versión del sitio **no es** `versionEsquema` (contrato académico) ni `escenario-personal.version` (formato de cambios personales).

## Versiones integradas

- **0.5.3** (7 nov 2026, [PR #13](https://github.com/jncubillosn-lab/Mecatronica/pull/13)): lectura estricta de referencias académicas; extracción del motor a `js/analisis.js` y de las siete vistas a `js/vistas.js`; contexto de ejecución sin `window.RAW`; claves de prerrequisitos por ID con respaldo para escenarios personales antiguos. Sin modificación de la única fuente académica ni de las fórmulas de interferencia.
- **0.5.2** (7 nov 2026, [PR #11](https://github.com/jncubillosn-lab/Mecatronica/pull/11)): documentación técnica junto al código —responsabilidades POO, entrada académica, estado y filtros, migración de escenarios, cálculo y vistas— sin cambiar algoritmos ni datos; actualización coherente del número público y de los parámetros de caché.
- **0.5.1** (7 nov 2026, [PR #9](https://github.com/jncubillosn-lab/Mecatronica/pull/9)): corrección del indicador de versión y caché de recursos, incluida `css/pie.css`; verificación automática para impedir publicar cambios productivos sin incrementar versión.
- **0.5.0** (7 nov 2026, [PR #8](https://github.com/jncubillosn-lab/Mecatronica/pull/8)): migración a ARQ-01: única entrada `datos/academico.json`, lector `EntradaAcademica`, escenarios personales por diferencias, conservación de escenarios históricos y siete secciones. Las agrupaciones de otras sedes se conservan como información, pero no participan en cálculos.
- **0.4.x** (histórico, antes de v0.5.0): aplicación operativa basada en `js/datos.js`/`RAW`; la referencia 0.4.3 tenía 386 grupos y 797 bloques de escenario, con persistencia de escenarios `{S}`. Se conservan las identidades de transición para interpretar escenarios antiguos. Las diferencias globales de interferencias respecto a v0.5.x incluyen cambios deliberados de elegibilidad.
- **0.3.0** (7 nov 2026): barra inferior con versión, contacto y aviso de sitio no oficial. Datos de oferta del SIA normalizados, todavía sin uso en la ejecución de esa versión.
- **0.2.0** (7 nov 2026): separación de la página en `css/`, `js/` y datos generados desde `data/`; se reportaron 87 comparaciones idénticas con el original **en esa etapa histórica**.
- **0.1.0**: página original reunida en un solo `index.html`.

## Cambios documentales sin nueva versión pública

- [PR #10](https://github.com/jncubillosn-lab/Mecatronica/pull/10): consolidó arquitectura, decisiones de alcance, historial de migración, estado, publicación y guía de colaboradores. No cambió el sitio.
- [PR #12](https://github.com/jncubillosn-lab/Mecatronica/pull/12): auditoría de coherencia documental realizada sin modificar archivos de producción ni incrementar la versión 0.5.2.

Para el estado realmente implementado y las verificaciones de publicación, consultar [EST-01](docs/ESTADO-Y-PUBLICACION.md). Las decisiones funcionales y sus motivos están en [DEC-01](docs/DECISIONES-Y-ALCANCE.md); la referencia normativa es [ARQ-01](docs/ARQUITECTURA.md). Los documentos históricos no constituyen entradas académicas adicionales ni autorizan convertir datos dentro de la aplicación.
