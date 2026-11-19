# Gestor de horarios · Facultad de Ingeniería

**Versión pública:** 1.1.13 · **Estado:** nueve carreras con contratos; cinco con oferta de grupos (una previa y cuatro nuevas), cuatro aún sin oferta de horarios · **Rama publicada:** `main`

[**Abrir la aplicación**](https://jncubillosn-lab.github.io/Mecatronica/) · [**Consultar el código vigente**](https://github.com/jncubillosn-lab/Mecatronica/tree/main) · [Historial de versiones](CHANGELOG.md)

Aplicación web estudiantil **no oficial** de la Facultad de Ingeniería de la Universidad Nacional de Colombia, sede Bogotá. Permite consultar el plan curricular y grupos ofertados, analizar interferencias de horarios y construir escenarios personales. No sustituye los sistemas institucionales, ni confirma matrículas o cupos.

> **Importante sobre GitHub:** la aplicación se publica desde la rama **`main`**. Las versiones antiguas se consultan en el historial de Git, no en ramas de trabajo. Un README abierto desde un enlace de una rama histórica no describe la versión publicada.

**Agrupaciones de horarios (1.1.13).** Se verificaron Control en Electrónica y Desarrollo Sostenible en Mecánica. Las actividades de Bogotá sin pareja acreditada y con posición curricular se pueden consultar individualmente. [Cobertura de las tres carreras](docs/AGRUPACIONES-OFERTA-2026.md).

**Corrección de TPI (1.1.12).** En la oferta 2026-2 de Mecánica, Química y Electrónica, TPI (`2024045`) tiene un solo grupo, G1, con clase los lunes y miércoles de 14:00 a 16:00. La captura de cada carrera contenía 22 registros. Se conserva el G1 original y se retiran las demás entradas de TPI de la oferta y de las agrupaciones que las utilizaban.

## Selector multicarrera

En la esquina superior izquierda puede elegirse entre **nueve carreras**, con el nombre y el color ya establecidos en `js/identidad.js`. Ahora los nueve programas tienen un contrato académico propio. Mecatrónica conserva su oferta de referencia. Electrónica, Industrial, Mecánica y Química incorporan ofertas de grupos y horarios documentadas para el periodo agosto–diciembre de 2026; Eléctrica, Sistemas, Civil y Agrícola todavía carecen de oferta cargada. Se conservan las mismas ocho vistas y no se suponen choques de horarios. No se crean horarios o estadísticas ficticias.

La selección se refleja en la URL (`?programa=civil`, `?programa=mecatronica`). `js/programas.js` registra solamente rutas de contratos disponibles, y `js/iniciar.js` carga un contrato normalizado por sesión y valida la identidad antes de iniciar el motor. Un error técnico no se disfraza de ausencia de datos. En un programa sin contrato (caso futuro), `js/app.js` se carga igualmente y reutiliza las mismas vistas con un **contexto de presentación sin datos**, que no es una entrada académica ni genera cálculos. Los botones de edición/importación se muestran deshabilitados. La cuadrícula de horario es únicamente visual, no un calendario confirmado. El escenario personal de Mecatrónica conserva su clave histórica; futuros programas tienen claves propias.

## Qué ofrece

| Página | Función |
|---|---|
| Inicio | Resumen de interferencias del escenario seleccionado |
| Interferencias | Pares de asignaturas, matriz, detalle de grupos y CSV |
| Asignaturas | Consulta y estadísticas por asignatura |
| Grupos | Alternativas de grupos y ediciones voluntarias |
| Horarios | Semana, bloques editables y superposiciones |
| Mapa de calor | Concentración de horarios programados, no ocupación real de aulas |
| Demanda | Estadística descriptiva de preinscripciones cuando hay datos y simulaciones claramente identificadas |
| Prerrequisitos | Malla, relaciones curriculares, mínimos de créditos y controles visuales de Libre elección |

Los filtros de componente y unidad académica actúan en las ocho páginas sin modificar los datos de referencia. La interfaz ofrece tema oscuro y claro y conserva las ediciones personales.

## Cómo están organizados los datos

En cada sesión la aplicación consume **una sola entrada académica normalizada del programa seleccionado**. Para Mecatrónica: [`datos/programas/mecatronica/academico.json`](datos/programas/mecatronica/academico.json). La extracción y transformación de las fuentes universitarias se hacen **fuera** del sistema web.

```text
FuentesAcadémicas (datos/programas/<id>/academico.json)
    → EntradaAcademica → referencia S0
    → EscenarioPersonal + diferencias voluntarias → escenario S
    → motor de análisis → consultas filtradas → ocho vistas
```

La entrada admite datos faltantes: desconocer un horario, profesor o crédito no autoriza inventarlo ni generar alarmas. Los grupos no se combinan si la fuente normalizada no registra esa relación.

Los escenarios personales se guardan como diferencias sobre la referencia vigente; se pueden importar, exportar y restablecer. El formato actual es `escenario-personal/version:1`, sin lectores de archivos de desarrollo anteriores.

**Multicarrera:** la selección de nueve carreras funciona desde la 1.1.0. Hay nueve contratos normalizados: Mecatrónica conserva oferta de referencia y cuatro carreras tienen ofertas parciales de agosto–diciembre de 2026; las cuatro restantes solo disponen de malla y catálogo. No se asumen horarios, combinaciones ni cifras de capacidad.

## Contratos independientes y correcciones de datos

Cada carrera con datos reales dispone de su propio contrato `datos/programas/<id>/academico.json`; no se fabrican archivos académicos para carreras sin información. El navegador solicita **solo el contrato de la carrera elegida**, verifica `programa.id` y conserva la estructura de las ocho vistas cuando la carrera no tiene fuente. Para activar una nueva carrera se agrega su ruta a `js/programas.js` tras validar el contrato. Ningún lector ni cálculo cambia según el nombre de la carrera.

Las correcciones excepcionales verificadas se mantienen **fuera de la ejecución web**, en `data/programas/<id>/ajustes.json`. El comando `node scripts/aplicar-ajustes-academicos.js mecatronica --verificar` comprueba que los ajustes estén incorporados en el contrato publicado; con `--aplicar` los incorpora por identificador y solo modifica ese contrato. No lee fuentes institucionales en el navegador ni escribe escenarios personales. Cualquier cambio exige pruebas, versionado y publicación. La guía está en [DAT-01 — contratos independientes y ajustes](docs/CONTRATOS-POR-PROGRAMA.md).

## Incorporación inicial de ocho carreras (1.1.3)

Los contratos de Eléctrica, Electrónica, Civil, Agrícola, Sistemas, Industrial, Mecánica y Química se incorporaron en `datos/programas/<id>/academico.json` sin alterar el de Mecatrónica. Sus registros externos `data/programas/<id>/ajustes.json` están vacíos a la espera de correcciones respaldadas. **No contienen oferta de grupos ni horarios**, y los prerrequisitos son incompletos; no usar el resultado de interferencias como evidencia de disponibilidad ni de ausencia real de choques. Ver [informe de calidad de bases iniciales](docs/INFORME-BASES-INICIALES-2026.md).

## Complementación de grupos y horarios (1.1.6)

Se publicaron contratos normalizados completos por carrera, preparados **fuera del programa** a partir de los TXT de oferta y catálogo, y cotejados con las mallas existentes. La carga incluye: Electrónica (23 asignaturas ofertadas, 144 grupos, 31 agrupaciones analizables), Industrial (34, 63, 20), Mecánica (24, 101, 72) y Química (29, 89, 48). Estos grupos corresponden a una consulta documental del segundo semestre de 2026, no garantizan cupos ni horarios futuros.

**No se inventaron combinaciones de teoría, laboratorio o taller**: actividades múltiples sin correspondencias verificadas permanecen en `oferta` y se excluyen de `agrupaciones`. Las asignaturas sin posición curricular identificada también permanecen en la oferta sin semestre supuesto. Los cupos disponibles no equivalen a capacidad total. Los requisitos extraídos pendientes de equivalencias no se incorporaron al motor.

Cada carrera conserva por separado su [registro de revisión](data/programas/quimica/revision-oferta-2026.json) (uno por cada programa con oferta nueva). Véase el [informe documental de complementación](docs/INFORME-COMPLEMENTACION-HORARIOS-2026.md). Mecatrónica y las otras cuatro carreras no se modificaron. Los únicos cambios en el código de arranque son parámetros de versión para evitar caché antigua; el lector, el motor y las vistas no se modificaron.

## Verificación y publicación

```bash
npm ci
npm test
npm run version:verificar
npm run version:publicada
```

- `npm test` comprueba contrato, cálculos, ocho vistas, entrada incompleta, escenarios, filtros, rutas de interfaz y documentación.
- `version:verificar` exige correspondencia entre el número de esta página, `package.json`, `index.html`, el pie y los recursos versionados.
- `version:publicada` compara por HTTP los archivos realmente servidos por GitHub Pages con los del commit local. GitHub Actions ejecuta también esta certificación tras incorporar cambios en `main`.
- La revisión visual real en dispositivos es un control adicional; el resultado de GitHub Pages no garantiza la recarga de una pestaña previamente abierta.

## Mantenimiento automático

El repositorio se verifica en cada PR y cada actualización de `main`, además de una auditoría semanal. `npm run mantenimiento:auditar` produce un informe de archivos, rutas, pruebas y avisos. Los errores estructurales bloquean CI; las sospechas permanecen visibles como hallazgos y no eliminan código. [MNT-01 — Controles y limitaciones](docs/MANTENIMIENTO-CONTINUO.md) documenta exactamente qué se comprueba y qué no.

## Documentación y mantenimiento

El punto de partida es [ARQ-01 — Arquitectura](docs/ARQUITECTURA.md): describe responsabilidades, requisitos y límites. [DEC-01 — Decisiones](docs/DECISIONES-Y-ALCANCE.md) conserva el criterio que justifica cada comportamiento. [EST-01 — Estado y publicación](docs/ESTADO-Y-PUBLICACION.md) distingue capacidades y verificaciones; [AGENTS.md](AGENTS.md) establece el procedimiento de desarrollo.

Las decisiones específicas se encuentran en [REG-01](docs/REG-01.md), [REQ-C-01](docs/REQ-C-01.md), [DEM-01](docs/DEM-01.md), [LIB-01](docs/LIB-01.md), [RESP-01](docs/RESP-01.md), [TEMA-ALTURA-01](docs/TEMA-ALTURA-01.md), [TONO-01](docs/TONO-01.md) y [UNI-UI-01](docs/ESTILO-UNIVERSITARIO.md).

La migración antigua está terminada. Su historia se conserva en [MIG-ARQ01](docs/MIGRACION-ARQ01.md) y [CHANGELOG](CHANGELOG.md), **no como procedimiento pendiente**. La normalización externa del SIA (`scripts/normalizar_oferta.py`) sigue disponible porque forma parte de la preparación de datos, no de la aplicación publicada.

## Corrección de información transversal (1.1.4)

Las ayudas de Inicio describen únicamente el contrato seleccionado; ya no contienen el Acuerdo 6 de 2022 ni combinaciones G1–G8 de Mecatrónica cuando se consulta otro programa. La ausencia de grupos en los ocho contratos preliminares se comunica como **indicador desconocido («—»)**, no como evidencia de cero interferencias. Se mantienen intactos los datos académicos de las nueve carreras y el motor.

## Correcciones de consulta y escenarios (1.1.5)

Las posiciones sin componente confirmado permanecen consultables mediante «Sin clasificar», sin asignarles una tipología. La selección global se comparte con las ocho vistas. La malla de carrera conserva sus semestres desde el 1; los registros de semestre 0 no crean una columna nueva.

Los archivos personales version:1 incluyen ahora programaId. La recuperación comprueba el programa, respeta IDs explícitos y valida el estado antes de sustituir el escenario. Los archivos vigentes previos sin ese metadato solo se identifican por referencias inequívocas, y el almacenamiento local conserva su aislamiento por clave. Un valor de semestre técnicamente inválido no puede vaciar la malla. Los vacíos legítimos siguen admitidos y la oferta marcada analizable:false sigue excluida del análisis.

## Mecánica: revisión curricular limpia (1.1.7)

Con las **mismas tres fuentes originales** se reconstruyó el contrato de `mecanica`, sin modificar motor, vistas, selector ni los demás contratos. Se incorporaron **41 relaciones entre posiciones** de la malla de 2018: 29 coinciden con alternativas de matrícula del SIA 2026-2 y 12 figuran solo como flechas en la malla y conservan esa advertencia de vigencia. Se preservan por separado las **30 condiciones completas del SIA**, incluidos los códigos históricos y la lógica de alternativas, en [revisión académica de Mecánica](data/programas/mecanica/revision-prerrequisitos-2026.json).

Se limpiaron las tipologías por código del catálogo, seis componentes curriculares (dos asignaturas y cuatro casillas optativas) y se completaron los **111 grupos** de las 24 asignaturas ofertadas: los 101 existentes conservaron horarios/cupos/fechas y se recuperaron diez faltantes. Las 72 agrupaciones declaradas preservan sus IDs y orden, con **G40 de TPI como reserva no analizable**. No se inventan emparejamientos entre actividades ni franjas ausentes.

La malla de Mecánica suma **58 B + 86 C + 36 L = 180 créditos**, con 12 de inglés adicionales. Los umbrales de avance **55 %, 75 % y 80 %** se documentan como porcentajes sin introducir falsos mínimos en `requisitos.minimosCreditos`, que permanece vacío. El informe complementario es [MEC-01](docs/MEC-01-CARGA-CURRICULAR-2026.md).

## Química: malla y prerrequisitos normalizados (1.1.8)

Se contrastaron `Química(1).txt` (catálogo), `Química horarios(1).txt` (grupos y condiciones SIA del segundo semestre de 2026) y la malla **Acuerdo 02 de 2013**. Se actualizaron exclusivamente los datos del programa `quimica`, sin modificar lector, motor ni las demás ocho carreras.

En `datos/programas/quimica/academico.json` se conservan **63 posiciones y 48 agrupaciones** con los mismos IDs. Se restauran los códigos verificados de Biología molecular y celular (`1000010-B`), Laboratorio de Química Orgánica (`1000031-B`) y Manejo de sólidos (`2015726`), y se corrigen los sufijos institucionales `-B` de otras cinco asignaturas. Se clasifican cinco posiciones optativas a partir de la malla sin asignarles una materia ficticia: B69 + C75 + L36 = 180 créditos; N20 adicionales.

Se integran **37 relaciones** identificadas por posición: **28** respaldadas por condiciones SIA tipo M con alternativa reconocible y **9** documentadas solamente por la malla de 2013, con advertencia de vigencia. Las **35 condiciones originales**, alternativas de códigos y casos pendientes se conservan en [revisión académica de Química](data/programas/quimica/revision-prerrequisitos-2026.json). No se añaden mínimos absolutos interpretando cifras de avance de la malla.

La oferta conserva sin modificación los horarios, cupos y fechas de **89 grupos ya cargados** e incorpora dos grupos PEAMA de Orinoquía solo para consulta, fuera de las agrupaciones de Bogotá. Los grupos 40 y 41 de TPI son reservas de espacio; no generan choques. Tampoco se presume la equivalencia entre el código TPI del plan de 2013 (`2015737`) y el de la oferta 2026 (`2024045`).

El informe de cotejo está en [QUI-01](docs/QUI-01-CARGA-CURRICULAR-2026.md).

## Electrónica: malla 2545 y requisitos contrastados (1.1.9)

Se cotejaron tres fuentes: el catálogo `Electronica(2).txt`, los grupos y condiciones SIA 2026-2 de `Electronica horarios(1).txt` y la malla **Plan 2545 (2023)**. Se actualizaron solo el contrato independiente de `electronica`, su expediente externo, las pruebas, la documentación y la versión de caché. No se alteraron algoritmos, vistas ni las otras ocho carreras.

La malla mantiene **56 posiciones**, ahora con Control 2016493 en séptimo semestre y sin una casilla genérica duplicada de octavo. Cinco optativas se clasificaron con su agrupación sin inventar asignaturas; la suma coincide con el diagrama: **Fundamentación 60 + Disciplinar 78 + Libre elección 34 = 172 créditos** (Nivelación 20 adicionales). El catálogo conserva 63 registros y la oferta 23 cursos.

Se cargaron **32 relaciones** entre posiciones (23 condiciones tipo M del SIA con correspondencia única y 9 flechas documentadas solo en la malla 2023). La malla establece explícitamente mínimos de **121 créditos académicos** para TPI y Diseño de sistemas electrónicos y **63 créditos disciplinares** para Trabajo de Grado; se aplican únicamente a las tres posiciones pertinentes. Las **27 condiciones SIA originales** (con alternativas históricas y casos no mapeables) permanecen en [expediente de Electrónica](data/programas/electronica/revision-prerrequisitos-2026.json).

Los **144 grupos ya existentes** conservan horarios, cupos y fechas; se agregaron dos PEAMA–Sumapaz sin horario, solo para consulta. Las 31 agrupaciones existentes conservan IDs y bloques; Control tiene magistral + laboratorio, pero sus emparejamientos no se infieren.

No se afirma equivalencia institucional entre TPI **2016510** (malla) / **2024045** (SIA), ni entre Diseño **2016494** (malla) / **2028816** (SIA). Se conservan separados; la posición de Diseño permanece sin código asociado hasta su verificación.

Más información: [ELE-01 — informe técnico](docs/ELE-01-CARGA-CURRICULAR-2026.md).

## Corrección de cupos de Electrónica (1.1.10)

El archivo `Electronica horarios(2).txt` reproduce íntegramente la primera oferta y añade doce copias de asignaturas ya presentes; la segunda copia de TPI está incompleta y no reemplaza la oferta previa. Se cotejó toda la parte añadida, conservando los **146 grupos** y las **31 agrupaciones verificadas** de Electrónica. Las únicas correcciones confirmadas son tres valores de **cupos disponibles**: Introducción a Ingeniería Electrónica `2016502` magistral G1 **2→3**, taller G1 **1→2**, y Taller de Ingeniería Electrónica `2016509` G4 **1→2**.

Los 32 prerrequisitos, tres mínimos, 56 posiciones curriculares, horarios, profesores, fechas y otras carreras quedan intactos. Véase el [informe ELE-01](docs/ELE-01-CARGA-CURRICULAR-2026.md) y la [revisión académica](data/programas/electronica/revision-prerrequisitos-2026.json).

## Electrónica: corrección integral de visibilidad y horarios (1.1.11)

Se reconstruyeron desde cero las colecciones académicas de Ingeniería Electrónica mediante **`Electronica(3).txt`**, **`Electronica horarios(3).txt`** y la malla **`Malla_Ing_Electrnica_2023(3).pdf`**, en lugar de conservar las 31 agrupaciones incompletas de versiones anteriores.

El catálogo contiene 62 cursos documentados en el TXT más TPI `2016510` identificado exclusivamente en el plan 2545; la oferta contiene **23 cursos, 33 actividades y 146 grupos** después de reconciliar doce encabezados duplicados y tres cupos actualizados. La malla conserva **56 posiciones y 172 créditos del plan**; se nombran cinco agrupaciones optativas según el PDF.

La interfaz ahora dispone de **139 grupos registrados y 212 bloques semanales** vinculados a las posiciones del plan: **53 agrupaciones completas analizables** y **86 actividades individuales solo para consulta**, con su horario real. Quedan en `oferta` **7 grupos no proyectados como clases del plan**: tres de `Circuitos de RF` (optativa sin posición institucional individual acreditada), dos PEAMA–Sumapaz sin horario y dos reservas de espacios de TPI. Ninguna oferta se borra ni se convierte en horario ficticio.

Las asignaturas **Electrónica Digital II, Electrónica de Potencia, Control, Instrumentación y medidas, Introducción a Ingeniería Electrónica, Diseño de sistemas electrónicos**, y otras de múltiples actividades muestran ahora los bloques de sus grupos. **No se inventaron parejas magistral–laboratorio**: al faltar la relación oficial de matrícula, sus actividades se señalan como `solo consulta` y se excluyen de estadísticas de combinaciones completas. Los grupos de actividad única verificados siguen computándose. La asociación de Diseño `2028816` y TPI `2024045` con las posiciones históricas homónimas se hace **para mostrar horarios**, sin declarar homologación normativa de códigos.

Se mantienen **32 prerrequisitos** y los tres mínimos de crédito ya documentados. Solo se reemplaza el contrato independiente de Electrónica, su expediente de procedencia y una etiqueta genérica `solo consulta` para que la interfaz no llame erróneamente «otra sede» a un laboratorio sin pareja confirmada. No se añaden herramientas, programas ni lógica de cálculo.

Consultar [ELE-01](docs/ELE-01-CARGA-CURRICULAR-2026.md) para el recuento completo, los casos especiales y la matriz de regresión.
