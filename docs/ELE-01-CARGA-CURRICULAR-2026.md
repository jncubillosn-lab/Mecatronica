# ELE-01 — Carga limpia de Ingeniería Electrónica

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
