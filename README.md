# Gestor de horarios · Ingeniería Mecatrónica

Herramienta web estudiantil **no oficial** para analizar interferencias de horarios, explorar asignaturas y grupos, consultar el plan curricular y comparar escenarios personales de la Universidad Nacional de Colombia, sede Bogotá.

**Versión pública vigente:** se consulta en el pie del sitio y en el metadato de [\`index.html\`](index.html), que debe coincidir con los recursos versionados. Este README no mantiene otro número independiente que pudiera quedar desactualizado; la versión 1.0 aún no se ha declarado.  
**Sitio:** https://jncubillosn-lab.github.io/Mecatronica/  
**Documento rector:** [ARQ-01 — arquitectura, requisitos, principios y límites](docs/ARQUITECTURA.md). Antes de cualquier modificación, limpieza o diagnóstico se consulta esta guía.

## Arquitectura en funcionamiento

La aplicación recibe **una sola entrada académica normalizada**, [`datos/academico.json`](datos/academico.json). La recopilación y conversión de malla, catálogo y oferta institucional es **externa al sistema web**.

```text
datos/academico.json
  -> EntradaAcademica (js/entrada.js)
  -> estado académico de referencia S0
  -> EscenarioPersonal (js/escenarios.js) + cambios voluntarios
  -> escenario efectivo S
  -> modelo y análisis (js/modelo.js, js/analisis.js, js/demanda.js)
  -> resultados filtrados y las ocho vistas (js/app.js, js/vistas.js)
```

La proyección interna `fromRaw` forma parte del arranque vigente. No se cargan formatos académicos de desarrollo ni se exigen sus metadatos. **Solo se admite el formato personal actual `escenario-personal/version:1`**; el soporte de archivos anteriores sin usuarios fue retirado en 0.8.1 por decisión expresa. Véanse [ARQ-01](docs/ARQUITECTURA.md) y [REG-01](docs/REG-01.md).

**Dos requisitos se mantienen:** el sistema debe tolerar información académica incompleta sin inventarla y avanzar hacia **múltiples programas académicos**, tanto en el motor como en la gestión futura de programas e identidades. No hay que confundir esa extensibilidad solicitada con compatibilidad innecesaria con versiones antiguas.

La estructura normalizada contiene `programa`, `componentes`, `caracteres`, `catalogo`, `malla`, `requisitos`, `oferta`, `agrupaciones`, `exclusionesAgrupacion`, `configuracion` y `procedencia`, además de `versionEsquema`. Los IDs institucionales de asignatura y de posición curricular son distintos. Las agrupaciones se analizan **solo si han sido declaradas verificables y elegibles**; una agrupación informativa de otra sede o un grupo sin horario no autoriza inventar choques.

**Principio de datos faltantes:** `null` es desconocido; una lista vacía significa ausencia de registros informados; `0` es un valor conocido. Ningún vacío legítimo se convierte por sí mismo en error o alarma.

## Funciones disponibles

| Página | Funcionalidad |
|---|---|
| Inicio | Resumen de cruces según la selección actual |
| Interferencias | Lista, matriz, comparación de grupos, filtros y CSV |
| Asignaturas | Indicadores y detalle por materia |
| Grupos | Consulta y edición de alternativas de grupos |
| Horarios | Bloques de clases, edición y superposiciones |
| Mapa de calor | Concentración de clases programadas por franja, **no** ocupación de aulas ni matrícula |
| Demanda | Análisis descriptivo de solicitudes de preinscripción y vista previa simulada identificada |
| Prerrequisitos | Malla, relaciones, mínimos de créditos y distribución visual de Libre elección |

Los filtros de componente y unidad académica funcionan en las **ocho páginas** y no alteran datos ni escenarios. La tipología institucional y el componente del plan no son equivalentes por definición. Libre elección dispone de controles locales en Prerrequisitos, pero no se añade a los filtros globales del contrato.

La página Demanda admite una **anotación personal opcional** de solicitudes por ID curricular. Si faltan datos, presenta una simulación declarada como tal; no deduce cupos, capacidad institucional ni matrícula real. En Prerrequisitos, el contraste de créditos por ubicación semestral **no certifica que un estudiante haya aprobado los créditos exigidos**.

## Escenarios personales

El escenario `S` parte de una referencia `S0`. Los cambios voluntarios en horarios, grupos, semestres, relaciones y anotaciones se guardan en el navegador o en un archivo de escenario personal. Se puede exportar, importar y restablecer la referencia.

Los requisitos mínimos se guardan como diferencias por identificador y propiedad. La importación valida que el archivo sea del formato **actual** y aplica sus modificaciones sobre la referencia vigente. No se interpreta ningún snapshot completo de desarrollo, pero las diferencias actuales pueden volver a aplicarse al cambiar los datos académicos.

La unidad responsable de una asignatura (departamento de Ingeniería o facultad ajena a Ingeniería) es una **anotación personal opcional** que no se infiere de profesores ni se incorpora automáticamente a la única entrada académica.

## Presentación

El diseño usa **modo oscuro predeterminado**, claro optativo y persistente, identidad cromática discreta por programa y matices tenues por componente curricular. La malla permite zoom, pantalla ampliada y altura adaptada al semestre más largo; las representaciones anchas conservan desplazamiento propio. Los colores de tipos de asignatura no sustituyen estados de choque, selección o demanda.

## Código ejecutado y verificación

| Ruta | Responsabilidad |
|---|---|
| `index.html`, `js/iniciar.js` | Carga de módulos, lectura única del contrato y preparación del contexto |
| `js/entrada.js`, `js/modelo.js` | Lectura normalizada, modelo curricular y calendario |
| `js/escenarios.js` | Personalizaciones, validación y persistencia del formato vigente |
| `js/analisis.js` | Cálculos de choques y dependencias, adaptación posicional interna |
| `js/app.js`, `js/vistas.js` | Sesión, filtros, ocho vistas, controles y exportaciones |
| `js/demanda.js` | Análisis y presentación de demanda |
| `js/tema.js`, `js/identidad.js`, `css/` | Apariencia y estilos, independientes del dato académico |
| `datos/academico.json` | Única entrada académica normalizada |

Para ejecutar las verificaciones:

```sh
npm ci
npm test
npm run version:verificar   # versión interna, referencias y paquete
npm run version:publicada   # certificar sitio servido contra esta revisión
```

`package.json` es el número público de referencia; el test exige igualdad
con `package-lock.json`, metadato, pie, JS, CSS y los parámetros de caché.
La PR verifica integridad y avance de versión. Tras integrar en `main`, el
workflow **Certificar versión publicada** comprueba por HTTP el HTML real
y todos los recursos productivos frente a los bytes de esa revisión; su
resultado es una certificación **separada** del build de Pages. Un navegador
que mantenga abierta una pestaña anterior puede seguir mostrando el pie
antiguo hasta recargar.

GitHub Actions comprueba las pruebas de contrato, horarios, escenarios, requisitos, estadísticas, filtros, apariencia, ocho vistas e integración. La versión pública se declara conjuntamente en `index.html`, sus referencias `?v=` y `js/iniciar.js`. **Una prueba con `jsdom` no reemplaza una inspección visual real.**

Los archivos, scripts y pruebas exclusivos de la antigua aplicación se retiraron en 0.8.1; su historia puede consultarse en Git. **Se conservan** `scripts/normalizar_oferta.py`, sus pruebas y los recursos de `data/` usados para preparar información del SIA fuera del sitio. No forman parte de la única entrada académica cargada por el navegador.

## Documentación y mantenimiento

- [ARQ-01 — documento rector](docs/ARQUITECTURA.md): flujo, requisitos RF/RC, no-requisitos y límites de mantenimiento.
- [DEC-01 — decisiones](docs/DECISIONES-Y-ALCANCE.md): acuerdos vigentes, cambios que sustituyeron criterios anteriores y alcance.
- [EST-01 — estado y publicación](docs/ESTADO-Y-PUBLICACION.md): corte verificado, procedimientos y asuntos que requieren pruebas antes de un cambio.
- [CHANGELOG](CHANGELOG.md): historial de versiones, separado de la descripción de funcionamiento actual.
- [MIG-ARQ01](docs/MIGRACION-ARQ01.md): antecedentes de la migración y sus causas.
- [REG-01](docs/REG-01.md), [REQ-C-01](docs/REQ-C-01.md), [DEM-01](docs/DEM-01.md), [LIB-01](docs/LIB-01.md): decisiones especializadas sobre escenarios, requisitos y visualización curricular.
- [RESP-01](docs/RESP-01.md), [TEMA-ALTURA-01](docs/TEMA-ALTURA-01.md), [TONO-01](docs/TONO-01.md), [UNI-UI-01](docs/ESTILO-UNIVERSITARIO.md): presentación y accesibilidad.
- [AGENTS.md](AGENTS.md): procedimiento operativo de colaboradores y agentes.

**ARQ-01 permanece cerrada.** En la evaluación 0.8 → 0.9 se retiró la compatibilidad anterior sin usuarios; la resiliencia frente a datos incompletos, la preparación multicarrera y los escenarios personales vigentes continúan en alcance. **La versión 1.0.0 todavía no está declarada.**
