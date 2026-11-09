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

La proyección interna `fromRaw` forma parte del arranque actual. **La migración ARQ-01 está finalizada desde la versión 0.8.0**: las rutinas que interpretan archivos personales antiguos `{S}` permanecen únicamente como compatibilidad de lectura, sin alterar el contrato ni la construcción de `S0`.

**La compatibilidad antigua es opcional respecto a la entrada de datos:** campos como `introducidoEn` e `idAnterior` pueden ayudar a interpretar un archivo personal de otra versión, pero no son necesarios para cargar un plan académico vigente. Se verifica en `tests/compatibilidad-opcional.js`; el detalle y los límites se encuentran en [ARQ-01](docs/ARQUITECTURA.md) y [REG-01](docs/REG-01.md). La relación precisa entre responsabilidades, estados `S0/S/R0/R/RV0/RV/ui` y pruebas está en [ARQ-01](docs/ARQUITECTURA.md).

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

Los requisitos mínimos se persisten como modificaciones por identificador y propiedad. Los archivos históricos `{S}` y los escenarios antiguos con listas completas de requisitos tienen una vía de recuperación compatible; las diferencias ambiguas se presentan para revisión por requisito. **No borres el almacenamiento del navegador** para solucionar una divergencia sin inspeccionarla.

La unidad responsable de una asignatura (departamento de Ingeniería o facultad ajena a Ingeniería) es una **anotación personal opcional** que no se infiere de profesores ni se incorpora automáticamente a la única entrada académica.

## Presentación

El diseño usa **modo oscuro predeterminado**, claro optativo y persistente, identidad cromática discreta por programa y matices tenues por componente curricular. La malla permite zoom, pantalla ampliada y altura adaptada al semestre más largo; las representaciones anchas conservan desplazamiento propio. Los colores de tipos de asignatura no sustituyen estados de choque, selección o demanda.

## Código ejecutado y verificación

| Ruta | Responsabilidad |
|---|---|
| `index.html`, `js/iniciar.js` | Carga de módulos, lectura única del contrato y preparación del contexto |
| `js/entrada.js`, `js/modelo.js` | Lectura normalizada, modelo curricular y calendario |
| `js/escenarios.js` | Personalizaciones, validación, persistencia y compatibilidad |
| `js/analisis.js` | Cálculos de choques y dependencias, adaptación posicional interna |
| `js/app.js`, `js/vistas.js` | Sesión, filtros, ocho vistas, controles y exportaciones |
| `js/demanda.js` | Análisis y presentación de demanda |
| `js/tema.js`, `js/identidad.js`, `css/` | Apariencia y estilos, independientes del dato académico |
| `datos/academico.json` | Única entrada académica normalizada |

Para ejecutar las verificaciones:

```sh
npm ci
npm test
```

GitHub Actions comprueba las pruebas de contrato, horarios, escenarios, requisitos, estadísticas, filtros, apariencia, ocho vistas e integración. La versión pública se declara conjuntamente en `index.html`, sus referencias `?v=` y `js/iniciar.js`. **Una prueba con `jsdom` no reemplaza una inspección visual real.**

Los archivos académicos de la aplicación anterior están conservados íntegros en [`pruebas/historico/js/`](pruebas/historico/js/) desde 0.7.7; **ya no existen en `js/`**. Las herramientas `data/`, `scripts/` y `pruebas/` corresponden a preparación externa y diagnósticos históricos, no a entradas productivas. Las pruebas del legado se ejecutan por separado con `npm run test:historico`. No deben usarse para reconstruir automáticamente el JSON académico vigente.

## Documentación y mantenimiento

- [ARQ-01 — documento rector](docs/ARQUITECTURA.md): flujo, requisitos RF/RC, no-requisitos y límites de mantenimiento.
- [DEC-01 — decisiones](docs/DECISIONES-Y-ALCANCE.md): acuerdos vigentes, cambios que sustituyeron criterios anteriores y alcance.
- [EST-01 — estado y publicación](docs/ESTADO-Y-PUBLICACION.md): corte verificado, procedimientos y asuntos que requieren pruebas antes de un cambio.
- [CHANGELOG](CHANGELOG.md): historial de versiones, separado de la descripción de funcionamiento actual.
- [MIG-ARQ01](docs/MIGRACION-ARQ01.md): antecedentes de la migración y sus causas.
- [REG-01](docs/REG-01.md), [REQ-C-01](docs/REQ-C-01.md), [DEM-01](docs/DEM-01.md), [LIB-01](docs/LIB-01.md): decisiones especializadas sobre escenarios, requisitos y visualización curricular.
- [RESP-01](docs/RESP-01.md), [TEMA-ALTURA-01](docs/TEMA-ALTURA-01.md), [TONO-01](docs/TONO-01.md), [UNI-UI-01](docs/ESTILO-UNIVERSITARIO.md): presentación y accesibilidad.
- [AGENTS.md](AGENTS.md): procedimiento operativo de colaboradores y agentes.

**ARQ-01 está cerrada como migración en 0.8.0.** No existe una segunda entrada ni una transición académica pendiente. La compatibilidad con archivos personales anteriores queda bajo pruebas, como una función ordinaria del gestor. **La versión 1.0.0 todavía no está declarada** y exige las restantes comprobaciones generales de estabilidad que establece ARQ-01. No se consideran fallas las funcionalidades que nunca fueron solicitadas.
