import mongoose from 'mongoose';

const especialidadSchema = new mongoose.Schema({
    nombre: { type: String, required: true, unique: true },
    duracionTurnoEnMins: { type: Number },
    costoConsulta: { type: Number },
    createdAt: { type: Date, default: Date.now }
});

export default especialidadSchema;
