# Pruebas de fidelidad — utilidades históricas

> **Archivo histórico de una migración CERRADA en v0.8.0.** Se conserva para comprender y verificar la versión original; no constituye una entrada ni un proceso de conversión del sitio. CI ejecuta **por separado** `npm test` (contrato actual) y `npm run test:historico` (fixtures archivados). La historia y el acta final constan en [MIG-ARQ01](../docs/MIGRACION-ARQ01.md).

**Archivos archivados en 0.7.7:** `historico/js/` conserva las copias verificadas de `datos.js`, `catalogo.js`, `oferta-fuente.js` y `fuentes.js`. No forman parte de los scripts cargados por el sitio. Las pruebas `tests/verificar.js`, `tests/filtros.js` y `tests/fuentes.js` consultan esta ubicación al ejecutar `npm run test:historico`. El `js/datos.js` generado dentro de `mut/` por `mutar.sh` es un artefacto temporal de una herramienta histórica, no una ruta productiva.

## Qué contiene este directorio

- `referencia/index.html`: copia congelada del sitio original. **No editarla**.
- `compare.js`: ejecuta un guion de unas 87 interacciones en `jsdom` sobre la referencia y una versión candidata; registra diferencias de HTML, escenarios y respuestas a eventos. Conservado exclusivamente como herramienta original; el comando npm fue retirado en 0.8.0.
- `mutar.sh`: prueba histórica de sensibilidad del comparador; genera variantes a través de `scripts/generar_datos.py`. Conservado como archivo histórico; el comando npm fue retirado en 0.8.0.

## Límites verificados de estas herramientas

1. **No se exige igualdad textual con la versión original.** Desde v0.5.0, la selección de agrupaciones elegibles se modificó deliberadamente y la interfaz incorpora una entrada normalizada. Diferencias de resultados entre poblaciones distintas **no prueban un error**. Para evaluar la equivalencia del algoritmo hay que utilizar exactamente los mismos grupos elegibles.
2. **`compare.js` imprime diferencias, pero termina mediante `process.exit(0)` incluso cuando las encuentra.** Por ello no es una puerta de CI ni debe considerarse una prueba aprobada basándose en su código de salida.
3. **`mutar.sh` altera datos generados en el formato heredado `js/datos.js`.** La aplicación actual no carga ese archivo; la prueba de mutación histórica no verifica por sí sola la entrada única `datos/academico.json` ni el comportamiento de producción.
4. Las pruebas vigentes del contrato, grupos, escenarios personales, cálculo, filtros y las **ocho vistas actuales** están bajo `tests/`. La integración con `jsdom` comprueba navegación simulada, **no una inspección visual real**.

**Principio de continuidad:** conservar pruebas históricas como evidencia de su época, sin reactivarlas como mecanismo de generación o verificación normativa del sistema actual. No crear agrupaciones, horarios ni datos de sustitución para forzar una comparación idéntica.
