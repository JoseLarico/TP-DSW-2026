import { PracticaService } from '../services/practica.service.js';

export class PracticaController {
    constructor({
        practicaService = PracticaService.instance()
    } = {}) {
        this.PracticaService = practicaService;
    }

    async obtenerTodos(req, res, next) {
        try {
            const practicas = await this.PracticaService.obtenerTodos();
            res.status(200).json(practicas);
        } catch (error) {
            next(error);
        }
    }

    async obtenerPorId(req, res, next) {
        const { practicaId } = req.params;
        try {
            const practica = await this.PracticaService.obtenerPorId(practicaId);
            res.status(200).json(practica);
        } catch (error) {
            next(error);
        }
    }

    async crear(req, res, next) {
        try {
            const practica = await this.PracticaService.crear(req.body);
            res.status(201).json(practica);
        } catch (error) {
            next(error);
        }
    }

    async actualizar(req, res, next) {
        const { practicaId } = req.params;
        try {
            const practica = await this.PracticaService.actualizar(practicaId, req.body);
            res.status(200).json(practica);
        } catch (error) {
            next(error);
        }
    }

    async eliminar(req, res, next) {
        const { practicaId } = req.params;
        try {
            await this.PracticaService.eliminar(practicaId);
            res.status(200).json({ message: 'Práctica eliminada correctamente' });
        } catch (error) {
            next(error);
        }
    }
}
