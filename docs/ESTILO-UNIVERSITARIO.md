# UNI-UI-01 — Identidad visual universitaria y temas por programa

**Estado:** temas de v0.6.0 y selector multicarrera implementado en v1.1.0 (9 de noviembre de 2026).  
**Alcance:** presentación y navegación del sitio estático; no modifica la entrada académica, el modelo, los cálculos ni los escenarios.  
**Normas superiores:** [ARQ-01](ARQUITECTURA.md) y [DEC-01](DECISIONES-Y-ALCANCE.md).

## 1. Filosofía: minimalismo informativo

La interfaz guía la lectura; la información es la protagonista. No se reduce la disponibilidad de datos para producir una apariencia vacía: se utilizan jerarquías, agrupaciones, títulos, espaciados y estados progresivos para hacer comprensibles relaciones académicas complejas.

1. **Estructura antes que decoración.** Usar espaciado, alineación y tipografía antes de añadir color, sombras o tarjetas.
2. **Colores semánticos estables.** Interferencias, estados, comparaciones y magnitudes no cambian de significado al seleccionar otra carrera.
3. **Identidad universitaria compartida.** Cabecera, controles, tarjetas, tablas, navegación, pie y temas claro/oscuro son los mismos para todos los programas.
4. **Acento de carrera escaso.** Identifica qué programa se consulta mediante una pequeña señal en la cabecera y la navegación activa; no tiñe estadísticas.
5. **Datos en primer plano.** Conservar la lectura de matrices, horarios, mapas, demandas y casos incompletos; no confundir desconocido con cero.
6. **Transparencia institucional.** El portal sigue siendo una iniciativa estudiantil no oficial; no se presenta como un servicio institucional ni utiliza recursos de marca sin autorización.
7. **Accesibilidad.** Evitar depender solo del color, procurar contraste en modos claro/oscuro y admitir foco visible, movimiento reducido y pantalla estrecha.

## 2. Capas visuales

| Capa | Variable/implementación | Regla |
|---|---|---|
| Identidad común | `css/estilos.css`: `--bg`, `--surface`, `--ink`, `--line`, tipografía y componentes | Neutra, compartida |
| Carrera | `js/identidad.js`: `--programa-acento`, `--programa-borde`, `data-programa` | El color solo identifica el contexto académico |
| Resultados | `--heat`, `--ok`, `--warn`, `--ca`, `--cb`, escalas de Demanda | Nunca sustituir por el color de carrera |
| Interacción | `--accent`, estados `:focus-visible`, `aria-current`, `aria-pressed` | Mantener accesibilidad y semántica |
| Adaptación | `data-theme`, `prefers-color-scheme`, `prefers-reduced-motion`, media queries | Conservar temas y dispositivos |

La barra de contacto, anteriormente naranja fuerte y permanente, pasó a una superficie secundaria de bajo contraste visual, con un vínculo todavía legible.

## 3. Paleta estudiantil 2026–2028

Los colores se extrajeron del afiche aportado de representantes de pregrado de la Facultad de Ingeniería; **no son colores oficialmente asignados por la UNAL a las carreras**.

| Programa | ID visual | Acento |
|---|---|---|
| Ingeniería Eléctrica | `electrica` | `#7C3AED` |
| Ingeniería Electrónica | `electronica` | `#00A36C` |
| Ingeniería Civil | `civil` | `#D6452B` |
| Ingeniería Agrícola | `agricola` | `#8CC63F` |
| Ingeniería de Sistemas y Computación | `sistemas` | `#FFD23F` |
| Ingeniería Industrial | `industrial` | `#F2A900` |
| Ingeniería Mecánica | `mecanica` | `#7B8CA0` |
| Ingeniería Mecatrónica | `mecatronica` | `#FF5F1F` |
| Ingeniería Química | `quimica` | `#FFFFFF` con borde `#8793A2` |

Los colores se utilizan en marcas pequeñas y con contorno cuando hace falta, particularmente en Química. No se emplean directamente como colores de texto sobre blanco; algunos no tienen contraste suficiente para ello.

## 4. Contrato de identidad, sin nueva entrada académica

`js/identidad.js` mantiene un **catálogo estático de presentación** con `temaParaPrograma(programa)` y `aplicarTema(programa, raiz?)`. `js/iniciar.js` lo llama **después** de construir la proyección del único contrato académico, usando `programa.id` explícito.

- `datos/academico.json` conserva su esquema y sigue siendo la **única entrada académica**.
- El catálogo de colores no define mallas, grupos, sedes, planes, docentes ni disponibilidad de programas.
- Un ID desconocido recibe el acento neutro `#5D7081`; no se adivina su carrera por nombre, profesor o asignaturas.
- El alias de presentación `sistemas-y-computacion` se resuelve a `sistemas`.
- **Selector funcional entre nueve carreras:** solo Mecatrónica tiene hoy un contrato académico; las demás muestran una ausencia explícita de datos, sin estadísticas inventadas.
- Un contrato futuro con otro `programa.id` podrá activar su color al cargarlo, sin crear una nueva entrada académica ni cambiar las fórmulas; su incorporación deberá validar referencias, oferta, escenarios y procedencia por separado.
- La identidad visual no modifica escenarios. La selección usa `?programa=ID`, conserva la clave anterior de Mecatrónica y aísla los escenarios futuros por carrera.

## 5. Incorporación posterior de otra carrera

1. Preparar **externamente** la nueva fuente estandarizada conforme a ARQ-01, sin activar lectores de documentos originales dentro de la aplicación.
2. Validar el programa/plan, los IDs, el calendario, las agrupaciones y los datos ausentes con pruebas de contrato y escenarios.
3. Asociar únicamente el `programa.id` a una entrada de `js/identidad.js` si hace falta; si no existe una identidad, usar el fallback neutro.
4. Registrar la ruta de otra carrera en `js/programas.js` únicamente cuando exista un contrato utilizable; el selector y los estados sin datos ya existen.
5. Revisar visualmente navegación, matrices, horarios, Demanda y Prerrequisitos en escritorio/móvil y temas claro/oscuro.

## 6. Ajustes cromáticos de lectura (TONO-01)

La política de colores distingue **identidad de carrera**, **resultado analítico** y **tipología de asignatura**. [TONO-01](TONO-01.md) documenta los tonos muy suaves por componente (B, C, L, N), el leve aumento del contraste de contornos y la conservación de los estados y escalas informativas. No se amplía el contrato académico por una preferencia visual.

## 7. Adaptación de pantallas

La política de geometría y adaptación de las ocho vistas se concreta en [RESP-01](RESP-01.md): contenedores fluidos, desplazamiento local de tablas y cuadrículas, SVG proporcionado de Demanda y mapa de prerrequisitos con zoom y expansión sin alterar datos.

## 8. Pruebas y control de versión

La suite `tests/identidad-visual.js` verifica nueve temas, color de Mecatrónica, borde de Química, fallback y separación de variables. Se ejecuta desde `npm test`, además de las pruebas académicas existentes. `tests/versionado.js` exige sincronizar HTML, CSS y JS con el número público.

**Inspección visual:** CI y jsdom no sustituyen la revisión en un navegador real (especialmente tamaños, contraste y desbordamientos). No declarar despliegue en GitHub Pages hasta verificar la versión servida.
