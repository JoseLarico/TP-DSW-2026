import { NotificacionService } from "../services/notificacion.service.js";

export class NotificacionController {
    constructor ({notificacionService = NotificacionService.instance()} = {}) {
        this.notificacionService = notificacionService;
    }

    async obtenerSinLeer(req, res) {
        const {usuarioId} = req.params;
        try {
            const notificaciones = await this.notificacionService.obtenerSinLeer(usuarioId);
            res.status(200).json({notificaciones});
        } catch(error) {
            res.status(400).json({error: error.message});
        }
    }
    async obtenerLeidas(req, res) {
        const {usuarioId} = req.params;
        try {
            const notificaciones = await this.notificacionService.obtenerLeidas(usuarioId);
            res.status(200).json({notificaciones});
        } catch(error) {
            res.status(400).json({error: error.message});
        }
    }

    async marcarComoLeida(req, res) {
        const {notificacionId} = req.params;
        try {
            const notificacion = await this.notificacionService.marcarComoLeida(notificacionId);
            res.status(200).json({notificacion});
        } catch(error) {
            res.status(400).json({error: error.message});
        }
    }
}