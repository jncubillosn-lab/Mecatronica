# REG-01 — Actualización segura de requisitos en escenarios personales

**Fecha:** 8 de noviembre de 2026 · **Versión:** 0.7.4.  
**Ámbito:** representación y recuperación de modificaciones personales de requisitos mínimos. **No cambia** el único contrato académico, el motor de créditos, la malla, las vistas curriculares ni los cálculos de interferencias.  
**Documentos rectores:** [ARQ-01](ARQUITECTURA.md) · [DEC-01](DECISIONES-Y-ALCANCE.md) · [REQ-C-01](REQ-C-01.md).

## 1. Defecto reproducido antes de modificar producción

`EscenarioPersonal.diferencias(base,actual)` escribía **toda la colección** `reqCred` al modificar una sola regla. `EscenarioPersonal.aplicar(baseVigente,cambios)` sustituía con ella todas las reglas del contrato actualizado.

Reproducción controlada en `tests/escenarios-actualizacion-requisitos.js`:

1. Referencia histórica de prueba con PAI `["B","C","L"]`, frente a referencia vigente con PAI `["C"]`.
2. Edición personal de **otra regla** (TPI 52→53), más cambio de semestre independiente.
3. Guardar y aplicar sobre la referencia actual.
4. En la lógica previa, PAI volvía a `["B","C","L"]` aunque **no había sido editada**.

La prueba falló con ese resultado en GitHub Actions (ejecución [#57](https://github.com/jncubillosn-lab/Mecatronica/actions/runs/42527395354)). Se corrigió la causa de **reemplazar colecciones completas**, no se agregó ninguna excepción para PAI.

## 2. Solución mínima dentro de `EscenarioPersonal`

Se **mantiene `tipo:'escenario-personal',version:1`** y se introduce el campo opcional `cambios.reqCredCambios`, siguiendo la misma idea de modificaciones por identidad que ya usan malla, grupos y relaciones.

`reqCredCambios` almacena operaciones `agregar`, `quitar` y `modificar` por clave estable `id:<posicionId>`, con respaldo por nombre cuando la referencia antigua no tiene ID. En modificaciones se guardan solo las propiedades realmente diferentes: `min` y `componentes`. Cada regla no tocada se toma **siempre** de la nueva referencia académica.

El sistema de presentación no incorpora constantes de créditos. Los requisitos TPI 52 C y PAI 65 C continúan viviendo únicamente en `datos/academico.json`.

## 3. Archivos históricos y ambigüedad

Los archivos v1 antiguos guardaban `cambios.reqCred` como **lista completa**. No informaban qué parte de esa lista representaba una edición personal ni la referencia académica original.

**No es técnicamente posible reconstruir con certeza esa intención a partir de los valores únicamente.** Por seguridad:

- El lector antiguo continúa funcionando; su contenido se conserva inicialmente sin sobrescribir reglas potencialmente personales.
- Cuando alguna regla guardada difiere de la referencia actual, se muestra **una revisión por asignatura** con valores anteriores y vigentes, sin reinterpretarlos automáticamente.
- La persona puede elegir `Usar referencia vigente` o `Conservar guardado` **por cada requisito**; resolver uno no altera los demás ni restaura todo el escenario.
- Mientras existan dudas, `cambios.reqCredAmbiguos` guarda los identificadores pendientes. Si se modifica otra cosa y se guarda, **el aviso sigue presente**; los valores no se descartan.
- Una vez confirmada la elección, el escenario vuelve a guardarse mediante `reqCredCambios`, sin snapshots completos.
- La recuperación de antiguos archivos `{S}` conserva la compatibilidad y también señala divergencias cuando corresponde.

**No** se incorporó un esquema v2, dependencia nueva ni sistema global de resolución de conflictos. Las entradas nuevas con deltas claros no generan un aviso. Las reglas institucionales actualizadas tienen precedencia respecto a **todos los requisitos no modificados**.

## 4. Alcance y no objetivos

- No se cambia `datos/academico.json`, `js/modelo.js`, `js/analisis.js`, `js/entrada.js` ni `js/vistas.js`.
- No se deduce un requisito por código SIA, nombre, facultad o semestre.
- No se borran automáticamente modificaciones personales de créditos, semestres, bloques, grupos, encuestas ni requisitos.
- No se modifica la forma de calcular créditos **aprobados**: el modelo actual solo compara la distribución curricular simulada por semestres anteriores y **no dispone** del expediente personal de aprobaciones.
- Las modificaciones textuales antiguas de `malla[].nota` siguen sus propias reglas de persistencia; no se intervienen sin reproducción específica.

## 5. Verificación

- `tests/escenarios-actualizacion-requisitos.js` reproduce la causa original y cubre la representación nueva, lectura antigua, resolución puntual, persistencia de dudas y operaciones de alta/baja.
- La suite existente cubre escenarios guardados, integridad del contrato, edición, exportación, filtros y las ocho vistas.
- Revisar manualmente en navegador un escenario **antiguo** con divergencias; no se puede probar desde CI cuál información guarda el navegador real de una persona.

El objetivo es **conservar identidad y procedencia de los cambios**, no aplicar un parche local a PAI.
