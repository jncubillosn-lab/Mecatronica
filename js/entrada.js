'use strict';

/**
 * ARQ-01: lector de la ÚNICA entrada académica normalizada.
 *
 * Este módulo NO lee ni convierte archivos de malla, catálogo u oferta originales.
 * Produce una proyección transitoria para las vistas existentes; el contrato que
 * consume siempre es datos/academico.json.
 */
class EntradaAcademica {
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

  /** El hash identifica bloques de referencia de forma independiente del orden. */
  static idNumerico(clave) {
    let x = 2166136261;
    for (let i = 0; i < clave.length; i++) {
      x ^= clave.charCodeAt(i);
      x = Math.imul(x, 16777619);
    }
    return (x >>> 0) + 1;
  }

  generarEscenarioBase() {
    const d = this.datos, nombreDe = id => this.posiciones.get(id)?.nombre || null;
    const disponibles = new Set();
    const grupos = [], bloques = [], vistos = new Set(), bloquesPorReferencia = new Map();
    for (const grupo of d.agrupaciones) {
      const asignatura = nombreDe(grupo.posicionId);
      if (!asignatura) continue; // Relación incompleta: no se inventa una asignatura
      const partes = Array.isArray(grupo.componentes) ? grupo.componentes : [];
      if (!partes.length) continue;
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
      grupos.push([asignatura, etiqueta, nombres[0], nombres[1] || null]);

      for (const parte of partes) {
        (parte.bloques || []).forEach((b, i) => {
          const original = grupo.posicionId + '\u0001' + (compactar ? etiqueta + '\u0001' + parte.id : parte.id) + '\u0001' + i;
          const clave = compactar ? etiqueta : parte.id;
          const desde = this.hora(b.inicio), hasta = this.hora(b.fin);
          if (!Number.isFinite(desde) || !Number.isFinite(hasta) || desde >= hasta) {
            // Horario no interpretable: no fabricar un bloque válido.
            return;
          }
          const bloque = [asignatura, clave, b.dia, desde, hasta, b.nota || null, original];
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
    const raw = {
      programa: { ...d.programa },
      malla: d.malla.map(p => [p.nombre, p.semestre, p.nota || '', p.creditos ?? null, p.componente || '', p.caracter || '']),
      componentes: (d.componentes || []).map(c => [c.id, c.nombre, c.enPlan]),
      caracteres: (d.caracteres || []).map(c => [c.id, c.nombre]),
      reqCred: (req.minimosCreditos || []).flatMap(r => {
        const n = nombreDe(r.destino); return n ? [[n, r.minimo, [...(r.componentes || [])]]] : [];
      }),
      pre: (req.prerrequisitos || []).flatMap(r => {
        const desde = nombreDe(r.desde), hasta = nombreDe(r.hasta);
        return desde && hasta ? [[desde, hasta, r.metodo || '']] : [];
      }),
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

  hora(valor) {
    if (typeof valor === 'number') return valor;
    if (typeof valor !== 'string' || !/^\d{2}:\d{2}$/.test(valor)) return NaN;
    const [h, m] = valor.split(':').map(Number);
    return m < 60 ? h + m / 60 : NaN;
  }
}

if (typeof module !== 'undefined') module.exports = { EntradaAcademica };
