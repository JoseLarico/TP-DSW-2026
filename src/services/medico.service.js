import { MedicoRepository } from '../repositories/medico.repository.js';
import { UsuarioRepository } from '../repositories/usuario.repository.js';
import { EspecialidadRepository } from '../repositories/especialidad.repository.js';
import { PracticaRepository } from '../repositories/practica.repository.js';
import { SedeRepository } from '../repositories/sede.repository.js';
import { TurnoRepository } from '../repositories/turno.repository.js';
import { Agenda } from './agenda.service.js';
import { Medico } from '../models/medico.model.js';
import { Usuario } from '../models/usuario.model.js';
import { NotFoundError, ConflictError, ValidationError } from '../error/appError.js';

export class MedicoService {
    constructor({
        medicoRepository = MedicoRepository.instance(),
        usuarioRepository = UsuarioRepository.instance(),
        especialidadRepository = EspecialidadRepository.instance(),
        practicaRepository = PracticaRepository.instance(),
        sedeRepository = SedeRepository.instance(),
        turnoRepository = TurnoRepository.instance(),
        agenda = Agenda.instance()
    } = {}) {
        this.MedicoRepository = medicoRepository;
        this.UsuarioRepository = usuarioRepository;
        this.EspecialidadRepository = especialidadRepository;
        this.PracticaRepository = practicaRepository;
        this.SedeRepository = sedeRepository;
        this.turnoRepository = turnoRepository;
        this.agenda = agenda;
    }

    static instance() {
        this._instance ||= new MedicoService();
        return this._instance;
    }

    // ── CRUD Médicos ──────────────────────────────────────────────────────────

    async obtenerTodos() {
        return await this.MedicoRepository.findAll();
    }

    async obtenerPorId(id) {
        return await this.MedicoRepository.findById(id);
    }

    async crear(datos) {
        const {
            nombreUsuario,
            password,
            matricula,
            nombre,
            especialidades = [],
            practicas = [],
            sedes = []
        } = datos;

        const usuarioExistente = await this.UsuarioRepository.findByNombreUsuario(nombreUsuario);
        if (usuarioExistente) throw new ConflictError('El nombreUsuario ya está en uso');

        const medicoExistente = await this.MedicoRepository.findByMatricula(matricula);
        if (medicoExistente) throw new ConflictError('La matrícula ya está en uso');

        const usuario = await this.UsuarioRepository.save(new Usuario(nombreUsuario, password));
        const medico = new Medico(usuario._id, matricula, nombre, especialidades, practicas, sedes);
        return await this.MedicoRepository.save(medico);
    }

    async actualizar(id, datos) {
        const medico = await this.MedicoRepository.findById(id);

        const { usuario, matricula, nombre, especialidades, practicas, sedes } = datos;
        if (usuario !== undefined) medico.usuario = usuario;
        if (matricula !== undefined) medico.matricula = matricula;
        if (nombre !== undefined) medico.nombre = nombre;
        if (especialidades !== undefined) medico.especialidades = especialidades;
        if (practicas !== undefined) medico.practicas = practicas;
        if (sedes !== undefined) medico.sedes = sedes;

        return await this.MedicoRepository.save(medico);
    }

    async eliminar(id) {
        const medico = await this.MedicoRepository.findById(id);
        const tieneTurnosFuturos = await this.turnoRepository.existenTurnosFuturosActivos({ medico: id });
        if (tieneTurnosFuturos) throw new ValidationError('El médico tiene turnos futuros activos y no puede eliminarse');
        await this.MedicoRepository.deleteById(id);
        if (medico.usuario?._id) await this.UsuarioRepository.deleteById(medico.usuario._id);
    }

    // ── Agenda ────────────────────────────────────────────────────────────────

    async crearAgenda(medicoId, tipoServicio, servicioId, sedeId, disponibilidad) {
        const medico = await this.MedicoRepository.findById(medicoId);

        const tieneSede = medico.sedes.some(s => s._id.toString() === sedeId);
        if (!tieneSede) throw new ValidationError('El médico no atiende en esa sede');

        let servicio;
        if (tipoServicio === 'especialidad') {
            servicio = await this.EspecialidadRepository.findById(servicioId);
            const tieneEspecialidad = medico.especialidades.some(e => e._id.toString() === servicioId);
            if (!tieneEspecialidad) throw new ValidationError('El médico no tiene esa especialidad');
        } else {
            servicio = await this.PracticaRepository.findById(servicioId);
            const tienePractica = medico.practicas.some(p => p._id.toString() === servicioId);
            if (!tienePractica) throw new ValidationError('El médico no tiene esa práctica');
        }

        return await this.agenda.crearAgenda(medico, servicio, sedeId, disponibilidad);
    }

    // ── Gestión de Servicios ──────────────────────────────────────────────────

    async agregarEspecialidad(medicoId, especialidadId) {
        const medico = await this.MedicoRepository.findById(medicoId);
        const especialidad = await this.EspecialidadRepository.findById(especialidadId);
        const yaExiste = medico.especialidades.some(e => e._id.toString() === especialidadId);
        if (yaExiste) throw new ConflictError('El médico ya tiene esa especialidad');
        medico.especialidades.push(especialidadId);
        return await this.MedicoRepository.save(medico);
    }

    async eliminarEspecialidad(medicoId, especialidadId) {
        const medico = await this.MedicoRepository.findById(medicoId);
        const existia = medico.especialidades.some(e => e._id.toString() === especialidadId);
        if (!existia) throw new NotFoundError('El médico no tiene esa especialidad');
        const tieneTurnosFuturos = await this.turnoRepository.existenTurnosFuturosActivos({ medico: medicoId, especialidad: especialidadId });
        if (tieneTurnosFuturos) throw new ValidationError('El médico tiene turnos futuros asociados a esa especialidad');
        medico.especialidades = medico.especialidades.filter(e => e._id.toString() !== especialidadId);
        await this.MedicoRepository.save(medico);
    }

    async agregarPractica(medicoId, practicaId) {
        const medico = await this.MedicoRepository.findById(medicoId);
        const practica = await this.PracticaRepository.findById(practicaId);
        const yaExiste = medico.practicas.some(p => p._id.toString() === practicaId);
        if (yaExiste) throw new ConflictError('El médico ya tiene esa práctica');
        medico.practicas.push(practicaId);
        return await this.MedicoRepository.save(medico);
    }

    async eliminarPractica(medicoId, practicaId) {
        const medico = await this.MedicoRepository.findById(medicoId);
        const existia = medico.practicas.some(p => p._id.toString() === practicaId);
        if (!existia) throw new NotFoundError('El médico no tiene esa práctica');
        const tieneTurnosFuturos = await this.turnoRepository.existenTurnosFuturosActivos({ medico: medicoId, practica: practicaId });
        if (tieneTurnosFuturos) throw new ValidationError('El médico tiene turnos futuros asociados a esa práctica');
        medico.practicas = medico.practicas.filter(p => p._id.toString() !== practicaId);
        await this.MedicoRepository.save(medico);
    }

    async agregarSede(medicoId, sedeId) {
        const medico = await this.MedicoRepository.findById(medicoId);
        await this.SedeRepository.findById(sedeId);
        const yaExiste = medico.sedes.some(s => s._id.toString() === sedeId);
        if (yaExiste) throw new ConflictError('El médico ya tiene esa sede');
        medico.sedes.push(sedeId);
        return await this.MedicoRepository.save(medico);
    }

    async eliminarSede(medicoId, sedeId) {
        const medico = await this.MedicoRepository.findById(medicoId);
        const existia = medico.sedes.some(s => s._id.toString() === sedeId);
        if (!existia) throw new NotFoundError('El médico no tiene esa sede');
        const tieneTurnosFuturos = await this.turnoRepository.existenTurnosFuturosActivos({ medico: medicoId, sede: sedeId });
        if (tieneTurnosFuturos) throw new ValidationError('El médico tiene turnos futuros en esa sede');
        medico.sedes = medico.sedes.filter(s => s._id.toString() !== sedeId);
        await this.MedicoRepository.save(medico);
    }

}
