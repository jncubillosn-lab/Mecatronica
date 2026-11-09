'use strict';

/**
 * Tres fuentes independientes: catálogo, oferta por actividad y malla curricular.
 * No requiere completitud ni fuerza coincidencias entre registros.
 * Los vínculos por nombre/código se suministran explícitamente como datos.
 */
class FuentesAcademicas {
  constructor({ catalogo = [], oferta = [], malla = [], vinculosCatalogo = [] } = {}) {
    this.catalogo = Array.isArray(catalogo) ? catalogo : [];
    this.oferta = Array.isArray(oferta) ? oferta : [];
    this.malla = Array.isArray(malla) ? malla : [];
    this.vinculos = Array.isArray(vinculosCatalogo) ? vinculosCatalogo : [];
    this.porCodigo = new Map(this.catalogo.map(c => [c.codigo, c]));
    this.ofertaPorCodigo = new Map(this.oferta.map(c => [c.codigo, c]));
    this.codigoPorPosicion = new Map(this.vinculos);
  }

  /** Posición de la malla: puede ser una optativa genérica, sin código de curso. */
  posicion(nombre) {
    return this.malla.find(m => (Array.isArray(m) ? m[0] : m.n) === nombre) || null;
  }

  codigoEnMalla(nombre) {
    return this.codigoPorPosicion.get(nombre) || null;
  }

  /** Una ausencia devuelve null; jamás infiere créditos, categoría u oferta. */
  consultar(codigo) {
    return {
      catalogo: this.porCodigo.get(codigo) || null,
      oferta: this.ofertaPorCodigo.get(codigo) || null,
      posiciones: this.vinculos.filter(([nombre, vinculado]) => vinculado === codigo)
        .map(([nombre]) => this.posicion(nombre)).filter(Boolean)
    };
  }

  consultarPosicion(nombre) {
    const codigo = this.codigoEnMalla(nombre);
    return {
      malla: this.posicion(nombre),
      codigo,
      catalogo: codigo ? this.porCodigo.get(codigo) || null : null,
      oferta: codigo ? this.ofertaPorCodigo.get(codigo) || null : null
    };
  }

  /** Cada grupo se asocia a su actividad original. No combina magistrales y laboratorios. */
  grupos(codigo) {
    const r = this.ofertaPorCodigo.get(codigo);
    if (!r) return [];
    return (r.actividades || []).flatMap(actividad => (actividad.grupos || []).map(g => ({
      actividad: actividad.nombre,
      ...g
    })));
  }

  /** Únicamente horarios escritos en la oferta, sin generar bloques faltantes. */
  bloques(codigo) {
    return this.grupos(codigo).flatMap(g => (g.horarios || []).map(b => ({
      actividad: g.actividad, grupo: g.id, ...b
    })));
  }
}
if (typeof module !== 'undefined') module.exports = { FuentesAcademicas };
