import mongoose from 'mongoose';

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
    createdAt: {
        type: Date,
        default: Date.now
    }
});

export default medicoSchema;
