'use strict';

/**
 * ARQ-01: modificaciones personales sobre un escenario de referencia.
 * No contiene información académica ni abre fuentes: opera con estados recibidos.
 * Dos entradas conceptuales: `base` (S0, única referencia vigente) y `actual`
 * (S, modificaciones personales). Solo se admite el formato vigente de
 * diferencias; las copias completas de desarrollo no se leen.
 */
class EscenarioPersonal {
  /** Copia estructural: evita mutar S0 al reconstruir o comparar cambios. */
  static copia(x) { return JSON.parse(JSON.stringify(x)); }
  // Priorizar `ref` contractual; nombre/etiqueta identifican grupos creados personalmente.
  static claveGrupo(g) { return g.ref ? 'r:' + g.ref : g.a + '\u0001' + g.g; }
  /** IDs cuando existen; nombres para relaciones personales nuevas sin ID. */
  static clavePre(p, idsPorNombre) {
    const rId = p.rId || idsPorNombre?.get(p.r);
    const tId = p.tId || idsPorNombre?.get(p.t);
    return rId && tId ? 'id:' + rId + '\u0001' + tId : p.r + '\u0001' + p.t;
  }
  /** ID contractual primero; nombres solo para reglas personales sin ID. */
  static claveReq(r, idsPorNombre) {
    const id=r?.posicionId || idsPorNombre?.get(r?.n);
    return id ? 'id:'+id : 'n:'+String(r?.n||'');
  }
  /** Tabla nombre->ID para asociar ediciones personales a posiciones actuales. */
  static indicePosiciones(estado) {
    return new Map((estado.malla || []).filter(m => m.idPos).map(m => [m.n, m.idPos]));
  }
  // El ID numérico identifica bloques creados manualmente sin `ref` contractual.
  static claveBloque(b) { return b.ref ? 'r:' + b.ref : 'i:' + b.id; }
  /** Propiedades editables; la identidad de bloque no cambia. */
  static propiedadesBloque(b) {
    return { a:b.a, c:b.c, d:b.d, s:b.s, e:b.e, o:b.o || '' };
  }

  /** Aplica solo propiedades editables; IDs y elegibilidad académica no se importan como ediciones. */
  static asignarValores(destino, valores, permitidas) {
    if (!valores || typeof valores !== 'object' || Array.isArray(valores) ||
        Object.keys(valores).some(k => !permitidas.includes(k)))
      throw new Error('Propiedades de escenario no editables');
    for (const k of Object.keys(valores)) destino[k] = EscenarioPersonal.copia(valores[k]);
  }

  /**
   * Devuelve exclusivamente operaciones personales sobre la referencia.
   * Un cambio institucional en el contrato NO debe aparecer como edición
   * voluntaria; el resultado puede aplicarse a futuras referencias.
   * @param {object} base Escenario de referencia vigente, sin mutaciones.
   * @param {object} actual Escenario personalizado de la sesión.
   * @returns {object} Operaciones de agregar, quitar y modificar.
   */
  static diferencias(base, actual) {
    const out = {
      params: {}, malla: [],
      pre: { agregar:[], quitar:[] },
      asg: { agregar:[], quitar:[] },
      grupos: { agregar:[], quitar:[], modificar:[] },
      bloques: { agregar:[], quitar:[], modificar:[] }
    };
    for (const key of ['dists','indirect']) {
      if (JSON.stringify(base.params?.[key]) !== JSON.stringify(actual.params?.[key])) {
        out.params[key] = EscenarioPersonal.copia(actual.params[key]);
      }
    }
    const bm = new Map(base.malla.map(m=>[m.idPos || m.n,m]));
    for (const m of actual.malla) {
      const b=bm.get(m.idPos || m.n);
      if (!b) { out.malla.push({nombre:m.n,posicionId:m.idPos||null,nueva:EscenarioPersonal.copia(m)}); continue; }
      const valores={};
      for(const k of ['s','cr','comp','car','nota']){
        const actual=m[k];
        const baseValor=b[k];
        if(JSON.stringify(actual)!==JSON.stringify(baseValor))valores[k]=actual;
      }
      if((m.unidad||'')!==(b.unidad||''))valores.unidad=m.unidad||'';
      if(Object.keys(valores).length)out.malla.push({nombre:m.n,posicionId:m.idPos||null,valores});
    }
    const idsPorNombre=new Map([...EscenarioPersonal.indicePosiciones(base), ...EscenarioPersonal.indicePosiciones(actual)]);
    const ap=new Map(actual.pre.map(p=>[EscenarioPersonal.clavePre(p, idsPorNombre),p]));
    const bp=new Map(base.pre.map(p=>[EscenarioPersonal.clavePre(p, idsPorNombre),p]));
    for(const [key,p]of ap)if(!bp.has(key))out.pre.agregar.push(EscenarioPersonal.copia(p));
    for(const key of bp.keys())if(!ap.has(key))out.pre.quitar.push(key);
    const as=new Set(actual.asg),bs=new Set(base.asg);
    for(const n of as)if(!bs.has(n))out.asg.agregar.push(n);
    for(const n of bs)if(!as.has(n))out.asg.quitar.push(n);
    const ag=new Map(actual.grupos.map(g=>[EscenarioPersonal.claveGrupo(g),g]));
    const bg=new Map(base.grupos.map(g=>[EscenarioPersonal.claveGrupo(g),g]));
    for(const [key,g]of ag){
      const b=bg.get(key);
      if(!b)out.grupos.agregar.push(EscenarioPersonal.copia(g));
      else{
        const valores={};
        for(const k of ['on','c1','c2'])if(JSON.stringify(g[k])!==JSON.stringify(b[k]))valores[k]=g[k];
        if(Object.keys(valores).length)out.grupos.modificar.push({key,valores});
      }
    }
    for(const key of bg.keys())if(!ag.has(key))out.grupos.quitar.push(key);

    const ab=new Map(actual.bloques.map(b=>[EscenarioPersonal.claveBloque(b),b]));
    const bb=new Map(base.bloques.map(b=>[EscenarioPersonal.claveBloque(b),b]));
    for(const [key,b]of ab){
      const anterior=bb.get(key);
      if(!anterior)out.bloques.agregar.push(EscenarioPersonal.copia(b));
      else if(JSON.stringify(EscenarioPersonal.propiedadesBloque(b))!==JSON.stringify(EscenarioPersonal.propiedadesBloque(anterior))){
        out.bloques.modificar.push({key,valores:EscenarioPersonal.propiedadesBloque(b)});
      }
    }
    for(const key of bb.keys())if(!ab.has(key))out.bloques.quitar.push(key);
    if(JSON.stringify(base.tipos)!==JSON.stringify(actual.tipos))out.tipos=EscenarioPersonal.copia(actual.tipos);
    // DEM-01: encuesta agregada/anonimizada como anotación personal; no es fuente académica.
    if(JSON.stringify(base.demanda??null)!==JSON.stringify(actual.demanda??null))
      out.demanda=EscenarioPersonal.copia(actual.demanda??null);
    // Cambios de requisitos por ID, NO snapshots completos del plan.
    // Cada regla no tocada queda siempre bajo la referencia académica vigente.
    // El formato vigente registra cambios por propiedad, no listas completas.
    const bk=new Map((base.reqCred||[]).map(r=>[EscenarioPersonal.claveReq(r,idsPorNombre),r]));
    const ak=new Map((actual.reqCred||[]).map(r=>[EscenarioPersonal.claveReq(r,idsPorNombre),r]));
    const reqCambios={agregar:[],quitar:[],modificar:[]};
    for(const [key,r] of ak){
      const anterior=bk.get(key);
      if(!anterior) {
        reqCambios.agregar.push(EscenarioPersonal.copia({...r,
          posicionId:r.posicionId||idsPorNombre.get(r.n)||null}));
        continue;
      }
      const valores={};
      for(const campo of ['min','componentes']){
        if(JSON.stringify(anterior[campo])!==JSON.stringify(r[campo]))
          valores[campo]=EscenarioPersonal.copia(r[campo]);
      }
      if(Object.keys(valores).length)reqCambios.modificar.push({key,valores});
    }
    for(const key of bk.keys())if(!ak.has(key))reqCambios.quitar.push(key);
    if(reqCambios.agregar.length||reqCambios.modificar.length||reqCambios.quitar.length)
      out.reqCredCambios=reqCambios;
    return out;
  }

  /**
   * Reconstruye un estado NUEVO sin mutar `base`: primero clona la referencia
   * y después aplica las operaciones. Una edición de `on`, `c1` o `c2` no
   * puede convertir una agrupación de referencia informativa en analizable.
   * Las incorporaciones académicas nuevas no reponen grupos que la persona
   * quitó deliberadamente. Los mínimos se aplican por ID y propiedad.
   */
  static aplicar(base, cambios) {
    const s=EscenarioPersonal.copia(base);
    if (!cambios || typeof cambios!=='object') return s;
    EscenarioPersonal.asignarValores(s.params, cambios.params || {}, ['dists','indirect']);
    for(const r of cambios.malla || []){
      // Un ID explícito nunca se sustituye por una coincidencia de nombre.
      // El nombre solo identifica posiciones personales que no tienen ID.
      const m=s.malla.find(x=>r.posicionId ? x.idPos===r.posicionId : !x.idPos&&x.n===r.nombre);
      if(m){
        EscenarioPersonal.asignarValores(m,r.valores||{},['s','cr','comp','car','nota','unidad']);
      }
      else if(r.nueva)s.malla.push(EscenarioPersonal.copia(r.nueva));
    }
    const pre=cambios.pre || {};
    const indicePos=EscenarioPersonal.indicePosiciones(s), quitarPre=new Set(pre.quitar||[]);
    // Las relaciones personales nuevas sin ID se comparan por sus nombres;
    // las institucionales mantienen sus identificadores estables.
    s.pre=s.pre.filter(p=>!quitarPre.has(EscenarioPersonal.clavePre(p, indicePos)));

    for(const p of pre.agregar||[]){
      const normalizado={...p, rId:p.rId||indicePos.get(p.r)||null, tId:p.tId||indicePos.get(p.t)||null};
      if(!s.pre.some(x=>EscenarioPersonal.clavePre(x,indicePos)===EscenarioPersonal.clavePre(normalizado,indicePos)))
        s.pre.push(EscenarioPersonal.copia(normalizado));
    }

    const asg=cambios.asg||{},quitarAsg=new Set(asg.quitar||[]);
    s.asg=s.asg.filter(n=>!quitarAsg.has(n));
    for(const n of asg.agregar||[])if(!s.asg.includes(n))s.asg.push(n);

    const groups=cambios.grupos||{},quitarGroups=new Set(groups.quitar||[]);
    s.grupos=s.grupos.filter(g=>!quitarGroups.has(EscenarioPersonal.claveGrupo(g)));
    for(const g of groups.agregar||[]) {
      const existente=s.grupos.find(x=>x.a===g.a&&x.g===g.g);
      if(existente) Object.assign(existente,{on:g.on,c1:g.c1,c2:g.c2});
      else s.grupos.push(EscenarioPersonal.copia(g));
    }
    for(const r of groups.modificar||[]){
      const g=s.grupos.find(x=>EscenarioPersonal.claveGrupo(x)===r.key);
      if(g)EscenarioPersonal.asignarValores(g,r.valores||{},['on','c1','c2']);
    }

    const bl=cambios.bloques||{},quitarBl=new Set(bl.quitar||[]);
    s.bloques=s.bloques.filter(b=>!quitarBl.has(EscenarioPersonal.claveBloque(b)));
    for(const r of bl.modificar||[]){
      const b=s.bloques.find(x=>EscenarioPersonal.claveBloque(x)===r.key);
      if(b)EscenarioPersonal.asignarValores(b,r.valores||{},['a','c','d','s','e','o']);
    }
    let next=s.bloques.reduce((n,b)=>Math.max(n,b.id||0),0)+1;
    const ids=new Set(s.bloques.map(b=>b.id));
    for(const item of bl.agregar||[]){
      const b=EscenarioPersonal.copia(item);
      if(ids.has(b.id)||!Number.isFinite(b.id))b.id=next++;
      ids.add(b.id);
      if(!s.bloques.some(x=>EscenarioPersonal.claveBloque(x)===EscenarioPersonal.claveBloque(b)))s.bloques.push(b);
    }
    if(cambios.tipos)s.tipos=EscenarioPersonal.copia(cambios.tipos);
    if(Object.prototype.hasOwnProperty.call(cambios,'demanda'))
      s.demanda=EscenarioPersonal.copia(cambios.demanda);
    // Escritor actual: aplica SOLO operaciones sobre requisitos modificados.
    // Nunca reemplaza la lista institucional completa por editar un solo campo.
    if(cambios.reqCredCambios){
      const rc=cambios.reqCredCambios;
      const clave=r=>EscenarioPersonal.claveReq(r,indicePos);
      const quitar=new Set(rc.quitar||[]);
      s.reqCred=s.reqCred.filter(r=>!quitar.has(clave(r)));
      for(const item of rc.modificar||[]){
        const actual=s.reqCred.find(r=>clave(r)===item.key);
        if(actual) for(const campo of ['min','componentes'])
          if(Object.hasOwn(item.valores||{},campo))
            actual[campo]=EscenarioPersonal.copia(item.valores[campo]);
      }
      for(const r of rc.agregar||[]){
        const normalizado={...r,posicionId:r.posicionId||indicePos.get(r.n)||null};
        if(!s.reqCred.some(x=>clave(x)===clave(normalizado)))
          s.reqCred.push(EscenarioPersonal.copia(normalizado));
      }
    }
    return s;
  }

  /**
   * Valida únicamente integridad técnica antes de aceptar un escenario.
   * No exige horarios, docentes, créditos completos ni grupos para todas
   * las asignaturas. Rechazar un intervalo imposible es distinto de alertar
   * por un horario ausente (véase DEC-01).
   */
  static validarEstado(estado, calendario) {
    if (!estado || typeof estado !== 'object' || !estado.params ||
        !Array.isArray(estado.params.dists) ||
        !Array.isArray(estado.malla) || !Array.isArray(estado.pre) ||
        !Array.isArray(estado.asg) || !Array.isArray(estado.grupos) ||
        !Array.isArray(estado.bloques)) {
      throw new Error('Estructura de escenario no reconocida');
    }
    const texto = x => typeof x === 'string' && x.trim().length > 0;
    const opcional = x => x == null || typeof x === 'string';
    if (estado.params.dists.some(d => !Number.isSafeInteger(d) || d < 0) ||
        ![0,1,false,true].includes(estado.params.indirect))
      throw new Error('Parámetros de escenario inválidos');
    if (estado.tipos != null && (!Array.isArray(estado.tipos.componentes) ||
        !Array.isArray(estado.tipos.caracteres) ||
        [...estado.tipos.componentes,...estado.tipos.caracteres]
          .some(t => !t || !texto(t.id) || !texto(t.nombre)) ||
        estado.tipos.componentes.some(t => t.enPlan != null && typeof t.enPlan !== 'boolean')))
      throw new Error('Clasificaciones de escenario inválidas');
    const posiciones = new Map(), nombres = new Set();
    for (const m of estado.malla) {
      // Ausencia no equivale a cero ni autoriza completar un semestre/crédito.
      // Un texto donde se necesita un número es un error técnico del archivo.
      if (!m || !texto(m.n) ||
          (m.s != null && (!Number.isSafeInteger(m.s) || m.s < 0)) ||
          (m.cr != null && (!Number.isFinite(m.cr) || m.cr < 0)) ||
          !['comp','car','nota','idPos'].every(k => opcional(m[k])))
        throw new Error('Posición curricular inválida en el escenario');
      if (m.idPos) {
        if (posiciones.has(m.idPos)) throw new Error('ID curricular duplicado en el escenario');
        posiciones.set(m.idPos,m);
      }
      nombres.add(m.n);
      if(m.unidad!=null && (typeof m.unidad!=='string' || m.unidad.length>180))
        throw new Error('Unidad académica inválida en el escenario');
    }
    const pertenece = (id,nombre) => id ? posiciones.has(id) : nombres.has(nombre);
    if (estado.asg.some(n => !texto(n) || !nombres.has(n)))
      throw new Error('Asignatura de escenario sin posición curricular');
    for (const p of estado.pre) {
      if (!p || !texto(p.r) || !texto(p.t) || !opcional(p.rId) || !opcional(p.tId) ||
          !pertenece(p.rId,p.r) || !pertenece(p.tId,p.t))
        throw new Error('Referencia de prerrequisito inválida en el escenario');
    }
    const grupos = new Set();
    for (const g of estado.grupos) {
      if (!g || !texto(g.a) || !nombres.has(g.a) || !texto(g.g) ||
          !texto(g.c1) || !opcional(g.c2) || !opcional(g.ref) ||
          typeof g.on !== 'boolean' ||
          (g.analizable != null && typeof g.analizable !== 'boolean'))
        throw new Error('Grupo inválido en el escenario');
      const clave = g.a+'\u0001'+g.g;
      if (grupos.has(clave)) throw new Error('Grupo duplicado en el escenario');
      grupos.add(clave);
    }
    const dias=new Set(calendario.ids());
    const ids=new Set();
    for(const b of estado.bloques){
      if(!b || !texto(b.a) || !nombres.has(b.a) || !texto(b.c) ||
          !opcional(b.ref) || !opcional(b.o) ||
          !dias.has(b.d) || !Number.isFinite(b.s) || !Number.isFinite(b.e) ||
          b.s<calendario.inicio || b.e>calendario.fin || b.s>=b.e ||
          !Number.isFinite(b.id) || ids.has(b.id)){
        throw new Error('Bloque horario inválido en el escenario');
      }
      ids.add(b.id);
    }
    // La anotación de demanda es opcional y no pertenece al contrato académico.
    if(estado.demanda!=null){
      const d=estado.demanda;
      if(!d||d.tipo!=='demanda-preinscripcion'||d.version!==1||
          !Array.isArray(d.solicitudes)||d.solicitudes.length>20000)
        throw new Error('Datos de demanda inválidos');
      const idsDemanda=new Set();
      for(const r of d.solicitudes){
        if(!r||typeof r.posicionId!=='string'||!r.posicionId.trim()||
            r.posicionId.length>150||!Number.isSafeInteger(r.cantidad)||
            r.cantidad<0||idsDemanda.has(r.posicionId))
          throw new Error('Solicitud de demanda inválida o duplicada');
        idsDemanda.add(r.posicionId);
      }
      if(d.respuestasTotales!=null&&(!Number.isSafeInteger(d.respuestasTotales)||
          d.respuestasTotales<0||d.solicitudes.some(r=>r.cantidad>d.respuestasTotales)))
        throw new Error('Total de encuestados incompatible');
      if(d.tasaParticipacion!=null&&(!Number.isFinite(d.tasaParticipacion)||
          d.tasaParticipacion<=0||d.tasaParticipacion>1))
        throw new Error('Tasa de participación inválida');
      // Cuando está disponible el motor DEM-01, comprobar además las respuestas
      // individuales sin aceptar contradicciones entre sus conteos y el agregado.
      if(typeof DemandaEstadistica!=='undefined')DemandaEstadistica.normalizar(d);
    }
    for(const regla of estado.reqCred||[]){
      if(!regla || !Number.isFinite(regla.min) || regla.min < 0 ||
          !pertenece(regla.posicionId,regla.n) ||
          !Array.isArray(regla.componentes) || !regla.componentes.every(texto)){
        throw new Error('Requisito de créditos inválido en el escenario');
      }
    }
    return estado;
  }

  /**
   * Acepta solamente el formato de diferencias personales vigente.
   * Rechaza el contenedor completo {S} y la antigua lista reqCred;
   * la validación es del archivo personal, NO de la entrada académica.
   */
  static esFormatoVigente(archivo) {
    const c=archivo?.cambios;
    return archivo?.tipo==='escenario-personal' && archivo.version===1 &&
      (archivo.programaId == null || (typeof archivo.programaId==='string' && archivo.programaId.trim())) &&
      c && typeof c==='object' && !Array.isArray(c) &&
      !Object.hasOwn(c,'reqCred') && !Object.hasOwn(c,'reqCredAmbiguos');
  }

  /**
   * Guarda diferencias de S sobre S0, sin incorporar otra fuente académica.
   * version:1 describe este formato personal, no versionEsquema del contrato.
   */
  static empaquetar(base, actual) {
    return {tipo:'escenario-personal',version:1,programaId:base.programaId,
      cambios:EscenarioPersonal.diferencias(base,actual)};
  }

  /**
   * Única frontera de recuperación para archivos y almacenamiento local.
   * Comprueba contexto ANTES de aplicar y valida el estado NUEVO antes de
   * devolverlo. Ningún rechazo modifica base ni el escenario de la interfaz.
   * Los archivos version:1 ya existentes sin programaId solo se identifican
   * por referencias inequívocas de la base; no por nombres ni prefijos.
   * Una copia local sin metadato ya está aislada por la clave del programa.
   */
  static recuperar(base, archivo, calendario, almacenadoLocalmente = false) {
    if (!EscenarioPersonal.esFormatoVigente(archivo))
      throw new Error('Formato de escenario personal no soportado');
    if (archivo.programaId != null) {
      if (archivo.programaId !== base.programaId)
        throw new Error('El escenario corresponde a otro programa');
    } else if (!almacenadoLocalmente) {
      EscenarioPersonal.verificarReferenciasArchivo(base,archivo.cambios);
    }
    return EscenarioPersonal.validarEstado(EscenarioPersonal.aplicar(base,archivo.cambios),calendario);
  }

  /** Identifica archivos vigentes sin metadato sin inferir carrera por texto académico. */
  static verificarReferenciasArchivo(base, c) {
    const posiciones=new Set(base.malla.map(m=>m.idPos).filter(Boolean));
    const indice=EscenarioPersonal.indicePosiciones(base);
    const grupos=new Set(base.grupos.map(EscenarioPersonal.claveGrupo));
    const bloques=new Set(base.bloques.map(EscenarioPersonal.claveBloque));
    const pre=new Set(base.pre.map(p=>EscenarioPersonal.clavePre(p,indice)));
    const req=new Set((base.reqCred||[]).map(r=>EscenarioPersonal.claveReq(r,indice)));
    let referencias=0;
    const comprobar=(valor,conjunto)=>{
      if (!valor || !conjunto.has(valor)) throw new Error('Referencia de escenario ajena a la base vigente');
      referencias++;
    };
    for(const m of c.malla||[]) if(m.posicionId) comprobar(m.posicionId,posiciones);
    for(const p of c.pre?.agregar||[]) {
      if(p.rId)comprobar(p.rId,posiciones);
      if(p.tId)comprobar(p.tId,posiciones);
    }
    for(const clave of c.pre?.quitar||[])comprobar(clave,pre);
    for(const [operaciones,conjunto] of [[c.grupos,grupos],[c.bloques,bloques],[c.reqCredCambios,req]]){
      for(const clave of operaciones?.quitar||[])comprobar(clave,conjunto);
      for(const r of operaciones?.modificar||[])comprobar(r.key,conjunto);
    }
    for(const r of c.reqCredCambios?.agregar||[])if(r.posicionId)comprobar(r.posicionId,posiciones);
    for(const r of c.demanda?.solicitudes||[])comprobar(r.posicionId,posiciones);
    const contieneDatos=v=>Array.isArray(v) ? v.length>0 :
      v && typeof v==='object' ? Object.values(v).some(contieneDatos) : v!=null;
    if (!referencias && contieneDatos(c))
      throw new Error('No se puede identificar el programa de este escenario');
  }
}
if(typeof module!=='undefined')module.exports={EscenarioPersonal};
