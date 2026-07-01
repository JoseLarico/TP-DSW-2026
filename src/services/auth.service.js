import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UsuarioRepository } from '../repositories/usuario.repository.js';
import { PacienteRepository } from '../repositories/paciente.repository.js';
import { MedicoRepository } from '../repositories/medico.repository.js';
import { UnauthorizedError } from '../error/appError.js';

export class AuthService {
    constructor({
        usuarioRepository = UsuarioRepository.instance(),
        pacienteRepository = PacienteRepository.instance(),
        medicoRepository = MedicoRepository.instance(),
    } = {}) {
        this.UsuarioRepository = usuarioRepository;
        this.PacienteRepository = pacienteRepository;
        this.MedicoRepository = medicoRepository;
    }

    static instance() {
        this._instance ||= new AuthService();
        return this._instance;
    }

    async login(nombreUsuario, password) {
        const usuario = await this.UsuarioRepository.findByNombreUsuario(nombreUsuario);
        if (!usuario) throw new UnauthorizedError('Credenciales inválidas');

        const valid = await bcrypt.compare(password, usuario.password);
        if (!valid) throw new UnauthorizedError('Credenciales inválidas');

        let rol, entidad;
        const paciente = await this.PacienteRepository.findByUsuarioId(usuario._id);
        if (paciente) {
            rol = 'paciente';
            entidad = paciente;
        } else {
            const medico = await this.MedicoRepository.findByUsuarioId(usuario._id);
            if (medico) {
                rol = 'medico';
                entidad = medico;
            } else {
                throw new UnauthorizedError('Usuario sin rol asignado');
            }
        }

        const token = jwt.sign(
            { userId: usuario._id, rol },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        return { token, rol, [rol]: entidad };
    }
}
