# TONO-01 — Tipología sutil y contraste ligero de contornos

**Fecha:** 8 de noviembre de 2026 · **Versión:** 0.7.5.  
**Ámbito:** presentación de las ocho páginas del Gestor de horarios.  
**Arquitectura:** [ARQ-01](ARQUITECTURA.md) · [UNI-UI-01](ESTILO-UNIVERSITARIO.md) · [RESP-01](RESP-01.md).

## 1. Criterio de diseño

**Intervención mínima, información protagonista.** Los contornos actuales eran poco distinguibles entre `--surface`, `--bg`, `--surface2` y `--line`. Se cambia solo un nivel de contraste de las variables neutras `--line` y `--line2` en la definición final de los temas claro y oscuro. No cambia el grosor general de bordes, la densidad de tarjetas, la tipografía ni las sombras.

| Token | Oscuro anterior | Oscuro actual | Claro anterior | Claro actual |
|---|---|---|---|---|
| `--line` | `#334354` | `#44566A` | `#E0E5EC` | `#CCD6E0` |
| `--line2` | `#4B5D6F` | `#637588` | `#C6D0DA` | `#ADBCCC` |

Se conserva el **oscuro predeterminado** y el claro como alternativa persistente, así como el comportamiento de los dispositivos móviles.

## 2. Tonos por tipología

Solo reutilizamos tres familias de color presentes en el sistema (azul, violeta y verde); la cuarta es gris azulado neutro, sin agregar una nueva gama saturada.

| Componente académico | ID | Color de referencia |
|---|---|---|
| Fundamentación | `B` | Azul tenue, desde `--ca` |
| Disciplinar | `C` | Violeta tenue, desde `--cb` |
| Libre elección | `L` | Verde suave, desde `--ok` |
| Nivelación | `N` | Gris azulado, desde `--ink3` |

La clasificación visual no tiene su propio campo en `FuentesAcadémicas`. La señal utiliza **el componente de la asignatura en el escenario vigente** (`S.malla[].comp`) a través de `data-tipologia`, para que responda a cambios voluntarios y futuros programas. No se infiere a partir del nombre del curso, el docente ni el código de grupo.

- `atributoComponente(comp)` y `atributoTipologia(nombre)` son funciones de presentación que imprimen únicamente un atributo HTML escapado; no reescriben el escenario ni cálculos.
- Los selectores CSS `[data-tipologia="B/C/L/N"]` asignan `--tipo-acento`; una tipología nueva o desconocida se mantiene **neutra**, sin inventar un color.
- Nombres: marca de 2 px y fondo con 8 % del color de referencia.
- Tarjetas completas de una sola asignatura: marca fina lateral de 3 px y matiz de fondo del 5 al 8 %.
- Listas, barras y filtros: una marca cromática estrecha y discreta.
- No se colorean `<option>` nativos de selección, porque su representación es inconsistente entre navegadores.

## 3. Dónde se usa

| Vista | Marca aplicada |
|---|---|
| Inicio | Nombres de asignaturas en las parejas y en las más afectadas |
| Interferencias | Nombres A/B, matriz (encabezados) y panel de detalle; nunca porcentajes ni choques |
| Asignaturas | Tarjetas de materia y materias relacionadas |
| Grupos | Tarjetas por asignatura y referencias cruzadas |
| Horarios | Lista de asignaturas, nombre de materia activa y materias superpuestas |
| Mapa de calor | Selector individual de asignaturas; no cambia el gradiente de intensidad |
| Demanda | Nombres, tarjetas de comparación, selección, detalle y tabla; no cambia colores de cuadrantes o puntos |
| Prerrequisitos | Tarjetas de todas las tipologías (incluida Libre elección) y panel de detalle; prioridad para selección y relaciones |

Los filtros globales muestran un pequeño punto del mismo tono **sin añadir el componente Libre elección a los filtros que por contrato no lo incluyen**.

## 4. Límites y semántica

- Los tonos tipológicos **no son una escala de severidad ni estados de cumplimiento**.
- Rojo `--heat` conserva su función de choque; ámbar `--warn` conserva la advertencia; los cuadrantes DEM-02 retienen colores independientes.
- Los estados del grafo de prerrequisitos (`.mcard.sel`, `.mcard.up`, `.mcard.down`) siguen destacándose por encima del matiz tipológico; una pequeña barra conserva la identificación de tipo sin competir con el resultado.
- El acento de carrera (`--programa-acento`, `--programa-borde`) sigue siendo independiente.
- Las etiquetas y nombres siguen estando escritos: **no dependemos exclusivamente del color** para identificar una tipología.
- Se conservan densidad informativa, responsive, accesibilidad de teclado, modo oscuro predeterminado y funciones de edición.

## 5. Pruebas y alcance

- `tests/tonos-tipologia.js` verifica cuatro tipologías, dependencia del estado, fallback neutro y mayor contraste neutral de contornos en ambos temas.
- `tests/integracion-arq01.js` comprueba señales en las ocho vistas, incluidos L y los filtros comunes.
- `tests/vistas-arq01.js` confirma que modificar una tipología personal cambia su indicador y que revertirla restituye la presentación previa.
- `npm test` ejecuta además las comprobaciones existentes de contratos, escenarios, filtros, horarios, interacciones y estadísticas.
- **No se modifican** `datos/academico.json`, el motor académico ni su persistencia. Se modifican únicamente HTML renderizado, CSS y documentación/test/versionado.

**Pendiente para revisión visual humana:** contraste real del texto y grosor aparente de marcas en escritorio y móvil, modos oscuro y claro, foco/hover y combinaciones con estados de selección. `jsdom` no verifica propiedades geométricas reales.
