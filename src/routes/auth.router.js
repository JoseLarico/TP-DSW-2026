import { Router } from 'express';
import { login } from '../controllers/auth.controller.js';

const authRouter = Router();

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Iniciar sesión
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [nombreUsuario, password]
 *             properties:
 *               nombreUsuario:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login exitoso, retorna token JWT y datos del usuario
 *       401:
 *         description: Credenciales inválidas
 */
authRouter.post('/login', login);

export default authRouter;
