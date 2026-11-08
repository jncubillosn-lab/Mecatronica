# Planeación curricular · Ingeniería Mecatrónica

Aplicación web **no oficial** para consultar la malla curricular, examinar grupos ofertados y sus interferencias de horario, evaluar escenarios y explorar una semana mediante un mapa de calor.

**Página pública:** https://jncubillosn-lab.github.io/Mecatronica/  
**Documentación de referencia:** [ARQ-01 — arquitectura](docs/ARQUITECTURA.md) · [DEC-01 — decisiones y alcance](docs/DECISIONES-Y-ALCANCE.md) · [EST-01 — estado y publicación](docs/ESTADO-Y-PUBLICACION.md) · [MIG-ARQ01 — historial](docs/MIGRACION-ARQ01.md) · [Guía de desarrollo](AGENTS.md)

## Arquitectura vigente — v0.5.5

**La aplicación tiene una única entrada académica estandarizada: [datos/academico.json](datos/academico.json).** La versión 0.5.5 simplifica TPI a un solo grupo representativo (G1, lunes y miércoles de 14:00 a 16:00); esto no equivale a la oferta oficial completa.

La malla, el catálogo institucional y la oferta de grupos se transforman **fuera del sistema** a ese formato. El sitio **no importa ni convierte** los documentos originales, ni mantiene conexiones paralelas hacia ellos.

~~~text
        ENTRADA ÚNICA: datos/academico.json
                          │
                 js/entrada.js
                 modelo académico
                          │
                escenario de referencia
                          │
                 js/escenarios.js
              cambios personales opcionales
                          │
                   escenario efectivo
                          │
             análisis de grupos y horarios
                          │
                filtros y visualizaciones
~~~

En v0.5.3 el arranque ya no expone `window.RAW` ni hace que la interfaz dependa de esa estructura: `js/iniciar.js` entrega un **contexto explícito** con escenario de referencia, calendario, configuración y procedencia. `EntradaAcademica` mantiene una proyección posicional **local y transitoria** para construir el escenario inicial y recuperar escenarios históricos, sin abrir una segunda entrada académica. El motor de cálculos está en `js/analisis.js` y las siete vistas en `js/vistas.js`.

**Estado del proyecto:** la migración ARQ-01 ya fue fusionada en `main` mediante la [PR #8](https://github.com/jncubillosn-lab/Mecatronica/pull/8); la [PR #9](https://github.com/jncubillosn-lab/Mecatronica/pull/9) publicó el versionado verificable v0.5.1. La [PR #10](https://github.com/jncubillosn-lab/Mecatronica/pull/10) consolidó los acuerdos generales y la [PR #11](https://github.com/jncubillosn-lab/Mecatronica/pull/11) documentó las responsabilidades y reglas directamente dentro del código, sin cambiar los algoritmos (v0.5.2). La [PR #13](https://github.com/jncubillosn-lab/Mecatronica/pull/13) separa motor/vistas, fortalece las referencias de requisitos y elimina `RAW` del contexto global (v0.5.3). La [PR #14](https://github.com/jncubillosn-lab/Mecatronica/pull/14) introduce filtros globales y unidad opcional por asignatura (v0.5.4). La fusión y las pruebas CI de las versiones anteriores están confirmadas; la comprobación del contenido realmente servido por GitHub Pages es un paso aparte. Véase [EST-01](docs/ESTADO-Y-PUBLICACION.md).

## Qué contiene el contrato

| Sección | Información |
|---|---|
| `versionEsquema` | Identificación de la estructura de entrada |
| `programa` | Programa y versión del plan |
| `componentes` y `caracteres` | Clasificaciones curriculares configurables |
| `catalogo` | Asignaturas, códigos institucionales, créditos, tipologías y descripciones disponibles |
| `malla` | Posiciones por semestre, código relacionado cuando exista, componente y carácter |
| `requisitos` | Prerrequisitos y condiciones numéricas por componente |
| `oferta` | Actividades, grupos, cupos y horarios cuando constan |
| `agrupaciones` | Relaciones explícitas de grupos y elegibilidad para análisis (`analizable`) |
| `exclusionesAgrupacion` | Posiciones cuya oferta no permite determinar aún opciones analizables |
| `configuracion` | Calendario, filtros y opciones de consulta |
| `procedencia` | Metadatos de procedencia disponibles, sin nuevas rutas de lectura |

Las posiciones genéricas de optativas y Libre Elección no se vinculan artificialmente con una asignatura específica. Inglés I–IV se clasifica en **Nivelación**. El catálogo conserva su tipología institucional, que no tiene por qué coincidir con el componente del plan.

El archivo actual incluye el catálogo completo de referencia y los grupos de la oferta; **no supone que todas las actividades puedan agruparse entre sí**.

**Grupos especiales:** los de otras sedes se conservan, pero no participan en cálculos por falta de validaciones de alcance. Hay 79 agrupaciones informativas y 374 analizables, declaradas en la única entrada mediante `analizable: false` para las primeras. La sección Grupos las muestra como información de consulta. La ausencia de horario no produce conflictos ni alarmas. Las opciones ya existentes se conservan y los grupos de actividad única vinculados al plan pueden incorporarse directamente. Las combinaciones sin una relación verificable permanecen en la oferta y no se inventan para los cálculos.

### Información incompleta

**Ausencia de información no equivale a cero ni a error.** Por ejemplo:

- Un curso puede figurar en catálogo pero no en la malla u oferta.
- Una posición de la malla puede no tener código concreto.
- Un grupo puede existir sin horarios informados.
- Una categoría académica puede estar disponible aunque no tenga grupos incorporados.
- Una asignatura con varias actividades puede carecer de agrupación verificable.

El sistema conserva lo que sabe y calcula solo con los datos utilizables. No despliega alertas por vacíos normales de las fuentes. Los errores técnicos de estructura del JSON sí se comprueban durante el desarrollo.

## Funciones actuales

| Página | Función |
|---|---|
| Inicio | Resumen de interferencias para la selección de componentes |
| Interferencias | Lista y matriz de combinaciones de grupos, filtros y CSV |
| Asignaturas | Estadísticas por asignatura |
| Grupos | Activar, desactivar, añadir o quitar grupos del escenario |
| Horarios | Consultar y editar bloques; explorar superposiciones |
| Mapa de calor | Concentración de horarios de grupos, **no** ocupación de aulas ni matrícula |
| Prerrequisitos | Malla, requisitos, tipologías y créditos previos |

Las selecciones de Fundamentación, Disciplinar y Nivelación son **independientes y no excluyentes**. Desde v0.5.4, estos filtros aparecen y actúan sobre los elementos visibles **en las siete páginas**, incluidas Grupos, Horarios y Prerrequisitos. Un filtro nunca elimina asignaturas, grupos, bloques o relaciones del escenario; al restablecerlo vuelven a verse.

**Unidad académica responsable (dato opcional del escenario):** en las fichas de Asignaturas, Horarios y Prerrequisitos se puede seleccionar o escribir un **departamento de Ingeniería** o una **facultad fuera de Ingeniería**, o dejarlo **sin información**. No se infiere del profesor ni supone una vinculación laboral permanente. Se guarda ligado al ID curricular como un cambio personal `malla[].unidad`, se conserva en la exportación/importación y permite filtrar por unidad (o por las asignaturas sin dato). Este campo **no es obligatorio ni forma parte de `datos/academico.json`**. Las opciones sugeridas orientan la captura, no asignan valores automáticamente.

## Escenarios personales

Los datos académicos de referencia **no se modifican** al experimentar con horarios o la malla.

- Los cambios se guardan localmente como **diferencias respecto al escenario de referencia**; no se guarda otra copia autoritativa de las fuentes.
- «Guardar» descarga un archivo JSON con las modificaciones; «Cargar» permite reconstruirlas.
- Se aceptan archivos de escenario de versiones anteriores con estructura `{S}`; la migración conserva las ediciones del estudiante cuando se pueden identificar mediante las referencias históricas del mismo contrato.
- Al actualizar `academico.json`, los grupos nuevos se incorporan desde la referencia; los grupos eliminados deliberadamente por una persona siguen eliminados en su escenario.
- «Restablecer» recupera la referencia académica vigente.

No se requieren cuentas, servidor ni servicios externos. La aplicación funciona sobre GitHub Pages.

## Archivos de ejecución

~~~text
index.html
datos/academico.json     ÚNICA entrada académica estandarizada
js/modelo.js             PlanCurricular y CalendarioAcademico
js/entrada.js            Lector del contrato y escenario de referencia
js/escenarios.js         Modificaciones personales y migración histórica
js/analisis.js           Motor puro, prerrequisitos y adaptador posicional legado
js/vistas.js             Siete vistas y paneles de consulta
js/iniciar.js            Entrada única, contexto académico y arranque
js/app.js                Estado de la sesión, navegación y eventos
css/estilos.css
css/pie.css
~~~

Los archivos `js/datos.js`, `js/catalogo.js`, `js/oferta-fuente.js` y `js/fuentes.js` se conservan como **referencias históricas del repositorio**. No se cargan en `index.html` ni son rutas de entrada de producción. Convertir nuevas fuentes originales a `academico.json` es un trabajo **externo** a esta aplicación.

## Documentación integrada al código

Además de ARQ-01 y DEC-01, las decisiones técnicas se explican junto a sus implementaciones:

| Archivo | Qué se documenta internamente |
|---|---|
| `js/entrada.js` | Contrato normalizado, formato de la proyección interna, referencias estables y agrupaciones informativas. |
| `js/modelo.js` | Responsabilidades POO, evaluación de créditos desconocidos y calendario configurable. |
| `js/escenarios.js` | Diferencias personales, aplicación de cambios, validación básica y migración histórica. |
| `js/analisis.js` | Motor de cruces, cálculo de requisitos con IDs estables y adaptador histórico sin DOM. |
| `js/vistas.js` | Siete páginas, detalles y mapas, sin convertirse en fuente de datos ni motor. |
| `js/app.js` | Estado personal, filtros, persistencia, navegación y acciones de edición. |
| `js/iniciar.js` e `index.html` | Orden de arranque, entrada académica única y sincronización del indicador de versión. |
| `css/estilos.css` | Tema visual, número variable de días y semántica del mapa de calor. |

Los comentarios explican **contratos, invariantes y razones no evidentes**; no suponen necesidades académicas nuevas ni sustituyen las pruebas. Al modificar una función, revisar sus comentarios para que no queden obsoletos.

## Pruebas

La batería completa se ejecuta con Node.js y las dependencias de desarrollo declaradas:

~~~sh
npm ci
npm test
~~~

Incluye **nueve conjuntos de pruebas**: versión pública, contrato, oferta, escenarios, vistas, pruebas heredadas e integración simulada de las siete secciones con `jsdom`. GitHub Actions aplica esta batería a cada PR y además exige incrementar el número visible de versión cuando cambian los archivos HTML, JS, CSS o JSON de producción. Los cambios solo documentales no exigen incrementar versión.

Las pruebas activas usan el JSON normalizado para contrato, cobertura, horas, requisitos y vistas; los tests de compatibilidad histórica mantienen sus fixtures sin cargarlos en producción. En v0.5.3 se compara el motor anterior con el extraído sobre una misma entrada y se comprueba el arranque sin `window.RAW`. `tests/verificar.js`, `tests/filtros.js` y `tests/fuentes.js` se mantienen como verificaciones del comportamiento anterior y de los archivos históricos, no como entradas alternativas de producción.

## Alcance y continuidad

**No se establece una hoja de ruta implícita.** Las funciones que el proyecto no ha solicitado no se incorporan como «pendientes» ni como deficiencias de la versión actual. Cualquier ampliación debe partir de una necesidad aprobada y respetar ARQ-01, la entrada única y las decisiones de [DEC-01](docs/DECISIONES-Y-ALCANCE.md).

Para proponer cambios, comprobar primero [EST-01](docs/ESTADO-Y-PUBLICACION.md) y la [guía de desarrollo](AGENTS.md), conservar todas las funcionalidades y revisar el control de versiones antes de fusionar una PR.


## Demanda de preinscripción (DEM-01)

La octava página **Demanda** permite importar o editar un JSON mínimo de solicitudes por ID curricular, explorar solicitudes absolutas, solicitudes por agrupación y comparaciones con la mediana del semestre. No necesita cupos ofertados ni históricos; si faltan datos, los indicadores asociados se muestran como no calculables. Hay un ejemplo **explícitamente simulado**, exportación de la encuesta y conservación en la descarga del escenario personal. La frecuencia y la extrapolación solo se muestran con metadatos de participación informados; las co-solicitudes requieren listas de respuestas anónimas. Contrato y límites: [DEM-01](docs/DEM-01.md).


**Desde v0.5.7:** si no has importado una encuesta, la pestaña Demanda muestra de inmediato una **vista previa simulada, no guardada**. El tablero incluye recomendaciones estadísticas calculadas y percentiles por semestre. Pulsa **Guardar ejemplo en escenario** solo si deseas conservar los datos ficticios; nunca se sustituyen datos reales sin confirmación.


**Desde v0.5.8:** la sección Demanda comienza con una gráfica de cuatro cuadrantes por medianas, colores de mayor contraste, etiquetas y casos señalados. La simulación ilustra expresamente concentraciones elevadas de solicitudes frente al número de agrupaciones, sin pretender que exista escasez real de cupos. Orden: gráfica, comparación por semestre, detalle, recomendaciones, tabla y demanda conjunta.
