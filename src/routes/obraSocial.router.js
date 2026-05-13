import express from 'express';
import { ObraSocialController } from '../controllers/obraSocial.controller.js';

const router = express.Router();
const obraSocialController = new ObraSocialController();

/**
 * @openapi
 * /obras-sociales:
 *   get:
 *     summary: Obtener todas las obras sociales
 *     tags: [Obras Sociales]
 *     responses:
 *       200:
 *         description: Lista de obras sociales
 *   post:
 *     summary: Crear una obra social
 *     tags: [Obras Sociales]
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
 *                 example: "OSDE"
 *               planes:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     nombre:
 *                       type: string
 *                       example: "Plan 210"
 *     responses:
 *       201:
 *         description: Obra social creada
 *       409:
 *         description: Ya existe una obra social con ese nombre
 */
router.get('/', (req, res, next) => obraSocialController.obtenerTodos(req, res, next));
router.post('/', (req, res, next) => obraSocialController.crear(req, res, next));

/**
 * @openapi
 * /obras-sociales/{obraSocialId}:
 *   get:
 *     summary: Obtener una obra social por ID
 *     tags: [Obras Sociales]
 *     parameters:
 *       - in: path
 *         name: obraSocialId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Obra social encontrada
 *       404:
 *         description: Obra social no encontrada
 *   patch:
 *     summary: Actualizar una obra social
 *     tags: [Obras Sociales]
 *     parameters:
 *       - in: path
 *         name: obraSocialId
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
 *               planes:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     nombre:
 *                       type: string
 *                     coberturasEspecialidad:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           especialidad:
 *                             type: string
 *                           nivel:
 *                             type: string
 *                             enum: [total, parcial, ninguno]
 *                           porcentaje:
 *                             type: number
 *                     coberturasPractica:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           practica:
 *                             type: string
 *                           nivel:
 *                             type: string
 *                             enum: [total, parcial, ninguno]
 *                           porcentaje:
 *                             type: number
 *     responses:
 *       200:
 *         description: Obra social actualizada
 *       404:
 *         description: Obra social, especialidad o práctica no encontrada
 *   delete:
 *     summary: Eliminar una obra social
 *     tags: [Obras Sociales]
 *     parameters:
 *       - in: path
 *         name: obraSocialId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Obra social eliminada
 *       400:
 *         description: La obra social tiene pacientes asociados
 *       404:
 *         description: Obra social no encontrada
 */
router.get('/:obraSocialId', (req, res, next) => obraSocialController.obtenerPorId(req, res, next));
router.patch('/:obraSocialId', (req, res, next) => obraSocialController.actualizar(req, res, next));
router.delete('/:obraSocialId', (req, res, next) => obraSocialController.eliminar(req, res, next));

export default router;
