import { MedicoRepository } from '../repositories/medico.repository.js';
import { UsuarioRepository } from '../repositories/usuario.repository.js';
import { EspecialidadRepository } from '../repositories/especialidad.repository.js';
import { PracticaRepository } from '../repositories/practica.repository.js';
import { SedeRepository } from '../repositories/sede.repository.js';
import { Medico } from '../models/medico.model.js';
import { Usuario } from '../models/usuario.model.js';
import { DisponibilidadHoraria } from '../models/disponibilidadHoraria.model.js';
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat.js";

dayjs.extend(customParseFormat);

export class MedicoService {
    constructor({
        medicoRepository = MedicoRepository.instance(),
        usuarioRepository = UsuarioRepository.instance(),
        especialidadRepository = EspecialidadRepository.instance(),
        practicaRepository = PracticaRepository.instance(),
        sedeRepository = SedeRepository.instance()
    } = {}) {
        this.MedicoRepository = medicoRepository;
        this.UsuarioRepository = usuarioRepository;
        this.EspecialidadRepository = especialidadRepository;
        this.PracticaRepository = practicaRepository;
        this.SedeRepository = sedeRepository;
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
            sedes = [],
            disponibilidades = []
        } = datos;

        const usuarioExistente = await this.UsuarioRepository.findByNombreUsuario(nombreUsuario);
        if (usuarioExistente) throw new Error('El nombreUsuario ya está en uso');

        const medicoExistente = await this.MedicoRepository.findByMatricula(matricula);
        if (medicoExistente) throw new Error('La matrícula ya está en uso');

        const usuario = await this.UsuarioRepository.save(new Usuario(nombreUsuario, password));
        const medico = new Medico(usuario._id, matricula, nombre, especialidades, practicas, sedes, disponibilidades);
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
        await this.MedicoRepository.findById(id);
        await this.MedicoRepository.deleteById(id);
    }

    // ── CRUD Disponibilidades ─────────────────────────────────────────────────

    async obtenerDisponibilidades(medicoId) {
        const medico = await this.MedicoRepository.findById(medicoId);
        return medico.disponibilidades;
    }

    async obtenerDisponibilidadPorId(medicoId, idDisponibilidad) {
        const medico = await this.MedicoRepository.findById(medicoId);

        const disponibilidad = medico.disponibilidades.find(d => d._id.toString() === idDisponibilidad);
        if (!disponibilidad) throw new Error('Disponibilidad no encontrada');

        return disponibilidad;
    }

    async crearDisponibilidad(medicoId, datos) {
        const medico = await this.MedicoRepository.findById(medicoId);

        const nueva = new DisponibilidadHoraria(datos.diaSemana, datos.horaInicio, datos.horaFin);

        const tieneConflicto = medico.disponibilidades.some(d => {
            const existente = new DisponibilidadHoraria(d.diaSemana, d.horaInicio, d.horaFin);
            return nueva.seSolapa(existente);
        });

        if (tieneConflicto) throw new Error("Horario ocupado para el médico en ese día y horario");

        const disponibilidadAGuardar = {
            diaSemana: nueva.diaSemana,
            horaInicio: nueva.horaDesde.format("HH:mm"),
            horaFin: nueva.horaHasta.format("HH:mm")
        };

        medico.disponibilidades.push(disponibilidadAGuardar);
        const medicoActualizado = await this.MedicoRepository.save(medico);

        return medicoActualizado.disponibilidades[medicoActualizado.disponibilidades.length - 1];
    }

    async editarDisponibilidad(medicoId, idDisponibilidad, nuevaDisponibilidad) {
        const medico = await this.MedicoRepository.findById(medicoId);

        const disponibilidadActual = medico.disponibilidades.find(d => d._id.toString() === idDisponibilidad);
        if (!disponibilidadActual) throw new Error('Disponibilidad no encontrada');

        const nueva = new DisponibilidadHoraria(
            nuevaDisponibilidad.diaSemana,
            nuevaDisponibilidad.horaInicio,
            nuevaDisponibilidad.horaFin
        );

        const existeConflicto = medico.disponibilidades
            .filter(d => d._id.toString() !== idDisponibilidad)
            .some(d => {
                const existente = new DisponibilidadHoraria(d.diaSemana, d.horaInicio, d.horaFin);
                return nueva.seSolapa(existente);
            });

        if (existeConflicto) throw new Error("Horario ocupado para el médico en ese día y horario");

        medico.disponibilidades = medico.disponibilidades.map(d => {
            if (d._id.toString() === idDisponibilidad) {
                return {
                    _id: d._id,
                    diaSemana: nueva.diaSemana,
                    horaInicio: nueva.horaDesde.format("HH:mm"),
                    horaFin: nueva.horaHasta.format("HH:mm")
                };
            }
            return d;
        });

        const medicoActualizado = await this.MedicoRepository.save(medico);
        return medicoActualizado.disponibilidades.find(d => d._id.toString() === idDisponibilidad);
    }

    // ── Gestión de Servicios ──────────────────────────────────────────────────

    async agregarEspecialidad(medicoId, especialidadId) {
        const medico = await this.MedicoRepository.findById(medicoId);
        await this.EspecialidadRepository.findById(especialidadId);
        const yaExiste = medico.especialidades.some(e => e._id.toString() === especialidadId);
        if (yaExiste) throw new Error('El médico ya tiene esa especialidad');
        medico.especialidades.push(especialidadId);
        return await this.MedicoRepository.save(medico);
    }

    async eliminarEspecialidad(medicoId, especialidadId) {
        const medico = await this.MedicoRepository.findById(medicoId);
        const existia = medico.especialidades.some(e => e._id.toString() === especialidadId);
        if (!existia) throw new Error('El médico no tiene esa especialidad');
        medico.especialidades = medico.especialidades.filter(e => e._id.toString() !== especialidadId);
        await this.MedicoRepository.save(medico);
    }

    async agregarPractica(medicoId, practicaId) {
        const medico = await this.MedicoRepository.findById(medicoId);
        await this.PracticaRepository.findById(practicaId);
        const yaExiste = medico.practicas.some(p => p._id.toString() === practicaId);
        if (yaExiste) throw new Error('El médico ya tiene esa práctica');
        medico.practicas.push(practicaId);
        return await this.MedicoRepository.save(medico);
    }

    async eliminarPractica(medicoId, practicaId) {
        const medico = await this.MedicoRepository.findById(medicoId);
        const existia = medico.practicas.some(p => p._id.toString() === practicaId);
        if (!existia) throw new Error('El médico no tiene esa práctica');
        medico.practicas = medico.practicas.filter(p => p._id.toString() !== practicaId);
        await this.MedicoRepository.save(medico);
    }

    async agregarSede(medicoId, sedeId) {
        const medico = await this.MedicoRepository.findById(medicoId);
        await this.SedeRepository.findById(sedeId);
        const yaExiste = medico.sedes.some(s => s._id.toString() === sedeId);
        if (yaExiste) throw new Error('El médico ya tiene esa sede');
        medico.sedes.push(sedeId);
        return await this.MedicoRepository.save(medico);
    }

    async eliminarSede(medicoId, sedeId) {
        const medico = await this.MedicoRepository.findById(medicoId);
        const existia = medico.sedes.some(s => s._id.toString() === sedeId);
        if (!existia) throw new Error('El médico no tiene esa sede');
        medico.sedes = medico.sedes.filter(s => s._id.toString() !== sedeId);
        await this.MedicoRepository.save(medico);
    }

    async eliminarDisponibilidad(medicoId, idDisponibilidad) {
        const medico = await this.MedicoRepository.findById(medicoId);
        const existia = medico.disponibilidades.some(d => d._id.toString() === idDisponibilidad);
        if (!existia) throw new Error('Disponibilidad no encontrada');
        medico.disponibilidades = medico.disponibilidades.filter(d => d._id.toString() !== idDisponibilidad);
        await this.MedicoRepository.save(medico);
    }
}
