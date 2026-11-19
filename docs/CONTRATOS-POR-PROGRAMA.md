# DAT-01 — Contratos independientes y ajustes académicos

Para la oferta 2026-2 vigente en 1.1.15, véase la [revisión de agrupaciones de las tres carreras](AGRUPACIONES-OFERTA-2026.md). Allí se identifican las relaciones verificadas y los grupos consultables por separado.

**Estado vigente:** 1.1.15. Esta guía documenta la preparación académica por programa sin modificar ARQ-01 ni el lector web.

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

## 4. Cobertura y clasificación actuales

Cada una de las nueve carreras tiene un contrato normalizado propio. Mecatrónica, Electrónica, Industrial, Mecánica y Química disponen de oferta de grupos; las otras cuatro conservan la estructura del plan sin horarios cargados. El vacío no es un valor cero ni una prueba de que no existen clases.

Los registros externos `data/programas/<id>/revision-oferta-2026.json` y `revision-prerrequisitos-2026.json` conservan incertidumbres de las fuentes, pero **no son archivos consumidos por la aplicación**. Las condiciones sin equivalencia curricular acreditada no generan aristas ni parejas por suposición. Los cupos disponibles no se interpretan como capacidad total.

La [cobertura actual](AGRUPACIONES-OFERTA-2026.md) distingue grupos ofertados, agrupaciones proyectadas, grupos solo informativos y alternativas analizables. Los IDs, horarios y relaciones de `datos/programas/<id>/academico.json` prevalecen frente a recuentos de trabajos anteriores.

## 5. Grupo único de TPI

En la oferta 2026-2 de Mecánica, Química y Electrónica, TPI (`2024045`) dispone de un único grupo G1, lunes y miércoles de 14:00 a 16:00. Química conserva la posición curricular con código 2015737 sin declarar equivalencia normativa automática con 2024045. La prueba de contratos comprueba identidad y franjas. No regenerar grupos duplicados desde capturas antiguas.
