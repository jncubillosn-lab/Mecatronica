'use strict';
// Contrato académico ARQ-01: node tests/contrato-arq01.js
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { EntradaAcademica } = require('../js/entrada.js');

const datos = JSON.parse(fs.readFileSync(path.join(__dirname,'../datos/academico.json'),'utf8'));
function probar(nombre, fn) { fn(); console.log('OK '+nombre); }

probar('Una entrada con estructura y versión conocidas', () => {
  assert.equal(datos.versionEsquema,1);
  for(const clave of ['programa','componentes','catalogo','malla','requisitos','oferta','agrupaciones','configuracion','procedencia'])
    assert(Object.hasOwn(datos,clave),'Falta '+clave);
  assert(datos.programa.id);
  const html=fs.readFileSync(path.join(__dirname,'../index.html'),'utf8');
  assert(html.includes('js/iniciar.js'));
  assert(html.includes('js/analisis.js'),'El motor debe cargarse antes de iniciar');
  assert(html.includes('js/vistas.js'),'Las vistas deben cargarse antes de iniciar');
  const inicio=fs.readFileSync(path.join(__dirname,'../js/iniciar.js'),'utf8');
  assert(!inicio.includes('window.RAW ='),'No se debe publicar RAW como contexto global');
  assert(inicio.includes('window.CONTEXTO_ACADEMICO'),'Se requiere el escenario base explícito');
  assert(!html.includes('src="js/datos.js'));
  assert(!html.includes('src="js/catalogo.js'));
  assert(!html.includes('src="js/oferta-fuente.js'));
});

probar('Códigos, posiciones y agrupaciones sin identidades duplicadas', () => {
  const unico=(a,n)=>assert.equal(new Set(a).size,a.length,n);
  unico(datos.catalogo.map(x=>x.codigo),'Catálogo');
  unico(datos.malla.map(x=>x.id),'Malla');
  unico(datos.agrupaciones.map(x=>x.id),'Agrupaciones');
  const codigos=new Set(datos.catalogo.map(x=>x.codigo));
  const posiciones=new Set(datos.malla.map(x=>x.id));
  for(const p of datos.malla){
    assert(p.nombre);
    if(p.codigoAsignatura!==null)assert(codigos.has(p.codigoAsignatura),'Referencia '+p.id);
  }
  for(const g of datos.agrupaciones){
    assert(posiciones.has(g.posicionId),'Grupo sin posición');
    assert(g.componentes.length>0);
  }
});

probar('Las relaciones del plan no se convierten en reglas del algoritmo', () => {
  const posiciones=new Set(datos.malla.map(x=>x.id));
  const componentes=new Set(datos.componentes.map(x=>x.id));
  for(const p of datos.requisitos.prerrequisitos){
    assert(posiciones.has(p.desde)&&posiciones.has(p.hasta));
  }
  for(const r of datos.requisitos.minimosCreditos){
    assert(posiciones.has(r.destino));
    assert(Number.isFinite(r.minimo));
    assert(r.componentes.every(x=>componentes.has(x)));
  }
});

probar('Oferta con grupos sin horarios y metadatos incompletos es válida', () => {
  const ofertas=datos.oferta.flatMap(o=>o.actividades.flatMap(a=>a.grupos));
  assert(ofertas.length>0);
  for(const g of ofertas){
    assert(Array.isArray(g.horarios));
    assert(g.cuposDisponibles===null||Number.isFinite(g.cuposDisponibles));
  }
  assert(ofertas.some(g=>g.horarios.length===0));
  assert(ofertas.some(g=>g.cuposDisponibles===0));
  assert(datos.malla.some(p=>p.codigoAsignatura===null));
});

probar('Toda actividad única vinculada con grupos queda cubierta', () => {
  const ofertadas=new Map(datos.oferta.map(x=>[x.codigoAsignatura,x]));
  const groups=new Set(datos.agrupaciones.map(x=>x.posicionId+'\u0001'+x.etiqueta));
  for(const pos of datos.malla){
    const oferta=ofertadas.get(pos.codigoAsignatura);
    if(!oferta||oferta.actividades.length!==1)continue;
    for(const g of oferta.actividades[0].grupos){
      assert(groups.has(pos.id+'\u0001G'+g.id),'Grupo sin agrupación: '+pos.nombre+' G'+g.id);
    }
  }
  const excluidas=new Set(datos.exclusionesAgrupacion.map(x=>x.posicionId));
  const activas=new Set(datos.agrupaciones.map(x=>x.posicionId));
  for(const p of datos.malla){
    const o=ofertadas.get(p.codigoAsignatura);
    if(o?.actividades.length>1 && o.actividades.some(a=>a.grupos.length)){
      assert(activas.has(p.id)||excluidas.has(p.id),'Falta justificar agrupación: '+p.nombre);
    }
  }
});

probar('El lector genera el escenario y conserva grupos sin horarios', () => {
  const out=new EntradaAcademica(datos).generarEscenarioBase();
  const posConGrupos=new Set(datos.agrupaciones.map(x=>x.posicionId));
  assert.equal(out.asg.length,posConGrupos.size);
  assert.equal(out.gr.length,datos.agrupaciones.length);
  assert.equal(new Set(out.bl.map(b=>b[6])).size,out.bl.length);
  assert.equal(new Set(out.bl.map(b=>EntradaAcademica.idNumerico(b[6]))).size,out.bl.length);
  assert(out.gr.some(g=>!out.bl.some(b=>b[0]===g[0]&&(b[1]===g[2]||b[1]===g[3]))));
});

probar('Un plan pequeño y parcialmente vacío también se puede abrir', () => {
  const minimo={
    versionEsquema:1,programa:{id:'ejemplo',nombre:'Otro plan'},
    componentes:[{id:'X',nombre:'Otra categoría',enPlan:true}],
    catalogo:[],malla:[{id:'p1',nombre:'Curso',semestre:1,creditos:null,componente:'X',caracter:''}],
    requisitos:{prerrequisitos:[],minimosCreditos:[]},oferta:[],agrupaciones:[],
    configuracion:{calendario:{dias:[],horaInicio:8,horaFin:10},opciones:{distanciasIniciales:[0],componentesComparables:['X']}}
  };
  const data=new EntradaAcademica(minimo).generarEscenarioBase();
  assert.equal(data.malla.length,1);
  assert.equal(data.malla[0][3],null);
  assert.deepEqual(data.asg,[]);
  assert.deepEqual(data.bl,[]);
});


probar('Grupos de otras sedes: se conservan sin ser analizables', () => {
  const especiales=datos.agrupaciones.filter(g=>g.analizable===false);
  const calculables=datos.agrupaciones.filter(g=>g.analizable!==false);
  assert.equal(datos.agrupaciones.length,432);
  assert.equal(especiales.length,79);
  assert.equal(calculables.length,353);
  const catalogo=new Map(datos.malla.map(p=>[p.id,p]));
  const oferta=new Map(datos.oferta.map(o=>[o.codigoAsignatura,o]));
  for(const g of especiales){
    assert(/^G(?:ORIN|SUMA|TUMA|AMAZ|CARI)-/.test(g.etiqueta),'Sin respaldo del criterio de otra sede: '+g.id);
    const codigo=catalogo.get(g.posicionId)?.codigoAsignatura;
    const original=oferta.get(codigo);
    assert(original?.actividades.some(a=>a.grupos.some(x=>x.id===g.etiqueta.slice(1))),
      'Grupo informativo sin registro de oferta: '+g.id);
  }
  const base=new EntradaAcademica(datos).generarEscenarioBase();
  assert.equal(base.gr.length,432);
  assert.equal(base.gr.filter(g=>g[5]===false).length,79);
  assert.equal(base.bl.length,864);
});

probar('TPI conserva una única referencia académica de lunes y miércoles de 14 a 16', () => {
  const pos=datos.malla.find(p=>p.codigoAsignatura==='2024045');
  const oferta=datos.oferta.find(o=>o.codigoAsignatura==='2024045');
  const grupos=oferta.actividades.flatMap(a=>a.grupos);
  const agrupaciones=datos.agrupaciones.filter(a=>a.posicionId===pos.id);
  const esperado=[{dia:'L',inicio:'14:00',fin:'16:00'},{dia:'X',inicio:'14:00',fin:'16:00'}];
  assert.deepEqual(grupos.map(g=>g.id),['1']);
  assert.deepEqual(grupos[0].horarios,esperado);
  assert.deepEqual(agrupaciones.map(a=>a.etiqueta),['G1']);
  assert.deepEqual(agrupaciones[0].componentes.flatMap(c=>c.bloques).map(b=>({dia:b.dia,inicio:b.inicio,fin:b.fin})),esperado);
});

probar('Horarios técnicamente inválidos no se descartan silenciosamente', () => {
  const copia=JSON.parse(JSON.stringify(datos));
  copia.agrupaciones[0].componentes[0].bloques[0].fin='01:00';
  assert.throws(()=>new EntradaAcademica(copia).generarEscenarioBase(),/Bloque horario inválido/);
  copia.agrupaciones[0].componentes=[];
  assert.throws(()=>new EntradaAcademica(copia).generarEscenarioBase(),/sin componentes/);
});

probar('No se pierden requisitos académicos ante referencias rotas', () => {
  const copia=JSON.parse(JSON.stringify(datos));
  assert(copia.requisitos.prerrequisitos.length>0);
  assert(copia.requisitos.minimosCreditos.length>0);
  const lector=new EntradaAcademica(copia);
  assert.equal(lector.generarEscenarioBase().pre.length,copia.requisitos.prerrequisitos.length);
  assert.equal(lector.generarEscenarioBase().reqCred.length,copia.requisitos.minimosCreditos.length);
  copia.requisitos.prerrequisitos[0].desde='posicion-inexistente';
  assert.throws(()=>lector.generarEscenarioBase(),/Referencia de requisito académico inválida/);
  copia.requisitos.prerrequisitos[0].desde=datos.requisitos.prerrequisitos[0].desde;
  copia.requisitos.prerrequisitos[0].hasta='posicion-inexistente';
  assert.throws(()=>lector.generarEscenarioBase(),/Referencia de requisito académico inválida/);
  copia.requisitos.prerrequisitos[0].hasta=datos.requisitos.prerrequisitos[0].hasta;
  copia.requisitos.minimosCreditos[0].destino='posicion-inexistente';
  assert.throws(()=>lector.generarEscenarioBase(),/Referencia de requisito académico inválida/);
});


probar('Las referencias de requisitos llegan al escenario junto con sus IDs',()=>{
  const base=new EntradaAcademica(datos).generarEscenarioBase();
  assert.equal(base.pre.length,datos.requisitos.prerrequisitos.length);
  assert.equal(base.reqCred.length,datos.requisitos.minimosCreditos.length);
  for(let i=0;i<base.pre.length;i++){
    assert.equal(base.pre[i][3],datos.requisitos.prerrequisitos[i].desde);
    assert.equal(base.pre[i][4],datos.requisitos.prerrequisitos[i].hasta);
  }
  for(let i=0;i<base.reqCred.length;i++){
    assert.equal(base.reqCred[i][3],datos.requisitos.minimosCreditos[i].destino);
  }
});

console.log('Contrato de entrada académica: comprobaciones finalizadas.');
