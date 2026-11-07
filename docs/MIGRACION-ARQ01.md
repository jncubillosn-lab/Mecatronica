# MIG-ARQ01 — Registro de migración secuencial

**Rama:** `arquitectura/migracion-arq01-entrada-unica`  
**Versión preparada:** 0.5.0  
**Referencia obligatoria:** [ARQ-01](ARQUITECTURA.md)  
**Límite:** únicamente el sistema web; la lectura y conversión de documentos originales son externas.

## Estado por etapas

| Etapa según ARQ-01 | Estado en la rama | Evidencia |
|---|---|---|
| 1. Contrato académico único | Implementado | `datos/academico.json`, `tests/contrato-arq01.js` |
| 2. Lector y escenario de referencia | Implementado | `js/entrada.js`, `js/iniciar.js`, `tests/oferta-activa.js` |
| 3. Cambios personales | Implementado | `js/escenarios.js`, `tests/escenarios-arq01.js` |
| 4. Cálculos, filtros y visualización | Adaptado | `js/app.js`, `tests/vistas-arq01.js` |
| 5. Verificación y publicación | Pruebas de código completadas; despliegue pendiente | 40 comprobaciones sobre motor nuevo e histórico |

## Entrada única

- El archivo `datos/academico.json` es la **única entrada académica de ejecución**.
- Contiene 59 posiciones curriculares, 64 registros de catálogo, 64 cursos en oferta y los 716 registros de grupo aportados por la fuente.
- Las 42 posiciones vinculadas al catálogo conservan sus códigos. Las 17 posiciones genéricas o sin coincidencia concreta permanecen sin vínculo.
- La entrada registra **453 agrupaciones analizables**: 386 de la referencia ya utilizada y 67 agrupaciones nuevas de cursos con una sola actividad claramente identificada.
- Hay **3 posiciones cuya oferta tiene varias actividades sin una agrupación verificable**: Electrónica Análoga I, Electrónica Digital I y Proyecto Aplicado de Ingeniería. Sus actividades y grupos se conservan en `oferta` pero **no se crean combinaciones supuestas**.
- Catálogo, oferta y malla originales NO se cargan en la página. La conversión a JSON es externa al sistema.

## Escenario base

El lector del JSON genera **39 asignaturas analizables, 453 agrupaciones y 904 bloques** para la base de referencia de esta rama. Incluye los 386 grupos/797 bloques de la versión anterior y agrega datos de actividad única que antes se omitían.

Los bloques horarios compartidos entre varias opciones se mantienen como una única unidad. Los grupos sin horario permanecen válidos y no producen choques inventados.

`RAW` sigue apareciendo en `js/app.js` como una **proyección interna transitoria** generada desde `academico.json`. No es una fuente adicional que deba editarse.

## Modificaciones personales

- El navegador y los JSON nuevos guardan un conjunto de **diferencias respecto a la referencia**, no una copia académica paralela.
- Las asignaturas y agrupaciones de referencia tienen identificadores estables dentro del contrato.
- Los cambios personales se aplican sobre la referencia disponible al abrir la página.
- Los escenarios históricos `{S}` de las versiones 0.4.2/0.4.3 se reconstruyen utilizando identificadores y marcadores históricos incluidos en **el mismo JSON**.
- Las eliminaciones o ediciones voluntarias se conservan; los nuevos grupos de referencia se incorporan.
- Los escenarios históricos pueden seguir importándose, y Restablecer vuelve a la referencia vigente.

## Pruebas y comprobaciones

Los archivos actuales de pruebas incluyen:

```sh
node tests/contrato-arq01.js
node tests/oferta-activa.js
node tests/escenarios-arq01.js
node tests/vistas-arq01.js
```

Además se conservan las tres pruebas históricas (`verificar.js`, `filtros.js`, `fuentes.js`).

Se verificaron **40 casos** mediante ejecución aislada del código JavaScript: contrato y referencias, exactitud de día/hora de los bloques, agrupaciones, escenarios anteriores, modificaciones personales, filtros y generación de siete vistas.

La prueba específica con la referencia anterior recuperó las mismas cantidades de 386 grupos, 797 bloques y 4.044 combinaciones con choque al limitarse al conjunto antiguo. Las estadísticas ampliadas cambian por **nuevos grupos incorporados**, no porque se haya alterado el criterio matemático de solapamiento.

## Deuda de transición y límite de esta entrega

- No se ha ejecutado todavía una **inspección visual real en el navegador** de la versión 0.5.0. La integración en `main` debe esperar la revisión del PR y, si es posible, esta prueba.
- `js/app.js` conserva una estructura heredada y consume la proyección interna `RAW`. El flujo externo de entrada única ya está corregido; la refactorización profunda de vistas no es requisito para conservar el contrato.
- Algunos requisitos históricos y referencias internas de la interfaz todavía usan los nombres de las asignaturas; los datos normalizados ya identifican las posiciones mediante IDs.
- Los archivos de referencia heredados siguen presentes en el repositorio **solo como archivos históricos**, sin cargarse en ejecución.
- Una futura alteración de la semántica de agrupaciones o la identidad de los bloques debe tratarse como evolución del contrato, no como conversión dentro del sistema.

**Regla de continuidad:** las modificaciones de información académica llegan en `datos/academico.json`; no deben reconstruirse listas manuales en `js/datos.js`, ni recuperarse las tres fuentes originales como entradas paralelas.
