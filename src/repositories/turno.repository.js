/* 
El repository es la capa de acceso a datos que interactúa con mongo db a traves de mongoose.
Métodos principales:
- create(turno) → crea un nuevo turno en la BD
- findById(id) → busca un turno por su _id
- save(turno) → actualiza un turno existente
- findByMedicoAndFechaHora() → búsqueda específica
*/ 

import TurnoModel from "../models/mongoose/turno.model.js";
import { EstadoTurno } from "../enums/estadoTurno.enum.js";

const POPULATE_TURNO = [
    { path: 'medico', select: 'nombre matricula' },
    { path: 'paciente', select: 'nombre dni' },
    { path: 'sede', select: 'nombre direccion'},
    { path: 'especialidad', select: 'nombre' },
    { path: 'practica', select: 'nombre' },
];

export class TurnoRepository {

    async create(turno) {
        const nuevoTurno = new TurnoModel(turno);
        const saved = await nuevoTurno.save();
        return await saved.populate(POPULATE_TURNO);
    }

    async save(turno) {
        return await TurnoModel.findByIdAndUpdate(turno._id, turno, { returnDocument: 'after' })
            .populate(POPULATE_TURNO);
    }

    async findByMedicoAndFechaHora(medicoId, fechaHora) {
        return await TurnoModel.findOne({
            medico: medicoId,
            fechaHora: new Date(fechaHora),
            estado: { $ne: EstadoTurno.CANCELADO }
        });
    }

    async findByPaciente(pacienteId, medicoId = null) {
        const filtro = { paciente: pacienteId };
        if (medicoId) filtro.medico = medicoId;
        return await TurnoModel.find(filtro).populate(POPULATE_TURNO).sort({ fechaHora: -1 });
    }

    async findByMedico(medicoId) {
        return await TurnoModel.find({ medico: medicoId }).populate(POPULATE_TURNO).sort({ fechaHora: -1 });
    }

    static instance() {
        this._instance ||= new this();
        return this._instance;
    }

    async findById(id) {
        const turno = await TurnoModel.findById(id);
        if (!turno) throw new Error('Turno no encontrado');
        return turno;
    }
}

