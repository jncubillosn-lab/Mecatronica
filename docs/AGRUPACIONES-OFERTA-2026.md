# Agrupaciones de Electrónica, Mecánica y Química · 2026-2

## Criterio vigente

La oferta registra grupos de actividad. Una agrupación analizable representa una opción completa cuya relación entre componentes está respaldada. El lector proyecta las agrupaciones explícitas del programa seleccionado. Los grupos de actividad con posición curricular conocida y sin pareja acreditada conservan sus horas bajo «solo consulta». La matriz, el mapa de calor y los indicadores de demanda utilizan las alternativas activas y elegibles. Una pareja con cero alternativas comparables queda fuera del recuento de asignaturas comparadas. Ver [ARQ-01](ARQUITECTURA.md) y las decisiones D-04, D-06, D-07 y D-08 de [DEC-01](DECISIONES-Y-ALCANCE.md).

Para preparar una agrupación, se comparan los bloques de cátedra, laboratorio y taller en una semana de referencia durante las 16 semanas. Dos actividades que se superponen el mismo día quedan descartadas como pareja, independientemente de sus fechas de vigencia. Una sesión puede comenzar al terminar la anterior. Compartir docente es un indicio de asociación. La entrada registra las parejas confirmadas explícitamente.

## Cobertura comprobada en 1.1.16

Se cotejaron los horarios del contrato vigente de cada carrera con la oferta por código, actividad, grupo, día, hora inicial y final y cupos disponibles. Se aplicó el G1 único de TPI documentado en [DAT-01](CONTRATOS-POR-PROGRAMA.md). En Química se contabiliza cada franja semanal una sola vez por grupo, aunque el texto la repita para aulas o fechas. Los detalles originales de horario permanecen en la oferta.

| Carrera | Asignaturas en oferta | Grupos de actividad en oferta | Grupos de actividad con horario o ficha en las vistas | Opciones analizables | Registros solo consulta | Bloques semanales en las vistas |
|---|---:|---:|---:|---:|---:|---:|
| Electrónica | 23 | 125 | 120 | 93 | 0 | 174 |
| Mecánica | 24 | 90 | 87 | 67 | 15 | 143 |
| Química | 29 | 70 | 56 | 48 | 8 | 84 |

Las alternativas pueden compartir una actividad. Por ejemplo, las ocho opciones de Control utilizan cuatro magistrales y ocho laboratorios. La proyección mantiene una identidad por bloque de actividad y permite que varias opciones utilicen la misma sesión.

## Relaciones comprobadas

- **Control (2016493), Electrónica.** El contrato vigente de Mecatrónica declara M1 con L1 o L2, M2 con L3 o L4, M3 con L5 o L6 y M4 con L7 o L8. En ambas ofertas coinciden el código, las actividades, los doce IDs de grupo y todas sus franjas. Electrónica registra ocho parejas con los componentes y horarios de su propia oferta. Se conservaron los IDs de bloque usados por las ediciones de horario. Las ocho parejas tienen identidad propia. Una eliminación personal de una de las doce fichas individuales anteriores no se traslada a una pareja distinta.
- **Ingeniería y desarrollo sostenible (2017265), Mecánica.** El mismo curso en Mecatrónica declara G1, G3 y G4 con sus respectivas teóricas y la magistral 1M compartida. Coinciden todas las franjas y los identificadores. Las dos actividades SUMA-01 permanecen exclusivamente en la oferta.
- **Electrónica.** Por decisión del responsable del gestor, para esta oferta se publican las parejas consecutivas de Circuitos II, Control, Análoga II, Potencia, Digital I, Digital II e Introducción. Cada magistral se asocia a dos laboratorios o talleres consecutivos de Bogotá. En Electrónica análoga I, M1 admite L1 o L2, M2 admite L3 a L6, M3 admite L7 o L8, M4 admite L9 o L10 y M5 admite L11 o L12. En Instrumentación y medidas, M1 admite L1 o L2 y M2 admite L3. Estas relaciones fueron confirmadas por el responsable del gestor. Circuitos de RF admite M1+L1 y M1+L2 por el mismo criterio, pero carece de posición curricular acreditada. Circuitos integrados lineales y aplicaciones (2028211 G1 y G2) ocupa la casilla Optativa Electrónica Análoga de semestre 6. Sistemas embebidos (2016508 G1) y Verificación de sistemas digitales (2016512 G1) son alternativas de Optativa Electrónica Digital de semestre 7. Las parejas representan el criterio del gestor.

- **Mecánica.** La magistral única 1M se combina con las teóricas G1 a G3 de Electrónica básica, las teóricas G1 y G2 de Ingeniería de Manufactura, los laboratorios L1 a L4 de Procesos de Manufactura II y las teóricas G1 a G3 de Proyecto aplicado de ingeniería. Cada combinación tiene un docente en común y pasa la comprobación de cruce semanal. Fundamentos de transferencia de calor (9 fichas) e Instalaciones y máquinas eléctricas (6 fichas) se consultan por actividad hasta identificar su vinculación. En Transferencia de calor, 3T se cruza con L3 el jueves de 11:00 a 13:00. G7 de Estática, registrado como Validación, permanece en la oferta sin horario.
- **Química.** Diseño de plantas y equipos (2015712) y Diseño de procesos químicos y bioquímicos (2015713) tienen, cada una, una teórica y tres talleres con horario. Se recuperaron los ocho registros en Grupos y Horarios. Introducción (2015718) solo aporta dos registros de Orinoquía. TPI conserva G1 en la oferta y una identidad curricular distinta en la malla, según DAT-01. La revisión mantiene en oferta las demás asignaturas sin correspondencia curricular acreditada.

## Verificación

[Prueba de cobertura](../tests/cobertura-horaria.js) contrasta cada bloque proyectado con la oferta, identifica las excepciones que quedan solo en oferta y recalcula independientemente cada celda de la matriz a partir de los dos horarios correspondientes. [Prueba multicarrera](../tests/multicarrera.js) abre las ocho vistas del gestor y comprueba los casos de Control, Desarrollo Sostenible y Diseño de plantas desde Grupos, Horarios y las vistas de análisis.
