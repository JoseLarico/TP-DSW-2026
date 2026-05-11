import { EspecialidadService } from '../services/especialidad.service.js';

export class EspecialidadController {
    constructor({
        especialidadService = EspecialidadService.instance()
    } = {}) {
        this.EspecialidadService = especialidadService;
    }

    async obtenerTodos(req, res) {
        try {
            const especialidades = await this.EspecialidadService.obtenerTodos();
            res.status(200).json(especialidades);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async obtenerPorId(req, res) {
        const { especialidadId } = req.params;
        try {
            const especialidad = await this.EspecialidadService.obtenerPorId(especialidadId);
            res.status(200).json(especialidad);
        } catch (error) {
            res.status(404).json({ error: error.message });
        }
    }

    async crear(req, res) {
        try {
            const especialidad = await this.EspecialidadService.crear(req.body);
            res.status(201).json(especialidad);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    async actualizar(req, res) {
        const { especialidadId } = req.params;
        try {
            const especialidad = await this.EspecialidadService.actualizar(especialidadId, req.body);
            res.status(200).json(especialidad);
        } catch (error) {
            res.status(404).json({ error: error.message });
        }
    }

    async eliminar(req, res) {
        const { especialidadId } = req.params;
        try {
            await this.EspecialidadService.eliminar(especialidadId);
            res.status(200).json({ message: 'Especialidad eliminada correctamente' });
        } catch (error) {
            res.status(404).json({ error: error.message });
        }
    }
}
