import { SedeService } from '../services/sede.service.js';

export class SedeController {
    constructor({
        sedeService = SedeService.instance()
    } = {}) {
        this.SedeService = sedeService;
    }

    async obtenerTodos(req, res) {
        try {
            const sedes = await this.SedeService.obtenerTodos();
            res.status(200).json(sedes);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async obtenerPorId(req, res) {
        const { sedeId } = req.params;
        try {
            const sede = await this.SedeService.obtenerPorId(sedeId);
            res.status(200).json(sede);
        } catch (error) {
            res.status(404).json({ error: error.message });
        }
    }

    async crear(req, res) {
        try {
            const sede = await this.SedeService.crear(req.body);
            res.status(201).json(sede);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    async actualizar(req, res) {
        const { sedeId } = req.params;
        try {
            const sede = await this.SedeService.actualizar(sedeId, req.body);
            res.status(200).json(sede);
        } catch (error) {
            res.status(404).json({ error: error.message });
        }
    }

    async eliminar(req, res) {
        const { sedeId } = req.params;
        try {
            await this.SedeService.eliminar(sedeId);
            res.status(200).json({ message: 'Sede eliminada correctamente' });
        } catch (error) {
            res.status(404).json({ error: error.message });
        }
    }
}
