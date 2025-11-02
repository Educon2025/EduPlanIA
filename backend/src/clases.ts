import { Router } from "express";
import db from "./db";
import { generarMallaIA, limpiarYParsearJSON } from "./ai";

const router = Router();

// Guardar clase
router.post("/", (req, res) => {
  const { userId, asignatura, grado, tema, objetivos, contenido } = req.body;
  const stmt = db.prepare(`
    INSERT INTO clases (userId, asignatura, grado, tema, objetivos, contenido)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  const result = stmt.run(
    userId,
    asignatura,
    grado,
    tema || "",
    objetivos || "",
    JSON.stringify(contenido || {})
  );
  res.json({ id: result.lastInsertRowid });
});

// Listar clases (ordenadas por fecha)
router.get("/:userId", (req, res) => {
  const rows = db
    .prepare("SELECT * FROM clases WHERE userId = ? ORDER BY createdAt DESC")
    .all(req.params.userId);
  res.json(rows.map(r => ({ ...r, contenido: r.contenido ? JSON.parse(r.contenido) : null })));
});

// Generar clase con IA
router.post("/generar", async (req, res) => {
  const { asignatura, grado, tema } = req.body;

  if (!asignatura || !grado) {
    return res.status(400).json({ error: "Faltan datos requeridos", required: ["asignatura", "grado"] });
  }

  const prompt = `Eres un experto en diseño de clases y didáctica del sistema educativo colombiano. Debes generar una PLANEACIÓN DE CLASE DETALLADA (sesión única) basándote en:

📚 REFERENCIAS OBLIGATORIAS DEL MINISTERIO DE EDUCACIÓN NACIONAL DE COLOMBIA:
- Ley 115 de 1994 (Ley General de Educación)
- Decreto 1290 de 2009 (Evaluación del aprendizaje)
- Estándares Básicos de Competencias del MEN
- Derechos Básicos de Aprendizaje (DBA) vigentes
- Modelo de clase estructurada: Inicio → Desarrollo → Cierre
- Enfoque por competencias y aprendizaje activo

🎯 DATOS DE LA CLASE A GENERAR:
- Asignatura: ${asignatura}
- Grado: ${grado}
- Tema de la clase: ${tema || "Tema específico del currículo"}
- Duración: 1 sesión de clase (45-60 minutos aproximadamente)
- Enfoque: Clase práctica con actividades de aprendizaje activo

⚠️ INSTRUCCIONES CRÍTICAS:
1. La clase DEBE estar alineada con el grado "${grado}" específico
2. Los contenidos DEBEN corresponder a la asignatura "${asignatura}" únicamente
3. Seguir la estructura temporal: INICIO (15 min) → DESARROLLO (30-35 min) → CIERRE (10 min)
4. Los objetivos deben ser específicos para UNA SOLA SESIÓN de clase
5. Las actividades deben ser concretas, ejecutables y con tiempos definidos
6. Incluir estrategias de motivación y manejo de grupo
7. La evaluación debe ser formativa y continua durante la clase
8. Los recursos deben ser prácticos y disponibles en el aula colombiana

📋 ESTRUCTURA JSON REQUERIDA (responde SOLO con este JSON, sin texto adicional):
{
  "asignatura": "${asignatura}",
  "grado": "${grado}",
  "tema": "${tema || "Tema específico"}",
  "duracion": "45-60 minutos",
  "fechaSugerida": "Sesión única dentro del periodo académico",
  "fundamentoLegal": "Estándares MEN, DBA vigentes",
  "estandar": "Estándar básico de competencia del MEN para ${grado} grado en ${asignatura}",
  "dba": "DBA específico relacionado con el tema ${tema || "del currículo"}",
  "objetivos": [
    "Objetivo específico de aprendizaje para esta sesión de clase",
    "Objetivo procedimental o actitudinal complementario"
  ],
  "competencias": [
    "Competencia específica del área ${asignatura} que se desarrolla en esta clase",
    "Competencia transversal (comunicativa, ciudadana, etc.)"
  ],
  "saberesPrevios": [
    "Conocimiento previo necesario que deben tener los estudiantes",
    "Concepto o habilidad base para esta clase"
  ],
  "actividades": {
    "inicio": {
      "duracion": "15 minutos",
      "actividades": [
        "Saludo y toma de asistencia (2 min)",
        "Actividad de motivación relacionada con el tema (ej: pregunta provocadora, video corto, anécdota) (5 min)",
        "Exploración de saberes previos mediante preguntas orientadoras (5 min)",
        "Presentación del objetivo de aprendizaje y agenda de la clase (3 min)"
      ],
      "estrategia": "Aprendizaje basado en indagación",
      "organizacion": "Trabajo en grupo completo"
    },
    "desarrollo": {
      "duracion": "30-35 minutos",
      "actividades": [
        "Explicación del concepto central con ejemplos contextualizados (10 min)",
        "Demostración práctica o modelamiento del docente (5 min)",
        "Actividad práctica guiada en grupos pequeños (2-4 estudiantes) (10 min)",
        "Socialización de resultados y retroalimentación formativa (5-10 min)"
      ],
      "estrategia": "Aprendizaje cooperativo y práctica guiada",
      "organizacion": "Grupos pequeños de 2-4 estudiantes",
      "diferenciacion": "Apoyo individualizado a estudiantes que lo requieran"
    },
    "cierre": {
      "duracion": "10 minutos",
      "actividades": [
        "Síntesis colectiva de lo aprendido (pregunta: ¿Qué aprendimos hoy?) (4 min)",
        "Metacognición: reflexión sobre cómo aprendieron (3 min)",
        "Actividad de transferencia o tarea para la casa (2 min)",
        "Despedida y proyección de la siguiente clase (1 min)"
      ],
      "estrategia": "Reflexión metacognitiva",
      "organizacion": "Trabajo individual y plenaria"
    }
  },
  "estrategiasDidacticas": [
    "Modelamiento del docente",
    "Trabajo colaborativo en equipos",
    "Uso de preguntas orientadoras",
    "Retroalimentación formativa continua",
    "Aprendizaje basado en la práctica"
  ],
  "estrategiasManejoGrupo": [
    "Establecimiento de normas claras al inicio",
    "Asignación de roles en trabajo grupal",
    "Monitoreo activo durante las actividades",
    "Refuerzo positivo de comportamientos adecuados"
  ],
  "recursos": [
    "Tablero y marcadores",
    "Material concreto manipulable (especificar según tema)",
    "Fotocopias de guía de trabajo (1 por estudiante)",
    "Recurso digital (video, presentación, app educativa)",
    "Cuaderno y útiles escolares de los estudiantes"
  ],
  "evaluacion": {
    "tipo": "Evaluación formativa continua",
    "momentos": {
      "diagnostica": "Exploración de saberes previos en el inicio",
      "procesual": "Observación durante el desarrollo y retroalimentación inmediata",
      "final": "Síntesis y actividad de cierre"
    },
    "criterios": [
      "Comprende el concepto o procedimiento enseñado",
      "Aplica lo aprendido en situaciones prácticas",
      "Participa activamente y colabora con sus compañeros",
      "Realiza metacognición sobre su proceso de aprendizaje"
    ],
    "instrumentos": [
      "Observación directa con registro anecdótico",
      "Revisión de trabajo práctico realizado en clase",
      "Preguntas orales durante la clase",
      "Autoevaluación oral al cierre"
    ],
    "evidencias": [
      "Trabajo práctico desarrollado en la clase",
      "Participación oral documentada",
      "Registro fotográfico del proceso (opcional)"
    ]
  },
  "atencionDiversidad": [
    "Explicación con múltiples representaciones (visual, auditiva, kinestésica)",
    "Tiempo adicional para estudiantes con NEE",
    "Material de apoyo diferenciado según niveles",
    "Acompañamiento cercano a estudiantes que lo requieran"
  ],
  "tareaCasa": {
    "descripcion": "Actividad corta de refuerzo o aplicación",
    "duracion": "15-20 minutos",
    "objetivo": "Consolidar el aprendizaje de la clase"
  },
  "reflexionDocente": {
    "preguntasGuia": [
      "¿Los estudiantes alcanzaron el objetivo de aprendizaje?",
      "¿Qué ajustes debo hacer para la próxima sesión?",
      "¿Qué estudiantes requieren apoyo adicional?"
    ]
  }
}

✅ GENERA UNA PLANEACIÓN DE CLASE COMPLETA, CONCRETA Y EJECUTABLE siguiendo esta estructura.
RESPONDE ÚNICAMENTE CON EL JSON VÁLIDO, SIN BLOQUES DE CÓDIGO MARKDOWN.`;

  try {
    console.log("🔍 Generando clase con IA...", { asignatura, grado, tema });
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
    console.error("❌ Error interno al generar clase con IA:", err);
    res.status(500).json({ error: "Error interno al generar con IA", detalles: err.message });
  }
});

// Refinar sección de la clase
router.post("/refinar", async (req, res) => {
  const { contenido, seccion, instrucciones } = req.body;
  if (!contenido || !seccion || !instrucciones) {
    return res.status(400).json({ error: "Faltan datos requeridos", required: ["contenido", "seccion", "instrucciones"] });
  }

  const prompt = `
Ajusta SOLO la sección "${seccion}" del siguiente JSON de planeación de clase.
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