import mongoose from 'mongoose';
import turnoSchema from '../../schemas/mongoose/turno.schema.js';

const TurnoModel = mongoose.model('Turno', turnoSchema);

export default TurnoModel;