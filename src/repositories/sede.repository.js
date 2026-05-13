import SedeModel from '../models/mongoose/sede.model.js';
import { NotFoundError } from '../error/appError.js';

export class SedeRepository {

    static instance() {
        this._instance ||= new this();
        return this._instance;
    }

    async findAll() {
        return await SedeModel.find();
    }

    async findById(id) {
        const sede = await SedeModel.findById(id);
        if (!sede) throw new NotFoundError('Sede no encontrada');
        return sede;
    }

    async findByNombre(nombre) {
        return await SedeModel.findOne({ nombre });
    }

    async save(sede) {
        const nueva = new SedeModel(sede);
        return await nueva.save();
    }

    async update(id, datos) {
        return await SedeModel.findByIdAndUpdate(id, datos, { returnDocument: 'after' });
    }

    async deleteById(id) {
        return await SedeModel.findByIdAndDelete(id);
    }
}
