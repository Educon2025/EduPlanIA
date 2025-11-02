// utils/safeParseJSON.ts
export function safeParseJSON(input: any) {
  if (!input) return null;

  // Si ya es objeto, lo devolvemos tal cual
  if (typeof input === "object") return input;

  if (typeof input === "string") {
    try {
      return JSON.parse(input);
    } catch (err) {
      // Intento de limpieza básica: quitar comas sobrantes
      const fixed = input
        .replace(/,\s*]/g, "]")
        .replace(/,\s*}/g, "}");
      try {
        return JSON.parse(fixed);
      } catch (err2) {
        console.error("JSON inválido:", err2, input);
        return null;
      }
    }
  }

  return null;
}
