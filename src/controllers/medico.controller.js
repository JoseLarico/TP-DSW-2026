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

    async obtenerTodos(req, res) {
        try {
            const medicos = await this.MedicoService.obtenerTodos();
            res.status(200).json(medicos);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async obtenerPorId(req, res) {
        const { medicoId } = req.params;
        try {
            const medico = await this.MedicoService.obtenerPorId(medicoId);
            res.status(200).json(medico);
        } catch (error) {
            res.status(404).json({ error: error.message });
        }
    }

    async crear(req, res) {
        try {
            const medico = await this.MedicoService.crear(req.body);
            res.status(201).json(medico);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    async actualizar(req, res) {
        const { medicoId } = req.params;
        try {
            const medico = await this.MedicoService.actualizar(medicoId, req.body);
            res.status(200).json(medico);
        } catch (error) {
            res.status(404).json({ error: error.message });
        }
    }

    async eliminar(req, res) {
        const { medicoId } = req.params;
        try {
            await this.MedicoService.eliminar(medicoId);
            res.status(200).json({ message: "Médico eliminado correctamente" });
        } catch (error) {
            res.status(404).json({ error: error.message });
        }
    }

    // ── CRUD Disponibilidades ─────────────────────────────────────────────────

    async obtenerDisponibilidades(req, res) {
        const { medicoId } = req.params;
        try {
            const disponibilidades = await this.MedicoService.obtenerDisponibilidades(medicoId);
            res.status(200).json(disponibilidades);
        } catch (error) {
            res.status(404).json({ error: error.message });
        }
    }

    async obtenerDisponibilidadPorId(req, res) {
        const { medicoId, disponibilidadId } = req.params;
        try {
            const disponibilidad = await this.MedicoService.obtenerDisponibilidadPorId(
                medicoId,
                disponibilidadId
            );
            res.status(200).json(disponibilidad);
        } catch (error) {
            res.status(error.message.includes('no encontrad') ? 404 : 400).json({ error: error.message });
        }
    }

    async crearDisponibilidad(req, res) {
        const { medicoId } = req.params;
        const { nuevaDisponibilidad } = req.body;
        try {
            const disponibilidad = await this.MedicoService.crearDisponibilidad(medicoId, nuevaDisponibilidad);
            res.status(201).json(disponibilidad);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    async editarDisponibilidad(req, res) {
        const { medicoId, disponibilidadId } = req.params;
        const { nuevaDisponibilidad } = req.body;
        try {
            const disponibilidad = await this.MedicoService.editarDisponibilidad(
                medicoId,
                disponibilidadId,
                nuevaDisponibilidad
            );
            res.status(200).json(disponibilidad);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    async eliminarDisponibilidad(req, res) {
        const { medicoId, disponibilidadId } = req.params;
        try {
            await this.MedicoService.eliminarDisponibilidad(medicoId, disponibilidadId);
            res.status(200).json({ message: 'Disponibilidad eliminada correctamente' });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    // ── Gestión de Servicios ──────────────────────────────────────────────────

    async agregarEspecialidad(req, res) {
        const { medicoId } = req.params;
        const { especialidadId } = req.body;
        try {
            const medico = await this.MedicoService.agregarEspecialidad(medicoId, especialidadId);
            res.status(200).json(medico);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    async eliminarEspecialidad(req, res) {
        const { medicoId, especialidadId } = req.params;
        try {
            await this.MedicoService.eliminarEspecialidad(medicoId, especialidadId);
            res.status(200).json({ message: 'Especialidad eliminada del médico correctamente' });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    async agregarPractica(req, res) {
        const { medicoId } = req.params;
        const { practicaId } = req.body;
        try {
            const medico = await this.MedicoService.agregarPractica(medicoId, practicaId);
            res.status(200).json(medico);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    async eliminarPractica(req, res) {
        const { medicoId, practicaId } = req.params;
        try {
            await this.MedicoService.eliminarPractica(medicoId, practicaId);
            res.status(200).json({ message: 'Práctica eliminada del médico correctamente' });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    async agregarSede(req, res) {
        const { medicoId } = req.params;
        const { sedeId } = req.body;
        try {
            const medico = await this.MedicoService.agregarSede(medicoId, sedeId);
            res.status(200).json(medico);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    async eliminarSede(req, res) {
        const { medicoId, sedeId } = req.params;
        try {
            await this.MedicoService.eliminarSede(medicoId, sedeId);
            res.status(200).json({ message: 'Sede eliminada del médico correctamente' });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    async obtenerHistorialTurnos(req, res) {
        const { medicoId } = req.params;
        try {
            const turnos = await this.turnoService.historialPorMedico(medicoId);
            res.status(200).json(turnos);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}
