# Planeación curricular · Ingeniería Mecatrónica

Herramienta **no oficial** de la representación estudiantil para examinar la malla curricular, los grupos ofertados y las interferencias de horario. Publicación: https://jncubillosn-lab.github.io/Mecatronica/

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

## Alcance de los datos

La aplicación trabaja **con lo que está registrado**. No exige datos completos ni interpreta la ausencia de un horario como conflicto.

- **Malla de referencia:** Ingeniería Mecatrónica, Acuerdo 6 de 2022; plano curricular versión 28 de julio de 2022.
- **Horarios:** conjunto incorporado a los datos del programa; puede ampliarse sin cambiar las funciones de cálculo. La fecha exacta de actualización de la oferta no está registrada.
- **Tipologías:** clasificación revisada el 7 de noviembre de 2026 con la malla y la información de oferta disponible. Cada asignatura de un plan tiene un **componente** y un **carácter** (obligatoria, optativa o no aplica). El catálogo actual distingue B: fundamentación, C: disciplinar, L: libre elección, N: nivelación y LE: lengua extranjera. **Inglés I–IV corresponde a lengua extranjera, no a nivelación.**
- Los totales por componente son **resultados de sumar los registros de la malla**, no valores fijados en el código de cálculo. Actualmente Lengua Extranjera aporta 12 créditos adicionales a los del programa.
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
js/datos.js         Malla, oferta, catálogos, carácter, requisitos y fechas
js/app.js           Cálculos, escenarios, navegación e interfaz
tests/verificar.js  Comprobaciones automáticas con datos variables (sin cifras fijas del plan)
```

Para uso local, clonar este repositorio y abrir `index.html`. Para ejecutar las pruebas, usar `node tests/verificar.js` (Node.js instalado).

## Evolución prevista, no implementada

El proyecto podrá crecer hacia otras carreras, consulta de materiales, comparación de contenidos y estimación de demanda. Estas funciones no forman parte de la versión actual y **no se consideran defectos por estar ausentes**.
