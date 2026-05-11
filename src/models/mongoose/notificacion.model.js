import mongoose from 'mongoose';
import notificacionSchema from '../../schemas/mongoose/notificacion.schema.js';

const NotificacionModel = mongoose.model('Notificacion', notificacionSchema);

export default NotificacionModel;