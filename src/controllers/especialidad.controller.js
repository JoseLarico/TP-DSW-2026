import { EspecialidadService } from '../services/especialidad.service.js';

export class EspecialidadController {
    constructor({
        especialidadService = EspecialidadService.instance()
    } = {}) {
        this.EspecialidadService = especialidadService;
    }

    async obtenerTodos(req, res, next) {
        try {
            const especialidades = await this.EspecialidadService.obtenerTodos();
            res.status(200).json(especialidades);
        } catch (error) {
            next(error);
        }
    }

    async obtenerPorId(req, res, next) {
        const { especialidadId } = req.params;
        try {
            const especialidad = await this.EspecialidadService.obtenerPorId(especialidadId);
            res.status(200).json(especialidad);
        } catch (error) {
            next(error);
        }
    }

    async crear(req, res, next) {
        try {
            const especialidad = await this.EspecialidadService.crear(req.body);
            res.status(201).json(especialidad);
        } catch (error) {
            next(error);
        }
    }

    async actualizar(req, res, next) {
        const { especialidadId } = req.params;
        try {
            const especialidad = await this.EspecialidadService.actualizar(especialidadId, req.body);
            res.status(200).json(especialidad);
        } catch (error) {
            next(error);
        }
    }

    async eliminar(req, res, next) {
        const { especialidadId } = req.params;
        try {
            await this.EspecialidadService.eliminar(especialidadId);
            res.status(200).json({ message: 'Especialidad eliminada correctamente' });
        } catch (error) {
            next(error);
        }
    }
}
