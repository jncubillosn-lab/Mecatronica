# AUD-075 — Corte de mantenimiento y estabilidad

**Base:** v0.7.5, commit `2985499d25319c13d686e3ac117080afdb250b5f`, 8 de noviembre de 2026.
**Objetivo:** refinar lo existente, cerrar residuos de migración y mantener coherencia con ARQ-01. No añadir funciones, datos supuestos ni obligaciones inexistentes.

## Decisiones del usuario

Solo Bogotá entra en el análisis. Se conservan las otras sedes sin investigarlas en este corte. Nombres de profesores y H05 quedan fuera del alcance. Los vacíos de horarios, fechas y duraciones deben tolerarse sin falsas alarmas, bloqueos por mera ausencia ni valores inventados. Retirar únicamente código cuya obsolescencia esté comprobada, preservando escenarios personales.

Las etiquetas H03–H11 proceden de una revisión anterior. No se trasladan automáticamente sus diagnósticos a 0.7.5 ni se da por cerrada toda la numeración sin contrastar cada descripción original con el código vigente.

## Comprobaciones y mantenimiento

| Tema | Evidencia actual | Tratamiento |
|---|---|---|
| Versión | `index.html` y `js/iniciar.js` declaran 0.7.5; README y EST-01 arrastraban 0.5.x | Corregir referencia vigente y conservar versiones antiguas como historia |
| Entrada única | Arranque carga únicamente `datos/academico.json` | Migración integrada; no crear conversores internos |
| Grupos sin horario (criterio H04) | `compute` calcula choques mediante bloques; un grupo sin bloques no produce choque | Conservar; no fabricar bloques ni excluir grupos por conjetura |
| Contadores de grupos | Los grupos activos analizables, incluso sin bloques, entran en `groupsOf` | Documentar el comportamiento; no cambiar denominadores automáticamente |
| Resiliencia (criterio H03) | Lector admite colecciones vacías; pruebas cubren grupos sin horarios y plan parcial | Ausencia no es defecto; intervalos inválidos informados sí son errores técnicos |
| Históricos usados por pruebas | `tests/fuentes.js` lee cuatro archivos heredados; `tests/verificar.js` lee `js/datos.js` | No eliminar esos archivos en una limpieza ciega |
| Adaptador interno | `iniciar.js` llama `generarEscenarioBase` y `fromRaw` | Conservar: tiene uso productivo real |
| CI | Evento push aún nombraba la rama de migración | Sustituir por `main`, preservando PR y comparación de versión |
| Caché Python | `pruebas/__pycache__/test_normalizador.cpython-312.pyc` versionado | Retirar archivo generado y añadir exclusiones en .gitignore |
| Historial y alcance | Textos hablaban de siete vistas y excluían demanda pese a DEM-01 | Actualizar a ocho vistas y distinguir encuesta personal de demanda institucional |

## Límites de esta revisión

Se inspeccionaron documentos normativos, arranque, lector, motor, pruebas de contrato y consumidores heredados. No se declara una revisión exhaustiva de seguridad, importación, rendimiento ni fechas de vigencia. El motor observado compara día de semana e intervalo horario; este corte no agrega análisis por fechas ni presupone que tal ampliación sea un requisito.

El cierre de la migración de entrada única no significa eliminar la compatibilidad necesaria ni afirmar que todo el repositorio carece de residuos. Las herramientas históricas deben evaluarse por sus usos reales, no confundirse con rutas activas del sitio. Las pruebas existentes se ejecutan en la PR; el resultado de CI debe revisarse por separado.

No se modifican HTML, JS, CSS, contrato académico ni reglas de cálculo en este mantenimiento. La aplicación permanece en 0.7.5. No se borran ramas ni escenarios personales.
