# REG-01 — Requisitos mínimos y escenarios personales

**Vigente desde:** 0.7.4; **alcance actualizado:** 1.1.5.
**Referencia superior:** [ARQ-01](ARQUITECTURA.md) · [DEC-01](DECISIONES-Y-ALCANCE.md) · [REQ-C-01](REQ-C-01.md).

## Regla vigente

La fuente académica normalizada define los mínimos de créditos y sus
componentes. El usuario puede modificar un requisito en su escenario, pero
esa acción **no reemplaza toda la colección institucional**.

`EscenarioPersonal.diferencias(S0,S)` guarda únicamente las operaciones
`reqCredCambios` por identidad `posicionId`, con `agregar`, `quitar`
o `modificar`. Cada modificación almacena solo los campos realmente
editados (`min` y `componentes`).

`EscenarioPersonal.aplicar(S0,cambios)` usa la referencia normalizada
vigente y modifica exclusivamente las reglas intervenidas. Las reglas
no editadas reflejan cambios posteriores de la fuente académica.

La identificación por nombre puede utilizarse para reglas **creadas por el
usuario** que aún no tienen un ID institucional. Esto no significa que se
admitan archivos de escenarios anteriores.

## Formato de escenario personal

```json
{
  "tipo": "escenario-personal",
  "version": 1,
  "programaId": "id-del-programa",
  "cambios": {
    "reqCredCambios": {
      "agregar": [],
      "quitar": [],
      "modificar": [
        {"key": "id:posicion-de-ejemplo", "valores": {"min": 10}}
      ]
    }
  }
}
```

El ejemplo expresa **la forma de una operación personal**, no un mínimo
académico real. No es un archivo independiente completo para importar:
otras diferencias personales se omiten aquí por brevedad.

Solo se importa el formato vigente de diferencias `escenario-personal`
con `version:1`. Se rechazaron como fuera de alcance los snapshots de
desarrollo `{S}`, las listas completas `cambios.reqCred` y
`reqCredAmbiguos`: **no existen usuarios ni archivos de aquellas
versiones que recuperar**, según la decisión expresa de 0.8.1.

Los identificadores actuales de posiciones y grupos siguen siendo
necesarios para editar, guardar, importar y aplicar diferencias. No debe
confundirse su función con metadatos de procedencia histórica.

## Comportamientos que deben conservarse

- El cambio de un requisito no modifica otros.
- Las referencias académicas nuevas pueden incorporar grupos o reglas sin
  deshacer una modificación personal por ID.
- Los datos académicos ausentes siguen siendo válidos cuando el contrato
  así lo permite; las referencias rotas y horarios imposibles son errores
  técnicos distintos de la falta de datos.
- No se codifican mínimos ni nombres propios de Mecatrónica en el motor.
- Importar un escenario personal no modifica `datos/academico.json`.
- El cálculo por semestres no certifica créditos realmente aprobados
  por una persona ni su habilitación para inscribir.

## Pruebas

- `tests/escenarios-actualizacion-requisitos.js`: deltas de requisitos,
  nuevas referencias y operaciones de alta/baja, sin lectores anteriores.
- `tests/solo-formatos-vigentes.js`: exclusión de formatos de desarrollo,
  conservación del contrato flexible y de la opción multicarrera.
- `tests/exportacion-escenario.js`: exportación y restauración del
  escenario vigente.
- `tests/escenarios-arq01.js`: grupos, horarios, unidad, validación técnica
  y persistencia de diferencias actuales.

El defecto original de 0.7.3–0.7.4 y su solución por deltas se conservan
en el historial de Git y en las PR #24–25, no como obligaciones de
compatibilidad presentes.

## Identidad e integridad de recuperación (1.1.5)

El contexto del escenario y los archivos exportados conservan programaId del contrato seleccionado. EscenarioPersonal.recuperar valida ese contexto y el estado reconstruido antes de entregar un reemplazo de S. Un ID de posición informado nunca usa el nombre como alternativa para coincidir con otra posición.

Los archivos del formato vigente version:1 anteriores a la adición de programaId solo se aceptan manualmente si sus referencias permiten identificar inequívocamente la base. Una copia local sin metadato se recupera dentro de la clave ya separada por programa. Esto conserva el formato vigente y no restablece lectores de versiones retiradas. Los archivos sin contexto ni referencias suficientes se rechazan sin modificar el escenario activo.

La validación incluye los tipos y las relaciones usados por motor y vistas, sin exigir datos completos. Los créditos y semestres desconocidos permanecen nulos; los grupos sin horarios son válidos. Los cambios no pueden sobrescribir IDs ni analizable de la referencia. [Las regresiones](../tests/frontera-escenarios.js) cubren los archivos ajenos, valores no utilizables y conservación del estado válido.
