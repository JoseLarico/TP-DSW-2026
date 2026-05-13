import express from 'express';
import { SedeController } from '../controllers/sede.controller.js';

const router = express.Router();
const sedeController = new SedeController();

/**
 * @openapi
 * /sedes:
 *   get:
 *     summary: Obtener todas las sedes
 *     tags: [Sedes]
 *     responses:
 *       200:
 *         description: Lista de sedes
 *   post:
 *     summary: Crear una sede
 *     tags: [Sedes]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [nombre, direccion]
 *             properties:
 *               nombre:
 *                 type: string
 *                 example: "Sede Centro"
 *               direccion:
 *                 type: string
 *                 example: "Av. Corrientes 1234"
 *     responses:
 *       201:
 *         description: Sede creada
 *       409:
 *         description: Ya existe una sede con ese nombre
 */
router.get('/', (req, res, next) => sedeController.obtenerTodos(req, res, next));
router.post('/', (req, res, next) => sedeController.crear(req, res, next));

/**
 * @openapi
 * /sedes/{sedeId}:
 *   get:
 *     summary: Obtener una sede por ID
 *     tags: [Sedes]
 *     parameters:
 *       - in: path
 *         name: sedeId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Sede encontrada
 *       404:
 *         description: Sede no encontrada
 *   patch:
 *     summary: Actualizar una sede
 *     tags: [Sedes]
 *     parameters:
 *       - in: path
 *         name: sedeId
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
 *               direccion:
 *                 type: string
 *     responses:
 *       200:
 *         description: Sede actualizada
 *       404:
 *         description: Sede no encontrada
 *   delete:
 *     summary: Eliminar una sede
 *     tags: [Sedes]
 *     parameters:
 *       - in: path
 *         name: sedeId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Sede eliminada
 *       400:
 *         description: Tiene turnos futuros asociados o hay médicos que atienden en ella
 *       404:
 *         description: Sede no encontrada
 */
router.get('/:sedeId', (req, res, next) => sedeController.obtenerPorId(req, res, next));
router.patch('/:sedeId', (req, res, next) => sedeController.actualizar(req, res, next));
router.delete('/:sedeId', (req, res, next) => sedeController.eliminar(req, res, next));

export default router;
