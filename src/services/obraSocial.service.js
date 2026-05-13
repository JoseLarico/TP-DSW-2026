import { ObraSocialRepository } from '../repositories/obraSocial.repository.js';
import { EspecialidadRepository } from '../repositories/especialidad.repository.js';
import { PracticaRepository } from '../repositories/practica.repository.js';
import { PacienteRepository } from '../repositories/paciente.repository.js';
import { ConflictError, ValidationError } from '../error/appError.js';

export class ObraSocialService {
    constructor({
        obraSocialRepository = ObraSocialRepository.instance(),
        especialidadRepository = EspecialidadRepository.instance(),
        practicaRepository = PracticaRepository.instance(),
        pacienteRepository = PacienteRepository.instance()
    } = {}) {
        this.ObraSocialRepository = obraSocialRepository;
        this.EspecialidadRepository = especialidadRepository;
        this.PracticaRepository = practicaRepository;
        this.PacienteRepository = pacienteRepository;
    }

    static instance() {
        this._instance ||= new ObraSocialService();
        return this._instance;
    }

    async #validarPlanes(planes = []) {
        for (const plan of planes) {
            for (const c of plan.coberturasEspecialidad ?? []) {
                await this.EspecialidadRepository.findById(c.especialidad);
            }
            for (const c of plan.coberturasPractica ?? []) {
                await this.PracticaRepository.findById(c.practica);
            }
        }
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
        if (existente) throw new ConflictError('Ya existe una obra social con ese nombre');

        await this.#validarPlanes(planes);
        return await this.ObraSocialRepository.save({ nombre, planes });
    }

    async actualizar(id, datos) {
        await this.ObraSocialRepository.findById(id);
        if (datos.planes) await this.#validarPlanes(datos.planes);
        return await this.ObraSocialRepository.update(id, datos);
    }

    async eliminar(id) {
        await this.ObraSocialRepository.findById(id);
        const tienePacientes = await this.PacienteRepository.existsByObraSocial(id);
        if (tienePacientes) throw new ValidationError('La obra social tiene pacientes asociados y no puede eliminarse');
        await this.ObraSocialRepository.deleteById(id);
    }
}
