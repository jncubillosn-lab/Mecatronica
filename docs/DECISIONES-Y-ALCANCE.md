# DEC-01 — Decisiones, alcance y criterios de conservación

**Estado:** acuerdos adoptados para el desarrollo de Gestor de horarios · Mecatrónica.  
**Revisión:** 7 de noviembre de 2026, con la incorporación de documentación interna de v0.5.2.  
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
| D-02 | **Conversión completamente externa.** Recopilación, extracción, OCR, limpieza, validación de procedencia y conversión de fuentes originales quedan fuera del sistema web. | No añadir conversores ni adaptadores de archivos institucionales como módulos internos. Los scripts históricos del repositorio no son rutas productivas. |
| D-03 | **Contrato basado en información realmente accesible.** No ampliar campos obligatorios por conveniencia de programación. | El contrato fue definido tras evaluar qué datos pueden obtenerse en la práctica. La estructura se valida; la completitud académica no se exige. |
| D-04 | **Resiliencia ante datos faltantes.** `null` = desconocido; `[]` = registros no informados; `0` = valor conocido. | No inventar valores, requisitos, asociaciones, horarios, docentes ni alertas por mera ausencia. No confundir desconocimiento con ausencia institucional. |
| D-05 | **Sin horario o sin grupos, no se inventa un choque.** La interfaz puede mostrar «no choca». | Es una elección funcional deliberada: preferir no generar falsas alarmas. No cambiar etiquetas ni introducir bloqueos por esta razón sin solicitud expresa. |
| D-06 | **Grupos de otras sedes: información conservada, análisis excluido por ahora.** | Se preservan en `oferta` y `agrupaciones`; `analizable: false` los excluye de interferencias, matrices y mapa de calor. La clasificación se declara en la entrada normalizada, no se adivina dentro del código a partir de prefijos. Su inclusión futura requiere respaldo académico. |
| D-07 | **No inferir agrupaciones entre actividades.** | Dos laboratorios, prácticas o teorías no se combinan por nombre, número coincidente ni producto cartesiano. Las agrupaciones verificadas son explícitas; las incompletas permanecen registradas sin combinaciones supuestas. |
| D-08 | **No modificar datos académicos sin evidencia.** | Una migración arquitectónica no autoriza correcciones silenciosas de días, horas, créditos, grupos, identidades ni relaciones. Ante una anomalía, preservar el dato y documentar la incertidumbre hasta verificarla. |
| D-09 | **Conservar íntegramente las funciones existentes.** | Inicio, Interferencias, Asignaturas, Grupos, Horarios, Mapa de calor y Prerrequisitos, además de filtros, edición, CSV, exportación/importación, almacenamiento y restablecimiento, constituyen la base operativa. Toda migración requiere regresión funcional. |
| D-10 | **POO con responsabilidades claras, no proliferación de clases.** | Conservar `EntradaAcademica`, `PlanCurricular`, `CalendarioAcademico`, `EscenarioPersonal` y un motor de cálculo aislable. Las funciones puras son válidas; una clase nueva requiere necesidad técnica real. |
| D-11 | **Escenario personal separado de referencia académica.** | Los cambios voluntarios se guardan como diferencias y se aplican sobre la referencia vigente. Preservar eliminaciones, horarios editados y compatibilidad con archivos `{S}` históricos. «Restablecer» regresa a la referencia vigente. |
| D-12 | **Seguridad y validación proporcionadas al producto estático.** | Comprobar la integridad técnica de JSON y escenarios importados sin crear cuentas, servidor o nuevas dependencias ajenas al alcance. Los datos académicos incompletos no son errores técnicos. |
| D-13 | **Una versión pública verificable en cada cambio productivo.** | El número del pie, el `meta` HTML, los parámetros `?v=` de recursos y la versión de despliegue deben concordar. Una PR que cambie recursos de producción debe incrementar la versión. Los cambios exclusivamente documentales no requieren avance de versión. |
| D-14 | **La documentación también vive en el código.** | Usar JSDoc y comentarios próximos a las clases, contratos internos, reglas no obvias y transiciones históricas. Explicar responsabilidades, datos de entrada/salida, invariantes y motivos; no comentar línea por línea ni presentar conjeturas como reglas. Actualizar el comentario cuando cambie el comportamiento. |

## 3. Distinciones que no pueden perderse

- **Dato académico registrado** no equivale a **agrupación elegible para el análisis**. Una exclusión analítica no es una eliminación de datos.
- **Grupo sin bloques** no equivale a **grupo inexistente**. Tampoco se le asignan bloques ficticios.
- **Asignatura institucional** no equivale a **posición dentro del plan**. Las posiciones genéricas no reciben códigos inventados.
- **Tipología institucional** no equivale necesariamente a **componente curricular**: por ejemplo, Inglés puede conservar tipología institucional `E` mientras pertenece al componente `N` del plan.
- **Selección de componentes para consulta** no equivale a **modificación del escenario**. Los filtros no alteran ni eliminan datos.
- **Mapa de calor de grupos** no equivale a aulas ocupadas, estudiantes matriculados ni disponibilidad real de salones.
- **Versión del contrato** (`versionEsquema: 1`), **versión del archivo de escenario personal** (`version: 1`) y **versión pública de la aplicación** (`0.5.2`) son números independientes.

## 4. Qué constituye un problema y qué no

**Problemas verificables:** una entrada alternativa consumida por producción; pérdida u omisión silenciosa de registros; transformación inconsistente de horario; un grupo informativo contando como choque; un filtro que altere el escenario; una edición personal perdida; un JSON inválido que rompa una función existente; una versión visible que no corresponde a los recursos publicados.

**No constituyen problemas por sí mismos:** asignaturas sin grupo, grupos sin horario, cupos en cero, docentes no informados, materias sin relación verificable, diferencias entre el número de cursos en catálogo y el número de posiciones de la malla, scripts antiguos que no se cargan en ejecución, o funcionalidades futuras no aprobadas.

La presencia histórica de nombres de docentes en archivos del repositorio se describe como **hecho de archivo**, no como obligación de mostrar nombres completos, completar datos faltantes o cambiar automáticamente la política de publicación. Cualquier decisión de privacidad requiere un tratamiento explícito y separado de la migración arquitectónica.

## 5. Cómo aplicar estas decisiones

Ante una solicitud, primero identificar la capa afectada en ARQ-01 y el comportamiento que debe conservarse. Antes de editar código o datos, comprobar si el cambio está respaldado por el contrato o una decisión expresa. Mantener los comentarios cercanos al código afectados por la modificación, sin separar su explicación técnica de su implementación. Ante datos contradictorios, **no resolver por conjetura**. Ejecutar pruebas relevantes, revisar la versión pública cuando cambie un recurso productivo y registrar las decisiones nuevas con su motivo.

**Precedencia:** ARQ-01 gobierna la arquitectura; este registro precisa los acuerdos de alcance; [ESTADO-Y-PUBLICACION.md](ESTADO-Y-PUBLICACION.md) describe lo realmente implementado. Una diferencia entre diseño y estado actual se documenta como transición, nunca se oculta cambiando el relato.

Para nuevas decisiones añadir identificador, fecha, motivo, impacto sobre datos/escenarios/vistas y evidencia de aceptación. No reinterpretar unilateralmente acuerdos anteriores.
