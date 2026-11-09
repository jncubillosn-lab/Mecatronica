'use strict';

/**
 * ARQ-01: modificaciones personales sobre un escenario de referencia.
 * No contiene información académica ni abre fuentes: opera con estados recibidos.
 * Dos entradas conceptuales: `base` (S0, única referencia vigente) y `actual`
 * (S, modificaciones personales). Los archivos antiguos se manejan en
 * `migrarAnterior`, sin añadir campos obligatorios al contrato vigente.
 */
class EscenarioPersonal {
  /** Copia estructural: evita mutar S0 al reconstruir o comparar cambios. */
  static copia(x) { return JSON.parse(JSON.stringify(x)); }
  // Priorizar `ref` estable del contrato; el nombre visible es respaldo legado.
  static claveGrupo(g) { return g.ref ? 'r:' + g.ref : g.a + '\u0001' + g.g; }
  /** Referencias estables cuando el contrato las conoce; nombres como legado. */
  static clavePre(p, idsPorNombre) {
    const rId = p.rId || idsPorNombre?.get(p.r);
    const tId = p.tId || idsPorNombre?.get(p.t);
    return rId && tId ? 'id:' + rId + '\u0001' + tId : p.r + '\u0001' + p.t;
  }
  /** Identidad estable del requisito; compatibilidad por nombre en exportaciones antiguas. */
  static claveReq(r, idsPorNombre) {
    const id=r?.posicionId || idsPorNombre?.get(r?.n);
    return id ? 'id:'+id : 'n:'+String(r?.n||'');
  }
  /** Tabla nombre->ID solo como respaldo de ficheros sin posicionId. */
  static indicePosiciones(estado) {
    return new Map((estado.malla || []).filter(m => m.idPos).map(m => [m.n, m.idPos]));
  }
  // El ID numérico legado solo identifica bloques sin `ref` normalizada.
  static claveBloque(b) { return b.ref ? 'r:' + b.ref : 'i:' + b.id; }
  /** Propiedades que una persona puede modificar; ID, ref y origen no se editan. */
  static propiedadesBloque(b) {
    return { a:b.a, c:b.c, d:b.d, s:b.s, e:b.e, o:b.o || '' };
  }

  /**
   * Devuelve exclusivamente operaciones personales sobre la referencia.
   * Un cambio institucional en el contrato NO debe aparecer como edición
   * voluntaria; el resultado puede aplicarse a futuras referencias.
   * @param {object} base Escenario de referencia vigente, sin mutaciones.
   * @param {object} actual Escenario personalizado de la sesión.
   * @returns {object} Operaciones de agregar, quitar y modificar.
   * Los campos históricos `idAnterior`, `introducidoEn` y `mig1..mig4`
   * no son parte de `diferencias`: no condicionan el contrato de entrada.
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
        // Los escenarios {S} anteriores no tenían unidad académica.
        const actual=k==='unidad'?(m[k]||''):m[k];
        const baseValor=k==='unidad'?(b[k]||''):b[k];
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
    // El formato v1 admite esta propiedad opcional sin romper los archivos v1
    // anteriores que guardaban una colección reqCred completa.
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
   * Las incorporaciones académicas nuevas no deben reponer grupos que la
   * persona quitó deliberadamente. Para archivos v1 con `reqCred` completo,
   * la compatibilidad es conservadora: se mantienen reglas antiguas hasta
   * que la UI solicite una decisión individual sobre cada diferencia.
   */
  static aplicar(base, cambios) {
    const s=EscenarioPersonal.copia(base);
    if (!cambios || typeof cambios!=='object') return s;
    Object.assign(s.params, cambios.params || {});
    for(const r of cambios.malla || []){
      const m=s.malla.find(x=>(r.posicionId&&x.idPos===r.posicionId)||x.n===r.nombre);
      if(m){
        Object.assign(m,r.valores||{});
        if(typeof m.unidad!=='string')m.unidad='';
      }
      else if(r.nueva)s.malla.push(EscenarioPersonal.copia(r.nueva));
    }
    const pre=cambios.pre || {};
    const indicePos=EscenarioPersonal.indicePosiciones(s), quitarPre=new Set(pre.quitar||[]);
    // Aceptar tanto claves estables nuevas como claves por nombre de exportaciones
    // personales antiguas; nunca reponer una relación retirada por el usuario.
    s.pre=s.pre.filter(p=>!quitarPre.has(EscenarioPersonal.clavePre(p, indicePos)) &&
      !quitarPre.has(p.r+'\u0001'+p.t));
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
      if(g)Object.assign(g,r.valores||{});
    }

    const bl=cambios.bloques||{},quitarBl=new Set(bl.quitar||[]);
    s.bloques=s.bloques.filter(b=>!quitarBl.has(EscenarioPersonal.claveBloque(b)));
    for(const r of bl.modificar||[]){
      const b=s.bloques.find(x=>EscenarioPersonal.claveBloque(x)===r.key);
      if(b)Object.assign(b,r.valores||{});
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
    // Lectura conservadora de snapshots v1 anteriores: NO perder una regla
    // potencialmente editada. El llamador identifica las diferencias ambiguas
    // y solicita revisión, en lugar de tratarlas automáticamente como oficiales.
    if(Array.isArray(cambios.reqCred))
      s.reqCred=EscenarioPersonal.copia(cambios.reqCred)
        .map(r=>({...r,posicionId:r.posicionId||indicePos.get(r.n)||null}));
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
    const dias=new Set(calendario.ids());
    const ids=new Set();
    for(const b of estado.bloques){
      if(!b || typeof b.a!=='string' || typeof b.c!=='string' ||
          !dias.has(b.d) || !Number.isFinite(b.s) || !Number.isFinite(b.e) ||
          b.s<calendario.inicio || b.e>calendario.fin || b.s>=b.e ||
          !Number.isFinite(b.id) || ids.has(b.id)){
        throw new Error('Bloque horario inválido en el escenario');
      }
      ids.add(b.id);
    }
    for(const m of estado.malla){
      if(m?.unidad!=null && (typeof m.unidad!=='string' || m.unidad.length>180))
        throw new Error('Unidad académica inválida en el escenario');
    }
    // La ausencia de demanda en un escenario anterior es válida.
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
      if(!regla || !Number.isFinite(regla.min)){
        throw new Error('Requisito de créditos inválido en el escenario');
      }
    }
    return estado;
  }

  /**
   * Formato de exportación `{tipo:'escenario-personal',version:1,cambios}`.
   * `version:1` es la versión del FORMATO de escenario, independiente de
   * `versionEsquema` y de la versión visible del sitio. El paquete contiene
   * solamente modificaciones personales, nunca una nueva fuente académica.
   * @param {object} base Referencia vigente S0
   * @param {object} actual Escenario personal S
   * @param {Array} pendientes Reglas heredadas aún no conciliadas, opcional
   */
  static empaquetar(base, actual, pendientes = []) {
    const cambios=EscenarioPersonal.diferencias(base,actual);
    // Identificadores ambiguos de archivos previos permanecen revisables
    // incluso si el usuario guarda otros cambios antes de resolverlos.
    if(pendientes.length)cambios.reqCredAmbiguos=pendientes.map(x=>x.key);
    return { tipo:'escenario-personal', version:1, cambios };
  }

  /**
   * Una colección reqCred de un escenario antiguo no conserva su referencia
   * de origen: no permite distinguir una regla editada de otra desactualizada.
   * Retornar las diferencias para revisión explícita y conservar sus valores.
   * No contiene excepciones por carrera, asignatura o versión institucional.
   * Devuelve solo diferencias no resueltas: no inventa una aprobación,
   * rechazo ni interpretación normativa del requisito académico.
   */
  static requisitosAmbiguos(base, archivo, efectivo) {
    const cambios=archivo?.cambios;
    const esLegacy=Array.isArray(cambios?.reqCred) || !!archivo?.S;
    const ids=EscenarioPersonal.indicePosiciones(base);
    const clave=r=>EscenarioPersonal.claveReq(r,ids);
    const bb=new Map((base.reqCred||[]).map(r=>[clave(r),r]));
    const aa=new Map((efectivo.reqCred||[]).map(r=>[clave(r),r]));
    const marcadas=Array.isArray(cambios?.reqCredAmbiguos)?
      new Set(cambios.reqCredAmbiguos):
      esLegacy?new Set([...bb.keys(),...aa.keys()]):new Set();
    const pendientes=[];
    for(const key of marcadas){
      const origen=aa.get(key), vigente=bb.get(key);
      const valor=r=>r?[r.min,r.componentes]:null;
      if(JSON.stringify(valor(origen))===JSON.stringify(valor(vigente)))continue;
      pendientes.push({key, nombre:origen?.n||vigente?.n||key,
        guardado:origen?EscenarioPersonal.copia(origen):null,
        vigente:vigente?EscenarioPersonal.copia(vigente):null});
    }
    return pendientes;
  }

  /**
   * Lector OPCIONAL del formato personal antiguo `{S}`, ya estabilizado.
   * Solo se invoca en importación/recuperación de esos archivos: nunca en S0.
   *
   * `agrupaciones[].introducidoEn` y `bloques[].idAnterior` son pistas
   * HISTÓRICAS OPCIONALES del contrato. Su ausencia es válida para cualquier
   * entrada académica vigente; simplemente reduce la correspondencia que
   * puede reconstruirse al interpretar un snapshot de v0.4.x. No deducir
   * vínculos faltantes, exigirlos a fuentes nuevas ni crear alarmas.
   *
   * @param {object} baseVigente S0, referencia académica ya construida.
   * @param {object} snapshot Archivo personal antiguo (solo datos de usuario).
   * @param {object} contrato Única entrada normalizada; puede omitir pistas antiguas.
   * @param {Function} construirEstado Adaptador posicional puro.
   * @param {Function} LectorAcademico Constructor actual EntradaAcademica.
   * @returns {object} Escenario reconstruido sobre S0, con correspondencias
   *   históricas solo donde existen datos inequívocos.
   */
  static migrarAnterior(baseVigente, snapshot, contrato, construirEstado, LectorAcademico) {
    // `incorporacionesOferta` pertenece al archivo PERSONAL previo, no a
    // FuentesAcadémicas. Ausente significa que no consta esa aplicación.
    const aplicado = Array.isArray(snapshot.incorporacionesOferta) && snapshot.incorporacionesOferta.length > 0;
    // Reconstruir el conjunto original usando procedencia DECLARADA;
    // `introducidoEn` ausente no permite deducir antigüedad por nombre.
    // Esta operación no afecta al lector actual ni exige campo histórico.
    const anteriores = contrato.agrupaciones.filter(g =>
      g.introducidoEn === '0.4.2' || (aplicado && g.introducidoEn === '0.4.3'));
    const referencia = { ...contrato, agrupaciones:anteriores };
    const baseAnterior=construirEstado(new LectorAcademico(referencia).generarEscenarioBase());
    // Los escenarios históricos identificaban los bloques por su posición numérica.
    baseAnterior.grupos.forEach(g=>{g.ref=null;});
    baseAnterior.bloques.forEach(b=>{
      b.id=b.idAnterior ?? b.id;
      b.ref=null;
    });
    // Comparar copia personal con su referencia antigua reconstruible,
    // nunca con S0 directamente: evitar tomar una actualización del plan
    // por una modificación voluntaria del usuario.
    const cambios=EscenarioPersonal.diferencias(baseAnterior,snapshot);
    // Las ediciones heredadas por nombre se enlazan al ID estable del grupo.
    const referenciaGrupo=new Map(baseVigente.grupos.map(g=>[g.a+'\u0001'+g.g,g.ref]));
    cambios.grupos.quitar=cambios.grupos.quitar.map(key=>referenciaGrupo.has(key)?'r:'+referenciaGrupo.get(key):key);
    cambios.grupos.modificar=cambios.grupos.modificar.map(x=>({...x,key:referenciaGrupo.has(x.key)?'r:'+referenciaGrupo.get(x.key):x.key}));
    // Identificar referencias originales mediante el número heredado cuando sea posible.
    // Solo reidentificar un bloque si hay evidencia explícita de su id
    // original; sin `idAnterior` NO asociarlo por horario o por parecido.
    const refPorId=new Map(baseAnterior.bloques.filter(b=>b.idAnterior!=null)
      .map(b=>[b.idAnterior,baseVigente.bloques.find(x=>x.idAnterior===b.idAnterior)?.ref||null]));
    for(const campo of ['quitar','modificar']){
      const items=cambios.bloques[campo]||[];
      cambios.bloques[campo]=items.map(x=>{
        const key=campo==='quitar'?x:x.key;
        const id=Number(String(key).replace(/^i:/,''));
        const ref=refPorId.get(id);
        if(!ref)return x;
        return campo==='quitar'?'r:'+ref:{...x,key:'r:'+ref};
      });
    }
    cambios.bloques.agregar.forEach(b=>{if(b.idAnterior==null)b.ref=null;});
    // La salida usa la referencia vigente y las diferencias recuperables.
    // No se escriben datos institucionales, ni se modifica `baseVigente`.
    return EscenarioPersonal.aplicar(baseVigente,cambios);
  }
}
if(typeof module!=='undefined')module.exports={EscenarioPersonal};
