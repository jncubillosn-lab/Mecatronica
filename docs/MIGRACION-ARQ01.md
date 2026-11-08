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
- La entrada registra **453 agrupaciones**: 386 de la referencia anterior y 67 nuevas de cursos con una sola actividad claramente identificada. De ellas, **374 son analizables y 79 se conservan solo como información de otras sedes**, sin borrarse ni contribuir a interferencias, matrices o mapa de calor. La distinción está declarada en `agrupaciones[].analizable` dentro del contrato.
- Hay **3 posiciones cuya oferta tiene varias actividades sin una agrupación verificable**: Electrónica Análoga I, Electrónica Digital I y Proyecto Aplicado de Ingeniería. Sus actividades y grupos se conservan en `oferta` pero **no se crean combinaciones supuestas**.
- Catálogo, oferta y malla originales NO se cargan en la página. La conversión a JSON es externa al sistema.

## Escenario base

El lector del JSON genera **39 asignaturas registradas, 453 agrupaciones y 904 bloques** para el escenario de referencia. Conserva los 386 grupos/797 bloques de la versión anterior y los nuevos datos de actividad única. Solo los **374 grupos elegibles** participan en los cálculos; los 79 restantes siguen disponibles para consulta. No se elimina ningún bloque por esta selección.

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

La batería de ocho conjuntos se ejecuta con `npm ci && npm test`. Comprueba contrato, oferta, escenarios, vistas, reglas históricas, filtros, fuentes heredadas y navegación estática mediante `jsdom`. La rama incluye el workflow `.github/workflows/verificacion-arq01.yml` para verificarla en la PR. Su estado remoto debe comprobarse antes de la fusión.

En esta revisión se ejecutaron **siete conjuntos JavaScript en entorno aislado**, además de verificaciones específicas de datos y criterios de elegibilidad. La nueva prueba de integración basada en `jsdom` requiere ejecución en Node.js con dependencias instaladas; no se considera superada hasta contar con ese resultado.

La referencia v0.4.3 contenía 386 grupos y 797 bloques, incluidos grupos especiales que contribuían a los resultados (4.044 combinaciones con choque bajo la selección antigua). En la nueva versión los registros se conservan pero los grupos de otras sedes quedan excluidos de los cálculos, por lo que **no se exige igualdad de totales globales entre selecciones diferentes**. La fidelidad se comprueba mediante equivalencia de registros, días, horarios, agrupaciones y resultados para exactamente la misma selección de grupos. La fórmula de solapamiento no cambia.

## Deuda de transición y límite de esta entrega

- No se ha ejecutado todavía una **inspección visual real en el navegador** de la versión 0.5.0. La integración en `main` debe esperar la revisión del PR y, si es posible, esta prueba.
- `js/app.js` conserva una estructura heredada y consume la proyección interna `RAW`. El flujo externo de entrada única ya está corregido; la refactorización profunda de vistas no es requisito para conservar el contrato.
- Algunos requisitos históricos y referencias internas de la interfaz todavía usan los nombres de las asignaturas; los datos normalizados ya identifican las posiciones mediante IDs.
- Los archivos de referencia heredados siguen presentes en el repositorio **solo como archivos históricos**, sin cargarse en ejecución.
- Una futura alteración de la semántica de agrupaciones o la identidad de los bloques debe tratarse como evolución del contrato, no como conversión dentro del sistema.

**Regla de continuidad:** las modificaciones de información académica llegan en `datos/academico.json`; no deben reconstruirse listas manuales en `js/datos.js`, ni recuperarse las tres fuentes originales como entradas paralelas.
