import { PracticaRepository } from '../repositories/practica.repository.js';

export class PracticaService {
    constructor({
        practicaRepository = PracticaRepository.instance()
    } = {}) {
        this.PracticaRepository = practicaRepository;
    }

    static instance() {
        this._instance ||= new PracticaService();
        return this._instance;
    }

    async obtenerTodos() {
        return await this.PracticaRepository.findAll();
    }

    async obtenerPorId(id) {
        return await this.PracticaRepository.findById(id);
    }

    async crear(datos) {
        const { codigo, nombre, duracionTurnoEnMins, costo } = datos;

        const existente = await this.PracticaRepository.findByCodigo(codigo);
        if (existente) throw new Error('Ya existe una práctica con ese código');

        return await this.PracticaRepository.save({ codigo, nombre, duracionTurnoEnMins, costo });
    }

    async actualizar(id, datos) {
        await this.PracticaRepository.findById(id);
        return await this.PracticaRepository.update(id, datos);
    }

    async eliminar(id) {
        await this.PracticaRepository.findById(id);
        await this.PracticaRepository.deleteById(id);
    }
}
