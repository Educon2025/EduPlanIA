import axios from "axios";
import dotenv from "dotenv";

// ✅ Cargar variables de entorno
dotenv.config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";

async function listAvailableModels() {
  // Verificar que la API key existe
  if (!GEMINI_API_KEY) {
    console.error("❌ GEMINI_API_KEY no está definida en el archivo .env");
    console.log("📝 Asegúrate de tener un archivo .env con:");
    console.log("   GEMINI_API_KEY=tu_api_key_aqui");
    return;
  }

  console.log(`🔑 API Key detectada: ${GEMINI_API_KEY.substring(0, 10)}...`);

  try {
    const response = await axios.get(
      `https://generativelanguage.googleapis.com/v1beta/models`,
      {
        params: {
          key: GEMINI_API_KEY
        }
      }
    );
    
    console.log("\n📋 MODELOS DISPONIBLES:\n");
    
    response.data.models.forEach((model: any) => {
      if (model.supportedGenerationMethods?.includes('generateContent')) {
        console.log(`✅ ${model.name}`);
        console.log(`   Nombre corto: ${model.name.replace('models/', '')}`);
        console.log(`   Métodos: ${model.supportedGenerationMethods.join(', ')}\n`);
      }
    });
  } catch (error: any) {
    console.error("❌ Error listando modelos:", error.response?.data || error.message);
  }
}

listAvailableModels();