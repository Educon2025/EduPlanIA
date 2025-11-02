import { Router } from "express";
import db from "./db";
import { generarMallaIA, limpiarYParsearJSON } from "./ai";

const router = Router();

// Guardar malla
router.post("/", (req, res) => {
  const { userId, nivel, grado, asignatura, edades, periodos, contenido, anio } = req.body;
  const stmt = db.prepare(`
    INSERT INTO curriculum (userId, nivel, grado, asignatura, edades, periodos, contenido, anio, createdAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
  `);
  const result = stmt.run(
    userId,
    nivel,
    grado,
    asignatura,
    edades,
    periodos,
    JSON.stringify(contenido || {}),
    anio || new Date().getFullYear()
  );
  res.json({ id: result.lastInsertRowid });
});

// Listar mallas de un usuario (ordenadas por fecha)
router.get("/user/:userId", (req, res) => {
  const rows = db
    .prepare("SELECT * FROM curriculum WHERE userId = ? ORDER BY createdAt DESC")
    .all(req.params.userId);

  res.json(
    rows.map((r: any) => ({
      ...r,
      contenido: r.contenido ? JSON.parse(r.contenido) : {}
    }))
  );
});

// Eliminar malla
router.delete("/:id", (req, res) => {
  const { id } = req.params;
  const stmt = db.prepare("DELETE FROM curriculum WHERE id = ?");
  const result = stmt.run(id);
  if (result.changes === 0) {
    return res.status(404).json({ error: "Malla no encontrada" });
  }
  res.json({ success: true });
});

// Generar malla con IA
router.post("/generar", async (req, res) => {
  const { asignatura, grado, nivel, edades, periodos } = req.body;

  if (!asignatura || !grado || !nivel || !edades || !periodos) {
    return res.status(400).json({
      error: "Faltan datos requeridos",
      required: ["asignatura", "grado", "nivel", "edades", "periodos"]
    });
  }

  const prompt = `Eres un experto en diseño curricular del sistema educativo colombiano. Debes generar una malla curricular basándose ESTRICTAMENTE en:

📚 REFERENCIAS OBLIGATORIAS DEL MINISTERIO DE EDUCACIÓN NACIONAL DE COLOMBIA:
- Ley 115 de 1994 (Ley General de Educación)
- Decreto 1290 de 2009 (Evaluación del aprendizaje)
- Estándares Básicos de Competencias del MEN
- Derechos Básicos de Aprendizaje (DBA) vigentes
- Lineamientos Curriculares del área específica
- Orientaciones Pedagógicas del MEN para el área

🎯 DATOS DE LA MALLA A GENERAR:
- Asignatura: ${asignatura}
- Grado: ${grado}
- Nivel Educativo: ${nivel}
- Rango de Edades: ${edades}
- Número de Periodos Académicos: ${periodos}

⚠️ INSTRUCCIONES CRÍTICAS:
1. La malla DEBE estar alineada con el grado "${grado}" específico
2. Los contenidos DEBEN corresponder a la asignatura "${asignatura}" únicamente
3. Las competencias DEBEN ser apropiadas para estudiantes de ${edades}
4. Usa los DBA del MEN para ${grado} grado en ${asignatura}
5. Incluye estándares básicos de competencias del MEN para este nivel
6. Los indicadores de desempeño deben ser medibles y observables
7. Las estrategias metodológicas deben ser apropiadas para la edad
8. La evaluación debe seguir el Decreto 1290 de 2009

📋 ESTRUCTURA JSON REQUERIDA (responde SOLO con este JSON, sin texto adicional):
{
  "asignatura": "${asignatura}",
  "grado": "${grado}",
  "nivel": "${nivel}",
  "edades": "${edades}",
  "añoVigencia": ${new Date().getFullYear()},
  "fundamentoLegal": "Ley 115 de 1994, Decreto 1290 de 2009, Estándares Básicos de Competencias MEN",
  "periodos": [
    {
      "numero": 1,
      "nombre": "Primer Periodo",
      "duracion": "10 semanas",
      "estandares": ["Estándar básico de competencia del MEN para este grado y área"],
      "dba": ["DBA específico del grado ${grado} en ${asignatura} según MEN"],
      "competencias": ["Competencia específica del área ${asignatura} apropiada para ${grado} grado"],
      "indicadores": ["Indicador de desempeño medible apropiado para estudiantes de ${edades}"],
      "contenidos": [
        {
          "eje": "Eje temático según lineamientos del MEN para ${asignatura}",
          "temas": [
            { "nombre": "Tema específico del grado ${grado}", "subtemas": ["Subtema 1", "Subtema 2"], "tiempoSemanas": 3 }
          ]
        }
      ],
      "estrategiasMetodologicas": ["Estrategia pedagógica apropiada para ${edades}"],
      "recursos": ["Recursos didácticos apropiados para ${grado} grado"],
      "evaluacion": {
        "criterios": ["Criterio de evaluación según Decreto 1290"],
        "instrumentos": ["Instrumento de evaluación apropiado"],
        "tiposEvaluacion": ["Heteroevaluación", "Autoevaluación", "Coevaluación"]
      }
    }
  ]
}

GENERA ${periodos} PERIODOS COMPLETOS siguiendo esta estructura.
RESPONDE ÚNICAMENTE CON EL JSON VÁLIDO, SIN BLOQUES DE CÓDIGO MARKDOWN.`;

  try {
    console.log("📝 Generando malla curricular con IA...", { asignatura, grado, nivel, edades, periodos });
    const result = await generarMallaIA(prompt);

    if (!result) {
      return res.status(500).json({ error: "La IA no pudo generar una respuesta" });
    }

    let contenido: any;
    try {
      contenido = limpiarYParsearJSON(result);

      if (!contenido.periodos || !Array.isArray(contenido.periodos)) {
        throw new Error("El JSON no contiene la estructura esperada (falta 'periodos')");
      }

      if (contenido.asignatura !== asignatura) contenido.asignatura = asignatura;
      if (contenido.grado !== grado) contenido.grado = grado;
      if (contenido.nivel !== nivel) contenido.nivel = nivel;
      if (contenido.edades !== edades) contenido.edades = edades;

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
    console.error("❌ Error interno al generar con IA:", err);
    res.status(500).json({ error: "Error interno al generar con IA", detalles: err.message });
  }
});

// Refinar sección específica de la malla
router.post("/refinar", async (req, res) => {
  const { contenido, seccion, instrucciones } = req.body;
  if (!contenido || !seccion || !instrucciones) {
    return res.status(400).json({ error: "Faltan datos requeridos", required: ["contenido", "seccion", "instrucciones"] });
  }

  const prompt = `
Ajusta SOLO la sección "${seccion}" del siguiente JSON de malla curricular.
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
