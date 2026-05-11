import {NotificacionRepository} from "../repositories/notificacion.repository.js"

// El service es la capa de lógica de negocio. Recibe pedidos del controller,
// hace validaciones necesarias y coordina operaciones con el repository

export class NotificacionService {
    constructor({notificacionRepository = NotificacionRepository.instance()} = {}){
        this.notificacionRepository = notificacionRepository;
    }

    static instance() {
        this._instance ||= new NotificacionService();
        return this._instance;
    }

    async obtenerSinLeer(usuarioId) { // obtiene notificaciones sin leer de un usuario
        if(!usuarioId) throw new Error("usuarioId es requerido");
        return await this.notificacionRepository.findUnreadByUser(usuarioId);
    }

    async obtenerLeidas(usuarioId) { // obtiene notificaciones leidas de un usuario
        if(!usuarioId) throw new Error("usuarioId es requerido");
        return await this.notificacionRepository.findReadByUser(usuarioId);
    }

    async marcarComoLeida(notificacionId) { // marca una notificacion como leida
        if(!notificacionId) throw new Error("notificacionId es requerido");
        return await this.notificacionRepository.markAsRead(notificacionId);
    }
}