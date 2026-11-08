'use strict';

/**
 * Modelo de dominio independiente de HTML, de una carrera y de cifras concretas.
 * Los registros continúan siendo objetos sencillos para poder guardar escenarios JSON.
 * Se crea una instancia con el estado vigente; no se almacena estado global aquí.
 */
class PlanCurricular {
  /**
   * @param {object} estado Escenario efectivo, no el JSON académico original.
   * Las operaciones de edición actúan sobre este objeto recibido; el llamador
   * decide cuándo guardar las diferencias respecto a la referencia.
   */
  constructor(estado) { this.estado = estado; }

  asignatura(nombre) { return this.estado.malla.find(a => a.n === nombre); }
  maxSemestre() { return Math.max(1, ...this.estado.malla.map(a => a.s)); }
  componentes() { return this.estado.tipos?.componentes || []; }
  caracteres() { return this.estado.tipos?.caracteres || []; }

  componente(id) { return this.componentes().find(c => c.id === id); }
  caracter(id) { return this.caracteres().find(c => c.id === id); }
  nombreComponente(id) { return this.componente(id)?.nombre || 'Sin clasificar'; }
  nombreCaracter(id) { return this.caracter(id)?.nombre || ''; }

  /** Selección de visualización: no borra ni modifica asignaturas, grupos o bloques. */
  seleccionarPorComponentes(nombres, componentes) {
    const permitidos = new Set(componentes);
    const indice = new Map(this.estado.malla.map(a => [a.n, a.comp]));
    return nombres.filter(nombre => permitidos.has(indice.get(nombre)));
  }

  requisitoCreditos(nombre) {
    const posicion=this.asignatura(nombre);
    // La identidad contractual prevalece cuando está informada. El nombre se
    // mantiene como respaldo para ediciones personales y archivos históricos.
    return (this.estado.reqCred || []).find(r =>
      (r.posicionId && posicion?.idPos === r.posicionId) || r.n === nombre);
  }

  /**
   * La regla declara qué componentes suman. Ningún nombre ni cifra académica
   * interviene en el algoritmo; se consideran solo semestres anteriores.
   */
  /**
   * Un total parcial puede calcularse, pero `unknown` impide concluir que
   * faltan créditos cuando alguno es desconocido. `low` solo es cierto si
   * toda la información contable necesaria está disponible.
   * @returns {{total:number, unknown:boolean, low:boolean}}
   */
  evaluarCreditos(asignatura, regla) {
    const previas = this.estado.malla.filter(a => a.s < asignatura.s);
    const catalogo = new Set(this.componentes().map(c => c.id));
    const contables = new Set(regla.componentes || []);
    const desconocido = contables.size === 0 ||
      [...contables].some(c => !catalogo.has(c)) ||
      previas.some(a => !catalogo.has(a.comp) || (contables.has(a.comp) && !Number.isFinite(a.cr)));
    const total = previas.filter(a => contables.has(a.comp) && Number.isFinite(a.cr))
      .reduce((sum, a) => sum + a.cr, 0);
    return { total, unknown: desconocido, low: !desconocido && total < regla.min };
  }

  /**
   * La suma numérica no implica que la información sea completa: `incompleto`
   * permanece verdadero si alguna asignatura carece de créditos conocidos.
   * `enPlan` es un atributo del contrato, no una lista fija en el motor.
   */
  resumenSemestre(semestre) {
    const asignaturas = this.estado.malla.filter(a => a.s === semestre);
    const total = asignaturas.reduce((sum, a) => sum + (Number.isFinite(a.cr) ? a.cr : 0), 0);
    const adicionales = asignaturas.filter(a => this.componente(a.comp)?.enPlan === false)
      .reduce((sum, a) => sum + (Number.isFinite(a.cr) ? a.cr : 0), 0);
    return { total, plan: total - adicionales, adicionales, n: asignaturas.length, incompleto: asignaturas.some(a => !Number.isFinite(a.cr)) };
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

  /**
   * Edición voluntaria del escenario: si el crédito era desconocido se toma
   * cero como punto de partida SOLO para aplicar la acción explícita.
   * No se altera el valor nulo de la fuente académica.
   */
  ajustarCreditos(nombre, diferencia) {
    const a = this.asignatura(nombre);
    if (!a) return null;
    a.cr = Math.max(0, (Number.isFinite(a.cr) ? a.cr : 0) + diferencia);
    return a;
  }

  /**
   * Cambia una posición curricular dentro del rango del escenario actual.
   * No cambia la malla normalizada ni significa que se haya matriculado.
   */
  moverSemestre(nombre, destino) {
    const a = this.asignatura(nombre);
    if (!a) return null;
    a.s = Math.max(1, Math.min(this.maxSemestre(), destino));
    return a;
  }
}

/**
 * Interpreta los días y límites horarios aportados por `configuracion.calendario`.
 * El motor usa intervalos [inicio, fin); no asume un calendario universal.
 * @see docs/ARQUITECTURA.md
 */
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
