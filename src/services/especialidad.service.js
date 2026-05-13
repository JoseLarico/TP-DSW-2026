import { EspecialidadRepository } from '../repositories/especialidad.repository.js';
import { TurnoRepository } from '../repositories/turno.repository.js';
import { MedicoRepository } from '../repositories/medico.repository.js';
import { ConflictError, ValidationError } from '../error/appError.js';

export class EspecialidadService {
    constructor({
        especialidadRepository = EspecialidadRepository.instance(),
        turnoRepository = TurnoRepository.instance(),
        medicoRepository = MedicoRepository.instance()
    } = {}) {
        this.EspecialidadRepository = especialidadRepository;
        this.turnoRepository = turnoRepository;
        this.medicoRepository = medicoRepository;
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
        if (existente) throw new ConflictError('Ya existe una especialidad con ese nombre');

        return await this.EspecialidadRepository.save({ nombre, duracionTurnoEnMins, costoConsulta });
    }

    async actualizar(id, datos) {
        await this.EspecialidadRepository.findById(id);
        return await this.EspecialidadRepository.update(id, datos);
    }

    async eliminar(id) {
        await this.EspecialidadRepository.findById(id);
        const tieneTurnosFuturos = await this.turnoRepository.existenTurnosFuturosActivos({ especialidad: id });
        if (tieneTurnosFuturos) throw new ValidationError('No se puede eliminar la especialidad porque tiene turnos futuros asociados');
        const tieneMedicos = await this.medicoRepository.existsByEspecialidad(id);
        if (tieneMedicos) throw new ValidationError('No se puede eliminar la especialidad porque hay médicos que la tienen asignada');
        await this.EspecialidadRepository.deleteById(id);
    }
}
