import express from 'express';
import { ObraSocialController } from '../controllers/obraSocial.controller.js';

const router = express.Router();
const obraSocialController = new ObraSocialController();

router.get('/', (req, res) => obraSocialController.obtenerTodos(req, res));
router.get('/:obraSocialId', (req, res) => obraSocialController.obtenerPorId(req, res));
router.post('/', (req, res) => obraSocialController.crear(req, res));
router.patch('/:obraSocialId', (req, res) => obraSocialController.actualizar(req, res));
router.delete('/:obraSocialId', (req, res) => obraSocialController.eliminar(req, res));

export default router;
