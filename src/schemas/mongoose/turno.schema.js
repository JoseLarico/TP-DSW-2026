import mongoose from 'mongoose';
import { EstadoTurno } from "../../enums/estadoTurno.enum.js";
import { EstadoSolicitudCambio } from "../../enums/estadoSolicitudCambio.enum.js";

const turnoSchema = new mongoose.Schema({
    medico: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Medico',
        required: true
    },
    paciente: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Paciente'
    },
    fechaHora: {
        type: Date,
        required: true
    },
    sede: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Sede'
    },
    especialidad: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Especialidad'
    },
    practica: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Practica'
    },
    estado: {
        type: String,
        enum: Object.values(EstadoTurno),
        required: true
    },
    historialEstados: [{
        fechaHoraIngreso: Date,
        estado: String,
        turnoId: mongoose.Schema.Types.ObjectId,
        usuario: mongoose.Schema.Types.ObjectId,
        motivo: String
    }],
    costo: {
        type: Number,
        required: true
    },
    solicitudCambioFecha: {
        nuevaFechaHora: Date,
        solicitante: { type: String, enum: ['PACIENTE', 'MEDICO'] },
        estado: { type: String, enum: Object.values(EstadoSolicitudCambio) }
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

export default turnoSchema;