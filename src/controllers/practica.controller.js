import { PracticaService } from '../services/practica.service.js';

export class PracticaController {
    constructor({
        practicaService = PracticaService.instance()
    } = {}) {
        this.PracticaService = practicaService;
    }

    async obtenerTodos(req, res) {
        try {
            const practicas = await this.PracticaService.obtenerTodos();
            res.status(200).json(practicas);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async obtenerPorId(req, res) {
        const { practicaId } = req.params;
        try {
            const practica = await this.PracticaService.obtenerPorId(practicaId);
            res.status(200).json(practica);
        } catch (error) {
            res.status(404).json({ error: error.message });
        }
    }

    async crear(req, res) {
        try {
            const practica = await this.PracticaService.crear(req.body);
            res.status(201).json(practica);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    async actualizar(req, res) {
        const { practicaId } = req.params;
        try {
            const practica = await this.PracticaService.actualizar(practicaId, req.body);
            res.status(200).json(practica);
        } catch (error) {
            res.status(404).json({ error: error.message });
        }
    }

    async eliminar(req, res) {
        const { practicaId } = req.params;
        try {
            await this.PracticaService.eliminar(practicaId);
            res.status(200).json({ message: 'Práctica eliminada correctamente' });
        } catch (error) {
            res.status(404).json({ error: error.message });
        }
    }
}
