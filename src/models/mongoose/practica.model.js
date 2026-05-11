import mongoose from 'mongoose';
import practicaSchema from '../../schemas/mongoose/practica.schema.js';

const PracticaModel = mongoose.model('Practica', practicaSchema);

export default PracticaModel;
