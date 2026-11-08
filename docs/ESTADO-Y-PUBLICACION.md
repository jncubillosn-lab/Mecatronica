# EST-01 — Estado real, historial y publicación

**Corte documentado:** 7 de noviembre de 2026.  
**Código principal tras la integración de la PR #11:** `main`, versión pública `0.5.2`.  
**Arquitectura normativa:** [ARQ-01](ARQUITECTURA.md).  
**Acuerdos de alcance:** [DEC-01](DECISIONES-Y-ALCANCE.md).  
**Registro histórico de migración:** [MIG-ARQ01](MIGRACION-ARQ01.md).

Este archivo es una **fotografía verificable de implementación**, no una hoja de ruta. Los pendientes enumerados distinguen limitaciones comprobadas de funciones no solicitadas.

## 1. Qué ocurrió

| Hito | Resultado verificable |
|---|---|
| v0.4.3 | Aplicación estática operativa; `js/datos.js`/`RAW` eran fuente principal y los escenarios antiguos almacenaban `{S}`. |
| ARQ-01, PR #7 | Arquitectura de una entrada académica adoptada en `docs/ARQUITECTURA.md`. |
| v0.5.0, [PR #8](https://github.com/jncubillosn-lab/Mecatronica/pull/8) | Fusionada en `main`, commit `7e3739c2fe3eea0ab7e36c280910c65c90fbca12`. Entrada única, lector, cambios personales, conservación de grupos especiales y pruebas. |
| v0.5.1, [PR #9](https://github.com/jncubillosn-lab/Mecatronica/pull/9) | Fusionada en `main`, commit `9220474b27ecd2226fcec3fca4a46a312bd423a5`. Corrección del indicador público y parámetros de caché, más guardas automáticas de versión. |
| v0.5.2, [PR #11](https://github.com/jncubillosn-lab/Mecatronica/pull/11) | **Fusionada en `main`**, commit `a398cfb068ce3747fee289adc9b151505107a570`. Documentación técnica **junto al código**: responsabilidades POO, contrato, deltas personales, cálculo, filtros, siete vistas y arranque. No modifica el contrato académico ni la lógica funcional; eleva la versión por actualizar recursos JS/CSS/HTML. |

La PR #8 superó GitHub Actions (ejecución `42434980198`), la PR #9 superó la ejecución `42435837261` y la PR #11 superó la ejecución `42437245624`, todas sobre sus commits correspondientes. La PR #10 consolidó únicamente documentación, sin requerir una nueva versión pública. **Estas pruebas confirman las ramas examinadas y su integración en `main`; no prueban por sí solas cuándo GitHub Pages sirvió el HTML actualizado.**

## 2. Flujo ejecutado actualmente

```text
ÚNICA ENTRADA ACADÉMICA (datos/academico.json)
    -> js/iniciar.js: carga JSON
    -> EntradaAcademica (js/entrada.js): valida contrato y prepara referencia
    -> proyección interna RAW: compatibilidad de interfaz, NO segunda entrada
    -> fromRaw / escenario base S0
    -> EscenarioPersonal: aplica diferencias personales, produce S
    -> compute(S): análisis horario y curricular
    -> selección de componentes y filtros -> resultados de consulta
    -> siete vistas, detalles, mapa de calor, exportación CSV
    -> cambios voluntarios -> localStorage / importar-exportar escenario
```

**Responsabilidades actuales (POO):**

- `EntradaAcademica`: lee el **único contrato** y conserva agrupaciones, bloques e identidades de referencia. No hace OCR ni conversión de fuentes.
- `PlanCurricular` y `CalendarioAcademico`, en `js/modelo.js`: comportamiento curricular y estructura temporal.
- `EscenarioPersonal`: extrae, aplica, valida y migra diferencias personales; incluye lectura de escenarios `{S}` antiguos.
- `js/app.js`: contiene `fromRaw`, `compute`, estado de consulta y siete vistas; sigue siendo un módulo amplio heredado.
- `js/iniciar.js`: inicia desde `datos/academico.json` y carga la interfaz. No consulta `js/datos.js`, `js/catalogo.js` ni `js/oferta-fuente.js`.

**Documentación interna de v0.5.2:** las clases y funciones importantes tienen JSDoc/comentarios próximos a su implementación. Identifican entradas y salidas, invariantes del escenario, diferencia entre `on` y `analizable`, semántica de los vacíos, separación entre filtros y estado, conservación de referencias históricas y responsabilidades POO. También se documenta la carga de scripts y el significado de los estilos del mapa de calor. Estos comentarios **no cambian los cálculos** ni reemplazan ARQ-01, las pruebas o las fuentes normalizadas.

La proyección `RAW` **solo existe en memoria**, derivada del JSON. La decisión de eliminarla internamente en otro momento **no está aprobada como requisito funcional inmediato** y exige regresiones antes de cambiar su forma.

## 3. Cobertura de datos normalizados en esta referencia

| Elemento | Cantidad | Interpretación |
|---|---:|---|
| Posiciones curriculares (`malla`) | 59 | No todas poseen un código de asignatura concreto. |
| Entradas de `catalogo` | 64 | Catálogo académico disponible. |
| Cursos de `oferta` | 64 | Referencia de oferta disponible. |
| Registros de grupo en `oferta` | 716 | **Registros fuente conservados**, no 716 agrupaciones calculables. |
| Agrupaciones explícitas | 453 | 386 históricas y 67 incorporadas en la migración. |
| Agrupaciones analizables | 374 | Sin `analizable: false`. |
| Agrupaciones de otras sedes informativas | 79 | Registradas con `analizable: false`, sin participar en los cálculos. |
| Bloques del escenario base `S0` | 904 | Los bloques compartidos entre agrupaciones se proyectan una sola vez. |
| Posiciones con agrupaciones aún no verificadas | 3 | Electrónica Análoga I, Electrónica Digital I y Proyecto Aplicado de Ingeniería. No se inventan combinaciones. |

Los bloques declarados dentro de componentes de distintas agrupaciones pueden referirse a una misma sesión compartida; por ello una cantidad de apariciones en el JSON no debe confundirse con los **904 bloques únicos del escenario base**. Las **52 relaciones de prerrequisito** y **3 mínimos de créditos** de esta referencia apuntan a posiciones identificadas de la malla: no se detectaron referencias huérfanas en la revisión documental. La comprobación de fidelidad compara días, horas, asociaciones y referencias, no solo totales.

**Precisión de alcance:** los 79 registros informativos son los explícitamente identificados y marcados en **esta referencia**. No se fija una regla universal de detección por el texto del ID. Una actualización académica debe suministrar su clasificación en el mismo contrato. Una alteración del análisis debe distinguir cambios deliberados de cobertura de posibles regresiones del algoritmo.

## 4. Funciones que deben seguir disponibles

| Sección | Función a conservar |
|---|---|
| **Inicio** | Resumen de cruces de la selección actual. |
| **Interferencias** | Lista, matriz, comparación de grupos, filtros y CSV. |
| **Asignaturas** | Estadísticas de cruces por asignatura. |
| **Grupos** | Consultar, activar/desactivar, añadir y quitar grupos; identificar otras sedes como informativas. |
| **Horarios** | Consultar, editar, mover y superponer bloques de horario. |
| **Mapa de calor** | Grupos programados por franja horaria; filtros de componentes y asignaturas. No inferir salones ni matrículas. |
| **Prerrequisitos** | Consulta y edición de malla, créditos, semestres y relaciones. |

Además: persistencia local, descarga/carga de escenarios, restablecimiento de referencia, compatibilidad con escenarios antiguos y ejecución estática sin cuentas. Los filtros de componentes actúan sobre **resultados**, no sobre la referencia ni las modificaciones personales.

## 5. Contratos y versiones: tres números diferentes

| Identificador | En esta versión | ¿Qué expresa? |
|---|---|---|
| Versión del sitio | `0.5.2` | Release visible y parámetros de caché de recursos estáticos. |
| `versionEsquema` | `1` | Estructura de la entrada académica. **No** se incrementa por cualquier publicación. |
| `escenario-personal.version` | `1` | Formato de exportaciones y cambios personales. **No** es la versión del sitio. |

Los escenarios personales se guardan bajo la clave configurada en el contrato (actualmente `interferencias-horarios-v3`). La persistencia es de diferencias respecto al escenario de referencia, no de una segunda fuente institucional.

## 6. Verificación y publicación: procedimiento obligatorio

1. **Antes de editar:** leer ARQ-01, DEC-01, este archivo y `AGENTS.md`; definir impacto en contrato, escenario y vistas. Revisar y mantener coherentes los comentarios técnicos ubicados junto a las funciones afectadas.
2. **Si cambian datos:** modificar solamente `datos/academico.json`; preservar códigos, bloques, huecos legítimos y `analizable` según evidencia. No ejecutar generadores históricos como fuente productiva.
3. **Si cambian HTML, JS, CSS o datos públicos:** incrementar el número del sitio. Mantener coincidentes `<meta name="version">`, texto `Versión x.y.z` del pie, parámetros `?v=` de todos los recursos de `index.html` y las dos rutas dinámicas en `js/iniciar.js`.
4. **Ejecutar pruebas:** `npm ci` y `npm test` en la rama. Las nueve suites comprueban versión, contrato, oferta, escenarios, vistas, reglas antiguas, filtros, fuentes heredadas e integración simulada.
5. **En PR contra `main`:** comprobar que GitHub Actions esté exitoso; `tests/versionado.js --compare-main` exige incremento cuando cambian recursos de producción. Los cambios **solo de documentación** no requieren elevar la versión del sitio.
6. **Fusionar con control del commit esperado**, preferiblemente después de validar regresiones; comprobar que `main` contenga el resultado.
7. **Comprobar Pages por separado:** abrir https://jncubillosn-lab.github.io/Mecatronica/ y observar el número en el pie; si es antiguo, revisar caché y [GitHub Actions](https://github.com/jncubillosn-lab/Mecatronica/actions) / Settings → Pages. El pie confirma **qué HTML se sirve**, pero por sí solo no valida que todas las funciones y recursos hayan cargado.
8. **Si el cambio es funcional:** comprobar las siete secciones y escenarios personales en navegador real. Una ejecución con `jsdom` no sustituye una inspección visual real.

La fecha al lado del número del pie es una **fecha editorial**, no un mecanismo automático de despliegue. Debe mantenerse coherente cuando se decida actualizarla.

## 7. Límites y asuntos aún transitorios

| Tema | Estado documentado | Decisión prudente |
|---|---|---|
| `RAW` en el motor y en las vistas | Proyección **interna transitoria**, derivada de la única entrada normalizada. | No llamarla segunda entrada ni retirarla sin conservar funciones. |
| Funciones extensas de `js/app.js` | Herencia funcional de v0.4.3. | Solo refactorizar con propósito y pruebas de equivalencia. |
| Referencias antiguas por nombre | Parte de las relaciones y vistas heredadas usan nombres, aunque existen IDs en el contrato. | Preservar identidades y migraciones sin sustituciones silenciosas. |
| Agrupaciones no verificadas | Tres posiciones con actividades múltiples sin relación suficientemente validada. | Conservar oferta; no inventar emparejamientos. |
| Grupos de otras sedes | Solo informativos en cálculos del alcance actual. | No incluirlos sin decisión y respaldo académico. |
| Archivos y scripts históricos | Permanecen en el árbol, no son entradas de producción. | No volverlos rutas activas por comodidad. |
| Comparador original `pruebas/compare.js` y mutaciones | Son herramientas históricas: el comparador puede informar diferencias aun con código de salida 0; la mutación utiliza `js/datos.js`, que no es la entrada productiva vigente. | No usar estos resultados como verificación obligatoria de ARQ-01; consultar [pruebas/LEEME.md](../pruebas/LEEME.md) y la batería `npm test`. |
| GitHub Pages y visualización real | La fusión y CI de v0.5.1 están confirmadas. La documentación interna de v0.5.2 no sustituye la comprobación visual pública posterior a su integración. | No declarar despliegue o aspecto visual comprobados sin evidencia directa. |

**Nota de higiene documental:** `docs/entrada-datos.md` describe un procedimiento **histórico y externo** de tratamiento de fuentes. No es la especificación de ejecución de ARQ-01. Su afirmación histórica sobre ausencia de nombres de docentes no coincide con todos los archivos públicos heredados; no se debe interpretar como una garantía técnica vigente ni corregir archivos académicos sin una decisión separada.

## 8. Al continuar el trabajo

Para cada modificación registrar: **necesidad solicitada**, **archivo y responsabilidad afectados**, **invariantes a conservar**, **datos académicos añadidos o ausentes**, **pruebas ejecutadas**, **versión pública y estado de despliegue**, y **qué permanece sin comprobar**. Esta distinción impide volver a diagnosticar como errores decisiones deliberadas o datos incompletos.
