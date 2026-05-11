import express from "express";
import { TurnoController } from "../controllers/turno.controller.js";

const router = express.Router();
const turnoController = new TurnoController();

router.post("/", (req, res) => turnoController.altaTurno(req, res));
router.delete("/:id", (req, res) => turnoController.bajaTurno(req, res));

export default router;