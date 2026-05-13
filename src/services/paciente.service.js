import { PacienteRepository } from '../repositories/paciente.repository.js';
import { UsuarioRepository } from '../repositories/usuario.repository.js';
import { ObraSocialRepository } from '../repositories/obraSocial.repository.js';
import { TurnoRepository } from '../repositories/turno.repository.js';
import { Paciente } from '../models/paciente.model.js';
import { Usuario } from '../models/usuario.model.js';
import { ConflictError, NotFoundError, ValidationError } from '../error/appError.js';

export class PacienteService {
    constructor({
        pacienteRepository = PacienteRepository.instance(),
        usuarioRepository = UsuarioRepository.instance(),
        obraSocialRepository = ObraSocialRepository.instance(),
        turnoRepository = TurnoRepository.instance()
    } = {}) {
        this.PacienteRepository = pacienteRepository;
        this.UsuarioRepository = usuarioRepository;
        this.ObraSocialRepository = obraSocialRepository;
        this.TurnoRepository = turnoRepository;
    }

    static instance() {
        this._instance ||= new PacienteService();
        return this._instance;
    }

    async obtenerTodos() {
        return await this.PacienteRepository.findAll();
    }

    async obtenerPorId(id) {
        return await this.PacienteRepository.findById(id);
    }

    async crear(datos) {
        const { nombreUsuario, password, dni, nombre, obraSocialId, planId } = datos;

        const usuarioExistente = await this.UsuarioRepository.findByNombreUsuario(nombreUsuario);
        if (usuarioExistente) throw new ConflictError('El nombreUsuario ya está en uso');

        const pacienteExistente = await this.PacienteRepository.findByDni(dni);
        if (pacienteExistente) throw new ConflictError('El DNI ya está en uso');

        const obraSocial = await this.ObraSocialRepository.findById(obraSocialId);
        const planValido = obraSocial.planes.some(p => p._id.toString() === planId);
        if (!planValido) throw new ValidationError('El plan no pertenece a la obra social indicada');

        const usuario = await this.UsuarioRepository.save(new Usuario(nombreUsuario, password));
        const paciente = new Paciente(usuario._id, dni, nombre, obraSocialId, planId);
        return await this.PacienteRepository.save(paciente);
    }

    async actualizar(id, datos) {
        const paciente = await this.PacienteRepository.findById(id);

        const { nombre, obraSocial, plan } = datos;
        if (nombre !== undefined) paciente.nombre = nombre;

        if (obraSocial !== undefined || plan !== undefined) {
            const obraSocialId = obraSocial ?? paciente.obraSocial?._id ?? paciente.obraSocial;
            const planId = plan ?? paciente.plan;
            const obraSocialDoc = await this.ObraSocialRepository.findById(obraSocialId);
            const planValido = obraSocialDoc.planes.some(p => p._id.toString() === planId?.toString());
            if (!planValido) throw new ValidationError('El plan no pertenece a la obra social indicada');
            if (obraSocial !== undefined) paciente.obraSocial = obraSocial;
            if (plan !== undefined) paciente.plan = plan;
        }

        return await this.PacienteRepository.save(paciente);
    }

    async eliminar(id) {
        const paciente = await this.PacienteRepository.findById(id);
        const tieneTurnosFuturos = await this.TurnoRepository.existenTurnosFuturosActivos({ paciente: id });
        if (tieneTurnosFuturos) throw new ValidationError('El paciente tiene turnos futuros activos y no puede eliminarse');
        await this.PacienteRepository.deleteById(id);
        if (paciente.usuario?._id) await this.UsuarioRepository.deleteById(paciente.usuario._id);
    }
}
