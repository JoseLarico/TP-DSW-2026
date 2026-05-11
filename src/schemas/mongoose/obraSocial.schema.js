import mongoose from 'mongoose';
import { nivelCobertura } from '../../enums/nivelCobertura.enum.js';

const obraSocialSchema = new mongoose.Schema({
    nombre: { type: String, required: true, unique: true },
    planes: [{
        nombre: { type: String, required: true },
        coberturasEspecialidad: [{
            especialidad: { type: mongoose.Schema.Types.ObjectId, ref: 'Especialidad' },
            nivel: { type: String, enum: Object.values(nivelCobertura) }
        }],
        coberturasPractica: [{
            practica: { type: mongoose.Schema.Types.ObjectId, ref: 'Practica' },
            nivel: { type: String, enum: Object.values(nivelCobertura) }
        }]
    }],
    createdAt: { type: Date, default: Date.now }
});

export default obraSocialSchema;
