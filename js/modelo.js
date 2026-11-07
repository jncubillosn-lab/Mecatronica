'use strict';

/**
 * Modelo de dominio independiente de HTML, de una carrera y de cifras concretas.
 * Los registros continúan siendo objetos sencillos para poder guardar escenarios JSON.
 * Se crea una instancia con el estado vigente; no se almacena estado global aquí.
 */
class PlanCurricular {
  constructor(estado) { this.estado = estado; }

  asignatura(nombre) { return this.estado.malla.find(a => a.n === nombre); }
  maxSemestre() { return Math.max(1, ...this.estado.malla.map(a => a.s)); }
  componentes() { return this.estado.tipos?.componentes || []; }
  caracteres() { return this.estado.tipos?.caracteres || []; }

  componente(id) { return this.componentes().find(c => c.id === id); }
  caracter(id) { return this.caracteres().find(c => c.id === id); }
  nombreComponente(id) { return this.componente(id)?.nombre || 'Sin clasificar'; }
  nombreCaracter(id) { return this.caracter(id)?.nombre || ''; }

  requisitoCreditos(nombre) { return (this.estado.reqCred || []).find(r => r.n === nombre); }

  /**
   * La regla declara qué componentes suman. Ningún nombre ni cifra académica
   * interviene en el algoritmo; se consideran solo semestres anteriores.
   */
  evaluarCreditos(asignatura, regla) {
    const previas = this.estado.malla.filter(a => a.s < asignatura.s);
    const catalogo = new Set(this.componentes().map(c => c.id));
    const contables = new Set(regla.componentes || []);
    const desconocido = contables.size === 0 ||
      [...contables].some(c => !catalogo.has(c)) ||
      previas.some(a => !catalogo.has(a.comp));
    const total = previas.filter(a => contables.has(a.comp))
      .reduce((sum, a) => sum + a.cr, 0);
    return { total, unknown: desconocido, low: !desconocido && total < regla.min };
  }

  /** Diferencia créditos del plan de otros créditos según metadatos del componente. */
  resumenSemestre(semestre) {
    const asignaturas = this.estado.malla.filter(a => a.s === semestre);
    const total = asignaturas.reduce((sum, a) => sum + a.cr, 0);
    const adicionales = asignaturas.filter(a => this.componente(a.comp)?.enPlan === false)
      .reduce((sum, a) => sum + a.cr, 0);
    return { total, plan: total - adicionales, adicionales, n: asignaturas.length };
  }

  cambiarComponente(nombre, id) {
    const a = this.asignatura(nombre);
    if (!a || !this.componente(id)) return null;
    a.comp = id;
    return a;
  }

  cambiarCaracter(nombre, id) {
    const a = this.asignatura(nombre);
    if (!a || (id && !this.caracter(id))) return null;
    a.car = id;
    return a;
  }

  ajustarCreditos(nombre, diferencia) {
    const a = this.asignatura(nombre);
    if (!a) return null;
    a.cr = Math.max(0, a.cr + diferencia);
    return a;
  }

  moverSemestre(nombre, destino) {
    const a = this.asignatura(nombre);
    if (!a) return null;
    a.s = Math.max(1, Math.min(this.maxSemestre(), destino));
    return a;
  }
}

/** Calendario de la oferta. Días y franja horaria se leen de la fuente. */
class CalendarioAcademico {
  constructor(datos) {
    this.dias = (datos.dias || []).map(([id, nombre, corto]) => ({ id, nombre, corto }));
    this.inicio = datos.inicio;
    this.fin = datos.fin;
  }
  ids() { return this.dias.map(d => d.id); }
  nombre(id) { return this.dias.find(d => d.id === id)?.nombre || id; }
  corto(id) { return this.dias.find(d => d.id === id)?.corto || id; }
  horas() { return Array.from({ length: Math.max(0, this.fin - this.inicio) }, (_, i) => this.inicio + i); }
}

if (typeof module !== 'undefined') module.exports = { PlanCurricular, CalendarioAcademico };
