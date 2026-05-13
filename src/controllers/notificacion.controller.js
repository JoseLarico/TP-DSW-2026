import { NotificacionService } from "../services/notificacion.service.js";

export class NotificacionController {
    constructor ({notificacionService = NotificacionService.instance()} = {}) {
        this.notificacionService = notificacionService;
    }

    async obtenerSinLeer(req, res, next) {
        const {usuarioId} = req.params;
        try {
            const notificaciones = await this.notificacionService.obtenerSinLeer(usuarioId);
            res.status(200).json({notificaciones});
        } catch(error) {
            next(error);
        }
    }

    async obtenerLeidas(req, res, next) {
        const {usuarioId} = req.params;
        try {
            const notificaciones = await this.notificacionService.obtenerLeidas(usuarioId);
            res.status(200).json({notificaciones});
        } catch(error) {
            next(error);
        }
    }

    async marcarComoLeida(req, res, next) {
        const {notificacionId} = req.params;
        try {
            const notificacion = await this.notificacionService.marcarComoLeida(notificacionId);
            res.status(200).json({notificacion});
        } catch(error) {
            next(error);
        }
    }
}
