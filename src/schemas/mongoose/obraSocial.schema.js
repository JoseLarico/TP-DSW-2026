import mongoose from 'mongoose';
import { nivelCobertura } from '../../enums/nivelCobertura.enum.js';

const obraSocialSchema = new mongoose.Schema({
    nombre: { type: String, required: true, unique: true },
    planes: [{
        nombre: { type: String, required: true },
        coberturasEspecialidad: [{
            especialidad: { type: mongoose.Schema.Types.ObjectId, ref: 'Especialidad' },
            nivel: { type: String, enum: Object.values(nivelCobertura) },
            porcentaje: { type: Number, min: 0, max: 100, default: 0 }
        }],
        coberturasPractica: [{
            practica: { type: mongoose.Schema.Types.ObjectId, ref: 'Practica' },
            nivel: { type: String, enum: Object.values(nivelCobertura) },
            porcentaje: { type: Number, min: 0, max: 100, default: 0 }
        }]
    }],
    createdAt: { type: Date, default: Date.now }
});

export default obraSocialSchema;
