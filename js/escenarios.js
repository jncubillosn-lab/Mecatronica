'use strict';

/**
 * ARQ-01: modificaciones personales sobre un escenario de referencia.
 * No contiene información académica ni abre fuentes: opera con estados recibidos.
 */
class EscenarioPersonal {
  static copia(x) { return JSON.parse(JSON.stringify(x)); }
  static claveGrupo(g) { return g.ref ? 'r:' + g.ref : g.a + '\u0001' + g.g; }
  static clavePre(p) { return p.r + '\u0001' + p.t; }
  static claveBloque(b) { return b.ref ? 'r:' + b.ref : 'i:' + b.id; }
  static propiedadesBloque(b) {
    return { a:b.a, c:b.c, d:b.d, s:b.s, e:b.e, o:b.o || '' };
  }

  /** Extrae solamente diferencias voluntarias; no copia la referencia académica. */
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
      for(const k of ['s','cr','comp','car','nota'])if(JSON.stringify(m[k])!==JSON.stringify(b[k]))valores[k]=m[k];
      if(Object.keys(valores).length)out.malla.push({nombre:m.n,posicionId:m.idPos||null,valores});
    }
    const ap=new Map(actual.pre.map(p=>[EscenarioPersonal.clavePre(p),p]));
    const bp=new Map(base.pre.map(p=>[EscenarioPersonal.clavePre(p),p]));
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
    if(JSON.stringify(base.reqCred)!==JSON.stringify(actual.reqCred))out.reqCred=EscenarioPersonal.copia(actual.reqCred);
    return out;
  }

  static aplicar(base, cambios) {
    const s=EscenarioPersonal.copia(base);
    if (!cambios || typeof cambios!=='object') return s;
    Object.assign(s.params, cambios.params || {});
    for(const r of cambios.malla || []){
      const m=s.malla.find(x=>(r.posicionId&&x.idPos===r.posicionId)||x.n===r.nombre);
      if(m)Object.assign(m,r.valores||{});
      else if(r.nueva)s.malla.push(EscenarioPersonal.copia(r.nueva));
    }
    const pre=cambios.pre || {};
    const quitarPre=new Set(pre.quitar||[]);
    s.pre=s.pre.filter(p=>!quitarPre.has(EscenarioPersonal.clavePre(p)));
    for(const p of pre.agregar||[])if(!s.pre.some(x=>EscenarioPersonal.clavePre(x)===EscenarioPersonal.clavePre(p)))s.pre.push(EscenarioPersonal.copia(p));

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
    if(cambios.reqCred)s.reqCred=EscenarioPersonal.copia(cambios.reqCred);
    return s;
  }

  /** Validación técnica mínima: no exige completitud académica. */
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
    for(const regla of estado.reqCred||[]){
      if(!regla || !Number.isFinite(regla.min)){
        throw new Error('Requisito de créditos inválido en el escenario');
      }
    }
    return estado;
  }

  static empaquetar(base, actual) {
    return { tipo:'escenario-personal', version:1, cambios:EscenarioPersonal.diferencias(base,actual) };
  }

  /**
   * Transición de archivos {S} antiguos. La fuente académica sigue siendo una:
   * se usa la identidad histórica DECLARADA EN EL MISMO CONTRATO NORMALIZADO.
   */
  static migrarAnterior(baseVigente, snapshot, contrato, construirEstado, LectorAcademico) {
    const aplicado = Array.isArray(snapshot.incorporacionesOferta) && snapshot.incorporacionesOferta.length > 0;
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
    const cambios=EscenarioPersonal.diferencias(baseAnterior,snapshot);
    // Las ediciones heredadas por nombre se enlazan al ID estable del grupo.
    const referenciaGrupo=new Map(baseVigente.grupos.map(g=>[g.a+'\u0001'+g.g,g.ref]));
    cambios.grupos.quitar=cambios.grupos.quitar.map(key=>referenciaGrupo.has(key)?'r:'+referenciaGrupo.get(key):key);
    cambios.grupos.modificar=cambios.grupos.modificar.map(x=>({...x,key:referenciaGrupo.has(x.key)?'r:'+referenciaGrupo.get(x.key):x.key}));
    // Identificar referencias originales mediante el número heredado cuando sea posible.
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
    return EscenarioPersonal.aplicar(baseVigente,cambios);
  }
}
if(typeof module!=='undefined')module.exports={EscenarioPersonal};
