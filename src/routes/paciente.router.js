import express from 'express';
import { PacienteController } from '../controllers/paciente.controller.js';

const router = express.Router();
const pacienteController = new PacienteController();

router.get('/', (req, res) =>
    pacienteController.obtenerTodos(req, res)
);

router.get('/:pacienteId', (req, res) =>
    pacienteController.obtenerPorId(req, res)
);

router.post('/', (req, res) =>
    pacienteController.crear(req, res)
);

router.patch('/:pacienteId', (req, res) =>
    pacienteController.actualizar(req, res)
);

router.delete('/:pacienteId', (req, res) =>
    pacienteController.eliminar(req, res)
);

router.get('/:pacienteId/turnos', (req, res) =>
    pacienteController.obtenerHistorialTurnos(req, res)
);

export default router;
