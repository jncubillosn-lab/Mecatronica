# Condiciones base de la entrada de datos

> **Documento histórico, no contrato de ejecución.** Describe un procedimiento externo anterior de tratamiento de fuentes institucionales. Desde ARQ-01, la aplicación web **solo consume** [`datos/academico.json`](../datos/academico.json), ya normalizado; la transcripción, comparación y conversión de malla, catálogo y oferta son procesos externos y **no deben reintroducirse como módulos ni rutas de producción**. Véanse [ARQ-01](ARQUITECTURA.md), [DEC-01](DECISIONES-Y-ALCANCE.md) y [EST-01](ESTADO-Y-PUBLICACION.md).

> **Precisión documental:** los apartados siguientes se conservan para rastrear decisiones pasadas y no deben interpretarse como especificaciones vigentes del esquema, del generador ni de la privacidad del sitio. Por ejemplo, la indicación histórica de que «no se guardan nombres de docentes» no describe íntegramente los archivos públicos heredados. Esta diferencia se documenta sin alterar ni eliminar datos, y cualquier política nueva debe decidirse expresamente.


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
| Facultad del profesor | Tres clases: `facultad`, `sede` y `paet`; vacío se registra como vacío. Es la del profesor del grupo y a menudo viene vacía; solo sirve de ayuda. |
| Facultad y departamento que dicta | **Casillas a seleccionar** por una persona en `seleccion_facultad_departamento.csv` (no se deducen). La plantilla se crea una vez y nunca se sobrescribe. |
| Fechas | Se registran pero **no se usan**: se asume que todas las asignaturas inician y terminan juntas (16 semanas). Las fechas del SIA son ruido de gestión. |
| Fuentes | Ante una diferencia entre fuentes **prevalece el SIA** (más reciente); la malla es una imagen estática y puede traer códigos desactualizados. |

## Alcance de cada grupo
- **regular:** id numérico. Es lo que entra al análisis de cruces.
- **especial:** todo lo que no sea oferta regular de Bogotá (PEAMA, PAET, otras sedes como Tumaco, Amazonia, Orinoquia, Caribe, Sumapaz). **Se conservan y se marcan** (`programa_especial`, `sede_origen`), pero `incluir_en_analisis` es falso por ahora. Si no tiene programa nombrado queda como `sin_clasificar` (informativo).
- **validacion:** grupos de ajuste del SIA (duración «Validación» o id tipo `2017275-1M`). No son oferta real.

## Vinculación entre componentes de una misma asignatura
1. **Por número de grupo:** taller, magistral y laboratorio con los mismos números (Fundamentos de Electricidad y Magnetismo): el grupo N se cursa completo.
2. **Por pares consecutivos:** hay una magistral por cada *r* laboratorios (división exacta). Magistral 1 con laboratorios 1 y 2, magistral 2 con 3 y 4, y así (Control, Electrónica Digital I).
3. **Por confirmar:** si ninguna regla aplica (Electrónica Análoga I tiene 5 y 12; Matemáticas Básicas mezcla teóricas y magistrales) **no se asume** nada y se reporta.

## Qué bloquea y qué solo avisa
- **Bloquea (error):** encabezado de asignatura ilegible, componente que no se reconoce, grupo sin id.
- **Avisa (reporte):** tipología, tipo de componente o programa especial nuevos; hora que no es en punto; grupos regulares sin horario; números de grupo repetidos; códigos de la malla que no están en el SIA (informativo: prevalece el SIA).

## Privacidad
El repositorio es público: **no se guardan nombres de docentes** (solo la facultad). Si algún día se necesitan, se pide explícitamente con `--profesores` y se decide dónde guardarlos.

## Cada semestre
1. Copiar la oferta del SIA a un `.txt` (no se versiona).
2. `python3 scripts/normalizar_oferta.py Oferta.txt data/programas/<programa> [malla.txt]`
3. Leer `reporte_entrada.md` y resolver lo que aparezca.
4. `python3 -m unittest pruebas/test_normalizador.py` (con `OFERTA_REAL=<ruta>` verifica que no se perdió nada).
