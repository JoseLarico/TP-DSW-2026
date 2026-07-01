import express from "express";
import {NotificacionController} from "../controllers/notificacion.controller.js"
import { verifyToken } from "../middlewares/verifyToken.middleware.js";

const router = express.Router();
const notificacionController = new NotificacionController();

/**
 * @openapi
 * /notificaciones/sin-leer/{usuarioId}:
 *   get:
 *     summary: Obtener notificaciones sin leer de un usuario
 *     tags: [Notificaciones]
 *     parameters:
 *       - in: path
 *         name: usuarioId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lista de notificaciones sin leer
 *       400:
 *         description: usuarioId requerido
 */
router.get("/sin-leer/:usuarioId", verifyToken, (req, res, next) =>
    notificacionController.obtenerSinLeer(req, res, next)
);

/**
 * @openapi
 * /notificaciones/leidas/{usuarioId}:
 *   get:
 *     summary: Obtener notificaciones leídas de un usuario
 *     tags: [Notificaciones]
 *     parameters:
 *       - in: path
 *         name: usuarioId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lista de notificaciones leídas
 *       400:
 *         description: usuarioId requerido
 */
router.get("/leidas/:usuarioId", verifyToken, (req, res, next) =>
    notificacionController.obtenerLeidas(req, res, next)
);

/**
 * @openapi
 * /notificaciones/{notificacionId}/marcar-leida:
 *   patch:
 *     summary: Marcar una notificación como leída
 *     tags: [Notificaciones]
 *     parameters:
 *       - in: path
 *         name: notificacionId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Notificación marcada como leída
 *       404:
 *         description: Notificación no encontrada
 */
router.patch("/:notificacionId/marcar-leida", verifyToken, (req, res, next) =>
    notificacionController.marcarComoLeida(req, res, next)
);

export default router;
