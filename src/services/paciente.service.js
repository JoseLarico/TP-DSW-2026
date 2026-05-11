import { PacienteRepository } from '../repositories/paciente.repository.js';
import { UsuarioRepository } from '../repositories/usuario.repository.js';
import { Paciente } from '../models/paciente.model.js';
import { Usuario } from '../models/usuario.model.js';

export class PacienteService {
    constructor({
        pacienteRepository = PacienteRepository.instance(),
        usuarioRepository = UsuarioRepository.instance()
    } = {}) {
        this.PacienteRepository = pacienteRepository;
        this.UsuarioRepository = usuarioRepository;
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
        if (usuarioExistente) throw new Error('El nombreUsuario ya está en uso');

        const pacienteExistente = await this.PacienteRepository.findByDni(dni);
        if (pacienteExistente) throw new Error('El DNI ya está en uso');

        const usuario = await this.UsuarioRepository.save(new Usuario(nombreUsuario, password));
        const paciente = new Paciente(usuario._id, dni, nombre, obraSocialId, planId);
        return await this.PacienteRepository.save(paciente);
    }

    async actualizar(id, datos) {
        const paciente = await this.PacienteRepository.findById(id);

        const { nombre, obraSocial, plan } = datos;
        if (nombre !== undefined) paciente.nombre = nombre;
        if (obraSocial !== undefined) paciente.obraSocial = obraSocial;
        if (plan !== undefined) paciente.plan = plan;

        return await this.PacienteRepository.save(paciente);
    }

    async eliminar(id) {
        await this.PacienteRepository.findById(id);
        await this.PacienteRepository.deleteById(id);
    }
}
