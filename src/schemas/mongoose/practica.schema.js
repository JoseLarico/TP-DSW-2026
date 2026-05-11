import mongoose from 'mongoose';

const practicaSchema = new mongoose.Schema({
    codigo: { type: String, required: true, unique: true },
    nombre: { type: String, required: true },
    duracionTurnoEnMins: { type: Number },
    costo: { type: Number },
    createdAt: { type: Date, default: Date.now }
});

export default practicaSchema;
