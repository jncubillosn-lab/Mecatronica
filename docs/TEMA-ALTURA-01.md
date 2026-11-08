# TEMA-ALTURA-01 — Contraste visual y alto intrínseco de Prerrequisitos

**Corte:** 8 de noviembre de 2026 · **Versión propuesta:** 0.7.2.  
**Alcance:** exclusivamente visual, independiente de la única entrada académica ARQ-01, el estado del plan y sus escenarios guardados.

## 1. Tema claro / oscuro

- **Oscuro predeterminado** en cualquier navegador y dispositivo, sin depender de `prefers-color-scheme`.
- **Claro optativo** mediante botón global «Modo claro» de la cabecera. Al activar el claro, el mismo control ofrece volver a «Modo oscuro».
- La elección se conserva en `localStorage['gestor-horarios-tema-visual']` cuando el navegador lo permite. Si no existe o está bloqueado, se utiliza oscuro.
- La selección se aplica en `js/tema.js` **antes** de que se cargue la hoja de estilos, evitando parpadeos de un tema distinto.
- Las variables cromáticas contemplan fondos, texto, bordes, estados, acentos de programa y colores estadísticos de Demanda. Los significados analíticos y la identidad de cada carrera no se intercambian entre temas.
- No se incorpora ningún atributo de apariencia en `datos/academico.json`, ni en `S`, `S0` o escenarios personales. El catálogo de carreras sigue en `js/identidad.js`.
- El control es un botón de navegación permanente con `aria-label`, `aria-pressed` y foco visible; se utiliza tanto en escritorio como en móvil.

## 2. Altura del marco curricular

**Regla:** fuera de pantalla completa, la altura del marco que contiene la malla debe ajustarse al contenido de la **columna de semestre más larga**, incluyendo todas sus tarjetas, etiquetas, separaciones, padding y escala visual.

Implementación con **dimensiones intrínsecas CSS**, no con un número de píxeles ni un semestre codificado:

- `.malla-panel:not(.malla-panel--ampliado) .canvas`: `height:max-content; min-height:0; max-height:none`.
- `.malla-panel:not(.malla-panel--ampliado) .malla-stage`: altura `max-content`.
- El contenedor interno `.mcols` conserva la cuadrícula de semestres, donde la altura natural de la fila viene de la columna más alta. Las tarjetas `.mcard`, las opciones de Libre elección, el cambio de filtros y el zoom participan automáticamente en esa altura.
- El ancho continúa siendo responsive con desplazamiento horizontal **local**; la página puede hacerse verticalmente larga para mostrar el semestre completo en vez de recortar información.
- La relación ancho/alto deja de ser fija; depende del número de semestres, de sus asignaturas y de la pantalla.
- **Excepción deliberada:** en pantalla completa el contenedor debe ocupar la altura disponible del dispositivo, y el propio mapa usa desplazamiento en ambos ejes si la información excede esa ventana.

Este comportamiento sigue la filosofía de minimalismo informativo: se muestra la información completa cuando es posible, sin encoger los textos ni ocultar tarjetas para que la malla quepa artificialmente en un alto fijo.

## 3. Revisión documental de TPI y PAI (sin modificación académica)

**Fuentes textuales verificadas:**

1. Página del programa de Ingeniería Mecatrónica, Facultad de Ingeniería:  
   https://ingenieria.bogota.unal.edu.co/es/programas-academicos/ingenieria-mecatronica/  
   Describe la agrupación Investigación, Innovación y Desarrollo Tecnológico, en la que figuran Taller de Proyectos Interdisciplinarios (TPI), Proyecto Aplicado de Ingeniería (PAI) y Trabajo de Grado; señala 179 créditos y remite al Acuerdo 6 de 2022.
2. Registro oficial del Acuerdo 6 de 2022, Consejo de Facultad de Ingeniería, en el Régimen Legal UNAL:  
   https://legal.unal.edu.co/rlunal/home/doc.jsp?d_i=100648  
   Es la **norma vigente de modificación del plan 2022** indicada por la propia Facultad. El portal público consultado requiere continuar a una interfaz que no proporcionó el articulado legible en la consulta disponible; por ello **no se ha comprobado en el texto del Acuerdo que 52 y 65 incluyan componentes específicos**.
3. Sistema de Información Académica UNAL: existen fichas textuales de asignaturas en el catálogo institucional, pero no se pudo verificar en esta revisión el texto de prerrequisitos específico para TPI (código 2024045) y PAI (2017275) bajo el plan vigente de Bogotá (SIA 2548). No se toma una ficha de otro plan o de otra asignatura como sustituto.

**Hallazgo:** el nombre de la asignatura y su posición no demuestran cómo calcular su prerrequisito. La notación visual `52 C` y `65 C` de la malla, por sí sola, no aclara inequívocamente si son créditos del componente Disciplinar, créditos totales del plan o una regla curricular especial. La página institucional narrativa tampoco enumera esos requisitos concretos. Por tanto, **no se corrige por conjetura** el contrato `requisitos.minimosCreditos`, ni sus umbrales ni sus componentes.

**Verificación necesaria antes de un cambio posterior:** recuperar el articulado normativo completo y/o las reglas de inscripción SIA correspondientes a TPI y PAI para el plan 2022, indicando expresamente el numerador, los componentes y la condición de créditos aprobados. Si hay discrepancia, debe registrarse por escrito cuál fuente normativa prevalece.

### Decisión posterior, v0.7.3

La incertidumbre anterior **ya no aplica a la configuración actual de TPI y PAI**: por criterio explícito indicado para el proyecto se implementaron **TPI = 52 créditos C (SIA 2024045, 3 cr)** y **PAI = 65 créditos C (SIA 2017275, 4 cr)** en la única entrada normalizada. Esta configuración no se presenta como verificación independiente de una norma textual. Véase [REQ-C-01](REQ-C-01.md). Trabajo de Grado y otras condiciones permanecen sin modificaciones.

## 4. Pruebas

- `tests/tema-visual.js`: modo oscuro inicial, cambio al claro, persistencia, valores desconocidos y carga temprana.
- `tests/integracion-arq01.js`: botón global, navegación, volver a oscuro y confirmación de que no hay cambios académicos.
- `tests/responsividad.js`: presencia de altura intrínseca sin `max-height` en la vista normal y scroll conservado en pantalla completa.
- `npm test` conserva las demás comprobaciones de datos, filtros, malla y ocho vistas.

**Control visual pendiente:** revisar en navegador real la columna más larga en 320, 375, 768, 1024 y 1440 px, ambos temas y zoom del mapa entre 60 % y 160 %. `jsdom` no permite certificar alturas reales, por lo que las pruebas automáticas no sustituyen esa revisión.
