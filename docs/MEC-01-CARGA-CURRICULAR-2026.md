# MEC-01 — Carga curricular verificada de Ingeniería Mecánica

**Fecha:** 18 de noviembre de 2026. **Contrato objetivo:** `datos/programas/mecanica/academico.json`. **Esquema:** `versionEsquema:1`. **Cambio:** solo datos académicos normalizados y controles de regresión. No se incorpora un conversor a GitHub Pages.

## Fuentes cruzadas

1. `Mecanica(1).txt`: catálogo, códigos SIA, créditos, tipologías y descripciones de 59 asignaturas.
2. `Mecanica horarios(1).txt`: 24 asignaturas, **111 grupos**, 183 franjas, 30 condiciones de prerrequisitos y fechas del segundo semestre de 2026.
3. `MallaCurricular-IngenieraMecnicaUNAL_Ac_86_-18_(2).pdf`: página 1, plan de 10 semestres, Acuerdo **68 de 2018** impreso en la propia malla (el nombre del archivo presenta un número distinto), 180 créditos del plan y 12 de lengua extranjera.

La información ya existente en GitHub sirvió como base para reconciliar los datos sin borrar identidades ni escenarios.

## Resultado técnico del contrato

| Dato | Antes | Después |
|---|---:|---:|
| Posiciones curriculares | 58 | 58 |
| Entradas de catálogo | 59 | 59 |
| Asignaturas con oferta | 24 | 24 |
| Grupos de la oferta | 101 | **111** |
| Agrupaciones con identidad estable | 72 | 72 |
| Agrupaciones analizables | 72 | **71** |
| Relaciones de prerrequisitos | 0 | **41** |
| Mínimos absolutos de créditos definidos | 0 | **0** |

Se comprobaron idénticos los horarios, cupos disponibles, fechas y duración de los **101 grupos preexistentes**, mientras que los diez grupos ausentes se incorporaron por identificador de actividad y grupo. Se preservaron los cuatro grupos con horarios no informados; no se generaron sesiones adicionales. Los 56 valores de facultad dañados o concatenados por la extracción se normalizaron a `null` cuando no pudieron verificarse; los datos de profesor, aula, fecha y horario se conservaron en las propiedades correspondientes.

Las 72 agrupaciones preservan orden e identidad; el grupo 40 de TPI se rotula en la fuente como **reserva/bloqueo de espacios**, no como clase. Se establece `analizable:false` para evitar falsos choques sin eliminarlo del contrato. **No se crearon relaciones entre teoría, laboratorio o magistral sin correspondencia verificable.**

## Malla: créditos y componentes

Se conservan todos los IDs, nombres, semestres y créditos existentes. Se corrige el componente curricular de **Tecnología mecánica básica** (`2017278`) e **Ingeniería y desarrollo sostenible** (`2017265`) de B a C, y de cuatro casillas optativas sin componente (dos a B, dos a C), con verificación del total:

| Componente | Créditos |
|---|---:|
| Fundamentación B | 58 |
| Disciplinar C | 86 |
| Libre elección L | 36 |
| **Plan** | **180** |
| Lengua extranjera N (adicional) | 12 |

Los títulos del plan no se reescriben para no alterar referencias personales; los nombres SIA aparecen en el catálogo y la oferta por código.

## Prerrequisitos y límites

Se integran 41 flechas respaldadas por la malla de 2018. De ellas, 29 coinciden con alternativas del SIA 2026-2 y 12 tienen solo evidencia del diagrama del plan. **La existencia de una flecha en la malla no demuestra por sí sola que esa condición sea idéntica a la regla vigente de matrícula.** El contrato conserva el marcador de flecha y la trazabilidad detallada se guarda en `data/programas/mecanica/revision-prerrequisitos-2026.json`.

Las **30 condiciones** originales del SIA contienen disyunciones de cursos históricos y condiciones que pueden requerirse conjuntamente. Esas alternativas no se pierden ni se crean como posiciones ficticias: el mapa muestra las relaciones con códigos vigentes de la malla y el registro externo guarda la forma institucional completa.

Los avances de **55 % (TPI 2024045), 75 % (PAI 2017275), 80 % (Trabajo de grado 2017295)** quedan documentados como porcentajes del plan de 180 créditos. Las equivalencias aritméticas 99/135/144 créditos no se convierten a `minimosCreditos`, porque la fuente no confirma si la regla se mide por créditos aprobados/cursados, componente específico u otra semántica institucional.

## Garantías y pendientes

- Conservación de los 101 grupos previos y de los 72 IDs y órdenes de agrupaciones.
- No se modifica ninguna otra carrera ni las reglas del navegador.
- No se introducen cursos ficticios, horarios para grupos sin información ni combinaciones implícitas de actividades.
- Condiciones SIA históricas, flechas solo PDF, porcentajes, diferencias de nomenclatura y datos dudosos permanecen en el registro externo.
- Pruebas de identidad, referencias de 41 relaciones, sumas B/C/L/N, cobertura de grupos y exclusión de reserva; CI y certificación de Pages son requisitos antes de considerar publicada la versión.

**Archivo de revisión externo:** [registro de Mecánica](../data/programas/mecanica/revision-prerrequisitos-2026.json).
