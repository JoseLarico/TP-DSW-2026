import mongoose from 'mongoose';

const pacienteSchema = new mongoose.Schema ({
    usuario: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Usuario',
        required: true
    },
    dni: {
        type: String,
        required: true,
        unique: true
    },
    nombre: {
        type: String,
        required: true
    },
    obraSocial: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ObraSocial',
        required: true
    },
    plan: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

export default pacienteSchema;
