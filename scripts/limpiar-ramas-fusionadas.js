'use strict';

/**
 * Gestión del repositorio (no pertenece a la aplicación web).
 * Solo puede retirar una rama si una PR del MISMO repositorio ya fue
 * fusionada a main y su SHA continúa siendo exactamente el de esa PR.
 * No toca ramas abiertas, ramas sin PR, forks ni main.
 */
function planificar(ramas, prs, nombreRepo) {
  const porNombre = new Map(ramas.map(b => [b.name, b]));
  const candidatos = new Map();
  for (const pr of prs) {
    if (!pr.merged_at || pr.base?.ref !== 'main' ||
      pr.head?.repo?.full_name !== nombreRepo) continue;
    const nombre = pr.head.ref;
    if (!nombre || nombre === 'main') continue;
    const b = porNombre.get(nombre);
    if (!b || b.protected || b.commit?.sha !== pr.head.sha) continue;
    candidatos.set(nombre, { name: nombre, sha: b.commit.sha, pr: pr.number });
  }
  return [...candidatos.values()].sort((a,b) => a.name.localeCompare(b.name));
}

async function ejecutar({github,context,core}) {
  const {owner,repo} = context.repo;
  const nombreRepo = owner + '/' + repo;
  const [ramas,prs] = await Promise.all([
    github.paginate(github.rest.repos.listBranches,{owner,repo,per_page:100}),
    github.paginate(github.rest.pulls.list,{owner,repo,state:'closed',per_page:100})
  ]);
  const elegibles = planificar(ramas,prs,nombreRepo);
  const eliminadas=[],omitidas=[];
  for (const b of elegibles) {
    const ref = 'heads/'+b.name;
    try {
      // Comprobación inmediatamente anterior al borrado: no eliminar si
      // alguien reutilizó o adelantó la rama después de fusionar su PR.
      const actual = await github.rest.git.getRef({owner,repo,ref});
      if (actual.data.object.sha !== b.sha) {
        omitidas.push(b.name+' (SHA cambió)');
        continue;
      }
      await github.rest.git.deleteRef({owner,repo,ref});
      eliminadas.push(b.name);
      core.info('Rama fusionada eliminada: '+b.name+' (PR #'+b.pr+')');
    } catch (error) {
      if (error.status===404) {
        omitidas.push(b.name+' (ya no existe)');
        continue;
      }
      throw new Error('No se pudo limpiar '+b.name+': '+error.message);
    }
  }
  const summary = core.summary
    .addHeading('Limpieza verificada de ramas fusionadas')
    .addRaw('Ramas revisadas: '+ramas.length+'; PR cerradas consultadas: '+prs.length+'. ')
    .addRaw('Eliminadas: '+eliminadas.length+'; omitidas: '+omitidas.length+'.')
    .addBreak();
  if (eliminadas.length) {
    summary.addHeading('Eliminadas',3);
    for(const b of eliminadas) summary.addRaw('- '+b+'\n');
  }
  if (omitidas.length) {
    summary.addHeading('Omitidas',3);
    for(const b of omitidas) summary.addRaw('- '+b+'\n');
  }
  summary.addRaw('\nNunca se eliminan main, ramas abiertas, ramas sin PR fusionada o SHA modificadas.\n');
  await summary.write();
  core.info('Limpieza: '+eliminadas.length+' eliminadas; '+omitidas.length+' omitidas');
}
module.exports = {planificar,ejecutar};
