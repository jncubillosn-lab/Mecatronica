'use strict';
const fs=require('node:fs'),path=require('node:path');
const {markdown}=require('./mantenimiento-auditar.js');
const raiz=path.resolve(__dirname,'..');
const archivo=path.join(raiz,'.auditoria','reporte.json');
const TITULO='Mantenimiento automático: hallazgos pendientes';

/** La API de GitHub suministra todas las ramas y sus PR, sin inferir fusión por nombres. */
function evaluarRamas(ramas,prs,nombreRepo) {
  const avisos=[], informativos=[];
  const main=ramas.find(b=>b.name==='main');
  if(!main) avisos.push({id:'MAIN_NO_IDENTIFICADA',gravedad:'aviso',archivo:'main',
    detalle:'No se localiza la rama principal en la API de GitHub'});
  else if(!main.protected) avisos.push({id:'MAIN_SIN_PROTECCION',gravedad:'aviso',archivo:'main',
    detalle:'La rama principal no tiene protección; configurar reglas y pruebas requeridas en GitHub'});
  for(const b of ramas) {
    if(b.name==='main')continue;
    const asociadas=prs.filter(pr=>pr.head?.ref===b.name && pr.head?.repo?.full_name===nombreRepo);
    if(asociadas.some(pr=>pr.state==='open')) {
      informativos.push({rama:b.name,estado:'PR abierta'});continue;
    }
    if(asociadas.some(pr=>pr.merged_at && pr.head.sha===b.commit.sha)) {
      informativos.push({rama:b.name,estado:'Fusionada y candidata a limpieza segura'});continue;
    }
    avisos.push({id:asociadas.length?'RAMA_SIN_FUSION':'RAMA_SIN_PR',
      gravedad:'aviso',archivo:b.name,
      detalle:asociadas.length ? 'PR no fusionada: resolver si continúa'
        : 'Sin PR asociada: revisar trabajo útil antes de retirar'});
  }
  return {avisos,informativos};
}

async function ejecutar({github,context,core}) {
  const {owner,repo}=context.repo, nombreRepo=owner+'/'+repo;
  const [ramas,prs]=await Promise.all([
    github.paginate(github.rest.repos.listBranches,{owner,repo,per_page:100}),
    github.paginate(github.rest.pulls.list,{owner,repo,state:'all',per_page:100})
  ]);
  const r=JSON.parse(fs.readFileSync(archivo,'utf8'));
  const estado=evaluarRamas(ramas,prs,nombreRepo);
  r.hallazgos.push(...estado.avisos);
  r.resumen.avisos+=estado.avisos.length;
  r.repositorio={
    ramas:ramas.length,
    ramasConPrEnCurso:estado.informativos.filter(x=>x.estado==='PR abierta').length,
    sinFusion:estado.avisos.filter(x=>x.id.startsWith('RAMA_')).length,
    mainProtegida:!!ramas.find(x=>x.name==='main')?.protected
  };
  fs.writeFileSync(archivo,JSON.stringify(r,null,2)+'\n');
  fs.writeFileSync(path.join(raiz,'.auditoria','resumen.md'),markdown(r));
  const pendientes=r.hallazgos;
  const detalles=pendientes.slice(0,60).map(h=>
    '- **'+h.gravedad.toUpperCase()+' / '+h.id+'** — '+h.archivo+': '+h.detalle);
  const contenido=[
    'Seguimiento generado por controles automáticos del repositorio, no por una inspección manual.',
    '',
    '**Commit:** '+(r.revision||context.sha),
    '**Archivos clasificados:** '+r.cobertura.archivosClasificados+'/'+r.cobertura.archivosRastreados,
    '**Errores:** '+r.resumen.errores+' · **Avisos:** '+r.resumen.avisos,
    '**Ejecución:** https://github.com/'+nombreRepo+'/actions/runs/'+context.runId,
    '',
    '## Hallazgos actuales',...detalles,
    ...(pendientes.length>60?['- Otros '+(pendientes.length-60)+' hallazgos en el artefacto de Actions']:[]),
    '',
    '## Limitaciones',...r.limites.map(x=>'- '+x),
    '',
    'Estos avisos NO autorizan eliminar archivos o ramas automáticamente.'
  ].join('\n');
  const lista=await github.paginate(github.rest.issues.listForRepo,{
    owner,repo,state:'all',per_page:100
  });
  const existente=lista.find(i=>!i.pull_request && i.title===TITULO);
  if(pendientes.length) {
    if(existente) {
      if(existente.body!==contenido || existente.state!=='open')
        await github.rest.issues.update({owner,repo,issue_number:existente.number,
          body:contenido,state:'open'});
      core.info('Seguimiento actualizado: #'+existente.number);
    }else {
      const nuevo=await github.rest.issues.create({owner,repo,title:TITULO,body:contenido});
      core.info('Seguimiento creado: #'+nuevo.data.number);
    }
  } else if(existente && existente.state==='open') {
    await github.rest.issues.createComment({owner,repo,issue_number:existente.number,
      body:'Los controles automáticos no detectan hallazgos para '+context.sha+
        '. Esto no equivale a ausencia absoluta de defectos.'});
    await github.rest.issues.update({owner,repo,issue_number:existente.number,state:'closed'});
  }
  await core.summary.addHeading('Estado remoto',2)
    .addRaw('Ramas: '+r.repositorio.ramas+'; PR abiertas: '+r.repositorio.ramasConPrEnCurso+
      '; ramas pendientes: '+r.repositorio.sinFusion+
      '; main protegida: '+r.repositorio.mainProtegida)
    .addBreak().addRaw('Informe íntegro en .auditoria/reporte.json').write();
}
module.exports={evaluarRamas,ejecutar};
