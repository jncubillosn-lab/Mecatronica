# LIB-01 — Libre elección en Prerrequisitos y distribución visual de carga

**Corte:** 8 de noviembre de 2026 · **Versión:** 0.7.1 · **Alcance:** vista Prerrequisitos exclusivamente.  
**Arquitectura:** [ARQ-01](ARQUITECTURA.md); [UNI-UI-01](ESTILO-UNIVERSITARIO.md).  
**Entrada académica intacta:** `datos/academico.json` continúa siendo la única fuente normalizada.

## 1. Alcance

La vista Prerrequisitos vuelve a representar las posiciones del **componente Libre elección** por medio del botón local «Libre elección · N cr». El filtro global sigue mostrando los componentes definidos por `configuracion.opciones.componentesComparables` del contrato (en Mecatrónica, B, C y N); la nueva opción no modifica ni altera las otras siete vistas.

- El botón local se activa inicialmente cuando la vista tiene posiciones registradas. Puede ocultarlas sin eliminarlas.
- «Carga equilibrada» es la ubicación sugerida inicial; «Semestres registrados» permite consultar el orden original de la referencia/escenario.
- «Solo con horario» sigue siendo literal: cuando está activo, omite las posiciones de Libre elección que no tienen oferta asociada.
- El filtro global de unidad académica sigue aplicando a las posiciones mostradas; ningún filtro altera registros.
- Los totales de cada semestre en el mapa se calculan sobre las tarjetas *visibles en esa distribución*, no sobre los semestres originales mezclados con una proyección.

## 2. Créditos y regla genérica

No existe ninguna constante `36` en el algoritmo. Se identifica el componente por su **nombre tipológico normalizado** en `S.tipos.componentes`, y los créditos disponibles se obtienen sumando los `cr` conocidos de las posiciones curriculares de ese componente.

En el Acuerdo 6 de 2022 de Mecatrónica el programa tiene 179 créditos: 56 B, 87 C y 36 L, más 12 créditos adicionales de inglés. La entrada normalizada actual registra **doce posiciones L de 3 créditos**. Estas posiciones ya existían y **no se duplican**.

Si una futura posición L se registra agregada con, por ejemplo, **8 créditos**, la **representación** se fragmenta en 3 + 3 + 2. Estos fragmentos son tarjetas visuales sin identidad académica adicional y sin edición de semestre individual. Nunca se crean asignaturas, códigos, requisitos o grupos ficticios dentro del contrato. Si faltan créditos se indica que el total es **parcial**; no se reemplazan valores nulos por cero.

El tamaño de *tramo visual* es 3 créditos por decisión de presentación; **no** se afirma que todas las asignaturas reales del componente tengan exactamente 3 créditos.

## 3. Equilibrio y semestres

`proyeccionLibresMalla(estado,referencia,fijadas,equilibrar)` calcula un arreglo de tarjetas *copiadas*, sin mutar S ni S0:

1. Obtiene los semestres reales del escenario y su carga académica de todos los componentes **enPlan=true** excepto Libre elección; los que tienen **enPlan=false** (Nivelación en la referencia actual) no suman.
2. Respeta posiciones con ubicaciones personales ya modificadas respecto de S0, o desplazadas manualmente durante la sesión.
3. Distribuye cada tramo L restante por el semestre con menor suma acumulada de créditos; desempata por semestre más temprano. Repite hasta completar el total informado. **Si la distribución registrada ya es igual de equilibrada o mejor (varianza de la carga), se conserva el orden registrado:** no se reubican créditos arbitrariamente.
4. Mantiene la referencia sin modificar, las reglas de créditos y prerrequisitos en el escenario real y las posiciones de componentes distintos de L intactas.

**Distinción indispensable:** la distribución visual **no afirma elegibilidad de inscripción ni cumplimiento de prerrequisitos**. Algunas asignaturas reales de Libre elección o profundización pueden exigir un porcentaje de avance, según las normas del programa. Para convertir una ubicación visual en modificación del escenario personal se debe mover expresamente la tarjeta real de Libre elección: el editor respeta esa elección, como cualquier modificación académica personal.

## 4. Revisión normativa inicial del avance (solo investigación)

Fuentes institucionales consultadas:

- [Facultad de Ingeniería · Mecatrónica](https://ingenieria.bogota.unal.edu.co/es/programas-academicos/ingenieria-mecatronica/): 179 créditos exigidos, de los cuales 36 son Libre elección; Acuerdo 6 de 2022.
- [Malla oficial de Mecatrónica 2022](https://ingenieria.bogota.unal.edu.co/images/recursos/pregrado/ingenieriaMecatronica/Malla_Curricular_Mecatronica_Acuerdo_6_2022.pdf): señala `52 C`, `65 C`, `69 C` y `70 % Prog.`. La imagen por sí sola **no desarrolla el algoritmo de conversión de esos tres umbrales en componentes**.
- [Vicerrectoría Académica — Asignaturas, actividades académicas y créditos (2011)](https://direccionacademica.medellin.unal.edu.co/images/creacion_modificacion_asignaturas/VA-2011_Asignaturas_UNAL.pdf): el **avance general del plan** se calcula como créditos aprobados del plan ÷ créditos exigidos del plan × 100; Nivelación aparece en columnas distintas del resumen del plan.
- [Malla oficial de Ingeniería Electrónica (2023)](https://ingenieria.bogota.unal.edu.co/images/Malla_Ing_Electrnica_2023.pdf): distingue expresamente 121 créditos (70 % del programa) y 63 créditos (80 % del componente disciplinar).
- [Plan de Ingeniería Industrial — UNAL Palmira](https://fia.unal.edu.co/pregrados/ingenieria-industrial/): otro ejemplo institucional con Trabajo de Grado sujeto al 80 % de créditos exigidos en el componente disciplinar.

### Actualización posterior de TPI y PAI (REQ-C-01, v0.7.3)

La revisión original de esta sección era válida hasta v0.7.2. El 8 de noviembre de 2026 se adoptó expresamente el siguiente criterio para Mecatrónica: **TPI, 52 créditos aprobados de C (SIA 2024045, 3 cr)**; **PAI, 65 créditos aprobados de C (SIA 2017275, 4 cr)**. Se corrigió el campo de componentes de PAI, que antes sumaba B+C+L, y se actualizaron las notas de ambos. Consulta [REQ-C-01](REQ-C-01.md).

**Trabajo de Grado** permanece con el mínimo de 69 créditos y componentes B+C+L en la referencia; el criterio de `70 % Prog.` no está modelado. La visualización de distribución semestral no acredita créditos aprobados por una persona.

## 5. Pruebas

- `tests/libres-malla.js`: 36 créditos de la entrada vigente, posiciones 3 cr, reducción de variación semestral, exclusión de Nivelación, contrato hipotético con 8 créditos en fragmentos 3+3+2, totales desconocidos, ubicaciones personales fijas y ausencia de mutación.
- `tests/integracion-arq01.js`: botón local, alternar equilibrio/semestres registrados, doce posiciones L y ausencia de cambios personales.
- Se mantienen las verificaciones de versión, ocho vistas, filtros, escenarios, requisitos y gráficos existentes.

**Inspección visual pendiente:** escritorio y móviles, zoom y pantalla completa en modo claro y oscuro. Una CI exitosa no sustituye revisión geométrica en navegador.
