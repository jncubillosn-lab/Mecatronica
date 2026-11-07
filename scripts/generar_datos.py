#!/usr/bin/env python3
"""Reconstruye js/datos.js (objeto RAW) desde data/programas/<programa>/*.json. Los JSON son la fuente de verdad."""
import json, sys
from pathlib import Path
prog, salida = Path(sys.argv[1]), Path(sys.argv[2])
p = json.loads((prog / "plan.json").read_text(encoding="utf-8"))
h = json.loads((prog / "horarios.json").read_text(encoding="utf-8"))
nom = {a["id"]: a["nombre"] for a in p["asignaturas"]}
sem = {a["id"]: a["semestre"] for a in p["asignaturas"]}
con_horario = list(dict.fromkeys(g["asignatura"] for g in h["grupos"]))
raw = {
  "asg": [[nom[i], sem[i]] for i in con_horario],
  "gr": [[nom[g["asignatura"]], g["grupo"], g["componentes"][0], g["componentes"][1] if len(g["componentes"]) > 1 else None] for g in h["grupos"]],
  "bl": [[nom[b["asignatura"]], b["componente"], b["dia"], b["inicio"], b["fin"], None] for b in h["bloques"]],
  "malla": [[a["nombre"], a["semestre"], a.get("nota", ""), a["creditos"]] for a in p["asignaturas"]],
  "pre": [[nom[x["de"]], nom[x["a"]], "flecha" if x["dibujo"] == "flecha" else "letra " + x["letra"]] for x in p["prerrequisitos"]],
}
salida.write_text("const RAW=" + json.dumps(raw, ensure_ascii=False) + ";\n", encoding="utf-8")
