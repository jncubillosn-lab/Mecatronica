# Planeación curricular · Ingeniería Mecatrónica

Aplicación web **no oficial** para consultar la malla curricular, examinar grupos ofertados y sus interferencias de horario, evaluar escenarios y explorar una semana mediante un mapa de calor.

**Página pública:** https://jncubillosn-lab.github.io/Mecatronica/  
**Arquitectura obligatoria:** [ARQ-01](docs/ARQUITECTURA.md) · [Guía de desarrollo](AGENTS.md)

## Arquitectura y migración v0.5.0

**La aplicación tiene una única entrada académica estandarizada: [datos/academico.json](datos/academico.json).**

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

En v0.5.0 la interfaz histórica sigue utilizando una estructura interna denominada `RAW`, **generada exclusivamente desde el JSON normalizado**. No es una segunda fuente ni un archivo académico que deba editarse.

**Estado del proyecto:** la migración se prepara en una rama y debe validarse antes de publicarse en `main`. ARQ-01 distingue el diseño establecido de lo que sigue siendo transitorio.

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

Las selecciones de Fundamentación, Disciplinar y Nivelación son **independientes y no excluyentes**. No modifican los datos del plan ni los grupos guardados; solo cambian las consultas y los resultados.

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
js/iniciar.js            Carga del JSON y arranque
js/app.js                Interfaz y motor heredados (proyección interna RAW)
css/estilos.css
css/pie.css
~~~

Los archivos `js/datos.js`, `js/catalogo.js`, `js/oferta-fuente.js` y `js/fuentes.js` se conservan como **referencias históricas del repositorio**. No se cargan en `index.html` ni son rutas de entrada de producción. Convertir nuevas fuentes originales a `academico.json` es un trabajo **externo** a esta aplicación.

## Pruebas

Ejecutar con Node.js (sin instalar paquetes):

~~~sh
node tests/contrato-arq01.js
node tests/oferta-activa.js
node tests/escenarios-arq01.js
node tests/vistas-arq01.js
~~~

Las pruebas nuevas usan solamente el JSON normalizado y verifican estructura, cobertura, horas exactas, escenarios personales y coherencia de las vistas. `tests/verificar.js`, `tests/filtros.js` y `tests/fuentes.js` se mantienen como verificaciones del comportamiento anterior y de los archivos históricos, no como entradas alternativas de producción.

## Evolución futura

Consulta de materiales mediante enlaces externos, comparación de programas de asignatura, estimación de demanda y soporte para otros programas. Estas funciones no forman parte de la versión actual y **no son defectos por estar ausentes**. Cuando requieran nuevos campos académicos, deberán incorporarse al **mismo contrato normalizado**, sin abrir conexiones paralelas.
