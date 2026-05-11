import mongoose from 'mongoose';
import pacienteSchema from '../../schemas/mongoose/paciente.schema.js';

const PacienteModel = mongoose.model('Paciente', pacienteSchema);

export default PacienteModel;