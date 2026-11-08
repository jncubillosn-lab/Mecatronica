'use strict';

/**
 * DEM-01. Estadística descriptiva de intención de preinscripción.
 * No consulta cupos, no interpreta fuentes académicas originales y no convierte
 * solicitudes en inscripción efectiva. Recibe cantidades por ID curricular;
 * los grupos son agrupaciones explícitas del escenario, no capacidades.
 */
class DemandaEstadistica {
  static vacia() {
    return {tipo:'demanda-preinscripcion', version:1, solicitudes:[],
      respuestasTotales:null, tasaParticipacion:null, fechaEncuesta:null,
      respuestasAnonimas:null, simulado:false};
  }
  /** Valida la forma técnica sin exigir respuestas, cobertura ni grupos. */
  static normalizar(datos) {
    if (!datos || typeof datos!=='object' || Array.isArray(datos) ||
        (datos.tipo!=null && datos.tipo!=='demanda-preinscripcion') ||
        (datos.version!=null && datos.version!==1))
      throw new Error('Formato de demanda no reconocido');
    if (!Array.isArray(datos.solicitudes) && !Array.isArray(datos.respuestasAnonimas))
      throw new Error('Faltan solicitudes o respuestas anónimas');
    const entero=n=>Number.isSafeInteger(n)&&n>=0;
    const id=x=>typeof x==='string'&&x.trim()===x&&x.length>0&&x.length<=150;
    const original=datos.solicitudes||[];
    if(original.length>20000)throw new Error('Demasiadas asignaturas');
    const porId=new Map();
    for(const r of original){
      if(!r||!id(r.posicionId)||!entero(r.cantidad)||porId.has(r.posicionId))
        throw new Error('Solicitud inválida o duplicada');
      porId.set(r.posicionId,r.cantidad);
    }
    let respuestasAnonimas=null;
    if(datos.respuestasAnonimas!=null){
      if(!Array.isArray(datos.respuestasAnonimas)||datos.respuestasAnonimas.length>20000)
        throw new Error('Respuestas anónimas inválidas');
      const recuento=new Map();
      respuestasAnonimas=datos.respuestasAnonimas.map(respuesta=>{
        if(!Array.isArray(respuesta)||respuesta.length>60||!respuesta.every(id))
          throw new Error('Respuesta anónima inválida');
        const unica=[...new Set(respuesta)];
        unica.forEach(pos=>recuento.set(pos,(recuento.get(pos)||0)+1));
        return unica;
      });
      // Dos fuentes de conteos no deben contradecirse.
      if(original.length && (recuento.size!==porId.size ||
          [...recuento].some(([pos,n])=>porId.get(pos)!==n)))
        throw new Error('Conteos y respuestas anónimas no coinciden');
      if(!original.length)for(const [pos,n] of recuento)porId.set(pos,n);
    }
    const respuestasTotales=datos.respuestasTotales==null
      ?(respuestasAnonimas?respuestasAnonimas.length:null):datos.respuestasTotales;
    if(respuestasTotales!=null&&(!entero(respuestasTotales)||
        [...porId.values()].some(n=>n>respuestasTotales)||
        (respuestasAnonimas&&respuestasAnonimas.length>respuestasTotales)))
      throw new Error('Total de encuestados incompatible');
    const tasaParticipacion=datos.tasaParticipacion==null?null:datos.tasaParticipacion;
    if(tasaParticipacion!=null&&(!Number.isFinite(tasaParticipacion)||
      tasaParticipacion<=0||tasaParticipacion>1))
      throw new Error('Participación debe estar entre 0 y 1');
    if(datos.fechaEncuesta!=null&&(typeof datos.fechaEncuesta!=='string'||datos.fechaEncuesta.length>100))
      throw new Error('Fecha de encuesta inválida');
    if(datos.simulado!=null&&typeof datos.simulado!=='boolean')
      throw new Error('Marcador de simulación inválido');
    return {tipo:'demanda-preinscripcion',version:1,
      solicitudes:[...porId].map(([posicionId,cantidad])=>({posicionId,cantidad})),
      respuestasTotales,tasaParticipacion,fechaEncuesta:datos.fechaEncuesta||null,
      respuestasAnonimas,simulado:datos.simulado===true};
  }
  static mediana(valores) {
    const a=valores.filter(Number.isFinite).sort((x,y)=>x-y);
    if(!a.length)return null;
    const m=Math.floor(a.length/2);return a.length%2?a[m]:(a[m-1]+a[m])/2;
  }
  /**
   * La mediana se calcula para todo el semestre en el estado, ANTES de filtros
   * de interfaz. Se exige n>=3 y mediana positiva; MAD necesita n>=5.
   * La cantidad de grupos cuenta agrupaciones completas y analizables,
   * sin sumar componentes ni deducir cupos.
   */
  static analizar(entrada,malla,grupos) {
    const datos=entrada?DemandaEstadistica.normalizar(entrada):DemandaEstadistica.vacia();
    const cantidades=new Map(datos.solicitudes.map(r=>[r.posicionId,r.cantidad]));
    const ids=new Set(malla.map(m=>m.idPos).filter(Boolean));
    const noVinculadas=datos.solicitudes.filter(r=>!ids.has(r.posicionId));
    const gruposPorNombre=new Map();
    for(const g of grupos){
      if(g.on===false||g.analizable===false)continue;
      if(!gruposPorNombre.has(g.a))gruposPorNombre.set(g.a,new Set());
      gruposPorNombre.get(g.a).add(g.ref||g.a+'\u0001'+g.g);
    }
    const filas=malla.map(m=>{
      const conocida=!!m.idPos&&cantidades.has(m.idPos);
      const solicitudes=conocida?cantidades.get(m.idPos):null;
      const gruposOfertados=gruposPorNombre.get(m.n)?.size||null;
      const porGrupo=solicitudes!=null&&gruposOfertados>0?solicitudes/gruposOfertados:null;
      const frecuencia=solicitudes!=null&&datos.respuestasTotales>0
        ?solicitudes/datos.respuestasTotales:null;
      const proyeccion=solicitudes!=null&&datos.tasaParticipacion!=null
        ?solicitudes/datos.tasaParticipacion:null;
      return {posicionId:m.idPos,nombre:m.n,semestre:m.s,componente:m.comp,
        unidad:m.unidad||'',solicitudes,grupos:gruposOfertados,
        porGrupo,frecuencia,proyeccion,relativo:null,percentilSemestral:null,
        desviacionRobusta:null,comparables:0};
    });
    const referencia=new Map();
    for(const sem of new Set(filas.map(x=>x.semestre))){
      const muestra=filas.filter(x=>x.semestre===sem&&x.porGrupo!=null).map(x=>x.porGrupo);
      const mediana=muestra.length>=3?DemandaEstadistica.mediana(muestra):null;
      const mad=muestra.length>=5&&mediana!=null
        ?DemandaEstadistica.mediana(muestra.map(x=>Math.abs(x-mediana))):null;
      referencia.set(sem,{mediana, mad, n:muestra.length});
    }
    filas.forEach(f=>{
      const r=referencia.get(f.semestre);
      f.comparables=r.n;
      if(f.porGrupo!=null&&r.n>=3){
        const valores=filas.filter(x=>x.semestre===f.semestre&&x.porGrupo!=null).map(x=>x.porGrupo);
        const menores=valores.filter(v=>v<f.porGrupo).length;
        const iguales=valores.filter(v=>v===f.porGrupo).length;
        f.percentilSemestral=100*(menores+(iguales-1)/2)/(valores.length-1);
      }
      if(f.porGrupo!=null&&r.mediana>0){
        f.relativo=f.porGrupo/r.mediana;
        if(r.mad>0)f.desviacionRobusta=(f.porGrupo-r.mediana)/(1.4826*r.mad);
      }
    });
    const parejas=new Map();
    for(const respuesta of datos.respuestasAnonimas||[]){
      const validas=[...new Set(respuesta.filter(x=>ids.has(x)))].sort();
      for(let i=0;i<validas.length;i++)for(let j=i+1;j<validas.length;j++){
        const clave=validas[i]+'\u0001'+validas[j];
        parejas.set(clave,(parejas.get(clave)||0)+1);
      }
    }
    return {datos,filas,noVinculadas,parejas:[...parejas].map(([clave,cantidad])=>{
      const [a,b]=clave.split('\u0001');return {a,b,cantidad};
    }).sort((a,b)=>b.cantidad-a.cantidad),referencia};
  }
  /**
   * DEMOSTRACIÓN determinista desde IDs curriculares REALES, con respuestas
   * enteramente ficticias. Nunca se almacena automáticamente al entrar.
   */
  static ejemplo(malla,grupos) {
    const disponibles=new Set(grupos.filter(g=>g.analizable!==false&&g.on!==false).map(g=>g.a));
    const semestres=new Map();
    for(const m of malla.filter(x=>x.idPos)){
      if(!semestres.has(m.s))semestres.set(m.s,[]);
      semestres.get(m.s).push(m);
    }
    const cohortes=[...semestres.values()].map(lista=>lista.sort((a,b)=>
      Number(disponibles.has(b.n))-Number(disponibles.has(a.n))||
      a.n.localeCompare(b.n,'es')).slice(0,6).map(m=>m.idPos)).filter(x=>x.length);
    if(!cohortes.length)return DemandaEstadistica.normalizar({solicitudes:[],simulado:true});
    const respuestasAnonimas=Array.from({length:240},(_,i)=>{
      const sem=cohortes[i%cohortes.length], sig=cohortes[(i+1)%cohortes.length], r=[];
      if(sem[0]&&i%5!==0)r.push(sem[0]);
      if(sem[1]&&i%3!==0)r.push(sem[1]);
      if(sem[2]&&i%4!==0)r.push(sem[2]);
      if(sem[3]&&i%3===0)r.push(sem[3]);
      if(sem[4]&&i%7===0)r.push(sem[4]);
      if(sem[5]&&i%11===0)r.push(sem[5]);
      if(sig[0]&&i%9===0)r.push(sig[0]);
      return [...new Set(r)];
    });
    return DemandaEstadistica.normalizar({
      respuestasAnonimas,simulado:true,fechaEncuesta:'Ejemplo ficticio, sin datos reales'
    });
  }
}
if(typeof module!=='undefined')module.exports={DemandaEstadistica};

/** Página DEM-01. Consume SOLO escenario y selección vigente, sin conversores. */
function pageDemanda() {
  const estado=ui.demanda;
  // Previsualizar sin persistir cuando no existe una encuesta real.
  const vistaEjemplo=!S.demanda||estado.vistaEjemplo===true;
  const base=DemandaEstadistica.analizar(
    vistaEjemplo?DemandaEstadistica.ejemplo(S.malla,S.grupos):S.demanda,S.malla,S.grupos);
  const d=base.datos;
  const filtroSem=x=>!estado.semestre||String(x.semestre)===estado.semestre;
  const visibles=base.filas.filter(x=>pasaFiltros(S.malla.find(m=>m.idPos===x.posicionId))&&filtroSem(x));
  const filas=(estado.sinDato?visibles:visibles.filter(x=>x.solicitudes!=null))
    .sort((a,b)=>(b[estado.orden]??-Infinity)-(a[estado.orden]??-Infinity)||a.nombre.localeCompare(b.nombre,'es'));
  const f=n=>n==null||!Number.isFinite(n)?'—':Number(n).toLocaleString('es-CO',{maximumFractionDigits:2});
  const pct=n=>n==null?'—':(n*100).toLocaleString('es-CO',{maximumFractionDigits:1})+' %';
  const opc=(v,label,activo)=>'<option value="'+esc(v)+'"'+(activo?' selected':'')+'>'+esc(label)+'</option>';
  const seleccionadas=visibles.filter(x=>x.posicionId);
  if(!seleccionadas.some(x=>x.posicionId===estado.seleccion))estado.seleccion=seleccionadas[0]?.posicionId||'';
  const actual=base.filas.find(x=>x.posicionId===estado.seleccion);
  const sol=visibles.reduce((n,x)=>n+(x.solicitudes||0),0);
  const separador='<div class="dem-separador"></div>';
  const metricaMalla=estado.metricaMalla||'porGrupo';
  const opcionesSem=[...new Set(base.filas.map(x=>x.semestre).filter(x=>x!=null))].sort((a,b)=>a-b);
  const puntos=visibles.filter(x=>x.solicitudes!=null&&x.grupos>0);
  const maxX=Math.max(1,...puntos.map(x=>x.grupos));
  const maxY=Math.max(1,...puntos.map(x=>x.solicitudes));
  const puntosSvg=puntos.map(x=>{
    const cx=52+(x.grupos/maxX)*595, cy=225-(x.solicitudes/maxY)*183;
    const id=esc(x.posicionId);
    return '<circle cx="'+cx+'" cy="'+cy+'" r="7" class="dem-punto" tabindex="0" role="button" data-act="dem-sel" data-pos="'+id+'" aria-label="'+esc(x.nombre)+' · '+x.solicitudes+' solicitudes, '+x.grupos+' grupos"><title>'+esc(x.nombre)+' · '+x.solicitudes+' solicitudes / '+x.grupos+' grupos</title></circle>';
  }).join('');
  const svg='<svg class="dem-grafico" viewBox="0 0 690 265" role="img" aria-label="Dispersión de solicitudes frente a número de grupos"><line x1="52" y1="25" x2="52" y2="225" class="dem-eje"/><line x1="52" y1="225" x2="656" y2="225" class="dem-eje"/><text x="55" y="18">Solicitudes ↑</text><text x="650" y="255" text-anchor="end">Grupos ofertados →</text><text x="42" y="226" text-anchor="end">0</text><text x="42" y="45" text-anchor="end">'+maxY+'</text><text x="650" y="243" text-anchor="end">'+maxX+'</text>'+puntosSvg+'</svg>';
  const gruposSem=new Map();
  filas.filter(x=>x.solicitudes!=null).forEach(x=>{
    if(!gruposSem.has(x.semestre))gruposSem.set(x.semestre,[]);
    gruposSem.get(x.semestre).push(x);
  });
  const semHtml=[...gruposSem].sort((a,b)=>a[0]-b[0]).map(([s,xs])=>{
    const max=Math.max(1,...xs.map(x=>x[metricaMalla]??0));
    return '<section class="dem-sem"><h3>Semestre '+esc(s??'Sin semestre')+'</h3>'+xs.map(x=>{
      const valor=x[metricaMalla],ancho=valor==null?0:Math.max(0,valor/max*100);
      return '<button class="dem-mini" data-act="dem-sel" data-pos="'+esc(x.posicionId)+'"><span>'+esc(x.nombre)+'</span><b>'+(valor==null?'—':f(valor)+(metricaMalla==='percentilSemestral'?' %':metricaMalla==='relativo'?'×':''))+'</b><i style="width:'+ancho.toFixed(1)+'%"></i></button>';
    }).join('')+'</section>';
  }).join('');
  const mapa=new Map(base.filas.map(x=>[x.posicionId,x]));
  const parejas=base.parejas.filter(x=>mapa.has(x.a)&&mapa.has(x.b)&&visibles.some(y=>y.posicionId===x.a)&&visibles.some(y=>y.posicionId===x.b)).slice(0,20);
  const tablaParejas=parejas.length?'<div class="dem-pares">'+parejas.map(x=>{
    const a=mapa.get(x.a),b=mapa.get(x.b);
    const par=RV.pairs.find(p=>(p.A===a.nombre&&p.B===b.nombre)||(p.A===b.nombre&&p.B===a.nombre));
    const estadoPar=par?.enRango?(par.clash?'Cruces de horario detectados':'Sin cruce detectado'):'Sin comparación de horarios';
    return '<div class="dem-par"><span>'+esc(a.nombre)+' + '+esc(b.nombre)+'</span><b>'+x.cantidad+' estudiantes</b><small>'+estadoPar+'</small></div>';
  }).join('')+'</div>':'<p class="hint">No hay parejas identificables con los filtros actuales.</p>';
  // Señales derivadas exclusivamente de la encuesta visible; jamás
  // inferencias sobre cupos faltantes, que no conocemos.
  const conocidas=visibles.filter(x=>x.solicitudes!=null);
  const conGrupos=conocidas.filter(x=>x.porGrupo!=null);
  const mayor=[...conocidas].sort((a,b)=>b.solicitudes-a.solicitudes)[0];
  const concentrada=[...conGrupos].sort((a,b)=>b.porGrupo-a.porGrupo)[0];
  const sobresaliente=[...conGrupos].filter(x=>x.relativo>1.5)
    .sort((a,b)=>b.relativo-a.relativo)[0];
  const atipica=[...conGrupos].filter(x=>x.desviacionRobusta>3.5)
    .sort((a,b)=>b.desviacionRobusta-a.desviacionRobusta)[0];
  const conChoque=parejas.map(x=>{
    const a=mapa.get(x.a),b=mapa.get(x.b);
    const choque=RV.pairs.find(p=>(p.A===a.nombre&&p.B===b.nombre)||
      (p.A===b.nombre&&p.B===a.nombre));
    return {a,b,cantidad:x.cantidad,detectado:choque?.enRango&&choque.clash>0};
  }).filter(x=>x.detectado).sort((a,b)=>b.cantidad-a.cantidad)[0];
  const consejos=[];
  if(mayor)consejos.push(['Mayor demanda observada',mayor.nombre+': '+f(mayor.solicitudes)+' solicitudes.']);
  if(concentrada)consejos.push(['Mayor concentración por grupo',
    concentrada.nombre+': '+f(concentrada.porGrupo)+' solicitudes por agrupación ('+
    f(concentrada.grupos)+' agrupaciones registradas).']);
  if(sobresaliente)consejos.push(['Concentración relativa destacada',
    sobresaliente.nombre+': '+f(sobresaliente.relativo)+'× la mediana del semestre, con '+
    sobresaliente.comparables+' asignaturas comparables.']);
  if(atipica)consejos.push(['Posible valor atípico',
    atipica.nombre+': desviación robusta de '+f(atipica.desviacionRobusta)+
    '. Es una señal descriptiva, no evidencia de cupos insuficientes.']);
  if(conChoque)consejos.push(['Co-solicitudes con cruces de horario',
    conChoque.a.nombre+' y '+conChoque.b.nombre+': '+conChoque.cantidad+
    ' estudiantes las solicitaron juntas y se detectaron cruces de horario.']);
  if(d.tasaParticipacion==null)consejos.push(['No extrapolar todavía',
    'Sin porcentaje de participación no se estima la demanda de quienes no respondieron.']);
  const pendientes=visibles.filter(x=>x.solicitudes==null).length;
  if(pendientes)consejos.push(['Cobertura incompleta',
    pendientes+' asignaturas sin solicitud registrada: dato desconocido, no cero.']);
  const recomendaciones='<div class="dem-recomendaciones">'+(consejos.length?consejos.map(([titulo,detalle])=>
    '<article class="dem-consejo"><strong>'+esc(titulo)+'</strong><p>'+esc(detalle)+'</p></article>'
  ).join(''):'<p class="hint">No hay suficiente información para formular recomendaciones.</p>')+'</div>';
  return '<div class="page-title"><div><h1>Demanda de preinscripción</h1><p>Intenciones declaradas, concentración por grupo y comparaciones dentro de cada semestre. No se estiman cupos faltantes ni capacidad de las aulas.</p></div></div>'+
   '<section class="card dem-panel">'+
   (vistaEjemplo?'<div class="note"><b>VISTA PREVIA · DATOS SIMULADOS:</b> puedes explorar resultados y recomendaciones. No se han guardado ni reemplazan tus datos. Pulsa «Guardar ejemplo en escenario» para utilizarlos.</div>':d.simulado?'<div class="note"><b>DATOS SIMULADOS GUARDADOS:</b> no representan solicitudes reales.</div>':'')+
   '<div class="dem-metricas"><div><small>Solicitudes visibles</small><strong>'+f(sol)+'</strong><small>Menciones, no estudiantes únicos</small></div><div><small>Con demanda registrada</small><strong>'+visibles.filter(x=>x.solicitudes!=null).length+'</strong><small>Asignaturas</small></div><div><small>Con índice por grupo</small><strong>'+visibles.filter(x=>x.porGrupo!=null).length+'</strong><small>Asignaturas</small></div><div><small>Respuestas totales</small><strong>'+f(d.respuestasTotales)+'</strong><small>'+pct(d.tasaParticipacion)+' de participación'+(d.tasaParticipacion?' · informada':'')+'</small></div></div>'+
   '<div class="dem-acciones">'+(S.demanda?'<button class="btn sm ghost" data-act="dem-vista">'+(vistaEjemplo?'Volver a mis datos':'Ver ejemplo simulado')+'</button>':'')+'<button class="btn sm" data-act="dem-ejemplo">'+(estado.confirmarEjemplo?'Confirmar reemplazo':'Guardar ejemplo en escenario')+'</button><button class="btn sm" data-act="dem-plantilla">Descargar plantilla JSON</button><button class="btn sm" data-act="dem-import">Cargar demanda JSON</button><button class="btn sm" data-act="dem-export" '+(!S.demanda?'disabled':'')+'>Exportar demanda</button><button class="btn sm ghost" data-act="dem-borrar">'+(estado.confirmarBorrar?'Confirmar borrado':'Limpiar demanda')+'</button><input id="demanda-file" class="sr" type="file" accept=".json,application/json"></div>'+
   '<p class="hint">Una fila mínima contiene posicionId y cantidad. Los totales de encuestados y la tasa de participación son opcionales. Los cambios se incluyen también al pulsar «Guardar» el escenario general.</p>'+
   (base.noVinculadas.length?'<div class="note">Hay '+base.noVinculadas.length+' identificadores de solicitud que no coinciden con la malla actual: '+base.noVinculadas.slice(0,5).map(x=>esc(x.posicionId)).join(', ')+'. Se conservan en el archivo, pero no se atribuyen a otras asignaturas.</div>':'')+
   separador+
   '<h2>Registrar o corregir una solicitud</h2>'+(vistaEjemplo?'<p class="hint">Esta es una vista previa. Para editar, guarda el ejemplo o importa una encuesta.</p>':'')+'<div class="dem-campos"><label>Asignatura<select data-chg="dem-elegir">'+seleccionadas.map(x=>opc(x.posicionId,x.nombre+' (S'+x.semestre+')',x.posicionId===estado.seleccion)).join('')+'</select></label><label>Solicitudes observadas<input id="dem-cantidad" type="number" min="0" step="1" inputmode="numeric" placeholder="Sin información" value="'+(actual?.solicitudes??'')+'"></label><button class="btn" data-act="dem-guardar" '+(!actual||vistaEjemplo||!!S.demanda?.respuestasAnonimas&&!S.demanda?.simulado?'disabled':'')+'>Guardar cantidad</button><button class="btn sm ghost" data-act="dem-quitar" '+(!actual||vistaEjemplo||actual.solicitudes==null||!!S.demanda?.respuestasAnonimas&&!S.demanda?.simulado?'disabled':'')+'>Marcar desconocido</button></div>'+
   '<p class="hint">El valor 0 significa que se confirmó ninguna solicitud; dejarlo sin información significa dato desconocido.</p>'+
   separador+
   '<div class="dem-campos"><label>Ordenar por<select data-chg="dem-orden">'+[['porGrupo','Solicitudes por grupo'],['solicitudes','Demanda absoluta'],['relativo','Índice relativo semestral'],['frecuencia','Frecuencia entre encuestados']].map(([k,v])=>opc(k,v,k===estado.orden)).join('')+'</select></label><label>Semestre<select data-chg="dem-semestre">'+opc('','Todos',!estado.semestre)+opcionesSem.map(s=>opc(s,'Semestre '+s,String(s)===estado.semestre)).join('')+'</select></label><label class="dem-check"><input type="checkbox" data-chg="dem-sindato" '+(estado.sinDato?'checked':'')+'> Mostrar sin encuesta</label></div>'+
   '<h2>Ranking de demanda</h2><div class="dem-tabla-wrap"><table class="dem-tabla"><thead><tr><th>Asignatura</th><th>Solicitudes</th><th>Grupos</th><th>Sol./grupo</th><th>Rel. sem.</th><th>Percentil sem.</th><th>Frecuencia</th></tr></thead><tbody>'+filas.map(x=>'<tr><td><button class="dem-enlace" data-act="dem-sel" data-pos="'+esc(x.posicionId||'')+'">'+esc(x.nombre)+'</button><small>S'+esc(x.semestre??'—')+'</small></td><td>'+f(x.solicitudes)+'</td><td>'+f(x.grupos)+'</td><td>'+f(x.porGrupo)+'</td><td>'+f(x.relativo)+(x.relativo==null?'':'×')+'</td><td>'+pct(x.percentilSemestral==null?null:x.percentilSemestral/100)+'</td><td>'+pct(x.frecuencia)+'</td></tr>').join('')+'</tbody></table></div>'+
   (!filas.length?'<p class="hint">No hay solicitudes registradas para los filtros actuales. Carga un JSON o activa el ejemplo.</p>':'')+
   '<p class="hint">«Rel. sem.» divide solicitudes por grupo entre la mediana del mismo semestre (mínimo tres asignaturas con datos y mediana positiva). No equivale a escasez o cupos insuficientes.</p>'+
   separador+'<h2>Solicitudes y alternativas ofertadas</h2>'+svg+
   '<p class="hint">Cada punto corresponde a una asignatura con solicitudes y grupos analizables registrados. Pulsa un punto para seleccionarla. No se representan cupos.</p>'+
   separador+'<div class="dem-campos"><h2 style="flex:1">Comparación curricular por semestre</h2><label>Intensidad según<select data-chg="dem-mapa">'+[['porGrupo','Solicitudes por grupo'],['solicitudes','Solicitudes observadas'],['relativo','Índice relativo'],['percentilSemestral','Percentil del semestre']].map(([k,v])=>opc(k,v,k===metricaMalla)).join('')+'</select></label></div><div class="dem-sems">'+(semHtml||'<p class="hint">Sin asignaturas para comparar.</p>')+'</div>'+
   separador+'<h2>Detalle estadístico</h2>'+(actual?'<div class="dem-detalle"><strong>'+esc(actual.nombre)+'</strong><p>Solicitudes: '+f(actual.solicitudes)+' · grupos analizables: '+f(actual.grupos)+' · solicitudes por grupo: '+f(actual.porGrupo)+'</p><p>Referencia semestral: '+f(base.referencia.get(actual.semestre)?.mediana)+' · comparables: '+actual.comparables+' · índice relativo: '+f(actual.relativo)+(actual.relativo!=null?'×':'')+' · percentil semestral: '+pct(actual.percentilSemestral==null?null:actual.percentilSemestral/100)+'</p><p>Frecuencia: '+pct(actual.frecuencia)+' · extrapolación condicionada: '+f(actual.proyeccion)+' · desviación robusta: '+f(actual.desviacionRobusta)+'</p><small>La extrapolación solo aparece con tasa de participación declarada; la desviación robusta requiere al menos cinco comparables y dispersión no nula. Ninguna demuestra déficit de cupos.</small></div>':'<p class="hint">Selecciona una asignatura para consultar sus cálculos.</p>')+
   separador+'<h2>Lectura y recomendaciones basadas en los datos</h2><p class="hint">Son señales descriptivas, no diagnósticos de cupos faltantes. Respetan los filtros vigentes.</p>'+recomendaciones+
   separador+'<h2>Demanda conjunta</h2>'+(d.respuestasAnonimas?'<p class="hint">Las parejas se construyen desde listas anónimas de asignaturas solicitadas. «Sin cruce detectado» solo describe los grupos analizables disponibles.</p>'+tablaParejas:'<p class="hint">No calculable con totales agregados. Si existen respuestas anónimas por estudiante, pueden cargarse como listas de identificadores en el mismo JSON.</p>')+
   '</section>';
}
