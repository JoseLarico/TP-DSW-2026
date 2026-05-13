import { ObraSocialService } from '../services/obraSocial.service.js';

export class ObraSocialController {
    constructor({
        obraSocialService = ObraSocialService.instance()
    } = {}) {
        this.ObraSocialService = obraSocialService;
    }

    async obtenerTodos(req, res, next) {
        try {
            const obrasSociales = await this.ObraSocialService.obtenerTodos();
            res.status(200).json(obrasSociales);
        } catch (error) {
            next(error);
        }
    }

    async obtenerPorId(req, res, next) {
        const { obraSocialId } = req.params;
        try {
            const obraSocial = await this.ObraSocialService.obtenerPorId(obraSocialId);
            res.status(200).json(obraSocial);
        } catch (error) {
            next(error);
        }
    }

    async crear(req, res, next) {
        try {
            const obraSocial = await this.ObraSocialService.crear(req.body);
            res.status(201).json(obraSocial);
        } catch (error) {
            next(error);
        }
    }

    async actualizar(req, res, next) {
        const { obraSocialId } = req.params;
        try {
            const obraSocial = await this.ObraSocialService.actualizar(obraSocialId, req.body);
            res.status(200).json(obraSocial);
        } catch (error) {
            next(error);
        }
    }

    async eliminar(req, res, next) {
        const { obraSocialId } = req.params;
        try {
            await this.ObraSocialService.eliminar(obraSocialId);
            res.status(200).json({ message: 'Obra social eliminada correctamente' });
        } catch (error) {
            next(error);
        }
    }
}
