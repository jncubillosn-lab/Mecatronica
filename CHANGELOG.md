# Historial de versiones

La **versión pública de la aplicación** se consulta en el pie de página y en `index.html` (metadato `version`). Las rutas de JS, CSS y `datos/academico.json` incluyen el mismo parámetro `?v=` para evitar mezclas de versiones en caché. `tests/versionado.js` comprueba esta coherencia y la CI exige incrementar la versión cuando se modifican recursos productivos. El número de versión del sitio **no es** `versionEsquema` (contrato académico) ni `escenario-personal.version` (formato de cambios personales).

## Preparación técnica 1.0.0 (sin declarar versión estable)

- **0.7.7 — [PR #32](https://github.com/jncubillosn-lab/Mecatronica/pull/32)**: los cuatro módulos de datos/lectura `RAW` antiguos se trasladaron íntegros a `pruebas/historico/js/`; se actualizaron las pruebas históricas, se eliminó un `__pycache__` generado y se añadieron barreras para evitar su vuelta a producción. **La publicación debe verificarse tras la fusión.**

- **0.7.6 — [PR #31](https://github.com/jncubillosn-lab/Mecatronica/pull/31)**: se retiró la llamada `fixMalla(S0)` del arranque después de comparar el escenario normalizado antes/después. La única diferencia comprobada eran las marcas históricas `mig1`–`mig4`. Se preservan `fixMalla(anterior)` y la ruta `{S}` para escenarios heredados. Esta entrada registra el cambio propuesto en la PR; **su despliegue se verifica después de fusionar**.
- **Sin nueva versión pública:** [PR #29](https://github.com/jncubillosn-lab/Mecatronica/pull/29), actualización documental; [PR #30](https://github.com/jncubillosn-lab/Mecatronica/pull/30), separación de pruebas vigentes y `RAW` heredado.

## Cambios posteriores al corte 0.5.5 (integrados y documentados)

Las fechas y números se verificaron contra las PR fusionadas. **Estas notas describen hitos pasados**, no una nueva versión pública.

- **0.7.5** — [PR #26](https://github.com/jncubillosn-lab/Mecatronica/pull/26), 8 nov 2026: tonos discretos B/C/L/N por asignatura en ocho páginas, bordes ligeramente más contrastados y pruebas visuales de estructura.
- **0.7.4** — [PR #25](https://github.com/jncubillosn-lab/Mecatronica/pull/25), 8 nov 2026: persistencia de requisitos por cambios de ID y propiedad; escenarios antiguos ambiguos con revisión individual, sin excepciones por materia.
- **0.7.3** — [PR #24](https://github.com/jncubillosn-lab/Mecatronica/pull/24), 8 nov 2026: TPI (SIA 2024045) 52 créditos C y PAI (SIA 2017275) 65 créditos C; códigos, créditos de materia y Trabajo de Grado intactos.
- **0.7.2** — [PR #23](https://github.com/jncubillosn-lab/Mecatronica/pull/23), 8 nov 2026: oscuro predeterminado, modo claro opcional y altura intrínseca de la malla.
- **0.7.1** — [PR #22](https://github.com/jncubillosn-lab/Mecatronica/pull/22), 8 nov 2026: representación de posiciones L en Prerrequisitos y reparto visual equilibrado, sin alterar datos.
- **0.7.0** — [PR #21](https://github.com/jncubillosn-lab/Mecatronica/pull/21), 8 nov 2026: diseño adaptable, ampliación/zoom de prerrequisitos y mejoras de lectura de Demanda.
- **0.6.0** — [PR #20](https://github.com/jncubillosn-lab/Mecatronica/pull/20), 8 nov 2026: identidad visual compartida y acentos configurados por programa; sin incorporar programas nuevos.
- **0.5.9** — [PR #19](https://github.com/jncubillosn-lab/Mecatronica/pull/19), 8 nov 2026: identificar asignatura al seleccionar punto de Demanda.
- **0.5.8** — [PR #18](https://github.com/jncubillosn-lab/Mecatronica/pull/18), 8 nov 2026: cuadrantes y lectura reforzada de Demanda.
- **0.5.7** — [PR #17](https://github.com/jncubillosn-lab/Mecatronica/pull/17), 8 nov 2026: demostración simulada de demanda y recomendaciones descriptivas.
- **0.5.6** — [PR #16](https://github.com/jncubillosn-lab/Mecatronica/pull/16), 8 nov 2026: octava página Demanda de preinscripción, sin requerir cupos ni datos históricos.

**Preparación del corte 1.0 (solo documentación):** [PR #28](https://github.com/jncubillosn-lab/Mecatronica/pull/28) integra principios, RF/RC y límites a ARQ-01, sin modificar la aplicación ni declarar 1.0.0.

## Versiones integradas

- **0.5.5** (7 nov 2026, [PR #15](https://github.com/jncubillosn-lab/Mecatronica/pull/15)): referencia académica de TPI simplificada voluntariamente a un único grupo G1, lunes y miércoles de 14:00 a 16:00. Se retiran 21 alternativas de la oferta normalizada y las agrupaciones, sin modificar otras asignaturas ni el motor. Se actualizan pruebas y versión pública.

- **0.5.4** (7 nov 2026, [PR #14](https://github.com/jncubillosn-lab/Mecatronica/pull/14)): filtro de tipología visible y operativo en las siete páginas; filtro adicional por unidad académica responsable. Cada asignatura puede registrar voluntariamente un departamento de Ingeniería o facultad, incluso sin docente, y conservarlo al exportar/importar escenarios. La entrada `datos/academico.json` y el formato de escenario versión 1 no cambian.
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
