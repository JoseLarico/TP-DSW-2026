import mongoose from 'mongoose';
import medicoSchema from '../../schemas/mongoose/medico.schema.js';

const MedicoModel = mongoose.model('Medico', medicoSchema);

export default MedicoModel;