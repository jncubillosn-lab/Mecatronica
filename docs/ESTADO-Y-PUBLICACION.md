# EST-01 — Estado real y publicación

**Corte revisado:** 8 de noviembre de 2026 · **Versión pública de la etapa de archivo:** `0.7.7` (su publicación se comprueba tras la integración).  
**Estado de la estabilización:** preparación hacia **1.0.0**; **no publicada ni aprobada todavía**.  
**Norma rectora:** [ARQ-01](ARQUITECTURA.md), incluidos sus 17 requisitos funcionales, 8 condiciones de calidad y no-requisitos.  
**Trazabilidad detallada:** [CHANGELOG](../CHANGELOG.md) y [MIG-ARQ01](MIGRACION-ARQ01.md).  

Este archivo explica el **estado operativo** y la ruta de verificación. Las versiones antiguas figuran como hitos históricos, no como descripción actual de la página.

## 1. Estado publicado y alcance

El código de referencia de esta etapa declara `0.7.7` en `index.html` y en los recursos versionados; la publicación efectiva se verifica tras fusionar. Las ocho páginas son **Inicio, Interferencias, Asignaturas, Grupos, Horarios, Mapa de calor, Demanda y Prerrequisitos**. La aplicación es estudiantil, estática y no oficial.

**Una sola entrada académica:** `datos/academico.json`. `js/iniciar.js` lee el contrato, `EntradaAcademica` construye una proyección interna y `fromRaw` prepara `S0`; `EscenarioPersonal` reconstruye `S` y `compute` calcula resultados. Los filtros construyen consultas `RV/RV0`, sin modificar `S/S0`. La presentación es independiente de la entrada académica.

**Distinguir siempre tres versiones:** `versionEsquema:1` (contrato), `version:1` (archivo personal) y `0.7.7` (versión objetivo de esta etapa). El mismo número no tiene por qué servir a los tres formatos.

### Hitos históricos verificados por PR

| Periodo | Hitos integrados, **no** instrucciones actuales |
|---|---|
| 0.4.x | Sitio original `RAW` y escenarios completos `{S}` |
| 0.5.0–0.5.5 | Arquitectura de entrada única, validaciones, separación de motor/vistas, filtros, unidad académica y simplificación de TPI ([PR #8–15](https://github.com/jncubillosn-lab/Mecatronica/pulls?q=is%3Apr+is%3Amerged)) |
| 0.5.6–0.5.9 | Demanda de preinscripción, vista simulada, comparaciones gráficas y selección de puntos ([PR #16–19](https://github.com/jncubillosn-lab/Mecatronica/pulls?q=is%3Apr+is%3Amerged)) |
| 0.6.0 | Identidad visual y acentos por programa ([PR #20](https://github.com/jncubillosn-lab/Mecatronica/pull/20)) |
| 0.7.0–0.7.2 | Diseño adaptable, Libre elección y modo claro ([PR #21–23](https://github.com/jncubillosn-lab/Mecatronica/pulls?q=is%3Apr+is%3Amerged)) |
| 0.7.3–0.7.5 | Requisitos TPI/PAI, escenarios por diferencias, tipologías suaves y contraste ([PR #24–26](https://github.com/jncubillosn-lab/Mecatronica/pulls?q=is%3Apr+is%3Amerged)) |
| Preparación 1.0 | [PR #28](https://github.com/jncubillosn-lab/Mecatronica/pull/28) consolidó ARQ-01; [PR #29](https://github.com/jncubillosn-lab/Mecatronica/pull/29) corrigió documentos; [PR #30](https://github.com/jncubillosn-lab/Mecatronica/pull/30) separó pruebas; [PR #31](https://github.com/jncubillosn-lab/Mecatronica/pull/31) saneó S0; [PR #32](https://github.com/jncubillosn-lab/Mecatronica/pull/32) archiva fuentes históricas. |

## 2. Responsabilidades y límites

- `js/entrada.js`: estructura del JSON normalizado, IDs y agrupaciones. **No convierte archivos originales**.
- `js/modelo.js`: calendario, componentes y requisitos curriculares.
- `js/escenarios.js`: escenarios personales, validación, compatibilidad con versiones anteriores.
- `js/analisis.js`: cierre de requisitos, comparación de grupos y cálculo de interferencias. `fromRaw` se usa todavía en el arranque.
- `js/demanda.js`: estadísticas de solicitudes; si falta encuesta presenta ejemplo explícitamente simulado, no capacidad de cupos.
- `js/app.js`: estado, filtros, edición, importación/exportación y navegación.
- `js/vistas.js`: vistas curriculares, detalles, mapas y CSV.
- `js/tema.js`, `js/identidad.js`, `css/`: presentación visual, no datos del plan.

Se conservan las diferencias entre **grupo ofrecido**, **agrupación elegible** y **grupo seleccionado**. `analizable:false` conserva registros informativos sin incorporarlos al cálculo. La ausencia de horarios o profesores es legítima y **no** genera datos inventados ni falsas alarmas.

## 3. Pruebas y publicación

La batería **actual** declarada en `package.json` se ejecuta con `npm ci && npm test`. Los tres ensayos de la antigua estructura `RAW` se mantienen ejecutables por separado mediante `npm run test:historico` y no están en el flujo principal; sus resultados no representan el contrato vigente. El flujo `.github/workflows/verificacion-arq01.yml` corre en PR hacia `main`, verifica contrato, escenarios, cálculos, vistas e integración y exige incrementar la versión de los recursos de producción cuando corresponde. Los cambios **solo documentales no exigen** avance de versión.

Para cada publicación:

1. Delimitar el cambio por RF/RC o decisión aprobada en ARQ-01.
2. Verificar qué módulos y pruebas dependen realmente de esa responsabilidad.
3. Ejecutar la suite completa y revisar qué cambios son **históricos**, no producto vigente.
4. Cuando cambien HTML/JS/CSS/JSON de producción, incrementar y sincronizar meta, pie y `?v=` de `index.html` y `js/iniciar.js`.
5. Revisar el diff, fusionar solo con CI satisfactorio, confirmar GitHub Pages **separadamente** y, si es visual, inspeccionar el navegador real.

No confundir CI en la rama, una fusión en `main` y un despliegue completo; son verificaciones distintas.

## 4. Transiciones aún bajo evaluación

| Caso | Estado comprobado | Criterio para actuar |
|---|---|---|
| `fromRaw` y proyección posicional | Usados para construir S0 desde la única entrada | Mantener hasta demostrar un reemplazo equivalente |
| `fixMalla` y `mig1`–`mig4` | **Desde 0.7.6**, retirado `fixMalla(S0)` tras prueba de equivalencia; continúa la ruta `fixMalla(anterior)` para archivos `{S}` | Mantener compatibilidad y reevaluar su retiro por separado, solo con pruebas representativas |
| `tests/filtros.js`, `tests/verificar.js`, `tests/fuentes.js` | **Pruebas históricas, aisladas de `npm test`**; ejecutables por separado con `npm run test:historico` | Mantener como evidencia mientras se revise el archivo de origen; no convertirlas en requisito de producción |
| `pruebas/historico/js/{datos,catalogo,oferta-fuente,fuentes}.js` | **Archivados desde 0.7.7** fuera del directorio ejecutable; copias verificadas byte a byte respecto a la versión anterior. Pruebas históricas redirigidas | No reactivar en HTML ni en `npm test`; conservar para análisis histórico |
| Herramientas `data/`, `scripts/`, `pruebas/` | Preparación externa o verificaciones de migraciones anteriores | Mantener claramente separadas de la aplicación estática |
| `save()` frente a `export` de `pendientesRequisitos` | Rutas de serialización diferentes | Reproducir caso de escenario histórico antes de cambiar código |
| Documentos de versiones antiguas | Historial que debe identificarse explícitamente | Actualizar narrativa vigente sin falsear eventos pasados |

**No requisitos:** soporte comercial de matrícula, verificación de créditos realmente aprobados, inferencia de cupos, nuevas universidades u otros programas sin entrada disponible, inventar docentes, crear agrupaciones no registradas o resolver vacíos académicos mediante alarmas.

## 5. Condiciones de salida hacia 1.0

La versión estable solo se considerará cuando ARQ-01, README, EST-01, DEC-01 y el historial no se contradigan en las afirmaciones vigentes; cuando el arranque dependa únicamente del JSON normalizado; cuando se haya clasificado el legado; cuando se hayan demostrado importaciones/exportaciones actuales e históricas; y cuando las pruebas y la publicación del sitio estén verificadas. **No se necesita reescribir el gestor ni borrar compatibilidad funcional para conseguirlo.**
