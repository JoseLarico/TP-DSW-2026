import mongoose from 'mongoose';
import obraSocialSchema from '../../schemas/mongoose/obraSocial.schema.js';

const ObraSocialModel = mongoose.model('ObraSocial', obraSocialSchema);

export default ObraSocialModel;
