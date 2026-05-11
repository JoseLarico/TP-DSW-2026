import { SedeRepository } from '../repositories/sede.repository.js';

export class SedeService {
    constructor({
        sedeRepository = SedeRepository.instance()
    } = {}) {
        this.SedeRepository = sedeRepository;
    }

    static instance() {
        this._instance ||= new SedeService();
        return this._instance;
    }

    async obtenerTodos() {
        return await this.SedeRepository.findAll();
    }

    async obtenerPorId(id) {
        return await this.SedeRepository.findById(id);
    }

    async crear(datos) {
        const { nombre, direccion } = datos;

        const existente = await this.SedeRepository.findByNombre(nombre);
        if (existente) throw new Error('Ya existe una sede con ese nombre');

        return await this.SedeRepository.save({ nombre, direccion });
    }

    async actualizar(id, datos) {
        await this.SedeRepository.findById(id);
        return await this.SedeRepository.update(id, datos);
    }

    async eliminar(id) {
        await this.SedeRepository.findById(id);
        await this.SedeRepository.deleteById(id);
    }
}
