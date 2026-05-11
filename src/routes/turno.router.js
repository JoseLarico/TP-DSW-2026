import express from "express";
import { TurnoController } from "../controllers/turno.controller.js";
import { validarSchema } from "../middlewares/validarCampos.middleware.js";
import {
  turnoSchema,
  solicitudCambioFechaPacienteSchema,
  solicitudCambioFechaMedicoSchema,
  confirmarRechazarPacienteSchema,
} from "../schemas/validation/turno.schema.js";

const router = express.Router();
const turnoController = new TurnoController();

router.post("/",
  validarSchema(turnoSchema),
  (req, res) => turnoController.altaTurno(req, res)
);
router.delete("/:turnoId/paciente", (req, res) => turnoController.cancelarPorPaciente(req, res));
router.delete("/:turnoId/medico", (req, res) => turnoController.cancelarPorMedico(req, res));

router.patch("/:turnoId/cambio-fecha/paciente",
  validarSchema(solicitudCambioFechaPacienteSchema),
  (req, res) => turnoController.cambiarFechaPaciente(req, res)
);
router.post("/:turnoId/solicitud-cambio-fecha/medico",
  validarSchema(solicitudCambioFechaMedicoSchema),
  (req, res) => turnoController.proponerCambioFechaMedico(req, res)
);
router.patch("/:turnoId/solicitud-cambio-fecha/confirmar/paciente",
  validarSchema(confirmarRechazarPacienteSchema),
  (req, res) => turnoController.confirmarCambioFechaPaciente(req, res)
);
router.patch("/:turnoId/solicitud-cambio-fecha/rechazar/paciente",
  validarSchema(confirmarRechazarPacienteSchema),
  (req, res) => turnoController.rechazarCambioFechaPaciente(req, res)
);

export default router;
