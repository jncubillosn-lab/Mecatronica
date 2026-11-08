# EST-01 — Estado real y publicación

**Corte:** 8 de noviembre de 2026, versión **0.7.5**, commit de referencia `2985499d25319c13d686e3ac117080afdb250b5f`.
**Norma:** [ARQ-01](ARQUITECTURA.md). **Alcance:** [DEC-01](DECISIONES-Y-ALCANCE.md).
**Historial:** [MIG-ARQ01](MIGRACION-ARQ01.md) y [CHANGELOG](../CHANGELOG.md).
**Auditoría:** [AUD-075](AUDITORIA-0.7.5.md).

Este documento describe el estado comprobado del corte, sin convertir funcionalidades no solicitadas en pendientes.

## Flujo vigente

Una única entrada académica, `datos/academico.json`, es cargada por `js/iniciar.js`. `EntradaAcademica` produce una proyección interna y `fromRaw` construye el escenario base. El arranque entrega `CONTEXTO_ACADEMICO`; no publica `window.RAW`. `EscenarioPersonal` aplica las diferencias del usuario. El motor opera sobre el escenario efectivo y las vistas muestran sus consultas y resultados.

| Responsabilidad | Implementación |
|---|---|
| Lectura del contrato | `js/entrada.js` |
| Plan y calendario | `js/modelo.js` |
| Diferencias y compatibilidad personal | `js/escenarios.js`; REG-01 conserva cambios de requisitos por ID y campo |
| Análisis puro | `js/analisis.js` |
| Estado, filtros y eventos | `js/app.js` |
| Vistas y demanda | `js/vistas.js`, `js/demanda.js` |
| Identidad y tema | `js/identidad.js`, `js/tema.js` |

Las ocho secciones son Inicio, Interferencias, Asignaturas, Grupos, Horarios, Mapa de calor, Prerrequisitos y Demanda. Se conservan filtros, edición, CSV, exportación/importación, persistencia y restablecimiento. La unidad responsable y la encuesta son anotaciones personales opcionales, no nuevas entradas académicas.

## Migración cerrada y compatibilidad vigente

La migración a entrada única fue integrada en v0.5.0 y el contexto global RAW se retiró en v0.5.3. Esos hitos no deben presentarse como trabajo pendiente de v0.7.5.

La proyección posicional local, `fromRaw` y la lectura de escenarios antiguos tienen consumidores actuales; no son código muerto. Los archivos heredados `js/datos.js`, `js/catalogo.js`, `js/oferta-fuente.js` y `js/fuentes.js` no se cargan en producción, pero `tests/fuentes.js` y `tests/verificar.js` todavía utilizan referencias heredadas. Su retirada necesita sustituir previamente esa cobertura y verificar consumidores; no se borran por su nombre o edad.

Los conversores y las fuentes originales permanecen fuera de la aplicación. No se exige un generador de contrato como función del sitio.

## Datos incompletos y alcance

- Solo se analiza el alcance Bogotá. Los registros con `analizable: false` se conservan y no se convierten en calculables mediante una edición personal.
- Un grupo sin bloques se conserva y no produce choques ficticios. Su presencia puede participar en el conteo de grupos; no equivale a compatibilidad certificada ni justifica cambiar el indicador sin una decisión funcional.
- No se infieren fechas, duración, docentes, asociaciones entre actividades ni requisitos.
- Un vacío admitido es distinto de un intervalo informado inválido o una referencia rota.
- No se modifican los datos académicos para limpiar documentación o cerrar la migración.

Los conteos de la migración pertenecen a MIG-ARQ01. Para el corte actual, consultar el contrato y ejecutar las pruebas de cobertura; no copiar cifras históricas como inventario vigente.

## Versiones independientes

| Identificador | Valor del corte | Significado |
|---|---|---|
| Aplicación | 0.7.5 | Pie, metadato y caché de recursos |
| `versionEsquema` | 1 | Forma del contrato académico |
| Escenario personal `version` | 1 | Formato de cambios personales |

## Verificación y publicación

1. Leer ARQ-01, DEC-01 y AGENTS.md; identificar responsabilidad y comportamiento que se preserva.
2. Para datos académicos, editar únicamente el contrato con evidencia.
3. Si cambian recursos productivos HTML, JS, CSS o JSON, incrementar y sincronizar la versión visible y las rutas de caché; cambios documentales o de higiene no elevan la versión.
4. Ejecutar `npm ci` y `npm test`. La lista vigente de suites está en `package.json`; las herramientas de `pruebas/` son históricas y no reemplazan la batería.
5. Revisar GitHub Actions del commit exacto antes de fusionar. La CI verifica PR contra `main` y cambios integrados en `main`; la comparación de versión contra la base se hace en PR.
6. Para cambios de vistas, comprobar navegador real. `jsdom` no certifica geometría ni aspecto.
7. Distinguir integración, CI y sitio servido. La ejecución [42531088391](https://github.com/jncubillosn-lab/Mecatronica/actions/runs/42531088391) de Pages terminó con éxito para el commit 0.7.5. Esto no sustituye una inspección funcional del sitio público.
8. Registrar resultados, límites y diferencias comprobadas, sin declarar una auditoría completa por haber pasado pruebas parciales.
