// backend/src/resetClases.js
const Database = require("better-sqlite3");

// Abrir la base de datos directamente
const db = new Database("eduplan.db");

try {
  db.exec(`DROP TABLE IF EXISTS clases;`);

  db.exec(`
    CREATE TABLE clases (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER,
      asignatura TEXT,
      grado TEXT,
      tema TEXT,
      objetivos TEXT,
      contenido TEXT,   -- 🔹 aquí añadimos la columna que faltaba
      anio INTEGER,
      createdAt TEXT
    );
  `);

  console.log("✅ Tabla 'clases' recreada correctamente con columna 'contenido'.");
} catch (e) {
  console.error("❌ Error al recrear la tabla:", e.message);
}
