# Reporte de entrada (oferta SIA)

Generado por `scripts/normalizar_oferta.py`. Lo que aparece aquí requiere una decisión o una verificación.

- Asignaturas: **64** · componentes: 80 · grupos: **716**
- Grupos por alcance: regular 564, especial 149, validacion 3 (especial = todo lo que no es oferta regular de Bogotá)
- Grupos regulares sin horario informado: 12
- Programas especiales: PEAMA (116), sin_clasificar (9), PAET (24)
- Fechas: se registran pero **no se usan** (se asume que todas las asignaturas inician y terminan juntas, 16 semanas).

## Valores nuevos (no están en `reglas_entrada.json`)

- ninguno

## Vinculación entre componentes de una misma asignatura

| Asignatura | Vinculación | Detalle |
|---|---|---|
| Control (2016493) | por_bloques_consecutivos | magistral 1 con laboratorio 1–2, magistral 2 con 3–4… (razón 1:2) |
| Electrónica análoga I (2016495) | por_confirmar | {'magistral': 5, 'laboratorio': 12}; faltan {'magistral': [6, 7, 8, 9, 10, 11, 12]} — **sin regla aplicable, requiere decisión** |
| Electrónica digital I (2016498) | por_bloques_consecutivos | magistral 1 con laboratorio 1–2, magistral 2 con 3–4… (razón 1:2) |
| Fundamentos de electricidad y magnetismo (1000017) | por_numero_de_grupo | grupos 1–16 (16) |
| Fundamentos de mecánica (1000019) | por_numero_de_grupo | grupos 1–29 (29) |
| Matemáticas Básicas (1000001) | por_confirmar | {'teorica': 5, 'magistral': 10}; faltan {'teorica': [1, 3, 4, 5, 6, 8, 9, 10], 'magistral': [11, 19, 20]} — **sin regla aplicable, requiere decisión** |

## Facultad y departamento que dicta (casillas a seleccionar en `seleccion_facultad_departamento.csv`)

- Asignaturas con facultad seleccionada: 0/64 · con departamento: 0/64
- La columna `evidencia_sia` del CSV muestra la facultad del profesor en los grupos regulares, solo como ayuda (a menudo viene vacía).

## Grupos especiales sin programa nombrado (informativo)

- 2015942 Aplicaciones de elementos finitos: (1M) 2015942-1M Aplicaciones de elementos finitos - Magistral
- 2017265 Ingeniería y desarrollo sostenible: (1M) 2017265-1M Ingeniería y Desarrollo Sostenible - Magistral
- 1000002 Lecto-Escritura: (AMAZ-08) VISI - Amazonia grupo 5
- 2017293 Modelación matemática: (1M) 2017293-1M Modelación matemática - Magistral
- 2017274 Procesos de Manufactura II: (1M) 2017274 -1M Procesos de Manufactura II - Magistral
- 2017275 Proyecto aplicado de ingeniería: (1M) 2017275-1M Proyecto aplicado de ingeniería - Magistral
- 2016770 Robótica: (1M) 2016770-1M Robótica - Magistral
- 2017287 Sensores y actuadores: (1M) 2017287-1M Sensores y actuadores - Magistral
- 2017288 Servomecanismos: (1M) 2017288-1 Servomecanismos - Magistral

## Duplicados de grupo (mismo número dentro de un mismo componente)

- ninguno

## Avisos del lector

- ninguno

## Diferencias con la malla (PDF) — prevalece el SIA

El SIA es la fuente más reciente; la malla es una imagen estática y puede traer códigos desactualizados o mal transcritos. Ante una diferencia se usa el código del SIA.

- Códigos de 7 dígitos en la malla que no están en la oferta del SIA: 2017770
- Códigos de 6 dígitos en la malla (error de transcripción): 201765
