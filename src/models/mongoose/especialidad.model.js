import mongoose from 'mongoose';
import especialidadSchema from '../../schemas/mongoose/especialidad.schema.js';

const EspecialidadModel = mongoose.model('Especialidad', especialidadSchema);

export default EspecialidadModel;
