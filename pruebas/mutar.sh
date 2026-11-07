#!/bin/bash
# Prueba de sensibilidad: se rompe UN dato a propósito y el comparador debe avisar.
P=data/programas/mecatronica
probar() {  # $1 = nombre, $2 = código python que muta {plan,hor}
  rm -rf mut && mkdir mut && tar --exclude=./node_modules --exclude=./.git --exclude=./pruebas --exclude=./mut -cf - . | tar -xf - -C mut
  python3 - "$2" <<PY
import json,sys
pl=json.load(open('mut/$P/plan.json',encoding='utf-8')); ho=json.load(open('mut/$P/horarios.json',encoding='utf-8'))
exec(sys.argv[1])
json.dump(pl,open('mut/$P/plan.json','w',encoding='utf-8'),ensure_ascii=False); json.dump(ho,open('mut/$P/horarios.json','w',encoding='utf-8'),ensure_ascii=False)
PY
  python3 scripts/generar_datos.py mut/$P mut/js/datos.js
  R=$(node pruebas/compare.js pruebas/referencia mut 2>&1 | head -1)
  echo "  $1 → $R"
}
echo "Fallos inducidos (se espera CON DIFERENCIAS > 0 en todos):"
probar "un bloque de horario movido 1 hora"     "ho['bloques'][10]['inicio']+=1"
probar "un grupo quitado"                         "ho['grupos'].pop(5)"
probar "un prerrequisito eliminado"               "pl['prerrequisitos'].pop(7)"
probar "créditos de una asignatura cambiados"     "pl['asignaturas'][3]['creditos']+=1"
probar "una asignatura cambiada de semestre"      "pl['asignaturas'][20]['semestre']+=1"
probar "una nota de requisito alterada"           "[a.update(nota='x') for a in pl['asignaturas'] if a['nombre'].startswith('Trabajo')]"
