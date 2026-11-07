#!/usr/bin/env python3
"""Normaliza el texto de oferta copiado del SIA a JSON y genera un reporte de la entrada.

Uso: python3 scripts/normalizar_oferta.py Oferta.txt data/programas/mecatronica [malla.txt]

Principio: NADA se descarta en silencio. Lo que no se reconoce se conserva y se lista en el reporte.
"""
import collections, json, re, sys, unicodedata
from pathlib import Path

REGLAS = json.loads((Path(__file__).parent.parent / "data/catalogos/reglas_entrada.json").read_text(encoding="utf-8"))
DIAS = "|".join(REGLAS["dias"])
RE_BLOQUE = re.compile(rf"({DIAS}) de (\d\d):(\d\d) a (\d\d):(\d\d)\.(.*?)(?=(?:{DIAS}) de \d\d:\d\d a |$)", re.S)
RE_COMP = re.compile(r"^CLASE\s+([A-ZÁÉÍÓÚÑ]+)(?:-([^()]*?))?\s*(?:\S*\d\S*)?\s*\(([^)]*)\)\s*$")
RE_GRUPO = re.compile(r"^\(([A-Za-z0-9\-]+)\)\s+(.+)$")
RE_COND = re.compile(r"^Condición\s*(\d+)\s*Tipo\s*(\w)\s*¿Todas\?\s*\[(\w?)\]\s*Número asignaturas\s*\[(\d*)\]")
RE_MAT = re.compile(r"^(\d{6,8})(?:-([A-Z]))?\s*(.*)$")

INCLUIR_PROFESORES = "--profesores" in sys.argv   # por defecto NO se guardan nombres de docentes (repositorio público)

def slug(t):
    t = "".join(c for c in unicodedata.normalize("NFD", t.lower()) if unicodedata.category(c) != "Mn")
    return re.sub(r"[^a-z0-9]+", "-", t).strip("-")

def clasificar_facultad(txt):
    if not txt: return {"texto": "", "id": None, "clase": "vacio"}
    clase = "paet" if "PAET" in txt else "sede" if txt.startswith("SEDE ") else "facultad"
    return {"texto": txt, "id": slug(re.sub(r"^FACULTAD DE ", "", txt)), "clase": clase}

def parsear(lineas, nuevos, avisos):
    asigs, a, comp, g, seccion, cond = [], None, None, None, None, None
    anteriores = lambda i: next((lineas[j] for j in range(i - 1, -1, -1) if lineas[j]), "")
    for i, l in enumerate(lineas):
        if not l: continue
        if l.startswith("Tipología:"):
            m = re.match(r"^(.*?)\s*\((\d{6,8})(?:-([A-Z]))?\)$", anteriores(i))
            if not m: avisos.append(f"línea {i+1}: encabezado de asignatura no reconocido: {anteriores(i)!r}"); continue
            tip = l.split(":", 1)[1].strip(); r = REGLAS["tipologias"].get(tip)
            if not r: nuevos["tipologías"][tip] += 1
            a = {"codigo": m.group(2), "sufijo_codigo": m.group(3), "nombre": m.group(1).strip(), "tipologia_sia": tip,
                 "categoria": r["categoria"] if r else None, "optativa": r["optativa"] if r else None,
                 "creditos": None, "programa": None, "facultad_plan": None, "facultad_que_dicta": None, "departamento_que_dicta": None, "componentes": [], "condiciones": []}
            asigs.append(a); comp = g = seccion = cond = None; continue
        if a is None: continue
        if l.startswith("Créditos:"): a["creditos"] = int(re.sub(r"\D", "", l)); continue
        if re.fullmatch(r"INGENIERÍA [A-ZÁÉÍÓÚÑ ]+", l) and a["programa"] is None and g is None and comp is None: a["programa"] = l; continue
        if l.startswith("Facultad:") and g is None:
            if a["facultad_plan"] is None: a["facultad_plan"] = l.split(":", 1)[1].strip()
            continue
        if l in ("Contenido de la asignatura",) or l.startswith("Tipo de prerrequisito") or l.startswith("Tipos de correquisito"): continue
        if l in ("Prerrequisitos", "Correquisitos"): seccion = l.lower(); g = None; cond = None; continue
        mc = RE_COND.match(l)
        if mc:
            cond = {"seccion": seccion, "numero": int(mc.group(1)), "tipo": mc.group(2), "todas": mc.group(3) == "S",
                    "n_requeridas": int(mc.group(4)) if mc.group(4) else None, "asignaturas": []}
            tabla = REGLAS["tipos_prerrequisito" if seccion == "prerrequisitos" else "tipos_correquisito"]
            if cond["tipo"] not in tabla: nuevos[f"tipos de {seccion}"][cond["tipo"]] += 1
            a["condiciones"].append(cond); continue
        if cond is not None and (mm := RE_MAT.match(l)):
            cond["asignaturas"].append({"codigo": mm.group(1), "sufijo_codigo": mm.group(2), "nombre": mm.group(3).strip()}); continue
        if l.startswith("CLASE "):
            m = RE_COMP.match(l); g = None; cond = None; seccion = None
            if not m: avisos.append(f"línea {i+1}: componente no reconocido: {l!r}"); continue
            tipo = REGLAS["tipos_componente"].get(m.group(1))
            if not tipo: nuevos["tipos de componente"][m.group(1)] += 1
            comp = {"tipo": tipo or m.group(1).lower(), "detalle": (m.group(2) or "").strip() or None, "codigo_componente": m.group(3).strip(), "texto_sia": l, "grupos": []}
            a["componentes"].append(comp); continue
        mg = RE_GRUPO.match(l)
        if mg and seccion is None:
            if comp is None:
                comp = {"tipo": "general", "detalle": None, "codigo_componente": None, "texto_sia": None, "grupos": []}; a["componentes"].append(comp)
            gid, resto = mg.groups()
            g = {"id": gid, "texto_sia": l, "profesor": None, "facultad_profesor": None, "duracion": None, "jornada": None, "cupos": None,
                 "fecha_inicio": None, "fecha_fin": None, "bloques": [], "horario_informado": False}
            comp["grupos"].append(g); continue
        if g is not None:
            if l.startswith("Profesor:"):
                if INCLUIR_PROFESORES: g["profesor"] = l.split(":", 1)[1].strip().rstrip(".").strip()
            elif l.startswith("Facultad:"): g["facultad_profesor"] = clasificar_facultad(l.split(":", 1)[1].strip())
            elif l.startswith("Duración:"): g["duracion"] = l.split(":", 1)[1].strip()
            elif l.startswith("Jornada:"): g["jornada"] = l.split(":", 1)[1].strip()
            elif l.startswith("Cupos disponibles:"): g["cupos"] = int(re.sub(r"\D", "", l) or 0)
            elif l.startswith("Horarios/Aula:"):
                h = l.split(":", 1)[1]
                f = re.search(r"Fecha:(\d\d)/(\d\d)/(\d{4}) - (\d\d)/(\d\d)/(\d{4})", h)
                if f: g["fecha_inicio"] = f"{f[3]}-{f[2]}-{f[1]}"; g["fecha_fin"] = f"{f[6]}-{f[5]}-{f[4]}"
                for d, h1, m1, h2, m2, lugar in RE_BLOQUE.findall(h):
                    if m1 != "00" or m2 != "00": avisos.append(f"{a['codigo']} grupo {g['id']}: hora que no es en punto {h1}:{m1}-{h2}:{m2}")
                    g["bloques"].append({"dia": REGLAS["dias"][d], "inicio": int(h1), "fin": int(h2), "lugar_texto": lugar.strip() or None})
                g["horario_informado"] = bool(g["bloques"])
    return asigs

def completar_grupo(a, c, g):
    """Deduce número de grupo, alcance (regular/especial/validación) y programa especial."""
    txt = g["texto_sia"]; gid = g["id"]
    m = re.match(r"^\(\S+\)\s+(\d{7})\s*-\s*(\w+)\s", txt)
    num = int(gid) if gid.isdigit() else (int(re.match(r"\d+", m.group(2)).group()) if m and re.match(r"\d+", m.group(2)) else None)
    if num is None and (mn := re.search(r"Grupo\s+(\d+)", txt)): num = int(mn.group(1))
    fac = g["facultad_profesor"] or clasificar_facultad("")
    esp = next((p["id"] for p in REGLAS["programas_especiales"] if any(k.lower() in (txt + " " + fac["texto"]).lower() for k in p["reconocer_en"])), None)
    if g["duracion"] == "Validación" or m: alcance = "validacion"
    elif esp or not gid.isdigit() or fac["clase"] == "paet" or (fac["clase"] == "sede" and "BOGOT" not in fac["texto"].upper()): alcance = "especial"; esp = esp or "sin_clasificar"
    else: alcance = "regular"
    pref = gid.split("-")[0] if not gid.isdigit() else None
    g.update({"sede_origen": REGLAS["prefijos_grupo_especial"].get(pref) if alcance == "especial" else None, "numero": num, "alcance": alcance, "programa_especial": esp if alcance == "especial" else None,
              "incluir_en_analisis": alcance == "regular" and g["horario_informado"]})

def vinculacion(a):
    por_comp = {}
    for c in a["componentes"]:
        n = {g["numero"] for g in c["grupos"] if g["alcance"] == "regular"}
        if n: por_comp.setdefault(c["tipo"] + (f"-{c['detalle']}" if c["detalle"] else ""), set()).update(n)
    if not por_comp: return {"tipo": "sin_oferta_regular"}
    if len(por_comp) == 1: return {"tipo": "componente_unico"}
    conjuntos = list(por_comp.values())
    if all(s == conjuntos[0] for s in conjuntos): return {"tipo": "por_numero_de_grupo", "grupos": sorted(conjuntos[0])}
    if len(por_comp) == 2:   # regla de pares: magistral 1 con laboratorios 1 y 2, magistral 2 con 3 y 4, …
        (kp, sp), (ks, ss) = sorted(por_comp.items(), key=lambda kv: len(kv[1]))
        if sp == set(range(1, len(sp) + 1)) and ss == set(range(1, len(ss) + 1)) and len(ss) % len(sp) == 0 and len(ss) > len(sp):
            r = len(ss) // len(sp)
            return {"tipo": "por_bloques_consecutivos", "principal": kp, "secundario": ks, "razon": r,
                    "mapa": {str(m): list(range((m - 1) * r + 1, m * r + 1)) for m in sorted(sp)}}
    union = set().union(*conjuntos)
    return {"tipo": "por_confirmar", "grupos_por_componente": {k: len(v) for k, v in por_comp.items()},
            "faltantes": {k: sorted(union - v) for k, v in por_comp.items() if union - v}}

def main(txt_path, destino, malla_txt=None):
    lineas = [l.strip() for l in Path(txt_path).read_text(encoding="utf-8").replace("\r", "").split("\n")]
    nuevos, avisos = collections.defaultdict(collections.Counter), []
    asigs = parsear(lineas, nuevos, avisos)
    for a in asigs:
        for c in a["componentes"]:
            for g in c["grupos"]: completar_grupo(a, c, g)
        a["vinculacion"] = vinculacion(a)
        regs = [g for c in a["componentes"] for g in c["grupos"] if g["alcance"] == "regular"]
        cont = collections.Counter(g["facultad_profesor"]["id"] for g in regs if g["facultad_profesor"] and g["facultad_profesor"]["id"])
        sin = sum(1 for g in regs if not (g["facultad_profesor"] and g["facultad_profesor"]["id"]))
        a["registros_regulares"] = len(regs); a["registros_regulares_sin_facultad"] = sin
        a["facultad_evidencia_sia"] = dict(cont)
    out = Path(destino); out.mkdir(parents=True, exist_ok=True)
    aplicar_seleccion(asigs, out / "seleccion_facultad_departamento.csv", avisos)
    (out / "oferta.json").write_text(json.dumps({"fuente": {"tipo": "SIA (texto copiado y pegado)", "archivo": Path(txt_path).name}, "asignaturas": asigs}, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    informe(asigs, nuevos, avisos, out / "reporte_entrada.md", malla_txt)

def aplicar_seleccion(asigs, ruta, avisos):
    """Facultad y departamento que dicta cada asignatura son casillas a SELECCIONAR (no se deducen).
    La plantilla CSV se crea una sola vez y nunca se sobrescribe: ahí vive lo que elige una persona."""
    import csv
    facs = {f["id"] for f in json.loads((Path(__file__).parent.parent / "data/catalogos/facultades.json").read_text(encoding="utf-8"))}
    if not ruta.exists():
        with open(ruta, "w", newline="", encoding="utf-8-sig") as f:
            w = csv.writer(f); w.writerow(["codigo", "nombre", "categoria", "evidencia_sia", "facultad_que_dicta", "departamento_que_dicta"])
            for a in asigs: w.writerow([a["codigo"], a["nombre"], a["categoria"] or "", "; ".join(f"{k}:{v}" for k, v in a["facultad_evidencia_sia"].items()), "", ""])
        return
    sel = {r["codigo"]: r for r in csv.DictReader(open(ruta, encoding="utf-8-sig"))}
    for a in asigs:
        r = sel.get(a["codigo"])
        if not r: continue
        fq, dq = (r.get("facultad_que_dicta") or "").strip(), (r.get("departamento_que_dicta") or "").strip()
        if fq and fq not in facs: avisos.append(f"{a['codigo']}: facultad '{fq}' no está en data/catalogos/facultades.json")
        elif fq: a["facultad_que_dicta"] = fq
        if dq: a["departamento_que_dicta"] = dq

def informe(asigs, nuevos, avisos, ruta, malla_txt):
    G = [(a, c, g) for a in asigs for c in a["componentes"] for g in c["grupos"]]
    L = ["# Reporte de entrada (oferta SIA)", "", "Generado por `scripts/normalizar_oferta.py`. Lo que aparece aquí requiere una decisión o una verificación.", "",
         f"- Asignaturas: **{len(asigs)}** · componentes: {sum(len(a['componentes']) for a in asigs)} · grupos: **{len(G)}**",
         "- Grupos por alcance: " + ", ".join(f"{k} {v}" for k, v in collections.Counter(g["alcance"] for _, _, g in G).items()) + " (especial = todo lo que no es oferta regular de Bogotá)",
         f"- Grupos regulares sin horario informado: {sum(1 for _, _, g in G if g['alcance']=='regular' and not g['horario_informado'])}",
         "- Programas especiales: " + (", ".join(f"{k} ({v})" for k, v in collections.Counter(g["programa_especial"] for _, _, g in G if g["programa_especial"]).items()) or "ninguno"),
         "- Fechas: se registran pero **no se usan** (se asume que todas las asignaturas inician y terminan juntas, 16 semanas).", ""]
    L += ["## Valores nuevos (no están en `reglas_entrada.json`)", ""] + ([f"- {k}: {dict(v)}" for k, v in nuevos.items()] or ["- ninguno"]) + [""]
    L += ["## Vinculación entre componentes de una misma asignatura", "", "| Asignatura | Vinculación | Detalle |", "|---|---|---|"]
    for a in asigs:
        v = a["vinculacion"]; t = v["tipo"]
        if t == "por_numero_de_grupo": det = f"grupos {v['grupos'][0]}–{v['grupos'][-1]} ({len(v['grupos'])})"
        elif t == "por_bloques_consecutivos": det = f"{v['principal']} 1 con {v['secundario']} {v['mapa']['1'][0]}–{v['mapa']['1'][-1]}, {v['principal']} 2 con {v['mapa']['2'][0]}–{v['mapa']['2'][-1]}… (razón 1:{v['razon']})"
        elif t == "por_confirmar": det = f"{v['grupos_por_componente']}; faltan {v['faltantes'] or 'ninguno'} — **sin regla aplicable, requiere decisión**"
        else: continue
        L.append(f"| {a['nombre']} ({a['codigo']}) | {t} | {det} |")
    L += ["", "## Facultad y departamento que dicta (casillas a seleccionar en `seleccion_facultad_departamento.csv`)", "",
          f"- Asignaturas con facultad seleccionada: {sum(1 for a in asigs if a['facultad_que_dicta'])}/{len(asigs)} · con departamento: {sum(1 for a in asigs if a['departamento_que_dicta'])}/{len(asigs)}",
          "- La columna `evidencia_sia` del CSV muestra la facultad del profesor en los grupos regulares, solo como ayuda (a menudo viene vacía).", ""]
    L += ["## Grupos especiales sin programa nombrado (informativo)", ""]
    L += [f"- {a['codigo']} {a['nombre']}: {g['texto_sia']}" for a, _, g in G if g["programa_especial"] == "sin_clasificar"] or ["- ninguno"]
    L += ["", "## Duplicados de grupo (mismo número dentro de un mismo componente)", ""]
    dup = [f"{a['nombre']} / {c['tipo']}: grupo {n}" for a in asigs for c in a["componentes"] for n, k in collections.Counter(g["numero"] for g in c["grupos"] if g["alcance"] == "regular").items() if k > 1]
    L += [f"- {d}" for d in dup] or ["- ninguno"]
    L += ["", "## Avisos del lector", ""] + ([f"- {x}" for x in avisos[:40]] or ["- ninguno"]) + [""]
    if malla_txt:
        t = Path(malla_txt).read_text(encoding="utf-8"); cm = set(re.findall(r"\b(\d{6,7})\b", t)); co = {a["codigo"] for a in asigs}
        L += ["## Diferencias con la malla (PDF) — prevalece el SIA", "",
              "El SIA es la fuente más reciente; la malla es una imagen estática y puede traer códigos desactualizados o mal transcritos. Ante una diferencia se usa el código del SIA.", "",
              "- Códigos de 7 dígitos en la malla que no están en la oferta del SIA: " + (", ".join(sorted(c for c in cm if len(c) == 7 and c[0] in "12" and c not in co)) or "ninguno"),
              "- Códigos de 6 dígitos en la malla (error de transcripción): " + (", ".join(sorted(c for c in cm if len(c) == 6 and c[0] == "2")) or "ninguno"), ""]
    ruta.write_text("\n".join(L), encoding="utf-8")

if __name__ == "__main__":
    main(*[x for x in sys.argv[1:] if not x.startswith("--")][:3])
