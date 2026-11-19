# DAT-01 — Contratos independientes y ajustes académicos

**Estado vigente:** 1.1.11. Esta guía documenta la preparación académica por programa sin modificar ARQ-01 ni el lector web.

## 1. Propiedad y ubicación

Cada carrera **con datos verificados** publica un solo contrato normalizado:

- `datos/programas/mecatronica/academico.json`: contrato vigente de Mecatrónica.
- `datos/programas/<id>/academico.json`: convención para cualquier otra carrera que se habilite en el futuro.
- `data/programas/<id>/ajustes.json`: registro externo de correcciones verificadas y particulares de esa carrera; no es una fuente que consulte la web.

No se crean contratos de contenido ficticio. Los nombres `<id>` corresponden exactamente a las claves de `js/identidad.js`. Las rutas de las carreras habilitadas se registran en `js/programas.js`. `js/iniciar.js` valida que el `programa.id` del archivo corresponda al ID elegido. Un error de lectura nunca carga datos de otra carrera como respaldo.

El motor, filtros, horario, escenarios personales y vistas son comunes. El contrato conserva el esquema `versionEsquema: 1`: programa, componentes, caracteres, catálogo, malla, requisitos, oferta, agrupaciones, exclusiones, configuración y procedencia. Las colecciones y campos opcionales pueden permanecer vacíos, sin crear datos académicos.

## 2. Preparación y correcciones excepcionales

Los archivos de `data/programas/` son materiales de preparación externos. La app únicamente consulta el `academico.json` normalizado ya corregido. Las excepciones verificadas (por ejemplo, un cambio de horario o un mínimo de créditos aprobado) pueden guardarse en el registro separado de su carrera. **El registro no contiene instrucciones de programación, solo identificadores y valores.**

Ejemplo ilustrativo de una entrada nueva; no modifica ningún registro real:

```json
{
  "id": "correccion-documentada",
  "motivo": "Fuente verificada y decisión registrada",
  "ruta": ["oferta", {"codigoAsignatura": "CODIGO"}, "actividades", {"id": "ACTIVIDAD"}, "grupos", {"id": "GRUPO"}],
  "campo": "horarios",
  "anterior": [],
  "valor": [{"dia": "L", "inicio": "08:00", "fin": "10:00"}]
}
```

`ruta` atraviesa propiedades o busca **exactamente una entidad** por sus identificadores; nunca usa índices de lista. `campo` designa la propiedad existente que se corrige. `valor` es el valor académico verificado; `anterior` es obligatorio **para aplicar un cambio nuevo**, a menos que el contrato ya tenga el valor corregido. Esto impide sobrescribir una actualización posterior desconocida. Los IDs de ajuste deben ser únicos.

## 3. Aplicación y publicación

Desde la raíz del repositorio:

```bash
node scripts/aplicar-ajustes-academicos.js mecatronica --verificar
node scripts/aplicar-ajustes-academicos.js mecatronica --aplicar
npm test
```

`--verificar` no escribe archivos: confirma que los ajustes documentados ya se reflejan en el contrato. `--aplicar` solo modifica el contrato **de la carrera indicada**, tras validar todo el registro; si hay un ID inexistente, una coincidencia ambigua o un valor anterior inesperado, falla antes de escribir. Si todo coincide, el archivo se mantiene idéntico, sin reformateo ni cambios de bytes.

Después de una corrección se revisan contenido, integridad de referencias y días/horas, se incrementa la versión pública de los recursos publicados y se verifica GitHub Actions y Pages. El registro de ajustes no sustituye las pruebas académicas ni justifica modificar datos sin evidencia.

**Diferencia importante:** `analizable:false` y la ausencia de horarios son atributos **del contrato académico**. El registro externo sirve para decisiones de corrección, no para inventar combinaciones ni reglas específicas del motor. Los escenarios personales importados/exportados son independientes de ambas capas.

## 4. Bases preliminares habilitadas

Desde 1.1.3 los nueve programas tienen contrato registrado; las ocho bases nuevas son documentales, sin grupos ni horarios ofertados. En todos los casos `data/programas/<id>/ajustes.json` permanece independiente. No añadir datos de oferta sin fuentes verificadas ni rellenar relaciones de prerrequisitos desconocidas. Véase [informe de calidad](INFORME-BASES-INICIALES-2026.md).

## 5. Carga de oferta documental 2026

Los contratos de `electronica`, `industrial`, `mecanica` y `quimica` incorporan oferta externa normalizada. Los expedientes `data/programas/<id>/revision-oferta-2026.json` conservan casos pendientes, **no se leen en tiempo de ejecución** y no sustituyen a `ajustes.json`. En particular, ninguna alternativa de condición prerrequisito se convirtió automáticamente en un vínculo del mapa; tampoco se asignaron semestres a asignaturas fuera de la malla. Mecatrónica, Eléctrica, Sistemas, Civil y Agrícola no cambiaron. [Informe](INFORME-COMPLEMENTACION-HORARIOS-2026.md).

## 6. Mecánica: contrato y expediente de evidencia (1.1.7)

La carga limpia de Mecánica se conserva íntegra en su único `academico.json`. Las 30 condiciones originales del SIA con códigos alternativos, las 41 evidencias de flechas de la malla y los umbrales porcentuales se depositan en `data/programas/mecanica/revision-prerrequisitos-2026.json`, **no interpretado en la web**. El mapa usa únicamente pares de posiciones verificadas; los mínimos porcentuales no se modelan con una condición de créditos inventada. [MEC-01](MEC-01-CARGA-CURRICULAR-2026.md) explica las diferencias.

## 7. Química: SIA, malla y separación de ambigüedades (1.1.8)

`datos/programas/quimica/academico.json` contiene el contrato único normalizado de Química con 37 relaciones por ID y catálogos cotejados, sin nuevos lectores. `data/programas/quimica/revision-prerrequisitos-2026.json` conserva las 35 condiciones de matrícula completas, las alternativas de códigos históricos y la justificación de cada una de las nueve flechas que solo aparecen en la malla de 2013. Los casos de tipo Y y las optativas sin una posición de plan verificable no se fuerzan a flechas. [QUI-01](QUI-01-CARGA-CURRICULAR-2026.md).

## 8. Electrónica: fuentes y requisitos con identificadores estables (1.1.9)

`datos/programas/electronica/academico.json` concentra 32 prerrequisitos y tres requisitos mínimos de créditos, derivados de 2026 SIA y malla 2023 plan 2545. En `data/programas/electronica/revision-prerrequisitos-2026.json` se conservan las 27 condiciones completas, los códigos alternativos e incidencias por verificar. Se mantiene separación de malla, catálogo y oferta: la coincidencia de nombres no demuestra que los códigos TPI 2016510/2024045 y Diseño 2016494/2028816 sean equivalentes. Sin lector adicional. [ELE-01](ELE-01-CARGA-CURRICULAR-2026.md).

## 9. Electrónica: tres cupos corregidos de una fuente duplicada (1.1.10)

El archivo `Electronica horarios(2).txt` contiene doce duplicados documentales añadidos, pero ninguna nueva asignatura ni nuevo grupo: tres cupos del SIA cambiaron respecto de `Electronica horarios(1).txt`. Se aplica actualización por código+actividad+grupo sin reconstruir las agrupaciones ni tocar prerrequisitos. El expediente `data/programas/electronica/revision-prerrequisitos-2026.json` registra el cotejo. Ver [ELE-01](ELE-01-CARGA-CURRICULAR-2026.md).

## 10. Contrato de Electrónica: cobertura comprobable (1.1.11)

La integridad de datos debe medirse en **tres niveles**: oferta bruta (146 grupos), proyección a vistas (139 agrupaciones y 212 bloques) y combinaciones analizables (53), no solo comparando cupos o contando grupos. 86 agrupaciones representan actividades individuales de asignaturas multiactividad u optativas temáticas y son visibles, pero no computables como matrícula completa. La fuente no acredita cómo combinar magistral+laboratorio. Siete entradas se conservan exclusivamente en oferta por ausencia de posición curricular verificada, reserva de espacios o pertenencia a PEAMA sin horario. Los resultados se auditan por curso, actividad, grupo, día y hora; no se modifica el contrato de otras carreras ni se añaden fuentes al lector web. Ver [ELE-01](ELE-01-CARGA-CURRICULAR-2026.md).
