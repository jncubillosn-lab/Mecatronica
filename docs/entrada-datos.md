# Condiciones base de la entrada de datos

## Contexto
La herramienta se limita a la Facultad de Ingeniería de la Universidad Nacional. No hay API: los datos se **copian y pegan** de las páginas del SIA (oferta de asignaturas) o se transcriben de archivos gráficos (la malla en PDF). Estas fuentes no son limpias, así que la entrada define sus propias condiciones. La estructura del SIA casi nunca cambia entre semestres, y eso permite que estas condiciones sean estables.

**Principio:** nada se descarta en silencio. Lo que no se reconoce se conserva tal cual y aparece en `reporte_entrada.md`.

## Qué trae el texto pegado del SIA (4 capas)
1. **Asignatura:** nombre y código `(1000003-B)`, tipología, créditos, programa y facultad del plan.
2. **Componentes** (`CLASE MAGISTRAL`, `TEORICA`, `LABORATORIO`, `TALLER`, `PRACTICA`) y sus **grupos** `(1) Grupo 1` con profesor, facultad del profesor, cupos, duración y jornada.
3. **Horario por grupo:** rango de fechas y bloques `DÍA de HH:MM a HH:MM` seguidos del texto del aula, todo en una sola línea.
4. **Prerrequisitos y correquisitos:** condiciones con tipo (M, O, E, A), «¿Todas?» y número de asignaturas requeridas, con alternativas equivalentes.

## Reglas de normalización (vocabulario en `data/catalogos/reglas_entrada.json`)
| Dato | Regla |
|------|-------|
| Código | Siete dígitos; el sufijo (`-B`) se guarda aparte. La llave de cruce entre fuentes es el **código**, no el nombre. |
| Tipología | Se traduce a `categoria` + `optativa`: FUND./DISCIPLINAR × OBLIGATORIA/OPTATIVA, NIVELACIÓN y TRABAJO DE GRADO. Una tipología nueva se conserva y se reporta. |
| Días | L, M, X, J, V, S (como la página). Domingo no existe en la página y se avisaría. |
| Horas | Se esperan horas en punto. Una hora distinta se avisa. |
| Facultad | Tres clases: `facultad`, `sede` y `paet`; vacío se registra como vacío. Es la facultad **del profesor del grupo**, y a menudo viene vacía. |
| Facultad que dicta | Solo se **propone** por evidencia (ver reporte); requiere confirmación humana. |

## Alcance de cada grupo
- **regular:** id numérico. Es lo que entra al análisis de cruces.
- **especial:** otras sedes o programas especiales (PEAMA, PAET, sedes como Tumaco, Amazonia, Orinoquia, Caribe, Sumapaz). **Se conservan y se marcan** (`programa_especial`, `sede_origen`), pero `incluir_en_analisis` es falso por ahora. Una categoría especial sin nombre queda como `OTRO` y se reporta.
- **validacion:** grupos de ajuste del SIA (duración «Validación» o id tipo `2017275-1M`). No son oferta real.

## Vinculación entre componentes de una misma asignatura
Cuando una asignatura tiene taller, magistral y laboratorio con los **mismos números de grupo** (por ejemplo Fundamentos de Electricidad y Magnetismo), el grupo N se cursa completo: taller N + magistral N + laboratorio N. Se marca `por_numero_de_grupo`.
Si los números no coinciden (Control: 4 magistrales y 8 laboratorios), se marca `por_confirmar`: **no se asume** el emparejamiento.

## Qué bloquea y qué solo avisa
- **Bloquea (error):** encabezado de asignatura ilegible, componente que no se reconoce, grupo sin id.
- **Avisa (reporte):** tipología, tipo de componente o programa especial nuevos; hora que no es en punto; grupos regulares sin horario; fechas distintas al semestre completo; números de grupo repetidos; códigos que no coinciden con la malla.

## Privacidad
El repositorio es público: **no se guardan nombres de docentes** (solo la facultad). Si algún día se necesitan, se pide explícitamente con `--profesores` y se decide dónde guardarlos.

## Cada semestre
1. Copiar la oferta del SIA a un `.txt` (no se versiona).
2. `python3 scripts/normalizar_oferta.py Oferta.txt data/programas/<programa> [malla.txt]`
3. Leer `reporte_entrada.md` y resolver lo que aparezca.
4. `python3 -m unittest pruebas/test_normalizador.py` (con `OFERTA_REAL=<ruta>` verifica que no se perdió nada).
