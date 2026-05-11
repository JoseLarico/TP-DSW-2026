import { ObraSocialRepository } from '../repositories/obraSocial.repository.js';

export class ObraSocialService {
    constructor({
        obraSocialRepository = ObraSocialRepository.instance()
    } = {}) {
        this.ObraSocialRepository = obraSocialRepository;
    }

    static instance() {
        this._instance ||= new ObraSocialService();
        return this._instance;
    }

    async obtenerTodos() {
        return await this.ObraSocialRepository.findAll();
    }

    async obtenerPorId(id) {
        return await this.ObraSocialRepository.findById(id);
    }

    async crear(datos) {
        const { nombre, planes = [] } = datos;

        const existente = await this.ObraSocialRepository.findByNombre(nombre);
        if (existente) throw new Error('Ya existe una obra social con ese nombre');

        return await this.ObraSocialRepository.save({ nombre, planes });
    }

    async actualizar(id, datos) {
        await this.ObraSocialRepository.findById(id);
        return await this.ObraSocialRepository.update(id, datos);
    }

    async eliminar(id) {
        await this.ObraSocialRepository.findById(id);
        await this.ObraSocialRepository.deleteById(id);
    }
}
