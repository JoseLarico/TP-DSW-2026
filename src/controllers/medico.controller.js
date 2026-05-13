import { MedicoService } from "../services/medico.service.js";
import { TurnoService } from "../services/turno.service.js";

export class MedicoController {

    constructor({
        medicoService = MedicoService.instance(),
        turnoService = TurnoService.instance()
    } = {}) {
        this.MedicoService = medicoService;
        this.turnoService = turnoService;
    }

    // ── CRUD Médicos ──────────────────────────────────────────────────────────

    async obtenerTodos(req, res, next) {
        try {
            const medicos = await this.MedicoService.obtenerTodos();
            res.status(200).json(medicos);
        } catch (error) {
            next(error);
        }
    }

    async obtenerPorId(req, res, next) {
        const { medicoId } = req.params;
        try {
            const medico = await this.MedicoService.obtenerPorId(medicoId);
            res.status(200).json(medico);
        } catch (error) {
            next(error);
        }
    }

    async crear(req, res, next) {
        try {
            const medico = await this.MedicoService.crear(req.body);
            res.status(201).json(medico);
        } catch (error) {
            next(error);
        }
    }

    async actualizar(req, res, next) {
        const { medicoId } = req.params;
        try {
            const medico = await this.MedicoService.actualizar(medicoId, req.body);
            res.status(200).json(medico);
        } catch (error) {
            next(error);
        }
    }

    async eliminar(req, res, next) {
        const { medicoId } = req.params;
        try {
            await this.MedicoService.eliminar(medicoId);
            res.status(200).json({ message: "Médico eliminado correctamente" });
        } catch (error) {
            next(error);
        }
    }

    // ── Agenda ────────────────────────────────────────────────────────────────

    async crearAgenda(req, res, next) {
        const { medicoId } = req.params;
        const { especialidadId, practicaId, sedeId, disponibilidad } = req.validatedBody;
        const tipoServicio = especialidadId ? 'especialidad' : 'practica';
        const servicioId = especialidadId ?? practicaId;
        try {
            const turnos = await this.MedicoService.crearAgenda(medicoId, tipoServicio, servicioId, sedeId, disponibilidad);
            res.status(201).json(turnos);
        } catch (error) {
            next(error);
        }
    }

    // ── Gestión de Servicios ──────────────────────────────────────────────────

    async agregarEspecialidad(req, res, next) {
        const { medicoId } = req.params;
        const { especialidadId } = req.body;
        try {
            const medico = await this.MedicoService.agregarEspecialidad(medicoId, especialidadId);
            res.status(200).json(medico);
        } catch (error) {
            next(error);
        }
    }

    async eliminarEspecialidad(req, res, next) {
        const { medicoId, especialidadId } = req.params;
        try {
            await this.MedicoService.eliminarEspecialidad(medicoId, especialidadId);
            res.status(200).json({ message: 'Especialidad eliminada del médico correctamente' });
        } catch (error) {
            next(error);
        }
    }

    async agregarPractica(req, res, next) {
        const { medicoId } = req.params;
        const { practicaId } = req.body;
        try {
            const medico = await this.MedicoService.agregarPractica(medicoId, practicaId);
            res.status(200).json(medico);
        } catch (error) {
            next(error);
        }
    }

    async eliminarPractica(req, res, next) {
        const { medicoId, practicaId } = req.params;
        try {
            await this.MedicoService.eliminarPractica(medicoId, practicaId);
            res.status(200).json({ message: 'Práctica eliminada del médico correctamente' });
        } catch (error) {
            next(error);
        }
    }

    async agregarSede(req, res, next) {
        const { medicoId } = req.params;
        const { sedeId } = req.body;
        try {
            const medico = await this.MedicoService.agregarSede(medicoId, sedeId);
            res.status(200).json(medico);
        } catch (error) {
            next(error);
        }
    }

    async eliminarSede(req, res, next) {
        const { medicoId, sedeId } = req.params;
        try {
            await this.MedicoService.eliminarSede(medicoId, sedeId);
            res.status(200).json({ message: 'Sede eliminada del médico correctamente' });
        } catch (error) {
            next(error);
        }
    }

    async consultarDisponibilidad(req, res, next) {
        const { medicoId } = req.params;
        try {
            const resultado = await this.turnoService.consultarDisponibilidad(medicoId, req.validatedQuery);
            res.status(200).json(resultado);
        } catch (error) {
            next(error);
        }
    }

    async obtenerHistorialTurnos(req, res, next) {
        const { medicoId } = req.params;
        try {
            const turnos = await this.turnoService.historialPorMedico(medicoId);
            res.status(200).json(turnos);
        } catch (error) {
            next(error);
        }
    }
}
