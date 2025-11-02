import { Router } from "express";
import db from "./db";
import { generarMallaIA, limpiarYParsearJSON } from "./ai";

const router = Router();

// Guardar planeador
router.post("/", (req, res) => {
  const { userId, asignatura, grado, periodo, tema, contenido } = req.body;
  const stmt = db.prepare(`
    INSERT INTO planeadores (userId, asignatura, grado, periodo, tema, contenido)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  const result = stmt.run(
    userId,
    asignatura,
    grado,
    periodo,
    tema || "",
    JSON.stringify(contenido || {})
  );
  res.json({ id: result.lastInsertRowid });
});

// Listar planeadores (ordenados por fecha)
router.get("/:userId", (req, res) => {
  const rows = db
    .prepare("SELECT * FROM planeadores WHERE userId = ? ORDER BY createdAt DESC")
    .all(req.params.userId);
  res.json(rows.map(r => ({ ...r, contenido: r.contenido ? JSON.parse(r.contenido) : null })));
});

// Generar planeador con IA
router.post("/generar", async (req, res) => {
  const { asignatura, grado, periodo, tema } = req.body;

  if (!asignatura || !grado || !periodo) {
    return res.status(400).json({
      error: "Faltan datos requeridos",
      required: ["asignatura", "grado", "periodo"]
    });
  }

  const prompt = `Eres un experto en diseño curricular y planeación pedagógica del sistema educativo colombiano. Debes generar un PLANEADOR DE CLASE detallado basándote en:

📚 REFERENCIAS OBLIGATORIAS DEL MINISTERIO DE EDUCACIÓN NACIONAL DE COLOMBIA:
- Ley 115 de 1994 (Ley General de Educación)
- Decreto 1290 de 2009 (Evaluación del aprendizaje)
- Estándares Básicos de Competencias del MEN
- Derechos Básicos de Aprendizaje (DBA) vigentes
- Lineamientos Curriculares del área específica
- Modelo pedagógico constructivista y aprendizaje significativo

🎯 DATOS DEL PLANEADOR A GENERAR:
- Asignatura: ${asignatura}
- Grado: ${grado}
- Periodo Académico: ${periodo}
- Tema Central: ${tema || "Tema del periodo según DBA"}
- Duración estimada: 1 periodo académico (10 semanas aproximadamente)

⚠️ INSTRUCCIONES CRÍTICAS:
1. El planeador DEBE estar alineado con el grado "${grado}" específico
2. Los contenidos DEBEN corresponder a la asignatura "${asignatura}" únicamente
3. Las actividades deben seguir la estructura: INICIO → DESARROLLO → CIERRE
4. Usa los DBA del MEN para ${grado} grado en ${asignatura}
5. Incluye estándares básicos de competencias del MEN para este nivel
6. Los objetivos deben ser SMART (específicos, medibles, alcanzables, relevantes, temporales)
7. Las estrategias metodológicas deben promover el aprendizaje activo
8. La evaluación debe ser formativa y seguir el Decreto 1290 de 2009
9. Los recursos deben ser accesibles y pertinentes al contexto colombiano

📋 ESTRUCTURA JSON REQUERIDA (responde SOLO con este JSON, sin texto adicional):
{
  "asignatura": "${asignatura}",
  "grado": "${grado}",
  "periodo": "${periodo}",
  "tema": "${tema || "Tema del periodo"}",
  "duracion": "10 semanas",
  "fundamentoLegal": "Ley 115 de 1994, Decreto 1290 de 2009, Estándares MEN",
  "estandares": [
    "Estándar básico de competencia del MEN para ${grado} grado en ${asignatura}"
  ],
  "dba": [
    "DBA específico del grado ${grado} en ${asignatura} según MEN"
  ],
  "objetivos": [
    "Objetivo de aprendizaje específico, medible y alcanzable para el periodo ${periodo}",
    "Objetivo que desarrolla competencias del área ${asignatura}"
  ],
  "competencias": [
    "Competencia específica del área ${asignatura} apropiada para ${grado} grado",
    "Competencia ciudadana o transversal pertinente"
  ],
  "contenidos": [
    {
      "semana": 1,
      "tema": "Subtema específico del tema central",
      "descripcion": "Descripción breve del contenido a trabajar"
    },
    {
      "semana": 2,
      "tema": "Siguiente subtema progresivo",
      "descripcion": "Descripción del contenido"
    }
  ],
  "actividades": {
    "inicio": [
      "Actividad de motivación y exploración de saberes previos (15-20 min)",
      "Presentación del objetivo de aprendizaje y contextualización"
    ],
    "desarrollo": [
      "Actividad de conceptualización y construcción de conocimiento (40-50 min)",
      "Trabajo colaborativo o individual aplicando lo aprendido",
      "Ejercicios prácticos con retroalimentación formativa"
    ],
    "cierre": [
      "Actividad de síntesis y reflexión sobre lo aprendido (10-15 min)",
      "Evaluación formativa y metacognición"
    ]
  },
  "estrategiasMetodologicas": [
    "Aprendizaje basado en problemas contextualizado",
    "Trabajo colaborativo en equipos heterogéneos",
    "Uso de TIC y recursos digitales educativos",
    "Diferenciación pedagógica según ritmos de aprendizaje"
  ],
  "recursos": [
    "Recurso didáctico específico y accesible",
    "Material tecnológico o digital pertinente",
    "Recursos del medio o contexto local colombiano"
  ],
  "evaluacion": {
    "criterios": [
      "Criterio de evaluación específico y observable",
      "Criterio que evalúa comprensión conceptual",
      "Criterio que evalúa aplicación práctica"
    ],
    "instrumentos": [
      "Rúbrica analítica para evaluar el desempeño",
      "Observación sistemática con registro",
      "Portafolio de evidencias del estudiante"
    ],
    "tipos": [
      "Heteroevaluación (docente evalúa estudiante)",
      "Autoevaluación (estudiante reflexiona sobre su proceso)",
      "Coevaluación (evaluación entre pares)"
    ],
    "momentos": {
      "diagnostica": "Exploración de saberes previos al inicio del periodo",
      "formativa": "Retroalimentación continua durante el desarrollo",
      "sumativa": "Valoración integral de aprendizajes al finalizar"
    }
  },
  "atencionDiversidad": [
    "Estrategia de apoyo para estudiantes con ritmo lento de aprendizaje",
    "Actividades de profundización para estudiantes avanzados",
    "Ajustes razonables según NEE (Necesidades Educativas Especiales)"
  ],
  "articulacionCurricular": {
    "transversalidad": "Conexión con otras áreas del conocimiento",
    "competenciasCiudadanas": "Desarrollo de convivencia, participación democrática",
    "proyectosPedagogicos": "Vinculación con proyectos institucionales (PRAE, educación sexual, etc.)"
  }
}

✅ GENERA UN PLANEADOR COMPLETO Y COHERENTE siguiendo esta estructura.
RESPONDE ÚNICAMENTE CON EL JSON VÁLIDO, SIN BLOQUES DE CÓDIGO MARKDOWN.`;

  try {
    console.log("🔍 Generando planeador con IA...", { asignatura, grado, periodo, tema });
    const result = await generarMallaIA(prompt);

    if (!result) {
      return res.status(500).json({ error: "La IA no pudo generar una respuesta" });
    }

    let contenido;
    try {
      contenido = limpiarYParsearJSON(result);

      // Validar estructura mínima
      if (!contenido.objetivos || !contenido.actividades) {
        throw new Error("El JSON no contiene la estructura esperada (falta 'objetivos' o 'actividades')");
      }

      // Asegurar que los datos del request estén en el resultado
      if (contenido.asignatura !== asignatura) contenido.asignatura = asignatura;
      if (contenido.grado !== grado) contenido.grado = grado;
      if (contenido.periodo !== periodo) contenido.periodo = periodo;
      if (tema && contenido.tema !== tema) contenido.tema = tema;

      res.json({ contenido });
    } catch (parseError: any) {
      console.error("❌ Error al parsear JSON:", parseError.message);
      return res.status(500).json({
        error: "La IA no devolvió JSON válido",
        detalles: parseError.message,
        muestra: (result || "").substring(0, 500)
      });
    }
  } catch (err: any) {
    console.error("❌ Error interno al generar planeador con IA:", err);
    res.status(500).json({ error: "Error interno al generar con IA", detalles: err.message });
  }
});

// Refinar sección del planeador
router.post("/refinar", async (req, res) => {
  const { contenido, seccion, instrucciones } = req.body;
  if (!contenido || !seccion || !instrucciones) {
    return res.status(400).json({ error: "Faltan datos requeridos", required: ["contenido", "seccion", "instrucciones"] });
  }

  const prompt = `
Ajusta SOLO la sección "${seccion}" del siguiente JSON de planeador de clase.
JSON actual:
${JSON.stringify(contenido)}
Instrucciones de ajuste:
${instrucciones}

Devuelve el JSON COMPLETO actualizado. Responde únicamente con JSON válido, sin texto adicional.
  `;

  try {
    const result = await generarMallaIA(prompt);
    if (!result) return res.status(500).json({ error: "La IA no pudo refinar el contenido" });

    const nuevo = limpiarYParsearJSON(result);
    res.json({ contenido: nuevo });
  } catch (err: any) {
    res.status(500).json({ error: "Error al refinar contenido", detalles: err.message });
  }
});

export default router;