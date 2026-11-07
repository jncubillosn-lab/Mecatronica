# Reporte de entrada (oferta SIA)

Generado por `scripts/normalizar_oferta.py`. Lo que aparece aquí requiere una decisión o una verificación.

- Asignaturas: **64** · componentes: 80 · grupos: **716**
- Grupos por alcance: regular 471, especial 141, validacion 104 (especial = todo lo que no es oferta regular de Bogotá)
- Grupos regulares sin horario informado: 0
- Programas especiales: PEAMA (116), PAET (24), sin_clasificar (1)
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

- 1000002 Lecto-Escritura: (AMAZ-08) VISI - Amazonia grupo 5

## Duplicados de grupo (mismo número dentro de un mismo componente)

- ninguno

## Avisos del lector

- ninguno

## Diferencias con la malla (PDF) — prevalece el SIA

El SIA es la fuente más reciente; la malla es una imagen estática y puede traer códigos desactualizados o mal transcritos. Ante una diferencia se usa el código del SIA.

- Códigos de 7 dígitos en la malla que no están en la oferta del SIA: 2017770
- Códigos de 6 dígitos en la malla (error de transcripción): 201765
