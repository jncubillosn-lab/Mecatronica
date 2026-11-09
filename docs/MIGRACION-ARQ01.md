# MIG-ARQ01 — Registro histórico de la migración secuencial

**Estado:** migración ARQ-01 cerrada en 0.8.0; soporte de formatos anteriores retirado en 0.8.1. La transición se implantó en v0.5.0 ([PR #8](https://github.com/jncubillosn-lab/Mecatronica/pull/8)) y sus ajustes posteriores quedaron saneados y verificados hasta 0.8.0 ([PR #34](https://github.com/jncubillosn-lab/Mecatronica/pull/34)). **No hay fases ni deudas de migración pendientes.**  
**Arquitectura normativa:** [ARQ-01](ARQUITECTURA.md).  
**Decisiones no negociables:** [DEC-01](DECISIONES-Y-ALCANCE.md).  
**Estado y pasos de publicación actuales:** [EST-01](ESTADO-Y-PUBLICACION.md).

Este documento conserva el **registro de lo que ya ocurrió** en las PR #8 y #9 y el acta final de cierre 0.8.0. No describe una rama activa ni una hoja de ruta. Las referencias numéricas de sus secciones 1–5 corresponden a las versiones originales, no a los datos actuales. **Nota de continuidad:** la PR #13 (v0.5.3) retiró el contexto global `RAW`, separó motor y vistas y preservó IDs en relaciones de requisitos; por tanto, las menciones a `RAW` dentro del historial de v0.5.0 describen **esa versión histórica**, no la interfaz actual. El estado técnico vigente está en [EST-01](ESTADO-Y-PUBLICACION.md).

## 1. Ejecución en el orden de ARQ-01

| Etapa | Resultado fusionado | Referencia |
|---|---|---|
| 1. Contrato único | Entrada académica `datos/academico.json` con `versionEsquema: 1`. La conversión de documentos originales ocurre **fuera de la aplicación**. | `datos/academico.json`, `tests/contrato-arq01.js` |
| 2. Lector y escenario base | `EntradaAcademica` genera la referencia y mantiene IDs, asociaciones y bloques, sin fabricar datos faltantes. | `js/entrada.js`, `js/iniciar.js`, `tests/oferta-activa.js` |
| 3. Escenarios personales | Diferencias del usuario sobre la referencia, compatibilidad con archivos históricos `{S}` y validación técnica básica de importaciones. | `js/escenarios.js`, `tests/escenarios-arq01.js` |
| 4. Cálculo y vistas | Conservadas las siete secciones, filtros, cálculos, edición y exportaciones. Los grupos especiales siguen visibles pero fuera del cálculo. | `js/app.js`, `tests/vistas-arq01.js` |
| 5. Verificación y fusión | PR #8 superó la batería de pruebas y se fusionó a `main`. La PR #9 añadió control de versión y también pasó CI. | CI `42434980198`, CI `42435837261`, `tests/integracion-arq01.js`, `tests/versionado.js` |

## 2. Fidelidad de la entrada y exclusiones deliberadas

La referencia normalizada incorporada durante la migración contiene **59 posiciones curriculares**, **64 registros de catálogo**, **64 cursos en oferta** y **716 registros de grupo en oferta**. Hay **453 agrupaciones explícitas**: 386 presentes en la referencia histórica y 67 incorporadas a partir de actividades únicas identificadas. El escenario base proyecta **904 bloques de horario**, sin duplicar sesiones compartidas entre agrupaciones.

De las 453 agrupaciones, **374 son elegibles** para las estadísticas y **79 están marcadas con `analizable: false`** por corresponder a otras sedes. Estas últimas se conservan para consulta junto con sus horarios; no producen interferencias ni entran al mapa de calor. El motor no usa expresiones regulares de nombres de grupos para decidir su elegibilidad: la marca procede del contrato.

La oferta de **Electrónica Análoga I, Electrónica Digital I y Proyecto Aplicado de Ingeniería** mantiene actividades sin agrupaciones confirmadas. Sus datos se preservan; **no se generan combinaciones hipotéticas**.

El principio de conservación es **ninguna pérdida silenciosa**. Los registros sin horario siguen siendo válidos, y su ausencia no dispara alarmas ni bloquea el uso del sistema. Un intervalo técnicamente inválido, en cambio, puede rechazarse al validar el contrato o un escenario importado.

## 3. Compatibilidad y POO

Las clases `EntradaAcademica`, `PlanCurricular`, `CalendarioAcademico` y `EscenarioPersonal` delimitan responsabilidades. En la versión inicial v0.5.0, `compute` y las vistas todavía compartían `js/app.js`; desde v0.5.3 están separados en `js/analisis.js` y `js/vistas.js`. `RAW` fue una **proyección temporal en memoria de la entrada normalizada**, nunca otra fuente académica; desde v0.5.3 no existe `window.RAW` como entrada global.

Las modificaciones del usuario se persisten como diferencias, no como copia editable de las fuentes institucionales. Se conserva la posibilidad de migrar escenarios antiguos, mantener ediciones, introducir nuevos grupos de referencia sin sobrescribir eliminaciones personales y restablecer la referencia normalizada actual.

## 4. Verificaciones y criterios de aceptación

- **Contrato:** estructura, IDs, relaciones y grupos ausentes sin deducciones.
- **Fidelidad:** integridad de las agrupaciones, días y horas; una sesión compartida no se contabiliza repetidamente por su referencia.
- **Escenarios:** importación y exportación, cambios voluntarios y compatibilidad histórica.
- **Cálculo:** elegibilidad explícita de los grupos de otras sedes; filtros sin alterar datos de referencia.
- **Vistas:** siete secciones generables, paneles, mapa de calor y consultas coherentes.
- **Integración:** carga asíncrona de la entrada única y navegación simulada con `jsdom`.
- **Versionado:** pie, metadato y `?v=` de recursos unificados; incremento requerido para cambios de código y datos.

La versión v0.4.3 incluía grupos especiales en sus estadísticas históricas (por ejemplo, **4.044 combinaciones con choque** bajo la selección anterior). Por eso no corresponde exigir igualdad de **totales globales** entre v0.4.3 y v0.5.x: la selección autorizada cambió explícitamente. La regla de solapamiento se mantuvo y la fidelidad se comprueba con el **mismo conjunto elegible**.

## 5. Integración y corrección posterior

- **PR #8 — v0.5.0:** integrada en `main` mediante commit `7e3739c2fe3eea0ab7e36c280910c65c90fbca12`. CI exitosa (ejecución `42434980198`).
- **PR #9 — v0.5.1:** integrada en `main` mediante commit `9220474b27ecd2226fcec3fca4a46a312bd423a5`. CI exitosa (ejecución `42435837261`). Se versionan los recursos CSS, JS y JSON y se obliga a avanzar versión pública en cambios de producción.
- **Publicación externa:** la integración a GitHub es verificable. Este registro **no afirma haber inspeccionado en un navegador real** la versión servida por GitHub Pages después de la fusión. La comprobación posterior se describe en EST-01.

## 6. Actualización de alcance — 0.8.1

El cierre académico de ARQ-01 fue efectivo en 0.8.0. En la evaluación
0.8 → 0.9 se confirmó expresamente que **ningún usuario externo ni el
desarrollador posee escenarios antiguos que necesiten recuperarse**.
Por ello dejó de existir una justificación para soportar sus formatos.

La [PR #35](https://github.com/jncubillosn-lab/Mecatronica/pull/35)
retira del programa actual los lectores de snapshots `{S}`,
`fixMalla`, `migrarAnterior`, marcas `mig1`–`mig4`,
`reqCredAmbiguos`, los campos `introducidoEn`/`idAnterior`
y las pruebas y archivos exclusivos de la versión anterior.

No se retiran: el formato de diferencias personales actualmente soportado,
la adaptación interna `fromRaw`, el normalizador externo del SIA, las
validaciones de datos incompletos ni la preparación multicarrera.

**Esta es una anotación histórica, no una instrucción de funcionamiento.**
Las secciones 1–5 conservan hechos y cifras de las versiones iniciales y
no deben leerse como requisitos vigentes. En particular, sus referencias
a "compatibilidad" describen una capacidad que existió y fue eliminada,
no una obligación del programa presente. El historial completo de los
archivos retirados sigue accesible en Git.

**Documentos vigentes:** [ARQ-01](ARQUITECTURA.md),
[REG-01](REG-01.md) y [EST-01](ESTADO-Y-PUBLICACION.md).
