// backend/src/resetCurriculum.js
const Database = require("better-sqlite3");

// Abrir la base de datos directamente
const db = new Database("eduplan.db");

try {
  db.exec(`DROP TABLE IF EXISTS curriculum;`);

  db.exec(`
    CREATE TABLE curriculum (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER,
      nivel TEXT,
      grado TEXT,
      asignatura TEXT,
      edades TEXT,
      periodos INTEGER,
      contenido TEXT,
      anio INTEGER,
      createdAt TEXT
    );
  `);

  console.log("✅ Tabla 'curriculum' recreada correctamente.");
} catch (e) {
  console.error("❌ Error al recrear la tabla:", e.message);
}
