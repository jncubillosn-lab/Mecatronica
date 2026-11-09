# DEC-01 — Decisiones, alcance y criterios de conservación

**Estado:** acuerdos adoptados para el desarrollo de Gestor de horarios · Mecatrónica.  
**Revisión de vigencia:** 9 de noviembre de 2026, evaluación 0.8 → 0.9, intervención 0.8.1. Las decisiones anteriores se conservan como antecedentes, indicando cuándo fueron complementadas o sustituidas.  
**Documento superior:** [ARQ-01](ARQUITECTURA.md).  
**Estado del código y publicación:** [ESTADO-Y-PUBLICACION.md](ESTADO-Y-PUBLICACION.md).

Este documento registra **por qué** se tomaron decisiones, **qué se debe preservar** y **qué no debe presumirse** en futuras intervenciones. No sustituye al contrato `datos/academico.json`, a las pruebas ni al código. Una idea mencionada como ejemplo o posibilidad **no es un objetivo aprobado**.

## 1. Propósito y alcance establecido

La aplicación web ayuda a consultar el plan curricular, sus requisitos y la oferta académica disponible; permite examinar interferencias de horarios, simular cambios personales y visualizar concentración de grupos en un mapa semanal. Es una herramienta **estática y no oficial**, no un sistema de matrículas, cupos garantizados, ocupación real de aulas ni demanda estudiantil.

**Regla de alcance:** no atribuir al proyecto objetivos, características, obligaciones o déficits que el propio proyecto no haya establecido. La ausencia de funciones no solicitadas no constituye un fallo. Puede revisarse un riesgo técnico implícito **cuando se demuestre cómo afecta a una función existente** (por ejemplo, un escenario importado que invalida cálculos), sin convertir buenas prácticas genéricas en nuevas metas del producto.

## 2. Decisiones registradas

| ID | Decisión vigente | Motivo y criterio de revisión |
|---|---|---|
| D-01 | **Una única entrada académica:** `FuentesAcadémicas`, representada por `datos/academico.json`. | El sistema consume una estructura contractual única; no acepta rutas paralelas desde malla, catálogo, oferta ni `RAW`. Modificar esta frontera exige revisar ARQ-01 **antes** del código. |
| D-02 | **Conversión completamente externa.** Recopilación, extracción, OCR, limpieza, validación de procedencia y conversión de fuentes originales quedan fuera del sistema web. | No añadir conversores ni adaptadores de archivos institucionales como módulos internos. El normalizador del SIA sigue siendo externo y útil; los scripts de versiones obsoletas se retiraron. |
| D-03 | **Contrato basado en información realmente accesible.** No ampliar campos obligatorios por conveniencia de programación. | El contrato fue definido tras evaluar qué datos pueden obtenerse en la práctica. La estructura se valida; la completitud académica no se exige. |
| D-04 | **Resiliencia ante datos faltantes.** `null` = desconocido; `[]` = registros no informados; `0` = valor conocido. | No inventar valores, requisitos, asociaciones, horarios, docentes ni alertas por mera ausencia. No confundir desconocimiento con ausencia institucional. |
| D-05 | **Sin horario o sin grupos, no se inventa un choque.** La interfaz puede mostrar «no choca». | Es una elección funcional deliberada: preferir no generar falsas alarmas. No cambiar etiquetas ni introducir bloqueos por esta razón sin solicitud expresa. |
| D-06 | **Grupos de otras sedes: información conservada, análisis excluido por ahora.** | Se preservan en `oferta` y `agrupaciones`; `analizable: false` los excluye de interferencias, matrices y mapa de calor. La clasificación se declara en la entrada normalizada, no se adivina dentro del código a partir de prefijos. Su inclusión futura requiere respaldo académico. |
| D-07 | **No inferir agrupaciones entre actividades.** | Dos laboratorios, prácticas o teorías no se combinan por nombre, número coincidente ni producto cartesiano. Las agrupaciones verificadas son explícitas; las incompletas permanecen registradas sin combinaciones supuestas. |
| D-08 | **No modificar datos académicos sin evidencia.** | Una limpieza o modificación arquitectónica no autoriza correcciones silenciosas de días, horas, créditos, grupos, identidades ni relaciones. Ante una anomalía, preservar el dato y documentar la incertidumbre hasta verificarla. |
| D-09 | **Conservar íntegramente las funciones existentes.** | **Ocho** páginas: Inicio, Interferencias, Asignaturas, Grupos, Horarios, Mapa de calor, Demanda y Prerrequisitos, más filtros, edición, CSV, exportación/importación, almacenamiento y restablecimiento. Toda modificación funcional requiere regresión. |
| D-10 | **POO con responsabilidades claras, no proliferación de clases.** | Conservar `EntradaAcademica`, `PlanCurricular`, `CalendarioAcademico`, `EscenarioPersonal` y un motor de cálculo aislable. Las funciones puras son válidas; una clase nueva requiere necesidad técnica real. |
| D-11 | **Escenario personal separado de referencia académica.** | Los cambios voluntarios se guardan como diferencias y se aplican sobre la referencia vigente. Preservar eliminaciones y horarios editados en el formato personal vigente. Los archivos `{S}` antiguos se excluyeron por D-24. «Restablecer» regresa a la referencia vigente. |
| D-12 | **Seguridad y validación proporcionadas al producto estático.** | Comprobar la integridad técnica de JSON y escenarios importados sin crear cuentas, servidor o nuevas dependencias ajenas al alcance. Los datos académicos incompletos no son errores técnicos. |
| D-13 | **Una versión pública verificable en cada cambio productivo.** | El número del pie, el `meta` HTML, los parámetros `?v=` de recursos y la versión de despliegue deben concordar. Una PR que cambie recursos de producción debe incrementar la versión. Los cambios exclusivamente documentales no requieren avance de versión. |
| D-14 | **La documentación también vive en el código.** | Usar JSDoc y comentarios próximos a las clases, contratos internos, reglas no obvias y decisiones técnicas no evidentes. Explicar responsabilidades, datos de entrada/salida, invariantes y motivos; no comentar línea por línea ni presentar conjeturas como reglas. Actualizar el comentario cuando cambie el comportamiento. |
| D-15 | **Filtros globales y unidad académica voluntaria.** | Los componentes de la malla y la unidad responsable filtran **las ocho consultas**, sin borrar registros. El departamento (Ingeniería) o facultad (otras áreas) es una atribución opcional del escenario personal por asignatura, independiente del docente, desconocida por defecto y exportable/importable. No se introduce como campo obligatorio de `FuentesAcadémicas` ni se deduce automáticamente. |
| D-24 | **Retirar soporte anterior sin usuarios (0.8.1).** | El único contrato es `FuentesAcadémicas` y el formato personal soportado es `escenario-personal/version:1` con deltas. Se retiraron lectores `{S}`, conciliaciones `reqCred`/ `reqCredAmbiguos`, metadatos `introducidoEn`/`idAnterior`, comparadores y archivos históricos sin consumidor. El historial se consulta en Git. **D-24 sustituye el compromiso de compatibilidad heredada de D-23 y D-21**, sin afectar la persistencia vigente. |
| D-25 | **Multicarrera sí es necesidad solicitada.** | Conservar un motor basado en el contrato y la capacidad de gestionar múltiples programas, sus identidades y configuraciones en una etapa futura. No inventar programas disponibles ni retirar la generalidad por no haberla usado aún. |
| D-26 | **Defensas y entrada flexible son requisitos.** | La ausencia de incidentes no demuestra que las validaciones sobren. Mantener protecciones técnicas frente a entradas imposibles, referencias rotas y datos incompletos; evaluar posibles costos solo cuando haya degradación comprobada. |
| D-27 | **Documentar riesgos y coherencia, no perseguir líneas eliminadas.** | Distinguir el problema que previene cada control y lo que protege GitHub (versionado, CI, despliegue), sin atribuir seguridad automática a sus servicios. Evitar duplicación documental mediante fuentes rectoras y referencias cruzadas. |
| D-23 | **Cierre arquitectónico de ARQ-01 (0.8.0), antecedente.** | Se había conservado temporalmente soporte para archivos anteriores. **Esa parte fue expresamente sustituida por D-24** después de confirmar que no existían usuarios ni archivos antiguos. El flujo de entrada única continúa vigente. |
| D-22 | **Tonos discretos por tipología y contornos legibles (TONO-01).** | Reutilizar la paleta del diseño para B (azul), C (violeta), L (verde), N (gris azulado), con marcas estrechas y fondos mínimos ligados al componente del escenario; incrementar el contraste de dos tokens neutrales sin alterar información ni escalas estadísticas, selección, choques o identidad por carrera. Ver [TONO-01](TONO-01.md). |
| D-21 | **Actualización de requisitos por ID (REG-01).** | Guardar y recuperar solo diferencias por ID y propiedad; no reemplazar colecciones institucionales completas. La rama antigua de conciliación quedó retirada por D-24. La corrección no modifica la entrada académica ni los cálculos. Ver [REG-01](REG-01.md). |
| D-20 | **Mínimos disciplinares TPI y PAI (REQ-C-01).** | Por criterio académico explícito proporcionado para Mecatrónica, TPI (2024045, 3 cr) exige 52 créditos aprobados del componente C y PAI (2017275, 4 cr) exige 65 créditos aprobados del componente C. El contrato actualiza la nota de ambos y el componente contable de PAI. El sistema no valida créditos realmente aprobados y no modifica Trabajo de Grado. Ver [REQ-C-01](REQ-C-01.md). |
| D-19 | **Modo oscuro predeterminado, tema claro optativo y marco curricular de altura intrínseca (TEMA-ALTURA-01).** | La preferencia de tema se guarda fuera del contrato académico y el marco normal de Prerrequisitos adopta la altura del semestre más largo. **Criterio inicial sustituido por D-20/REQ-C-01:** TPI y PAI fueron corregidos después mediante una decisión académica expresa. Esta frase histórica ya no restringe sus valores actuales. Ver [TEMA-ALTURA-01](TEMA-ALTURA-01.md). |
| D-18 | **Libre elección en Prerrequisitos y reparto visual (LIB-01).** | El botón local L muestra posiciones registradas sin alterar filtros globales; el total y los posibles fragmentos de 3 + residuo se derivan del contrato. El equilibrado por carga excluye componentes fuera del plan y conserva la referencia cuando ya está igual de equilibrada, pero no mueve por defecto las posiciones académicas ni valida prerrequisitos porcentuales. Ver [LIB-01](LIB-01.md). |
| D-17 | **Identidad visual universitaria minimalista y temas por programa (UNI-UI-01).** | La presentación comparte tipografía, estructura y componentes; cada carrera usa un acento pequeño según su ID explícito sin cambiar las escalas analíticas, la única entrada académica ni ofrecer programas sin datos. La plataforma sigue siendo no oficial. Ver [UNI-UI-01](ESTILO-UNIVERSITARIO.md). |
| D-16 | **DEM-01: encuesta como anotación personal.** | Las solicitudes por ID curricular se importan desde JSON estructurado de encuesta, separado de la única entrada **académica**. No se requieren cupos ni históricos. Los conteos y grupos sirven para estadística descriptiva, no para afirmar déficit. Los datos desconocidos siguen desconocidos, y el ejemplo aparece marcado como simulado. |

### Lectura temporal de las decisiones

Las filas D-01–D-27 documentan decisiones sucesivas, **no** reglas que permanezcan inalterables cuando una posterior las modifica expresamente. D-19 describe una decisión anterior sobre los créditos TPI/PAI; **D-20 es el criterio actual y prevalece**, mientras que los valores concretos se consultan en `datos/academico.json`. Las reglas de persistencia de D-21 y las señales de tipología de D-22 se suman a las decisiones anteriores sin crear fuentes académicas nuevas. **D-23 documentó el cierre arquitectónico; D-24 retiró la compatibilidad que se había mantenido sin una necesidad real. D-25 a D-27 preservan multicarrera, resiliencia y orden documental.**

El registro de decisiones complementa los requisitos RF/RC y la matriz de no-requisitos de [ARQ-01](ARQUITECTURA.md). Para interpretar el comportamiento actual se contrasta siempre con la fuente normalizada y el código ejecutado.

## 3. Distinciones que no pueden perderse

- **Dato académico registrado** no equivale a **agrupación elegible para el análisis**. Una exclusión analítica no es una eliminación de datos.
- **Grupo sin bloques** no equivale a **grupo inexistente**. Tampoco se le asignan bloques ficticios.
- **Asignatura institucional** no equivale a **posición dentro del plan**. Las posiciones genéricas no reciben códigos inventados.
- **Tipología institucional** no equivale necesariamente a **componente curricular**: por ejemplo, Inglés puede conservar tipología institucional `E` mientras pertenece al componente `N` del plan.
- **Selección de componentes para consulta** no equivale a **modificación del escenario**. Los filtros no alteran ni eliminan datos.
- **Mapa de calor de grupos** no equivale a aulas ocupadas, estudiantes matriculados ni disponibilidad real de salones.
- **Versión del contrato** (`versionEsquema: 1`), **versión del archivo de escenario personal** (`version: 1`) y **versión pública del sitio** (`0.8.0` al corte) son números independientes.

## 4. Qué constituye un problema y qué no

**Problemas verificables:** una entrada alternativa consumida por producción; pérdida u omisión silenciosa de registros; transformación inconsistente de horario; un grupo informativo contando como choque; un filtro que altere el escenario; una edición personal perdida; un JSON inválido que rompa una función existente; una versión visible que no corresponde a los recursos publicados.

**No constituyen problemas por sí mismos:** asignaturas sin grupo, grupos sin horario, cupos en cero, docentes no informados, materias sin relación verificable, diferencias entre el número de cursos en catálogo y el número de posiciones de la malla, scripts antiguos que no se cargan en ejecución, o funcionalidades futuras no aprobadas.

La presencia histórica de nombres de docentes en archivos del repositorio se describe como **hecho de archivo**, no como obligación de mostrar nombres completos, completar datos faltantes o cambiar automáticamente la política de publicación. Cualquier decisión de privacidad requiere un tratamiento explícito y separado de la migración arquitectónica.

## 5. Cómo aplicar estas decisiones

Ante una solicitud, primero identificar la capa afectada en ARQ-01 y el comportamiento que debe conservarse. Antes de editar código o datos, comprobar si el cambio está respaldado por el contrato o una decisión expresa. Mantener los comentarios cercanos al código afectados por la modificación, sin separar su explicación técnica de su implementación. Ante datos contradictorios, **no resolver por conjetura**. Ejecutar pruebas relevantes, revisar la versión pública cuando cambie un recurso productivo y registrar las decisiones nuevas con su motivo.

**Precedencia:** ARQ-01 gobierna la arquitectura; este registro precisa los acuerdos de alcance; [ESTADO-Y-PUBLICACION.md](ESTADO-Y-PUBLICACION.md) describe lo realmente implementado. Una diferencia entre diseño y estado actual se documenta como transición, nunca se oculta cambiando el relato.

Para nuevas decisiones añadir identificador, fecha, motivo, impacto sobre datos/escenarios/vistas y evidencia de aceptación. No reinterpretar unilateralmente acuerdos anteriores.
