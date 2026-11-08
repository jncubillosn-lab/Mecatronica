'use strict';

/**
 * ARQ-01: lector de la ÚNICA entrada académica normalizada.
 *
 * Este módulo NO lee ni convierte archivos de malla, catálogo u oferta originales.
 * Produce una proyección transitoria para las vistas existentes; el contrato que
 * consume siempre es datos/academico.json.
 */
class EntradaAcademica {
  /**
   * @param {object} datos Único contrato normalizado de `datos/academico.json`.
   * Valida identidad y forma técnica, no exige completitud institucional.
   * Las colecciones vacías y los valores nulos admitidos son datos legítimos.
   */
  constructor(datos) {
    if (!datos || datos.versionEsquema !== 1 ||
        !Array.isArray(datos.malla) ||
        !Array.isArray(datos.agrupaciones) ||
        !Array.isArray(datos.catalogo) ||
        !Array.isArray(datos.oferta)) {
      throw new Error('Contrato académico JSON no reconocido');
    }
    this.datos = datos;
    this.posiciones = new Map(datos.malla.map(p => [p.id, p]));
    if (this.posiciones.size !== datos.malla.length) {
      throw new Error('Identificadores duplicados en la malla normalizada');
    }
  }

  /**
   * Genera el identificador numérico que usa la interfaz para cada referencia.
   * Es determinista para la misma clave, NO identifica un bloque por su horario;
   * la identidad de referencia se conserva también como cadena `ref`.
   */
  static idNumerico(clave) {
    let x = 2166136261;
    for (let i = 0; i < clave.length; i++) {
      x ^= clave.charCodeAt(i);
      x = Math.imul(x, 16777619);
    }
    return (x >>> 0) + 1;
  }

  /**
   * @returns {object} Proyección posicional transitoria para construir S0.
   * `gr`: [asignatura, etiqueta, componente1, componente2, ref, analizable]
   * `bl`: [asignatura, componente, día, inicio, fin, nota, ref, idAnterior]
   * La oferta académica puede contener más grupos que las agrupaciones
   * explícitas. Aquí NO se infieren combinaciones de actividades.
   * La proyección `RAW` se deriva del contrato; NO es una segunda fuente.
   */
  generarEscenarioBase() {
    const d = this.datos, nombreDe = id => this.posiciones.get(id)?.nombre || null;
    // Una relación presente pero mal referenciada es un error de integridad,
    // NO un dato académico ausente. Nunca omitirla silenciosamente.
    const nombreRequisito = (id, descripcion) => {
      const nombre = nombreDe(id);
      if (!nombre) throw new Error('Referencia de requisito académico inválida (' + descripcion + '): ' + String(id));
      return nombre;
    };
    const disponibles = new Set();
    const grupos = [], bloques = [], vistos = new Set(), bloquesPorReferencia = new Map();
    for (const grupo of d.agrupaciones) {
      const asignatura = nombreDe(grupo.posicionId);
      if (!asignatura) throw new Error('Agrupación sin posición de malla: ' + grupo.id);
      const partes = Array.isArray(grupo.componentes) ? grupo.componentes : [];
      if (!partes.length) throw new Error('Agrupación sin componentes: ' + grupo.id);
      const etiqueta = grupo.etiqueta;
      const identidad = grupo.posicionId + '\u0001' + etiqueta;
      if (vistos.has(identidad)) throw new Error('Grupo normalizado duplicado: ' + identidad);
      vistos.add(identidad);
      disponibles.add(grupo.posicionId);

      // La vista de grupos actual admite hasta dos componentes. Si la fuente
      // normalizada incluye más, se muestra la totalidad de horarios como una
      // sola unidad; el detalle de actividades sigue en el contrato académico.
      const compactar = partes.length > 2;
      const nombres = compactar ? [etiqueta] : partes.map(c => c.id);
      // `analizable: false` retiene el grupo y sus horarios para consulta,
      // pero lo excluye de estadísticas. No se decide por prefijos del nombre.
      grupos.push([asignatura, etiqueta, nombres[0], nombres[1] || null, grupo.id, grupo.analizable !== false]);

      for (const parte of partes) {
        (parte.bloques || []).forEach((b, i) => {
          // `i` identifica la posición del bloque dentro de esta actividad.
          // Reordenar bloques en la fuente cambia referencias históricas:
          // comprobar migraciones y escenarios antes de hacerlo.
          const original = grupo.posicionId + '\u0001' + (compactar ? etiqueta + '\u0001' + parte.id : parte.id) + '\u0001' + i;
          const clave = compactar ? etiqueta : parte.id;
          const desde = this.hora(b.inicio), hasta = this.hora(b.fin);
          if (!Number.isFinite(desde) || !Number.isFinite(hasta) || desde >= hasta) {
            // Error técnico del contrato; no omitir información de forma silenciosa.
            throw new Error('Bloque horario inválido en agrupación ' + grupo.id);
          }
          const bloque = [asignatura, clave, b.dia, desde, hasta, b.nota || null, original, b.idAnterior ?? null];
          const anterior = bloquesPorReferencia.get(original);
          if (anterior) {
            if (JSON.stringify(anterior) !== JSON.stringify(bloque)) {
              throw new Error('El mismo bloque tiene horarios incompatibles en las agrupaciones: ' + original);
            }
            return; // Componente compartido por varias agrupaciones: no duplicarlo.
          }
          bloquesPorReferencia.set(original, bloque);
          bloques.push(bloque);
        });
      }
    }
    const opciones = d.configuracion?.opciones || {};
    const calendario = d.configuracion?.calendario || {};
    const req = d.requisitos || {};
    // Adaptación interna al formato posicional de v0.4.x; no se escribe a
    // disco ni se consulta como una fuente académica independiente.
    const raw = {
      programa: { ...d.programa },
      malla: d.malla.map(p => [p.nombre, p.semestre, p.nota || '', p.creditos ?? null, p.componente || '', p.caracter || '', p.id]),
      componentes: (d.componentes || []).map(c => [c.id, c.nombre, c.enPlan]),
      caracteres: (d.caracteres || []).map(c => [c.id, c.nombre]),
      reqCred: (req.minimosCreditos || []).map(r => [
        nombreRequisito(r?.destino, 'mínimo de créditos: destino'),
        r.minimo, [...(r.componentes || [])], r.destino
      ]),
      pre: (req.prerrequisitos || []).map(r => [
        nombreRequisito(r?.desde, 'prerrequisito: origen'),
        nombreRequisito(r?.hasta, 'prerrequisito: destino'),
        r.metodo || '', r.desde, r.hasta
      ]),
      asg: d.malla.filter(p => disponibles.has(p.id)).map(p => [p.nombre, p.semestre]),
      gr: grupos,
      bl: bloques,
      calendario: {
        dias: (calendario.dias || []).map(x => [x.id, x.nombre, x.corto]),
        inicio: calendario.horaInicio,
        fin: calendario.horaFin
      },
      opciones: {
        distanciasDisponibles: opciones.distanciasDisponibles || [0],
        distanciasIniciales: opciones.distanciasIniciales || [0],
        excluirIndirectos: !!opciones.excluirIndirectos,
        asignaturaInicial: opciones.asignaturaInicial || null,
        componentesComparables: opciones.componentesComparables || []
      },
      almacenamiento: { clave: d.configuracion?.almacenamiento?.clave || 'escenario-local' },
      metadatos: { ...(d.procedencia?.metadatos || {}) }
    };
    return raw;
  }

  /**
   * Convierte HH:MM a horas decimales; ante un texto no interpretable,
   * devuelve NaN para que la validación técnica lo rechace explícitamente.
   * No crea un horario de sustitución cuando un bloque no existe.
   */
  hora(valor) {
    if (typeof valor === 'number') return valor;
    if (typeof valor !== 'string' || !/^\d{2}:\d{2}$/.test(valor)) return NaN;
    const [h, m] = valor.split(':').map(Number);
    return m < 60 ? h + m / 60 : NaN;
  }
}

if (typeof module !== 'undefined') module.exports = { EntradaAcademica };
