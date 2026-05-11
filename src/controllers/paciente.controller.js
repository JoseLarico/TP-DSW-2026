import { PacienteService } from '../services/paciente.service.js';
import { TurnoService } from '../services/turno.service.js';

export class PacienteController {
    constructor({
        pacienteService = PacienteService.instance(),
        turnoService = TurnoService.instance()
    } = {}) {
        this.PacienteService = pacienteService;
        this.turnoService = turnoService;
    }

    async obtenerTodos(req, res) {
        try {
            const pacientes = await this.PacienteService.obtenerTodos();
            res.status(200).json(pacientes);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async obtenerPorId(req, res) {
        const { pacienteId } = req.params;
        try {
            const paciente = await this.PacienteService.obtenerPorId(pacienteId);
            res.status(200).json(paciente);
        } catch (error) {
            res.status(404).json({ error: error.message });
        }
    }

    async crear(req, res) {
        try {
            const paciente = await this.PacienteService.crear(req.body);
            res.status(201).json(paciente);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    async actualizar(req, res) {
        const { pacienteId } = req.params;
        try {
            const paciente = await this.PacienteService.actualizar(pacienteId, req.body);
            res.status(200).json(paciente);
        } catch (error) {
            res.status(404).json({ error: error.message });
        }
    }

    async eliminar(req, res) {
        const { pacienteId } = req.params;
        try {
            await this.PacienteService.eliminar(pacienteId);
            res.status(200).json({ message: 'Paciente eliminado correctamente' });
        } catch (error) {
            res.status(404).json({ error: error.message });
        }
    }

    async obtenerHistorialTurnos(req, res) {
        const { pacienteId } = req.params;
        const { medicoId } = req.query;
        try {
            const turnos = await this.turnoService.historialPorPaciente(pacienteId, medicoId);
            res.status(200).json(turnos);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}
