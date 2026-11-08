# REQ-C-01 — Requisitos disciplinares de TPI y PAI

**Fecha de adopción:** 8 de noviembre de 2026 · **Versión:** 0.7.3 · **Programa:** Ingeniería Mecatrónica (plan `acuerdo-6-2022`).

## Criterio académico explícitamente suministrado

| Asignatura | Código SIA | Créditos de la asignatura | Requisito de inscripción |
|---|---|---:|---|
| Taller de Proyectos Interdisciplinarios (TPI) | `2024045` | 3 | Haber aprobado **52 créditos del componente disciplinar (C)** |
| Proyecto Aplicado de Ingeniería (PAI) | `2017275` | 4 | Haber aprobado **65 créditos del componente disciplinar (C)** |

**Procedencia de esta corrección:** criterio específico proporcionado por la persona responsable de la edición del proyecto en la conversación del 8 de noviembre de 2026. No se atribuye aquí una comprobación independiente del articulado SIA/acuerdo que no se haya realizado.

## Cambio en la fuente estandarizada

Archivo: `datos/academico.json`, **única entrada académica** (ARQ-01).

- `malla[].nota` de TPI y PAI: reemplaza «créditos aprobados del plan» por «créditos aprobados del componente disciplinar (C)».
- `requisitos.minimosCreditos[]` de PAI: `componentes` pasa de `["B","C","L"]` a `["C"]`; `minimo` continúa en 65.
- El requisito de TPI ya estaba configurado con `["C"]` y `minimo:52`: **no** se modifica su umbral ni su conjunto de componentes.
- Se preservan ambos códigos SIA, los créditos de las asignaturas (3 y 4), posiciones, semestres, grupos y relaciones.
- **Trabajo de Grado permanece sin cambios** (`69` créditos, componentes `["B","C","L"]` en la referencia vigente), pendiente de análisis separado.
- Tampoco se altera el requisito `70 % Prog.` no modelado todavía.

El motor `PlanCurricular` ya interpreta los componentes de cada requisito como datos; no necesita una regla especial para Mecatrónica. El cálculo de contraste sobre la **distribución curricular de semestres anteriores** ahora contabiliza únicamente créditos C para ambas asignaturas.

## Precisión de interpretación

**«Haber aprobado» no equivale a estar ubicado en un semestre anterior**. Esta aplicación, que no recibe expedientes individuales de aprobación, no puede certificar si una persona cumple el requisito administrativo de inscripción. La vista de Prerrequisitos representa la regla de aprobación y ofrece solo una comprobación hipotética de distribución curricular. No debe mostrarse como verificación de créditos aprobados por un estudiante real.

## Compatibilidad y pruebas

- `tests/requisitos-tpi-pai.js`: verifica identidad SIA, créditos, texto, umbral y componente en la única entrada; el adaptador de lectura; que B/L/N no sustituyan C al evaluar escenarios de prueba, y que Trabajo de Grado quede intacto.
- `npm test` conserva el conjunto completo de contrato ARQ-01, escenarios personales, filtros, las ocho vistas y la integración.
- Los escenarios personales actuales se reconstruyen sobre la nueva referencia. Las modificaciones explícitas y previas de requisitos realizadas por una persona en su escenario deben seguir tratándose como **ediciones personales**, no sobrescribirse silenciosamente.
