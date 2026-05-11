import ObraSocialModel from '../models/mongoose/obraSocial.model.js';

export class ObraSocialRepository {

    static instance() {
        this._instance ||= new this();
        return this._instance;
    }

    async findAll() {
        return await ObraSocialModel.find()
            .populate('planes.coberturasEspecialidad.especialidad')
            .populate('planes.coberturasPractica.practica');
    }

    async findById(id) {
        const obraSocial = await ObraSocialModel.findById(id)
            .populate('planes.coberturasEspecialidad.especialidad')
            .populate('planes.coberturasPractica.practica');
        if (!obraSocial) throw new Error('Obra social no encontrada');
        return obraSocial;
    }

    async findByNombre(nombre) {
        return await ObraSocialModel.findOne({ nombre });
    }

    async save(obraSocial) {
        const nueva = new ObraSocialModel(obraSocial);
        return await nueva.save();
    }

    async update(id, datos) {
        return await ObraSocialModel.findByIdAndUpdate(id, datos, { returnDocument: 'after' })
            .populate('planes.coberturasEspecialidad.especialidad')
            .populate('planes.coberturasPractica.practica');
    }

    async deleteById(id) {
        return await ObraSocialModel.findByIdAndDelete(id);
    }
}
