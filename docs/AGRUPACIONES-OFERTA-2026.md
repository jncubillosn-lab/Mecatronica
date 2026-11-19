# Agrupaciones de Electrónica, Mecánica y Química · 2026-2

## Criterio vigente

La oferta registra grupos de actividad. Una agrupación analizable representa una opción completa cuya relación entre componentes está respaldada. El lector proyecta las agrupaciones explícitas del programa seleccionado. Los grupos de actividad con posición curricular conocida y sin pareja acreditada conservan sus horas bajo «solo consulta». La matriz, el mapa de calor y los indicadores de demanda utilizan las alternativas activas y elegibles. Una pareja con cero alternativas comparables queda fuera del recuento de asignaturas comparadas. Ver [ARQ-01](ARQUITECTURA.md) y las decisiones D-04, D-06, D-07 y D-08 de [DEC-01](DECISIONES-Y-ALCANCE.md).

## Cobertura comprobada en 1.1.14

Se cotejaron los archivos de horarios citados en [ELE-01](ELE-01-CARGA-CURRICULAR-2026.md), [MEC-01](MEC-01-CARGA-CURRICULAR-2026.md) y [QUI-01](QUI-01-CARGA-CURRICULAR-2026.md) con la oferta por código, actividad, grupo, día, hora inicial y final y cupos disponibles. Se aplicó el G1 único de TPI documentado en [DAT-01](CONTRATOS-POR-PROGRAMA.md). En Química se contabiliza cada franja semanal una sola vez por grupo, aunque el texto la repita para aulas o fechas. Los detalles originales de horario permanecen en la oferta.

| Carrera | Asignaturas en oferta | Grupos de actividad en oferta | Grupos de actividad con horario o ficha en las vistas | Opciones analizables | Registros solo consulta | Bloques semanales en las vistas |
|---|---:|---:|---:|---:|---:|---:|
| Electrónica | 23 | 125 | 120 | 74 | 26 | 174 |
| Mecánica | 24 | 90 | 87 | 55 | 31 | 143 |
| Química | 29 | 70 | 56 | 48 | 8 | 84 |

Las alternativas pueden compartir una actividad. Por ejemplo, las ocho opciones de Control utilizan cuatro magistrales y ocho laboratorios. La proyección mantiene una identidad por bloque de actividad y permite que varias opciones utilicen la misma sesión.

## Relaciones comprobadas

- **Control (2016493), Electrónica.** El contrato vigente de Mecatrónica declara M1 con L1 o L2, M2 con L3 o L4, M3 con L5 o L6 y M4 con L7 o L8. En ambas ofertas coinciden el código, las actividades, los doce IDs de grupo y todas sus franjas. Electrónica registra ocho parejas con los componentes y horarios de su propia oferta. Se conservaron los IDs de bloque usados por las ediciones de horario. Las ocho parejas tienen identidad propia. Una eliminación personal de una de las doce fichas individuales anteriores no se traslada a una pareja distinta.
- **Ingeniería y desarrollo sostenible (2017265), Mecánica.** El mismo curso en Mecatrónica declara G1, G3 y G4 con sus respectivas teóricas y la magistral 1M compartida. Coinciden todas las franjas y los identificadores. Las dos actividades SUMA-01 permanecen exclusivamente en la oferta.
- **Electrónica.** Por decisión del responsable del gestor, para esta oferta se publican las parejas consecutivas de Circuitos II, Control, Análoga II, Potencia, Digital I, Digital II e Introducción. Cada magistral se asocia a dos laboratorios o talleres consecutivos de Bogotá. Análoga I (5/12) e Instrumentación (2/3) quedan por confirmar. Circuitos de RF admite M1+L1 y M1+L2 por el mismo criterio, pero carece de posición curricular acreditada. Las tres optativas temáticas de actividad única siguen pendientes de vinculación curricular. Las parejas representan el criterio del gestor.
- **Mecánica.** Se recuperaron para consulta 31 grupos de seis asignaturas: Electrónica básica (4), Fundamentos de transferencia de calor (9), Ingeniería de Manufactura (3), Instalaciones y máquinas eléctricas (6), Procesos de Manufactura II (5) y Proyecto aplicado de ingeniería (4). La magistral semestral 1M figura con sus horarios. G7 de Estática, cuya duración es Validación y carece de bloques, permanece en la oferta.
- **Química.** Diseño de plantas y equipos (2015712) y Diseño de procesos químicos y bioquímicos (2015713) tienen, cada una, una teórica y tres talleres con horario. Se recuperaron los ocho registros en Grupos y Horarios. Introducción (2015718) solo aporta dos registros de Orinoquía. TPI conserva G1 en la oferta y una identidad curricular distinta en la malla, según DAT-01. La revisión mantiene en oferta las demás asignaturas sin correspondencia curricular acreditada.

## Verificación

[Prueba de cobertura](../tests/cobertura-horaria.js) contrasta cada bloque proyectado con la oferta, identifica las excepciones que quedan solo en oferta y recalcula independientemente cada celda de la matriz a partir de los dos horarios correspondientes. [Prueba multicarrera](../tests/multicarrera.js) abre las ocho vistas del gestor y comprueba los casos de Control, Desarrollo Sostenible y Diseño de plantas desde Grupos, Horarios y las vistas de análisis.
