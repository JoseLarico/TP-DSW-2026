import { SedeService } from '../services/sede.service.js';

export class SedeController {
    constructor({
        sedeService = SedeService.instance()
    } = {}) {
        this.SedeService = sedeService;
    }

    async obtenerTodos(req, res, next) {
        try {
            const sedes = await this.SedeService.obtenerTodos();
            res.status(200).json(sedes);
        } catch (error) {
            next(error);
        }
    }

    async obtenerPorId(req, res, next) {
        const { sedeId } = req.params;
        try {
            const sede = await this.SedeService.obtenerPorId(sedeId);
            res.status(200).json(sede);
        } catch (error) {
            next(error);
        }
    }

    async crear(req, res, next) {
        try {
            const sede = await this.SedeService.crear(req.body);
            res.status(201).json(sede);
        } catch (error) {
            next(error);
        }
    }

    async actualizar(req, res, next) {
        const { sedeId } = req.params;
        try {
            const sede = await this.SedeService.actualizar(sedeId, req.body);
            res.status(200).json(sede);
        } catch (error) {
            next(error);
        }
    }

    async eliminar(req, res, next) {
        const { sedeId } = req.params;
        try {
            await this.SedeService.eliminar(sedeId);
            res.status(200).json({ message: 'Sede eliminada correctamente' });
        } catch (error) {
            next(error);
        }
    }
}
