import express from 'express';
import { PracticaController } from '../controllers/practica.controller.js';

const router = express.Router();
const practicaController = new PracticaController();

/**
 * @openapi
 * /practicas:
 *   get:
 *     summary: Obtener todas las prácticas
 *     tags: [Prácticas]
 *     responses:
 *       200:
 *         description: Lista de prácticas
 *   post:
 *     summary: Crear una práctica
 *     tags: [Prácticas]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [codigo, nombre]
 *             properties:
 *               codigo:
 *                 type: string
 *                 example: "ECG001"
 *               nombre:
 *                 type: string
 *                 example: "Electrocardiograma"
 *               duracionTurnoEnMins:
 *                 type: number
 *                 example: 20
 *               costo:
 *                 type: number
 *                 example: 3000
 *     responses:
 *       201:
 *         description: Práctica creada
 *       409:
 *         description: Ya existe una práctica con ese código
 */
router.get('/', (req, res, next) => practicaController.obtenerTodos(req, res, next));
router.post('/', (req, res, next) => practicaController.crear(req, res, next));

/**
 * @openapi
 * /practicas/{practicaId}:
 *   get:
 *     summary: Obtener una práctica por ID
 *     tags: [Prácticas]
 *     parameters:
 *       - in: path
 *         name: practicaId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Práctica encontrada
 *       404:
 *         description: Práctica no encontrada
 *   patch:
 *     summary: Actualizar una práctica
 *     tags: [Prácticas]
 *     parameters:
 *       - in: path
 *         name: practicaId
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
 *               costo:
 *                 type: number
 *     responses:
 *       200:
 *         description: Práctica actualizada
 *       404:
 *         description: Práctica no encontrada
 *   delete:
 *     summary: Eliminar una práctica
 *     tags: [Prácticas]
 *     parameters:
 *       - in: path
 *         name: practicaId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Práctica eliminada
 *       400:
 *         description: Tiene turnos futuros asociados o hay médicos que la tienen asignada
 *       404:
 *         description: Práctica no encontrada
 */
router.get('/:practicaId', (req, res, next) => practicaController.obtenerPorId(req, res, next));
router.patch('/:practicaId', (req, res, next) => practicaController.actualizar(req, res, next));
router.delete('/:practicaId', (req, res, next) => practicaController.eliminar(req, res, next));

export default router;
