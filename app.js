import express from "express";
import medicoRouter from "./src/routes/medico.router.js";
import turnoRouter from "./src/routes/turno.router.js"
import healthRouter from "./src/routes/health.router.js";
const app = express();
app.use(express.json());
app.use("/medicos", medicoRouter);
app.use("/turnos", turnoRouter);
app.use("/", healthRouter);
export default app;