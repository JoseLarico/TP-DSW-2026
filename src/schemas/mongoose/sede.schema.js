import mongoose from 'mongoose';

const sedeSchema = new mongoose.Schema({
    nombre: { type: String, required: true, unique: true },
    direccion: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

export default sedeSchema;
