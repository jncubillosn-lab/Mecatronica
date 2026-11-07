# Planeación curricular · Ingeniería Mecatrónica

Herramienta **no oficial** de la representación estudiantil para examinar la malla curricular, los grupos ofertados y las interferencias de horario. Publicación: https://jncubillosn-lab.github.io/Mecatronica/

## Arquitectura de referencia — ARQ-01

**[Leer el mapa maestro y contrato de entrada académica](docs/ARQUITECTURA.md)** · **[Guía para futuras intervenciones](AGENTS.md)**

**Decisión arquitectónica:** el sistema objetivo recibe **una única entrada normalizada, FuentesAcadémicas** (contrato de `datos/academico.json`). La malla, el catálogo y la oferta original —y cualquier conversión necesaria para unificar esas fuentes— son **externos al sistema web**. No existen rutas académicas paralelas al cálculo ni módulos de conversión dentro de la aplicación.

**Estado:** ARQ-01 ya es la referencia de diseño; la aplicación publicada en v0.4.3 conserva archivos y mecanismos anteriores. **Este cambio documental no implementa la migración ni modifica resultados.** Las descripciones de `RAW` y de las tres fuentes en el resto del README explican la versión heredada, no un modelo autorizado para nuevas funciones.

## Secciones actuales

| Sección | Función |
|---|---|
| Inicio | Resumen de interferencias entre asignaturas |
| Interferencias | Comparación de combinaciones de grupos, en lista o matriz; filtros y CSV |
| Asignaturas | Indicadores de interferencias por asignatura |
| Grupos | Activar, desactivar, agregar y quitar grupos de un escenario |
| Horarios | Consultar, mover, editar y superponer bloques horarios |
| Mapa de calor | Concentración de grupos programados por franja y día; no mide matrícula ni ocupación de aulas |
| Prerrequisitos | Malla por semestres, relaciones entre asignaturas, tipologías y comprobación de créditos mínimos |

## Filtros de componentes (v0.4.3)

En la cabecera de las vistas **Inicio**, **Interferencias**, **Asignaturas** y **Mapa de calor** hay tres botones independientes: **Disciplinar**, **Fundamentación** y **Nivelación**. Pueden mantenerse activos simultáneamente, desactivarse individualmente o dejarse los tres apagados. Por defecto están activos todos.

- La configuración de botones disponibles está en `RAW.opciones.componentesComparables` de `js/datos.js`. **No hay componentes fijados en el algoritmo.**
- La selección de botones solo cambia la **representación y los cálculos de los informes**; no elimina grupos ni horarios, no modifica la malla y no se registra como una edición del escenario.
- Grupos, Horarios y Prerrequisitos continúan mostrando la información completa, incluso de componentes temporalmente excluidos de los informes.
- El Mapa de calor permite refinar la selección individual de asignaturas dentro de los componentes marcados.
- **Libre Elección** se mantiene como orientación en la malla, sin botón de análisis. **Inglés I–IV se clasifica como Nivelación**, según el catálogo aportado, y se representa con ese botón cuando existan grupos incorporados al análisis.
- Al incorporar grupos reales de asignaturas de un componente, sus cruces aparecerán automáticamente al marcarlo; no hay que cambiar los cálculos.

El escenario inicial incluye asignaturas con horarios de los tres componentes. Las asignaturas sin grupos en la oferta siguen sin crear choques; los filtros no inventan bloques horarios.

Para verificar los filtros ejecutar `node tests/filtros.js`, además de `node tests/verificar.js`.

## Alcance de los datos

La aplicación trabaja **con lo que está registrado**. No exige datos completos ni interpreta la ausencia de un horario como conflicto.

- **Malla de referencia:** Ingeniería Mecatrónica, Acuerdo 6 de 2022; plano curricular versión 28 de julio de 2022.
- **Horarios:** conjunto incorporado a los datos del programa; puede ampliarse sin cambiar las funciones de cálculo. La fecha exacta de actualización de la oferta no está registrada.
- **Tipologías:** el catálogo conserva los tipos institucionales B, O, C, T, E y P. El plan usa componentes B: fundamentación, C: disciplinar, L: libre elección y N: nivelación. **Inglés I–IV pertenece a Nivelación (E en el catálogo)**. Cada asignatura mantiene además su carácter obligatorio u optativo cuando consta en la fuente.
- Los totales por componente son **resultados de sumar los registros de la malla**, no constantes del cálculo. Los 12 créditos de Inglés I–IV figuran como Nivelación y no forman parte de los créditos propios del programa.
- Los campos de componente y carácter pueden ajustarse en la ficha de una asignatura. Los cambios se guardan **solo en el escenario del navegador** y se distinguen de los datos iniciales.

### Interpretación de las interferencias

1. Se escoge una pareja de asignaturas que el filtro curricular permite comparar.
2. Se prueba cada combinación de grupos activos entre ambas.
3. Dos grupos chocan si se traslapa al menos un bloque horario de sus componentes. Los bloques 9–11 y 11–13 no chocan.
4. El índice es la proporción de combinaciones de grupos con choque. Una asignatura sin grupos o sin horarios no genera conflictos; no se inventan horarios faltantes.
5. Se pueden configurar distancias entre semestres y la exclusión de relaciones directas o indirectas de prerrequisitos.

### Comprobación de créditos mínimos en la malla

Es un **indicador de consistencia de la distribución por semestres**: suma exclusivamente los créditos de asignaturas situadas en semestres anteriores al de la asignatura seleccionada **y cuyo componente esté incluido en la regla**. No equivale a créditos aprobados por un estudiante.

Las reglas se expresan **solo como datos**, dentro de `js/datos.js`, con la forma:

```js
// [asignatura, créditos mínimos, componentes que cuentan]
["Taller de Proyectos Interdisciplinarios", 52, ["C"]]
```

Esta es la configuración de ejemplo del plan actual: exige créditos disciplinares. Cualquier cambio en la cantidad exigida o los componentes que cuentan requiere editar el dato, **no la función de cálculo**. Del mismo modo, otras asignaturas pueden contabilizar diferentes conjuntos de componentes.

Los catálogos `componentes` y `caracteres`, los campos de `malla`, las reglas `reqCred` y las fechas `metadatos` se encuentran en `RAW`. El pie de la página lee las fechas de `metadatos` automáticamente.

Las advertencias no bloquean el uso, no modifican automáticamente los semestres y solo se muestran cuando la suma de créditos anteriores de los componentes indicados queda por debajo del mínimo. Si hubiera componentes sin clasificar, no se genera una falsa advertencia de insuficiencia.

El plano curricular aportado contiene indicaciones «52 C», «65 C» y «69 C». La interpretación de «52 C» como créditos exclusivamente disciplinares **es el criterio de análisis indicado para esta herramienta**, no una interpretación institucional de dicha abreviatura que hayamos confirmado.

## Datos de la versión actual: tres archivos de referencia heredados

En **v0.4.3** se conservan estos tres conjuntos de información, **sin asumir que uno contiene todo lo de los otros**. Según ARQ-01, no serán entradas independientes a la aplicación cuando se implemente el contrato normalizado:

| Fuente | Información disponible | Archivo estructurado |
|---|---|---|
| Catálogo de asignaturas | Código, nombre, créditos, tipología original y descripción, cuando exista | `js/catalogo.js` |
| Oferta académica detallada | Código, actividades, grupos, docentes, horarios, fechas, cupos disponibles y texto original de horario, cuando se informe | `js/oferta-fuente.js` |
| Malla curricular | Posición por semestre, componentes que cuentan en el plan y prerrequisitos | `js/datos.js` |

**El catálogo institucional utiliza B, O, C, T, E y P.** Son categorías originales de esa fuente; no se reescriben para hacerlas coincidir artificialmente con los componentes B, C, L y N del plan. Ejemplo: **Trabajo de Grado** tiene categoría institucional P, mientras que sus créditos se ubican en el componente disciplinar de la malla. **Inglés** tiene categoría institucional E y componente de Nivelación N en la malla.

`RAW.vinculosCatalogo` mantiene correspondencias explícitas entre nombres de posiciones en la malla y códigos del catálogo. Los espacios genéricos de optativas o libre elección se dejan sin código específico: no representan una asignatura única.

La clase `FuentesAcademicas` permite consultar por código y recuperar la malla, el catálogo y la oferta **sin exigir que existan las tres coincidencias**. Devuelve `null` o colecciones vacías cuando no haya registro: no completa datos con suposiciones ni produce alertas por falta de cobertura.

Los grupos permanecen agrupados por su **actividad original** en `js/oferta-fuente.js`. Para los horarios activados en Fundamentación y Nivelación, las distintas actividades de un mismo identificador de grupo se consolidan; no se emparejan identificadores diferentes. No se confunde `cuposDisponibles: 0` con un grupo ausente, ni se interpreta como capacidad total. Un grupo sin horarios explícitos se conserva con `horarios: []`.

**La aplicación utiliza los horarios disponibles de Fundamentación y Nivelación en los informes y en el mapa de calor**, además de los grupos disciplinares que ya estaban incorporados. Las optativas genéricas no se asocian por conjetura a una asignatura concreta.

Para cursos de Fundamentación con varias actividades, se agrupan bloques únicamente cuando **el identificador de grupo es exactamente el mismo en las distintas actividades** de la oferta. Así, un grupo puede tener teoría, taller y laboratorio en su horario sin unir arbitrariamente grupos distintos. La incorporación no es una reconstrucción completa de la oferta disciplinar: los grupos nuevos de ese componente se conservan todavía en la fuente de referencia hasta comprobar sus relaciones.

Al recuperar escenarios anteriores se añaden una sola vez las asignaturas y grupos que no existían en esa versión. La migración **no reincorpora grupos antiguos eliminados ni modifica bloques que el estudiante haya editado**. Si se desea volver completamente a la oferta de referencia, puede usarse Restablecer.

Los ficheros de referencia no se cargan automáticamente al abrir `index.html`, para mantener ligero el sitio estático. Están disponibles para futuros importadores y pantallas de consulta. Para inspeccionarlos localmente, pueden evaluarse junto con `js/fuentes.js`.

### Regla para datos incompletos

- Lo que no está informado permanece ausente (`null` o `[]`), **no se convierte en cero**.
- Las funciones existentes trabajan con lo disponible. Ninguna ausencia de grupo u horario se convierte en conflicto.
- Las comprobaciones numéricas de créditos no emiten advertencias si falta información indispensable para calcularlas.
- La aplicación solo conserva las comprobaciones de consistencia que sí son calculables con la malla disponible.
- Los cambios al escenario siguen siendo locales; las fuentes no reemplazan las decisiones del usuario.

Ejecutar `node tests/fuentes.js` para verificar la integridad de las fuentes y `node tests/oferta-activa.js` para verificar que los horarios de Fundamentación y Nivelación se incorporan sin romper escenarios.

## Escenarios personales

- Los cambios se guardan automáticamente mediante `localStorage` del navegador.
- **Guardar** descarga un archivo JSON del escenario; **Cargar** permite recuperarlo.
- Los archivos de escenarios anteriores pueden seguir cargándose: las nuevas tipologías y reglas de créditos se completan a partir de la base, sin sustituir los cambios personales existentes.
- **Restablecer** vuelve a los datos iniciales incorporados a la aplicación.
- La aplicación no tiene cuentas de usuario ni almacena información personal en un servidor.

## Estructura actual

```text
index.html          Entrada de la aplicación, versión y pie informativo
css/estilos.css     Estilos principales
css/pie.css         Pie de página
js/datos.js         Malla y escenario inicial de grupos/horarios, vínculos y metadatos de fuentes
js/catalogo.js      Catálogo completo: códigos, nombres, tipologías, créditos, descripciones
js/oferta-fuente.js Oferta textual: actividades, grupos y franjas informadas
js/fuentes.js       Objeto FuentesAcademicas para relacionar fuentes sin exigir completitud
js/modelo.js        Objetos de dominio: PlanCurricular y CalendarioAcademico
js/app.js           Cálculos de interferencias, escenarios, navegación e interfaz
tests/verificar.js  Pruebas de cálculo con datos variables
tests/filtros.js    Pruebas de selección de componentes
tests/fuentes.js    Pruebas de tres fuentes y ausencia de datos
tests/oferta-activa.js Pruebas de incorporación B/N, bloques y migración local
```

Para uso local, clonar este repositorio y abrir `index.html`. Para ejecutar las pruebas, usar `node tests/verificar.js` (Node.js instalado).

## Criterios de diseño y mantenimiento

La organización sigue **POO como filosofía de responsabilidades**, no la creación obligatoria de una clase por registro:

- **`PlanCurricular`** recibe el escenario y concentra la interpretación de tipologías, suma de créditos, reglas numéricas, semestres y operaciones de edición curricular. No genera HTML ni conoce Mecatrónica.
- **`CalendarioAcademico`** encapsula los días y horas de la semana configurados en los datos. Las rejillas utilizan el número de días configurado.
- **`js/app.js`** mantiene las vistas y eventos, y delega las reglas del plan en el objeto de dominio. El cálculo de interferencias continúa separado de esas reglas y no usa las tipologías para deducir horarios.
- **`js/datos.js`** contiene el plan, las relaciones entre sus fuentes y el escenario inicial de grupos y horarios. **`js/catalogo.js`** y **`js/oferta-fuente.js`** conservan las otras dos fuentes. Cambiar datos académicos no exige editar el algoritmo.

### Dónde están los datos en la versión heredada (v0.4.3)

| Registro de `RAW` | Contenido |
|---|---|
| `programa` | Identificador y nombre del programa |
| `malla` | Registros `[nombre, semestre, nota, créditos, componente, carácter]` |
| `componentes` | Catálogo `[id, nombre, enPlan]`: `enPlan` determina si cuenta en el total de créditos del programa |
| `caracteres` | Catálogo de obligatoria/optativa u otras categorías |
| `reqCred` | Reglas `[asignatura, créditos mínimos, [componentes que cuentan]]` |
| `asg`, `gr`, `bl`, `pre` | Asignaturas incorporadas, grupos, bloques y relaciones entre asignaturas |
| `calendario` | Días de la semana y horario visible de inicio/fin |
| `opciones` | Distancias permitidas e iniciales, exclusión de prerrequisitos indirectos, asignatura inicial |
| `metadatos` | Fechas de las fuentes presentadas en el pie |
| `almacenamiento` | Clave local de escenarios; no cambiarla inadvertidamente si se desea conservar la compatibilidad existente |

Los datos no tienen por qué estar completos: un grupo sin bloques no genera conflictos ni impide usar la aplicación. Si en el futuro se incorpora otra carrera, tendrá sus propias asignaturas, tipologías, requisitos y oferta; la lógica compartida no debe recibir excepciones por nombre.

**Compatibilidad:** los escenarios se almacenan como JSON; las clases no se serializan. Al recuperarlos se completan los campos introducidos en versiones posteriores. Las correcciones históricas de escenarios antiguos, por su propia naturaleza, pueden conservar nombres de registros de versiones pasadas. Los cambios voluntarios de prerrequisitos deben mantenerse después de guardar y cargar.

**Limitación a considerar al incorporar otros programas:** actualmente las relaciones entre asignaturas se identifican principalmente mediante sus nombres dentro de una malla. Al compartir asignaturas entre varios planes, convendrá asociar códigos estables cuando estén disponibles, sin imponer ese cambio antes de necesitarlo.

## Evolución prevista, no implementada

El proyecto podrá crecer hacia otras carreras, consulta de materiales, comparación de contenidos y estimación de demanda. Estas funciones no forman parte de la versión actual y **no se consideran defectos por estar ausentes**.
