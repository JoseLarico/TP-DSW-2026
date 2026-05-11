import express from 'express';
import { SedeController } from '../controllers/sede.controller.js';

const router = express.Router();
const sedeController = new SedeController();

router.get('/', (req, res) => sedeController.obtenerTodos(req, res));
router.get('/:sedeId', (req, res) => sedeController.obtenerPorId(req, res));
router.post('/', (req, res) => sedeController.crear(req, res));
router.patch('/:sedeId', (req, res) => sedeController.actualizar(req, res));
router.delete('/:sedeId', (req, res) => sedeController.eliminar(req, res));

export default router;
