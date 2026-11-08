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

El botón **Usar datos simulados** genera valores de prueba con IDs del escenario académico actual y exige confirmar si se sustituye una encuesta existente. Nunca se cargan automáticamente al entrar a la página. El estado se conserva en la exportación/importación del escenario personal y también puede exportarse como archivo de demanda independiente.

## Cálculos y limitaciones

- `D_i`: estudiantes distintos que solicitan la asignatura.
- `G_i`: número de **agrupaciones completas explícitas** del escenario con `on!==false` y `analizable!==false`. No se suman teorías, magistrales y laboratorios como grupos adicionales, ni se interpreta como número de cupos.
- `I_i = D_i / G_i`: solicitudes observadas por agrupación analizable. Solo si `G_i>0`.
- `M_s`: mediana de `I_i` de asignaturas **con dato conocido** del mismo semestre, calculada antes de aplicar filtros de pantalla. Se exige mínimo tres asignaturas y mediana mayor que cero.
- `R_i = I_i/M_s`: índice relativo semestral.
- `Z_robusto = (I_i-M_s)/(1.4826 * MAD_s)`: descriptivo si hay al menos cinco comparables y `MAD_s>0`.
- `F_i=D_i/respuestasTotales`: solo con total informado y positivo.
- `E_i=D_i/tasaParticipacion`: extrapolación proporcional solo con tasa informada. Es especialmente vulnerable al sesgo de autoselección.
- Co-solicitudes: pares de asignaturas mencionadas en una misma respuesta anónima; las coincidencias se consultan contra los choques conocidos del escenario, sin afirmar que no haya incompatibilidades si los horarios son incompletos.

Los índices no muestran escasez, ocupación, cantidad de cupos faltantes ni matrícula real. Las asignaturas con cero solicitudes conocidas permanecen en el análisis; las no observadas se representan por vacío. Si no hay grupos, semestre, encuesta o base de comparación, los indicadores dependientes se presentan como **no calculables**, sin crear valores ni alertas.

## Frontera arquitectónica

`datos/academico.json` permanece como **única entrada académica normalizada**. Las intenciones son anotaciones de encuesta dentro de `EscenarioPersonal` (`S.demanda`), cargadas manualmente desde un JSON ya estructurado. El sistema no convierte formularios, PDF ni datos institucionales de origen. El filtrado por tipología y departamento/facultad usa el estado de consulta y no muta la encuesta. Los IDs que no coinciden con una posición curricular se preservan y se informan sin reasignaciones automáticas.

**Archivos:** `js/demanda.js` calcula y dibuja; `js/app.js` controla edición, filtros y archivos; `js/escenarios.js` persiste y valida; `tests/demanda.js` comprueba casos mínimos. Se conservaron las siete vistas anteriores y se añadió Demanda como octava.
