import NotificacionModel from "../models/mongoose/notificacion.model.js"

export class NotificacionRepository {

    async findUnreadByUser(usuarioId) { // trae notificacion sin leer de un usuario
        return await NotificacionModel.find({
            destinatario: usuarioId,
            leida: false
        });
    }

    async findReadByUser(usuarioId) { // trae notificaciones leidas de un usuario
        return await NotificacionModel.find({
            destinatario: usuarioId,
            leida: true
        });
    }

    async markAsRead(notificacionId) { // marca una notificacion como leida
        return await NotificacionModel.findByIdAndUpdate(
            notificacionId,
            { leida: true, fechaHoraLeida: new Date() },
            { returnDocument: 'after' }
        );
    }

    async create(notificacion) { // crea una nueva notificacion
        const nuevaNotificacion = new NotificacionModel(notificacion);
        return await nuevaNotificacion.save();
    }

    static instance() {
        this._instance ||= new this();
        return this._instance;
    }
}