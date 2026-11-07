# Reporte de entrada (oferta SIA)

Generado por `scripts/normalizar_oferta.py`. Lo que aparece aquí requiere una decisión o una verificación.

- Asignaturas: **64** · componentes: 80 · grupos: **716**
- Grupos por alcance: regular 471, especial 141, validacion 104
- Grupos regulares sin horario informado: 0
- Programas especiales detectados: PEAMA (116 grupos), PAET (24 grupos), OTRO (1 grupos)

## Valores nuevos (no están en `reglas_entrada.json`)

- ninguno

## Vinculación entre componentes de una misma asignatura

| Asignatura | Vinculación | Detalle |
|---|---|---|
| Control (2016493) | por_confirmar | {'magistral': 4, 'laboratorio': 8}; faltan {'magistral': [5, 6, 7, 8]} |
| Electrónica análoga I (2016495) | por_confirmar | {'magistral': 5, 'laboratorio': 12}; faltan {'magistral': [6, 7, 8, 9, 10, 11, 12]} |
| Electrónica digital I (2016498) | por_confirmar | {'magistral': 5, 'laboratorio': 10}; faltan {'magistral': [6, 7, 8, 9, 10]} |
| Fundamentos de electricidad y magnetismo (1000017) | por_numero_de_grupo | grupos 1–16 (16) |
| Fundamentos de mecánica (1000019) | por_numero_de_grupo | grupos 1–29 (29) |
| Matemáticas Básicas (1000001) | por_confirmar | {'teorica': 5, 'magistral': 10}; faltan {'teorica': [1, 3, 4, 5, 6, 8, 9, 10], 'magistral': [11, 19, 20]} |

## Fechas distintas al semestre completo (pueden no coincidir en el tiempo)

- 2026-08-24 a 2026-12-12: 226 grupos
- 2026-08-24 a 2026-12-17: 119 grupos
- 2026-08-27 a 2026-12-17: 85 grupos
- 2026-10-26 a 2026-12-12: 29 grupos
- 2026-08-24 a 2026-09-30: 6 grupos
- 2026-08-27 a 2026-12-16: 4 grupos
- 2026-10-24 a 2026-12-12: 1 grupos
- 2026-08-26 a 2026-12-16: 1 grupos

## Duplicados de grupo (mismo número dentro de un mismo componente)

- ninguno

## Grupos especiales no reconocidos (categoría que existe pero aún no tiene nombre en las reglas)

- 1000002 Lecto-Escritura: (AMAZ-08) VISI - Amazonia grupo 5

## Facultad que dicta: propuesta por evidencia (facultad del profesor en grupos regulares)

Solo es evidencia: muchos grupos no traen la facultad del profesor. Hay que confirmarla.

| Asignatura | Categoría | Evidencia | Propuesta | Registros sin dato |
|---|---|---|---|---|
| Álgebra Lineal | fundamentacion | {'ciencias': 11} | ciencias | 7/18 |
| Cálculo diferencial | fundamentacion | {'ciencias': 17} | ciencias | 10/27 |
| Cálculo en varias variables | fundamentacion | {'ciencias': 8} | ciencias | 6/14 |
| Cálculo Integral | fundamentacion | {'ciencias': 9} | ciencias | 10/19 |
| Circuitos Eléctricos I | disciplinar | {'ingenieria': 1} | ingenieria | 5/6 |
| Control | disciplinar | {'ingenieria': 1} | ingenieria | 11/12 |
| Ecuaciones Diferenciales | fundamentacion | {'ciencias': 6} | ciencias | 4/10 |
| Electrónica análoga I | disciplinar | — | sin dato | 17/17 |
| Electrónica digital I | disciplinar | {'ingenieria': 2} | ingenieria | 13/15 |
| Estructuras de datos | disciplinar | {'ingenieria': 4} | ingenieria | 2/6 |
| Finanzas | fundamentacion | {'ingenieria': 2} | ingenieria | 3/5 |
| Física de Semiconductores | fundamentacion | {'ciencias': 1} | ciencias | 2/3 |
| Fundamentos de electricidad y magnetismo | fundamentacion | {'ciencias': 15} | ciencias | 33/48 |
| Fundamentos de física moderna | fundamentacion | {'ciencias': 1} | ciencias | 0/1 |
| Fundamentos de mecánica | fundamentacion | {'ciencias': 24} | ciencias | 63/87 |
| Fundamentos de mecánica de fluidos | fundamentacion | {'ciencias': 1} | ciencias | 3/4 |
| Fundamentos de oscilaciones, ondas y óptica | fundamentacion | {'ciencias': 4} | ciencias | 0/4 |
| Gerencia y gestión de proyectos | fundamentacion | {'ingenieria': 1} | ingenieria | 0/1 |
| Ingeniería económica | fundamentacion | {'ciencias': 1, 'ingenieria': 9} | mixta | 1/11 |
| Inglés I- Semestral | nivelacion | {'ciencias-humanas': 4} | ciencias-humanas | 5/9 |
| Inglés II - Semestral | nivelacion | {'ciencias-humanas': 14} | ciencias-humanas | 2/16 |
| Inglés III - Semestral | nivelacion | {'ciencias-humanas': 13} | ciencias-humanas | 5/18 |
| Inglés Intensivo I y II | nivelacion | — | sin dato | 3/3 |
| Inglés Intensivo III y IV | nivelacion | {'artes': 4, 'ciencias-humanas': 1} | mixta | 1/6 |
| Inglés IV- Semestral | nivelacion | {'ciencias-humanas': 15} | ciencias-humanas | 7/22 |
| Lecto-Escritura | nivelacion | {'sede-bogota': 1} | sede-bogota | 0/1 |
| Matemáticas Básicas | nivelacion | {'ciencias': 8} | ciencias | 7/15 |
| Métodos numéricos | fundamentacion | — | sin dato | 7/7 |
| Principios de química | fundamentacion | {'ciencias': 4} | ciencias | 0/4 |
| Probabilidad y estadística fundamental | fundamentacion | — | sin dato | 11/11 |
| Programación de computadores | fundamentacion | {'ingenieria': 4} | ingenieria | 10/14 |
| Programación orientada a objetos | disciplinar | {'ingenieria': 10} | ingenieria | 0/10 |
| Redes de computadores | disciplinar | {'ingenieria': 3} | ingenieria | 2/5 |
| Seguridad industrial | fundamentacion | {'ingenieria': 1} | ingenieria | 0/1 |
| Señales y sistemas I | disciplinar | — | sin dato | 6/6 |
| Señales y Sistemas II | disciplinar | {'ingenieria': 2} | ingenieria | 2/4 |
| Taller de ingeniería electrónica | disciplinar | {'ingenieria': 5} | ingenieria | 2/7 |
| Variable compleja | fundamentacion | {'ingenieria': 1, 'ciencias': 2} | mixta | 1/4 |

## Avisos del lector

- ninguno

## Cruce de códigos oferta ↔ malla (PDF)

- En la malla con código de 7 dígitos que NO está en la oferta: 2017770
- En la malla con código de 6 dígitos (posible error de transcripción): 201765
