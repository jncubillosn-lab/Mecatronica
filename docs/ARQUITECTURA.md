# ARQ-01 — Arquitectura de referencia del sistema

> **Estado:** criterio arquitectónico adoptado para el desarrollo posterior.  
> **Fecha:** 7 de noviembre de 2026.  
> **Alcance:** sistema web de planeación curricular de Mecatrónica. La estructura evita fijar reglas de una carrera en el motor, pero esto **no establece como función solicitada** el soporte de otros programas.  
> **Arquitectura normativa:** la descrita en este documento. **Integrada en `main` desde v0.5.0.** El sistema adopta entrada única, escenario derivado y cambios personales; conserva una proyección interna transitoria para la interfaz existente. Las versiones posteriores y su estado se registran en [EST-01](ESTADO-Y-PUBLICACION.md), sin requerir que esta norma cambie con cada versión.
>
> **Documentos complementarios:** [DEC-01 — decisiones y alcance](DECISIONES-Y-ALCANCE.md) · [EST-01 — estado y publicación](ESTADO-Y-PUBLICACION.md) · [MIG-ARQ01 — historial de migración](MIGRACION-ARQ01.md).

## 0. Regla principal, no negociable

**El sistema recibe una sola entrada académica estandarizada: `FuentesAcadémicas`.**

El artefacto de intercambio se denomina en este documento **`datos/academico.json`** (archivo normalizado implementado desde la migración v0.5.0). Contiene todos los datos normalizados que la aplicación puede utilizar: asignaturas, planes y mallas, requisitos, oferta y relaciones entre actividades, además de la configuración necesaria.

**Fuera del sistema** quedan por completo la recopilación, lectura, extracción, OCR, transcripción, limpieza, comparación, corrección y **conversión** del catálogo institucional, de la oferta de grupos y de la malla curricular. No constituyen capas ni módulos de la aplicación. Quien produzca el JSON decide cómo convertir las fuentes; la aplicación **no conoce ni necesita conocer** ese proceso.

No habrá una conexión alternativa desde la malla, el catálogo, una fuente sin convertir, `RAW` o cualquier archivo heredado al motor de análisis. **El JSON normalizado es el único punto de entrada de datos académicos**. Los eventos del usuario que personalizan su escenario son operaciones, no fuentes académicas adicionales.

### Diagrama rector: únicamente lo que está dentro del sistema

```mermaid
flowchart TB
    EN["ÚNICA ENTRADA ACADÉMICA<br/>FuentesAcadémicas<br/>datos/academico.json"]

    subgraph SISTEMA["SISTEMA WEB — límite de responsabilidad"]
        L["Lector del contrato normalizado"]
        MA["Modelo académico<br/>catálogo · plan · oferta · relaciones"]
        SB["Escenario base de referencia"]
        AP["Aplicación de cambios personales"]
        EF["Escenario efectivo"]
        AN["Motor de análisis curricular y de horarios"]
        VF["Selección de componentes y filtros de consulta"]
        RE["Resultados de la selección"]
        VI["Interfaz: inicio · interferencias · asignaturas<br/>grupos · horarios · mapa de calor · prerrequisitos"]
        PE["Persistencia local de modificaciones personales"]

        L --> MA --> SB --> AP --> EF
        EF --> AN
        VF --> AN
        AN --> RE --> VI
        VI -->|"ediciones del usuario"| AP
        AP <-->|"guardar / recuperar cambios"| PE
    end

    EN --> L
```

**Interpretación obligatoria:** la flecha `FuentesAcadémicas → Lector` es **la única entrada académica** al sistema. No deben añadirse flechas laterales ni un segundo canal desde archivos de origen hacia la interfaz, los escenarios, los cálculos o las pruebas de producción.

### Lo que expresamente NO pertenece a este mapa

Las tres fuentes originales (malla curricular, catálogo de asignaturas, oferta de grupos y horarios) y cualquier proceso usado para convertirlas se encuentran **antes y fuera de la frontera**. No se dibujan como componentes internos. Tampoco deben añadirse a la aplicación módulos `ConversorMalla`, `ConversorCatalogo`, `ConversorOferta`, pantallas de importación de fuentes sin normalizar ni adaptadores específicos para PDF/HTML/Excel.

La información sobre su procedencia puede quedar **como metadato** dentro del JSON normalizado. Esa procedencia no es una ruta de lectura alternativa.

## 1. Contrato: qué recibe FuentesAcadémicas

**Un archivo JSON con estructura estable**, independiente del formato y del número de documentos que se hayan usado para producirlo. El JSON representa el estado académico disponible para un programa/plan y una oferta de periodo cuando se conozca.

No son obligatorias las **cantidades** de registros: una colección puede estar vacía y un dato desconocido puede ser `null`. La estructura se valida; la **completitud institucional no se exige**.

| Campo normalizado | Responsabilidad | Regla |
|---|---|---|
| `versionEsquema` | Identifica la forma del contrato | Entero, distinto de la versión de la página y de la fecha de las fuentes |
| `programa` | Identifica programa y plan | Los identificadores se definen en los datos; no en funciones |
| `componentes` y `caracteres` | Componentes del plan, inclusión en créditos y caracteres curriculares | Configurables; no se fijan B/C/N ni otros valores institucionales en el motor |
| `catalogo` | Asignaturas institucionales, código, nombre, créditos, tipología y texto cuando exista | No depende de que el curso aparezca en la malla u oferta |
| `malla` | Posiciones curriculares, semestre, componente y carácter | Una posición puede representar una optativa genérica y no tener código de asignatura |
| `requisitos` | Relaciones y mínimos de créditos definidos para un plan | No se copian automáticamente a otros planes; se expresa qué componentes cuentan |
| `oferta` | Oferta por periodo, actividades, grupos y bloques horarios | Se preservan los grupos aunque no tengan bloques |
| `agrupaciones` | Relaciones de grupos por actividad y su elegibilidad para el análisis | `analizable: false` conserva la agrupación como información sin incorporarla a cálculos; ausente equivale a `true` |
| `exclusionesAgrupacion` | Posiciones cuya oferta tiene actividades, pero no hay agrupaciones verificadas | Se conserva el motivo sin fabricar combinaciones ni perder los grupos de `oferta` |
| `configuracion` | Calendario, filtros disponibles y reglas de comparación | Sin constantes propias de una carrera en el algoritmo |
| `procedencia` | Identificación/fecha de la información si consta | Metadatos opcionales; nunca instrucciones para leer otras fuentes |

**Ejemplo de forma** (ilustrativo, incompleto en contenido académico, no una conversión exhaustiva):

```json
{
  "versionEsquema": 1,
  "programa": {
    "id": "mecatronica",
    "nombre": "Ingeniería Mecatrónica",
    "planId": "acuerdo-6-2022"
  },
  "componentes": [
    { "id": "B", "nombre": "Fundamentación", "enPlan": true },
    { "id": "C", "nombre": "Disciplinar", "enPlan": true },
    { "id": "L", "nombre": "Libre elección", "enPlan": true },
    { "id": "N", "nombre": "Nivelación", "enPlan": false }
  ],
  "catalogo": [
    {
      "codigo": "1000003-B",
      "nombre": "Álgebra Lineal",
      "creditos": 4,
      "tipologiaInstitucional": "B",
      "descripcion": null
    }
  ],
  "malla": [
    {
      "id": "pos-algebra-lineal",
      "codigoAsignatura": "1000003-B",
      "semestre": 2,
      "creditos": 4,
      "componente": "B",
      "caracter": "obligatoria"
    }
  ],
  "requisitos": {
    "prerrequisitos": [],
    "minimosCreditos": []
  },
  "oferta": [],
  "agrupaciones": [],
  "configuracion": {
    "calendario": {
      "dias": [
        { "id": "L", "nombre": "Lunes", "corto": "Lun" },
        { "id": "M", "nombre": "Martes", "corto": "Mar" }
      ],
      "horaInicio": 6,
      "horaFin": 21
    },
    "opciones": {
      "componentesComparables": ["B", "C", "N"],
      "distanciasDisponibles": [0, 1, 2],
      "distanciasIniciales": [0, 1]
    }
  },
  "procedencia": {
    "catalogo": null,
    "oferta": null,
    "malla": null
  }
}
```

Los identificadores del ejemplo ilustran el contrato: no implican que toda posición curricular tenga código ni que cada fuente tenga la misma cobertura. **La estructura real adoptada está en `datos/academico.json` y sus pruebas de contrato**; el fragmento ilustrativo no autoriza crear campos académicos obligatorios ni inventar cardinalidades. Las reglas de identidad y la flexibilidad ante vacíos se mantienen según la información normalizada disponible, sin ampliar la frontera de entrada.

### Semántica de datos ausentes

- `null` significa **dato no conocido / no informado**, cuando un campo admite ausencia.
- `[]` significa **no hay registros informados en esa colección**; no autoriza inferir que institucionalmente no existan.
- `0` es un **dato numérico conocido**; no se utiliza como reemplazo automático de una ausencia.
- No se inventan nombres, códigos, requisitos, créditos, agrupaciones, aulas, cupos o horarios.
- Inglés I–IV pertenece a **Nivelación** en este plan; la tipología institucional puede conservar además el código `E`. Son atributos distintos.
- La tipología institucional de un curso y su **componente dentro de un plan** pueden diferir sin contradicción.
- Se permiten asignaturas que solo estén en catálogo, posiciones genéricas sin curso identificado, grupos sin horarios y datos de periodos incompletos.
- Cuando faltan horarios, el motor **no inventa cruces**. La ausencia de un choque detectado con horarios incompletos no demuestra compatibilidad definitiva; no debe disparar avisos por falta de información.

### Identificadores y relaciones

- **Asignatura:** código institucional cuando exista; no se deduce por similitud del nombre.
- **Posición curricular:** ID propio dentro de un plan. No es sinónimo de asignatura.
- **Oferta:** vinculada a un código de asignatura y, cuando exista, a un periodo académico.
- **Grupo de actividad:** identidad contextualizada por oferta, actividad e ID de grupo, no solo por el texto “G1”.
- **Agrupación registrada:** relaciona los grupos de actividad que la fuente normalizada declara compatibles como una opción. No se hacen productos cartesianos entre teorías y laboratorios ni se supone universalmente que dos IDs iguales deban combinarse.
- **Elegibilidad:** `analizable: false` conserva una agrupación para consulta, pero la excluye de interferencias, matrices, mapa de calor e indicadores horarios. Si no se informa, equivale a `true`. El contrato declara esta propiedad; no se deduce de nombres o prefijos dentro del motor. Los grupos de otras sedes se conservan sin participar en cálculos hasta que exista validación de su alcance.
- **Requisitos:** se expresan respecto del plan y sus posiciones; los mínimos numéricos y componentes que cuentan son **datos**, no condiciones incrustadas en funciones.

El sistema **consume** esas relaciones ya representadas en la entrada normalizada. No reconstruye la procedencia ni convierte los formatos originales para resolverlas.

## 2. Componentes internos y responsabilidades (POO como diseño)

| Responsabilidad | Entrada dentro del sistema | Salida | No debe hacer |
|---|---|---|---|
| **Lector del contrato** | Solo `FuentesAcadémicas` | Modelo académico en memoria | Interpretar PDF, HTML, TXT, Excel o tres rutas de fuente |
| **Modelo académico** | Datos normalizados | Consultas a asignaturas, plan, requisitos, oferta y agrupaciones | Fabricar ausencias ni reglas particulares por nombre |
| **Escenario base** | Modelo académico | Selección base analizable | Leer archivos originales ni almacenar resultados precomputados como fuente |
| **Escenario personal** | Referencia + cambios voluntarios | Escenario efectivo | Sobrescribir eliminaciones o ediciones personales por una actualización de referencia |
| **Análisis** | Escenario efectivo + filtros/criterios | Interferencias, compatibilidades calculables y estadísticas | Decidir qué datos institucionales se importan |
| **Presentación** | Resultados y consultas al modelo | Páginas, tablas, mapa de calor, CSV | Recalcular resultados paralelos con reglas diferentes |
| **Persistencia local** | Cambios personales | Datos para reconstruirlos | Tratar una copia antigua de la referencia como fuente autoritativa |

No es necesario crear una clase por entidad ni mantener exactamente estos nombres de clases. La regla vinculante es **una responsabilidad por componente** y dependencias dirigidas desde el contrato hacia los consumidores, nunca en sentido inverso.

### Cálculo y visualización

- Los filtros de Fundamentación, Disciplinar y Nivelación son **selecciones de consulta**, no operaciones de eliminación de información.
- Una agrupación con `analizable: false` puede consultarse; los cambios personales no pueden convertirla por sí solos en una agrupación calculable.
- Inicio, Interferencias, Asignaturas, exportaciones, paneles y mapa de calor deben interpretar **la misma selección activa**; no debe persistir una vía de resultados no filtrados en un panel cuando su filtro está desmarcado.
- Grupos, Horarios y Prerrequisitos pueden ofrecer edición/consulta completa del escenario sin ocultar datos por un filtro estadístico.
- Un grupo con varias actividades conserva todos sus bloques **según las agrupaciones explícitas del contrato**.
- No se confunde el número de grupos disponibles con número de estudiantes, capacidad de aulas u ocupación efectiva.
- Los créditos mínimos se comprueban por los componentes y criterios registrados en el plan, no por totales fijos del código.

## 3. Estado de referencia y modificaciones personales

El estado académico normalizado es una **referencia**. Un estudiante puede desactivar grupos, editar horarios, mover asignaturas, cambiar relaciones o construir un escenario hipotético. Estas decisiones no modifican la referencia.

La arquitectura objetivo conserva **operaciones o diferencias personales** vinculadas a identificadores estables. Al cargar una versión posterior de `FuentesAcadémicas` se reconstruye el escenario utilizando la nueva referencia y las modificaciones de la persona.

**Invariantes:**
1. La actualización del archivo académico no se atribuye a una edición personal.
2. Un grupo que la persona eliminó deliberadamente no se restaura por accidente.
3. Los grupos nuevos pueden incorporarse desde la referencia sin redactar una migración por cada asignatura.
4. Los escenarios JSON antiguos merecen una transición explícita y comprobada, no se descartan silenciosamente.
5. Exportar y recuperar un escenario no cambia la interpretación de los datos académicos.
6. `Restablecer` reconstruye desde la referencia normalizada vigente.
7. Las operaciones sobre el escenario **no son otra fuente académica de entrada**: son personalizaciones de datos ya cargados.

## 4. Verificaciones: antes de presentar información

La revisión técnica debe comprobar la **fidelidad al contrato**, no exigir datos que no existen.

- **Estructura:** JSON legible, versión reconocida, tipos de campo correctos e identidades no ambiguas.
- **Referencias:** las relaciones informadas apuntan a las entidades esperadas; las ausentes permitidas permanecen ausentes.
- **Cobertura:** ninguna asignatura, grupo o bloque **elegible según el contrato** se omite sin una exclusión explícita.
- **Horarios:** la prueba compara día, hora de inicio, hora de fin y agrupación; no solo cantidades de bloques.
- **Resultados:** filtros, indicadores, matrices, paneles y CSV utilizan el mismo escenario y selección.
- **Escenarios:** cambios voluntarios se conservan al actualizar la referencia; los nuevos datos disponibles se incorporan sin restaurar eliminaciones.
- **Flexibilidad:** el mismo motor trabaja con otros nombres, componentes, planes, semestres y calendarios.
- **Información incompleta:** un dato ausente no provoca alertas por ausencia ni obliga a completar otros campos.

Errores **técnicos** del contrato (por ejemplo, archivo ilegible o una hora final anterior a la inicial) se distinguen de **vacíos académicos legítimos**. No convertir vacíos de las fuentes en fallos de la interfaz.

## 5. Migración de v0.4.3 a v0.5.0 — implementación de ARQ-01

La v0.4.3 todavía utilizaba `js/datos.js` como entrada principal de ejecución, con grupos preparados manualmente, y guardaba copias completas del escenario.

**Implementado desde la fusión de la PR #8 a `main` (v0.5.0):**
- **Entrada única:** `index.html` ya no carga `js/datos.js`, `js/catalogo.js` ni `js/oferta-fuente.js`. `js/iniciar.js` solicita exclusivamente `datos/academico.json`.
- **Modelo/escenario:** `js/entrada.js` interpreta el contrato y genera el escenario base. El motor y la interfaz heredados continúan usando temporalmente una proyección de ese contrato llamada `RAW`; **esta proyección no es otra entrada ni lee otras fuentes**.
- **Personalización:** `js/escenarios.js` conserva las diferencias del usuario respecto a la referencia actual y reconstruye el escenario efectivo. Puede reconocer archivos antiguos `{S}` usando las identidades históricas incluidas en la **misma entrada académica**.
- **Análisis y vistas:** el cálculo se ejecuta sobre el escenario efectivo y los indicadores, paneles analíticos y exportaciones toman la selección de componentes. Las páginas de edición conservan los datos completos.
- **Pruebas:** verificaciones de integridad del contrato, cobertura de agrupaciones, igualdad exacta de horarios, escenarios viejos y nuevos y siete vistas. No se inventan relaciones entre actividades incompletas.

Las estructuras `js/datos.js`, `js/catalogo.js`, `js/oferta-fuente.js` y `js/fuentes.js` se conservan **únicamente como archivos históricos fuera de la ruta de ejecución**. No son entradas alternativas. Su conversión ya ocurrió **fuera del sistema**: no hay módulo interno para interpretar TXT, HTML, Excel o PDF.

**Alcance restante de la transición:** la interfaz y las funciones existentes aún reciben la proyección `RAW` en lugar de operar sobre objetos del dominio de extremo a extremo. Esto es deuda de implementación localizada y no autoriza rutas paralelas de información. Tampoco se han definido agrupaciones no verificadas para cursos con varias actividades; sus registros permanecen disponibles en `oferta`.

**Verificación y puesta en producción:** la migración fue integrada en `main` mediante la PR #8, con pruebas CI satisfactorias. La PR #9 llevó el indicador y los recursos versionados a v0.5.1, e incorporó validación automática de versiones. La presencia de código en `main` y el resultado de CI no constituyen por sí solos una inspección pública del sitio servido por Pages; comprobar por separado según [EST-01](ESTADO-Y-PUBLICACION.md). El contrato no obliga a completar datos faltantes ni a generar alertas por su ausencia.

### Orden invariable de implementación

1. Entrada única normalizada, producida fuera del sistema.
2. Lector y escenario base generados desde esa entrada.
3. Diferencias personales y compatibilidad de escenarios anteriores.
4. Análisis, filtros y presentación coherentes.
5. Pruebas técnicas, regresión y publicación controlada.

**Ninguna fase habilita a reintroducir una segunda entrada académica.**

## 6. Cambios de alcance expresamente aprobados

**Este documento no establece una hoja de ruta ni autoriza funciones futuras por anticipado.** Solo cuando una necesidad sea solicitada y aprobada se examina su efecto arquitectónico. La falta de una característica no requerida no es un problema del sistema.

Si una función autorizada necesita nuevos datos académicos, primero se justifica si cabe ampliar de forma compatible el contrato `FuentesAcadémicas`; de ser así, esos datos se proporcionan mediante **el mismo archivo normalizado**. Un componente no lee fuentes originales. Los datos personales o de interacción permanecen diferenciados de la referencia académica.

Véase [DEC-01](DECISIONES-Y-ALCANCE.md) para la regla de no atribuir objetivos al proyecto.

El sistema sigue siendo compatible con publicación estática (GitHub Pages). La arquitectura no exige servidor, cuentas ni servicios externos.

## 7. Guía obligatoria para próximas interacciones

Antes de modificar la aplicación o sus datos:

1. Leer **`docs/ARQUITECTURA.md`**, [DEC-01](DECISIONES-Y-ALCANCE.md) y [EST-01](ESTADO-Y-PUBLICACION.md); tratar el diagrama de **una sola entrada** como referencia.
2. Indicar qué responsabilidad/capa se cambia y qué información del contrato utiliza.
3. Comprobar si la petición puede resolverse **solo modificando el archivo académico normalizado**, sin tocar algoritmos.
4. No proponer conversores de las tres fuentes como parte del sistema web ni reintroducir conexiones desde archivos originales al cálculo.
5. No introducir constantes institucionales en las funciones cuando son datos del plan o de la oferta.
6. No generar alarmas para compensar vacíos legítimos de información.
7. Realizar pruebas de cobertura, resultados, compatibilidad de escenarios y ausencia de rutas paralelas; en una PR con cambios a recursos productivos, **incrementar y verificar la versión pública** conforme a EST-01.
8. Si una nueva necesidad obliga a alterar esta arquitectura, **proponer y justificar primero el cambio al documento**. No establecer silenciosamente una excepción en el código.

**La prioridad arquitectónica es la simplicidad: una entrada académica, un modelo común, un escenario efectivo y resultados coherentes.** No se requieren capas, validaciones ni objetivos adicionales por costumbre. Para distinguir decisiones normativas de características implementadas consultar DEC-01 y EST-01.
