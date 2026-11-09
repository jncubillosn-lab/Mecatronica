# EST-01 — Estado operativo y publicación

**Corte de evaluación:** 0.8.1, durante la transición de 0.8 hacia 0.9.  
**Estado:** retirada de compatibilidad sin usuarios; la versión general 1.0.0
no ha sido declarada. Confirmar CI, fusión y Pages por separado.  
**Norma rectora:** [ARQ-01](ARQUITECTURA.md).  
**Decisiones vigentes:** [DEC-01](DECISIONES-Y-ALCANCE.md).  
**Historia anterior:** [CHANGELOG](../CHANGELOG.md) y
[MIG-ARQ01](MIGRACION-ARQ01.md), solo para consultar el pasado.

## 1. Funcionamiento que existe

El sitio es estático, no oficial y ofrece **ocho páginas**: Inicio,
Interferencias, Asignaturas, Grupos, Horarios, Mapa de calor, Demanda y
Prerrequisitos.

La entrada académica única es `datos/academico.json`. `EntradaAcademica`
y `fromRaw` proyectan el estado de referencia `S0`; `EscenarioPersonal`
aplica cambios identificados sobre `S0` para construir `S`. El motor
calcula resultados completos y los filtros producen consultas `RV/RV0`.
La presentación y sus filtros no constituyen fuentes académicas.

La versión del esquema académico (`versionEsquema:1`), la del formato
personal (`version:1`) y la de la página (`0.8.1` en esta intervención)
son independientes.

## 2. Retirada comprobada de responsabilidades sin usuarios

Se confirmó expresamente que **no existen usuarios externos ni archivos de
escenarios anteriores que recuperar**. Se retiró el soporte de versiones
completas `{S}`, conciliación de requisitos `reqCredAmbiguos`, marcas
`mig1`–`mig4`, identificadores previos `idAnterior`, procedencia
`introducidoEn` y las verificaciones que solo reproducían el sistema
antiguo. El historial de Git sigue conservando sus contenidos.

El programa **sí mantiene** el formato de diferencias personales vigente
`escenario-personal/version:1`, que permite importar/exportar escenarios
y aplicar personalizaciones a nuevas referencias académicas.

Las fuentes, comparadores y conversores obsoletos fueron eliminados del
árbol actual. La herramienta **externa** de normalización del SIA,
`scripts/normalizar_oferta.py`, sus pruebas y datos de trabajo permanecen
porque aportan valor a la preparación del contrato.

## 3. Necesidades confirmadas que NO se retiran

- **Multicarrera:** el motor ha de operar con datos de diferentes programas
  sin casos especiales por nombre; en una etapa futura deberá gestionarse
  también la selección, identidad y configuración de varios programas.
- **Flexibilidad de entrada:** la disponibilidad de grupos, horarios,
  profesores, créditos y demás datos puede ser parcial; un vacío legítimo
  no genera un bloqueo ni un dato inventado.
- **Defensas técnicas:** referencias inexistentes, horas imposibles,
  duplicados y estructuras inválidas deben rechazarse o explicarse
  adecuadamente. No se descarta protección porque no haya ocurrido el riesgo.
- **Escenarios personales actuales:** ediciones voluntarias, diferencias,
  importación/exportación y restablecimiento siguen disponibles.
- **Separación visual:** filtros, escalas, apariencia y proyecciones de
  Libre elección no mutan los datos ni los resultados base.

En los casos anteriores, una simplificación requiere demostrar que no
degrada un requisito vigente; no basta con que el código sea largo.

## 4. Verificación y publicación

El flujo `.github/workflows/verificacion-arq01.yml` ejecuta
`npm ci`, `npm test` y las pruebas Python del normalizador del SIA.
No ejecuta comparaciones de la aplicación antigua. Las regresiones cubren
contrato, datos incompletos, escenarios vigentes, cálculo, ocho vistas,
diferencias y exportación.

Cuando cambie un recurso productivo, actualizar y sincronizar los
metadatos, el pie y `?v=` de `index.html` y `js/iniciar.js`.
Con CI satisfactorio, revisar cambios y fusionar; **después** confirmar
GitHub Pages. Una prueba con `jsdom` no sustituye la inspección visual
real en dispositivos.

## 5. Criterio para 1.0.0

La reducción de archivos o líneas no constituye por sí sola estabilidad:
documentar impacto medible en código activo, rutas eliminadas, datos y
pruebas. Verificar además resiliencia, seguridad y los requisitos aprobados
de expansión futura. Los pendientes de la evaluación 0.8 → 0.9 se evalúan
como dudas concretas, no como deudas históricas por defecto.
