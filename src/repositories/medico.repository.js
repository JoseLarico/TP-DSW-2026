import MedicoModel from "../models/mongoose/medico.model.js";
import { NotFoundError } from '../error/appError.js';

export class MedicoRepository {
   
    async findAll() {
        return await MedicoModel.find()
            .populate('usuario', '-password')
            .populate('especialidades')
            .populate('practicas')
            .populate('sedes');
    }

    async save(medico) {
        if (!medico._id) {
            const nuevoMedico = new MedicoModel(medico);
            const saved = await nuevoMedico.save();
            return await saved.populate([
                { path: 'usuario', select: '-password' },
                { path: 'especialidades' },
                { path: 'practicas' },
                { path: 'sedes' }
            ]);
        } else {
            return await MedicoModel.findByIdAndUpdate(medico._id, medico, { returnDocument: 'after' })
                .populate('usuario', '-password')
                .populate('especialidades')
                .populate('practicas')
                .populate('sedes');
        }
    }

    static instance() {
        this._instance ||= new this();
        return this._instance;
    }

    async findById(id) {
        const medico = await MedicoModel.findById(id)
            .populate('usuario', '-password')
            .populate('especialidades')
            .populate('practicas')
            .populate('sedes');
        if (!medico) throw new NotFoundError('Médico no encontrado');
        return medico;
    }

    async findByFiltros({ medicoId, especialidadId, practicaId, sedeId } = {}) {
        const query = {};
        if (medicoId) query._id = medicoId;
        if (especialidadId) query.especialidades = especialidadId;
        if (practicaId) query.practicas = practicaId;
        if (sedeId) query.sedes = sedeId;
        return await MedicoModel.find(query)
            .populate('especialidades')
            .populate('practicas')
            .populate('sedes');
    }

    async findByMatricula(matricula) {
        return await MedicoModel.findOne({ matricula });
    }

    async deleteById(id) {
        return await MedicoModel.findByIdAndDelete(id);
    }

    async existsByEspecialidad(especialidadId) {
        return await MedicoModel.exists({ especialidades: especialidadId });
    }

    async existsByPractica(practicaId) {
        return await MedicoModel.exists({ practicas: practicaId });
    }

    async existsBySede(sedeId) {
        return await MedicoModel.exists({ sedes: sedeId });
    }

}
