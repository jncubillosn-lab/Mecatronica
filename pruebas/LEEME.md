# Pruebas de fidelidad

Objetivo: que cualquier versión reorganizada de la página se comporte **igual** que la original.

- `referencia/index.html`: copia congelada del HTML original (7 nov 2026). No se edita.
- `compare.js`: abre la referencia y la versión actual en un navegador simulado (jsdom), ejecuta el mismo guion de
  ~87 interacciones (navegar, filtrar, simular grupos, mover bloques, cambiar la malla, exportar, importar, recargar) y
  compara lo que se dibuja paso a paso. Uso: `npm install` y luego `npm run comparar`.
- `mutar.sh`: prueba del propio comparador. Rompe un dato a propósito y exige que se detecte. Uso: `npm run mutar`.

Ciclo de trabajo: **buscar** (qué falta o difiere) → **ajustar** → **comparar**, y repetir.
