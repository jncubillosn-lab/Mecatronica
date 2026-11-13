'use strict';

/** RF-08/RF-10/RC-01/RC-03: información parcial visible e importación aislada y atómica. */
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const raiz=path.resolve(__dirname,'..'),leer=p=>fs.readFileSync(path.join(raiz,p),'utf8');
const programas=require('../js/programas.js');
const {EntradaAcademica}=require('../js/entrada.js');
const {EscenarioPersonal}=require('../js/escenarios.js');
const fuente=id=>JSON.parse(leer(programas.fuentePara(id)));
const codigo=['js/modelo.js','js/entrada.js','js/escenarios.js','js/analisis.js','js/demanda.js','js/vistas.js']
  .map(leer).join('\n')+'\nwindow.CONTEXTO_ACADEMICO={estadoBase:fromRaw(RAW),opciones:RAW.opciones,programa:RAW.programa,calendario:RAW.calendario,almacenamiento:RAW.almacenamiento,metadatos:RAW.metadatos};\n'+
  leer('js/app.js').split("document.addEventListener('click'")[0];
function abrir(id,guardado=null){
  const escrituras=[],avisos=[];
  class Lector {readAsText(f){this.result=f.texto;this.onload();}}
  const api=new Function('RAW','window','localStorage','document','FileReader','avisos',codigo+
    '\nrender=()=>{};toast=m=>avisos.push(m);return {S,S0,ui,onAct,onChange,esc,pageMalla,pageDemanda,renderTop,mallaVisible,pasaFiltros,CALENDARIO,compute,PlanCurricular,getS:()=>S,getVista:()=>RV};')(
    new EntradaAcademica(fuente(id)).generarEscenarioBase(),{innerWidth:1200,ProgramasUniversitarios:programas},
    {getItem:()=>guardado&&JSON.stringify(guardado),setItem:(k,v)=>escrituras.push([k,v]),removeItem(){}},{},Lector,avisos);
  return Object.assign(api,{escrituras,avisos});
}
function importar(api,archivo){api.onChange('import-file',{files:[{texto:JSON.stringify(archivo)}],value:'archivo.json'});}
function probar(n,fn){fn();console.log('OK '+n);}

probar('Las posiciones sin clasificación siguen consultables en las nueve carreras',()=>{
  let comprobadas=0;
  for(const id of Object.keys(programas.fuentes)){
    const api=abrir(id),antes=JSON.stringify([api.S,api.S0]),sinTipo=api.S.malla.filter(m=>!m.comp&&m.s>0);
    api.onAct('filtro-reset',{},null,{});
    const html=api.pageMalla();
    for(const m of sinTipo){
      assert(api.mallaVisible(m));
      assert(html.includes('data-n="'+api.esc(m.n)+'"'),id+': '+m.n);
      assert.equal(m.comp,'','No se completa la clasificación académica');
      comprobadas++;
    }
    if(sinTipo.length){
      assert(api.renderTop().includes('data-comp=""'));
      api.ui.malla.sel=sinTipo[0].n;
      assert(api.pageMalla().includes('<option value="" selected disabled>Sin clasificar</option>'),
        'El editor no aparenta asignar el primer componente a una posición desconocida');
      api.onAct('comp-toggle',{comp:''},null,{});
      assert(sinTipo.every(m=>!api.mallaVisible(m)));
      api.onAct('filtro-reset',{},null,{});
      assert(sinTipo.every(m=>api.mallaVisible(m)));
    }
    assert.equal(JSON.stringify([api.S,api.S0]),antes);
    // El semestre 0 sigue fuera de la malla, según decisión expresa.
    for(const m of api.S.malla.filter(m=>m.s===0))
      assert(!api.pageMalla().includes('data-n="'+api.esc(m.n)+'"'));
  }
  assert.equal(comprobadas,58);
});

probar('La selección sin clasificar se comparte con demanda y no cambia cálculos completos',()=>{
  const api=abrir('mecanica'),m=api.S.malla.find(m=>!m.comp&&m.s>0);
  api.S.demanda={tipo:'demanda-preinscripcion',version:1,solicitudes:[{posicionId:m.idPos,cantidad:8}]};
  const antes=JSON.stringify(api.compute(api.S));
  assert(api.pageDemanda().includes(api.esc(m.n)));
  api.onAct('comp-toggle',{comp:''},null,{});
  assert(!api.pageDemanda().includes('data-pos="'+m.idPos+'"'));
  assert.equal(JSON.stringify(api.compute(api.S)),antes);
});

probar('Los archivos identifican programa y una importación ajena no altera ni guarda S',()=>{
  const origen=abrir('mecatronica'),destino=abrir('agricola');
  origen.S.malla.find(m=>m.n==='Dibujo básico').cr=17;
  const archivo=EscenarioPersonal.empaquetar(origen.S0,origen.S);
  assert.equal(archivo.programaId,'mecatronica');
  const antes=JSON.stringify(destino.S);
  importar(destino,archivo);
  assert.equal(JSON.stringify(destino.getS()),antes);
  assert.equal(destino.escrituras.length,0);
  assert(destino.avisos.length>0);
  delete archivo.programaId;
  importar(destino,archivo);
  assert.equal(JSON.stringify(destino.getS()),antes,'Los IDs de otro programa no se sustituyen por nombres');
  assert.equal(destino.escrituras.length,0);
});

probar('Los escenarios vigentes del mismo programa conservan identidad, diferencias y vacíos',()=>{
  const api=abrir('mecatronica');
  api.S.malla[0].s=null;api.S.malla[0].cr=null;api.S.malla[0].comp=null;
  const archivo=EscenarioPersonal.empaquetar(api.S0,api.S),destino=abrir('mecatronica');
  importar(destino,archivo);
  assert.equal(destino.getS().malla[0].cr,null);
  assert.equal(destino.getS().malla[0].s,null);
  assert.equal(destino.getS().malla[0].comp,null);
  assert(destino.pasaFiltros(destino.getS().malla[0]));
  assert.equal((destino.pageMalla().match(/class="mcol"/g)||[]).length,10);
  assert.equal(destino.escrituras.length,1);
  delete archivo.programaId;
  const recuperado=EscenarioPersonal.recuperar(api.S0,archivo,api.CALENDARIO);
  assert.equal(recuperado.malla[0].cr,null,'Se conserva el formato version:1 identificado por sus IDs');
  const local=abrir('mecatronica',archivo);
  assert.equal(local.getS().malla[0].cr,null);
});

probar('Un semestre de texto se rechaza antes de sustituir S y la malla válida permanece completa',()=>{
  const api=abrir('mecatronica'),archivo=EscenarioPersonal.empaquetar(api.S0,api.S);
  archivo.cambios.malla=[{posicionId:api.S.malla[0].idPos,nombre:api.S.malla[0].n,valores:{s:'texto'}}];
  const antes=JSON.stringify(api.S);
  importar(api,archivo);
  assert.equal(JSON.stringify(api.getS()),antes);
  assert.equal(api.escrituras.length,0);
  assert.equal((api.pageMalla().match(/class="mcol"/g)||[]).length,10);
  const defectuoso=EscenarioPersonal.copia(api.S);defectuoso.malla[0].s='texto';
  assert.equal(new api.PlanCurricular(defectuoso).maxSemestre(),10,
    'El cálculo de geometría también aísla un valor no utilizable');
});

probar('La validación cubre los datos consumidos sin activar grupos de otras sedes',()=>{
  const api=abrir('mecatronica');
  for(const alterar of [
    s=>{s.malla[0].cr=-1;},s=>{s.params.dists=['texto'];},
    s=>{s.grupos[0].g={};},s=>{s.tipos.componentes='texto';},
    s=>{s.pre.push({r:'Ausente',t:s.malla[0].n,rId:'inexistente',tId:s.malla[0].idPos});}
  ]){
    const s=EscenarioPersonal.copia(api.S);alterar(s);
    assert.throws(()=>EscenarioPersonal.validarEstado(s,api.CALENDARIO));
  }
  const especial=api.S.grupos.find(g=>g.analizable===false);
  const cambios={grupos:{modificar:[{key:EscenarioPersonal.claveGrupo(especial),valores:{analizable:true}}]}};
  assert.throws(()=>EscenarioPersonal.aplicar(api.S0,cambios),/no editables/);
  const antes=api.compute(api.S0);
  const soloInformativos=EscenarioPersonal.copia(api.S0);soloInformativos.grupos.forEach(g=>{g.on=g.analizable===false;});
  assert.equal(api.compute(soloInformativos).totalClash,0);
  assert.equal(api.compute(api.S0).totalClash,antes.totalClash);
});

console.log('OK: frontera de escenarios, consulta incompleta y exclusiones conservadas.');
