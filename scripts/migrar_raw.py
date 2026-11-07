#!/usr/bin/env python3
"""Migra el objeto RAW de index.html a archivos JSON por programa.

Uso:  python3 scripts/migrar_raw.py index.html data/programas/mecatronica

Solo transcribe lo que ya está en RAW. Los campos que RAW no tiene
(categoría, facultad que dicta, código) quedan en null para completarlos.
"""
import csv, json, re, sys, unicodedata
from pathlib import Path

def extraer_raw(html):
    m = re.search(r"^const RAW=(\{.*\});?\s*$", html, re.M)
    if not m:
        sys.exit("No se encontró 'const RAW=' en el HTML")
    return json.loads(m.group(1))

def slug(texto):
    t = unicodedata.normalize("NFD", texto.lower())
    t = "".join(c for c in t if unicodedata.category(c) != "Mn")
    return re.sub(r"[^a-z0-9]+", "-", t).strip("-")

def migrar(raw):
    ids = {}
    asignaturas = []
    for nombre, semestre, nota, creditos in raw["malla"]:
        id_ = slug(nombre)
        assert id_ not in ids, f"id repetido: {id_}"
        ids[nombre] = id_
        a = {
            "id": id_,
            "codigo": None,
            "nombre": nombre,
            "semestre": semestre,
            "creditos": 3 if creditos is None else creditos,
            "categoria": None,
            "facultad_que_dicta": None,
            "optativa": nombre.startswith("Optativa"),
        }
        if nombre.startswith("Libre elección"):          # regla dada por Javier
            a["categoria"] = "libre_eleccion"
            a["facultad_que_dicta"] = "sede"
        req = re.search(r"(\d+)\s+créditos aprobados", nota or "")
        if req:
            a["requisito_creditos_aprobados"] = int(req.group(1))
        if nota:
            a["nota"] = nota
        asignaturas.append(a)

    prerrequisitos = []
    for origen, destino, marca in raw["pre"]:
        p = {"de": ids[origen], "a": ids[destino], "dibujo": "flecha"}
        if marca != "flecha":
            p["dibujo"] = "letra"
            p["letra"] = marca.replace("letra ", "")
        prerrequisitos.append(p)

    grupos = []
    for a, g, c1, c2 in raw["gr"]:
        grupos.append({"asignatura": ids[a], "grupo": g,
                       "componentes": [c for c in (c1, c2) if c]})
    bloques = [{"asignatura": ids[a], "componente": c, "dia": d,
                "inicio": s, "fin": e}
               for a, c, d, s, e, _o in raw["bl"]]
    # El orden de "grupos" se conserva: la interfaz lo usa para etiquetar G1, G2…
    return asignaturas, prerrequisitos, grupos, bloques, ids

def main(html_path, destino):
    raw = extraer_raw(Path(html_path).read_text(encoding="utf-8"))
    asig, pre, gr, bl, ids = migrar(raw)
    out = Path(destino); out.mkdir(parents=True, exist_ok=True)
    dump = lambda p, o: p.write_text(json.dumps(o, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    dump(out / "plan.json", {
        "programa": "Ingeniería Mecatrónica",
        "facultad": "ingenieria",
        "fuente_plan": "Acuerdo 6 de 2022 del Consejo de Facultad de Ingeniería",
        "fuente_horarios": "Excel original de horarios",
        "asignaturas": asig,
        "prerrequisitos": pre,
    })
    dump(out / "horarios.json", {"grupos": gr, "bloques": bl})
    with open(out / "revision_categorias.csv", "w", newline="", encoding="utf-8-sig") as f:
        w = csv.writer(f)
        w.writerow(["id", "nombre", "semestre", "creditos", "optativa",
                    "categoria", "facultad_que_dicta", "codigo"])
        for a in asig:
            w.writerow([a["id"], a["nombre"], a["semestre"], a["creditos"],
                        "sí" if a["optativa"] else "",
                        a["categoria"] or "", a["facultad_que_dicta"] or "", ""])
    return raw, asig, pre, gr, bl

if __name__ == "__main__":
    main(*sys.argv[1:3])
