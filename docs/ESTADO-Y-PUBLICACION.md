# EST-01 — Estado real y publicación

**Corte revisado:** 8 de noviembre de 2026 · **Versión de cierre de la migración ARQ-01:** `0.8.0`.  
**Migración ARQ-01: CERRADA** en 0.8.0; su compatibilidad histórica queda soportada y comprobada. **La evaluación general de 1.0.0 sigue siendo independiente** y no se declara publicada.  
**Norma rectora:** [ARQ-01](ARQUITECTURA.md), incluidos sus 17 requisitos funcionales, 8 condiciones de calidad y no-requisitos.  
**Trazabilidad detallada:** [CHANGELOG](../CHANGELOG.md) y [MIG-ARQ01](MIGRACION-ARQ01.md).  

Este archivo explica el **estado operativo** y la ruta de verificación. Las versiones antiguas figuran como hitos históricos, no como descripción actual de la página.

## 1. Estado publicado y alcance

El código de referencia declara `0.8.0` en `index.html` y en los recursos versionados. GitHub Pages y CI se verifican por separado como parte de la publicación. Las ocho páginas son **Inicio, Interferencias, Asignaturas, Grupos, Horarios, Mapa de calor, Demanda y Prerrequisitos**. La aplicación es estudiantil, estática y no oficial.

**Una sola entrada académica:** `datos/academico.json`. `js/iniciar.js` lee el contrato, `EntradaAcademica` construye una proyección interna y `fromRaw` prepara `S0`; `EscenarioPersonal` reconstruye `S` y `compute` calcula resultados. Los filtros construyen consultas `RV/RV0`, sin modificar `S/S0`. La presentación es independiente de la entrada académica.

**Distinguir siempre tres versiones:** `versionEsquema:1` (contrato), `version:1` (archivo personal) y `0.8.0` (versión de cierre ARQ-01). El mismo número no tiene por qué servir a los tres formatos.

### Hitos históricos verificados por PR

| Periodo | Hitos integrados, **no** instrucciones actuales |
|---|---|
| 0.4.x | Sitio original `RAW` y escenarios completos `{S}` |
| 0.5.0–0.5.5 | Arquitectura de entrada única, validaciones, separación de motor/vistas, filtros, unidad académica y simplificación de TPI ([PR #8–15](https://github.com/jncubillosn-lab/Mecatronica/pulls?q=is%3Apr+is%3Amerged)) |
| 0.5.6–0.5.9 | Demanda de preinscripción, vista simulada, comparaciones gráficas y selección de puntos ([PR #16–19](https://github.com/jncubillosn-lab/Mecatronica/pulls?q=is%3Apr+is%3Amerged)) |
| 0.6.0 | Identidad visual y acentos por programa ([PR #20](https://github.com/jncubillosn-lab/Mecatronica/pull/20)) |
| 0.7.0–0.7.2 | Diseño adaptable, Libre elección y modo claro ([PR #21–23](https://github.com/jncubillosn-lab/Mecatronica/pulls?q=is%3Apr+is%3Amerged)) |
| 0.7.3–0.7.5 | Requisitos TPI/PAI, escenarios por diferencias, tipologías suaves y contraste ([PR #24–26](https://github.com/jncubillosn-lab/Mecatronica/pulls?q=is%3Apr+is%3Amerged)) |
| Preparación 1.0 | [PR #28](https://github.com/jncubillosn-lab/Mecatronica/pull/28) consolidó ARQ-01; [PR #29](https://github.com/jncubillosn-lab/Mecatronica/pull/29) corrigió documentos; [PR #30](https://github.com/jncubillosn-lab/Mecatronica/pull/30) separó pruebas; [PR #31](https://github.com/jncubillosn-lab/Mecatronica/pull/31) saneó S0; [PR #32](https://github.com/jncubillosn-lab/Mecatronica/pull/32) archivó fuentes históricas; [PR #33](https://github.com/jncubillosn-lab/Mecatronica/pull/33) corrigió exportación; [PR #34](https://github.com/jncubillosn-lab/Mecatronica/pull/34) cierra formalmente la migración ARQ-01 en 0.8.0. |

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

La batería **actual** se ejecuta con `npm ci && npm test`. La batería conservada de los formatos antiguos se ejecuta por separado con `npm run test:historico`; **ambas pasan en GitHub Actions en las PR hacia `main`**, sin confundir los datos `RAW` de la versión original con la única entrada vigente. El workflow verifica contrato, escenarios, cálculos, vistas, compatibilidad histórica e incremento de versión cuando corresponde. Los cambios **solo documentales no exigen** avance de versión.

Para cada publicación:

1. Delimitar el cambio por RF/RC o decisión aprobada en ARQ-01.
2. Verificar qué módulos y pruebas dependen realmente de esa responsabilidad.
3. Ejecutar la suite completa y revisar qué cambios son **históricos**, no producto vigente.
4. Cuando cambien HTML/JS/CSS/JSON de producción, incrementar y sincronizar meta, pie y `?v=` de `index.html` y `js/iniciar.js`.
5. Revisar el diff, fusionar solo con CI satisfactorio, confirmar GitHub Pages **separadamente** y, si es visual, inspeccionar el navegador real.

No confundir CI en la rama, una fusión en `main` y un despliegue completo; son verificaciones distintas.

## 4. Inventario definitivo — migración ARQ-01 cerrada

| Elemento | Condición de cierre comprobada | Situación definitiva |
|---|---|---|
| `fromRaw` y proyección posicional | Construyen `S0` desde una única entrada normalizada | **Adaptador vigente**, no migración pendiente |
| `fixMalla` y `mig1`–`mig4` | `S0` no pasa por ellos desde 0.7.6; solo se usan al importar archivos personales completos `{S}` | **Lector de compatibilidad histórica soportado** |
| `tests/filtros.js`, `tests/verificar.js`, `tests/fuentes.js` | Se ejecutan con `npm run test:historico` y aprobaron CI en 0.8.0 | **Pruebas históricas verificadas**, separadas de `npm test` |
| `pruebas/historico/js/{datos,catalogo,oferta-fuente,fuentes}.js` | Archivados fuera de `js/` desde 0.7.7; contenido original preservado | **Material histórico conservado**, nunca cargado por el sitio |
| `data/`, `scripts/`, `pruebas/` | Herramientas externas o de archivo; los comandos npm de comparación original se retiraron en 0.8.0 | **Fuera del programa web**, sin obligaciones de migración pendientes |
| `save()` / `export` de `pendientesRequisitos` | Corregido en 0.7.8 y cubierto por pruebas de exportación/importación | **Compatibilidad de escenarios protegida** |
| GitHub Actions | Sin disparador de rama de migración; ejecuta la suite actual e histórica en PR hacia `main` | **Verificación ordinaria**, no flujo de transición |

**Frontera de datos protegida:** `introducidoEn` e `idAnterior`
no forman parte de las exigencias de la entrada actual. La prueba
`tests/compatibilidad-opcional.js` comprueba escenario y resultados iguales
con o sin esos metadatos históricos; la ruta de importación antigua puede
aprovecharlos solo cuando existan correspondencias explícitas. La falta de
evidencia en un archivo personal anterior no se subsana inventando datos.

**Resultado:** **cero actividades de migración ARQ-01 pendientes**. No se considera deuda la presencia de lectores de archivos antiguos, comentarios históricos o fixtures archivados. Los cambios futuros se tramitan por los requisitos vigentes RF/RC, no como continuación de la migración.

**No requisitos:** soporte comercial de matrícula, verificación de créditos realmente aprobados, inferencia de cupos, nuevas universidades u otros programas sin entrada disponible, inventar docentes, crear agrupaciones no registradas o resolver vacíos académicos mediante alarmas.

## 5. Condiciones de salida hacia 1.0

La versión estable solo se considerará cuando ARQ-01, README, EST-01, DEC-01 y el historial no se contradigan en las afirmaciones vigentes; cuando el arranque dependa únicamente del JSON normalizado; cuando se haya clasificado el legado; cuando se hayan demostrado importaciones/exportaciones actuales e históricas; y cuando las pruebas y la publicación del sitio estén verificadas. **No se necesita reescribir el gestor ni borrar compatibilidad funcional para conseguirlo.**
