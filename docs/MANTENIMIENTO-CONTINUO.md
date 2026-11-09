# MNT-01 — Mantenimiento automático y alcance de sus garantías

**Estado:** controles ejecutables del proyecto, no una declaración de que el código está libre de defectos.
**Documento rector:** [ARQ-01](ARQUITECTURA.md).
**Alcance:** código publicado, herramientas externas, pruebas, documentación y repositorio.
**Versión del sitio:** independiente de los controles de mantenimiento.

## 1. Regla operativa

Ningún participante (humano o asistente) puede concluir que un repositorio
está «limpio» solo porque una búsqueda, una batería de pruebas o un
despliegue hayan terminado correctamente. Cada conclusión se limita a
**qué comprobación se ejecutó, sobre qué revisión y con qué resultado**.

El propio proyecto ejecuta verificaciones repetibles y genera evidencia.
Los hallazgos de baja certeza no provocan eliminación automática.
El mantenimiento no cambia ni completa datos académicos faltantes.

## 2. Ejecución automática

- **Cada PR a main y cada push a main:** el workflow
  [Verificación ARQ-01](../.github/workflows/verificacion-arq01.yml)
  ejecuta pruebas, auditoría estructural y adjunta un informe.
  Las infracciones objetivas provocan fallo de CI; se conserva el artefacto
  incluso si otras pruebas fallan.
- **Cada lunes y por ejecución manual:** el workflow
  [Auditoría continua](../.github/workflows/auditoria-continua.yml)
  repite las pruebas, lee las ramas de GitHub, registra si main tiene
  protección y actualiza un único Issue de mantenimiento con los
  hallazgos pendientes. No realiza borrado ni reescritura de código.
- **Publicación:** [Certificar versión publicada](../.github/workflows/certificar-publicacion.yml)
  es un control distinto: compara los recursos HTTP servidos con los
  archivos del commit. No certifica calidad de código ni de fuentes.
- **Ramas fusionadas:** [Limpieza de ramas fusionadas](../.github/workflows/limpiar-ramas-fusionadas.yml)
  ya dispone de su política propia y solo elimina ramas fusionadas cuya
  revisión no cambió; no se debe utilizar para decidir si una rama sin
  fusionar contiene trabajo útil.

## 3. Uso local

Después de clonar el repositorio:

```bash
npm ci
npm test
npm run mantenimiento:auditar
```

El último comando crea dos archivos ignorados por Git:
`.auditoria/reporte.json` y `.auditoria/resumen.md`.
Se publican como artefactos de la ejecución correspondiente en Actions.

El reporte identifica el commit, todos los archivos rastreados y su
clasificación por responsabilidad, controles ejecutados, hallazgos y
limitaciones. **Clasificación no equivale a inspección semántica.**
Un archivo nuevo, aunque esté en una carpeta conocida, se examina para
determinar si se conecta con sus consumidores.

## 4. Controles y decisiones

| Control | Resultado observable | Política |
|---|---|---|
| Inventario de Git | Archivos registrados y categorías conocidas | Error si no existe clasificación |
| Residuos | Temporales, pycache, artefactos generados u otros patrones prohibidos incluidos en Git | Error |
| Carga productiva | Módulos JS y hojas CSS enlazados, sin archivo productivo huérfano | Error |
| Entrada académica | Exactamente el contrato normalizado publicado | Error ante otra ruta académica |
| Ejecución de pruebas | Cada archivo test JS vinculado a npm test; pruebas Python conectadas al CI | Error |
| Sintaxis | Compilación estática de JavaScript rastreado | Error |
| Herramientas | Scripts sin consumidor textual identificado | Aviso: comprobar llamadas dinámicas |
| Documentos | Documentos sin enlace entrante y frases de vigencia posiblemente obsoletas | Aviso: investigar |
| GitHub remoto | Main sin protección, ramas sin PR/fusión verificable | Aviso e Issue persistente |

Las pruebas negativas del propio auditor están en
[tests/mantenimiento-automatico.js](../tests/mantenimiento-automatico.js)
y [tests/mantenimiento-github.js](../tests/mantenimiento-github.js).
Si se introduce una prueba y se olvida añadirla a npm test, el CI falla;
si se incorpora código productivo sin enlazarlo desde el arranque, también.
No basta con comprobar que los dos archivos de auditoría existen.

## 5. Límites reales

1. Una referencia textual puede existir en una ruta que nunca se ejecuta,
   o ser una llamada dinámica no visible para el análisis. No se autoriza
   borrar funciones por el número de coincidencias.
2. Comprobar rutas de acciones no demuestra que los controles sean
   utilizables, accesibles con teclado ni visualmente correctos.
3. Los datos de oferta, requisitos y fechas siguen sujetos a fuentes
   externas y se aceptan parcialmente sin inventar información.
4. Un CI con resultado satisfactorio no impide por sí solo saltarlo si
   la rama principal no requiere esas comprobaciones: configurar
   **protección de main** en GitHub es una obligación separada.
5. El historial de Git y la documentación de antecedentes no se borran
   por mostrar versiones antiguas; se diferencia la autoridad vigente.
6. No se convierten fuentes institucionales dentro de la aplicación.
   `scripts/normalizar_oferta.py` y `data/` se conservan como preparación externa.
7. La futura gestión de múltiples carreras continúa como requisito
   aprobado; estos controles no interpretan su ausencia como defecto 1.0.

## 6. Lectura correcta de un resultado

«63 de 63 archivos clasificados, cero errores y cuatro avisos»
solo significa **63 rutas conocidas bajo esta clasificación y estos
controles**. No significa que se hayan inspeccionado 63 archivos a nivel
semántico, ni ausencia de código muerto o defectos de cálculo.

El informe debe permitir localizar cada aviso por archivo, y el Issue
de mantenimiento debe seguir abierto mientras haya pendientes. Una
eliminación debe aportar evidencia, pruebas y una PR separada.
