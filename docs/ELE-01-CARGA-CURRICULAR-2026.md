# ELE-01 — Auditoría y reconstrucción de Ingeniería Electrónica

Para la oferta 2026-2 vigente en 1.1.13, véase la [revisión de agrupaciones de las tres carreras](AGRUPACIONES-OFERTA-2026.md). Allí se identifican las relaciones verificadas y los grupos consultables por separado.

**Estado vigente: 1.1.11.** Las secciones 1–8 conservan la historia de las versiones 1.1.9–1.1.10, pero la cobertura de agrupaciones y horarios descrita en ellas fue corregida por la sección 9. No utilizar los números históricos 31/144 para determinar la disponibilidad curricular vigente.

**Corte:** 18 de noviembre de 2026. **Carrera:** Ingeniería Electrónica, Sede Bogotá, Plan de Estudios 2545. **Contrato:** `datos/programas/electronica/academico.json`. **Formato:** `versionEsquema: 1`.

## 1. Fuentes y criterio

- `Electronica(2).txt`: catálogo SIA de **62 asignaturas**, créditos, tipología, descripción y constancia de no programación cuando corresponda. La base conserva 63 entradas porque la malla también contiene TPI con código histórico `2016510`.
- `Electronica horarios(1).txt`: oferta 2026-2 de 23 asignaturas y 33 actividades, 146 grupos, **27 condiciones de matrícula** en 18 asignaturas, alternativas de códigos viejos y grupos especiales.
- `Malla_Ing_Electrnica_2023(2).pdf`: diagrama de 10 semestres del **Plan 2545, versión 2023**. Expresa créditos por semestre, agrupaciones, enlaces de prerrequisitos y reglas de 121 y 63 créditos.

Se prioriza identificar cursos por **código**, posiciones por **ID**, horarios por grupo y actividad, y condiciones por su procedencia original, sin inventar equivalencias, horarios o combinaciones.

## 2. Resultado

| Entidad | Inicial | Final |
|---|---:|---:|
| Posiciones curriculares | 56 | **56** |
| Catálogo académico | 63 | **63** |
| Asignaturas en oferta | 23 | **23** |
| Grupos en oferta | 144 | **146** |
| Agrupaciones de horarios verificadas | 31 | **31** |
| Casos de agrupación excluida | 8 | **9** |
| Prerrequisitos visibles por ID | 0 | **32** |
| Requisitos mínimos de créditos | 0 | **3** |

La malla inicial omitía `Control (2016493)` del VII semestre, que corresponde a **4 créditos**. Se incorpora usando la fuente de malla y el catálogo SIA. En VIII existía una casilla optativa genérica de 3 créditos de más, duplicada junto a una opción de Telecomunicaciones. Se elimina únicamente esa casilla, conservando **55 IDs previos** y todos los IDs de agrupaciones. Las demás posiciones mantienen el mismo identificador.

Las cinco casillas optativas genéricas quedan clasificadas sin adjudicar asignaturas concretas: Probabilidad y Estadística (B, V), Electrónica Análoga (C, VI), Electrónica Digital (C, VII), y Administración (B, VIII y IX). La oferta particular de Redes de Telecomunicaciones `2019125` se conserva como una alternativa posible de la agrupación, no como una exclusividad de la malla.

## 3. Créditos verificados

| Componente | Créditos del plan |
|---|---:|
| Fundamentación | **60** (51 + 9) |
| Disciplinar | **78** (72 + 6) |
| Libre elección | **34** |
| **Total del plan 2545** | **172** |
| Nivelación (adicional al plan) | **20** |

La suma de los semestres I a X también coincide exactamente con la malla: **17, 18, 18, 19, 17, 17, 16, 16, 16, 18**. La distinción de la malla entre créditos de obligatorio/optativo disciplinar necesita contrastarse con el carácter optativo de `2019125` en catálogo: no se ha forzado su condición curricular por una simple operación aritmética.

## 4. Relaciones académicas

El SIA presenta **27 condiciones** tipo M. Solo 23 relacionan claramente una asignatura de origen con una **posición concreta de destino** en la malla; se convierten a aristas del mapa con el método existente `flecha`. Otras **9** están trazadas de forma explícita en la malla de 2023, pero no aparecen verificadas en el SIA aportado; se identifican como **evidencia de malla histórica** y deben revisar su vigencia institucional.

Cuatro condiciones SIA no se pueden trasladar como enlaces directos del mapa, porque remiten a optativas sin posición específica o a una alternativa no asignada a una materia concreta. Todos los 27 registros, sus códigos históricos, operadores `¿Todas?`, y el respaldo de los 32 vínculos se conservan en `data/programas/electronica/revision-prerrequisitos-2026.json` (fuera de los datos leídos por el motor).

### Mínimos explícitos de la malla

- Taller de proyectos interdisciplinarios (malla `2016510`): **121 créditos académicos**, sobre los componentes del plan B+C+L.
- Diseño de sistemas electrónicos (malla `2016494`): **121 créditos académicos**, B+C+L.
- Trabajo de Grado (`2015316`): **63 créditos del componente disciplinar**, C.

La malla identifica los dos umbrales mediante los marcadores * y **, respectivamente. Son las cifras **absolutas escritas en el documento**, no una conversión libre a créditos realizada por el servicio. No se aplican a programas distintos ni a códigos cuya equivalencia no está establecida.

## 5. Oferta y casos especiales

Se cotejaron individualmente los 144 grupos anteriores por código de asignatura, actividad e ID. **Horarios, cupos disponibles, fechas y duración permanecieron iguales**. Dos grupos `SUMA-01` de `2016502`, uno de magistral y otro de taller, existen en el SIA pero **no tienen horario**; se añaden solo a la oferta documental como PEAMA–Sumapaz y no a agrupaciones de la sede Bogotá.

Control `2016493` presenta magistral y laboratorio, pero la fuente no dice qué parejas de grupos se matriculan juntas. Su posición se anota en `exclusionesAgrupacion` hasta una verificación de emparejamientos; **no** se multiplica un grupo magistral por todos los laboratorios.

Se respetan los grupos `2024045-40` y `2024045-41` identificados como reservas/bloqueo de espacios: no representan clases analizables.

## 6. Códigos históricos no homologados

- TPI: código `2016510` en malla de 2023, frente a `2024045` en oferta SIA 2026. **No se presume su equivalencia normativa**; la malla y la oferta siguen en sus contextos.
- Diseño de sistemas electrónicos: `2016494` en malla, `2028816` en catálogo/oferta reciente. La posición de malla conserva `codigoAsignatura: null` hasta verificar la correspondencia y no genera una falsa agrupación.

Estas diferencias explican por qué una materia puede constar en la oferta sin aparecer como grupo disponible dentro de una posición histórica. El servicio no cambia lectores ni añade validaciones inventadas. La documentación conserva lo que falta por confirmar.

## 7. Aseguramiento

La regresión `tests/electronica-datos.js` comprueba los totales por semestre/componente, referencias por ID, integridad de grupos, exclusiones y reglas de créditos, además de ejecutar el adaptador institucional actual `EntradaAcademica`. Las pruebas generales del repositorio, el despliegue Pages y la certificación de versión son condiciones obligatorias antes de afirmar publicación.

## 8. Corrección de una exportación ampliada (18 nov 2026; versión 1.1.10)

Se recibió `Electronica horarios(2).txt`, que reproduce **exactamente** la totalidad de `Electronica horarios(1).txt` y luego añade otros **12 encabezados de asignaturas existentes**. En 11 copias finales de asignaturas los grupos y condiciones no aportan novedades sustantivas; en la sección repetida de TPI (`2024045`) solo aparece su **grupo 1**, a diferencia de los **22 grupos** de su sección completa. Esa sección parcial no debe interpretarse como baja de los 21 grupos omitidos.

La reconciliación por código institucional, actividad y grupo arrojó únicamente los siguientes cambios:

| Asignatura | Actividad y grupo | Cupos de la fuente inicial | Cupos actualizados |
|---|---|---:|---:|
| Introducción a ingeniería electrónica (`2016502`) | Clase magistral, G1 | 2 | **3** |
| Introducción a ingeniería electrónica (`2016502`) | Clase taller, G1 | 1 | **2** |
| Taller de ingeniería electrónica (`2016509`) | Clase magistral, G4 | 1 | **2** |

No hay asignaturas ni grupos nuevos. La base conserva **146 grupos**, **23 cursos**, **56 posiciones**, **31 agrupaciones**, **32 enlaces de prerrequisitos** y **tres mínimos** sin variar la lógica de matrícula. Tampoco se cambian horarios, fechas, docentes ni aulas de las entradas preexistentes, y no se modifican las bases de otras carreras.

El registro de procedencia de la revisión externa contiene los tres valores anteriores y nuevos, la fecha, ambas fuentes y la razón para ignorar duplicados documentales. La prueba `tests/electronica-datos.js` comprueba explícitamente esos tres cupos, los 22 grupos de TPI y la identidad del contrato para evitar regresiones.

## 9. Reconstrucción integral del contrato desde fuentes (1.1.11)

### Hallazgo causal

La base anterior registraba correctamente múltiples grupos con días y horas dentro de `oferta`, pero no los convertía a `agrupaciones`. El lector único del servicio construye `S0.gr`, `S0.bl` y las ocho vistas **exclusivamente desde `agrupaciones`**, por lo que se podían encontrar materias en el SIA que el programa mostraba sin horarios. La comprobación previa de 146 entradas de grupos no garantizaba su uso por la interfaz.

### Fuentes nuevamente reconstruidas

- **`Electronica(3).txt`**: 62 códigos SIA, créditos, tipologías y descripciones. Se añade al catálogo el código histórico de TPI `2016510` únicamente porque figura en la malla 2023 (63 entradas en total), sin homologarlo automáticamente con `2024045`.
- **`Electronica horarios(3).txt`**: 35 encabezados documentales, que representan **23 asignaturas distintas**, 33 actividades y **146 grupos únicos**. Doce encabezados finales se repiten; un segundo bloque de TPI es parcial. Las tres diferencias de cupos se resuelven por código+actividad+grupo, sin perder información previa. Se conservan también las 27 condiciones SIA.
- **`Malla_Ing_Electrnica_2023(3).pdf`**: plan 2545, 56 posiciones curriculares, diez semestres, **B60/C78/L34 = 172 créditos** y N20 adicionales. Se nombran explícitamente las cinco agrupaciones optativas del diagrama, conservando sus IDs.

### Cobertura de publicación por nivel

| Nivel | Anterior | Vigente |
|---|---:|---:|
| Asignaturas de catálogo | 63 | **63** |
| Cursos ofertados únicos | 23 | **23** |
| Actividades de oferta | 33 | **33** |
| Grupos documentales `oferta` | 146 | **146** |
| Agrupaciones que lee la interfaz | 31 | **139** |
| Bloques semanales visibles en Grupos/Horarios | parcial | **212** |
| Grupos académicos analizables como completos | 31 | **53** |
| Componentes de horario informativos sin matrícula conjunta acreditada | 0 | **86** |
| Grupos preservados exclusivamente en oferta | 115 | **7** |
| Prerrequisitos por ID | 32 | **32** |
| Mínimos de créditos | 3 | **3** |

**Controles específicos:** Electrónica Digital II `2016499` (dos magistrales + cuatro laboratorios), Control `2016493` (cuatro + ocho), Electrónica de potencia `2016497` (dos + cuatro), Instrumentación y medidas `2016501` (dos + tres), Introducción a Ingeniería Electrónica `2016502` (magistral y taller), Diseño de sistemas electrónicos `2028816` (dos grupos teóricos) y TPI `2024045` (20 grupos reales más dos reservas). Todos los grupos con horarios de estas asignaturas quedan asociados al escenario con sus horas auténticas.

### Regla de veracidad de las agrupaciones

Cada grupo de oferta se conserva con su asignatura por **código**, actividad, ID de grupo, franjas, cupos, fechas y docente. Las asignaturas de **actividad única** dan grupos completos analizables. Donde el SIA lista magistral y laboratorio **sin indicar cuáles se matriculan juntos**, se conservan sus **horarios individuales** bajo la posición curricular, diferenciando «Magistral Gx» de «Laboratorio Gx», con `analizable:false`. Se visualizan los horarios pero no se calcula choque de una supuesta combinación matriculable. No se usa el producto cartesiano de actividades.

Dos asignaturas presentan códigos de malla y oferta distintos: TPI `2016510` (malla) y `2024045` (SIA); Diseño `2016494` (malla) y `2028816` (SIA). Como sus nombres y créditos coinciden, se vinculan **solo para mostrar la oferta de horarios**, manteniendo constancia de que ello no certifica equivalencia normativa. Las optativas `2028211`, `2016508` y `2016512` se asocian temáticamente a casillas optativas de la malla únicamente para consulta, con `analizable:false`, y no se les atribuye una equivalencia curricular oficial.

### Siete registros que no se simulan como clases de una posición concreta

- **Tres** grupos de Circuitos de RF (`2016488`): la oferta sí está completa (magistral + dos laboratorios), pero las fuentes no acreditan una posición individual o una agrupación reglamentaria concreta del plan; permanecen en `oferta`, con sus días y horas, sin crear una posición ficticia.
- **Dos** grupos PEAMA–Sumapaz `SUMA-01` de Introducción: sin horario; están en `oferta`, no en el análisis Bogotá.
- **Dos** grupos de TPI `40` y `41`: reservas de espacios y no clases académicas, permanecen en `oferta`.

La única modificación del sistema compartido es el texto de la etiqueta `analizable:false`: se muestra «solo consulta» en lugar de «otra sede», porque la condición también identifica grupos de laboratorio sin combinación matricular certificada. No cambia la elegibilidad ni el algoritmo.

### Pruebas y publicación

`tests/electronica-datos.js` debe verificar **cobertura bidireccional**: cada grupo y cada bloque de horario que corresponda a una posición de consulta existe en `agrupaciones`, coincide por código+actividad+grupo y mantiene los mismos días/horas; no hay duplicados, no aparecen parejas supuestas y los siete registros exceptuados están contabilizados. El lector `EntradaAcademica` tiene que generar exactamente 139 grupos y 212 bloques, y permitir consultar las asignaturas reportadas. La integración se condiciona a ARQ-01, auditoría, versión pública y despliegue Pages.
