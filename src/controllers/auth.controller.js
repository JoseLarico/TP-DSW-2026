import { AuthService } from '../services/auth.service.js';

const authService = AuthService.instance();

export const login = async (req, res) => {
    const { nombreUsuario, password } = req.body;
    const result = await authService.login(nombreUsuario, password);
    res.status(200).json(result);
};
