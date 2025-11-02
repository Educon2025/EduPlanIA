import axios from "axios";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";

// Modelos disponibles para fallback
const MODELS = [
  "gemini-2.5-flash",
  "gemini-2.5-pro",
  "gemini-2.0-flash",
  "gemini-pro-latest"
];

/**
 * Llama a Gemini con fallback de modelos y devuelve texto.
 */
export async function generarMallaIA(prompt: string): Promise<string | null> {
  if (!GEMINI_API_KEY) {
    console.error("❌ GEMINI_API_KEY no está configurada");
    return null;
  }

  for (const model of MODELS) {
    try {
      console.log(`🔎 Intentando generar con modelo: ${model}`);

      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
        {
          contents: [{ parts: [{ text: prompt }] }]
        },
        {
          headers: { "Content-Type": "application/json" },
          params: { key: GEMINI_API_KEY }
        }
      );

      const text =
        response.data?.candidates?.[0]?.content?.parts?.[0]?.text ||
        response.data?.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

      if (text) {
        console.log(`✅ Respuesta obtenida con modelo: ${model}`);
        return text;
      }
    } catch (err: any) {
      const errorData = err.response?.data || err.message;
      console.error(`❌ Error con modelo ${model}:`, JSON.stringify(errorData, null, 2));

      if (err.response?.status === 401 || err.response?.status === 403) {
        console.error("🚫 Error de autenticación. Verifica tu GEMINI_API_KEY");
        return null;
      }
    }
  }

  console.error("⚠️ Ningún modelo respondió correctamente.");
  return null;
}

/**
 * Limpia texto, remueve bloque de código y parsea JSON.
 */
export function limpiarYParsearJSON(texto: string): any {
  let clean = (texto || "").trim();

  if (clean.startsWith("```json")) {
    clean = clean.replace(/```json\n?/g, "").replace(/```\n?$/g, "");
  } else if (clean.startsWith("```")) {
    clean = clean.replace(/```\n?/g, "");
  }

  clean = clean.trim();

  return JSON.parse(clean);
}
