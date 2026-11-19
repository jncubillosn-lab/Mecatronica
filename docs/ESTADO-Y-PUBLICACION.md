# EST-01 — Estado operativo y publicación

**Corte de evaluación:** 1.1.11, ocho vistas compartidas con y sin datos sobre el núcleo estable de Mecatrónica.
**Estado:** limpieza de rutas obsoletas y cierre del alcance actual; comprobar CI, fusión y Pages **por separado en cada publicación**. Las nueve carreras tienen contratos independientes; cuatro siguen sin oferta de grupos y cinco tienen oferta documental (con distintas fechas de referencia).  
**Norma rectora:** [ARQ-01](ARQUITECTURA.md).  
**Decisiones vigentes:** [DEC-01](DECISIONES-Y-ALCANCE.md).  
**Historia anterior:** [CHANGELOG](../CHANGELOG.md) y
[MIG-ARQ01](MIGRACION-ARQ01.md), solo para consultar el pasado.

## 1. Funcionamiento que existe

El sitio es estático, no oficial y ofrece **ocho páginas**: Inicio,
Interferencias, Asignaturas, Grupos, Horarios, Mapa de calor, Demanda y
Prerrequisitos.

La entrada normalizada única por sesión se selecciona mediante `js/programas.js`. Cada carrera dispone de `datos/programas/<id>/academico.json`; Mecatrónica, Electrónica, Industrial, Mecánica y Química tienen oferta de grupos, con distinto periodo de referencia. `EntradaAcademica`
y `fromRaw` proyectan el estado de referencia `S0`; `EscenarioPersonal`
aplica cambios identificados sobre `S0` para construir `S`. El motor
calcula resultados completos y los filtros producen consultas `RV/RV0`.
La presentación y sus filtros no constituyen fuentes académicas.

La versión del esquema académico (`versionEsquema:1`), la del formato
personal (`version:1`) y la de la página (`1.1.3` en esta intervención)
son independientes.

## 2. Retirada comprobada de responsabilidades sin usuarios

Se confirmó expresamente que **no existen usuarios externos ni archivos de
escenarios anteriores que recuperar**. Se retiró el soporte de versiones
completas `{S}`, conciliación de requisitos `reqCredAmbiguos`, marcas
`mig1`–`mig4`, identificadores previos `idAnterior`, procedencia
`introducidoEn` y las verificaciones que solo reproducían el sistema
antiguo. El historial de Git sigue conservando sus contenidos.

El programa **sí mantiene** el formato de diferencias personales vigente
`escenario-personal/version:1`, que permite importar/exportar escenarios
y aplicar personalizaciones a nuevas referencias académicas.

Las fuentes, comparadores y conversores obsoletos fueron eliminados del
árbol actual. La herramienta **externa** de normalización del SIA,
`scripts/normalizar_oferta.py`, sus pruebas y datos de trabajo permanecen
porque aportan valor a la preparación del contrato.

## 3. Necesidades confirmadas que NO se retiran

- **Multicarrera:** el motor es independiente de los nombres de carrera; desde 1.1.0 ya existe selección e identidad para nueve programas. Los otros ocho todavía necesitan un contrato académico real para ejecutar análisis.
- **Flexibilidad de entrada:** la disponibilidad de grupos, horarios,
  profesores, créditos y demás datos puede ser parcial; un vacío legítimo
  no genera un bloqueo ni un dato inventado.
- **Defensas técnicas:** referencias inexistentes, horas imposibles,
  duplicados y estructuras inválidas deben rechazarse o explicarse
  adecuadamente. No se descarta protección porque no haya ocurrido el riesgo.
- **Escenarios personales actuales:** ediciones voluntarias, diferencias,
  importación/exportación y restablecimiento siguen disponibles.
- **Separación visual:** filtros, escalas, apariencia y proyecciones de
  Libre elección no mutan los datos ni los resultados base.

En los casos anteriores, una simplificación requiere demostrar que no
degrada un requisito vigente; no basta con que el código sea largo.

## 4. Verificación y publicación

El flujo `.github/workflows/verificacion-arq01.yml` ejecuta
`npm ci`, `npm test` y las pruebas Python del normalizador del SIA.
No ejecuta comparaciones de la aplicación antigua. Las regresiones cubren
contrato, datos incompletos, escenarios vigentes, cálculo, ocho vistas,
diferencias y exportación.

Cuando cambie un recurso productivo, actualizar y sincronizar los
metadatos, el pie y `?v=` de `index.html` y `js/iniciar.js`.
La versión pública se declara en `package.json` y se contrasta con el
lockfile, el metadato HTML, el pie y cada ruta versionada mediante
`npm run version:verificar`. El comando `npm run version:publicada` contrasta
la respuesta real de GitHub Pages (raíz, index y recursos) contra los bytes
del repositorio; una diferencia produce salida no certificada.

La PR debe superar CI antes de fusionarse. **Después de integrar en `main`**,
el flujo `certificar-publicacion.yml` verifica la publicación real y escribe
un resumen consultable por commit. Puede reintentarse manualmente. Un build
exitoso de Pages no sustituye la certificación HTTP, y ésta no demuestra que
una pestaña antigua del navegador haya recargado. La revisión visual real
en dispositivos sigue siendo un control distinto.

## 5. Acta de cierre 1.0.0 y límites

El alcance técnico estable se refiere a las ocho páginas de Mecatrónica,
no a la futura plataforma multicarrera. La entrada única, los escenarios
por diferencias y el tratamiento de vacíos quedan intactos. No se alteraron
horarios, grupos, créditos, requisitos ni el normalizador externo del SIA.

Se retiraron acciones de interfaz sin control invocador (`i-dist`,
`h-addc`, `h-rename`), su estado sin uso, la función `levelDesc` y
un oyente de desplazamiento vacío y `cntD` sin referencias. Se agregó `tests/rutas-ui.js` para
detectar rutas sin consumidor; el filtro de distancia accesible `dist`
se preservó. Esta limpieza no equivale a retirar funcionalidades visibles.

**Criterios de certificación por revisión:** (1) CI de contrato, ocho
vistas, escenarios y normalizador satisfactoria, en PR y en `main`;
(2) versión única, metadato, pie y recursos consistentes; (3) build de
Pages satisfactorio; (4) certificación HTTP de los recursos servidos contra
el commit correcto. Las evidencias están en la pestaña Actions.

**Limitaciones conocidas:** `jsdom` no certifica el resultado visual en
todos los navegadores, tamaños y dispositivos. El verificador de Pages
comprueba los archivos servidos, no pestañas que ya estaban abiertas.
La información académica depende de la veracidad de las fuentes externas.
No existen otras carreras habilitadas en esta versión. Se mantienen
las defensas y sus límites descritos en ARQ-01.

## 6. Control recurrente del mantenimiento

El procedimiento ejecutable de [MNT-01](MANTENIMIENTO-CONTINUO.md) genera evidencia de inventario, conexión de pruebas y recursos, residuos y configuración remota en Actions. Su informe se limita a las comprobaciones declaradas; no reemplaza las pruebas funcionales, la verificación académica o la revisión visual.

## 7. Selector multicarrera (1.1.0)

`IdentidadUniversitaria.catalogo` define nueve nombres y acentos; `js/programas.js` solamente registra las rutas de contratos disponibles. Las ocho carreras restantes muestran sus páginas sin estadísticas ni horarios inventados. `js/iniciar.js` carga un único contrato por sesión, comprueba el ID elegido y reutiliza el motor existente. La clave local de Mecatrónica se conserva; otras carreras tendrán claves aisladas. `tests/multicarrera.js` verifica estos límites.

## 8. Corrección de estructuras de las ocho vistas (1.1.1)

Las carreras sin contratos mantienen la misma cabecera y ocho páginas del núcleo: filtros de tipología y unidad, navegación, tarjetas de análisis, cuadrículas vacías, marcos de gráficos, mapas, instrucciones y controles de zoom. Los valores desconocidos aparecen como «—»; no se fabrican grupos, asignaturas, resultados ni simulaciones. El estado visual vacío (`sinDatos:true`) se distingue del contrato y deshabilita edición, guardar e importar. La cuadrícula semanal es una plantilla visual, no información institucional. La aplicación de Mecatrónica conserva todos sus datos y pruebas. La verificación de esta revisión se consulta en CI y en la certificación HTTP posterior a Pages, por separado.

## 9. Contratos independientes por programa (1.1.2)

Mecatrónica usa `datos/programas/mecatronica/academico.json` y las otras ocho carreras siguen sin contrato hasta disponer de información académica verificable. El lector de datos y el motor son comunes. La ruta antigua `datos/academico.json` deja de ser fuente productiva; el contenido se ha trasladado sin reformar los registros. El registro de correcciones `data/programas/mecatronica/ajustes.json` y su aplicador externo no son entradas web. El registro y las pruebas hacen comprobable la identidad de cada contrato, el aislamiento y los requisitos de integridad.

El cambio de ruta requiere verificar CI y la certificación HTTP de GitHub Pages por separado; hasta que esos controles concluyan, la actualización del código no demuestra que el sitio público ya esté actualizado.

## 10. Ocho contratos preliminares incorporados (1.1.3)

Todos los programas cuentan ya con una entrada normalizada separada. Los contratos nuevos tienen mallas y catálogos iniciales sin oferta real de horarios, sin agrupaciones, con prerrequisitos incompletos. El motor no inventa sesiones, choques ni combinaciones. Los ajustes externos están separados por carrera y empiezan vacíos. El detalle de discrepancias y fuentes es `docs/INFORME-BASES-INICIALES-2026.md`. Las secciones anteriores describen hitos históricos o el comportamiento genérico cuando falta un contrato, no el estado actual de los nueve programas.

## 11. Aislamiento de supuestos de presentación (1.1.4)

El texto «Acuerdo 6 de 2022» y la descripción de grupos G1–G8 eran supuestos fijos de Mecatrónica colocados en la vista compartida de Inicio; no procedían del contrato de Química. Se retiraron para que el texto use el plan seleccionado y la cobertura real de relaciones/grupos. Ocho programas conservan sus mallas, pero sin agrupaciones verificadas: se informa explícitamente que **no es posible concluir interferencias**. Ceros computacionales derivados de colecciones vacías no se muestran como cero institucional comprobado en el resumen y la lista de interferencias. `tests/multicarrera.js` comprueba ese aislamiento. La atribución histórica del proyecto en el pie de página no constituye información académica de una carrera.

## 12. Consulta parcial y recuperación aislada (1.1.5)

Se incorporan la consulta «Sin clasificar», programaId en los escenarios y la recuperación común con validación antes de sustituir el estado. Los semestres no utilizables no invalidan el máximo semestre del resto de la malla. Se conserva el semestre 0 fuera de la representación de carrera, la entrada única y la exclusión analítica de otras sedes. Los contratos académicos no cambian. La prueba frontera-escenarios verifica las causas reproducidas y la conservación de archivos vigentes identificables. La publicación debe certificarse por HTTP sobre el commit integrado, por separado de estas verificaciones locales.

## 13. Oferta documentada de cuatro programas (1.1.6)

Se incorporan catálogos y ofertas parciales de Electrónica, Industrial, Mecánica y Química (agosto–diciembre de 2026), respetando una entrada normalizada por carrera sin modificar reglas del motor. Se conservan por separado sus `revision-oferta-2026.json` externos con condiciones de requisitos pendientes, grupos incompletos y ambigüedades curriculares. Las carreras Eléctrica, Sistemas, Civil y Agrícola aún no tienen oferta de grupos; Mecatrónica conserva la anterior. Los párrafos de hitos 1.1.2–1.1.5 describen estados pasados, no el inventario actual. Véase [informe de complementación](INFORME-COMPLEMENTACION-HORARIOS-2026.md).

## 14. Mecánica: reconstrucción verificable sin cambiar motor (1.1.7)

Se publican 41 relaciones de malla por ID para Mecánica, 30 condiciones SIA preservadas en registro de revisión, catalogación institucional normalizada y diez grupos de oferta recuperados sin tocar los 101 existentes. Dos asignaturas y cuatro casillas optativas corrigen componentes para B58/C86/L36. El grupo de reserva G40 de TPI se mantiene consultable pero no analizable; los cuatro grupos sin horario permanecen sin datos. Las 12 flechas únicamente documentadas en la malla de 2018 se señalan como evidencia histórica pendiente de contraste de vigencia. Los tres umbrales de avance se retienen en revisión externa sin convertirse a mínimos absolutos. No hubo cambios al lector, motor, UI ni otros contratos. [MEC-01](MEC-01-CARGA-CURRICULAR-2026.md).

## 15. Ingeniería Química: incorporación limpia (1.1.8)

Se complementa solo la base independiente de Química. Conserva 63 posiciones, 72 cursos de catálogo y 48 agrupaciones; se reconcilian códigos de malla con SIA y cinco casillas optativas sin inventar asignaturas, B69/C75/L36. Se incorporan 37 aristas de requisitos (28 SIA M, nueve solo malla), se conservan 35 condiciones originales en registro de evidencia y se cargan dos grupos PEAMA de Orinoquía sin hacerlos analizables en Bogotá. Se mantienen todos los 89 grupos preexistentes y sus horarios/cupos/fechas. Los códigos 2015737 y 2024045 de TPI no se equiparan automáticamente. Los párrafos de versiones previas conservan valor histórico. Véase [QUI-01](QUI-01-CARGA-CURRICULAR-2026.md).

## 16. Electrónica: carga limpia y verificación (1.1.9)

Las fuentes permiten conciliar 172 créditos del plan 2545 y 20 de nivelación, incorporar Control 2016493 y retirar casilla genérica duplicada sin tocar los restantes IDs. Se cargan 32 aristas académicas (23 SIA + nueve únicamente históricas), tres mínimos de créditos y se conservan 27 condiciones originales fuera del motor. De la oferta: 144 grupos preexistentes intactos y dos PEAMA–Sumapaz de consulta sin horarios. Las 31 agrupaciones históricas mantienen IDs; Control no recibe agrupaciones de teoría/laboratorio inventadas. Solo cambia el contrato de Electrónica y su evidencia, con versión 1.1.9. Ver [ELE-01](ELE-01-CARGA-CURRICULAR-2026.md).

## 17. Electrónica: actualización correctiva de cupos (1.1.10)

La segunda exportación de horarios reitera la primera y añade doce copias de asignaturas, incluida una repetición incompleta de TPI. El cotejo revela solo tres cupos corregidos: `2016502` magistral G1 3, taller G1 2; `2016509` G4 2. Se preservan todos los demás datos y las 146 entradas de grupos, incluidos los 22 de TPI, así como 31 agrupaciones, 32 prerrequisitos y tres mínimos de créditos. Se actualizan solamente el contrato de Electrónica, su evidencia, pruebas y versión 1.1.10. Véase [ELE-01](ELE-01-CARGA-CURRICULAR-2026.md).

## 18. Electrónica: reparación de presentación de grupos (1.1.11)

Se audita de nuevo la tríada de fuentes `Electronica(3).txt`, `Electronica horarios(3).txt` y `Malla_Ing_Electrnica_2023(3).pdf`. El problema reportado era que `oferta` tenía los 146 grupos, pero solo 31 grupos habían sido insertados en `agrupaciones` para que la interfaz pudiera consultar sus horas. La nueva base independiente contiene 139 agrupaciones con 212 bloques, 53 analizables y 86 informativas. El resto de oferta (tres grupos de Circuitos RF, dos reservas TPI y dos grupos Sumapaz sin horario) permanece documentado sin forzar asociaciones curriculares. Se mantienen 56 posiciones, 32 prerrequisitos, tres mínimos de créditos, 172 créditos plan y 20 nivelación. Los párrafos anteriores del historial 1.1.9 y 1.1.10 describen el corte histórico, no la cobertura vigente. La única adaptación visual es llamar «solo consulta» a los grupos `analizable:false`, sin cambio de cálculo. Ver [ELE-01](ELE-01-CARGA-CURRICULAR-2026.md).
