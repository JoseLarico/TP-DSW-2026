import EspecialidadModel from '../models/mongoose/especialidad.model.js';
import { NotFoundError } from '../error/appError.js';

export class EspecialidadRepository {

    static instance() {
        this._instance ||= new this();
        return this._instance;
    }

    async findAll() {
        return await EspecialidadModel.find();
    }

    async findById(id) {
        const especialidad = await EspecialidadModel.findById(id);
        if (!especialidad) throw new NotFoundError('Especialidad no encontrada');
        return especialidad;
    }

    async findByNombre(nombre) {
        return await EspecialidadModel.findOne({ nombre });
    }

    async save(especialidad) {
        const nueva = new EspecialidadModel(especialidad);
        return await nueva.save();
    }

    async update(id, datos) {
        return await EspecialidadModel.findByIdAndUpdate(id, datos, { returnDocument: 'after' });
    }

    async deleteById(id) {
        return await EspecialidadModel.findByIdAndDelete(id);
    }
}
