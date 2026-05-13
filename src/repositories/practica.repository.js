import PracticaModel from '../models/mongoose/practica.model.js';
import { NotFoundError } from '../error/appError.js';

export class PracticaRepository {

    static instance() {
        this._instance ||= new this();
        return this._instance;
    }

    async findAll() {
        return await PracticaModel.find();
    }

    async findById(id) {
        const practica = await PracticaModel.findById(id);
        if (!practica) throw new NotFoundError('Práctica no encontrada');
        return practica;
    }

    async findByCodigo(codigo) {
        return await PracticaModel.findOne({ codigo });
    }

    async save(practica) {
        const nueva = new PracticaModel(practica);
        return await nueva.save();
    }

    async update(id, datos) {
        return await PracticaModel.findByIdAndUpdate(id, datos, { returnDocument: 'after' });
    }

    async deleteById(id) {
        return await PracticaModel.findByIdAndDelete(id);
    }
}
