import express from "express";
import medicoRouter from "./src/routes/medico.router.js";
import turnoRouter from "./src/routes/turno.router.js"
import healthRouter from "./src/routes/health.router.js";
import notificacionRouter from "./src/routes/notificacion.router.js";
import pacienteRouter from "./src/routes/paciente.router.js";

import especialidadRouter from "./src/routes/especialidad.router.js";
import practicaRouter from "./src/routes/practica.router.js";
import obraSocialRouter from "./src/routes/obraSocial.router.js";
import sedeRouter from "./src/routes/sede.router.js";

const app = express();
app.use(express.json());
app.use("/medicos", medicoRouter);
app.use("/turnos", turnoRouter);
app.use("/", healthRouter);
app.use("/notificaciones", notificacionRouter);
app.use("/pacientes", pacienteRouter);

app.use("/especialidades", especialidadRouter);
app.use("/practicas", practicaRouter);
app.use("/obras-sociales", obraSocialRouter);
app.use("/sedes", sedeRouter);

export default app;
