'use strict';
// DEM-01: datos faltantes, comparación relativa, respuestas anónimas y persistencia.
const assert=require('node:assert/strict');
const {DemandaEstadistica:D}=require('../js/demanda.js');
const {EscenarioPersonal:E}=require('../js/escenarios.js');
const malla=['A','B','C','D','E'].map((id,i)=>({
  n:id,idPos:'pos-'+id,s:i<4?4:8,comp:'B',car:'obligatoria',cr:3,nota:'',unidad:''
}));
const grupos=[
 {a:'A',g:'G1',ref:'a1',on:true,analizable:true},
 {a:'A',g:'G2',ref:'a2',on:true,analizable:true},
 {a:'A',g:'G2',ref:'a2',on:true,analizable:true},
 {a:'B',g:'G1',ref:'b1',on:true,analizable:true},
 {a:'B',g:'G2',ref:'b2',on:true,analizable:false},
 {a:'C',g:'G1',ref:'c1',on:true,analizable:true},
 {a:'C',g:'G2',ref:'c2',on:false,analizable:true}
];
const base={params:{dists:[0],indirect:0},malla,grupos,
  reqCred:[],pre:[],asg:['A','B','C','D'],bloques:[],
  tipos:{componentes:[{id:'B',nombre:'Fundamentación'}],caracteres:[]}};
const encuesta=D.normalizar({solicitudes:[
  {posicionId:'pos-A',cantidad:28},
  {posicionId:'pos-B',cantidad:19},
  {posicionId:'pos-C',cantidad:0},
  {posicionId:'pos-D',cantidad:8},
  {posicionId:'pos-X',cantidad:3}
]});
const analisis=D.analizar(encuesta,malla,grupos);
const ver=id=>analisis.filas.find(x=>x.posicionId==='pos-'+id);
assert.equal(ver('A').grupos,2,'Un grupo no se duplica por componentes o entradas repetidas');
assert.equal(ver('B').grupos,1,'Un grupo informativo de otra sede no cuenta');
assert.equal(ver('C').grupos,1,'Un grupo desactivado no cuenta');
assert.equal(ver('D').grupos,null,'Sin agrupación analizable no se inventa grupo');
assert.equal(ver('A').porGrupo,14);
assert.equal(ver('B').porGrupo,19);
assert.equal(ver('C').porGrupo,0,'Cero conocido no es dato desconocido');
assert.equal(ver('D').porGrupo,null,'Cero grupos no se divide ni se extrapola');
assert.equal(ver('E').solicitudes,null,'Sin registro no significa cero solicitudes');
assert.equal(ver('A').relativo,14/14,'Mediana de 14,19,0');
assert.equal(ver('C').relativo,0);
assert.equal(ver('A').frecuencia,null);
assert.equal(ver('A').proyeccion,null);
assert.deepEqual(analisis.noVinculadas.map(x=>x.posicionId),['pos-X']);
const f=D.analizar({solicitudes:[{posicionId:'pos-A',cantidad:28}],
  respuestasTotales:40,tasaParticipacion:0.2},malla,grupos).filas[0];
assert.equal(f.frecuencia,.7);
assert.equal(f.proyeccion,140);
const duo=D.normalizar({respuestasAnonimas:[
 ['pos-A','pos-B','pos-A'],['pos-A','pos-C'],['pos-B'],[]
]});
assert.equal(duo.respuestasTotales,4);
assert.equal(duo.solicitudes.find(x=>x.posicionId==='pos-A').cantidad,2);
const parejas=D.analizar(duo,malla,grupos).parejas;
assert.equal(parejas.find(x=>x.a==='pos-A'&&x.b==='pos-B').cantidad,1);
assert.throws(()=>D.normalizar({solicitudes:[{posicionId:'pos-A',cantidad:1},{posicionId:'pos-A',cantidad:2}]}),/duplicada/);
assert.throws(()=>D.normalizar({solicitudes:[{posicionId:'pos-A',cantidad:-1}]}),/inválida/);
assert.throws(()=>D.normalizar({solicitudes:[{posicionId:'pos-A',cantidad:41}],respuestasTotales:40}),/incompatible/);
assert.throws(()=>D.normalizar({solicitudes:[],tasaParticipacion:0}),/Participación/);
assert.throws(()=>D.normalizar({solicitudes:[{posicionId:'pos-A',cantidad:4}],respuestasAnonimas:[['pos-B']]}),/no coinciden/);
const escenario=E.copia(base);escenario.demanda=encuesta;
const delta=E.empaquetar(base,escenario);
const restaurado=E.aplicar(base,JSON.parse(JSON.stringify(delta)).cambios);
assert.deepEqual(restaurado.demanda,encuesta,'Importación y exportación conservan la encuesta');
assert.equal(E.aplicar(base,{}).demanda,undefined,'Escenarios previos sin demanda siguen válidos');
const err=E.copia(restaurado);err.demanda.solicitudes[0].cantidad=-2;
assert.throws(()=>E.validarEstado(err,{ids:()=>['L'],inicio:6,fin:22}),/demanda inválida|Solicitud de demanda inválida/);
const demo=D.ejemplo(malla,grupos);
assert(demo.simulado&&demo.solicitudes.length>0,'Los datos de demostración siempre están etiquetados');
console.log('OK: DEM-01, estadística y persistencia con ausencias y respuestas anónimas.');
