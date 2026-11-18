# Complementación documental de bases académicas UNAL

**Preparación local — 18 de noviembre de 2026.** No se ha realizado ninguna publicación ni modificación del repositorio, motor ni interfaz.

## Alcance y criterio de limpieza

Se partió de ocho contratos académicos `versionEsquema: 1` previamente construidos a partir de la documentación curricular y comparados con los conteos existentes en GitHub. El campo `programa.id`, la malla, los semestres, los códigos de asignatura, los requisitos registrados, la configuración y las claves de escenario se preservan. Solo se actualizan registros expresamente respaldados por los cuatro TXT de horarios y los cuatro TXT de catálogo.

- Los horarios de agosto a diciembre de 2026 se reconocieron por día, hora de inicio y hora de fin; `detalleHorario` conserva el dato de fecha y aula completo. La disponibilidad de cupos se transcribe como **cupos disponibles en la consulta**, nunca como capacidad o cupo total.
- En Química se identificaron 11 grupos con varios intervalos consecutivos de fechas y la misma franja semanal; la duplicación de fechas se normalizó sin alterar sus horas. Si los horarios cambian entre intervalos, se evita crear agrupaciones semanales engañosas.
- Cada actividad y grupo se conserva por separado. Solo una asignatura con **una actividad identificada, posición curricular única por código y horario estable** recibe agrupaciones analizables. Con dos o más actividades no se inventan correspondencias de teoría/laboratorio y se registra `exclusionesAgrupacion`.
- Los registros que no están identificados en la malla quedan en `oferta`, pero sin semestre atribuido ni agrupaciones analíticas. Una asignatura sin grupos o un grupo sin horas se conserva sin datos ficticios.
- Los requisitos de matrícula extraídos del portal de oferta contienen condiciones alternativas, créditos y otras modalidades. Se conservan en `revision/<carrera>.json` sin convertirlos en prerrequisitos del motor hasta poder confirmar las equivalencias y la semántica. Los requisitos del contrato anterior se preservan.
- Las mallas y acuerdos PDF adjuntos coinciden con las fuentes documentales utilizadas para construir las bases iniciales: sirven para cotejar créditos/códigos y mantener las alertas conocidas. No se sustituyen sus posiciones por nombres parecidos.

## Resumen de los ocho programas

| Carrera | Estado | Cursos de oferta nuevos | Actividades | Grupos | Agrupaciones analizables | Catálogo anterior → final | Alertas |
|---|---|---:|---:|---:|---:|---:|---:|
| electronica | Complementada | 23 | 33 | 144 | 31 | 63 → 63 | 16 |
| industrial | Complementada | 34 | 34 | 63 | 20 | 22 → 67 | 18 |
| mecanica | Complementada | 24 | 32 | 101 | 72 | 40 → 59 | 11 |
| quimica | Complementada | 29 | 32 | 89 | 48 | 40 → 72 | 19 |
| electrica | Sin cambios | 0 | 0 | 0 | 0 | 65 → 65 | 0 |
| sistemas | Sin cambios | 0 | 0 | 0 | 0 | 96 → 96 | 0 |
| civil | Sin cambios | 0 | 0 | 0 | 0 | 66 → 66 | 0 |
| agricola | Sin cambios | 0 | 0 | 0 | 0 | 66 → 66 | 0 |

## Hallazgos que impiden completar automáticamente

### Electronica
- **componentes_multiples**: 8 caso(s).
- **oferta_sin_posicion_curricular**: 7 caso(s).
- **grupo_sin_horario**: 1 caso(s).

- Código `2016490`: componentes_multiples. 2 actividades sin emparejamiento documentado. **Decisión:** mantener actividad y grupos en oferta; excluir de análisis.
- Código `2016493`: oferta_sin_posicion_curricular. La oferta existe, pero la malla no contiene posición curricular con este código.. **Decisión:** mantener solo en oferta; no inventar semestre.
- Código `2028816`: oferta_sin_posicion_curricular. La oferta existe, pero la malla no contiene posición curricular con este código.. **Decisión:** mantener solo en oferta; no inventar semestre.
- Código `2016495`: componentes_multiples. 2 actividades sin emparejamiento documentado. **Decisión:** mantener actividad y grupos en oferta; excluir de análisis.
- Código `2016496`: componentes_multiples. 2 actividades sin emparejamiento documentado. **Decisión:** mantener actividad y grupos en oferta; excluir de análisis.
- Código `2016497`: componentes_multiples. 2 actividades sin emparejamiento documentado. **Decisión:** mantener actividad y grupos en oferta; excluir de análisis.
- Código `2016498`: componentes_multiples. 2 actividades sin emparejamiento documentado. **Decisión:** mantener actividad y grupos en oferta; excluir de análisis.
- Código `2016499`: componentes_multiples. 2 actividades sin emparejamiento documentado. **Decisión:** mantener actividad y grupos en oferta; excluir de análisis.
- Hay 8 alertas adicionales detalladas en `revision/electronica.json` y `alertas_para_revision.csv`.

### Industrial
- **oferta_sin_posicion_curricular**: 18 caso(s).

- Código `2016204`: oferta_sin_posicion_curricular. La oferta existe, pero la malla no contiene posición curricular con este código.. **Decisión:** mantener solo en oferta; no inventar semestre.
- Código `2016317`: oferta_sin_posicion_curricular. La oferta existe, pero la malla no contiene posición curricular con este código.. **Decisión:** mantener solo en oferta; no inventar semestre.
- Código `2016589`: oferta_sin_posicion_curricular. La oferta existe, pero la malla no contiene posición curricular con este código.. **Decisión:** mantener solo en oferta; no inventar semestre.
- Código `2026551`: oferta_sin_posicion_curricular. La oferta existe, pero la malla no contiene posición curricular con este código.. **Decisión:** mantener solo en oferta; no inventar semestre.
- Código `2016028`: oferta_sin_posicion_curricular. La oferta existe, pero la malla no contiene posición curricular con este código.. **Decisión:** mantener solo en oferta; no inventar semestre.
- Código `2016592`: oferta_sin_posicion_curricular. La oferta existe, pero la malla no contiene posición curricular con este código.. **Decisión:** mantener solo en oferta; no inventar semestre.
- Código `2016741`: oferta_sin_posicion_curricular. La oferta existe, pero la malla no contiene posición curricular con este código.. **Decisión:** mantener solo en oferta; no inventar semestre.
- Código `2016037`: oferta_sin_posicion_curricular. La oferta existe, pero la malla no contiene posición curricular con este código.. **Decisión:** mantener solo en oferta; no inventar semestre.
- Hay 10 alertas adicionales detalladas en `revision/industrial.json` y `alertas_para_revision.csv`.

### Mecanica
- **componentes_multiples**: 7 caso(s).
- **grupo_sin_horario**: 2 caso(s).
- **tipologia_malla_catalogo_difieren**: 2 caso(s).

- Código `2017260`: componentes_multiples. 2 actividades sin emparejamiento documentado. **Decisión:** mantener actividad y grupos en oferta; excluir de análisis.
- Código `2017262`: componentes_multiples. 3 actividades sin emparejamiento documentado. **Decisión:** mantener actividad y grupos en oferta; excluir de análisis.
- Código `2017264`: componentes_multiples. 2 actividades sin emparejamiento documentado. **Decisión:** mantener actividad y grupos en oferta; excluir de análisis.
- Código `2017265`: componentes_multiples. 2 actividades sin emparejamiento documentado. **Decisión:** mantener actividad y grupos en oferta; excluir de análisis.
- Código `2017266`: componentes_multiples. 2 actividades sin emparejamiento documentado. **Decisión:** mantener actividad y grupos en oferta; excluir de análisis.
- Código `2016640`: grupo_sin_horario. Actividad CLASE TEORICA 2016640 (2016640), grupo 7: horario no informado. **Decisión:** conservar sin bloques; no analizar.
- Código `2017274`: componentes_multiples. 2 actividades sin emparejamiento documentado. **Decisión:** mantener actividad y grupos en oferta; excluir de análisis.
- Código `2017275`: componentes_multiples. 2 actividades sin emparejamiento documentado. **Decisión:** mantener actividad y grupos en oferta; excluir de análisis.
- Hay 3 alertas adicionales detalladas en `revision/mecanica.json` y `alertas_para_revision.csv`.

### Quimica
- **oferta_sin_posicion_curricular**: 10 caso(s).
- **actividad_sin_grupos**: 3 caso(s).
- **componentes_multiples**: 3 caso(s).
- **codigo_catalogo_nombre_contradiccion**: 1 caso(s).
- **grupo_sin_horario**: 1 caso(s).
- **malla_catalogo_codigo_nombre_distinto**: 1 caso(s).

- Código `1000010-B`: codigo_catalogo_nombre_contradiccion. Nombre anterior: Laboratorio de principios de química orgánica; coincidencia=0.15. **Decisión:** preservar registro anterior.
- Código `2015708`: actividad_sin_grupos. CLASE TEORICA (2015708). **Decisión:** mantener oferta sin agrupaciones.
- Código `2015712`: componentes_multiples. 2 actividades sin emparejamiento documentado. **Decisión:** mantener actividad y grupos en oferta; excluir de análisis.
- Código `2015713`: componentes_multiples. 2 actividades sin emparejamiento documentado. **Decisión:** mantener actividad y grupos en oferta; excluir de análisis.
- Código `2015715`: actividad_sin_grupos. CLASE TEORICA (2015715). **Decisión:** mantener oferta sin agrupaciones.
- Código `2015718`: componentes_multiples. 2 actividades sin emparejamiento documentado. **Decisión:** mantener actividad y grupos en oferta; excluir de análisis.
- Código `2015726`: oferta_sin_posicion_curricular. La oferta existe, pero la malla no contiene posición curricular con este código.. **Decisión:** mantener solo en oferta; no inventar semestre.
- Código `2024045`: grupo_sin_horario. Actividad CLASE TEORICA (2024045), grupo 41: horario no informado. **Decisión:** conservar sin bloques; no analizar.
- Hay 11 alertas adicionales detalladas en `revision/quimica.json` y `alertas_para_revision.csv`.

## Cobertura documental sin cambio

Eléctrica, Sistemas y Computación, Civil y Agrícola reciben el mismo `academico.json` de referencia que ya tenían, porque entre los archivos nuevos no hay un TXT de oferta de grupos para esas carreras. Sus PDF no justifican por sí solos inventar sesiones ni modificar el horario.
Mecatrónica no forma parte de esta complementación; no se modifica su base ni sus escenarios.

## Archivos y orden de aplicación (no ejecutado)

- `contratos/<id>/academico.json`: versión completa de cada contrato, ocho programas; los cuatro sin oferta nueva siguen inalterados.
- `complementos/<id>.json`: información enriquecida completa de catálogo/oferta/agrupaciones, para conciliación.
- `diferencias/<id>.json`: **solo las adiciones y cambios** respecto de la base anterior, separados por código y `posicionId` (no es una segunda fuente aceptada por el navegador).
- `revision/<id>.json`: conflictos, grupos sin horario y condiciones de requisitos dejados pendientes.
- `resumen_cobertura.csv`, `alertas_para_revision.csv`: controles de conciliación.

Para utilizar estas propuestas en una sesión futura hay que validar los pendientes y sustituir el contrato de **cada carrera por separado**, sin incorporar herramientas de extracción a la aplicación. No se ha escrito nada en GitHub.
