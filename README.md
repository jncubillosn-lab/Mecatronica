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
- **Horarios:** conjunto incorporado al repositorio (16 asignaturas, 64 grupos y 114 bloques en la base inicial). La fecha exacta de actualización de la oferta no está registrada.
- **Tipologías:** clasificación revisada el 7 de noviembre de 2026 con la malla y la información de oferta disponible. Cada entrada de malla tiene un **componente** (B: fundamentación; C: disciplinar; L: libre elección; N: nivelación) y un **carácter** (obligatoria, optativa o no aplica).
- **Totales del plan actual:** 56 créditos de fundamentación, 87 disciplinares, 36 de libre elección y 12 de nivelación/lengua extranjera (191 en conjunto).
- Los campos de componente y carácter pueden ajustarse en la ficha de una asignatura. Los cambios se guardan **solo en el escenario del navegador** y se distinguen de los datos iniciales.

### Interpretación de las interferencias

1. Se escoge una pareja de asignaturas que el filtro curricular permite comparar.
2. Se prueba cada combinación de grupos activos entre ambas.
3. Dos grupos chocan si se traslapa al menos un bloque horario de sus componentes. Los bloques 9–11 y 11–13 no chocan.
4. El índice es la proporción de combinaciones de grupos con choque. Una asignatura sin grupos o sin horarios no genera conflictos; no se inventan horarios faltantes.
5. Se pueden configurar distancias entre semestres y la exclusión de relaciones directas o indirectas de prerrequisitos.

### Comprobación de créditos mínimos en la malla

Es un **indicador de consistencia de la distribución por semestres**: suma créditos de asignaturas situadas en semestres anteriores al de la asignatura seleccionada. No equivale a créditos efectivamente aprobados por ningún estudiante.

- **Taller de Proyectos Interdisciplinarios:** 52 créditos **del componente disciplinar (C)**, conforme al criterio específico solicitado para el análisis. En la base actual hay **36 créditos disciplinares antes del semestre VI**; por eso se señala una diferencia de 16 créditos. El plano curricular indica «52 C» sin aclarar en esa etiqueta que se trate exclusivamente del componente disciplinar: **este alcance es un criterio de la herramienta, no una interpretación institucional verificada**.
- **Proyecto Aplicado de Ingeniería:** 65 créditos previos del plan, sin nivelación.
- **Trabajo de Grado:** 69 créditos previos del plan, sin nivelación.

Los requisitos se almacenan como datos del plan, de modo que otro programa pueda tener reglas diferentes. Las advertencias no bloquean el uso ni modifican automáticamente los semestres. Si hubiera tipologías previas sin clasificar, no se formula una advertencia de insuficiencia a partir de una suma incompleta.

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
js/datos.js         Malla, oferta, componentes, carácter y reglas de créditos
js/app.js           Cálculos, escenarios, navegación e interfaz
tests/verificar.js  Comprobaciones automáticas sin dependencias externas
```

Para uso local, clonar este repositorio y abrir `index.html`. Para ejecutar las pruebas, usar `node tests/verificar.js` (Node.js instalado).

## Evolución prevista, no implementada

El proyecto podrá crecer hacia otras carreras, consulta de materiales, comparación de contenidos y estimación de demanda. Estas funciones no forman parte de la versión actual y **no se consideran defectos por estar ausentes**.
