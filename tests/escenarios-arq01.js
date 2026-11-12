'use strict';
// Escenarios personales vigentes: nodos, requisitos y modificaciones por ID.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { EntradaAcademica } = require('../js/entrada.js');
const { EscenarioPersonal } = require('../js/escenarios.js');
const raiz=path.join(__dirname,'..');
const leer=p=>fs.readFileSync(path.join(raiz,p),'utf8');
const contrato=JSON.parse(leer('datos/programas/mecatronica/academico.json'));
const raw=new EntradaAcademica(contrato).generarEscenarioBase();
const modulo=new Function('RAW',leer('js/modelo.js')+'\n'+leer('js/entrada.js')+'\n'+
  leer('js/analisis.js')+'\nreturn {fromRaw,compute}')(raw);
const base=modulo.fromRaw(raw);
const copiar=EscenarioPersonal.copia;
function probar(nombre,trabajo){trabajo();console.log('OK '+nombre);}

probar('Escenario sin modificaciones produce diferencias vacías',()=>{
 const patch=EscenarioPersonal.empaquetar(base,base);
 const nuevo=EscenarioPersonal.aplicar(base,patch.cambios);
 assert.deepEqual(nuevo,base);
 assert.equal(patch.tipo,'escenario-personal');
 assert(JSON.stringify(patch).length<JSON.stringify(base).length);
});

probar('Ediciones personales se guardan, recuperan y no modifican la referencia',()=>{
 const s=copiar(base),original=copiar(base);
 const grupo=s.grupos[0];s.grupos.splice(0,1);
 s.bloques=s.bloques.filter(b=>!(b.a===grupo.a&&b.c===grupo.c1));
 const movido=s.bloques.find(b=>b.ref);
 movido.d='V';movido.s=17;movido.e=19;
 s.malla[0].s=s.malla[0].s+1;
 s.asg.pop();
 const p=s.pre.pop();
 const patch=EscenarioPersonal.empaquetar(base,s);
 const reconstructed=EscenarioPersonal.aplicar(base,patch.cambios);
 assert(!reconstructed.grupos.some(g=>g.a===grupo.a&&g.g===grupo.g));
 assert(reconstructed.bloques.some(b=>b.ref===movido.ref&&b.s===17&&b.d==='V'));
 assert.equal(reconstructed.malla[0].s,s.malla[0].s);
 assert.equal(reconstructed.asg.length,s.asg.length);
 assert.equal(reconstructed.pre.length,s.pre.length);
 assert.deepEqual(base,original);
});

probar('Referencia ampliada se combina con cambios personales sin borrarlos',()=>{
 const s=copiar(base);
 const quitado=s.grupos[0];s.grupos.splice(0,1);
 const patch=EscenarioPersonal.empaquetar(base,s);
 const d=copiar(contrato),ejemplo=d.agrupaciones[0];
 d.agrupaciones.push({
   id:ejemplo.posicionId+'|G-OTRA',posicionId:ejemplo.posicionId,
   etiqueta:'G-OTRA',componentes:[{id:'G-OTRA',bloques:[]}],
   procedencia:'oferta-actividad-unica'
 });
 const nuevoRaw=new EntradaAcademica(d).generarEscenarioBase();
 const actualizado=EscenarioPersonal.aplicar(modulo.fromRaw(nuevoRaw),patch.cambios);
 assert(actualizado.grupos.some(g=>g.g==='G-OTRA'));
 assert(!actualizado.grupos.some(g=>g.a===quitado.a&&g.g===quitado.g));
});

probar('Grupo académico nuevo coincide con grupo personal sin duplicarlo',()=>{
  const s=copiar(base),g=s.grupos[0];
  const personal={a:g.a,g:'GPRUEBA-REFERENCIA',c1:'GPRUEBA-REFERENCIA',c2:'',on:false,ref:null};
  s.grupos.push(personal);
  const cambios=EscenarioPersonal.diferencias(base,s);
  const d=copiar(contrato);
  const pos=d.malla.find(p=>p.nombre===g.a);
  d.agrupaciones.push({id:pos.id+'|GPRUEBA-REFERENCIA',posicionId:pos.id,
    etiqueta:'GPRUEBA-REFERENCIA',componentes:[{id:'GPRUEBA-REFERENCIA',bloques:[]}],
    procedencia:'oferta-actividad-unica'});
  const actualizado=EscenarioPersonal.aplicar(modulo.fromRaw(new EntradaAcademica(d).generarEscenarioBase()),cambios);
  const existentes=actualizado.grupos.filter(x=>x.a===personal.a&&x.g===personal.g);
  assert.equal(existentes.length,1);
  assert.equal(existentes[0].on,false);
});


probar('Grupo informativo permanece no analizable ante ediciones actuales',()=>{
  const especial=base.grupos.find(g=>g.analizable===false);
  assert(especial);
  const antes=modulo.compute(base);
  const editado=copiar(base);
  const registro=editado.grupos.find(g=>g.ref===especial.ref);
  registro.on=!registro.on;
  const paquete=EscenarioPersonal.empaquetar(base,editado);
  const recuperado=EscenarioPersonal.aplicar(base,paquete.cambios);
  assert.equal(recuperado.grupos.find(g=>g.ref===especial.ref).analizable,false);
  const despues=modulo.compute(recuperado);
  assert.deepEqual(
    [antes.totalPairs,antes.totalClash,antes.totalCombos],
    [despues.totalPairs,despues.totalClash,despues.totalCombos]
  );
});

probar('Validación básica rechaza horarios imposibles sin rechazar créditos desconocidos',()=>{
  const calendario={
    ids:()=>raw.calendario.dias.map(d=>d[0]),
    inicio:raw.calendario.inicio,
    fin:raw.calendario.fin
  };
  const incompleto=copiar(base);
  incompleto.malla[0].cr=null;
  assert.equal(EscenarioPersonal.validarEstado(incompleto,calendario),incompleto);
  const invalido=copiar(base);
  invalido.bloques[0].e=invalido.bloques[0].s;
  assert.throws(()=>EscenarioPersonal.validarEstado(invalido,calendario),/Bloque horario inválido/);
});


probar('Requisitos académicos conservan IDs estables y relaciones personales',()=>{
  const origen=base.pre[0];
  assert(origen?.rId&&origen?.tId,'Un requisito institucional necesita IDs estables');
  const cambiado=copiar(base);
  cambiado.pre[0].r='Texto de visualización diferente';
  const noEditar=EscenarioPersonal.diferencias(base,cambiado);
  assert.deepEqual(noEditar.pre.agregar,[]);
  assert.deepEqual(noEditar.pre.quitar,[]);
  const m0=modulo.compute(base),m1=modulo.compute(cambiado);
  assert.deepEqual(m0.pairs,m1.pairs,'El cálculo debe usar identidad de requisito, no el texto visible');
  const quitado=copiar(base);
  quitado.pre.splice(0,1);
  const cambios=EscenarioPersonal.diferencias(base,quitado);
  assert(cambios.pre.quitar.some(k=>k.startsWith('id:')));
  assert(!EscenarioPersonal.aplicar(base,cambios).pre.some(p=>p.rId===origen.rId&&p.tId===origen.tId));
});

probar('Unidad responsable opcional se exporta e importa ligada al ID curricular',()=>{
  const nombre=base.malla[0].n, id=base.malla[0].idPos;
  const modificado=copiar(base);
  const valor='Departamento de Ingeniería Mecánica y Mecatrónica · Facultad de Ingeniería';
  assert.equal(modificado.malla[0].unidad,'');
  modificado.malla[0].unidad=valor;
  const exportado=EscenarioPersonal.empaquetar(base,modificado);
  const cambio=exportado.cambios.malla.find(x=>x.posicionId===id);
  assert(cambio);
  assert.equal(cambio.valores.unidad,valor);
  const importado=EscenarioPersonal.aplicar(base,JSON.parse(JSON.stringify(exportado)).cambios);
  assert.equal(importado.malla.find(x=>x.idPos===id).unidad,valor);
  assert.equal(base.malla[0].unidad,'');
  importado.malla[0].unidad='';
  assert.equal(EscenarioPersonal.diferencias(base,importado).malla.length,0,
    'Borrar la unidad devuelve a desconocido, no inventa un valor');
});

probar('Unidad opcional ausente no se inventa al calcular diferencias',()=>{
  const sinCampo=copiar(base);
  for(const m of sinCampo.malla)delete m.unidad;
  const cambios=EscenarioPersonal.diferencias(base,sinCampo);
  assert.equal(cambios.malla.some(r=>r.valores?.unidad!==undefined),false);
  const importado=EscenarioPersonal.aplicar(base,cambios);
  assert(importado.malla.every(m=>m.unidad===''));
  assert.throws(()=>{
    importado.malla[0].unidad={nombre:'No válido'};
    EscenarioPersonal.validarEstado(importado,{
      ids:()=>raw.calendario.dias.map(x=>x[0]),
      inicio:raw.calendario.inicio,fin:raw.calendario.fin
    });
  },/Unidad académica inválida/);
});

console.log('Persistencia vigente: comprobaciones finalizadas.');
