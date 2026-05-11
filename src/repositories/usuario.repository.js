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
        const nuevoUsuario = new UsuarioModel(usuario);
        return await nuevoUsuario.save();
    }
}
