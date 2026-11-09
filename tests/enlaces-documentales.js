'use strict';

/**
 * RC-06: referencias internas en documentos vigentes e históricos.
 * El historial se conserva pero no debe dirigir a archivos eliminados.
 * Los fragmentos (#...) y sitios externos se validan en su propio destino.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const raiz = path.join(__dirname,'..');
const docs = ['README.md','AGENTS.md','CHANGELOG.md',
  ...fs.readdirSync(path.join(raiz,'docs'))
    .filter(p=>p.endsWith('.md')).map(p=>'docs/'+p)];
let verificados=0;
for(const nombre of docs){
  const contenido=fs.readFileSync(path.join(raiz,nombre),'utf8');
  for(const enlace of contenido.matchAll(/\[[^\]\n]*\]\(([^)\n]+)\)/g)){
    const destino=enlace[1].trim().replace(/^<|>$/g,'');
    if(/^(?:https?:|mailto:|data:|#)/i.test(destino))continue;
    const limpio=decodeURIComponent(destino.split('#')[0]);
    if(!limpio)continue;
    const objetivo=path.resolve(raiz,path.dirname(nombre),limpio);
    assert(objetivo.startsWith(raiz+path.sep),
      'Referencia documental fuera del repositorio en '+nombre+': '+destino);
    assert(fs.existsSync(objetivo),
      'Enlace local roto desde '+nombre+': '+destino);
    verificados++;
  }
}
console.log('OK: '+verificados+' enlaces locales en '+docs.length+' documentos.');
