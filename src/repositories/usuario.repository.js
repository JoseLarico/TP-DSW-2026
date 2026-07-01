import bcrypt from 'bcryptjs';
import UsuarioModel from '../models/mongoose/usuario.model.js';

export class UsuarioRepository {

    static instance() {
        this._instance ||= new this();
        return this._instance;
    }

    async findByNombreUsuario(nombreUsuario) {
        return await UsuarioModel.findOne({ nombreUsuario });
    }

    async save(usuario) {
        const hashed = await bcrypt.hash(usuario.password, 10);
        const nuevoUsuario = new UsuarioModel({ ...usuario, password: hashed });
        return await nuevoUsuario.save();
    }

    async deleteById(id) {
        return await UsuarioModel.findByIdAndDelete(id);
    }
}
