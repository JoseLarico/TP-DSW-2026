import express from "express";
import {NotificacionController} from "../controllers/notificacion.controller.js"

const router = express.Router();
const notificacionController = new NotificacionController();

router.get("/sin-leer/:usuarioId", (req, res) => 
    notificacionController.obtenerSinLeer(req, res)
);

router.get("/leidas/:usuarioId", (req, res) =>
    notificacionController.obtenerLeidas(req, res)
);

router.patch("/:notificacionId/marcar-leida", (req, res) =>
    notificacionController.marcarComoLeida(req, res)
);

export default router;