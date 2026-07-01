import PacienteModel from "../models/mongoose/paciente.model.js"
import { NotFoundError } from '../error/appError.js';

export class PacienteRepository {
    #resolvePlan(paciente) {
        const obj = paciente.toObject ? paciente.toObject() : paciente;
        const planes = obj.obraSocial?.planes;
        if (planes && obj.plan) {
            const planEncontrado = planes.find(p => p._id.toString() === obj.plan.toString());
            if (planEncontrado) obj.plan = planEncontrado;
        }
        if (obj.obraSocial) {
            obj.obraSocial = { _id: obj.obraSocial._id, nombre: obj.obraSocial.nombre };
        }
        return obj;
    }

    async findAll() {
        const pacientes = await PacienteModel.find()
            .populate('usuario', '-password')
            .populate('obraSocial');
        return pacientes.map(p => this.#resolvePlan(p));
    }

    async save(paciente) {
        if (!paciente._id) {
            const nuevoPaciente = new PacienteModel(paciente);
            const saved = await nuevoPaciente.save();
            const populated = await saved.populate([{ path: 'usuario', select: '-password' }, { path: 'obraSocial' }]);
            return this.#resolvePlan(populated);
        } else {
            const updated = await PacienteModel.findByIdAndUpdate(paciente._id, paciente, { returnDocument: 'after' })
                .populate('usuario', '-password')
                .populate('obraSocial');
            return this.#resolvePlan(updated);
        }
    }

    static instance() {
        this._instance ||= new this();
        return this._instance;
    }

    async findById(id) {
        const paciente = await PacienteModel.findById(id)
            .populate('usuario', '-password')
            .populate('obraSocial');
        if (!paciente) throw new NotFoundError('Paciente no encontrado');
        return this.#resolvePlan(paciente);
    }

    async findByDni(dni) {
        return await PacienteModel.findOne({ dni });
    }

    async findByUsuarioId(usuarioId) {
        const paciente = await PacienteModel.findOne({ usuario: usuarioId })
            .populate('usuario', '-password')
            .populate('obraSocial');
        if (!paciente) return null;
        return this.#resolvePlan(paciente);
    }

    async deleteById(id) {
        return await PacienteModel.findByIdAndDelete(id);
    }

    async existsByObraSocial(obraSocialId) {
        return await PacienteModel.exists({ obraSocial: obraSocialId });
    }
}
