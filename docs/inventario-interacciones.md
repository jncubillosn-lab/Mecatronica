# Inventario de interacciones (requisito fijo)

La página **no es solo de consulta**: el usuario modifica un escenario y ve el efecto.
Cualquier reestructuración del código debe conservar TODO lo de esta lista.
Fuente: lectura del manejador de eventos de `index.html` (versión del 7 nov 2026).

## Transversales
- Navegar entre 7 secciones (Inicio, Interferencias, Asignaturas, Grupos, Horarios, Mapa de calor, Prerrequisitos).
- Panel lateral (drawer): detalle de una pareja y lista de «Ver cambios»; se cierra con botón.
- Parámetros de comparación: distancia entre semestres (se elige una o varias, nunca ninguna) y «no comparar si una es prerrequisito de la otra».
- Escenario: contador de cambios frente al Excel original, **Guardar** (descarga `escenario-horarios.json`), **Cargar** (valida el archivo), **Restablecer** (pide confirmar con un segundo clic).
- Persistencia automática en el navegador (`localStorage`, clave `interferencias-horarios-v3`) y aviso al recuperar cambios.
- Tema claro/oscuro automático; franja superior con enlace a Instagram.

## Interferencias
- Vista lista / matriz; filtros por distancia, tipo de choque, semestre, asignatura y búsqueda por nombre; orden; incluir parejas sin choque; limpiar filtros.
- Abrir una pareja: matriz de grupos contra grupos, clic en una celda para ver los dos horarios.
- Activar/desactivar («simular que no se oferta») un grupo desde el panel.
- **Descargar CSV** con el resultado.

## Asignaturas
- Orden (varios criterios), abrir detalle, saltar a Grupos, Horarios o Interferencias de esa asignatura.

## Grupos
- Seleccionar un grupo y ver con qué choca; activar/desactivar; agregar y eliminar grupos (valida nombre vacío y repetido).
- Agregar a la lista asignaturas de la malla sin horario; quitar asignaturas del análisis.

## Horarios
- Elegir asignatura y componente; renombrar componente; agregar y eliminar componentes (valida nombre vacío y repetido).
- Agregar, eliminar, **arrastrar** bloques a otro día u hora, y editar día, hora de inicio y fin.
- Superponer otras asignaturas (o todas las que chocan) y quitarlas.

## Mapa de calor
- Incluir/excluir asignaturas del mapa (una a una, todas, ninguna); resumen de la selección; carga por día.

## Prerrequisitos (malla)
- Seleccionar asignatura; mostrar todas las flechas o solo la selección; solo con horario.
- **Arrastrar** una asignatura a otro semestre, o cambiarlo con botones (límite 1–10).
- Cambiar créditos (mínimo 0).
- Agregar y quitar relaciones (requisito y «la requieren»).
- Créditos por semestre separando los de Inglés (`13+3`).
