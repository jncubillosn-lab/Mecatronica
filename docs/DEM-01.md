# DEM-01 — Demanda de preinscripción

**Estado:** módulo habilitado desde v0.5.6. **Naturaleza:** análisis descriptivo de una encuesta, no dato académico institucional ni capacidad de cupos.

## Contrato mínimo de encuesta

Archivo JSON que puede cargarse desde la página **Demanda**:

```json
{
  "tipo": "demanda-preinscripcion",
  "version": 1,
  "solicitudes": [
    {"posicionId": "ID-CURRICULAR-1", "cantidad": 20},
    {"posicionId": "ID-CURRICULAR-2", "cantidad": 0}
  ]
}
```

Solo se necesitan `posicionId` y `cantidad` para cada asignatura conocida. Las asignaturas se relacionan por ID de posición curricular de la malla normalizada, no por nombre ni por ID del grupo. Un registro ausente es **desconocido**, nunca cero. No se requieren nombres, correos, códigos estudiantiles, salones, docentes, cupos, población total ni datos históricos.

Opcionalmente:

- `respuestasTotales`: entero no negativo, total de personas que respondieron, para calcular frecuencia `solicitudes/respuestasTotales`.
- `tasaParticipacion`: número mayor que 0 y hasta 1, para mostrar una extrapolación **condicionada** `solicitudes/tasaParticipacion` (no una predicción validada).
- `fechaEncuesta`: texto de referencia opcional.
- `respuestasAnonimas`: listas de IDs curriculares por encuestado, por ejemplo `[["ID-1","ID-2"],["ID-2"]]`, sin identificadores de personas, para calcular co-solicitudes. Cuando se proporciona, genera los conteos; si también se adjuntan conteos, deben concordar.
- `simulado`: marca booleana que diferencia explícitamente la demostración de los datos reales.

Desde v0.5.7, **al no existir encuesta se presenta automáticamente una vista previa simulada**, con IDs de la malla real y 240 respuestas **completamente ficticias** para probar ranking, comparación por semestre y co-solicitudes. La vista previa no se escribe en el almacenamiento ni se exporta con el escenario. **Guardar ejemplo en escenario** lo incorpora explícitamente, y solicita confirmación antes de reemplazar una encuesta existente. Si existe demanda real, se muestra por defecto; el botón **Ver ejemplo simulado** permite alternar sin reemplazarla. Los ejemplos quedan identificados y la carga/exportación de un JSON real sigue disponible.

## Cálculos y limitaciones

- `D_i`: estudiantes distintos que solicitan la asignatura.
- `G_i`: número de **agrupaciones completas explícitas** del escenario con `on!==false` y `analizable!==false`. No se suman teorías, magistrales y laboratorios como grupos adicionales, ni se interpreta como número de cupos.
- `I_i = D_i / G_i`: solicitudes observadas por agrupación analizable. Solo si `G_i>0`.
- `M_s`: mediana de `I_i` de asignaturas **con dato conocido** del mismo semestre, calculada antes de aplicar filtros de pantalla. Se exige mínimo tres asignaturas y mediana mayor que cero.
- `R_i = I_i/M_s`: índice relativo semestral.
- `percentilSemestral`: rango percentilar mediante empates promediados, calculado con al menos tres comparables del mismo semestre; no se presenta como anomalía por sí solo.
- `Z_robusto = (I_i-M_s)/(1.4826 * MAD_s)`: descriptivo si hay al menos cinco comparables y `MAD_s>0`.
- `F_i=D_i/respuestasTotales`: solo con total informado y positivo.
- `E_i=D_i/tasaParticipacion`: extrapolación proporcional solo con tasa informada. Es especialmente vulnerable al sesgo de autoselección.
- Co-solicitudes: pares de asignaturas mencionadas en una misma respuesta anónima; las coincidencias se consultan contra los choques conocidos del escenario, sin afirmar que no haya incompatibilidades si los horarios son incompletos.

Los índices no muestran escasez, ocupación, cantidad de cupos faltantes ni matrícula real. Las asignaturas con cero solicitudes conocidas permanecen en el análisis; las no observadas se representan por vacío. Si no hay grupos, semestre, encuesta o base de comparación, los indicadores dependientes se presentan como **no calculables**, sin crear valores ni alertas.

## Frontera arquitectónica

`datos/academico.json` permanece como **única entrada académica normalizada**. Las intenciones son anotaciones de encuesta dentro de `EscenarioPersonal` (`S.demanda`), cargadas manualmente desde un JSON ya estructurado. El sistema no convierte formularios, PDF ni datos institucionales de origen. El filtrado por tipología y departamento/facultad usa el estado de consulta y no muta la encuesta. Los IDs que no coinciden con una posición curricular se preservan y se informan sin reasignaciones automáticas.

**Archivos:** `js/demanda.js` calcula y dibuja; `js/app.js` controla edición, filtros y archivos; `js/escenarios.js` persiste y valida; `tests/demanda.js` comprueba casos mínimos. Se conservaron las siete vistas anteriores y se añadió Demanda como octava.

## Lectura y recomendaciones automáticas (v0.5.7)

La vista incluye tarjetas calculadas con las asignaturas **visibles**: mayor demanda observada, mayor concentración por grupo, índice relativo destacado (más de 1,5 veces la mediana), posible valor atípico robusto (desviación robusta superior a 3,5 con al menos cinco comparables y dispersión positiva), co-solicitudes con cruces de horarios cuando hay respuestas anónimas y mensajes de insuficiencia de información. También incorpora percentil por semestre y selector del indicador para la visualización curricular. Ninguna de estas señales implica conocer los cupos ofertados o faltantes. La mediana base se mantiene fija frente a los filtros de consulta.

Las cantidades ficticias pueden modificarse una vez guardado el ejemplo; al editar cantidades de la demostración, se retiran las respuestas anónimas sintéticas para evitar contradicción con el agregado y deja de ser calculable la demanda conjunta hasta importar nuevas respuestas. Los datos reales con respuestas anónimas solo se cambian importando datos consistentes.

## DEM-02 — Visualización y simulación contrastada (v0.5.8)

La página ordena los análisis así: **mapa de demanda**, **comparación curricular por semestre**, **detalle estadístico** (con edición desplegable), **lectura y recomendaciones**, **tabla de ranking**, **demanda conjunta**. La tabla ya no antecede las representaciones.

La gráfica usa **medianas de solicitudes y de agrupaciones presentes en la selección visible** para dividir cuatro zonas descriptivas. Son puntos de referencia estadísticos, no umbrales universales. Se distinguen: demanda elevada con pocos grupos, demanda masiva con más grupos, menor demanda con pocos grupos y menor demanda con más grupos. El indicador numérico de concentración sigue siendo solicitudes por agrupación completa analizable, **nunca el déficit de cupos**.

Para mejorar la separación de puntos bajos frente a asignaturas con decenas de grupos, **ambos ejes aplican una transformación de raíz cuadrada**, informada expresamente junto a la gráfica. Los números en los ejes siguen siendo solicitudes y grupos reales. Colores legibles en modo claro/oscuro, leyenda, casos señalados 1–3, títulos de cuadrantes y selección accesible por teclado permiten interpretar el gráfico sin abrir la tabla.

La **demostración** sigue contando con 240 respuestas ficticias, pero distribuye intencionalmente casos contrastantes (altas solicitudes/pocos grupos, demanda masiva/muchos grupos y grupos de demanda menor). Los ID curriculares y los números de grupos proceden de la malla y de las agrupaciones disponibles; las solicitudes son **completamente simuladas** y no afirman que una asignatura particular tenga un problema real. No se guardan automáticamente al abrir la vista previa, ni reemplazan encuestas reales sin acción explícita.

Cuando no haya información suficiente para un cuadrante o indicador, se conservará el estado desconocido y se mostrarán las señales disponibles; no se fabricarán grupos ni cupos.
