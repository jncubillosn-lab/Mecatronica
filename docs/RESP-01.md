# RESP-01 — Adaptación de pantallas y exploración de visualizaciones

**Estado:** implementado en la versión propuesta 0.7.0 (8 de noviembre de 2026).  
**Ámbito:** estilos, presentación y controles transitorios; no modifica `datos/academico.json`, cálculos, escenarios ni filtros.  
**Documentos relacionados:** [ARQ-01](ARQUITECTURA.md) · [UNI-UI-01](ESTILO-UNIVERSITARIO.md).

## 1. Principio de adaptación

**No es necesario ver todos los datos simultáneamente en cualquier pantalla: sí es obligatorio que los datos completos se puedan explorar, que las etiquetas sean legibles y que el desplazamiento sea evidente.**

Aplicamos primero reglas generales de tamaños a toda la página y después adaptaciones explícitas para representaciones cuya geometría contiene información (tablas, semanas, redes y gráficos).

- El sitio usa el ancho disponible con un límite cómodo para lectura y márgenes fluidos.
- Los contenedores flex/grid pueden reducirse con `min-width:0`; se evita el scroll horizontal de **toda la página**.
- Los componentes se reorganizan en anchos intermedios y móviles; no se les obliga a comprimirse hasta perder legibilidad.
- Los elementos anchos se desplazan **dentro de su región**, identificada para teclado y táctil cuando corresponde.
- La cabecera deja de superponerse al contenido durante el desplazamiento vertical: sus títulos, etiquetas y ejes no quedan bajo una barra fija.
- Se conservan los colores semánticos, el modo oscuro, los estados de foco y las preferencias de movimiento reducido.
- Las acciones del mapa son únicamente interfaz y no alteran los datos, escenarios ni historial personal.

## 2. Comportamientos comunes

| Superficie | Escritorio/ancho suficiente | Pantalla estrecha |
|---|---|---|
| Cabecera y filtros | Distribución en filas y controles visibles | Navegación horizontal desplazable; filtros en múltiples filas |
| Página y tarjetas | Contenido fluido con ancho máximo de lectura | Márgenes compactos y tarjetas de una o dos columnas |
| Matrices/tablas | Ajustan al contenedor si pueden | Scroll horizontal local, sin recortar celdas |
| Horarios y mapa de calor | Semana visible con días legibles | `.weekgrid-scroll`, cuadrícula de ancho mínimo y desplazamiento local |
| Malla de prerrequisitos | Lienzo desplazable junto al detalle si cabe | Lienzo y panel de detalle apilados; controles de escala y expansión |
| Demanda | SVG completo limitado a 950 píxeles de ancho | SVG de 730 píxeles como mínimo, desplazamiento local y explicación táctil |

No se debe reemplazar este comportamiento por `overflow:hidden` que esconda ejes o datos. Se evita fijar la altura de SVG: mantiene `viewBox="0 0 950 515"` y `height:auto`.

## 3. Mapa de prerrequisitos

`pageMalla()` construye un panel `#malla-panel` con una barra de controles y la región desplazable `#canvas`, que contiene una etapa `#malla-stage`. Los botones son:

- `−` y `+`: escala de 60 % a 160 % en pasos de diez puntos.
- `100 %`: restablece el zoom.
- `Pantalla completa`: activa una vista que ocupa todo el **viewport** y muestra solo el mapa y sus controles. No despliega el panel de edición. `Escape` y el propio botón la cierran.

Este modo usa CSS `position:fixed` de forma deliberada en vez de requerir la Fullscreen API: está disponible también en móviles que restringen el fullscreen nativo de elementos HTML. Mientras está activo se bloquea el scroll del documento de fondo y solo se desplaza el visor.

El nivel de zoom y el modo ampliado viven exclusivamente en `ui.malla` de `js/app.js`. No se exportan ni guardan como cambios curriculares. `ajustarZoomMapa()` mantiene aproximadamente el centro de la región visible. `drawEdges()` ahora calcula los puntos mediante offsets dentro de la etapa: las flechas no dependen del viewport, de la escala visual ni de scroll del contenedor.

## 4. Gráfica Demanda

El SVG de cuadrantes conserva su marco y margen de ejes, con dimensiones lógicas 950 × 515, manteniendo el corte por medianas, el título de ambos ejes y la selección interactiva.

La regla responsive limita el gráfico a 950 píxeles de ancho como máximo y exige un mínimo legible de 730 píxeles, **sin forzar una altura fija ni recortar** sus textos. En pantallas más estrechas se explora lateralmente dentro de `.dem-grafico-wrap` con foco de teclado, y se muestra una indicación breve en móvil. No deben desaparecer los títulos y las marcas por el hecho de no caber de una sola vez.

## 5. Invariantes y validación

- Conserva las ocho secciones, filtros, cálculos, selección y edición de asignaturas, flujo de importar/exportar, mapas y gráficos.
- No cambia la escala matemática de Demanda: sigue expresando solicitudes y grupos con transformación de raíz cuadrada; solo adapta la presentación.
- No cambia la cantidad de asignaturas, créditos, semestres ni bloques disponibles.
- La prueba `tests/responsividad.js` protege las reglas y contenedores. `tests/integracion-arq01.js` comprueba zoom, ampliación, cierre con Escape y permanencia del estado académico. `npm test` ejecuta el resto de regresiones.

**Validación visual necesaria:** inspeccionar en navegador real, en temas claro y oscuro, anchos de referencia 320, 375, 768, 1024 y 1440 px, y zoom de navegador 100 % y 200 %. Revisar también rotación móvil, lectores de pantalla y arrastre de tarjetas de semestre. La CI en `jsdom` no verifica geometría real: no declarar estos puntos aprobados sin inspección directa.
