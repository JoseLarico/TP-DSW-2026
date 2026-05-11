import express from "express";
import { MedicoController } from "../controllers/medico.controller.js";

const router = express.Router();
const medicoController = new MedicoController();

router.get("/:medicoId/disponibilidades", (req, res) =>
  medicoController.obtenerDisponibilidades(req, res)
);

router.get("/:medicoId/disponibilidades/:disponibilidadId", (req, res) =>
  medicoController.obtenerDisponibilidadPorId(req, res)
);

router.post("/:medicoId/disponibilidades", (req, res) =>
  medicoController.crearDisponibilidad(req, res) 
);



router.put("/:medicoId/disponibilidades/:disponibilidadId", (req, res) =>
  medicoController.editarDisponibilidad(req, res)
);

router.delete("/:medicoId/disponibilidades/:disponibilidadId", (req, res) =>
  medicoController.eliminarDisponibilidad(req, res)
);

export default router;  