import { application } from "express";
import { MedicoService } from "../services/medico.service.js";

export class MedicoController {

    constructor({
        medicoService = MedicoService.instance()
    } = {}) {
        this.MedicoService = medicoService;
    } 

    obtenerDisponibilidades(req, res) {
    const { medicoId } = req.params;
    try {
        const disponibilidades = this.MedicoService.obtenerDisponibilidades(Number(medicoId));
        res.status(200);
        res.json(disponibilidades);
        }
    catch (error) {
        res.status(404);
        res.json({ error: error.message });
        }
    }

    obtenerDisponibilidadPorId(req, res) {
    const { medicoId, disponibilidadId } = req.params;
    try {
        const disponibilidad = this.MedicoService.obtenerDisponibilidadPorId(
            Number(medicoId), 
            Number(disponibilidadId)
        );
        res.status(200).json(disponibilidad);
        } 
    catch (error) {
        res.status(error.message.includes('no encontrad') ? 404 : 400).json({ error: error.message });
        }
    }

    crearDisponibilidad(req, res) {
    const { medicoId } = req.params;
    const { nuevaDisponibilidad } = req.body; // El JSON debe venir con diaSemana, horaInicio, horaFin
    try {
        const medicoActualizado = this.MedicoService.crearDisponibilidad(Number(medicoId), nuevaDisponibilidad);
        res.status(201).json({ medico: medicoActualizado });
        } 
    catch (error) {
        res.status(400).json({ error: error.message });
        }
    }





    editarDisponibilidad(req, res) {
        const { medicoId, disponibilidadId} = req.params;
        const {nuevaDisponibilidad } = req.body;
  try {
   const medicoActualizado = this.MedicoService.editarDisponibilidad(
      Number(medicoId),
      Number(disponibilidadId),
      nuevaDisponibilidad
    );
            res.status(200).json({medico: medicoActualizado});
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    eliminarDisponibilidad(req, res) {
        const { medicoId, disponibilidadId } = req.params;
        try {
            this.MedicoService.eliminarDisponibilidad(medicoId, Number(disponibilidadId));
            res.status(200).json({ message: 'Disponibilidad eliminada correctamente' });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }



}