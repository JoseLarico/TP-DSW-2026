import MedicoModel from "../models/mongoose/medico.model.js";

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
        if (!medico) throw new Error('Médico no encontrado');
        return medico;
    }

    async findByMatricula(matricula) {
        return await MedicoModel.findOne({ matricula });
    }

    async deleteById(id) {
        return await MedicoModel.findByIdAndDelete(id);
    }

}
