import { EspecialidadRepository } from '../repositories/especialidad.repository.js';

export class EspecialidadService {
    constructor({
        especialidadRepository = EspecialidadRepository.instance()
    } = {}) {
        this.EspecialidadRepository = especialidadRepository;
    }

    static instance() {
        this._instance ||= new EspecialidadService();
        return this._instance;
    }

    async obtenerTodos() {
        return await this.EspecialidadRepository.findAll();
    }

    async obtenerPorId(id) {
        return await this.EspecialidadRepository.findById(id);
    }

    async crear(datos) {
        const { nombre, duracionTurnoEnMins, costoConsulta } = datos;

        const existente = await this.EspecialidadRepository.findByNombre(nombre);
        if (existente) throw new Error('Ya existe una especialidad con ese nombre');

        return await this.EspecialidadRepository.save({ nombre, duracionTurnoEnMins, costoConsulta });
    }

    async actualizar(id, datos) {
        await this.EspecialidadRepository.findById(id);
        return await this.EspecialidadRepository.update(id, datos);
    }

    async eliminar(id) {
        await this.EspecialidadRepository.findById(id);
        await this.EspecialidadRepository.deleteById(id);
    }
}
