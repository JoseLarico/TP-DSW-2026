import mongoose from 'mongoose';
import { DiaSemana } from '../../enums/diaSemana.enum.js';

const medicoSchema = new mongoose.Schema ({
    usuario: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Usuario',
        required: true
    },
    matricula: {
        type: String,
        required: true,
        unique: true
    },
    nombre: {
        type: String,
        required: true
    },
    especialidades: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Especialidad' }],
    practicas: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Practica' }],
    sedes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Sede' }],
    disponibilidades: [{
        diaSemana: {
            type: String,
            enum: Object.values(DiaSemana)
        },
        horaInicio: String,
        horaFin: String
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

export default medicoSchema;
