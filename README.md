# Interferencias de horario · Mecatrónica

Herramienta web para detectar cruces de horario entre las asignaturas del plan de estudios de Ingeniería Mecatrónica y ver qué combinaciones de grupos son compatibles.

Sitio publicado: https://jncubillosn-lab.github.io/Mecatronica/

## Secciones del sitio

| Sección | Qué muestra |
|---------|-------------|
| Inicio | Resumen de cruces de horario: parejas con más choque y asignaturas más afectadas |
| Interferencias | Lista de parejas de asignaturas que chocan, con filtros |
| Asignaturas | Detalle por asignatura |
| Grupos | Grupos de cada asignatura (G1 a G8); aquí se pueden agregar asignaturas sin horario cargado |
| Horarios | Horario de cada asignatura |
| Mapa de calor | Mapa de calor de horarios |
| Prerrequisitos | Malla de prerrequisitos; al seleccionar una asignatura se ven sus relaciones |

## Cómo se calcula el choque

1. Se toma una pareja de asignaturas que un estudiante podría cursar a la vez.
2. Se prueba cada grupo de la primera con cada grupo de la segunda: son las combinaciones.
3. Una combinación choca si sus horarios se traslapan aunque sea una hora. Los bloques pegados (9–11 y 11–13) no chocan.
4. El porcentaje es la parte de las combinaciones que choca. 100 % significa incompatibles (ninguna combinación funciona); entre 0 y 100 % significa que depende del grupo elegido.

Opciones de comparación:
- Distancia entre semestres a comparar (se pueden elegir varias).
- No comparar si una asignatura es prerrequisito de la otra, directo o por cadena.

## Supuestos de los datos

- **Asignaturas incluidas:** las que tienen horario cargado. Las demás aparecen en la malla, pero no se comparan hasta agregarlas en Grupos.
- **Horas:** horas enteras entre las 6 y las 21, de lunes a sábado.
- **Prerrequisitos:** tomados de la malla vigente (Acuerdo 6 de 2022 del Consejo de Facultad de Ingeniería). Los créditos mínimos de Taller de Proyectos Interdisciplinarios (52), Proyecto Aplicado (65) y Trabajo de Grado (69) se muestran como nota y no entran al análisis.
- **Control:** cada grupo (G1 a G8) combina una magistral con un laboratorio. El emparejamiento de la magistral 3 (grupos G5 y G6) no está confirmado.
- **Tus cambios:** se guardan solos en el navegador. «Guardar» descarga el escenario, «Cargar» lo recupera y «Restablecer» vuelve a los datos del Excel.

## Uso local

1. Clona el repositorio: `git clone https://github.com/jncubillosn-lab/Mecatronica.git`
2. Abre `index.html` en el navegador.

## Contenido del repositorio

| Archivo | Descripción |
|---------|-------------|
| `index.html` | Aplicación completa (HTML, CSS y JavaScript en un solo archivo) |
| `README.md` | Este documento |

<!-- Prueba de escritura de ChatGPT: comentario inocuo añadido en rama de verificación el 2026-11-07. No altera la aplicación. -->
