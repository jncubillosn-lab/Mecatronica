'use strict';
const assert=require('node:assert/strict');
const {planificar}=require('../scripts/limpiar-ramas-fusionadas.js');
const repo='jncubillosn-lab/Mecatronica';
const ramas=[
  {name:'main',commit:{sha:'m'}},
  {name:'fusionada',commit:{sha:'a'}},
  {name:'modificada',commit:{sha:'c'}},
  {name:'sin-pr',commit:{sha:'d'}},
  {name:'abierta',commit:{sha:'e'}},
  {name:'fork',commit:{sha:'f'}},
  {name:'otra-base',commit:{sha:'g'}},
  {name:'protegida',protected:true,commit:{sha:'h'}}
];
const pr=(n,ref,sha,opts={})=>({
  number:n,merged_at:opts.abierta?null:'2026-11-09',
  base:{ref:opts.base||'main'},
  head:{ref,sha,repo:{full_name:opts.repo||repo}}
});
const prs=[
  pr(1,'fusionada','a'),
  pr(2,'modificada','b'),
  pr(3,'abierta','e',{abierta:true}),
  pr(4,'fork','f',{repo:'otro/repo'}),
  pr(5,'otra-base','g',{base:'desarrollo'}),
  pr(6,'protegida','h'),
  pr(7,'main','m'),
  pr(8,'fusionada','a')
];
assert.deepEqual(planificar(ramas,prs,repo),[
  {name:'fusionada',sha:'a',pr:8}
]);
assert.deepEqual(planificar(ramas,[],repo),[]);
assert.deepEqual(planificar([],prs,repo),[]);
console.log('OK: limpieza solo admite ramas fusionadas, no modificadas y sin protección.');
