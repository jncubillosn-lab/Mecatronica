'use strict';
const assert=require('node:assert/strict');
const {evaluarRamas}=require('../scripts/mantenimiento-github.js');
const repo='jncubillosn-lab/Mecatronica';
const ramas=[
 {name:'main',protected:false,commit:{sha:'b'}},
 {name:'trabajo-abierto',commit:{sha:'c'}},
 {name:'fusionada',commit:{sha:'d'}},
 {name:'sin-pr',commit:{sha:'e'}},
 {name:'cerrada-sin-fusion',commit:{sha:'f'}}
];
const pr=(name,sha,opts={})=>({
 head:{ref:name,sha,repo:{full_name:repo}},base:{ref:'main'},
 state:opts.state||'closed',merged_at:opts.merged?'2026-11-09':null
});
const resultado=evaluarRamas(ramas,[
 pr('trabajo-abierto','c',{state:'open'}),
 pr('fusionada','d',{merged:true}),
 pr('cerrada-sin-fusion','f')
],repo);
assert.deepEqual(resultado.avisos.map(x=>x.id).sort(),
 ['MAIN_SIN_PROTECCION','RAMA_SIN_FUSION','RAMA_SIN_PR'].sort());
assert.equal(resultado.informativos.length,2);
assert.equal(evaluarRamas([{name:'main',protected:true}],[],repo).avisos.length,0);
console.log('OK: revisión remota preserva PR abiertas y detecta riesgos de mantenimiento.');
