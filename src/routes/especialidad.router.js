import express from 'express';
import { EspecialidadController } from '../controllers/especialidad.controller.js';

const router = express.Router();
const especialidadController = new EspecialidadController();

router.get('/', (req, res) => especialidadController.obtenerTodos(req, res));
router.get('/:especialidadId', (req, res) => especialidadController.obtenerPorId(req, res));
router.post('/', (req, res) => especialidadController.crear(req, res));
router.patch('/:especialidadId', (req, res) => especialidadController.actualizar(req, res));
router.delete('/:especialidadId', (req, res) => especialidadController.eliminar(req, res));

export default router;
