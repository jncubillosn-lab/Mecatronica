// Datos iniciales basados en las fuentes disponibles; grupos sin horario permanecen válidos.
// No se inventan horarios ni se combinan grupos con identificadores diferentes.
const RAW = {
  "asg": [
    [
      "Dibujo básico",
      1
    ],
    [
      "Ing. y Des. Sostenible",
      1
    ],
    [
      "Tec. Mecánica Básica",
      2
    ],
    [
      "Taller Ing. Electrónica",
      1
    ],
    [
      "Estática",
      3
    ],
    [
      "Dinámica",
      4
    ],
    [
      "Ciencia e Ing. de Materiales",
      5
    ],
    [
      "Resistencia de Materiales",
      5
    ],
    [
      "Señales y Sistemas II",
      6
    ],
    [
      "Diseño Mecatrónico",
      6
    ],
    [
      "Control",
      7
    ],
    [
      "Sensores y Actuadores",
      7
    ],
    [
      "Microcontroladores",
      7
    ],
    [
      "Robótica",
      8
    ],
    [
      "Servomecanismos",
      8
    ],
    [
      "Automatización de Procesos",
      9
    ],
    [
      "Cálculo Diferencial",
      1
    ],
    [
      "Programación de Computadores",
      1
    ],
    [
      "Cálculo Integral",
      2
    ],
    [
      "Fundamentos de Mecánica",
      2
    ],
    [
      "Álgebra Lineal",
      2
    ],
    [
      "Cálculo en Varias Variables",
      3
    ],
    [
      "Fundamentos de Electricidad y Magnetismo",
      3
    ],
    [
      "Probabilidad y Estadística Fundamental",
      3
    ],
    [
      "Principios de Química",
      3
    ],
    [
      "Ecuaciones Diferenciales",
      4
    ],
    [
      "Variable Compleja",
      5
    ],
    [
      "Ingeniería Económica",
      6
    ],
    [
      "Inglés I",
      1
    ],
    [
      "Inglés II",
      2
    ],
    [
      "Inglés III",
      3
    ],
    [
      "Inglés IV",
      4
    ]
  ],
  "gr": [
    [
      "Dibujo básico",
      "G1",
      "G1",
      null
    ],
    [
      "Dibujo básico",
      "G12",
      "G12",
      null
    ],
    [
      "Dibujo básico",
      "G13",
      "G13",
      null
    ],
    [
      "Dibujo básico",
      "G15",
      "G15",
      null
    ],
    [
      "Dibujo básico",
      "G2",
      "G2",
      null
    ],
    [
      "Dibujo básico",
      "G3",
      "G3",
      null
    ],
    [
      "Dibujo básico",
      "G6",
      "G6",
      null
    ],
    [
      "Ing. y Des. Sostenible",
      "G1",
      "T1",
      "Mag"
    ],
    [
      "Ing. y Des. Sostenible",
      "G3",
      "T3",
      "Mag"
    ],
    [
      "Ing. y Des. Sostenible",
      "G4",
      "T4",
      "Mag"
    ],
    [
      "Tec. Mecánica Básica",
      "G1",
      "G1",
      null
    ],
    [
      "Tec. Mecánica Básica",
      "G2",
      "G2",
      null
    ],
    [
      "Tec. Mecánica Básica",
      "G3",
      "G3",
      null
    ],
    [
      "Tec. Mecánica Básica",
      "G4",
      "G4",
      null
    ],
    [
      "Tec. Mecánica Básica",
      "G6",
      "G6",
      null
    ],
    [
      "Tec. Mecánica Básica",
      "G7",
      "G7",
      null
    ],
    [
      "Tec. Mecánica Básica",
      "G8",
      "G8",
      null
    ],
    [
      "Taller Ing. Electrónica",
      "G1",
      "G1",
      null
    ],
    [
      "Taller Ing. Electrónica",
      "G2",
      "G2",
      null
    ],
    [
      "Taller Ing. Electrónica",
      "G3",
      "G3",
      null
    ],
    [
      "Taller Ing. Electrónica",
      "G4",
      "G4",
      null
    ],
    [
      "Taller Ing. Electrónica",
      "G5",
      "G5",
      null
    ],
    [
      "Taller Ing. Electrónica",
      "G6",
      "G6",
      null
    ],
    [
      "Taller Ing. Electrónica",
      "G7",
      "G7",
      null
    ],
    [
      "Estática",
      "G1",
      "G1",
      null
    ],
    [
      "Estática",
      "G2",
      "G2",
      null
    ],
    [
      "Estática",
      "G4",
      "G4",
      null
    ],
    [
      "Estática",
      "G5",
      "G5",
      null
    ],
    [
      "Estática",
      "G6",
      "G6",
      null
    ],
    [
      "Dinámica",
      "G1",
      "G1",
      null
    ],
    [
      "Dinámica",
      "G2",
      "G2",
      null
    ],
    [
      "Dinámica",
      "G3",
      "G3",
      null
    ],
    [
      "Dinámica",
      "G4",
      "G4",
      null
    ],
    [
      "Ciencia e Ing. de Materiales",
      "G1",
      "G1",
      null
    ],
    [
      "Ciencia e Ing. de Materiales",
      "G2",
      "G2",
      null
    ],
    [
      "Ciencia e Ing. de Materiales",
      "G3",
      "G3",
      null
    ],
    [
      "Ciencia e Ing. de Materiales",
      "G4",
      "G4",
      null
    ],
    [
      "Resistencia de Materiales",
      "G1",
      "G1",
      null
    ],
    [
      "Resistencia de Materiales",
      "G2",
      "G2",
      null
    ],
    [
      "Resistencia de Materiales",
      "G3",
      "G3",
      null
    ],
    [
      "Señales y Sistemas II",
      "G1",
      "G1",
      null
    ],
    [
      "Señales y Sistemas II",
      "G2",
      "G2",
      null
    ],
    [
      "Señales y Sistemas II",
      "G3",
      "G3",
      null
    ],
    [
      "Señales y Sistemas II",
      "G4",
      "G4",
      null
    ],
    [
      "Diseño Mecatrónico",
      "G1",
      "G1",
      null
    ],
    [
      "Diseño Mecatrónico",
      "G2",
      "G2",
      null
    ],
    [
      "Control",
      "M1+L1",
      "M1",
      "L1"
    ],
    [
      "Control",
      "M1+L2",
      "M1",
      "L2"
    ],
    [
      "Control",
      "M2+L3",
      "M2",
      "L3"
    ],
    [
      "Control",
      "M2+L4",
      "M2",
      "L4"
    ],
    [
      "Control",
      "M3+L5",
      "M3",
      "L5"
    ],
    [
      "Control",
      "M3+L6",
      "M3",
      "L6"
    ],
    [
      "Control",
      "M4+L7",
      "M4",
      "L7"
    ],
    [
      "Control",
      "M4+L8",
      "M4",
      "L8"
    ],
    [
      "Sensores y Actuadores",
      "G1",
      "T1",
      "Mag"
    ],
    [
      "Sensores y Actuadores",
      "G2",
      "T2",
      "Mag"
    ],
    [
      "Microcontroladores",
      "G1",
      "G1",
      null
    ],
    [
      "Microcontroladores",
      "G2",
      "G2",
      null
    ],
    [
      "Robótica",
      "G1",
      "T1",
      "Mag"
    ],
    [
      "Robótica",
      "G2",
      "T2",
      "Mag"
    ],
    [
      "Robótica",
      "G3",
      "T3",
      "Mag"
    ],
    [
      "Servomecanismos",
      "G1",
      "T1",
      "Mag"
    ],
    [
      "Servomecanismos",
      "G2",
      "T2",
      "Mag"
    ],
    [
      "Automatización de Procesos",
      "G1",
      "G1",
      null
    ],
    [
      "Cálculo Diferencial",
      "G1",
      "G1",
      null
    ],
    [
      "Cálculo Diferencial",
      "G10",
      "G10",
      null
    ],
    [
      "Cálculo Diferencial",
      "G11",
      "G11",
      null
    ],
    [
      "Cálculo Diferencial",
      "G12",
      "G12",
      null
    ],
    [
      "Cálculo Diferencial",
      "G13",
      "G13",
      null
    ],
    [
      "Cálculo Diferencial",
      "G14",
      "G14",
      null
    ],
    [
      "Cálculo Diferencial",
      "G15",
      "G15",
      null
    ],
    [
      "Cálculo Diferencial",
      "G16",
      "G16",
      null
    ],
    [
      "Cálculo Diferencial",
      "G17",
      "G17",
      null
    ],
    [
      "Cálculo Diferencial",
      "G19",
      "G19",
      null
    ],
    [
      "Cálculo Diferencial",
      "G2",
      "G2",
      null
    ],
    [
      "Cálculo Diferencial",
      "G20",
      "G20",
      null
    ],
    [
      "Cálculo Diferencial",
      "G21",
      "G21",
      null
    ],
    [
      "Cálculo Diferencial",
      "G22",
      "G22",
      null
    ],
    [
      "Cálculo Diferencial",
      "G24",
      "G24",
      null
    ],
    [
      "Cálculo Diferencial",
      "G25",
      "G25",
      null
    ],
    [
      "Cálculo Diferencial",
      "G27",
      "G27",
      null
    ],
    [
      "Cálculo Diferencial",
      "G28",
      "G28",
      null
    ],
    [
      "Cálculo Diferencial",
      "G29",
      "G29",
      null
    ],
    [
      "Cálculo Diferencial",
      "G3",
      "G3",
      null
    ],
    [
      "Cálculo Diferencial",
      "G30",
      "G30",
      null
    ],
    [
      "Cálculo Diferencial",
      "G32",
      "G32",
      null
    ],
    [
      "Cálculo Diferencial",
      "G4",
      "G4",
      null
    ],
    [
      "Cálculo Diferencial",
      "G5",
      "G5",
      null
    ],
    [
      "Cálculo Diferencial",
      "G7",
      "G7",
      null
    ],
    [
      "Cálculo Diferencial",
      "G8",
      "G8",
      null
    ],
    [
      "Cálculo Diferencial",
      "G9",
      "G9",
      null
    ],
    [
      "Cálculo Diferencial",
      "GORIN-03",
      "GORIN-03",
      null
    ],
    [
      "Cálculo Diferencial",
      "GORIN-04",
      "GORIN-04",
      null
    ],
    [
      "Cálculo Diferencial",
      "GTUMA-01",
      "GTUMA-01",
      null
    ],
    [
      "Cálculo Diferencial",
      "GTUMA-02",
      "GTUMA-02",
      null
    ],
    [
      "Cálculo Diferencial",
      "GTUMA-03",
      "GTUMA-03",
      null
    ],
    [
      "Cálculo Diferencial",
      "GAMAZ-01",
      "GAMAZ-01",
      null
    ],
    [
      "Cálculo Diferencial",
      "GAMAZ-02",
      "GAMAZ-02",
      null
    ],
    [
      "Cálculo Diferencial",
      "GCARI-01",
      "GCARI-01",
      null
    ],
    [
      "Cálculo Diferencial",
      "GORIN-01",
      "GORIN-01",
      null
    ],
    [
      "Cálculo Diferencial",
      "GORIN-02",
      "GORIN-02",
      null
    ],
    [
      "Dibujo básico",
      "GSUMA-01",
      "GSUMA-01",
      null
    ],
    [
      "Dibujo básico",
      "GORIN-01",
      "GORIN-01",
      null
    ],
    [
      "Programación de Computadores",
      "G1",
      "G1",
      null
    ],
    [
      "Programación de Computadores",
      "G10",
      "G10",
      null
    ],
    [
      "Programación de Computadores",
      "G11",
      "G11",
      null
    ],
    [
      "Programación de Computadores",
      "G12",
      "G12",
      null
    ],
    [
      "Programación de Computadores",
      "G13",
      "G13",
      null
    ],
    [
      "Programación de Computadores",
      "G14",
      "G14",
      null
    ],
    [
      "Programación de Computadores",
      "G2",
      "G2",
      null
    ],
    [
      "Programación de Computadores",
      "G3",
      "G3",
      null
    ],
    [
      "Programación de Computadores",
      "G4",
      "G4",
      null
    ],
    [
      "Programación de Computadores",
      "G5",
      "G5",
      null
    ],
    [
      "Programación de Computadores",
      "G6",
      "G6",
      null
    ],
    [
      "Programación de Computadores",
      "G7",
      "G7",
      null
    ],
    [
      "Programación de Computadores",
      "G8",
      "G8",
      null
    ],
    [
      "Programación de Computadores",
      "G9",
      "G9",
      null
    ],
    [
      "Programación de Computadores",
      "GCARI-01",
      "GCARI-01",
      null
    ],
    [
      "Programación de Computadores",
      "GORIN-01",
      "GORIN-01",
      null
    ],
    [
      "Programación de Computadores",
      "GSUMA-01",
      "GSUMA-01",
      null
    ],
    [
      "Programación de Computadores",
      "GTUMA-01",
      "GTUMA-01",
      null
    ],
    [
      "Cálculo Integral",
      "G1",
      "G1",
      null
    ],
    [
      "Cálculo Integral",
      "GSUMA-01",
      "GSUMA-01",
      null
    ],
    [
      "Cálculo Integral",
      "G10",
      "G10",
      null
    ],
    [
      "Cálculo Integral",
      "G12",
      "G12",
      null
    ],
    [
      "Cálculo Integral",
      "G13",
      "G13",
      null
    ],
    [
      "Cálculo Integral",
      "G14",
      "G14",
      null
    ],
    [
      "Cálculo Integral",
      "G15",
      "G15",
      null
    ],
    [
      "Cálculo Integral",
      "G16",
      "G16",
      null
    ],
    [
      "Cálculo Integral",
      "G17",
      "G17",
      null
    ],
    [
      "Cálculo Integral",
      "G19",
      "G19",
      null
    ],
    [
      "Cálculo Integral",
      "G2",
      "G2",
      null
    ],
    [
      "Cálculo Integral",
      "G20",
      "G20",
      null
    ],
    [
      "Cálculo Integral",
      "G21",
      "G21",
      null
    ],
    [
      "Cálculo Integral",
      "G22",
      "G22",
      null
    ],
    [
      "Cálculo Integral",
      "G3",
      "G3",
      null
    ],
    [
      "Cálculo Integral",
      "G4",
      "G4",
      null
    ],
    [
      "Cálculo Integral",
      "G6",
      "G6",
      null
    ],
    [
      "Cálculo Integral",
      "G7",
      "G7",
      null
    ],
    [
      "Cálculo Integral",
      "G8",
      "G8",
      null
    ],
    [
      "Cálculo Integral",
      "G9",
      "G9",
      null
    ],
    [
      "Cálculo Integral",
      "GORIN-02",
      "GORIN-02",
      null
    ],
    [
      "Cálculo Integral",
      "GTUMA-01",
      "GTUMA-01",
      null
    ],
    [
      "Cálculo Integral",
      "GORIN-01",
      "GORIN-01",
      null
    ],
    [
      "Fundamentos de Mecánica",
      "GSUMA-01",
      "GSUMA-01",
      null
    ],
    [
      "Fundamentos de Mecánica",
      "G1",
      "G1",
      null
    ],
    [
      "Fundamentos de Mecánica",
      "G10",
      "G10",
      null
    ],
    [
      "Fundamentos de Mecánica",
      "G11",
      "G11",
      null
    ],
    [
      "Fundamentos de Mecánica",
      "G12",
      "G12",
      null
    ],
    [
      "Fundamentos de Mecánica",
      "G13",
      "G13",
      null
    ],
    [
      "Fundamentos de Mecánica",
      "G14",
      "G14",
      null
    ],
    [
      "Fundamentos de Mecánica",
      "G15",
      "G15",
      null
    ],
    [
      "Fundamentos de Mecánica",
      "G16",
      "G16",
      null
    ],
    [
      "Fundamentos de Mecánica",
      "G17",
      "G17",
      null
    ],
    [
      "Fundamentos de Mecánica",
      "G18",
      "G18",
      null
    ],
    [
      "Fundamentos de Mecánica",
      "G19",
      "G19",
      null
    ],
    [
      "Fundamentos de Mecánica",
      "G2",
      "G2",
      null
    ],
    [
      "Fundamentos de Mecánica",
      "G20",
      "G20",
      null
    ],
    [
      "Fundamentos de Mecánica",
      "G21",
      "G21",
      null
    ],
    [
      "Fundamentos de Mecánica",
      "G22",
      "G22",
      null
    ],
    [
      "Fundamentos de Mecánica",
      "G23",
      "G23",
      null
    ],
    [
      "Fundamentos de Mecánica",
      "G24",
      "G24",
      null
    ],
    [
      "Fundamentos de Mecánica",
      "G25",
      "G25",
      null
    ],
    [
      "Fundamentos de Mecánica",
      "G26",
      "G26",
      null
    ],
    [
      "Fundamentos de Mecánica",
      "G27",
      "G27",
      null
    ],
    [
      "Fundamentos de Mecánica",
      "G28",
      "G28",
      null
    ],
    [
      "Fundamentos de Mecánica",
      "G29",
      "G29",
      null
    ],
    [
      "Fundamentos de Mecánica",
      "G3",
      "G3",
      null
    ],
    [
      "Fundamentos de Mecánica",
      "G4",
      "G4",
      null
    ],
    [
      "Fundamentos de Mecánica",
      "G5",
      "G5",
      null
    ],
    [
      "Fundamentos de Mecánica",
      "G6",
      "G6",
      null
    ],
    [
      "Fundamentos de Mecánica",
      "G7",
      "G7",
      null
    ],
    [
      "Fundamentos de Mecánica",
      "G8",
      "G8",
      null
    ],
    [
      "Fundamentos de Mecánica",
      "G9",
      "G9",
      null
    ],
    [
      "Fundamentos de Mecánica",
      "GTUMA-01",
      "GTUMA-01",
      null
    ],
    [
      "Álgebra Lineal",
      "G1",
      "G1",
      null
    ],
    [
      "Álgebra Lineal",
      "GSUMA-01",
      "GSUMA-01",
      null
    ],
    [
      "Álgebra Lineal",
      "G10",
      "G10",
      null
    ],
    [
      "Álgebra Lineal",
      "G11",
      "G11",
      null
    ],
    [
      "Álgebra Lineal",
      "G12",
      "G12",
      null
    ],
    [
      "Álgebra Lineal",
      "G13",
      "G13",
      null
    ],
    [
      "Álgebra Lineal",
      "G15",
      "G15",
      null
    ],
    [
      "Álgebra Lineal",
      "G16",
      "G16",
      null
    ],
    [
      "Álgebra Lineal",
      "G17",
      "G17",
      null
    ],
    [
      "Álgebra Lineal",
      "G18",
      "G18",
      null
    ],
    [
      "Álgebra Lineal",
      "G2",
      "G2",
      null
    ],
    [
      "Álgebra Lineal",
      "G20",
      "G20",
      null
    ],
    [
      "Álgebra Lineal",
      "G21",
      "G21",
      null
    ],
    [
      "Álgebra Lineal",
      "G22",
      "G22",
      null
    ],
    [
      "Álgebra Lineal",
      "G3",
      "G3",
      null
    ],
    [
      "Álgebra Lineal",
      "G4",
      "G4",
      null
    ],
    [
      "Álgebra Lineal",
      "G5",
      "G5",
      null
    ],
    [
      "Álgebra Lineal",
      "G7",
      "G7",
      null
    ],
    [
      "Álgebra Lineal",
      "G8",
      "G8",
      null
    ],
    [
      "Álgebra Lineal",
      "GTUMA-01",
      "GTUMA-01",
      null
    ],
    [
      "Álgebra Lineal",
      "GORIN-01",
      "GORIN-01",
      null
    ],
    [
      "Cálculo en Varias Variables",
      "G1",
      "G1",
      null
    ],
    [
      "Cálculo en Varias Variables",
      "G10",
      "G10",
      null
    ],
    [
      "Cálculo en Varias Variables",
      "G11",
      "G11",
      null
    ],
    [
      "Cálculo en Varias Variables",
      "G12",
      "G12",
      null
    ],
    [
      "Cálculo en Varias Variables",
      "G13",
      "G13",
      null
    ],
    [
      "Cálculo en Varias Variables",
      "G14",
      "G14",
      null
    ],
    [
      "Cálculo en Varias Variables",
      "G15",
      "G15",
      null
    ],
    [
      "Cálculo en Varias Variables",
      "G2",
      "G2",
      null
    ],
    [
      "Cálculo en Varias Variables",
      "G3",
      "G3",
      null
    ],
    [
      "Cálculo en Varias Variables",
      "G4",
      "G4",
      null
    ],
    [
      "Cálculo en Varias Variables",
      "G5",
      "G5",
      null
    ],
    [
      "Cálculo en Varias Variables",
      "G7",
      "G7",
      null
    ],
    [
      "Cálculo en Varias Variables",
      "G8",
      "G8",
      null
    ],
    [
      "Cálculo en Varias Variables",
      "G9",
      "G9",
      null
    ],
    [
      "Cálculo en Varias Variables",
      "GSUMA-01",
      "GSUMA-01",
      null
    ],
    [
      "Fundamentos de Electricidad y Magnetismo",
      "G1",
      "G1",
      null
    ],
    [
      "Fundamentos de Electricidad y Magnetismo",
      "G10",
      "G10",
      null
    ],
    [
      "Fundamentos de Electricidad y Magnetismo",
      "G11",
      "G11",
      null
    ],
    [
      "Fundamentos de Electricidad y Magnetismo",
      "G12",
      "G12",
      null
    ],
    [
      "Fundamentos de Electricidad y Magnetismo",
      "G13",
      "G13",
      null
    ],
    [
      "Fundamentos de Electricidad y Magnetismo",
      "G14",
      "G14",
      null
    ],
    [
      "Fundamentos de Electricidad y Magnetismo",
      "G15",
      "G15",
      null
    ],
    [
      "Fundamentos de Electricidad y Magnetismo",
      "G16",
      "G16",
      null
    ],
    [
      "Fundamentos de Electricidad y Magnetismo",
      "G2",
      "G2",
      null
    ],
    [
      "Fundamentos de Electricidad y Magnetismo",
      "G3",
      "G3",
      null
    ],
    [
      "Fundamentos de Electricidad y Magnetismo",
      "G4",
      "G4",
      null
    ],
    [
      "Fundamentos de Electricidad y Magnetismo",
      "G5",
      "G5",
      null
    ],
    [
      "Fundamentos de Electricidad y Magnetismo",
      "G6",
      "G6",
      null
    ],
    [
      "Fundamentos de Electricidad y Magnetismo",
      "G7",
      "G7",
      null
    ],
    [
      "Fundamentos de Electricidad y Magnetismo",
      "G8",
      "G8",
      null
    ],
    [
      "Fundamentos de Electricidad y Magnetismo",
      "G9",
      "G9",
      null
    ],
    [
      "Probabilidad y Estadística Fundamental",
      "G1",
      "G1",
      null
    ],
    [
      "Probabilidad y Estadística Fundamental",
      "GSUMA-01",
      "GSUMA-01",
      null
    ],
    [
      "Probabilidad y Estadística Fundamental",
      "G10",
      "G10",
      null
    ],
    [
      "Probabilidad y Estadística Fundamental",
      "G11",
      "G11",
      null
    ],
    [
      "Probabilidad y Estadística Fundamental",
      "G12",
      "G12",
      null
    ],
    [
      "Probabilidad y Estadística Fundamental",
      "G14",
      "G14",
      null
    ],
    [
      "Probabilidad y Estadística Fundamental",
      "G15",
      "G15",
      null
    ],
    [
      "Probabilidad y Estadística Fundamental",
      "G17",
      "G17",
      null
    ],
    [
      "Probabilidad y Estadística Fundamental",
      "G2",
      "G2",
      null
    ],
    [
      "Probabilidad y Estadística Fundamental",
      "G3",
      "G3",
      null
    ],
    [
      "Probabilidad y Estadística Fundamental",
      "G5",
      "G5",
      null
    ],
    [
      "Probabilidad y Estadística Fundamental",
      "G7",
      "G7",
      null
    ],
    [
      "Principios de Química",
      "GSUMA-01",
      "GSUMA-01",
      null
    ],
    [
      "Principios de Química",
      "G16",
      "G16",
      null
    ],
    [
      "Principios de Química",
      "G18",
      "G18",
      null
    ],
    [
      "Principios de Química",
      "G19",
      "G19",
      null
    ],
    [
      "Principios de Química",
      "G6",
      "G6",
      null
    ],
    [
      "Principios de Química",
      "G8",
      "G8",
      null
    ],
    [
      "Principios de Química",
      "GTUMA-01",
      "GTUMA-01",
      null
    ],
    [
      "Principios de Química",
      "GTUMA-02",
      "GTUMA-02",
      null
    ],
    [
      "Principios de Química",
      "GCARI-01",
      "GCARI-01",
      null
    ],
    [
      "Principios de Química",
      "GAMAZ-01",
      "GAMAZ-01",
      null
    ],
    [
      "Principios de Química",
      "GAMAZ-02",
      "GAMAZ-02",
      null
    ],
    [
      "Principios de Química",
      "GORIN-01",
      "GORIN-01",
      null
    ],
    [
      "Principios de Química",
      "GORIN-02",
      "GORIN-02",
      null
    ],
    [
      "Ecuaciones Diferenciales",
      "G1",
      "G1",
      null
    ],
    [
      "Ecuaciones Diferenciales",
      "G11",
      "G11",
      null
    ],
    [
      "Ecuaciones Diferenciales",
      "G12",
      "G12",
      null
    ],
    [
      "Ecuaciones Diferenciales",
      "G13",
      "G13",
      null
    ],
    [
      "Ecuaciones Diferenciales",
      "G14",
      "G14",
      null
    ],
    [
      "Ecuaciones Diferenciales",
      "G3",
      "G3",
      null
    ],
    [
      "Ecuaciones Diferenciales",
      "G4",
      "G4",
      null
    ],
    [
      "Ecuaciones Diferenciales",
      "G6",
      "G6",
      null
    ],
    [
      "Ecuaciones Diferenciales",
      "G7",
      "G7",
      null
    ],
    [
      "Ecuaciones Diferenciales",
      "G9",
      "G9",
      null
    ],
    [
      "Ecuaciones Diferenciales",
      "GSUMA-01",
      "GSUMA-01",
      null
    ],
    [
      "Variable Compleja",
      "G2",
      "G2",
      null
    ],
    [
      "Variable Compleja",
      "G3",
      "G3",
      null
    ],
    [
      "Variable Compleja",
      "G4",
      "G4",
      null
    ],
    [
      "Variable Compleja",
      "G5",
      "G5",
      null
    ],
    [
      "Variable Compleja",
      "G6",
      "G6",
      null
    ],
    [
      "Ingeniería Económica",
      "G1",
      "G1",
      null
    ],
    [
      "Ingeniería Económica",
      "G10",
      "G10",
      null
    ],
    [
      "Ingeniería Económica",
      "G11",
      "G11",
      null
    ],
    [
      "Ingeniería Económica",
      "G2",
      "G2",
      null
    ],
    [
      "Ingeniería Económica",
      "G3",
      "G3",
      null
    ],
    [
      "Ingeniería Económica",
      "G4",
      "G4",
      null
    ],
    [
      "Ingeniería Económica",
      "G5",
      "G5",
      null
    ],
    [
      "Ingeniería Económica",
      "G6",
      "G6",
      null
    ],
    [
      "Ingeniería Económica",
      "G7",
      "G7",
      null
    ],
    [
      "Ingeniería Económica",
      "G8",
      "G8",
      null
    ],
    [
      "Ingeniería Económica",
      "G9",
      "G9",
      null
    ],
    [
      "Inglés I",
      "G1",
      "G1",
      null
    ],
    [
      "Inglés I",
      "G2",
      "G2",
      null
    ],
    [
      "Inglés I",
      "G3",
      "G3",
      null
    ],
    [
      "Inglés I",
      "G4",
      "G4",
      null
    ],
    [
      "Inglés I",
      "G5",
      "G5",
      null
    ],
    [
      "Inglés I",
      "G6",
      "G6",
      null
    ],
    [
      "Inglés I",
      "G7",
      "G7",
      null
    ],
    [
      "Inglés I",
      "G8",
      "G8",
      null
    ],
    [
      "Inglés I",
      "G9",
      "G9",
      null
    ],
    [
      "Inglés I",
      "GAMAZ-07",
      "GAMAZ-07",
      null
    ],
    [
      "Inglés I",
      "GAMAZ-08",
      "GAMAZ-08",
      null
    ],
    [
      "Inglés I",
      "GAMAZ-09",
      "GAMAZ-09",
      null
    ],
    [
      "Inglés I",
      "GAMAZ-10",
      "GAMAZ-10",
      null
    ],
    [
      "Inglés I",
      "GAMAZ-11",
      "GAMAZ-11",
      null
    ],
    [
      "Inglés I",
      "GAMAZ-12",
      "GAMAZ-12",
      null
    ],
    [
      "Inglés I",
      "GCARI-02",
      "GCARI-02",
      null
    ],
    [
      "Inglés I",
      "GAMAZ-06",
      "GAMAZ-06",
      null
    ],
    [
      "Inglés I",
      "GAMAZ-01",
      "GAMAZ-01",
      null
    ],
    [
      "Inglés I",
      "GAMAZ-02",
      "GAMAZ-02",
      null
    ],
    [
      "Inglés I",
      "GAMAZ-03",
      "GAMAZ-03",
      null
    ],
    [
      "Inglés I",
      "GAMAZ-04",
      "GAMAZ-04",
      null
    ],
    [
      "Inglés I",
      "GAMAZ-05",
      "GAMAZ-05",
      null
    ],
    [
      "Inglés I",
      "GTUMA-01",
      "GTUMA-01",
      null
    ],
    [
      "Inglés I",
      "GTUMA-02",
      "GTUMA-02",
      null
    ],
    [
      "Inglés I",
      "GTUMA-03",
      "GTUMA-03",
      null
    ],
    [
      "Inglés I",
      "GTUMA-04",
      "GTUMA-04",
      null
    ],
    [
      "Inglés I",
      "GCARI-01",
      "GCARI-01",
      null
    ],
    [
      "Inglés I",
      "GORIN-03",
      "GORIN-03",
      null
    ],
    [
      "Inglés I",
      "GORIN-02",
      "GORIN-02",
      null
    ],
    [
      "Inglés II",
      "G1",
      "G1",
      null
    ],
    [
      "Inglés II",
      "GORIN-01",
      "GORIN-01",
      null
    ],
    [
      "Inglés II",
      "G10",
      "G10",
      null
    ],
    [
      "Inglés II",
      "G11",
      "G11",
      null
    ],
    [
      "Inglés II",
      "G12",
      "G12",
      null
    ],
    [
      "Inglés II",
      "G13",
      "G13",
      null
    ],
    [
      "Inglés II",
      "G14",
      "G14",
      null
    ],
    [
      "Inglés II",
      "G15",
      "G15",
      null
    ],
    [
      "Inglés II",
      "G16",
      "G16",
      null
    ],
    [
      "Inglés II",
      "G2",
      "G2",
      null
    ],
    [
      "Inglés II",
      "G3",
      "G3",
      null
    ],
    [
      "Inglés II",
      "G4",
      "G4",
      null
    ],
    [
      "Inglés II",
      "G5",
      "G5",
      null
    ],
    [
      "Inglés II",
      "G6",
      "G6",
      null
    ],
    [
      "Inglés II",
      "G7",
      "G7",
      null
    ],
    [
      "Inglés II",
      "G8",
      "G8",
      null
    ],
    [
      "Inglés II",
      "G9",
      "G9",
      null
    ],
    [
      "Inglés II",
      "GAMAZ-01",
      "GAMAZ-01",
      null
    ],
    [
      "Inglés II",
      "GAMAZ-03",
      "GAMAZ-03",
      null
    ],
    [
      "Inglés II",
      "GAMAZ-05",
      "GAMAZ-05",
      null
    ],
    [
      "Inglés II",
      "GCARI-02",
      "GCARI-02",
      null
    ],
    [
      "Inglés II",
      "GAMAZ-02",
      "GAMAZ-02",
      null
    ],
    [
      "Inglés II",
      "GAMAZ-04",
      "GAMAZ-04",
      null
    ],
    [
      "Inglés II",
      "GAMAZ-06",
      "GAMAZ-06",
      null
    ],
    [
      "Inglés II",
      "GTUMA-01",
      "GTUMA-01",
      null
    ],
    [
      "Inglés II",
      "GTUMA-02",
      "GTUMA-02",
      null
    ],
    [
      "Inglés II",
      "GTUMA-03",
      "GTUMA-03",
      null
    ],
    [
      "Inglés II",
      "GCARI-01",
      "GCARI-01",
      null
    ],
    [
      "Inglés III",
      "G1",
      "G1",
      null
    ],
    [
      "Inglés III",
      "G10",
      "G10",
      null
    ],
    [
      "Inglés III",
      "G11",
      "G11",
      null
    ],
    [
      "Inglés III",
      "G12",
      "G12",
      null
    ],
    [
      "Inglés III",
      "G13",
      "G13",
      null
    ],
    [
      "Inglés III",
      "G14",
      "G14",
      null
    ],
    [
      "Inglés III",
      "G15",
      "G15",
      null
    ],
    [
      "Inglés III",
      "G16",
      "G16",
      null
    ],
    [
      "Inglés III",
      "G17",
      "G17",
      null
    ],
    [
      "Inglés III",
      "G18",
      "G18",
      null
    ],
    [
      "Inglés III",
      "G2",
      "G2",
      null
    ],
    [
      "Inglés III",
      "G3",
      "G3",
      null
    ],
    [
      "Inglés III",
      "G4",
      "G4",
      null
    ],
    [
      "Inglés III",
      "G5",
      "G5",
      null
    ],
    [
      "Inglés III",
      "G6",
      "G6",
      null
    ],
    [
      "Inglés III",
      "G7",
      "G7",
      null
    ],
    [
      "Inglés III",
      "G8",
      "G8",
      null
    ],
    [
      "Inglés III",
      "G9",
      "G9",
      null
    ],
    [
      "Inglés III",
      "GAMAZ-02",
      "GAMAZ-02",
      null
    ],
    [
      "Inglés III",
      "GORIN-02",
      "GORIN-02",
      null
    ],
    [
      "Inglés III",
      "GCARI-01",
      "GCARI-01",
      null
    ],
    [
      "Inglés III",
      "GAMAZ-01",
      "GAMAZ-01",
      null
    ],
    [
      "Inglés III",
      "GTUMA-02",
      "GTUMA-02",
      null
    ],
    [
      "Inglés III",
      "GCARI-02",
      "GCARI-02",
      null
    ],
    [
      "Inglés IV",
      "G1",
      "G1",
      null
    ],
    [
      "Inglés IV",
      "G10",
      "G10",
      null
    ],
    [
      "Inglés IV",
      "G11",
      "G11",
      null
    ],
    [
      "Inglés IV",
      "G12",
      "G12",
      null
    ],
    [
      "Inglés IV",
      "G13",
      "G13",
      null
    ],
    [
      "Inglés IV",
      "G14",
      "G14",
      null
    ],
    [
      "Inglés IV",
      "G15",
      "G15",
      null
    ],
    [
      "Inglés IV",
      "G16",
      "G16",
      null
    ],
    [
      "Inglés IV",
      "G17",
      "G17",
      null
    ],
    [
      "Inglés IV",
      "G18",
      "G18",
      null
    ],
    [
      "Inglés IV",
      "G19",
      "G19",
      null
    ],
    [
      "Inglés IV",
      "G2",
      "G2",
      null
    ],
    [
      "Inglés IV",
      "G20",
      "G20",
      null
    ],
    [
      "Inglés IV",
      "G21",
      "G21",
      null
    ],
    [
      "Inglés IV",
      "G22",
      "G22",
      null
    ],
    [
      "Inglés IV",
      "G3",
      "G3",
      null
    ],
    [
      "Inglés IV",
      "G4",
      "G4",
      null
    ],
    [
      "Inglés IV",
      "G5",
      "G5",
      null
    ],
    [
      "Inglés IV",
      "G6",
      "G6",
      null
    ],
    [
      "Inglés IV",
      "G7",
      "G7",
      null
    ],
    [
      "Inglés IV",
      "G8",
      "G8",
      null
    ],
    [
      "Inglés IV",
      "G9",
      "G9",
      null
    ],
    [
      "Inglés IV",
      "GCARI-02",
      "GCARI-02",
      null
    ],
    [
      "Inglés IV",
      "GTUMA-02",
      "GTUMA-02",
      null
    ],
    [
      "Inglés IV",
      "GTUMA-01",
      "GTUMA-01",
      null
    ],
    [
      "Inglés IV",
      "GCARI-01",
      "GCARI-01",
      null
    ]
  ],
  "bl": [
    [
      "Dibujo básico",
      "G1",
      "M",
      7,
      9,
      null
    ],
    [
      "Dibujo básico",
      "G1",
      "V",
      7,
      9,
      null
    ],
    [
      "Dibujo básico",
      "G12",
      "L",
      7,
      9,
      null
    ],
    [
      "Dibujo básico",
      "G12",
      "X",
      7,
      9,
      null
    ],
    [
      "Dibujo básico",
      "G13",
      "X",
      9,
      11,
      null
    ],
    [
      "Dibujo básico",
      "G13",
      "V",
      9,
      11,
      null
    ],
    [
      "Dibujo básico",
      "G15",
      "V",
      9,
      11,
      null
    ],
    [
      "Dibujo básico",
      "G15",
      "S",
      9,
      11,
      null
    ],
    [
      "Dibujo básico",
      "G2",
      "M",
      9,
      11,
      null
    ],
    [
      "Dibujo básico",
      "G2",
      "V",
      9,
      11,
      null
    ],
    [
      "Dibujo básico",
      "G3",
      "X",
      14,
      16,
      null
    ],
    [
      "Dibujo básico",
      "G3",
      "V",
      14,
      16,
      null
    ],
    [
      "Dibujo básico",
      "G6",
      "X",
      16,
      18,
      null
    ],
    [
      "Dibujo básico",
      "G6",
      "V",
      14,
      16,
      null
    ],
    [
      "Ing. y Des. Sostenible",
      "T1",
      "M",
      7,
      9,
      null
    ],
    [
      "Ing. y Des. Sostenible",
      "T3",
      "J",
      7,
      9,
      null
    ],
    [
      "Ing. y Des. Sostenible",
      "T4",
      "V",
      7,
      9,
      null
    ],
    [
      "Ing. y Des. Sostenible",
      "Mag",
      "L",
      11,
      13,
      null
    ],
    [
      "Tec. Mecánica Básica",
      "G1",
      "M",
      7,
      11,
      null
    ],
    [
      "Tec. Mecánica Básica",
      "G2",
      "M",
      13,
      17,
      null
    ],
    [
      "Tec. Mecánica Básica",
      "G3",
      "X",
      7,
      11,
      null
    ],
    [
      "Tec. Mecánica Básica",
      "G4",
      "X",
      13,
      17,
      null
    ],
    [
      "Tec. Mecánica Básica",
      "G6",
      "J",
      13,
      17,
      null
    ],
    [
      "Tec. Mecánica Básica",
      "G7",
      "V",
      7,
      11,
      null
    ],
    [
      "Tec. Mecánica Básica",
      "G8",
      "V",
      12,
      16,
      null
    ],
    [
      "Taller Ing. Electrónica",
      "G1",
      "J",
      10,
      13,
      null
    ],
    [
      "Taller Ing. Electrónica",
      "G2",
      "X",
      10,
      13,
      null
    ],
    [
      "Taller Ing. Electrónica",
      "G3",
      "X",
      7,
      10,
      null
    ],
    [
      "Taller Ing. Electrónica",
      "G4",
      "M",
      7,
      10,
      null
    ],
    [
      "Taller Ing. Electrónica",
      "G5",
      "V",
      14,
      17,
      null
    ],
    [
      "Taller Ing. Electrónica",
      "G6",
      "L",
      7,
      10,
      null
    ],
    [
      "Taller Ing. Electrónica",
      "G7",
      "L",
      10,
      13,
      null
    ],
    [
      "Estática",
      "G1",
      "L",
      9,
      11,
      null
    ],
    [
      "Estática",
      "G1",
      "X",
      9,
      11,
      null
    ],
    [
      "Estática",
      "G2",
      "M",
      14,
      16,
      null
    ],
    [
      "Estática",
      "G2",
      "J",
      14,
      16,
      null
    ],
    [
      "Estática",
      "G4",
      "L",
      9,
      11,
      null
    ],
    [
      "Estática",
      "G4",
      "X",
      9,
      11,
      null
    ],
    [
      "Estática",
      "G5",
      "M",
      7,
      9,
      null
    ],
    [
      "Estática",
      "G5",
      "J",
      7,
      9,
      null
    ],
    [
      "Estática",
      "G6",
      "M",
      11,
      13,
      null
    ],
    [
      "Estática",
      "G6",
      "J",
      11,
      13,
      null
    ],
    [
      "Dinámica",
      "G1",
      "M",
      9,
      11,
      null
    ],
    [
      "Dinámica",
      "G1",
      "J",
      9,
      11,
      null
    ],
    [
      "Dinámica",
      "G2",
      "M",
      11,
      13,
      null
    ],
    [
      "Dinámica",
      "G2",
      "J",
      9,
      11,
      null
    ],
    [
      "Dinámica",
      "G3",
      "X",
      11,
      13,
      null
    ],
    [
      "Dinámica",
      "G3",
      "V",
      11,
      13,
      null
    ],
    [
      "Dinámica",
      "G4",
      "M",
      11,
      13,
      null
    ],
    [
      "Dinámica",
      "G4",
      "J",
      11,
      13,
      null
    ],
    [
      "Ciencia e Ing. de Materiales",
      "G1",
      "L",
      7,
      9,
      null
    ],
    [
      "Ciencia e Ing. de Materiales",
      "G1",
      "X",
      7,
      9,
      null
    ],
    [
      "Ciencia e Ing. de Materiales",
      "G1",
      "V",
      7,
      9,
      null
    ],
    [
      "Ciencia e Ing. de Materiales",
      "G2",
      "L",
      9,
      11,
      null
    ],
    [
      "Ciencia e Ing. de Materiales",
      "G2",
      "M",
      9,
      11,
      null
    ],
    [
      "Ciencia e Ing. de Materiales",
      "G2",
      "J",
      9,
      11,
      null
    ],
    [
      "Ciencia e Ing. de Materiales",
      "G3",
      "L",
      11,
      13,
      null
    ],
    [
      "Ciencia e Ing. de Materiales",
      "G3",
      "M",
      11,
      13,
      null
    ],
    [
      "Ciencia e Ing. de Materiales",
      "G3",
      "V",
      11,
      13,
      null
    ],
    [
      "Ciencia e Ing. de Materiales",
      "G4",
      "M",
      14,
      16,
      null
    ],
    [
      "Ciencia e Ing. de Materiales",
      "G4",
      "X",
      14,
      16,
      null
    ],
    [
      "Ciencia e Ing. de Materiales",
      "G4",
      "J",
      14,
      16,
      null
    ],
    [
      "Resistencia de Materiales",
      "G1",
      "M",
      7,
      9,
      null
    ],
    [
      "Resistencia de Materiales",
      "G1",
      "J",
      7,
      9,
      null
    ],
    [
      "Resistencia de Materiales",
      "G2",
      "M",
      11,
      13,
      null
    ],
    [
      "Resistencia de Materiales",
      "G2",
      "J",
      11,
      13,
      null
    ],
    [
      "Resistencia de Materiales",
      "G3",
      "M",
      14,
      16,
      null
    ],
    [
      "Resistencia de Materiales",
      "G3",
      "J",
      14,
      16,
      null
    ],
    [
      "Señales y Sistemas II",
      "G1",
      "M",
      14,
      16,
      null
    ],
    [
      "Señales y Sistemas II",
      "G1",
      "J",
      14,
      16,
      null
    ],
    [
      "Señales y Sistemas II",
      "G2",
      "X",
      9,
      11,
      null
    ],
    [
      "Señales y Sistemas II",
      "G2",
      "V",
      9,
      11,
      null
    ],
    [
      "Señales y Sistemas II",
      "G3",
      "M",
      11,
      13,
      null
    ],
    [
      "Señales y Sistemas II",
      "G3",
      "J",
      11,
      13,
      null
    ],
    [
      "Señales y Sistemas II",
      "G4",
      "X",
      11,
      13,
      null
    ],
    [
      "Señales y Sistemas II",
      "G4",
      "V",
      11,
      13,
      null
    ],
    [
      "Diseño Mecatrónico",
      "G1",
      "X",
      7,
      9,
      null
    ],
    [
      "Diseño Mecatrónico",
      "G1",
      "V",
      7,
      9,
      null
    ],
    [
      "Diseño Mecatrónico",
      "G2",
      "X",
      7,
      9,
      null
    ],
    [
      "Diseño Mecatrónico",
      "G2",
      "V",
      7,
      9,
      null
    ],
    [
      "Control",
      "M1",
      "L",
      11,
      13,
      null
    ],
    [
      "Control",
      "M1",
      "X",
      11,
      13,
      null
    ],
    [
      "Control",
      "M2",
      "M",
      16,
      18,
      null
    ],
    [
      "Control",
      "M2",
      "J",
      16,
      18,
      null
    ],
    [
      "Control",
      "M3",
      "L",
      9,
      11,
      null
    ],
    [
      "Control",
      "M3",
      "X",
      9,
      11,
      null
    ],
    [
      "Control",
      "M4",
      "L",
      16,
      18,
      null
    ],
    [
      "Control",
      "M4",
      "X",
      16,
      18,
      null
    ],
    [
      "Control",
      "L1",
      "J",
      9,
      11,
      null
    ],
    [
      "Control",
      "L2",
      "J",
      11,
      13,
      null
    ],
    [
      "Control",
      "L3",
      "M",
      11,
      13,
      null
    ],
    [
      "Control",
      "L4",
      "M",
      14,
      16,
      null
    ],
    [
      "Control",
      "L5",
      "M",
      9,
      11,
      null
    ],
    [
      "Control",
      "L6",
      "X",
      11,
      13,
      null
    ],
    [
      "Control",
      "L7",
      "J",
      14,
      16,
      null
    ],
    [
      "Control",
      "L8",
      "J",
      16,
      18,
      null
    ],
    [
      "Sensores y Actuadores",
      "T1",
      "L",
      9,
      11,
      null
    ],
    [
      "Sensores y Actuadores",
      "T1",
      "L",
      11,
      13,
      null
    ],
    [
      "Sensores y Actuadores",
      "T2",
      "V",
      11,
      13,
      null
    ],
    [
      "Sensores y Actuadores",
      "T2",
      "V",
      14,
      16,
      null
    ],
    [
      "Sensores y Actuadores",
      "Mag",
      "M",
      9,
      11,
      null
    ],
    [
      "Microcontroladores",
      "G1",
      "J",
      11,
      13,
      null
    ],
    [
      "Microcontroladores",
      "G1",
      "J",
      14,
      16,
      null
    ],
    [
      "Microcontroladores",
      "G2",
      "M",
      11,
      13,
      null
    ],
    [
      "Microcontroladores",
      "G2",
      "M",
      14,
      16,
      null
    ],
    [
      "Robótica",
      "T1",
      "M",
      14,
      16,
      null
    ],
    [
      "Robótica",
      "T2",
      "X",
      14,
      16,
      null
    ],
    [
      "Robótica",
      "T3",
      "J",
      14,
      16,
      null
    ],
    [
      "Robótica",
      "Mag",
      "M",
      9,
      11,
      null
    ],
    [
      "Servomecanismos",
      "T1",
      "J",
      9,
      11,
      null
    ],
    [
      "Servomecanismos",
      "T2",
      "J",
      11,
      13,
      null
    ],
    [
      "Servomecanismos",
      "Mag",
      "V",
      11,
      13,
      null
    ],
    [
      "Automatización de Procesos",
      "G1",
      "X",
      14,
      16,
      null
    ],
    [
      "Automatización de Procesos",
      "G1",
      "V",
      14,
      16,
      null
    ],
    [
      "Cálculo Diferencial",
      "G1",
      "L",
      7,
      9,
      "TEORICA 1000004"
    ],
    [
      "Cálculo Diferencial",
      "G1",
      "X",
      7,
      9,
      "TEORICA 1000004"
    ],
    [
      "Cálculo Diferencial",
      "G10",
      "X",
      16,
      18,
      "TEORICA 1000004"
    ],
    [
      "Cálculo Diferencial",
      "G10",
      "V",
      16,
      18,
      "TEORICA 1000004"
    ],
    [
      "Cálculo Diferencial",
      "G11",
      "M",
      7,
      9,
      "TEORICA 1000004"
    ],
    [
      "Cálculo Diferencial",
      "G11",
      "J",
      7,
      9,
      "TEORICA 1000004"
    ],
    [
      "Cálculo Diferencial",
      "G12",
      "M",
      7,
      9,
      "TEORICA 1000004"
    ],
    [
      "Cálculo Diferencial",
      "G12",
      "J",
      7,
      9,
      "TEORICA 1000004"
    ],
    [
      "Cálculo Diferencial",
      "G13",
      "M",
      9,
      11,
      "TEORICA 1000004"
    ],
    [
      "Cálculo Diferencial",
      "G13",
      "J",
      9,
      11,
      "TEORICA 1000004"
    ],
    [
      "Cálculo Diferencial",
      "G14",
      "M",
      11,
      13,
      "TEORICA 1000004"
    ],
    [
      "Cálculo Diferencial",
      "G14",
      "J",
      11,
      13,
      "TEORICA 1000004"
    ],
    [
      "Cálculo Diferencial",
      "G15",
      "M",
      11,
      13,
      "TEORICA 1000004"
    ],
    [
      "Cálculo Diferencial",
      "G15",
      "J",
      11,
      13,
      "TEORICA 1000004"
    ],
    [
      "Cálculo Diferencial",
      "G16",
      "M",
      14,
      16,
      "TEORICA 1000004"
    ],
    [
      "Cálculo Diferencial",
      "G16",
      "J",
      14,
      16,
      "TEORICA 1000004"
    ],
    [
      "Cálculo Diferencial",
      "G17",
      "X",
      9,
      11,
      "TEORICA 1000004"
    ],
    [
      "Cálculo Diferencial",
      "G17",
      "V",
      9,
      11,
      "TEORICA 1000004"
    ],
    [
      "Cálculo Diferencial",
      "G19",
      "M",
      14,
      16,
      "TEORICA 1000004"
    ],
    [
      "Cálculo Diferencial",
      "G19",
      "J",
      14,
      16,
      "TEORICA 1000004"
    ],
    [
      "Cálculo Diferencial",
      "G2",
      "X",
      7,
      9,
      "TEORICA 1000004"
    ],
    [
      "Cálculo Diferencial",
      "G2",
      "V",
      7,
      9,
      "TEORICA 1000004"
    ],
    [
      "Cálculo Diferencial",
      "G20",
      "M",
      14,
      16,
      "TEORICA 1000004"
    ],
    [
      "Cálculo Diferencial",
      "G20",
      "J",
      14,
      16,
      "TEORICA 1000004"
    ],
    [
      "Cálculo Diferencial",
      "G21",
      "M",
      16,
      18,
      "TEORICA 1000004"
    ],
    [
      "Cálculo Diferencial",
      "G21",
      "J",
      16,
      18,
      "TEORICA 1000004"
    ],
    [
      "Cálculo Diferencial",
      "G22",
      "M",
      16,
      18,
      "TEORICA 1000004"
    ],
    [
      "Cálculo Diferencial",
      "G22",
      "J",
      16,
      18,
      "TEORICA 1000004"
    ],
    [
      "Cálculo Diferencial",
      "G24",
      "L",
      11,
      13,
      "TEORICA 1000004"
    ],
    [
      "Cálculo Diferencial",
      "G24",
      "X",
      11,
      13,
      "TEORICA 1000004"
    ],
    [
      "Cálculo Diferencial",
      "G25",
      "X",
      9,
      11,
      "TEORICA 1000004"
    ],
    [
      "Cálculo Diferencial",
      "G25",
      "V",
      9,
      11,
      "TEORICA 1000004"
    ],
    [
      "Cálculo Diferencial",
      "G27",
      "M",
      18,
      20,
      "TEORICA 1000004"
    ],
    [
      "Cálculo Diferencial",
      "G27",
      "J",
      18,
      20,
      "TEORICA 1000004"
    ],
    [
      "Cálculo Diferencial",
      "G28",
      "M",
      7,
      9,
      "TEORICA 1000004"
    ],
    [
      "Cálculo Diferencial",
      "G28",
      "J",
      7,
      9,
      "TEORICA 1000004"
    ],
    [
      "Cálculo Diferencial",
      "G29",
      "M",
      18,
      20,
      "TEORICA 1000004"
    ],
    [
      "Cálculo Diferencial",
      "G29",
      "J",
      18,
      20,
      "TEORICA 1000004"
    ],
    [
      "Cálculo Diferencial",
      "G3",
      "L",
      7,
      9,
      "TEORICA 1000004"
    ],
    [
      "Cálculo Diferencial",
      "G3",
      "X",
      7,
      9,
      "TEORICA 1000004"
    ],
    [
      "Cálculo Diferencial",
      "G30",
      "L",
      18,
      20,
      "TEORICA 1000004"
    ],
    [
      "Cálculo Diferencial",
      "G30",
      "X",
      18,
      20,
      "TEORICA 1000004"
    ],
    [
      "Cálculo Diferencial",
      "G32",
      "M",
      14,
      16,
      "TEORICA 1000004"
    ],
    [
      "Cálculo Diferencial",
      "G32",
      "J",
      14,
      16,
      "TEORICA 1000004"
    ],
    [
      "Cálculo Diferencial",
      "G4",
      "L",
      9,
      11,
      "TEORICA 1000004"
    ],
    [
      "Cálculo Diferencial",
      "G4",
      "X",
      9,
      11,
      "TEORICA 1000004"
    ],
    [
      "Cálculo Diferencial",
      "G5",
      "L",
      11,
      13,
      "TEORICA 1000004"
    ],
    [
      "Cálculo Diferencial",
      "G5",
      "X",
      11,
      13,
      "TEORICA 1000004"
    ],
    [
      "Cálculo Diferencial",
      "G7",
      "M",
      16,
      18,
      "TEORICA 1000004"
    ],
    [
      "Cálculo Diferencial",
      "G7",
      "J",
      16,
      18,
      "TEORICA 1000004"
    ],
    [
      "Cálculo Diferencial",
      "G8",
      "M",
      18,
      20,
      "TEORICA 1000004"
    ],
    [
      "Cálculo Diferencial",
      "G8",
      "J",
      18,
      20,
      "TEORICA 1000004"
    ],
    [
      "Cálculo Diferencial",
      "G9",
      "X",
      16,
      18,
      "TEORICA 1000004"
    ],
    [
      "Cálculo Diferencial",
      "G9",
      "V",
      16,
      18,
      "TEORICA 1000004"
    ],
    [
      "Cálculo Diferencial",
      "GORIN-03",
      "L",
      9,
      11,
      "TEORICA 1000004"
    ],
    [
      "Cálculo Diferencial",
      "GORIN-03",
      "X",
      9,
      11,
      "TEORICA 1000004"
    ],
    [
      "Cálculo Diferencial",
      "GORIN-03",
      "V",
      11,
      13,
      "TEORICA 1000004"
    ],
    [
      "Cálculo Diferencial",
      "GORIN-04",
      "M",
      16,
      18,
      "TEORICA 1000004"
    ],
    [
      "Cálculo Diferencial",
      "GORIN-04",
      "X",
      16,
      18,
      "TEORICA 1000004"
    ],
    [
      "Cálculo Diferencial",
      "GORIN-04",
      "J",
      9,
      11,
      "TEORICA 1000004"
    ],
    [
      "Cálculo Diferencial",
      "GTUMA-01",
      "L",
      7,
      9,
      "TEORICA 1000004"
    ],
    [
      "Cálculo Diferencial",
      "GTUMA-01",
      "X",
      15,
      17,
      "TEORICA 1000004"
    ],
    [
      "Cálculo Diferencial",
      "GTUMA-02",
      "X",
      13,
      15,
      "TEORICA 1000004"
    ],
    [
      "Cálculo Diferencial",
      "GTUMA-02",
      "J",
      15,
      17,
      "TEORICA 1000004"
    ],
    [
      "Cálculo Diferencial",
      "GTUMA-03",
      "L",
      7,
      9,
      "TEORICA 1000004"
    ],
    [
      "Cálculo Diferencial",
      "GTUMA-03",
      "J",
      15,
      17,
      "TEORICA 1000004"
    ],
    [
      "Cálculo Diferencial",
      "GAMAZ-01",
      "M",
      15,
      17,
      "TEORICA 1000004"
    ],
    [
      "Cálculo Diferencial",
      "GAMAZ-01",
      "J",
      15,
      17,
      "TEORICA 1000004"
    ],
    [
      "Cálculo Diferencial",
      "GAMAZ-02",
      "L",
      17,
      19,
      "TEORICA 1000004"
    ],
    [
      "Cálculo Diferencial",
      "GAMAZ-02",
      "X",
      17,
      19,
      "TEORICA 1000004"
    ],
    [
      "Cálculo Diferencial",
      "GCARI-01",
      "X",
      9,
      11,
      "TEORICA 1000004"
    ],
    [
      "Cálculo Diferencial",
      "GCARI-01",
      "V",
      9,
      11,
      "TEORICA 1000004"
    ],
    [
      "Cálculo Diferencial",
      "GORIN-01",
      "L",
      9,
      11,
      "TEORICA 1000004"
    ],
    [
      "Cálculo Diferencial",
      "GORIN-01",
      "X",
      9,
      11,
      "TEORICA 1000004"
    ],
    [
      "Cálculo Diferencial",
      "GORIN-01",
      "V",
      11,
      13,
      "TEORICA 1000004"
    ],
    [
      "Cálculo Diferencial",
      "GORIN-02",
      "M",
      16,
      18,
      "TEORICA 1000004"
    ],
    [
      "Cálculo Diferencial",
      "GORIN-02",
      "X",
      16,
      18,
      "TEORICA 1000004"
    ],
    [
      "Cálculo Diferencial",
      "GORIN-02",
      "J",
      9,
      11,
      "TEORICA 1000004"
    ],
    [
      "Dibujo básico",
      "GSUMA-01",
      "L",
      14,
      17,
      "TEORICA 2015711"
    ],
    [
      "Dibujo básico",
      "GSUMA-01",
      "V",
      14,
      17,
      "TEORICA 2015711"
    ],
    [
      "Dibujo básico",
      "GORIN-01",
      "L",
      14,
      17,
      "TEORICA 2015711"
    ],
    [
      "Dibujo básico",
      "GORIN-01",
      "V",
      14,
      17,
      "TEORICA 2015711"
    ],
    [
      "Programación de Computadores",
      "G1",
      "M",
      7,
      9,
      "PRACTICA-Programación de Computadores"
    ],
    [
      "Programación de Computadores",
      "G1",
      "J",
      7,
      9,
      "PRACTICA-Programación de Computadores"
    ],
    [
      "Programación de Computadores",
      "G10",
      "M",
      11,
      13,
      "PRACTICA-Programación de Computadores"
    ],
    [
      "Programación de Computadores",
      "G10",
      "J",
      11,
      13,
      "PRACTICA-Programación de Computadores"
    ],
    [
      "Programación de Computadores",
      "G11",
      "L",
      11,
      13,
      "PRACTICA-Programación de Computadores"
    ],
    [
      "Programación de Computadores",
      "G11",
      "X",
      11,
      13,
      "PRACTICA-Programación de Computadores"
    ],
    [
      "Programación de Computadores",
      "G12",
      "M",
      7,
      9,
      "PRACTICA-Programación de Computadores"
    ],
    [
      "Programación de Computadores",
      "G12",
      "J",
      7,
      9,
      "PRACTICA-Programación de Computadores"
    ],
    [
      "Programación de Computadores",
      "G13",
      "L",
      9,
      11,
      "PRACTICA-Programación de Computadores"
    ],
    [
      "Programación de Computadores",
      "G13",
      "X",
      9,
      11,
      "PRACTICA-Programación de Computadores"
    ],
    [
      "Programación de Computadores",
      "G14",
      "L",
      9,
      11,
      "PRACTICA-Programación de Computadores"
    ],
    [
      "Programación de Computadores",
      "G14",
      "X",
      9,
      11,
      "PRACTICA-Programación de Computadores"
    ],
    [
      "Programación de Computadores",
      "G2",
      "M",
      9,
      11,
      "PRACTICA-Programación de Computadores"
    ],
    [
      "Programación de Computadores",
      "G2",
      "J",
      9,
      11,
      "PRACTICA-Programación de Computadores"
    ],
    [
      "Programación de Computadores",
      "G3",
      "L",
      14,
      16,
      "PRACTICA-Programación de Computadores"
    ],
    [
      "Programación de Computadores",
      "G3",
      "X",
      14,
      16,
      "PRACTICA-Programación de Computadores"
    ],
    [
      "Programación de Computadores",
      "G4",
      "M",
      9,
      11,
      "PRACTICA-Programación de Computadores"
    ],
    [
      "Programación de Computadores",
      "G4",
      "J",
      9,
      11,
      "PRACTICA-Programación de Computadores"
    ],
    [
      "Programación de Computadores",
      "G5",
      "L",
      11,
      13,
      "PRACTICA-Programación de Computadores"
    ],
    [
      "Programación de Computadores",
      "G5",
      "X",
      11,
      13,
      "PRACTICA-Programación de Computadores"
    ],
    [
      "Programación de Computadores",
      "G6",
      "L",
      7,
      9,
      "PRACTICA-Programación de Computadores"
    ],
    [
      "Programación de Computadores",
      "G6",
      "X",
      7,
      9,
      "PRACTICA-Programación de Computadores"
    ],
    [
      "Programación de Computadores",
      "G7",
      "M",
      14,
      16,
      "PRACTICA-Programación de Computadores"
    ],
    [
      "Programación de Computadores",
      "G7",
      "J",
      14,
      16,
      "PRACTICA-Programación de Computadores"
    ],
    [
      "Programación de Computadores",
      "G8",
      "X",
      6,
      8,
      "PRACTICA-Programación de Computadores"
    ],
    [
      "Programación de Computadores",
      "G8",
      "V",
      6,
      8,
      "PRACTICA-Programación de Computadores"
    ],
    [
      "Programación de Computadores",
      "G9",
      "X",
      7,
      9,
      "PRACTICA-Programación de Computadores"
    ],
    [
      "Programación de Computadores",
      "G9",
      "V",
      7,
      9,
      "PRACTICA-Programación de Computadores"
    ],
    [
      "Programación de Computadores",
      "GCARI-01",
      "X",
      11,
      13,
      "PRACTICA-Programación de Computadores"
    ],
    [
      "Programación de Computadores",
      "GCARI-01",
      "V",
      11,
      13,
      "PRACTICA-Programación de Computadores"
    ],
    [
      "Programación de Computadores",
      "GORIN-01",
      "J",
      11,
      13,
      "PRACTICA-Programación de Computadores"
    ],
    [
      "Programación de Computadores",
      "GORIN-01",
      "V",
      11,
      13,
      "PRACTICA-Programación de Computadores"
    ],
    [
      "Programación de Computadores",
      "GTUMA-01",
      "L",
      9,
      11,
      "PRACTICA-Programación de Computadores"
    ],
    [
      "Programación de Computadores",
      "GTUMA-01",
      "X",
      15,
      17,
      "PRACTICA-Programación de Computadores"
    ],
    [
      "Cálculo Integral",
      "G1",
      "L",
      7,
      9,
      "TEORICA 1000005"
    ],
    [
      "Cálculo Integral",
      "G1",
      "X",
      7,
      9,
      "TEORICA 1000005"
    ],
    [
      "Cálculo Integral",
      "G10",
      "M",
      14,
      16,
      "TEORICA 1000005"
    ],
    [
      "Cálculo Integral",
      "G10",
      "J",
      14,
      16,
      "TEORICA 1000005"
    ],
    [
      "Cálculo Integral",
      "G12",
      "M",
      9,
      11,
      "TEORICA 1000005"
    ],
    [
      "Cálculo Integral",
      "G12",
      "J",
      9,
      11,
      "TEORICA 1000005"
    ],
    [
      "Cálculo Integral",
      "G13",
      "M",
      7,
      9,
      "TEORICA 1000005"
    ],
    [
      "Cálculo Integral",
      "G13",
      "J",
      7,
      9,
      "TEORICA 1000005"
    ],
    [
      "Cálculo Integral",
      "G14",
      "M",
      11,
      13,
      "TEORICA 1000005"
    ],
    [
      "Cálculo Integral",
      "G14",
      "J",
      11,
      13,
      "TEORICA 1000005"
    ],
    [
      "Cálculo Integral",
      "G15",
      "M",
      14,
      16,
      "TEORICA 1000005"
    ],
    [
      "Cálculo Integral",
      "G15",
      "J",
      14,
      16,
      "TEORICA 1000005"
    ],
    [
      "Cálculo Integral",
      "G16",
      "M",
      14,
      16,
      "TEORICA 1000005"
    ],
    [
      "Cálculo Integral",
      "G16",
      "J",
      14,
      16,
      "TEORICA 1000005"
    ],
    [
      "Cálculo Integral",
      "G17",
      "M",
      16,
      18,
      "TEORICA 1000005"
    ],
    [
      "Cálculo Integral",
      "G17",
      "J",
      16,
      18,
      "TEORICA 1000005"
    ],
    [
      "Cálculo Integral",
      "G19",
      "X",
      7,
      9,
      "TEORICA 1000005"
    ],
    [
      "Cálculo Integral",
      "G19",
      "V",
      7,
      9,
      "TEORICA 1000005"
    ],
    [
      "Cálculo Integral",
      "G2",
      "L",
      9,
      11,
      "TEORICA 1000005"
    ],
    [
      "Cálculo Integral",
      "G2",
      "X",
      9,
      11,
      "TEORICA 1000005"
    ],
    [
      "Cálculo Integral",
      "G20",
      "M",
      14,
      16,
      "TEORICA 1000005"
    ],
    [
      "Cálculo Integral",
      "G20",
      "J",
      14,
      16,
      "TEORICA 1000005"
    ],
    [
      "Cálculo Integral",
      "G21",
      "L",
      16,
      18,
      "TEORICA 1000005"
    ],
    [
      "Cálculo Integral",
      "G21",
      "X",
      16,
      18,
      "TEORICA 1000005"
    ],
    [
      "Cálculo Integral",
      "G22",
      "M",
      14,
      16,
      "TEORICA 1000005"
    ],
    [
      "Cálculo Integral",
      "G22",
      "J",
      14,
      16,
      "TEORICA 1000005"
    ],
    [
      "Cálculo Integral",
      "G3",
      "M",
      16,
      18,
      "TEORICA 1000005"
    ],
    [
      "Cálculo Integral",
      "G3",
      "J",
      16,
      18,
      "TEORICA 1000005"
    ],
    [
      "Cálculo Integral",
      "G4",
      "L",
      9,
      11,
      "TEORICA 1000005"
    ],
    [
      "Cálculo Integral",
      "G4",
      "X",
      9,
      11,
      "TEORICA 1000005"
    ],
    [
      "Cálculo Integral",
      "G6",
      "L",
      18,
      20,
      "TEORICA 1000005"
    ],
    [
      "Cálculo Integral",
      "G6",
      "X",
      18,
      20,
      "TEORICA 1000005"
    ],
    [
      "Cálculo Integral",
      "G7",
      "M",
      11,
      13,
      "TEORICA 1000005"
    ],
    [
      "Cálculo Integral",
      "G7",
      "J",
      11,
      13,
      "TEORICA 1000005"
    ],
    [
      "Cálculo Integral",
      "G8",
      "M",
      18,
      20,
      "TEORICA 1000005"
    ],
    [
      "Cálculo Integral",
      "G8",
      "J",
      18,
      20,
      "TEORICA 1000005"
    ],
    [
      "Cálculo Integral",
      "G9",
      "L",
      11,
      13,
      "TEORICA 1000005"
    ],
    [
      "Cálculo Integral",
      "G9",
      "X",
      11,
      13,
      "TEORICA 1000005"
    ],
    [
      "Cálculo Integral",
      "GORIN-02",
      "L",
      9,
      11,
      "TEORICA 1000005"
    ],
    [
      "Cálculo Integral",
      "GORIN-02",
      "X",
      9,
      11,
      "TEORICA 1000005"
    ],
    [
      "Cálculo Integral",
      "GORIN-02",
      "V",
      11,
      13,
      "TEORICA 1000005"
    ],
    [
      "Cálculo Integral",
      "GTUMA-01",
      "M",
      13,
      15,
      "TEORICA 1000005"
    ],
    [
      "Cálculo Integral",
      "GTUMA-01",
      "X",
      15,
      17,
      "TEORICA 1000005"
    ],
    [
      "Cálculo Integral",
      "GORIN-01",
      "L",
      9,
      11,
      "TEORICA 1000005"
    ],
    [
      "Cálculo Integral",
      "GORIN-01",
      "X",
      9,
      11,
      "TEORICA 1000005"
    ],
    [
      "Cálculo Integral",
      "GORIN-01",
      "V",
      11,
      13,
      "TEORICA 1000005"
    ],
    [
      "Fundamentos de Mecánica",
      "GSUMA-01",
      "X",
      8,
      12,
      "LABORATORIO"
    ],
    [
      "Fundamentos de Mecánica",
      "G1",
      "V",
      7,
      9,
      "LABORATORIO"
    ],
    [
      "Fundamentos de Mecánica",
      "G1",
      "J",
      7,
      9,
      "TALLER"
    ],
    [
      "Fundamentos de Mecánica",
      "G1",
      "M",
      7,
      9,
      "MAGISTRAL"
    ],
    [
      "Fundamentos de Mecánica",
      "G10",
      "J",
      9,
      11,
      "LABORATORIO"
    ],
    [
      "Fundamentos de Mecánica",
      "G10",
      "M",
      9,
      11,
      "TALLER"
    ],
    [
      "Fundamentos de Mecánica",
      "G10",
      "X",
      9,
      11,
      "MAGISTRAL"
    ],
    [
      "Fundamentos de Mecánica",
      "G11",
      "V",
      9,
      11,
      "LABORATORIO"
    ],
    [
      "Fundamentos de Mecánica",
      "G11",
      "M",
      11,
      13,
      "TALLER"
    ],
    [
      "Fundamentos de Mecánica",
      "G11",
      "X",
      9,
      11,
      "MAGISTRAL"
    ],
    [
      "Fundamentos de Mecánica",
      "G12",
      "M",
      11,
      13,
      "LABORATORIO"
    ],
    [
      "Fundamentos de Mecánica",
      "G12",
      "J",
      11,
      13,
      "TALLER"
    ],
    [
      "Fundamentos de Mecánica",
      "G12",
      "X",
      9,
      11,
      "MAGISTRAL"
    ],
    [
      "Fundamentos de Mecánica",
      "G13",
      "J",
      9,
      11,
      "LABORATORIO"
    ],
    [
      "Fundamentos de Mecánica",
      "G13",
      "V",
      14,
      16,
      "TALLER"
    ],
    [
      "Fundamentos de Mecánica",
      "G13",
      "M",
      9,
      11,
      "MAGISTRAL"
    ],
    [
      "Fundamentos de Mecánica",
      "G14",
      "X",
      9,
      11,
      "LABORATORIO"
    ],
    [
      "Fundamentos de Mecánica",
      "G14",
      "V",
      9,
      11,
      "TALLER"
    ],
    [
      "Fundamentos de Mecánica",
      "G14",
      "M",
      9,
      11,
      "MAGISTRAL"
    ],
    [
      "Fundamentos de Mecánica",
      "G15",
      "L",
      9,
      11,
      "LABORATORIO"
    ],
    [
      "Fundamentos de Mecánica",
      "G15",
      "J",
      9,
      11,
      "TALLER"
    ],
    [
      "Fundamentos de Mecánica",
      "G15",
      "M",
      9,
      11,
      "MAGISTRAL"
    ],
    [
      "Fundamentos de Mecánica",
      "G16",
      "M",
      11,
      13,
      "LABORATORIO"
    ],
    [
      "Fundamentos de Mecánica",
      "G16",
      "L",
      11,
      13,
      "TALLER"
    ],
    [
      "Fundamentos de Mecánica",
      "G16",
      "M",
      9,
      11,
      "MAGISTRAL"
    ],
    [
      "Fundamentos de Mecánica",
      "G17",
      "L",
      11,
      13,
      "LABORATORIO"
    ],
    [
      "Fundamentos de Mecánica",
      "G17",
      "V",
      11,
      13,
      "TALLER"
    ],
    [
      "Fundamentos de Mecánica",
      "G17",
      "J",
      11,
      13,
      "MAGISTRAL"
    ],
    [
      "Fundamentos de Mecánica",
      "G18",
      "X",
      11,
      13,
      "LABORATORIO"
    ],
    [
      "Fundamentos de Mecánica",
      "G18",
      "V",
      11,
      13,
      "TALLER"
    ],
    [
      "Fundamentos de Mecánica",
      "G18",
      "J",
      11,
      13,
      "MAGISTRAL"
    ],
    [
      "Fundamentos de Mecánica",
      "G19",
      "J",
      16,
      18,
      "LABORATORIO"
    ],
    [
      "Fundamentos de Mecánica",
      "G19",
      "L",
      11,
      13,
      "TALLER"
    ],
    [
      "Fundamentos de Mecánica",
      "G19",
      "J",
      11,
      13,
      "MAGISTRAL"
    ],
    [
      "Fundamentos de Mecánica",
      "G2",
      "J",
      7,
      9,
      "LABORATORIO"
    ],
    [
      "Fundamentos de Mecánica",
      "G2",
      "L",
      7,
      9,
      "TALLER"
    ],
    [
      "Fundamentos de Mecánica",
      "G2",
      "M",
      7,
      9,
      "MAGISTRAL"
    ],
    [
      "Fundamentos de Mecánica",
      "G20",
      "J",
      14,
      16,
      "LABORATORIO"
    ],
    [
      "Fundamentos de Mecánica",
      "G20",
      "L",
      11,
      13,
      "TALLER"
    ],
    [
      "Fundamentos de Mecánica",
      "G20",
      "J",
      11,
      13,
      "MAGISTRAL"
    ],
    [
      "Fundamentos de Mecánica",
      "G21",
      "L",
      14,
      16,
      "LABORATORIO"
    ],
    [
      "Fundamentos de Mecánica",
      "G21",
      "L",
      14,
      16,
      "LABORATORIO"
    ],
    [
      "Fundamentos de Mecánica",
      "G21",
      "X",
      14,
      16,
      "TALLER"
    ],
    [
      "Fundamentos de Mecánica",
      "G21",
      "J",
      14,
      16,
      "MAGISTRAL"
    ],
    [
      "Fundamentos de Mecánica",
      "G22",
      "X",
      14,
      16,
      "LABORATORIO"
    ],
    [
      "Fundamentos de Mecánica",
      "G22",
      "X",
      14,
      16,
      "LABORATORIO"
    ],
    [
      "Fundamentos de Mecánica",
      "G22",
      "V",
      14,
      16,
      "TALLER"
    ],
    [
      "Fundamentos de Mecánica",
      "G22",
      "J",
      14,
      16,
      "MAGISTRAL"
    ],
    [
      "Fundamentos de Mecánica",
      "G23",
      "M",
      16,
      18,
      "LABORATORIO"
    ],
    [
      "Fundamentos de Mecánica",
      "G23",
      "M",
      16,
      18,
      "LABORATORIO"
    ],
    [
      "Fundamentos de Mecánica",
      "G23",
      "X",
      16,
      18,
      "TALLER"
    ],
    [
      "Fundamentos de Mecánica",
      "G23",
      "J",
      14,
      16,
      "MAGISTRAL"
    ],
    [
      "Fundamentos de Mecánica",
      "G24",
      "V",
      14,
      16,
      "LABORATORIO"
    ],
    [
      "Fundamentos de Mecánica",
      "G24",
      "V",
      14,
      16,
      "LABORATORIO"
    ],
    [
      "Fundamentos de Mecánica",
      "G24",
      "M",
      14,
      16,
      "TALLER"
    ],
    [
      "Fundamentos de Mecánica",
      "G24",
      "J",
      14,
      16,
      "MAGISTRAL"
    ],
    [
      "Fundamentos de Mecánica",
      "G25",
      "X",
      18,
      20,
      "LABORATORIO"
    ],
    [
      "Fundamentos de Mecánica",
      "G25",
      "J",
      18,
      20,
      "TALLER"
    ],
    [
      "Fundamentos de Mecánica",
      "G25",
      "M",
      18,
      20,
      "MAGISTRAL"
    ],
    [
      "Fundamentos de Mecánica",
      "G26",
      "X",
      18,
      20,
      "LABORATORIO"
    ],
    [
      "Fundamentos de Mecánica",
      "G26",
      "J",
      18,
      20,
      "TALLER"
    ],
    [
      "Fundamentos de Mecánica",
      "G26",
      "M",
      18,
      20,
      "MAGISTRAL"
    ],
    [
      "Fundamentos de Mecánica",
      "G27",
      "X",
      18,
      20,
      "LABORATORIO"
    ],
    [
      "Fundamentos de Mecánica",
      "G27",
      "J",
      18,
      20,
      "TALLER"
    ],
    [
      "Fundamentos de Mecánica",
      "G27",
      "M",
      18,
      20,
      "MAGISTRAL"
    ],
    [
      "Fundamentos de Mecánica",
      "G28",
      "X",
      18,
      20,
      "LABORATORIO"
    ],
    [
      "Fundamentos de Mecánica",
      "G28",
      "J",
      18,
      20,
      "TALLER"
    ],
    [
      "Fundamentos de Mecánica",
      "G28",
      "M",
      18,
      20,
      "MAGISTRAL"
    ],
    [
      "Fundamentos de Mecánica",
      "G29",
      "X",
      18,
      20,
      "LABORATORIO"
    ],
    [
      "Fundamentos de Mecánica",
      "G29",
      "J",
      18,
      20,
      "TALLER"
    ],
    [
      "Fundamentos de Mecánica",
      "G29",
      "M",
      18,
      20,
      "MAGISTRAL"
    ],
    [
      "Fundamentos de Mecánica",
      "G3",
      "X",
      7,
      9,
      "LABORATORIO"
    ],
    [
      "Fundamentos de Mecánica",
      "G3",
      "V",
      9,
      11,
      "TALLER"
    ],
    [
      "Fundamentos de Mecánica",
      "G3",
      "M",
      7,
      9,
      "MAGISTRAL"
    ],
    [
      "Fundamentos de Mecánica",
      "G4",
      "X",
      7,
      9,
      "LABORATORIO"
    ],
    [
      "Fundamentos de Mecánica",
      "G4",
      "J",
      7,
      9,
      "TALLER"
    ],
    [
      "Fundamentos de Mecánica",
      "G4",
      "M",
      7,
      9,
      "MAGISTRAL"
    ],
    [
      "Fundamentos de Mecánica",
      "G5",
      "L",
      9,
      11,
      "LABORATORIO"
    ],
    [
      "Fundamentos de Mecánica",
      "G5",
      "X",
      7,
      9,
      "TALLER"
    ],
    [
      "Fundamentos de Mecánica",
      "G5",
      "V",
      9,
      11,
      "MAGISTRAL"
    ],
    [
      "Fundamentos de Mecánica",
      "G6",
      "M",
      7,
      9,
      "LABORATORIO"
    ],
    [
      "Fundamentos de Mecánica",
      "G6",
      "J",
      7,
      9,
      "TALLER"
    ],
    [
      "Fundamentos de Mecánica",
      "G6",
      "V",
      9,
      11,
      "MAGISTRAL"
    ],
    [
      "Fundamentos de Mecánica",
      "G7",
      "J",
      9,
      11,
      "LABORATORIO"
    ],
    [
      "Fundamentos de Mecánica",
      "G7",
      "X",
      11,
      13,
      "TALLER"
    ],
    [
      "Fundamentos de Mecánica",
      "G7",
      "V",
      9,
      11,
      "MAGISTRAL"
    ],
    [
      "Fundamentos de Mecánica",
      "G8",
      "M",
      9,
      11,
      "LABORATORIO"
    ],
    [
      "Fundamentos de Mecánica",
      "G8",
      "J",
      9,
      11,
      "TALLER"
    ],
    [
      "Fundamentos de Mecánica",
      "G8",
      "V",
      9,
      11,
      "MAGISTRAL"
    ],
    [
      "Fundamentos de Mecánica",
      "G9",
      "M",
      7,
      9,
      "LABORATORIO"
    ],
    [
      "Fundamentos de Mecánica",
      "G9",
      "J",
      7,
      9,
      "TALLER"
    ],
    [
      "Fundamentos de Mecánica",
      "G9",
      "X",
      9,
      11,
      "MAGISTRAL"
    ],
    [
      "Fundamentos de Mecánica",
      "GTUMA-01",
      "M",
      11,
      13,
      "MAGISTRAL"
    ],
    [
      "Fundamentos de Mecánica",
      "GTUMA-01",
      "V",
      7,
      9,
      "MAGISTRAL"
    ],
    [
      "Álgebra Lineal",
      "G1",
      "L",
      7,
      9,
      "TEORICA 1000003"
    ],
    [
      "Álgebra Lineal",
      "G1",
      "X",
      7,
      9,
      "TEORICA 1000003"
    ],
    [
      "Álgebra Lineal",
      "GSUMA-01",
      "L",
      8,
      10,
      "TEORICA 1000003"
    ],
    [
      "Álgebra Lineal",
      "G10",
      "M",
      7,
      9,
      "TEORICA 1000003"
    ],
    [
      "Álgebra Lineal",
      "G10",
      "J",
      7,
      9,
      "TEORICA 1000003"
    ],
    [
      "Álgebra Lineal",
      "G11",
      "M",
      7,
      9,
      "TEORICA 1000003"
    ],
    [
      "Álgebra Lineal",
      "G11",
      "J",
      7,
      9,
      "TEORICA 1000003"
    ],
    [
      "Álgebra Lineal",
      "G12",
      "X",
      16,
      18,
      "TEORICA 1000003"
    ],
    [
      "Álgebra Lineal",
      "G12",
      "V",
      16,
      18,
      "TEORICA 1000003"
    ],
    [
      "Álgebra Lineal",
      "G13",
      "M",
      9,
      11,
      "TEORICA 1000003"
    ],
    [
      "Álgebra Lineal",
      "G13",
      "J",
      9,
      11,
      "TEORICA 1000003"
    ],
    [
      "Álgebra Lineal",
      "G15",
      "M",
      11,
      13,
      "TEORICA 1000003"
    ],
    [
      "Álgebra Lineal",
      "G15",
      "J",
      11,
      13,
      "TEORICA 1000003"
    ],
    [
      "Álgebra Lineal",
      "G16",
      "M",
      14,
      16,
      "TEORICA 1000003"
    ],
    [
      "Álgebra Lineal",
      "G16",
      "J",
      14,
      16,
      "TEORICA 1000003"
    ],
    [
      "Álgebra Lineal",
      "G17",
      "M",
      11,
      13,
      "TEORICA 1000003"
    ],
    [
      "Álgebra Lineal",
      "G17",
      "J",
      11,
      13,
      "TEORICA 1000003"
    ],
    [
      "Álgebra Lineal",
      "G18",
      "M",
      16,
      18,
      "TEORICA 1000003"
    ],
    [
      "Álgebra Lineal",
      "G18",
      "J",
      16,
      18,
      "TEORICA 1000003"
    ],
    [
      "Álgebra Lineal",
      "G2",
      "L",
      14,
      16,
      "TEORICA 1000003"
    ],
    [
      "Álgebra Lineal",
      "G2",
      "X",
      14,
      16,
      "TEORICA 1000003"
    ],
    [
      "Álgebra Lineal",
      "G20",
      "X",
      7,
      9,
      "TEORICA 1000003"
    ],
    [
      "Álgebra Lineal",
      "G20",
      "V",
      7,
      9,
      "TEORICA 1000003"
    ],
    [
      "Álgebra Lineal",
      "G21",
      "X",
      7,
      9,
      "TEORICA 1000003"
    ],
    [
      "Álgebra Lineal",
      "G21",
      "V",
      7,
      9,
      "TEORICA 1000003"
    ],
    [
      "Álgebra Lineal",
      "G22",
      "L",
      18,
      20,
      "TEORICA 1000003"
    ],
    [
      "Álgebra Lineal",
      "G22",
      "X",
      18,
      20,
      "TEORICA 1000003"
    ],
    [
      "Álgebra Lineal",
      "G3",
      "L",
      18,
      20,
      "TEORICA 1000003"
    ],
    [
      "Álgebra Lineal",
      "G3",
      "X",
      18,
      20,
      "TEORICA 1000003"
    ],
    [
      "Álgebra Lineal",
      "G4",
      "X",
      16,
      18,
      "TEORICA 1000003"
    ],
    [
      "Álgebra Lineal",
      "G4",
      "V",
      16,
      18,
      "TEORICA 1000003"
    ],
    [
      "Álgebra Lineal",
      "G5",
      "L",
      11,
      13,
      "TEORICA 1000003"
    ],
    [
      "Álgebra Lineal",
      "G5",
      "X",
      11,
      13,
      "TEORICA 1000003"
    ],
    [
      "Álgebra Lineal",
      "G7",
      "L",
      14,
      16,
      "TEORICA 1000003"
    ],
    [
      "Álgebra Lineal",
      "G7",
      "X",
      14,
      16,
      "TEORICA 1000003"
    ],
    [
      "Álgebra Lineal",
      "G8",
      "X",
      16,
      18,
      "TEORICA 1000003"
    ],
    [
      "Álgebra Lineal",
      "G8",
      "V",
      16,
      18,
      "TEORICA 1000003"
    ],
    [
      "Álgebra Lineal",
      "GTUMA-01",
      "M",
      7,
      9,
      "TEORICA 1000003"
    ],
    [
      "Álgebra Lineal",
      "GTUMA-01",
      "J",
      7,
      9,
      "TEORICA 1000003"
    ],
    [
      "Álgebra Lineal",
      "GORIN-01",
      "L",
      14,
      16,
      "TEORICA 1000003"
    ],
    [
      "Álgebra Lineal",
      "GORIN-01",
      "X",
      14,
      16,
      "TEORICA 1000003"
    ],
    [
      "Álgebra Lineal",
      "GORIN-01",
      "V",
      14,
      16,
      "TEORICA 1000003"
    ],
    [
      "Cálculo en Varias Variables",
      "G1",
      "L",
      7,
      9,
      "TEORICA 1000006"
    ],
    [
      "Cálculo en Varias Variables",
      "G1",
      "X",
      7,
      9,
      "TEORICA 1000006"
    ],
    [
      "Cálculo en Varias Variables",
      "G10",
      "L",
      16,
      18,
      "TEORICA 1000006"
    ],
    [
      "Cálculo en Varias Variables",
      "G10",
      "X",
      16,
      18,
      "TEORICA 1000006"
    ],
    [
      "Cálculo en Varias Variables",
      "G11",
      "M",
      11,
      13,
      "TEORICA 1000006"
    ],
    [
      "Cálculo en Varias Variables",
      "G11",
      "J",
      11,
      13,
      "TEORICA 1000006"
    ],
    [
      "Cálculo en Varias Variables",
      "G12",
      "L",
      11,
      13,
      "TEORICA 1000006"
    ],
    [
      "Cálculo en Varias Variables",
      "G12",
      "X",
      11,
      13,
      "TEORICA 1000006"
    ],
    [
      "Cálculo en Varias Variables",
      "G13",
      "M",
      16,
      18,
      "TEORICA 1000006"
    ],
    [
      "Cálculo en Varias Variables",
      "G13",
      "J",
      16,
      18,
      "TEORICA 1000006"
    ],
    [
      "Cálculo en Varias Variables",
      "G14",
      "M",
      18,
      20,
      "TEORICA 1000006"
    ],
    [
      "Cálculo en Varias Variables",
      "G14",
      "J",
      18,
      20,
      "TEORICA 1000006"
    ],
    [
      "Cálculo en Varias Variables",
      "G15",
      "L",
      18,
      20,
      "TEORICA 1000006"
    ],
    [
      "Cálculo en Varias Variables",
      "G15",
      "X",
      18,
      20,
      "TEORICA 1000006"
    ],
    [
      "Cálculo en Varias Variables",
      "G2",
      "L",
      9,
      11,
      "TEORICA 1000006"
    ],
    [
      "Cálculo en Varias Variables",
      "G2",
      "X",
      9,
      11,
      "TEORICA 1000006"
    ],
    [
      "Cálculo en Varias Variables",
      "G3",
      "L",
      11,
      13,
      "TEORICA 1000006"
    ],
    [
      "Cálculo en Varias Variables",
      "G3",
      "X",
      11,
      13,
      "TEORICA 1000006"
    ],
    [
      "Cálculo en Varias Variables",
      "G4",
      "M",
      9,
      11,
      "TEORICA 1000006"
    ],
    [
      "Cálculo en Varias Variables",
      "G4",
      "J",
      9,
      11,
      "TEORICA 1000006"
    ],
    [
      "Cálculo en Varias Variables",
      "G5",
      "L",
      14,
      16,
      "TEORICA 1000006"
    ],
    [
      "Cálculo en Varias Variables",
      "G5",
      "X",
      14,
      16,
      "TEORICA 1000006"
    ],
    [
      "Cálculo en Varias Variables",
      "G7",
      "X",
      14,
      16,
      "TEORICA 1000006"
    ],
    [
      "Cálculo en Varias Variables",
      "G7",
      "V",
      14,
      16,
      "TEORICA 1000006"
    ],
    [
      "Cálculo en Varias Variables",
      "G8",
      "M",
      9,
      11,
      "TEORICA 1000006"
    ],
    [
      "Cálculo en Varias Variables",
      "G8",
      "J",
      9,
      11,
      "TEORICA 1000006"
    ],
    [
      "Cálculo en Varias Variables",
      "G9",
      "L",
      16,
      18,
      "TEORICA 1000006"
    ],
    [
      "Cálculo en Varias Variables",
      "G9",
      "X",
      16,
      18,
      "TEORICA 1000006"
    ],
    [
      "Fundamentos de Electricidad y Magnetismo",
      "G1",
      "J",
      7,
      9,
      "TALLER"
    ],
    [
      "Fundamentos de Electricidad y Magnetismo",
      "G1",
      "X",
      7,
      9,
      "MAGISTRAL"
    ],
    [
      "Fundamentos de Electricidad y Magnetismo",
      "G1",
      "L",
      7,
      9,
      "LABORATORIO"
    ],
    [
      "Fundamentos de Electricidad y Magnetismo",
      "G10",
      "X",
      9,
      11,
      "TALLER"
    ],
    [
      "Fundamentos de Electricidad y Magnetismo",
      "G10",
      "J",
      9,
      11,
      "MAGISTRAL"
    ],
    [
      "Fundamentos de Electricidad y Magnetismo",
      "G10",
      "V",
      9,
      11,
      "LABORATORIO"
    ],
    [
      "Fundamentos de Electricidad y Magnetismo",
      "G11",
      "X",
      11,
      13,
      "TALLER"
    ],
    [
      "Fundamentos de Electricidad y Magnetismo",
      "G11",
      "J",
      9,
      11,
      "MAGISTRAL"
    ],
    [
      "Fundamentos de Electricidad y Magnetismo",
      "G11",
      "V",
      11,
      13,
      "LABORATORIO"
    ],
    [
      "Fundamentos de Electricidad y Magnetismo",
      "G12",
      "J",
      14,
      16,
      "TALLER"
    ],
    [
      "Fundamentos de Electricidad y Magnetismo",
      "G12",
      "J",
      9,
      11,
      "MAGISTRAL"
    ],
    [
      "Fundamentos de Electricidad y Magnetismo",
      "G12",
      "L",
      9,
      11,
      "LABORATORIO"
    ],
    [
      "Fundamentos de Electricidad y Magnetismo",
      "G13",
      "J",
      11,
      13,
      "TALLER"
    ],
    [
      "Fundamentos de Electricidad y Magnetismo",
      "G13",
      "X",
      11,
      13,
      "MAGISTRAL"
    ],
    [
      "Fundamentos de Electricidad y Magnetismo",
      "G13",
      "M",
      11,
      13,
      "LABORATORIO"
    ],
    [
      "Fundamentos de Electricidad y Magnetismo",
      "G14",
      "V",
      14,
      16,
      "TALLER"
    ],
    [
      "Fundamentos de Electricidad y Magnetismo",
      "G14",
      "X",
      11,
      13,
      "MAGISTRAL"
    ],
    [
      "Fundamentos de Electricidad y Magnetismo",
      "G14",
      "M",
      9,
      11,
      "LABORATORIO"
    ],
    [
      "Fundamentos de Electricidad y Magnetismo",
      "G15",
      "J",
      16,
      18,
      "TALLER"
    ],
    [
      "Fundamentos de Electricidad y Magnetismo",
      "G15",
      "X",
      11,
      13,
      "MAGISTRAL"
    ],
    [
      "Fundamentos de Electricidad y Magnetismo",
      "G15",
      "M",
      7,
      9,
      "LABORATORIO"
    ],
    [
      "Fundamentos de Electricidad y Magnetismo",
      "G16",
      "V",
      14,
      16,
      "TALLER"
    ],
    [
      "Fundamentos de Electricidad y Magnetismo",
      "G16",
      "X",
      11,
      13,
      "MAGISTRAL"
    ],
    [
      "Fundamentos de Electricidad y Magnetismo",
      "G16",
      "L",
      14,
      16,
      "LABORATORIO"
    ],
    [
      "Fundamentos de Electricidad y Magnetismo",
      "G2",
      "M",
      7,
      9,
      "TALLER"
    ],
    [
      "Fundamentos de Electricidad y Magnetismo",
      "G2",
      "X",
      7,
      9,
      "MAGISTRAL"
    ],
    [
      "Fundamentos de Electricidad y Magnetismo",
      "G2",
      "V",
      7,
      9,
      "LABORATORIO"
    ],
    [
      "Fundamentos de Electricidad y Magnetismo",
      "G3",
      "L",
      7,
      9,
      "TALLER"
    ],
    [
      "Fundamentos de Electricidad y Magnetismo",
      "G3",
      "X",
      7,
      9,
      "MAGISTRAL"
    ],
    [
      "Fundamentos de Electricidad y Magnetismo",
      "G3",
      "M",
      7,
      9,
      "LABORATORIO"
    ],
    [
      "Fundamentos de Electricidad y Magnetismo",
      "G4",
      "X",
      9,
      11,
      "TALLER"
    ],
    [
      "Fundamentos de Electricidad y Magnetismo",
      "G4",
      "X",
      7,
      9,
      "MAGISTRAL"
    ],
    [
      "Fundamentos de Electricidad y Magnetismo",
      "G4",
      "V",
      9,
      11,
      "LABORATORIO"
    ],
    [
      "Fundamentos de Electricidad y Magnetismo",
      "G5",
      "V",
      9,
      11,
      "TALLER"
    ],
    [
      "Fundamentos de Electricidad y Magnetismo",
      "G5",
      "X",
      9,
      11,
      "MAGISTRAL"
    ],
    [
      "Fundamentos de Electricidad y Magnetismo",
      "G5",
      "J",
      7,
      9,
      "LABORATORIO"
    ],
    [
      "Fundamentos de Electricidad y Magnetismo",
      "G6",
      "L",
      11,
      13,
      "TALLER"
    ],
    [
      "Fundamentos de Electricidad y Magnetismo",
      "G6",
      "X",
      9,
      11,
      "MAGISTRAL"
    ],
    [
      "Fundamentos de Electricidad y Magnetismo",
      "G6",
      "V",
      7,
      9,
      "LABORATORIO"
    ],
    [
      "Fundamentos de Electricidad y Magnetismo",
      "G6",
      "V",
      7,
      9,
      "LABORATORIO"
    ],
    [
      "Fundamentos de Electricidad y Magnetismo",
      "G7",
      "J",
      9,
      11,
      "TALLER"
    ],
    [
      "Fundamentos de Electricidad y Magnetismo",
      "G7",
      "X",
      9,
      11,
      "MAGISTRAL"
    ],
    [
      "Fundamentos de Electricidad y Magnetismo",
      "G7",
      "X",
      11,
      13,
      "LABORATORIO"
    ],
    [
      "Fundamentos de Electricidad y Magnetismo",
      "G8",
      "V",
      9,
      11,
      "TALLER"
    ],
    [
      "Fundamentos de Electricidad y Magnetismo",
      "G8",
      "V",
      9,
      11,
      "TALLER"
    ],
    [
      "Fundamentos de Electricidad y Magnetismo",
      "G8",
      "X",
      9,
      11,
      "MAGISTRAL"
    ],
    [
      "Fundamentos de Electricidad y Magnetismo",
      "G8",
      "J",
      9,
      11,
      "LABORATORIO"
    ],
    [
      "Fundamentos de Electricidad y Magnetismo",
      "G9",
      "X",
      14,
      16,
      "TALLER"
    ],
    [
      "Fundamentos de Electricidad y Magnetismo",
      "G9",
      "J",
      9,
      11,
      "MAGISTRAL"
    ],
    [
      "Fundamentos de Electricidad y Magnetismo",
      "G9",
      "L",
      11,
      13,
      "LABORATORIO"
    ],
    [
      "Probabilidad y Estadística Fundamental",
      "G1",
      "L",
      7,
      9,
      "TEORICA"
    ],
    [
      "Probabilidad y Estadística Fundamental",
      "G1",
      "X",
      7,
      9,
      "TEORICA"
    ],
    [
      "Probabilidad y Estadística Fundamental",
      "G10",
      "M",
      11,
      13,
      "TEORICA"
    ],
    [
      "Probabilidad y Estadística Fundamental",
      "G10",
      "J",
      11,
      13,
      "TEORICA"
    ],
    [
      "Probabilidad y Estadística Fundamental",
      "G11",
      "M",
      14,
      16,
      "TEORICA"
    ],
    [
      "Probabilidad y Estadística Fundamental",
      "G11",
      "J",
      14,
      16,
      "TEORICA"
    ],
    [
      "Probabilidad y Estadística Fundamental",
      "G12",
      "L",
      14,
      16,
      "TEORICA"
    ],
    [
      "Probabilidad y Estadística Fundamental",
      "G12",
      "X",
      14,
      16,
      "TEORICA"
    ],
    [
      "Probabilidad y Estadística Fundamental",
      "G14",
      "M",
      18,
      20,
      "TEORICA"
    ],
    [
      "Probabilidad y Estadística Fundamental",
      "G14",
      "J",
      18,
      20,
      "TEORICA"
    ],
    [
      "Probabilidad y Estadística Fundamental",
      "G15",
      "M",
      16,
      18,
      "TEORICA"
    ],
    [
      "Probabilidad y Estadística Fundamental",
      "G15",
      "J",
      16,
      18,
      "TEORICA"
    ],
    [
      "Probabilidad y Estadística Fundamental",
      "G17",
      "M",
      14,
      16,
      "TEORICA"
    ],
    [
      "Probabilidad y Estadística Fundamental",
      "G17",
      "J",
      14,
      16,
      "TEORICA"
    ],
    [
      "Probabilidad y Estadística Fundamental",
      "G2",
      "M",
      11,
      13,
      "TEORICA"
    ],
    [
      "Probabilidad y Estadística Fundamental",
      "G2",
      "J",
      11,
      13,
      "TEORICA"
    ],
    [
      "Probabilidad y Estadística Fundamental",
      "G3",
      "M",
      7,
      9,
      "TEORICA"
    ],
    [
      "Probabilidad y Estadística Fundamental",
      "G3",
      "J",
      7,
      9,
      "TEORICA"
    ],
    [
      "Probabilidad y Estadística Fundamental",
      "G5",
      "L",
      14,
      16,
      "TEORICA"
    ],
    [
      "Probabilidad y Estadística Fundamental",
      "G5",
      "X",
      14,
      16,
      "TEORICA"
    ],
    [
      "Probabilidad y Estadística Fundamental",
      "G7",
      "M",
      14,
      16,
      "TEORICA"
    ],
    [
      "Probabilidad y Estadística Fundamental",
      "G7",
      "J",
      14,
      16,
      "TEORICA"
    ],
    [
      "Principios de Química",
      "GSUMA-01",
      "L",
      8,
      12,
      "TEORICA"
    ],
    [
      "Principios de Química",
      "G16",
      "L",
      11,
      12,
      "TEORICA"
    ],
    [
      "Principios de Química",
      "G16",
      "X",
      11,
      13,
      "TEORICA"
    ],
    [
      "Principios de Química",
      "G16",
      "V",
      11,
      13,
      "TEORICA"
    ],
    [
      "Principios de Química",
      "G18",
      "L",
      9,
      10,
      "TEORICA"
    ],
    [
      "Principios de Química",
      "G18",
      "X",
      9,
      11,
      "TEORICA"
    ],
    [
      "Principios de Química",
      "G18",
      "V",
      9,
      11,
      "TEORICA"
    ],
    [
      "Principios de Química",
      "G6",
      "L",
      7,
      8,
      "TEORICA"
    ],
    [
      "Principios de Química",
      "G6",
      "X",
      7,
      9,
      "TEORICA"
    ],
    [
      "Principios de Química",
      "G6",
      "V",
      7,
      9,
      "TEORICA"
    ],
    [
      "Principios de Química",
      "G8",
      "L",
      16,
      18,
      "TEORICA"
    ],
    [
      "Principios de Química",
      "G8",
      "M",
      17,
      18,
      "TEORICA"
    ],
    [
      "Principios de Química",
      "G8",
      "J",
      16,
      18,
      "TEORICA"
    ],
    [
      "Principios de Química",
      "GTUMA-01",
      "X",
      7,
      10,
      "TEORICA"
    ],
    [
      "Principios de Química",
      "GTUMA-01",
      "V",
      13,
      15,
      "TEORICA"
    ],
    [
      "Principios de Química",
      "GTUMA-02",
      "M",
      7,
      9,
      "TEORICA"
    ],
    [
      "Principios de Química",
      "GTUMA-02",
      "J",
      13,
      16,
      "TEORICA"
    ],
    [
      "Principios de Química",
      "GCARI-01",
      "L",
      7,
      10,
      "TEORICA"
    ],
    [
      "Principios de Química",
      "GCARI-01",
      "X",
      7,
      9,
      "TEORICA"
    ],
    [
      "Principios de Química",
      "GAMAZ-01",
      "M",
      17,
      19,
      "TEORICA"
    ],
    [
      "Principios de Química",
      "GAMAZ-01",
      "J",
      17,
      19,
      "TEORICA"
    ],
    [
      "Principios de Química",
      "GAMAZ-02",
      "L",
      17,
      19,
      "TEORICA"
    ],
    [
      "Principios de Química",
      "GAMAZ-02",
      "X",
      17,
      19,
      "TEORICA"
    ],
    [
      "Principios de Química",
      "GORIN-01",
      "L",
      14,
      16,
      "TEORICA"
    ],
    [
      "Principios de Química",
      "GORIN-01",
      "X",
      11,
      13,
      "TEORICA"
    ],
    [
      "Principios de Química",
      "GORIN-02",
      "L",
      16,
      18,
      "TEORICA"
    ],
    [
      "Principios de Química",
      "GORIN-02",
      "X",
      16,
      18,
      "TEORICA"
    ],
    [
      "Ecuaciones Diferenciales",
      "G1",
      "M",
      11,
      13,
      "TEORICA 1000007"
    ],
    [
      "Ecuaciones Diferenciales",
      "G1",
      "J",
      11,
      13,
      "TEORICA 1000007"
    ],
    [
      "Ecuaciones Diferenciales",
      "G11",
      "M",
      16,
      18,
      "TEORICA 1000007"
    ],
    [
      "Ecuaciones Diferenciales",
      "G11",
      "J",
      16,
      18,
      "TEORICA 1000007"
    ],
    [
      "Ecuaciones Diferenciales",
      "G12",
      "X",
      7,
      9,
      "TEORICA 1000007"
    ],
    [
      "Ecuaciones Diferenciales",
      "G12",
      "V",
      7,
      9,
      "TEORICA 1000007"
    ],
    [
      "Ecuaciones Diferenciales",
      "G13",
      "L",
      18,
      20,
      "TEORICA 1000007"
    ],
    [
      "Ecuaciones Diferenciales",
      "G13",
      "X",
      18,
      20,
      "TEORICA 1000007"
    ],
    [
      "Ecuaciones Diferenciales",
      "G14",
      "M",
      18,
      20,
      "TEORICA 1000007"
    ],
    [
      "Ecuaciones Diferenciales",
      "G14",
      "J",
      18,
      20,
      "TEORICA 1000007"
    ],
    [
      "Ecuaciones Diferenciales",
      "G3",
      "L",
      11,
      13,
      "TEORICA 1000007"
    ],
    [
      "Ecuaciones Diferenciales",
      "G3",
      "X",
      11,
      13,
      "TEORICA 1000007"
    ],
    [
      "Ecuaciones Diferenciales",
      "G4",
      "L",
      14,
      16,
      "TEORICA 1000007"
    ],
    [
      "Ecuaciones Diferenciales",
      "G4",
      "X",
      14,
      16,
      "TEORICA 1000007"
    ],
    [
      "Ecuaciones Diferenciales",
      "G6",
      "X",
      7,
      9,
      "TEORICA 1000007"
    ],
    [
      "Ecuaciones Diferenciales",
      "G6",
      "V",
      7,
      9,
      "TEORICA 1000007"
    ],
    [
      "Ecuaciones Diferenciales",
      "G7",
      "M",
      16,
      18,
      "TEORICA 1000007"
    ],
    [
      "Ecuaciones Diferenciales",
      "G7",
      "J",
      16,
      18,
      "TEORICA 1000007"
    ],
    [
      "Ecuaciones Diferenciales",
      "G9",
      "M",
      11,
      13,
      "TEORICA 1000007"
    ],
    [
      "Ecuaciones Diferenciales",
      "G9",
      "J",
      11,
      13,
      "TEORICA 1000007"
    ],
    [
      "Variable Compleja",
      "G2",
      "L",
      9,
      11,
      "TEORICA"
    ],
    [
      "Variable Compleja",
      "G2",
      "X",
      9,
      11,
      "TEORICA"
    ],
    [
      "Variable Compleja",
      "G3",
      "M",
      11,
      13,
      "TEORICA"
    ],
    [
      "Variable Compleja",
      "G3",
      "J",
      11,
      13,
      "TEORICA"
    ],
    [
      "Variable Compleja",
      "G4",
      "L",
      11,
      13,
      "TEORICA"
    ],
    [
      "Variable Compleja",
      "G4",
      "X",
      11,
      13,
      "TEORICA"
    ],
    [
      "Variable Compleja",
      "G5",
      "L",
      14,
      16,
      "TEORICA"
    ],
    [
      "Variable Compleja",
      "G5",
      "X",
      14,
      16,
      "TEORICA"
    ],
    [
      "Ingeniería Económica",
      "G1",
      "M",
      16,
      18,
      "TEORICA 2015703"
    ],
    [
      "Ingeniería Económica",
      "G1",
      "J",
      16,
      18,
      "TEORICA 2015703"
    ],
    [
      "Ingeniería Económica",
      "G10",
      "M",
      16,
      18,
      "TEORICA 2015703"
    ],
    [
      "Ingeniería Económica",
      "G10",
      "J",
      16,
      18,
      "TEORICA 2015703"
    ],
    [
      "Ingeniería Económica",
      "G11",
      "M",
      9,
      11,
      "TEORICA 2015703"
    ],
    [
      "Ingeniería Económica",
      "G11",
      "J",
      9,
      11,
      "TEORICA 2015703"
    ],
    [
      "Ingeniería Económica",
      "G2",
      "L",
      18,
      20,
      "TEORICA 2015703"
    ],
    [
      "Ingeniería Económica",
      "G2",
      "X",
      18,
      20,
      "TEORICA 2015703"
    ],
    [
      "Ingeniería Económica",
      "G3",
      "M",
      16,
      18,
      "TEORICA 2015703"
    ],
    [
      "Ingeniería Económica",
      "G3",
      "J",
      16,
      18,
      "TEORICA 2015703"
    ],
    [
      "Ingeniería Económica",
      "G4",
      "L",
      18,
      20,
      "TEORICA 2015703"
    ],
    [
      "Ingeniería Económica",
      "G4",
      "X",
      18,
      20,
      "TEORICA 2015703"
    ],
    [
      "Ingeniería Económica",
      "G5",
      "X",
      6,
      8,
      "TEORICA 2015703"
    ],
    [
      "Ingeniería Económica",
      "G5",
      "V",
      6,
      8,
      "TEORICA 2015703"
    ],
    [
      "Ingeniería Económica",
      "G6",
      "L",
      9,
      11,
      "TEORICA 2015703"
    ],
    [
      "Ingeniería Económica",
      "G6",
      "X",
      9,
      11,
      "TEORICA 2015703"
    ],
    [
      "Ingeniería Económica",
      "G7",
      "L",
      11,
      13,
      "TEORICA 2015703"
    ],
    [
      "Ingeniería Económica",
      "G7",
      "X",
      11,
      13,
      "TEORICA 2015703"
    ],
    [
      "Ingeniería Económica",
      "G8",
      "M",
      18,
      20,
      "TEORICA 2015703"
    ],
    [
      "Ingeniería Económica",
      "G8",
      "J",
      18,
      20,
      "TEORICA 2015703"
    ],
    [
      "Ingeniería Económica",
      "G9",
      "M",
      7,
      9,
      "TEORICA 2015703"
    ],
    [
      "Ingeniería Económica",
      "G9",
      "J",
      7,
      9,
      "TEORICA 2015703"
    ],
    [
      "Inglés I",
      "G1",
      "L",
      7,
      9,
      "TEORICA"
    ],
    [
      "Inglés I",
      "G1",
      "X",
      7,
      9,
      "TEORICA"
    ],
    [
      "Inglés I",
      "G2",
      "X",
      7,
      9,
      "TEORICA"
    ],
    [
      "Inglés I",
      "G2",
      "V",
      7,
      9,
      "TEORICA"
    ],
    [
      "Inglés I",
      "G3",
      "S",
      7,
      11,
      "TEORICA"
    ],
    [
      "Inglés I",
      "G4",
      "L",
      9,
      11,
      "TEORICA"
    ],
    [
      "Inglés I",
      "G4",
      "X",
      9,
      11,
      "TEORICA"
    ],
    [
      "Inglés I",
      "G5",
      "M",
      9,
      11,
      "TEORICA"
    ],
    [
      "Inglés I",
      "G5",
      "J",
      9,
      11,
      "TEORICA"
    ],
    [
      "Inglés I",
      "G6",
      "M",
      11,
      13,
      "TEORICA"
    ],
    [
      "Inglés I",
      "G6",
      "J",
      11,
      13,
      "TEORICA"
    ],
    [
      "Inglés I",
      "G7",
      "M",
      14,
      16,
      "TEORICA"
    ],
    [
      "Inglés I",
      "G7",
      "J",
      14,
      16,
      "TEORICA"
    ],
    [
      "Inglés I",
      "G8",
      "L",
      16,
      18,
      "TEORICA"
    ],
    [
      "Inglés I",
      "G8",
      "X",
      16,
      18,
      "TEORICA"
    ],
    [
      "Inglés I",
      "G9",
      "M",
      18,
      20,
      "TEORICA"
    ],
    [
      "Inglés I",
      "G9",
      "J",
      18,
      20,
      "TEORICA"
    ],
    [
      "Inglés I",
      "GAMAZ-07",
      "L",
      17,
      19,
      "TEORICA"
    ],
    [
      "Inglés I",
      "GAMAZ-07",
      "X",
      17,
      19,
      "TEORICA"
    ],
    [
      "Inglés I",
      "GAMAZ-08",
      "M",
      17,
      19,
      "TEORICA"
    ],
    [
      "Inglés I",
      "GAMAZ-08",
      "J",
      17,
      19,
      "TEORICA"
    ],
    [
      "Inglés I",
      "GAMAZ-09",
      "L",
      7,
      9,
      "TEORICA"
    ],
    [
      "Inglés I",
      "GAMAZ-09",
      "V",
      7,
      9,
      "TEORICA"
    ],
    [
      "Inglés I",
      "GAMAZ-10",
      "M",
      13,
      15,
      "TEORICA"
    ],
    [
      "Inglés I",
      "GAMAZ-10",
      "J",
      13,
      15,
      "TEORICA"
    ],
    [
      "Inglés I",
      "GAMAZ-11",
      "L",
      11,
      13,
      "TEORICA"
    ],
    [
      "Inglés I",
      "GAMAZ-11",
      "X",
      11,
      13,
      "TEORICA"
    ],
    [
      "Inglés I",
      "GAMAZ-12",
      "M",
      7,
      9,
      "TEORICA"
    ],
    [
      "Inglés I",
      "GAMAZ-12",
      "J",
      7,
      9,
      "TEORICA"
    ],
    [
      "Inglés I",
      "GCARI-02",
      "M",
      17,
      19,
      "TEORICA"
    ],
    [
      "Inglés I",
      "GCARI-02",
      "J",
      17,
      19,
      "TEORICA"
    ],
    [
      "Inglés I",
      "GAMAZ-06",
      "M",
      7,
      9,
      "TEORICA"
    ],
    [
      "Inglés I",
      "GAMAZ-06",
      "J",
      7,
      9,
      "TEORICA"
    ],
    [
      "Inglés I",
      "GAMAZ-01",
      "L",
      17,
      19,
      "TEORICA"
    ],
    [
      "Inglés I",
      "GAMAZ-01",
      "X",
      17,
      19,
      "TEORICA"
    ],
    [
      "Inglés I",
      "GAMAZ-02",
      "M",
      17,
      19,
      "TEORICA"
    ],
    [
      "Inglés I",
      "GAMAZ-02",
      "J",
      17,
      19,
      "TEORICA"
    ],
    [
      "Inglés I",
      "GAMAZ-03",
      "L",
      7,
      9,
      "TEORICA"
    ],
    [
      "Inglés I",
      "GAMAZ-03",
      "V",
      7,
      9,
      "TEORICA"
    ],
    [
      "Inglés I",
      "GAMAZ-04",
      "M",
      13,
      15,
      "TEORICA"
    ],
    [
      "Inglés I",
      "GAMAZ-04",
      "J",
      13,
      15,
      "TEORICA"
    ],
    [
      "Inglés I",
      "GAMAZ-05",
      "L",
      11,
      13,
      "TEORICA"
    ],
    [
      "Inglés I",
      "GAMAZ-05",
      "X",
      11,
      13,
      "TEORICA"
    ],
    [
      "Inglés I",
      "GTUMA-01",
      "L",
      9,
      11,
      "TEORICA"
    ],
    [
      "Inglés I",
      "GTUMA-01",
      "V",
      9,
      11,
      "TEORICA"
    ],
    [
      "Inglés I",
      "GTUMA-02",
      "M",
      13,
      15,
      "TEORICA"
    ],
    [
      "Inglés I",
      "GTUMA-02",
      "J",
      13,
      15,
      "TEORICA"
    ],
    [
      "Inglés I",
      "GTUMA-03",
      "X",
      13,
      15,
      "TEORICA"
    ],
    [
      "Inglés I",
      "GTUMA-03",
      "V",
      13,
      15,
      "TEORICA"
    ],
    [
      "Inglés I",
      "GTUMA-04",
      "X",
      13,
      15,
      "TEORICA"
    ],
    [
      "Inglés I",
      "GTUMA-04",
      "V",
      7,
      9,
      "TEORICA"
    ],
    [
      "Inglés I",
      "GCARI-01",
      "M",
      17,
      19,
      "TEORICA"
    ],
    [
      "Inglés I",
      "GCARI-01",
      "J",
      17,
      19,
      "TEORICA"
    ],
    [
      "Inglés I",
      "GORIN-03",
      "L",
      11,
      13,
      "TEORICA"
    ],
    [
      "Inglés I",
      "GORIN-03",
      "J",
      11,
      13,
      "TEORICA"
    ],
    [
      "Inglés I",
      "GORIN-02",
      "M",
      7,
      9,
      "TEORICA"
    ],
    [
      "Inglés I",
      "GORIN-02",
      "J",
      7,
      9,
      "TEORICA"
    ],
    [
      "Inglés II",
      "G1",
      "L",
      7,
      9,
      "TEORICA"
    ],
    [
      "Inglés II",
      "G1",
      "X",
      7,
      9,
      "TEORICA"
    ],
    [
      "Inglés II",
      "GORIN-01",
      "X",
      14,
      16,
      "TEORICA"
    ],
    [
      "Inglés II",
      "GORIN-01",
      "V",
      14,
      16,
      "TEORICA"
    ],
    [
      "Inglés II",
      "G10",
      "X",
      11,
      13,
      "TEORICA"
    ],
    [
      "Inglés II",
      "G10",
      "V",
      11,
      13,
      "TEORICA"
    ],
    [
      "Inglés II",
      "G11",
      "L",
      14,
      16,
      "TEORICA"
    ],
    [
      "Inglés II",
      "G11",
      "X",
      14,
      16,
      "TEORICA"
    ],
    [
      "Inglés II",
      "G12",
      "M",
      14,
      16,
      "TEORICA"
    ],
    [
      "Inglés II",
      "G12",
      "J",
      14,
      16,
      "TEORICA"
    ],
    [
      "Inglés II",
      "G13",
      "L",
      16,
      18,
      "TEORICA"
    ],
    [
      "Inglés II",
      "G13",
      "X",
      16,
      18,
      "TEORICA"
    ],
    [
      "Inglés II",
      "G14",
      "M",
      16,
      18,
      "TEORICA"
    ],
    [
      "Inglés II",
      "G14",
      "J",
      16,
      18,
      "TEORICA"
    ],
    [
      "Inglés II",
      "G15",
      "L",
      18,
      20,
      "TEORICA"
    ],
    [
      "Inglés II",
      "G15",
      "X",
      18,
      20,
      "TEORICA"
    ],
    [
      "Inglés II",
      "G16",
      "M",
      18,
      20,
      "TEORICA"
    ],
    [
      "Inglés II",
      "G16",
      "J",
      18,
      20,
      "TEORICA"
    ],
    [
      "Inglés II",
      "G2",
      "M",
      7,
      9,
      "TEORICA"
    ],
    [
      "Inglés II",
      "G2",
      "J",
      7,
      9,
      "TEORICA"
    ],
    [
      "Inglés II",
      "G3",
      "X",
      7,
      9,
      "TEORICA"
    ],
    [
      "Inglés II",
      "G3",
      "V",
      7,
      9,
      "TEORICA"
    ],
    [
      "Inglés II",
      "G4",
      "S",
      7,
      11,
      "TEORICA"
    ],
    [
      "Inglés II",
      "G5",
      "L",
      9,
      11,
      "TEORICA"
    ],
    [
      "Inglés II",
      "G5",
      "X",
      9,
      11,
      "TEORICA"
    ],
    [
      "Inglés II",
      "G6",
      "M",
      9,
      11,
      "TEORICA"
    ],
    [
      "Inglés II",
      "G6",
      "J",
      9,
      11,
      "TEORICA"
    ],
    [
      "Inglés II",
      "G7",
      "X",
      9,
      11,
      "TEORICA"
    ],
    [
      "Inglés II",
      "G7",
      "V",
      9,
      11,
      "TEORICA"
    ],
    [
      "Inglés II",
      "G8",
      "L",
      11,
      13,
      "TEORICA"
    ],
    [
      "Inglés II",
      "G8",
      "X",
      11,
      13,
      "TEORICA"
    ],
    [
      "Inglés II",
      "G9",
      "M",
      11,
      13,
      "TEORICA"
    ],
    [
      "Inglés II",
      "G9",
      "J",
      11,
      13,
      "TEORICA"
    ],
    [
      "Inglés II",
      "GAMAZ-01",
      "X",
      11,
      13,
      "TEORICA"
    ],
    [
      "Inglés II",
      "GAMAZ-01",
      "V",
      11,
      13,
      "TEORICA"
    ],
    [
      "Inglés II",
      "GAMAZ-03",
      "X",
      9,
      11,
      "TEORICA"
    ],
    [
      "Inglés II",
      "GAMAZ-03",
      "V",
      9,
      11,
      "TEORICA"
    ],
    [
      "Inglés II",
      "GAMAZ-05",
      "S",
      7,
      11,
      "TEORICA"
    ],
    [
      "Inglés II",
      "GCARI-02",
      "M",
      17,
      19,
      "TEORICA"
    ],
    [
      "Inglés II",
      "GCARI-02",
      "J",
      17,
      19,
      "TEORICA"
    ],
    [
      "Inglés II",
      "GAMAZ-02",
      "X",
      11,
      13,
      "TEORICA"
    ],
    [
      "Inglés II",
      "GAMAZ-02",
      "V",
      11,
      13,
      "TEORICA"
    ],
    [
      "Inglés II",
      "GAMAZ-04",
      "X",
      9,
      11,
      "TEORICA"
    ],
    [
      "Inglés II",
      "GAMAZ-04",
      "V",
      9,
      11,
      "TEORICA"
    ],
    [
      "Inglés II",
      "GAMAZ-06",
      "S",
      7,
      11,
      "TEORICA"
    ],
    [
      "Inglés II",
      "GTUMA-01",
      "M",
      11,
      13,
      "TEORICA"
    ],
    [
      "Inglés II",
      "GTUMA-01",
      "J",
      7,
      9,
      "TEORICA"
    ],
    [
      "Inglés II",
      "GTUMA-02",
      "X",
      7,
      9,
      "TEORICA"
    ],
    [
      "Inglés II",
      "GTUMA-02",
      "V",
      9,
      11,
      "TEORICA"
    ],
    [
      "Inglés II",
      "GTUMA-03",
      "X",
      15,
      17,
      "TEORICA"
    ],
    [
      "Inglés II",
      "GTUMA-03",
      "V",
      15,
      17,
      "TEORICA"
    ],
    [
      "Inglés II",
      "GCARI-01",
      "M",
      17,
      19,
      "TEORICA"
    ],
    [
      "Inglés II",
      "GCARI-01",
      "J",
      17,
      19,
      "TEORICA"
    ],
    [
      "Inglés III",
      "G1",
      "L",
      7,
      9,
      "TEORICA"
    ],
    [
      "Inglés III",
      "G1",
      "X",
      7,
      9,
      "TEORICA"
    ],
    [
      "Inglés III",
      "G10",
      "X",
      11,
      13,
      "TEORICA"
    ],
    [
      "Inglés III",
      "G10",
      "V",
      11,
      13,
      "TEORICA"
    ],
    [
      "Inglés III",
      "G11",
      "L",
      14,
      16,
      "TEORICA"
    ],
    [
      "Inglés III",
      "G11",
      "X",
      14,
      16,
      "TEORICA"
    ],
    [
      "Inglés III",
      "G12",
      "M",
      14,
      16,
      "TEORICA"
    ],
    [
      "Inglés III",
      "G12",
      "J",
      14,
      16,
      "TEORICA"
    ],
    [
      "Inglés III",
      "G13",
      "X",
      14,
      16,
      "TEORICA"
    ],
    [
      "Inglés III",
      "G13",
      "V",
      14,
      16,
      "TEORICA"
    ],
    [
      "Inglés III",
      "G14",
      "J",
      14,
      16,
      "TEORICA"
    ],
    [
      "Inglés III",
      "G14",
      "V",
      14,
      16,
      "TEORICA"
    ],
    [
      "Inglés III",
      "G15",
      "L",
      16,
      18,
      "TEORICA"
    ],
    [
      "Inglés III",
      "G15",
      "X",
      16,
      18,
      "TEORICA"
    ],
    [
      "Inglés III",
      "G16",
      "M",
      16,
      18,
      "TEORICA"
    ],
    [
      "Inglés III",
      "G16",
      "J",
      16,
      18,
      "TEORICA"
    ],
    [
      "Inglés III",
      "G17",
      "L",
      18,
      20,
      "TEORICA"
    ],
    [
      "Inglés III",
      "G17",
      "X",
      18,
      20,
      "TEORICA"
    ],
    [
      "Inglés III",
      "G18",
      "M",
      18,
      20,
      "TEORICA"
    ],
    [
      "Inglés III",
      "G18",
      "J",
      18,
      20,
      "TEORICA"
    ],
    [
      "Inglés III",
      "G2",
      "M",
      7,
      9,
      "TEORICA"
    ],
    [
      "Inglés III",
      "G2",
      "J",
      7,
      9,
      "TEORICA"
    ],
    [
      "Inglés III",
      "G3",
      "X",
      7,
      9,
      "TEORICA"
    ],
    [
      "Inglés III",
      "G3",
      "V",
      7,
      9,
      "TEORICA"
    ],
    [
      "Inglés III",
      "G4",
      "S",
      7,
      11,
      "TEORICA"
    ],
    [
      "Inglés III",
      "G5",
      "L",
      9,
      11,
      "TEORICA"
    ],
    [
      "Inglés III",
      "G5",
      "X",
      9,
      11,
      "TEORICA"
    ],
    [
      "Inglés III",
      "G6",
      "M",
      9,
      11,
      "TEORICA"
    ],
    [
      "Inglés III",
      "G6",
      "J",
      9,
      11,
      "TEORICA"
    ],
    [
      "Inglés III",
      "G7",
      "X",
      9,
      11,
      "TEORICA"
    ],
    [
      "Inglés III",
      "G7",
      "V",
      9,
      11,
      "TEORICA"
    ],
    [
      "Inglés III",
      "G8",
      "L",
      11,
      13,
      "TEORICA"
    ],
    [
      "Inglés III",
      "G8",
      "X",
      11,
      13,
      "TEORICA"
    ],
    [
      "Inglés III",
      "G9",
      "M",
      11,
      13,
      "TEORICA"
    ],
    [
      "Inglés III",
      "G9",
      "J",
      11,
      13,
      "TEORICA"
    ],
    [
      "Inglés III",
      "GAMAZ-02",
      "L",
      15,
      17,
      "TEORICA"
    ],
    [
      "Inglés III",
      "GAMAZ-02",
      "V",
      7,
      9,
      "TEORICA"
    ],
    [
      "Inglés III",
      "GORIN-02",
      "M",
      9,
      11,
      "TEORICA"
    ],
    [
      "Inglés III",
      "GORIN-02",
      "J",
      9,
      11,
      "TEORICA"
    ],
    [
      "Inglés III",
      "GCARI-01",
      "X",
      17,
      19,
      "TEORICA"
    ],
    [
      "Inglés III",
      "GCARI-01",
      "V",
      17,
      19,
      "TEORICA"
    ],
    [
      "Inglés III",
      "GAMAZ-01",
      "L",
      15,
      17,
      "TEORICA"
    ],
    [
      "Inglés III",
      "GAMAZ-01",
      "V",
      7,
      9,
      "TEORICA"
    ],
    [
      "Inglés III",
      "GTUMA-02",
      "M",
      18,
      20,
      "TEORICA"
    ],
    [
      "Inglés III",
      "GTUMA-02",
      "J",
      18,
      20,
      "TEORICA"
    ],
    [
      "Inglés III",
      "GCARI-02",
      "X",
      17,
      19,
      "TEORICA"
    ],
    [
      "Inglés III",
      "GCARI-02",
      "V",
      17,
      19,
      "TEORICA"
    ],
    [
      "Inglés IV",
      "G1",
      "L",
      7,
      9,
      "TEORICA"
    ],
    [
      "Inglés IV",
      "G1",
      "X",
      7,
      9,
      "TEORICA"
    ],
    [
      "Inglés IV",
      "G10",
      "M",
      11,
      13,
      "TEORICA"
    ],
    [
      "Inglés IV",
      "G10",
      "J",
      11,
      13,
      "TEORICA"
    ],
    [
      "Inglés IV",
      "G11",
      "M",
      11,
      13,
      "TEORICA"
    ],
    [
      "Inglés IV",
      "G11",
      "J",
      11,
      13,
      "TEORICA"
    ],
    [
      "Inglés IV",
      "G12",
      "X",
      11,
      13,
      "TEORICA"
    ],
    [
      "Inglés IV",
      "G12",
      "V",
      11,
      13,
      "TEORICA"
    ],
    [
      "Inglés IV",
      "G13",
      "X",
      11,
      13,
      "TEORICA"
    ],
    [
      "Inglés IV",
      "G13",
      "V",
      11,
      13,
      "TEORICA"
    ],
    [
      "Inglés IV",
      "G14",
      "L",
      14,
      16,
      "TEORICA"
    ],
    [
      "Inglés IV",
      "G14",
      "X",
      14,
      16,
      "TEORICA"
    ],
    [
      "Inglés IV",
      "G15",
      "M",
      14,
      16,
      "TEORICA"
    ],
    [
      "Inglés IV",
      "G15",
      "J",
      14,
      16,
      "TEORICA"
    ],
    [
      "Inglés IV",
      "G16",
      "X",
      14,
      16,
      "TEORICA"
    ],
    [
      "Inglés IV",
      "G16",
      "V",
      14,
      16,
      "TEORICA"
    ],
    [
      "Inglés IV",
      "G17",
      "L",
      16,
      18,
      "TEORICA"
    ],
    [
      "Inglés IV",
      "G17",
      "X",
      16,
      18,
      "TEORICA"
    ],
    [
      "Inglés IV",
      "G18",
      "L",
      16,
      18,
      "TEORICA"
    ],
    [
      "Inglés IV",
      "G18",
      "X",
      16,
      18,
      "TEORICA"
    ],
    [
      "Inglés IV",
      "G19",
      "M",
      16,
      18,
      "TEORICA"
    ],
    [
      "Inglés IV",
      "G19",
      "J",
      16,
      18,
      "TEORICA"
    ],
    [
      "Inglés IV",
      "G2",
      "M",
      7,
      9,
      "TEORICA"
    ],
    [
      "Inglés IV",
      "G2",
      "J",
      7,
      9,
      "TEORICA"
    ],
    [
      "Inglés IV",
      "G20",
      "M",
      16,
      18,
      "TEORICA"
    ],
    [
      "Inglés IV",
      "G20",
      "J",
      16,
      18,
      "TEORICA"
    ],
    [
      "Inglés IV",
      "G21",
      "L",
      18,
      20,
      "TEORICA"
    ],
    [
      "Inglés IV",
      "G21",
      "X",
      18,
      20,
      "TEORICA"
    ],
    [
      "Inglés IV",
      "G22",
      "M",
      18,
      20,
      "TEORICA"
    ],
    [
      "Inglés IV",
      "G22",
      "J",
      18,
      20,
      "TEORICA"
    ],
    [
      "Inglés IV",
      "G3",
      "M",
      7,
      9,
      "TEORICA"
    ],
    [
      "Inglés IV",
      "G3",
      "J",
      7,
      9,
      "TEORICA"
    ],
    [
      "Inglés IV",
      "G4",
      "X",
      7,
      9,
      "TEORICA"
    ],
    [
      "Inglés IV",
      "G4",
      "V",
      7,
      9,
      "TEORICA"
    ],
    [
      "Inglés IV",
      "G5",
      "S",
      7,
      11,
      "TEORICA"
    ],
    [
      "Inglés IV",
      "G6",
      "L",
      9,
      11,
      "TEORICA"
    ],
    [
      "Inglés IV",
      "G6",
      "X",
      9,
      11,
      "TEORICA"
    ],
    [
      "Inglés IV",
      "G7",
      "M",
      9,
      11,
      "TEORICA"
    ],
    [
      "Inglés IV",
      "G7",
      "J",
      9,
      11,
      "TEORICA"
    ],
    [
      "Inglés IV",
      "G8",
      "X",
      9,
      11,
      "TEORICA"
    ],
    [
      "Inglés IV",
      "G8",
      "V",
      9,
      11,
      "TEORICA"
    ],
    [
      "Inglés IV",
      "G9",
      "L",
      11,
      13,
      "TEORICA"
    ],
    [
      "Inglés IV",
      "G9",
      "X",
      11,
      13,
      "TEORICA"
    ],
    [
      "Inglés IV",
      "GCARI-02",
      "X",
      17,
      19,
      "TEORICA"
    ],
    [
      "Inglés IV",
      "GCARI-02",
      "V",
      17,
      19,
      "TEORICA"
    ],
    [
      "Inglés IV",
      "GTUMA-02",
      "M",
      18,
      20,
      "TEORICA"
    ],
    [
      "Inglés IV",
      "GTUMA-02",
      "J",
      18,
      20,
      "TEORICA"
    ],
    [
      "Inglés IV",
      "GTUMA-01",
      "M",
      18,
      20,
      "TEORICA"
    ],
    [
      "Inglés IV",
      "GTUMA-01",
      "J",
      18,
      20,
      "TEORICA"
    ],
    [
      "Inglés IV",
      "GCARI-01",
      "X",
      17,
      19,
      "TEORICA"
    ],
    [
      "Inglés IV",
      "GCARI-01",
      "V",
      17,
      19,
      "TEORICA"
    ]
  ],
  "malla": [
    [
      "Cálculo Diferencial",
      1,
      "",
      4,
      "B",
      "obl"
    ],
    [
      "Dibujo básico",
      1,
      "",
      3,
      "B",
      "obl"
    ],
    [
      "Programación de Computadores",
      1,
      "",
      3,
      "B",
      "obl"
    ],
    [
      "Tec. Mecánica Básica",
      2,
      "",
      3,
      "C",
      "obl"
    ],
    [
      "Ing. y Des. Sostenible",
      1,
      "",
      3,
      "C",
      "obl"
    ],
    [
      "Cálculo Integral",
      2,
      "",
      4,
      "B",
      "obl"
    ],
    [
      "Fundamentos de Mecánica",
      2,
      "",
      4,
      "B",
      "obl"
    ],
    [
      "Álgebra Lineal",
      2,
      "",
      4,
      "B",
      "obl"
    ],
    [
      "Taller Ing. Electrónica",
      1,
      "",
      2,
      "C",
      "obl"
    ],
    [
      "Cálculo en Varias Variables",
      3,
      "",
      4,
      "B",
      "obl"
    ],
    [
      "Fundamentos de Electricidad y Magnetismo",
      3,
      "",
      4,
      "B",
      "obl"
    ],
    [
      "Probabilidad y Estadística Fundamental",
      3,
      "",
      3,
      "B",
      "obl"
    ],
    [
      "Principios de Química",
      3,
      "",
      3,
      "B",
      "obl"
    ],
    [
      "Estática",
      3,
      "",
      3,
      "C",
      "obl"
    ],
    [
      "Circuitos Eléctricos I",
      3,
      "",
      3,
      "C",
      "obl"
    ],
    [
      "Ecuaciones Diferenciales",
      4,
      "",
      4,
      "B",
      "obl"
    ],
    [
      "Programación Orientada a Objetos",
      4,
      "",
      3,
      "C",
      "obl"
    ],
    [
      "Dinámica",
      4,
      "",
      3,
      "C",
      "obl"
    ],
    [
      "Electrónica Análoga I",
      4,
      "",
      4,
      "C",
      "obl"
    ],
    [
      "Variable Compleja",
      5,
      "",
      4,
      "B",
      "obl"
    ],
    [
      "Optativa Física (V)",
      5,
      "",
      3,
      "B",
      "opt"
    ],
    [
      "Señales y Sistemas I",
      5,
      "",
      3,
      "C",
      "obl"
    ],
    [
      "Ciencia e Ing. de Materiales",
      5,
      "",
      3,
      "C",
      "obl"
    ],
    [
      "Resistencia de Materiales",
      5,
      "",
      3,
      "C",
      "obl"
    ],
    [
      "Estructuras de Datos",
      5,
      "",
      3,
      "C",
      "obl"
    ],
    [
      "Ingeniería Económica",
      6,
      "",
      3,
      "B",
      "obl"
    ],
    [
      "Señales y Sistemas II",
      6,
      "",
      3,
      "C",
      "obl"
    ],
    [
      "Optativa Materiales y Procesos (VI)",
      6,
      "",
      3,
      "C",
      "opt"
    ],
    [
      "Diseño Mecatrónico",
      6,
      "",
      3,
      "C",
      "obl"
    ],
    [
      "Electrónica Digital I",
      6,
      "",
      4,
      "C",
      "obl"
    ],
    [
      "Optativa Cs. Económicas (VII)",
      7,
      "",
      3,
      "B",
      "opt"
    ],
    [
      "Optativa Informática (VII)",
      7,
      "",
      3,
      "B",
      "opt"
    ],
    [
      "Control",
      7,
      "",
      4,
      "C",
      "obl"
    ],
    [
      "Sensores y Actuadores",
      7,
      "",
      3,
      "C",
      "obl"
    ],
    [
      "Redes de Computadores",
      7,
      "",
      3,
      "C",
      "obl"
    ],
    [
      "Microcontroladores",
      7,
      "",
      3,
      "C",
      "obl"
    ],
    [
      "Robótica",
      8,
      "",
      3,
      "C",
      "obl"
    ],
    [
      "Optativa Automatización y Control (VIII)",
      8,
      "",
      3,
      "C",
      "opt"
    ],
    [
      "Servomecanismos",
      8,
      "",
      3,
      "C",
      "obl"
    ],
    [
      "Automatización de Procesos",
      9,
      "",
      3,
      "C",
      "obl"
    ],
    [
      "Inglés I",
      1,
      "",
      3,
      "N",
      ""
    ],
    [
      "Inglés II",
      2,
      "",
      3,
      "N",
      ""
    ],
    [
      "Inglés III",
      3,
      "",
      3,
      "N",
      ""
    ],
    [
      "Inglés IV",
      4,
      "",
      3,
      "N",
      ""
    ],
    [
      "Taller de Proyectos Interdisciplinarios",
      6,
      "Requiere 52 créditos aprobados del plan",
      3,
      "C",
      "obl"
    ],
    [
      "Libre elección (VIII-1)",
      8,
      "",
      3,
      "L",
      "opt"
    ],
    [
      "Libre elección (VIII-2)",
      8,
      "",
      3,
      "L",
      "opt"
    ],
    [
      "Libre elección (VIII-3)",
      8,
      "",
      3,
      "L",
      "opt"
    ],
    [
      "Libre elección (IX-1)",
      9,
      "",
      3,
      "L",
      "opt"
    ],
    [
      "Libre elección (IX-2)",
      9,
      "",
      3,
      "L",
      "opt"
    ],
    [
      "Libre elección (IX-3)",
      9,
      "",
      3,
      "L",
      "opt"
    ],
    [
      "Proyecto Aplicado de Ingeniería",
      9,
      "Requiere 65 créditos aprobados del plan",
      4,
      "C",
      "obl"
    ],
    [
      "Libre elección (X-1)",
      10,
      "",
      3,
      "L",
      "opt"
    ],
    [
      "Libre elección (X-2)",
      10,
      "",
      3,
      "L",
      "opt"
    ],
    [
      "Libre elección (X-3)",
      10,
      "",
      3,
      "L",
      "opt"
    ],
    [
      "Trabajo de Grado",
      10,
      "Requiere 69 créditos aprobados del plan",
      6,
      "C",
      "obl"
    ],
    [
      "Libre elección (X-4)",
      10,
      "",
      3,
      "L",
      "opt"
    ],
    [
      "Libre elección (II)",
      2,
      "",
      3,
      "L",
      "opt"
    ],
    [
      "Libre elección (IV)",
      4,
      "",
      3,
      "L",
      "opt"
    ]
  ],
  "pre": [
    [
      "Cálculo Diferencial",
      "Cálculo Integral",
      "flecha"
    ],
    [
      "Cálculo Diferencial",
      "Probabilidad y Estadística Fundamental",
      "flecha"
    ],
    [
      "Cálculo Diferencial",
      "Fundamentos de Mecánica",
      "flecha"
    ],
    [
      "Cálculo Integral",
      "Cálculo en Varias Variables",
      "flecha"
    ],
    [
      "Cálculo Integral",
      "Ecuaciones Diferenciales",
      "flecha"
    ],
    [
      "Cálculo Integral",
      "Fundamentos de Electricidad y Magnetismo",
      "flecha"
    ],
    [
      "Cálculo Integral",
      "Ingeniería Económica",
      "letra A"
    ],
    [
      "Álgebra Lineal",
      "Cálculo en Varias Variables",
      "flecha"
    ],
    [
      "Álgebra Lineal",
      "Ecuaciones Diferenciales",
      "flecha"
    ],
    [
      "Álgebra Lineal",
      "Circuitos Eléctricos I",
      "flecha"
    ],
    [
      "Álgebra Lineal",
      "Estática",
      "letra B"
    ],
    [
      "Álgebra Lineal",
      "Dinámica",
      "letra B"
    ],
    [
      "Fundamentos de Mecánica",
      "Fundamentos de Electricidad y Magnetismo",
      "flecha"
    ],
    [
      "Fundamentos de Mecánica",
      "Optativa Física (V)",
      "letra D"
    ],
    [
      "Ecuaciones Diferenciales",
      "Variable Compleja",
      "flecha"
    ],
    [
      "Ecuaciones Diferenciales",
      "Señales y Sistemas I",
      "flecha"
    ],
    [
      "Ecuaciones Diferenciales",
      "Optativa Física (V)",
      "flecha"
    ],
    [
      "Ecuaciones Diferenciales",
      "Optativa Informática (VII)",
      "letra C"
    ],
    [
      "Variable Compleja",
      "Señales y Sistemas II",
      "flecha"
    ],
    [
      "Fundamentos de Electricidad y Magnetismo",
      "Optativa Cs. Económicas (VII)",
      "letra E"
    ],
    [
      "Ingeniería Económica",
      "Optativa Cs. Económicas (VII)",
      "flecha"
    ],
    [
      "Programación de Computadores",
      "Programación Orientada a Objetos",
      "flecha"
    ],
    [
      "Programación Orientada a Objetos",
      "Estructuras de Datos",
      "flecha"
    ],
    [
      "Estructuras de Datos",
      "Redes de Computadores",
      "flecha"
    ],
    [
      "Taller Ing. Electrónica",
      "Circuitos Eléctricos I",
      "flecha"
    ],
    [
      "Circuitos Eléctricos I",
      "Electrónica Análoga I",
      "flecha"
    ],
    [
      "Circuitos Eléctricos I",
      "Señales y Sistemas I",
      "flecha"
    ],
    [
      "Electrónica Análoga I",
      "Electrónica Digital I",
      "flecha"
    ],
    [
      "Electrónica Digital I",
      "Microcontroladores",
      "flecha"
    ],
    [
      "Señales y Sistemas I",
      "Señales y Sistemas II",
      "flecha"
    ],
    [
      "Señales y Sistemas II",
      "Control",
      "flecha"
    ],
    [
      "Señales y Sistemas II",
      "Sensores y Actuadores",
      "flecha"
    ],
    [
      "Control",
      "Robótica",
      "flecha"
    ],
    [
      "Control",
      "Optativa Automatización y Control (VIII)",
      "flecha"
    ],
    [
      "Estática",
      "Resistencia de Materiales",
      "flecha"
    ],
    [
      "Resistencia de Materiales",
      "Diseño Mecatrónico",
      "flecha"
    ],
    [
      "Dinámica",
      "Diseño Mecatrónico",
      "flecha"
    ],
    [
      "Diseño Mecatrónico",
      "Servomecanismos",
      "flecha"
    ],
    [
      "Principios de Química",
      "Ciencia e Ing. de Materiales",
      "flecha"
    ],
    [
      "Tec. Mecánica Básica",
      "Ciencia e Ing. de Materiales",
      "flecha"
    ],
    [
      "Dibujo básico",
      "Tec. Mecánica Básica",
      "flecha"
    ],
    [
      "Ing. y Des. Sostenible",
      "Tec. Mecánica Básica",
      "flecha"
    ],
    [
      "Ing. y Des. Sostenible",
      "Taller de Proyectos Interdisciplinarios",
      "flecha"
    ],
    [
      "Ciencia e Ing. de Materiales",
      "Optativa Materiales y Procesos (VI)",
      "flecha"
    ],
    [
      "Resistencia de Materiales",
      "Optativa Materiales y Procesos (VI)",
      "flecha"
    ],
    [
      "Optativa Materiales y Procesos (VI)",
      "Automatización de Procesos",
      "flecha"
    ],
    [
      "Sensores y Actuadores",
      "Automatización de Procesos",
      "flecha"
    ],
    [
      "Robótica",
      "Automatización de Procesos",
      "flecha"
    ],
    [
      "Servomecanismos",
      "Automatización de Procesos",
      "flecha"
    ],
    [
      "Inglés I",
      "Inglés II",
      "flecha"
    ],
    [
      "Inglés II",
      "Inglés III",
      "flecha"
    ],
    [
      "Inglés III",
      "Inglés IV",
      "flecha"
    ]
  ],
  "reqCred": [
    [
      "Taller de Proyectos Interdisciplinarios",
      52,
      [
        "C"
      ]
    ],
    [
      "Proyecto Aplicado de Ingeniería",
      65,
      [
        "B",
        "C",
        "L"
      ]
    ],
    [
      "Trabajo de Grado",
      69,
      [
        "B",
        "C",
        "L"
      ]
    ]
  ],
  "componentes": [
    [
      "B",
      "Fundamentación",
      true
    ],
    [
      "C",
      "Disciplinar",
      true
    ],
    [
      "L",
      "Libre elección",
      true
    ],
    [
      "N",
      "Nivelación",
      false
    ]
  ],
  "caracteres": [
    [
      "obl",
      "Obligatoria"
    ],
    [
      "opt",
      "Optativa"
    ]
  ],
  "metadatos": {
    "malla": "28 de julio de 2022",
    "tipologias": "catálogo aportado (fecha no indicada)",
    "horarios": "oferta académica aportada (fecha de captura no registrada)"
  },
  "programa": {
    "id": "mecatronica",
    "nombre": "Ingeniería Mecatrónica"
  },
  "calendario": {
    "dias": [
      [
        "L",
        "Lunes",
        "Lun"
      ],
      [
        "M",
        "Martes",
        "Mar"
      ],
      [
        "X",
        "Miércoles",
        "Mié"
      ],
      [
        "J",
        "Jueves",
        "Jue"
      ],
      [
        "V",
        "Viernes",
        "Vie"
      ],
      [
        "S",
        "Sábado",
        "Sáb"
      ]
    ],
    "inicio": 6,
    "fin": 21
  },
  "opciones": {
    "distanciasDisponibles": [
      0,
      1,
      2
    ],
    "distanciasIniciales": [
      0,
      1
    ],
    "excluirIndirectos": true,
    "asignaturaInicial": "Estática",
    "componentesComparables": [
      "C",
      "B",
      "N"
    ]
  },
  "almacenamiento": {
    "clave": "interferencias-horarios-v3"
  },
  "vinculosCatalogo": [
    [
      "Cálculo Diferencial",
      "1000004-B"
    ],
    [
      "Dibujo básico",
      "2015711"
    ],
    [
      "Programación de Computadores",
      "2015734"
    ],
    [
      "Tec. Mecánica Básica",
      "2017278"
    ],
    [
      "Ing. y Des. Sostenible",
      "2017265"
    ],
    [
      "Cálculo Integral",
      "1000005-B"
    ],
    [
      "Fundamentos de Mecánica",
      "1000019-B"
    ],
    [
      "Álgebra Lineal",
      "1000003-B"
    ],
    [
      "Taller Ing. Electrónica",
      "2016509"
    ],
    [
      "Cálculo en Varias Variables",
      "1000006-B"
    ],
    [
      "Fundamentos de Electricidad y Magnetismo",
      "1000017-B"
    ],
    [
      "Probabilidad y Estadística Fundamental",
      "1000013-B"
    ],
    [
      "Principios de Química",
      "1000024-B"
    ],
    [
      "Estática",
      "2016640"
    ],
    [
      "Circuitos Eléctricos I",
      "2016489"
    ],
    [
      "Ecuaciones Diferenciales",
      "1000007-B"
    ],
    [
      "Programación Orientada a Objetos",
      "2016375"
    ],
    [
      "Dinámica",
      "2017271"
    ],
    [
      "Electrónica Análoga I",
      "2016495"
    ],
    [
      "Variable Compleja",
      "2015159"
    ],
    [
      "Señales y Sistemas I",
      "2016506"
    ],
    [
      "Ciencia e Ing. de Materiales",
      "2017256"
    ],
    [
      "Resistencia de Materiales",
      "2017277"
    ],
    [
      "Estructuras de Datos",
      "2016699"
    ],
    [
      "Ingeniería Económica",
      "2015703"
    ],
    [
      "Señales y Sistemas II",
      "2016507"
    ],
    [
      "Diseño Mecatrónico",
      "2017282"
    ],
    [
      "Electrónica Digital I",
      "2016498"
    ],
    [
      "Control",
      "2016493"
    ],
    [
      "Sensores y Actuadores",
      "2017287"
    ],
    [
      "Redes de Computadores",
      "2025967"
    ],
    [
      "Microcontroladores",
      "2016753"
    ],
    [
      "Robótica",
      "2016770"
    ],
    [
      "Servomecanismos",
      "2017288"
    ],
    [
      "Automatización de Procesos",
      "2017280"
    ],
    [
      "Inglés I",
      "1000044-B"
    ],
    [
      "Inglés II",
      "1000045-B"
    ],
    [
      "Inglés III",
      "1000046-B"
    ],
    [
      "Inglés IV",
      "1000047-B"
    ],
    [
      "Taller de Proyectos Interdisciplinarios",
      "2024045"
    ],
    [
      "Proyecto Aplicado de Ingeniería",
      "2017275"
    ],
    [
      "Trabajo de Grado",
      "2017297"
    ]
  ],
  "fuentes": {
    "catalogo": {
      "archivo": "js/catalogo.js",
      "descripcion": "Consulta de asignaturas, códigos, tipologías y descripciones",
      "captura": null
    },
    "oferta": {
      "archivo": "js/oferta-fuente.js",
      "descripcion": "Oferta de asignaturas, grupos, actividades y horarios",
      "captura": null
    },
    "malla": {
      "archivo": "js/datos.js",
      "descripcion": "Plan curricular por semestre, créditos y requisitos",
      "version": "28 de julio de 2022"
    }
  },
  "incrementosOferta": {
    "id": "BN-oferta-20261107",
    "nuevasAsignaturas": [
      "Cálculo Diferencial",
      "Programación de Computadores",
      "Cálculo Integral",
      "Fundamentos de Mecánica",
      "Álgebra Lineal",
      "Cálculo en Varias Variables",
      "Fundamentos de Electricidad y Magnetismo",
      "Probabilidad y Estadística Fundamental",
      "Principios de Química",
      "Ecuaciones Diferenciales",
      "Variable Compleja",
      "Ingeniería Económica",
      "Inglés I",
      "Inglés II",
      "Inglés III",
      "Inglés IV"
    ],
    "complementarGrupos": [
      [
        "Dibujo básico",
        [
          "GSUMA-01",
          "GORIN-01"
        ]
      ]
    ]
  }
};
