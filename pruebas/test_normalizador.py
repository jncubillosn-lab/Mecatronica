"""Pruebas del normalizador de oferta. Ejecutar: python3 -m unittest pruebas/test_normalizador.py -v
Si existe la variable OFERTA_REAL (ruta al .txt del SIA), también se verifica que no se pierda nada de ese archivo."""
import json, os, re, subprocess, sys, tempfile, unittest
from pathlib import Path
RAIZ = Path(__file__).resolve().parent.parent

def normalizar(txt):
    with tempfile.TemporaryDirectory() as d:
        subprocess.run([sys.executable, str(RAIZ / "scripts/normalizar_oferta.py"), str(txt), d], check=True, capture_output=True)
        return json.loads((Path(d) / "oferta.json").read_text(encoding="utf-8")), (Path(d) / "reporte_entrada.md").read_text(encoding="utf-8")

class Mini(unittest.TestCase):
    @classmethod
    def setUpClass(cls): cls.o, cls.rep = normalizar(RAIZ / "pruebas/fixtures/oferta_mini.txt"); cls.a = cls.o["asignaturas"]
    def test_asignaturas_y_categoria(self):
        self.assertEqual([x["codigo"] for x in self.a][:2], ["1000099", "2000001"]); self.assertEqual(self.a[0]["categoria"], "fundamentacion"); self.assertFalse(self.a[0]["optativa"])
    def test_tipologia_desconocida_se_conserva_y_se_reporta(self):
        self.assertIsNone(self.a[1]["categoria"]); self.assertEqual(self.a[1]["tipologia_sia"], "TIPOLOGÍA NUEVA"); self.assertIn("TIPOLOGÍA NUEVA", self.rep)
    def test_bloques_y_dias(self):
        g = self.a[0]["componentes"][0]["grupos"][0]; self.assertEqual([(b["dia"], b["inicio"], b["fin"]) for b in g["bloques"]], [("L", 7, 9), ("X", 7, 9)])
    def test_alcances(self):
        gs = [g for c in self.a[0]["componentes"] for g in c["grupos"]]
        self.assertEqual(sorted(g["alcance"] for g in gs), ["especial", "regular", "regular", "regular", "regular", "validacion"])
        esp = next(g for g in gs if g["alcance"] == "especial"); self.assertEqual((esp["programa_especial"], esp["sede_origen"]), ("PEAMA", "Sumapaz")); self.assertFalse(esp["incluir_en_analisis"])
    def test_regla_de_pares_magistral_laboratorio(self):
        v = self.a[2]["vinculacion"]; self.assertEqual(v["tipo"], "por_bloques_consecutivos"); self.assertEqual(v["razon"], 2); self.assertEqual(v["mapa"], {"1": [1, 2], "2": [3, 4]})
    def test_sin_regla_aplicable_queda_por_confirmar(self): self.assertEqual(self.a[3]["vinculacion"]["tipo"], "por_confirmar")
    def test_todo_lo_que_no_es_bogota_es_especial(self):
        g = next(g for c in self.a[2]["componentes"] for g in c["grupos"] if g["id"] == "7"); self.assertEqual(g["alcance"], "especial"); self.assertFalse(g["incluir_en_analisis"])
    def test_facultad_que_dicta_es_casilla_a_seleccionar(self):
        self.assertTrue(all(x["facultad_que_dicta"] is None and x["departamento_que_dicta"] is None for x in self.a))
    def test_fechas_se_registran_pero_no_se_usan(self):
        g = self.a[0]["componentes"][0]["grupos"][0]; self.assertEqual(g["fecha_inicio"], "2026-08-24"); self.assertIn("no se usan", self.rep)
    def test_vinculacion_por_numero(self): self.assertEqual(self.a[0]["vinculacion"]["tipo"], "por_numero_de_grupo")
    def test_condicion_con_alternativas(self):
        c = self.a[0]["condiciones"][0]; self.assertEqual((c["tipo"], c["todas"], c["n_requeridas"], len(c["asignaturas"])), ("M", False, 1, 2))
    def test_hora_que_no_es_en_punto_se_avisa(self): self.assertIn("07:30", self.rep)
    def test_no_guarda_profesores(self): self.assertNotIn("Persona", json.dumps(self.o, ensure_ascii=False))

@unittest.skipUnless(os.environ.get("OFERTA_REAL"), "defina OFERTA_REAL para probar con el archivo real")
class Real(unittest.TestCase):
    def test_no_se_pierde_nada(self):
        txt = Path(os.environ["OFERTA_REAL"]).read_text(encoding="utf-8"); o, _ = normalizar(os.environ["OFERTA_REAL"])
        G = [g for a in o["asignaturas"] for c in a["componentes"] for g in c["grupos"]]
        self.assertEqual(len(G), len(re.findall(r"^Horarios/Aula:", txt, re.M)))
        self.assertEqual(sum(len(g["bloques"]) for g in G), len(re.findall(r"(?:LUNES|MARTES|MIÉRCOLES|JUEVES|VIERNES|SÁBADO) de \d\d:\d\d a \d\d:\d\d\.", txt)))
        self.assertEqual(sum(len(a["condiciones"]) for a in o["asignaturas"]), len(re.findall(r"^Condición\s*\d+", txt, re.M)))
        self.assertEqual(len(o["asignaturas"]), len(re.findall(r"^Tipología:", txt, re.M)))
if __name__ == "__main__": unittest.main()
