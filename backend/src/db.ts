// backend/src/db.ts
import Database from "better-sqlite3";

const db = new Database("eduplan.db");

// Tablas con columna createdAt para trazabilidad
db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  createdAt TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS curriculum (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  userId INTEGER,
  nivel TEXT,
  grado TEXT,
  asignatura TEXT,
  edades TEXT,
  periodos INTEGER,
  contenido TEXT,
  anio INTEGER,
  createdAt TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS planeadores (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  userId INTEGER,
  asignatura TEXT,
  grado TEXT,
  periodo TEXT,
  tema TEXT,
  contenido TEXT,
  createdAt TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS clases (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  userId INTEGER,
  asignatura TEXT,
  grado TEXT,
  tema TEXT,
  objetivos TEXT,
  contenido TEXT,
  createdAt TEXT DEFAULT (datetime('now'))
);
`);

export default db;
