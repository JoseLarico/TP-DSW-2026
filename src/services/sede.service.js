import { SedeRepository } from '../repositories/sede.repository.js';
import { TurnoRepository } from '../repositories/turno.repository.js';
import { MedicoRepository } from '../repositories/medico.repository.js';
import { ConflictError, ValidationError } from '../error/appError.js';

export class SedeService {
    constructor({
        sedeRepository = SedeRepository.instance(),
        turnoRepository = TurnoRepository.instance(),
        medicoRepository = MedicoRepository.instance()
    } = {}) {
        this.SedeRepository = sedeRepository;
        this.turnoRepository = turnoRepository;
        this.medicoRepository = medicoRepository;
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
        if (existente) throw new ConflictError('Ya existe una sede con ese nombre');

        return await this.SedeRepository.save({ nombre, direccion });
    }

    async actualizar(id, datos) {
        await this.SedeRepository.findById(id);
        return await this.SedeRepository.update(id, datos);
    }

    async eliminar(id) {
        await this.SedeRepository.findById(id);
        const tieneTurnosFuturos = await this.turnoRepository.existenTurnosFuturosActivos({ sede: id });
        if (tieneTurnosFuturos) throw new ValidationError('No se puede eliminar la sede porque tiene turnos futuros asociados');
        const tieneMedicos = await this.medicoRepository.existsBySede(id);
        if (tieneMedicos) throw new ValidationError('No se puede eliminar la sede porque hay médicos que atienden en ella');
        await this.SedeRepository.deleteById(id);
    }
}
