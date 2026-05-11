import express from "express";
import { MedicoController } from "../controllers/medico.controller.js";
import { validarSchema } from "../middlewares/validarCampos.middleware.js";
import { disponibilidadSchema } from "../schemas/validation/disponibilidad.schema.js";

const router = express.Router();
const medicoController = new MedicoController();

// ── CRUD Médicos ──────────────────────────────────────────────────────────────

router.get("/", (req, res) =>
    medicoController.obtenerTodos(req, res)
);

router.get("/:medicoId", (req, res) =>
    medicoController.obtenerPorId(req, res)
);

router.post("/", (req, res) =>
    medicoController.crear(req, res)
);

router.patch("/:medicoId", (req, res) =>
    medicoController.actualizar(req, res)
);

router.delete("/:medicoId", (req, res) =>
    medicoController.eliminar(req, res)
);

// ── CRUD Disponibilidades ─────────────────────────────────────────────────────

router.get("/:medicoId/disponibilidades", (req, res) =>
  medicoController.obtenerDisponibilidades(req, res)
);

router.get("/:medicoId/disponibilidades/:disponibilidadId", (req, res) =>
  medicoController.obtenerDisponibilidadPorId(req, res)
);

router.post("/:medicoId/disponibilidades",
  validarSchema(disponibilidadSchema),
  (req, res) => medicoController.crearDisponibilidad(req, res)
);

router.patch("/:medicoId/disponibilidades/:disponibilidadId",
  validarSchema(disponibilidadSchema),
  (req, res) => medicoController.editarDisponibilidad(req, res)
);

router.delete("/:medicoId/disponibilidades/:disponibilidadId", (req, res) =>
  medicoController.eliminarDisponibilidad(req, res)
);

// ── Gestión de Servicios ──────────────────────────────────────────────────────

router.post("/:medicoId/especialidades", (req, res) =>
  medicoController.agregarEspecialidad(req, res)
);

router.delete("/:medicoId/especialidades/:especialidadId", (req, res) =>
  medicoController.eliminarEspecialidad(req, res)
);

router.post("/:medicoId/practicas", (req, res) =>
  medicoController.agregarPractica(req, res)
);

router.delete("/:medicoId/practicas/:practicaId", (req, res) =>
  medicoController.eliminarPractica(req, res)
);

router.post("/:medicoId/sedes", (req, res) =>
  medicoController.agregarSede(req, res)
);

router.delete("/:medicoId/sedes/:sedeId", (req, res) =>
  medicoController.eliminarSede(req, res)
);

router.get("/:medicoId/turnos", (req, res) =>
  medicoController.obtenerHistorialTurnos(req, res)
);

export default router;
