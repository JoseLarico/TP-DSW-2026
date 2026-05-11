import { ObraSocialService } from '../services/obraSocial.service.js';

export class ObraSocialController {
    constructor({
        obraSocialService = ObraSocialService.instance()
    } = {}) {
        this.ObraSocialService = obraSocialService;
    }

    async obtenerTodos(req, res) {
        try {
            const obrasSociales = await this.ObraSocialService.obtenerTodos();
            res.status(200).json(obrasSociales);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async obtenerPorId(req, res) {
        const { obraSocialId } = req.params;
        try {
            const obraSocial = await this.ObraSocialService.obtenerPorId(obraSocialId);
            res.status(200).json(obraSocial);
        } catch (error) {
            res.status(404).json({ error: error.message });
        }
    }

    async crear(req, res) {
        try {
            const obraSocial = await this.ObraSocialService.crear(req.body);
            res.status(201).json(obraSocial);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    async actualizar(req, res) {
        const { obraSocialId } = req.params;
        try {
            const obraSocial = await this.ObraSocialService.actualizar(obraSocialId, req.body);
            res.status(200).json(obraSocial);
        } catch (error) {
            res.status(404).json({ error: error.message });
        }
    }

    async eliminar(req, res) {
        const { obraSocialId } = req.params;
        try {
            await this.ObraSocialService.eliminar(obraSocialId);
            res.status(200).json({ message: 'Obra social eliminada correctamente' });
        } catch (error) {
            res.status(404).json({ error: error.message });
        }
    }
}
