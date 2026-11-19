# EST-01 — Estado operativo y publicación vigente

**Versión pública de referencia:** 1.1.17 · **Rama de ejecución:** `main`.

La [arquitectura vigente](ARQUITECTURA.md) rige el comportamiento; el [alcance actual](DECISIONES-Y-ALCANCE.md), el [contrato por programa](CONTRATOS-POR-PROGRAMA.md) y la [revisión de agrupaciones 2026-2](AGRUPACIONES-OFERTA-2026.md) permiten comprobar reglas y datos. No se utilizan como instrucciones los antecedentes de versiones anteriores.

## 1. Funcionalidad operativa

La aplicación estática y no oficial mantiene ocho vistas: Inicio, Interferencias, Asignaturas, Grupos, Horarios, Mapa de calor, Demanda y Prerrequisitos. `js/programas.js` elige uno de los nueve contratos `datos/programas/<id>/academico.json`, `EntradaAcademica` valida el contexto y construye `S0`; `EscenarioPersonal` aplica diferencias autorizadas sin alterar la referencia institucional. El motor y las consultas filtradas producen las vistas compartidas.

Los contratos de Mecatrónica, Electrónica, Industrial, Mecánica y Química incluyen oferta de grupos; Eléctrica, Sistemas, Civil y Agrícola no tienen oferta de horarios cargada. Las vistas no desaparecen por ausencia de información; los valores desconocidos no se presentan como ceros ni como resultados reales.

## 2. Frontera de datos y escenarios

La única fuente académica en ejecución es el contrato seleccionado. La extracción y revisión de malla, catálogo y oferta ocurre fuera del sistema. `data/programas/` es material externo y no una segunda entrada. Las agrupaciones se definen expresamente, y la etiqueta «solo consulta» indica que una actividad está informada sin acreditar una combinación completa para el análisis.

Se admite únicamente el formato personal vigente de diferencias `escenario-personal/version:1`, recuperado y validado por programa. Los filtros no reescriben el contrato ni las modificaciones personales. Los grupos sin horario conservan su identidad documental sin crear horas ficticias.

## 3. Comprobaciones y publicación

- `npm ci && npm test`: contrato, archivos, vistas, cálculos, referencias y regresiones.
- `npm run mantenimiento:auditar`: inventario Git y hallazgos; no autoriza afirmar ausencia total de defectos.
- `npm run version:verificar`: coherencia entre `package.json`, `index.html`, los recursos `?v=` y la versión mostrada.
- `npm run version:publicada`: comparación de contenido servido por GitHub Pages con el commit esperado.

La ejecución de pruebas, la incorporación a `main`, la publicación por Pages y la disponibilidad efectiva de recursos son verificaciones distintas. Se incrementa la versión cuando cambian recursos productivos; una limpieza exclusivamente documental no altera el número público.

## 4. Mantenimiento

Las normas de intervención están en [AGENTS.md](../AGENTS.md) y los controles detallados en [MNT-01](MANTENIMIENTO-CONTINUO.md). La documentación de consulta, los comentarios del código y las pruebas deben concordar. No se reabren procesos de migración ni se restauran métodos o formatos retirados por aparecer en registros históricos.
