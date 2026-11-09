# Gestor de horarios · Ingeniería Mecatrónica

**Versión pública:** 1.0.0 · **Estado:** estable para el alcance actual de Mecatrónica · **Rama publicada:** `main`

[**Abrir la aplicación**](https://jncubillosn-lab.github.io/Mecatronica/) · [**Consultar el código vigente**](https://github.com/jncubillosn-lab/Mecatronica/tree/main) · [Historial de versiones](CHANGELOG.md)

Aplicación web estudiantil **no oficial** de la Universidad Nacional de Colombia, sede Bogotá. Permite consultar el plan curricular y grupos ofertados, analizar interferencias de horarios y construir escenarios personales. No sustituye los sistemas institucionales, ni confirma matrículas o cupos.

> **Importante sobre GitHub:** la aplicación se publica desde la rama **`main`**. Las versiones antiguas se consultan en el historial de Git, no en ramas de trabajo. Un README abierto desde un enlace de una rama histórica no describe la versión publicada.

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

La aplicación tiene **una sola entrada académica normalizada**: [`datos/academico.json`](datos/academico.json). La extracción y transformación de las fuentes universitarias se hacen **fuera** del sistema web.

```text
FuentesAcadémicas (datos/academico.json)
    → EntradaAcademica → referencia S0
    → EscenarioPersonal + diferencias voluntarias → escenario S
    → motor de análisis → consultas filtradas → ocho vistas
```

La entrada admite datos faltantes: desconocer un horario, profesor o crédito no autoriza inventarlo ni generar alarmas. Los grupos no se combinan si la fuente normalizada no registra esa relación.

Los escenarios personales se guardan como diferencias sobre la referencia vigente; se pueden importar, exportar y restablecer. El formato actual es `escenario-personal/version:1`, sin lectores de archivos de desarrollo anteriores.

**Multicarrera:** el motor preserva su independencia respecto de una carrera particular, pero la selección y gestión de varios programas es una función **aprobada para el futuro**, no incluida en la 1.0.0. Actualmente solo está habilitada Mecatrónica.

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

## Documentación y mantenimiento

El punto de partida es [ARQ-01 — Arquitectura](docs/ARQUITECTURA.md): describe responsabilidades, requisitos y límites. [DEC-01 — Decisiones](docs/DECISIONES-Y-ALCANCE.md) conserva el criterio que justifica cada comportamiento. [EST-01 — Estado y publicación](docs/ESTADO-Y-PUBLICACION.md) distingue capacidades y verificaciones; [AGENTS.md](AGENTS.md) establece el procedimiento de desarrollo.

Las decisiones específicas se encuentran en [REG-01](docs/REG-01.md), [REQ-C-01](docs/REQ-C-01.md), [DEM-01](docs/DEM-01.md), [LIB-01](docs/LIB-01.md), [RESP-01](docs/RESP-01.md), [TEMA-ALTURA-01](docs/TEMA-ALTURA-01.md), [TONO-01](docs/TONO-01.md) y [UNI-UI-01](docs/ESTILO-UNIVERSITARIO.md).

La migración antigua está terminada. Su historia se conserva en [MIG-ARQ01](docs/MIGRACION-ARQ01.md) y [CHANGELOG](CHANGELOG.md), **no como procedimiento pendiente**. La normalización externa del SIA (`scripts/normalizar_oferta.py`) sigue disponible porque forma parte de la preparación de datos, no de la aplicación publicada.
