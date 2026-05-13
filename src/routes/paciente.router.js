import express from 'express';
import { PacienteController } from '../controllers/paciente.controller.js';

const router = express.Router();
const pacienteController = new PacienteController();

/**
 * @openapi
 * /pacientes:
 *   get:
 *     summary: Obtener todos los pacientes
 *     tags: [Pacientes]
 *     responses:
 *       200:
 *         description: Lista de pacientes
 *   post:
 *     summary: Crear un paciente
 *     tags: [Pacientes]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [nombreUsuario, password, dni, nombre, obraSocialId, planId]
 *             properties:
 *               nombreUsuario:
 *                 type: string
 *                 example: "juan.perez"
 *               password:
 *                 type: string
 *                 example: "pass1234"
 *               dni:
 *                 type: string
 *                 example: "30123456"
 *               nombre:
 *                 type: string
 *                 example: "Juan Pérez"
 *               obraSocialId:
 *                 type: string
 *                 example: "664f1a2b3c4d5e6f7a8b9c20"
 *               planId:
 *                 type: string
 *                 example: "664f1a2b3c4d5e6f7a8b9c21"
 *     responses:
 *       201:
 *         description: Paciente creado
 *       400:
 *         description: El plan no pertenece a la obra social indicada
 *       404:
 *         description: Obra social no encontrada
 *       409:
 *         description: Nombre de usuario o DNI ya en uso
 */
router.get('/', (req, res, next) =>
    pacienteController.obtenerTodos(req, res, next)
);
router.post('/', (req, res, next) =>
    pacienteController.crear(req, res, next)
);

/**
 * @openapi
 * /pacientes/{pacienteId}:
 *   get:
 *     summary: Obtener un paciente por ID
 *     tags: [Pacientes]
 *     parameters:
 *       - in: path
 *         name: pacienteId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Datos del paciente
 *       404:
 *         description: Paciente no encontrado
 *   patch:
 *     summary: Actualizar datos de un paciente
 *     tags: [Pacientes]
 *     parameters:
 *       - in: path
 *         name: pacienteId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *               obraSocial:
 *                 type: string
 *               plan:
 *                 type: string
 *     responses:
 *       200:
 *         description: Paciente actualizado
 *       400:
 *         description: El plan no pertenece a la obra social indicada
 *       404:
 *         description: Paciente u obra social no encontrada
 *   delete:
 *     summary: Eliminar un paciente
 *     tags: [Pacientes]
 *     parameters:
 *       - in: path
 *         name: pacienteId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Paciente eliminado
 *       400:
 *         description: El paciente tiene turnos futuros activos
 *       404:
 *         description: Paciente no encontrado
 */
router.get('/:pacienteId', (req, res, next) =>
    pacienteController.obtenerPorId(req, res, next)
);
router.patch('/:pacienteId', (req, res, next) =>
    pacienteController.actualizar(req, res, next)
);
router.delete('/:pacienteId', (req, res, next) =>
    pacienteController.eliminar(req, res, next)
);

/**
 * @openapi
 * /pacientes/{pacienteId}/turnos:
 *   get:
 *     summary: Obtener historial de turnos de un paciente
 *     tags: [Pacientes]
 *     parameters:
 *       - in: path
 *         name: pacienteId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: medicoId
 *         required: false
 *         schema:
 *           type: string
 *         description: Filtrar turnos por médico
 *     responses:
 *       200:
 *         description: Lista de turnos del paciente
 *       404:
 *         description: Paciente no encontrado
 */
router.get('/:pacienteId/turnos', (req, res, next) =>
    pacienteController.obtenerHistorialTurnos(req, res, next)
);

export default router;
