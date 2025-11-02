import "dotenv/config";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRouter from "./auth";
import curriculumRouter from "./curriculum";
import planeadorRouter from "./planeadores";
import claseRouter from "./clases";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use("/auth", authRouter);
app.use("/curriculum", curriculumRouter);
app.use("/planeadores", planeadorRouter);
app.use("/clases", claseRouter);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
