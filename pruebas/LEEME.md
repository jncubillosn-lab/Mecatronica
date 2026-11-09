# Pruebas de preparación externa de oferta SIA

Este directorio **no forma parte de la entrada académica ejecutada por la
página**. La única entrada del Gestor de horarios es
`datos/academico.json`. La preparación de fuentes institucionales ocurre
fuera del sitio, conforme a [ARQ-01](../docs/ARQUITECTURA.md).

## Recursos vigentes

- `../scripts/normalizar_oferta.py`: normalizador externo de texto
  estructurado copiado del SIA; conserva datos no interpretables en un
  reporte para que una persona pueda revisarlos.
- `fixtures/oferta_mini.txt`: muestra de prueba del normalizador.
- `test_normalizador.py`: pruebas de tipologías desconocidas, grupos,
  horarios, fechas, asociación de actividades y datos ausentes.

Comprobación local:

```sh
python3 -m unittest pruebas/test_normalizador.py -v
```

GitHub Actions ejecuta también esta prueba, separada conceptualmente de
`npm test`, que valida la aplicación y su contrato normalizado.

## Límites

El normalizador **no debe** conectarse como segunda entrada del navegador.
Si una regla de agrupación no está confirmada, debe señalarse y no
inventarse. Un docente desconocido, un horario ausente o un grupo especial
no equivale a un fallo de la aplicación.

Los archivos y pruebas que solo servían para comparar la aplicación antigua
fueron retirados en 0.8.1, después de confirmarse que nadie necesita sus
formatos. El contenido histórico sigue consultable en Git, pero no es una
obligación de producción ni de nuevas fuentes.

La preparación de datos de **futuros programas académicos** sigue en
alcance: preservar la independencia del motor y las posibilidades de
normalización externa sin afirmar que ya existan nuevas carreras cargadas.
