# Gestor de horarios · Facultad de Ingeniería

**Versión pública:** 1.1.4 · **Estado:** nueve carreras seleccionables, nueve carreras con contratos académicos; ocho sin oferta de grupos · **Rama publicada:** `main`

[**Abrir la aplicación**](https://jncubillosn-lab.github.io/Mecatronica/) · [**Consultar el código vigente**](https://github.com/jncubillosn-lab/Mecatronica/tree/main) · [Historial de versiones](CHANGELOG.md)

Aplicación web estudiantil **no oficial** de la Facultad de Ingeniería de la Universidad Nacional de Colombia, sede Bogotá. Permite consultar el plan curricular y grupos ofertados, analizar interferencias de horarios y construir escenarios personales. No sustituye los sistemas institucionales, ni confirma matrículas o cupos.

> **Importante sobre GitHub:** la aplicación se publica desde la rama **`main`**. Las versiones antiguas se consultan en el historial de Git, no en ramas de trabajo. Un README abierto desde un enlace de una rama histórica no describe la versión publicada.

## Selector multicarrera

En la esquina superior izquierda puede elegirse entre **nueve carreras**, con el nombre y el color ya establecidos en `js/identidad.js`. Ahora los nueve programas tienen un contrato académico propio. Mecatrónica mantiene su oferta de grupos; los otros ocho contienen planes, asignaturas y requisitos parciales, pero **no incluyen grupos ni horarios verificados**. Se conservan las mismas ocho vistas y no se suponen choques de horarios. No se crean horarios o estadísticas ficticias.

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

**Multicarrera:** la selección de nueve carreras funciona desde la 1.1.0. Hay nueve contratos normalizados: Mecatrónica tiene oferta de grupos, mientras que las otras ocho carreras contienen inicialmente malla y catálogo sin oferta de horarios. No se asumen horarios, combinaciones ni cifras de capacidad.

## Contratos independientes y correcciones de datos

Cada carrera con datos reales dispone de su propio contrato `datos/programas/<id>/academico.json`; no se fabrican archivos académicos para carreras sin información. El navegador solicita **solo el contrato de la carrera elegida**, verifica `programa.id` y conserva la estructura de las ocho vistas cuando la carrera no tiene fuente. Para activar una nueva carrera se agrega su ruta a `js/programas.js` tras validar el contrato. Ningún lector ni cálculo cambia según el nombre de la carrera.

Las correcciones excepcionales verificadas se mantienen **fuera de la ejecución web**, en `data/programas/<id>/ajustes.json`. El comando `node scripts/aplicar-ajustes-academicos.js mecatronica --verificar` comprueba que los ajustes estén incorporados en el contrato publicado; con `--aplicar` los incorpora por identificador y solo modifica ese contrato. No lee fuentes institucionales en el navegador ni escribe escenarios personales. Cualquier cambio exige pruebas, versionado y publicación. La guía está en [DAT-01 — contratos independientes y ajustes](docs/CONTRATOS-POR-PROGRAMA.md).

## Incorporación inicial de ocho carreras (1.1.3)

Los contratos de Eléctrica, Electrónica, Civil, Agrícola, Sistemas, Industrial, Mecánica y Química se incorporaron en `datos/programas/<id>/academico.json` sin alterar el de Mecatrónica. Sus registros externos `data/programas/<id>/ajustes.json` están vacíos a la espera de correcciones respaldadas. **No contienen oferta de grupos ni horarios**, y los prerrequisitos son incompletos; no usar el resultado de interferencias como evidencia de disponibilidad ni de ausencia real de choques. Ver [informe de calidad de bases iniciales](docs/INFORME-BASES-INICIALES-2026.md).

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
