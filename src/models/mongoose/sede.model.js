import mongoose from 'mongoose';
import sedeSchema from '../../schemas/mongoose/sede.schema.js';

const SedeModel = mongoose.model('Sede', sedeSchema);

export default SedeModel;
