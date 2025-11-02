const Database = require("better-sqlite3");

// Abrir la base de datos directamente
const db = new Database("eduplan.db");

try {
  // 1. Eliminar la tabla si existe
  db.exec(`DROP TABLE IF EXISTS planeadores;`);

  // 2. Crear la tabla con la columna contenido incluida
  db.exec(`
    CREATE TABLE planeadores (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER,
      asignatura TEXT,
      grado TEXT,
      periodo TEXT,
      tema TEXT,
      contenido TEXT,
      anio INTEGER,
      createdAt TEXT
    );
  `);

  console.log("✅ Tabla 'planeadores' recreada correctamente.");
} catch (e) {
  console.error("❌ Error al recrear la tabla:", e.message);
}
