import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import db from "./db";

const router = Router();
const SECRET = process.env.JWT_SECRET || "super-secreto";

router.post("/register", (req, res) => {
  const { email, name, password } = req.body;

  if (!email || !name || !password) {
    return res.status(400).json({ error: "Faltan datos requeridos" });
  }

  const hash = bcrypt.hashSync(password, 10);
  try {
    db.prepare("INSERT INTO users (email, name, password) VALUES (?, ?, ?)")
      .run(email, name, hash);
    res.json({ ok: true });
  } catch {
    res.status(400).json({ error: "Usuario ya existe" });
  }
});

router.post("/login", (req, res) => {
  const { email, password } = req.body;
  const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email);
  if (!user) return res.status(401).json({ error: "No existe" });
  const ok = bcrypt.compareSync(password, user.password);
  if (!ok) return res.status(401).json({ error: "Contraseña incorrecta" });
  const token = jwt.sign({ id: user.id }, SECRET, { expiresIn: "7d" });
  res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
});

export default router;
