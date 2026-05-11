import mongoose from 'mongoose';
import usuarioSchema from '../../schemas/mongoose/usuario.schema.js';

const UsuarioModel = mongoose.model('Usuario', usuarioSchema);

export default UsuarioModel;
