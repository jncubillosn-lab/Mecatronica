# QUI-01 — Contrato limpio y requisitos de Ingeniería Química

Para la oferta 2026-2 vigente en 1.1.13, véase la [revisión de agrupaciones de las tres carreras](AGRUPACIONES-OFERTA-2026.md). Allí se identifican las relaciones verificadas y los grupos consultables por separado.

**Fecha de corte:** 18 de noviembre de 2026. **Contrato:** `datos/programas/quimica/academico.json` (`versionEsquema: 1`). La carga es documental; el servicio web no convierte directamente archivos externos.

## 1. Fuentes contrastadas

- `Química(1).txt` — 67 registros SIA de catálogo con códigos, créditos, tipologías, descripciones y constancia de asignaturas no programadas.
- `Química horarios(1).txt` — 29 asignaturas en oferta documental 2026-2, 91 grupos de 32 actividades y **35 condiciones** de matrícula distribuidas en 23 asignaturas. Incluye alternativas de códigos históricos y requisitos de tipo M o Y.
- `Malla_Curricular_-_Ingeniería_Química(2).pdf` — dos páginas, **Acuerdo 02 de 2013**, diez semestres, agrupaciones optativas, grafo de requisitos y 180 créditos B/C/L del plan; 20 créditos de Nivelación adicionales (Matemáticas básicas 4, Lectoescritura 4, Inglés I–IV 12).

La malla de 2013 puede mostrar nomenclaturas y códigos distintos de la oferta 2026. El cotejo registra esas diferencias; no las oculta.

## 2. Resultado de integridad

| Propiedad | Antes | Después |
|---|---:|---:|
| Posiciones curriculares (IDs preservados) | 63 | 63 |
| Entradas únicas de catálogo | 72 | 72 |
| Cursos documentados en la oferta | 29 | 29 |
| Grupos de actividades | 89 | **91** |
| Agrupaciones explícitas (IDs y orden intactos) | 48 | 48 |
| Prerrequisitos visibles por ID | 0 | **37** |
| Requisitos mínimos numéricos aplicados | 0 | 0 |

Los 89 grupos anteriores se cotejaron por código, actividad e ID de grupo, comprobando **igualdad de horarios, cupos disponibles, fechas, duración y jornada**. Los dos registros nuevos pertenecen a PEAMA–Orinoquía (`2015718`, actividad de taller y teórica, grupo `ORIN-01`), por lo que se conservan en la oferta pero no se añaden al análisis de Bogotá. Los grupos de reserva TPI 40 y 41 no son clases y tampoco generan agrupaciones analizables. No se forman combinaciones de teoría y taller por el mismo número de grupo.

## 3. Códigos y componentes

Se conservan los nombres e IDs de las posiciones curriculares para no romper escenarios. Se corrigen ocho referencias de código contrastadas con el catálogo y el SIA: los cinco sufijos `-B` institucionales, Biología molecular y celular `1000010-B`, Laboratorio de principios de Química Orgánica `1000031-B`, y Manejo de sólidos `2015726` (la malla presenta `2015276`). Se retira exclusivamente la entrada incorrecta `1000010` que identificaba el laboratorio orgánico a pesar de existir como `1000031-B`; se conserva Biología `1000010-B` y no se duplican materias.

Las cinco posiciones optativas sin componente quedan vinculadas solo a su **agrupación y componente**, no a una asignatura concreta: Herramientas de la Ingeniería (B), Termodinámica (C), Ciencias Económicas y Administrativas (B), Procesos Químicos y Bioquímicos (C), Materiales (C).

| Componente | Créditos |
|---|---:|
| Fundamentación (B) | 69 |
| Disciplinar (C) | 75 |
| Libre elección (L) | 36 |
| **Plan** | **180** |
| Nivelación (N, adicional) | 20 |

## 4. Requisitos y cautelas

Se representan **28 pares** respaldados por condiciones **M** del SIA 2026 con una alternativa inequívoca reconocida en las posiciones del plan, más **9 pares** solo sustentados en flechas de la malla de 2013. La etiqueta de flecha sirve al mapa, **no sustituye la lógica original de cada condición**.

Las **35 condiciones originales** (incluidas las alternativas OR de códigos antiguos, el indicador ¿Todas?, y una condición tipo Y) se guardan en `data/programas/quimica/revision-prerrequisitos-2026.json`. Siete condiciones no se convirtieron en aristas directas: corresponden al tipo distinto de M o a asignaturas optativas sin posición individual en la malla. Las nueve flechas basadas solo en el PDF permanecen señaladas como evidencia histórica, con vigencia pendiente de verificar.

La malla imprime marcadores 108, 53 y 60 créditos asociados a puntos del recorrido; sin determinar con suficiente certeza su base normativa y vigencia, **no se crean requisitos absolutos** ni se copia la regla de Mecatrónica. La malla 2013 indica TPI `2015737`; la oferta SIA 2026 presenta `2024045`. Se mantienen independientes sin dar por hecho que una es sustitución normativa de la otra.

## 5. Garantías y revisión pendiente

- El contrato publicado de Química es el único recurso académico leído por sesión. No se añade otro lector, motor, interfaz ni lógica por carrera.
- Los códigos históricos y fuentes SIA se preservan en la revisión externa, sin crear posiciones ni créditos ficticios.
- Las posiciones y las 48 agrupaciones conservan IDs/orden para minimizar impactos en escenarios personales.
- No se deducen horarios faltantes, combinaciones no documentadas ni requisitos de optativas sin curso específico.
- Las otras ocho bases académicas permanecen sin modificaciones.

**Expediente técnico:** [condiciones SIA, evidencia y discrepancias](../data/programas/quimica/revision-prerrequisitos-2026.json). Se exige superar CI y certificar GitHub Pages antes de declarar disponible la carga.
