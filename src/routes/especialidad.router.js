import express from 'express';
import { EspecialidadController } from '../controllers/especialidad.controller.js';

const router = express.Router();
const especialidadController = new EspecialidadController();

/**
 * @openapi
 * /especialidades:
 *   get:
 *     summary: Obtener todas las especialidades
 *     tags: [Especialidades]
 *     responses:
 *       200:
 *         description: Lista de especialidades
 *   post:
 *     summary: Crear una especialidad
 *     tags: [Especialidades]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [nombre]
 *             properties:
 *               nombre:
 *                 type: string
 *                 example: "Cardiología"
 *               duracionTurnoEnMins:
 *                 type: number
 *                 example: 30
 *               costoConsulta:
 *                 type: number
 *                 example: 5000
 *     responses:
 *       201:
 *         description: Especialidad creada
 *       409:
 *         description: Ya existe una especialidad con ese nombre
 */
router.get('/', (req, res, next) => especialidadController.obtenerTodos(req, res, next));
router.post('/', (req, res, next) => especialidadController.crear(req, res, next));

/**
 * @openapi
 * /especialidades/{especialidadId}:
 *   get:
 *     summary: Obtener una especialidad por ID
 *     tags: [Especialidades]
 *     parameters:
 *       - in: path
 *         name: especialidadId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Especialidad encontrada
 *       404:
 *         description: Especialidad no encontrada
 *   patch:
 *     summary: Actualizar una especialidad
 *     tags: [Especialidades]
 *     parameters:
 *       - in: path
 *         name: especialidadId
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
 *               duracionTurnoEnMins:
 *                 type: number
 *               costoConsulta:
 *                 type: number
 *     responses:
 *       200:
 *         description: Especialidad actualizada
 *       404:
 *         description: Especialidad no encontrada
 *   delete:
 *     summary: Eliminar una especialidad
 *     tags: [Especialidades]
 *     parameters:
 *       - in: path
 *         name: especialidadId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Especialidad eliminada
 *       400:
 *         description: Tiene turnos futuros asociados o hay médicos que la tienen asignada
 *       404:
 *         description: Especialidad no encontrada
 */
router.get('/:especialidadId', (req, res, next) => especialidadController.obtenerPorId(req, res, next));
router.patch('/:especialidadId', (req, res, next) => especialidadController.actualizar(req, res, next));
router.delete('/:especialidadId', (req, res, next) => especialidadController.eliminar(req, res, next));

export default router;
