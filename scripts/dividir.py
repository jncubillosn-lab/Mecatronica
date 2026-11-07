#!/usr/bin/env python3
"""Etapa de ajuste: divide el index.html original en css/ y js/ SIN cambiar una coma del código."""
import re, sys
from pathlib import Path
orig, destino = Path(sys.argv[1]), Path(sys.argv[2])
t = orig.read_text(encoding="utf-8")
m = re.match(r"^(.*?)<style>(.*?)</style>(.*?)<script>(.*?)</script>(.*)$", t, re.S)
cabeza, css, medio, js, cola = m.groups()
js = re.sub(r"^const RAW=.*\n", "", js, count=1, flags=re.M)      # los datos salen de js/datos.js
(destino / "css").mkdir(parents=True, exist_ok=True); (destino / "js").mkdir(parents=True, exist_ok=True)
(destino / "css" / "estilos.css").write_text(css, encoding="utf-8")
(destino / "js" / "app.js").write_text(js, encoding="utf-8")
(destino / "index.html").write_text(
    cabeza + '<link rel="stylesheet" href="css/estilos.css">' + medio +
    '<script src="js/datos.js"></script>\n<script src="js/app.js"></script>' + cola, encoding="utf-8")
