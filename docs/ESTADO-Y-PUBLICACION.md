# EST-01 — Estado operativo y publicación

**Corte de evaluación:** 1.0.0, primera versión funcional estable de Mecatrónica.  
**Estado:** limpieza de rutas obsoletas y cierre del alcance actual; comprobar CI, fusión y Pages **por separado en cada publicación**. La gestión de varios programas sigue planificada.  
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
personal (`version:1`) y la de la página (`1.0.0` en esta intervención)
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
La versión pública se declara en `package.json` y se contrasta con el
lockfile, el metadato HTML, el pie y cada ruta versionada mediante
`npm run version:verificar`. El comando `npm run version:publicada` contrasta
la respuesta real de GitHub Pages (raíz, index y recursos) contra los bytes
del repositorio; una diferencia produce salida no certificada.

La PR debe superar CI antes de fusionarse. **Después de integrar en `main`**,
el flujo `certificar-publicacion.yml` verifica la publicación real y escribe
un resumen consultable por commit. Puede reintentarse manualmente. Un build
exitoso de Pages no sustituye la certificación HTTP, y ésta no demuestra que
una pestaña antigua del navegador haya recargado. La revisión visual real
en dispositivos sigue siendo un control distinto.

## 5. Acta de cierre 1.0.0 y límites

El alcance técnico estable se refiere a las ocho páginas de Mecatrónica,
no a la futura plataforma multicarrera. La entrada única, los escenarios
por diferencias y el tratamiento de vacíos quedan intactos. No se alteraron
horarios, grupos, créditos, requisitos ni el normalizador externo del SIA.

Se retiraron acciones de interfaz sin control invocador (`i-dist`,
`h-addc`, `h-rename`), su estado sin uso, la función `levelDesc` y
un oyente de desplazamiento vacío y `cntD` sin referencias. Se agregó `tests/rutas-ui.js` para
detectar rutas sin consumidor; el filtro de distancia accesible `dist`
se preservó. Esta limpieza no equivale a retirar funcionalidades visibles.

**Criterios de certificación por revisión:** (1) CI de contrato, ocho
vistas, escenarios y normalizador satisfactoria, en PR y en `main`;
(2) versión única, metadato, pie y recursos consistentes; (3) build de
Pages satisfactorio; (4) certificación HTTP de los recursos servidos contra
el commit correcto. Las evidencias están en la pestaña Actions.

**Limitaciones conocidas:** `jsdom` no certifica el resultado visual en
todos los navegadores, tamaños y dispositivos. El verificador de Pages
comprueba los archivos servidos, no pestañas que ya estaban abiertas.
La información académica depende de la veracidad de las fuentes externas.
No existen otras carreras habilitadas en esta versión. Se mantienen
las defensas y sus límites descritos en ARQ-01.

## 6. Control recurrente del mantenimiento

El procedimiento ejecutable de [MNT-01](MANTENIMIENTO-CONTINUO.md) genera evidencia de inventario, conexión de pruebas y recursos, residuos y configuración remota en Actions. Su informe se limita a las comprobaciones declaradas; no reemplaza las pruebas funcionales, la verificación académica o la revisión visual.
