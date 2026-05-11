import express from 'express';
import { PracticaController } from '../controllers/practica.controller.js';

const router = express.Router();
const practicaController = new PracticaController();

router.get('/', (req, res) => practicaController.obtenerTodos(req, res));
router.get('/:practicaId', (req, res) => practicaController.obtenerPorId(req, res));
router.post('/', (req, res) => practicaController.crear(req, res));
router.patch('/:practicaId', (req, res) => practicaController.actualizar(req, res));
router.delete('/:practicaId', (req, res) => practicaController.eliminar(req, res));

export default router;
