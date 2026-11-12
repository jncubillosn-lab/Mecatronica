# Historial de versiones

La **versión pública de la aplicación** se consulta en el pie de página y en `index.html` (metadato `version`). Las rutas de JS, CSS y el contrato por carrera (`datos/programas/<id>/academico.json`) incluyen el mismo parámetro `?v=` para evitar mezclas de versiones en caché. `tests/versionado.js` comprueba esta coherencia y la CI exige incrementar la versión cuando se modifican recursos productivos. El número de versión del sitio **no es** `versionEsquema` (contrato académico) ni `escenario-personal.version` (formato de cambios personales).

## 1.1.4 — Aislamiento de supuestos académicos en las vistas (12 nov 2026)

- Se retiran de la vista compartida los textos fijos de Mecatrónica sobre su Acuerdo 6 de 2022 y agrupaciones G1–G8; ahora los supuestos describen las relaciones y grupos del contrato seleccionado.
- Las carreras sin oferta de grupos informada muestran indicadores de interferencias desconocidos («—») y un aviso en las ocho vistas, evitando confundir ausencia de muestra con ausencia de choques.
- Se amplían las pruebas multicarrera para comprobar la vista de Química y el aislamiento de su malla. Sin cambios en contratos académicos, lector, motor ni escenarios personales.

## 1.1.3 — Bases documentales iniciales de ocho carreras (12 nov 2026)

- Ocho nuevos contratos académicos independientes de Mecatrónica, con catálogos, mallas y requisitos parciales de documentos aportados.
- Cada contrato se registra por ID en el selector existente; cada sesión lee únicamente una carrera. El motor y el lector normalizado no cambian.
- No se inventan ofertas ni agrupaciones: las ocho nuevas carreras carecen todavía de horarios de grupos verificables.
- Se añaden ocho archivos de ajustes independientes y el informe de calidad, se actualizan las pruebas multicarrera y el versionado.

## 1.1.2 — Contratos independientes por carrera (12 nov 2026)

- La base normalizada de Mecatrónica se traslada **sin modificar sus registros** a `datos/programas/mecatronica/academico.json`. `js/programas.js` resuelve exclusivamente esa ruta y `js/iniciar.js` verifica la identidad antes de cargar las ocho vistas.
- Se registra el esquema de ajustes excepcionales por programa en `data/programas/mecatronica/ajustes.json`; un aplicador **externo al navegador** incorpora o verifica las correcciones por identificadores y rechaza cambios ambiguos.
- Las carreras sin contrato siguen mostrando la misma interfaz estructural vacía. No se crean ocho fuentes ficticias, ni motores o lecturas académicas adicionales.
- Se actualizan rutas de pruebas, auditoría de contratos, documentación y versión pública; las claves de escenarios personales y los algoritmos académicos no cambian.

## 1.1.1 — Estructura de ocho vistas aun sin datos (9 nov 2026)

- Los programas sin contrato ya no sustituyen el portal por una tarjeta: cargan la misma cabecera, filtros, instrucciones y ocho vistas, incluidos marco de prerrequisitos y zoom, cuadrículas de horarios y calor, y gráfica de demanda vacía.
- `js/programas.js` proporciona solo un contexto **visual** con contenedores vacíos y una cuadrícula genérica ilustrativa, sin generar FuentesAcadémicas, información institucional ni resultados del motor.
- Las métricas desconocidas aparecen como «—», no como ceros comprobados; Demanda no genera muestras ficticias. Guardar, importar y editar permanecen deshabilitados sin fuente académica.
- Horarios reutiliza una función compartida para dibujar su cuadrícula tanto con datos como sin ellos. Mecatrónica conserva su contrato, escenario y cálculos.
- `tests/multicarrera.js` verifica la estructura de las ocho vistas de las ocho carreras sin datos; las regresiones del programa operativo permanecen independientes.

## 1.1.0 — Selector de carreras (9 nov 2026)

- Selector superior izquierdo de nueve carreras con los colores existentes en `js/identidad.js`, acceso directo por `?programa=ID` y navegación por ocho secciones.
- Mecatrónica conserva `datos/academico.json`, escenarios previos y el mismo núcleo. Las ocho restantes muestran ausencia de datos sin inventar asignaturas, horarios, créditos ni análisis.
- Registro mínimo de rutas reales en `js/programas.js`, carga única en `js/iniciar.js` y rechazo de contratos con ID distinto del elegido.
- Pruebas del selector, aislamiento, versión, certificación de publicación y auditoría continua adaptadas a la nueva carga.
- No se crean archivos académicos ni carpetas vacías; la normalización del SIA permanece externa al sitio.

## 1.0.0 — Cierre de estabilidad de Mecatrónica (9 nov 2026)

- Retiradas exclusivamente rutas de eventos sin control (`i-dist`, `h-addc`, `h-rename`), su filtro oculto, `levelDesc`, `cntD` y un oyente sin efecto. El control visible de distancias `dist` continúa.
- `tests/rutas-ui.js` exige correspondencia entre acciones y controles; `tests/enlaces-documentales.js` evita referencias locales rotas; la batería vigente sigue cubriendo ocho vistas, datos incompletos y escenarios por diferencias.
- CI de contrato y regresiones habilitada también en push a `main`, además de las PR; certificación HTTP del sitio mantenida como control independiente.
- ARQ-01, DEC-01, EST-01, AGENTS y README actualizados: alcance estable de Mecatrónica, inventario de riesgos y protección real de GitHub, futuro multicarrera aprobado pero todavía no disponible.
- Sin modificaciones académicas ni ampliación del contrato, sin reintroducir formatos antiguos ni inventar información. El éxito del despliegue se registra por ejecución en Actions, separado de la versión del código.

## 0.8.2 — Certificar la versión efectivamente publicada

- `package.json` queda como referencia única de versión pública; `tests/versionado.js` comprueba metadato, pie, lockfile, recursos y rutas dinámicas.
- Un verificador HTTP compara la página principal y sus JS, CSS y JSON contra los bytes locales, incluyendo SHA-256, y rechaza HTML o módulos desfasados.
- Un workflow independiente de GitHub Actions comprueba la publicación tras cada incorporación a `main`, reintentando por la latencia del despliegue. El resultado y su evidencia se muestran por ejecución. No se confunde build de Pages con contenido publicado ni con pestañas viejas en caché.
- Se añaden regresiones negativas para página vieja, JS desactualizado y recursos faltantes, sin cambiar los datos académicos ni el motor.

## 0.8.1 — Eliminar compatibilidad sin necesidad demostrada

- **[PR #35](https://github.com/jncubillosn-lab/Mecatronica/pull/35)**: decisión expresa tras confirmar que no existen usuarios ni archivos de versiones anteriores que recuperar.
- Se retiraron los lectores de escenarios `{S}`, conciliación de requisitos antiguos y sus controles visuales; el formato personal **vigente** de diferencias se conserva.
- Se quitaron de `datos/academico.json` 432 campos `introducidoEn` y 811 campos `idAnterior`, sin modificar ninguna otra propiedad académica.
- Se eliminaron fuentes `RAW`, comparadores, referencia congelada, conversores anteriores y pruebas exclusivas de esos formatos. El historial sigue disponible en Git.
- **Se conservan** la entrada flexible, controles defensivos, modelo independiente de la carrera, preparación futura multicarrera, normalizador externo del SIA, escenarios personales actuales y las ocho vistas.
- Se actualizaron ARQ-01, DEC-01, EST-01, REG-01, guía de colaboradores y pruebas actuales. La publicación se comprueba independientemente de CI.

## 0.8.0 — Cierre definitivo de migración ARQ-01

- **[PR #34](https://github.com/jncubillosn-lab/Mecatronica/pull/34), 8 nov 2026:** la migración a la única entrada académica se declara **finalizada**, con acta de cierre en [MIG-ARQ01](docs/MIGRACION-ARQ01.md). `S0` no depende de transformaciones históricas; `fixMalla` y `migrarAnterior` son soporte de archivos personales antiguos, no tareas de migración pendientes.
- Se retiró el disparador de la rama histórica `arquitectura/migracion-arq01-entrada-unica`; las PR hacia `main` comprueban tanto `npm test` como `npm run test:historico`.
- Las herramientas de comparación inicial `compare.js` y `mutar.sh` se mantienen archivadas, pero `npm run comparar` y `npm run mutar` dejan de anunciarse como comandos activos del proyecto.
- ARQ-01, EST-01, DEC-01, README, AGENTS y MIG-ARQ01 distinguen explícitamente **proceso completado**, **soporte histórico** y **trabajo general restante hacia 1.0.0**. No se modificó `datos/academico.json`, requisitos, grupos o cálculos.

## Antecedentes técnicos de preparación (versiones 0.7.x)

- **0.7.8 — [PR #33](https://github.com/jncubillosn-lab/Mecatronica/pull/33)**: prueba roja reprodujo la pérdida de la marca de revisión pendiente al exportar un escenario antiguo. La exportación recibe ahora el mismo contexto de revisión que el guardado local; sin nueva arquitectura ni casos específicos. La publicación se verificó después de fusionar la PR.

- **0.7.7 — [PR #32](https://github.com/jncubillosn-lab/Mecatronica/pull/32)**: los cuatro módulos de datos/lectura `RAW` antiguos se trasladaron íntegros a `pruebas/historico/js/`; se actualizaron las pruebas históricas, se eliminó un `__pycache__` generado y se añadieron barreras para evitar su vuelta a producción. El cambio se integró en `main`.

- **0.7.6 — [PR #31](https://github.com/jncubillosn-lab/Mecatronica/pull/31)**: se retiró la llamada `fixMalla(S0)` del arranque después de comparar el escenario normalizado antes/después. La única diferencia comprobada eran las marcas históricas `mig1`–`mig4`. Se preservan `fixMalla(anterior)` y la ruta `{S}` para escenarios heredados. El cambio se integró en `main`; su función histórica queda delimitada por pruebas.
- **Sin nueva versión pública:** [PR #29](https://github.com/jncubillosn-lab/Mecatronica/pull/29), actualización documental; [PR #30](https://github.com/jncubillosn-lab/Mecatronica/pull/30), separación de pruebas vigentes y `RAW` heredado.

## Cambios posteriores al corte 0.5.5 (integrados y documentados)

Las fechas y números se verificaron contra las PR fusionadas. **Estas notas describen hitos pasados**, no una nueva versión pública.

- **0.7.5** — [PR #26](https://github.com/jncubillosn-lab/Mecatronica/pull/26), 8 nov 2026: tonos discretos B/C/L/N por asignatura en ocho páginas, bordes ligeramente más contrastados y pruebas visuales de estructura.
- **0.7.4** — [PR #25](https://github.com/jncubillosn-lab/Mecatronica/pull/25), 8 nov 2026: persistencia de requisitos por cambios de ID y propiedad; escenarios antiguos ambiguos con revisión individual, sin excepciones por materia.
- **0.7.3** — [PR #24](https://github.com/jncubillosn-lab/Mecatronica/pull/24), 8 nov 2026: TPI (SIA 2024045) 52 créditos C y PAI (SIA 2017275) 65 créditos C; códigos, créditos de materia y Trabajo de Grado intactos.
- **0.7.2** — [PR #23](https://github.com/jncubillosn-lab/Mecatronica/pull/23), 8 nov 2026: oscuro predeterminado, modo claro opcional y altura intrínseca de la malla.
- **0.7.1** — [PR #22](https://github.com/jncubillosn-lab/Mecatronica/pull/22), 8 nov 2026: representación de posiciones L en Prerrequisitos y reparto visual equilibrado, sin alterar datos.
- **0.7.0** — [PR #21](https://github.com/jncubillosn-lab/Mecatronica/pull/21), 8 nov 2026: diseño adaptable, ampliación/zoom de prerrequisitos y mejoras de lectura de Demanda.
- **0.6.0** — [PR #20](https://github.com/jncubillosn-lab/Mecatronica/pull/20), 8 nov 2026: identidad visual compartida y acentos configurados por programa; sin incorporar programas nuevos.
- **0.5.9** — [PR #19](https://github.com/jncubillosn-lab/Mecatronica/pull/19), 8 nov 2026: identificar asignatura al seleccionar punto de Demanda.
- **0.5.8** — [PR #18](https://github.com/jncubillosn-lab/Mecatronica/pull/18), 8 nov 2026: cuadrantes y lectura reforzada de Demanda.
- **0.5.7** — [PR #17](https://github.com/jncubillosn-lab/Mecatronica/pull/17), 8 nov 2026: demostración simulada de demanda y recomendaciones descriptivas.
- **0.5.6** — [PR #16](https://github.com/jncubillosn-lab/Mecatronica/pull/16), 8 nov 2026: octava página Demanda de preinscripción, sin requerir cupos ni datos históricos.

**Preparación del corte 1.0 (solo documentación):** [PR #28](https://github.com/jncubillosn-lab/Mecatronica/pull/28) integra principios, RF/RC y límites a ARQ-01, sin modificar la aplicación ni declarar 1.0.0.

## Versiones integradas

- **0.5.5** (7 nov 2026, [PR #15](https://github.com/jncubillosn-lab/Mecatronica/pull/15)): referencia académica de TPI simplificada voluntariamente a un único grupo G1, lunes y miércoles de 14:00 a 16:00. Se retiran 21 alternativas de la oferta normalizada y las agrupaciones, sin modificar otras asignaturas ni el motor. Se actualizan pruebas y versión pública.

- **0.5.4** (7 nov 2026, [PR #14](https://github.com/jncubillosn-lab/Mecatronica/pull/14)): filtro de tipología visible y operativo en las siete páginas; filtro adicional por unidad académica responsable. Cada asignatura puede registrar voluntariamente un departamento de Ingeniería o facultad, incluso sin docente, y conservarlo al exportar/importar escenarios. La entrada `datos/academico.json` y el formato de escenario versión 1 no cambian.
- **0.5.3** (7 nov 2026, [PR #13](https://github.com/jncubillosn-lab/Mecatronica/pull/13)): lectura estricta de referencias académicas; extracción del motor a `js/analisis.js` y de las siete vistas a `js/vistas.js`; contexto de ejecución sin `window.RAW`; claves de prerrequisitos por ID con respaldo para escenarios personales antiguos. Sin modificación de la única fuente académica ni de las fórmulas de interferencia.
- **0.5.2** (7 nov 2026, [PR #11](https://github.com/jncubillosn-lab/Mecatronica/pull/11)): documentación técnica junto al código —responsabilidades POO, entrada académica, estado y filtros, migración de escenarios, cálculo y vistas— sin cambiar algoritmos ni datos; actualización coherente del número público y de los parámetros de caché.
- **0.5.1** (7 nov 2026, [PR #9](https://github.com/jncubillosn-lab/Mecatronica/pull/9)): corrección del indicador de versión y caché de recursos, incluida `css/pie.css`; verificación automática para impedir publicar cambios productivos sin incrementar versión.
- **0.5.0** (7 nov 2026, [PR #8](https://github.com/jncubillosn-lab/Mecatronica/pull/8)): migración a ARQ-01: única entrada `datos/academico.json`, lector `EntradaAcademica`, escenarios personales por diferencias, conservación de escenarios históricos y siete secciones. Las agrupaciones de otras sedes se conservan como información, pero no participan en cálculos.
- **0.4.x** (histórico, antes de v0.5.0): aplicación operativa basada en `js/datos.js`/`RAW`; la referencia 0.4.3 tenía 386 grupos y 797 bloques de escenario, con persistencia de escenarios `{S}`. Se conservan las identidades de transición para interpretar escenarios antiguos. Las diferencias globales de interferencias respecto a v0.5.x incluyen cambios deliberados de elegibilidad.
- **0.3.0** (7 nov 2026): barra inferior con versión, contacto y aviso de sitio no oficial. Datos de oferta del SIA normalizados, todavía sin uso en la ejecución de esa versión.
- **0.2.0** (7 nov 2026): separación de la página en `css/`, `js/` y datos generados desde `data/`; se reportaron 87 comparaciones idénticas con el original **en esa etapa histórica**.
- **0.1.0**: página original reunida en un solo `index.html`.

## Cambios documentales sin nueva versión pública

- [PR #10](https://github.com/jncubillosn-lab/Mecatronica/pull/10): consolidó arquitectura, decisiones de alcance, historial de migración, estado, publicación y guía de colaboradores. No cambió el sitio.
- [PR #12](https://github.com/jncubillosn-lab/Mecatronica/pull/12): auditoría de coherencia documental realizada sin modificar archivos de producción ni incrementar la versión 0.5.2.

Para el estado realmente implementado y las verificaciones de publicación, consultar [EST-01](docs/ESTADO-Y-PUBLICACION.md). Las decisiones funcionales y sus motivos están en [DEC-01](docs/DECISIONES-Y-ALCANCE.md); la referencia normativa es [ARQ-01](docs/ARQUITECTURA.md). Los documentos históricos no constituyen entradas académicas adicionales ni autorizan convertir datos dentro de la aplicación.
