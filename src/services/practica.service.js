import { PracticaRepository } from '../repositories/practica.repository.js';
import { TurnoRepository } from '../repositories/turno.repository.js';
import { MedicoRepository } from '../repositories/medico.repository.js';
import { ConflictError, ValidationError } from '../error/appError.js';

export class PracticaService {
    constructor({
        practicaRepository = PracticaRepository.instance(),
        turnoRepository = TurnoRepository.instance(),
        medicoRepository = MedicoRepository.instance()
    } = {}) {
        this.PracticaRepository = practicaRepository;
        this.turnoRepository = turnoRepository;
        this.medicoRepository = medicoRepository;
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
        if (existente) throw new ConflictError('Ya existe una práctica con ese código');

        return await this.PracticaRepository.save({ codigo, nombre, duracionTurnoEnMins, costo });
    }

    async actualizar(id, datos) {
        await this.PracticaRepository.findById(id);
        return await this.PracticaRepository.update(id, datos);
    }

    async eliminar(id) {
        await this.PracticaRepository.findById(id);
        const tieneTurnosFuturos = await this.turnoRepository.existenTurnosFuturosActivos({ practica: id });
        if (tieneTurnosFuturos) throw new ValidationError('No se puede eliminar la práctica porque tiene turnos futuros asociados');
        const tieneMedicos = await this.medicoRepository.existsByPractica(id);
        if (tieneMedicos) throw new ValidationError('No se puede eliminar la práctica porque hay médicos que la tienen asignada');
        await this.PracticaRepository.deleteById(id);
    }
}
