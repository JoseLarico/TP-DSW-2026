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

    async obtenerTodos(req, res, next) {
        try {
            const pacientes = await this.PacienteService.obtenerTodos();
            res.status(200).json(pacientes);
        } catch (error) {
            next(error);
        }
    }

    async obtenerPorId(req, res, next) {
        const { pacienteId } = req.params;
        try {
            const paciente = await this.PacienteService.obtenerPorId(pacienteId);
            res.status(200).json(paciente);
        } catch (error) {
            next(error);
        }
    }

    async crear(req, res, next) {
        try {
            const paciente = await this.PacienteService.crear(req.body);
            res.status(201).json(paciente);
        } catch (error) {
            next(error);
        }
    }

    async actualizar(req, res, next) {
        const { pacienteId } = req.params;
        try {
            const paciente = await this.PacienteService.actualizar(pacienteId, req.body);
            res.status(200).json(paciente);
        } catch (error) {
            next(error);
        }
    }

    async eliminar(req, res, next) {
        const { pacienteId } = req.params;
        try {
            await this.PacienteService.eliminar(pacienteId);
            res.status(200).json({ message: 'Paciente eliminado correctamente' });
        } catch (error) {
            next(error);
        }
    }

    async obtenerHistorialTurnos(req, res, next) {
        const { pacienteId } = req.params;
        const { medicoId } = req.query;
        try {
            const turnos = await this.turnoService.historialPorPaciente(pacienteId, medicoId);
            res.status(200).json(turnos);
        } catch (error) {
            next(error);
        }
    }
}
