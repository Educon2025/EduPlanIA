// backend/src/migrate.js
const db = require("./db").default;

try {
  db.exec(`ALTER TABLE curriculum ADD COLUMN anio INTEGER;`);
  console.log("Columna 'anio' añadida correctamente.");
} catch (e) {
  console.log("Columna 'anio' ya existe o no se pudo agregar:", e.message);
}

try {
  db.exec(`ALTER TABLE curriculum ADD COLUMN createdAt TEXT;`);
  console.log("Columna 'createdAt' añadida correctamente.");
} catch (e) {
  console.log("Columna 'createdAt' ya existe o no se pudo agregar:", e.message);
}

console.log("✅ Migración completada.");
