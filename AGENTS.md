# Guía de trabajo para agentes y colaboradores

**Referencia arquitectónica obligatoria:** [docs/ARQUITECTURA.md](docs/ARQUITECTURA.md) (ARQ-01).

## Antes de cualquier cambio

- Leer ARQ-01 y verificar qué capa del sistema se verá afectada.
- **La única entrada académica de la migración v0.5.0 es FuentesAcadémicas, representada por el contrato normalizado de `datos/academico.json`.** La interfaz puede usar una proyección interna `RAW` generada desde ese contrato, nunca otra entrada.
- La extracción y conversión desde catálogo, oferta de horarios y malla sucede **íntegramente fuera del sistema**. No incorporar lectores, conversores, cargadores ni conexiones paralelas desde esos archivos a la aplicación.
- El sistema consume el contrato común, no el formato de las fuentes ni archivos históricos `js/catalogo.js`, `js/oferta-fuente.js` o `js/datos.js`. Se conservan en el repositorio como **archivos de referencia heredados**, pero la aplicación migrada no los carga.
- Los nombres, créditos, requisitos, tipologías, componentes, calendarios y vínculos académicos son **datos**, no constantes universales programadas.
- Aceptar información incompleta sin inventar valores ni generar avisos de alerta por su ausencia.
- Los grupos de actividad no se combinan salvo relación explícita del contrato.
- Mantener separadas las modificaciones personales del escenario y los datos de referencia académica.
- Todas las vistas, cuadros de detalle, cálculos y exportaciones deben respetar la misma selección activa de información.
- Preservar funcionamiento estático y compatibilidad con los escenarios anteriores.

## Ejecución y revisión

1. Distinguir **estado actual** de **arquitectura objetivo** antes de proponer implementaciones.
2. Preferir actualizar únicamente los datos normalizados cuando cambie información académica.
3. Justificar cualquier cambio del contrato o de la frontera arquitectónica **antes de implementarlo** y actualizar ARQ-01.
4. Verificar integridad de cobertura fuente normalizada → escenario → resultados y comparar días/horas, no solo números de registros.
5. No modificar automáticamente la arquitectura ni añadir nuevos componentes por interpretación; mantener POO como separación de responsabilidades, no como proliferación de clases.
6. No considerar ausencia de características futuras como defecto de la versión actual.

Si hay contradicción entre README o el código heredado y ARQ-01, **ARQ-01 gobierna el diseño objetivo**. El funcionamiento actual solo puede reemplazarse mediante una migración consciente y probada, no por un cambio documental.
