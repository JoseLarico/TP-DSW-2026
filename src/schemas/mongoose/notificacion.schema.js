import mongoose from 'mongoose';
import { boolean } from 'zod';

const notificacionSchema = new mongoose.Schema ({
    destinatario: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Usuario',
        required: true
    },
    remitente: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Usuario',
        required: true
    },
    mensaje: {
        type: String,
        required: true
    },
    fechaHoraCreacion: {
        type: Date,
        required: true
    },
    fechaHoraLeida: {
        type: Date
    },
    leida: {
        type: Boolean,
        default: false
    }
});

export default notificacionSchema;