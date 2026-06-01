import { TurnoService } from "../services/turno.service.js";
import { BusquedaTurnoService } from "../services/busquedaTurno.service.js";

export class TurnoController {
    constructor({
        turnoService = TurnoService.instance(),
        busquedaTurnoService = BusquedaTurnoService.instance()
    } = {}) {
        this.turnoService = turnoService;
        this.busquedaTurnoService = busquedaTurnoService;
    }

    async altaTurno(req, res, next) {
        const { turnoId, pacienteId } = req.validatedBody;
        try {
            const turnoCreado = await this.turnoService.altaTurno(turnoId, pacienteId);
            res.status(201).json({ turno: turnoCreado });
        } catch (error) {
            next(error);
        }
    }

    async cancelarPorPaciente(req, res, next) {
        const { turnoId } = req.params;
        const { pacienteId, motivo } = req.body ?? {};
        try {
            const turno = await this.turnoService.cancelarPorPaciente(turnoId, pacienteId, motivo);
            res.status(200).json({ turno });
        } catch (error) {
            next(error);
        }
    }

    async cancelarPorMedico(req, res, next) {
        const { turnoId } = req.params;
        const { medicoId, motivo } = req.body ?? {};
        try {
            const turno = await this.turnoService.cancelarPorMedico(turnoId, medicoId, motivo);
            res.status(200).json({ turno });
        } catch (error) {
            next(error);
        }
    }

    async cambiarFechaPaciente(req, res, next) {
        const { turnoId } = req.params;
        const { pacienteId, nuevoTurnoId } = req.validatedBody;
        try {
            const turno = await this.turnoService.cambiarFechaPaciente(turnoId, pacienteId, nuevoTurnoId);
            res.status(200).json({ turno });
        } catch (error) {
            next(error);
        }
    }

    async proponerCambioFechaMedico(req, res, next) {
        const { turnoId } = req.params;
        const { nuevoTurnoId } = req.validatedBody;
        try {
            const turno = await this.turnoService.proponerCambioFechaMedico(turnoId, nuevoTurnoId);
            res.status(200).json({ turno });
        } catch (error) {
            next(error);
        }
    }

    async responderSolicitudCambioFecha(req, res, next) {
        const { turnoId } = req.params;
        const { pacienteId, estado } = req.validatedBody;
        try {
            const turno = estado === "confirmado"
                ? await this.turnoService.confirmarCambioFechaPaciente(turnoId, pacienteId)
                : await this.turnoService.rechazarCambioFechaPaciente(turnoId, pacienteId);
            res.status(200).json({ turno });
        } catch (error) {
            next(error);
        }
    }

    async marcarRealizado(req, res, next) {
        const { turnoId } = req.params;
        try {
            const turno = await this.turnoService.marcarRealizado(turnoId);
            res.status(200).json({ turno });
        } catch (error) {
            next(error);
        }
    }

    async buscarTurnosConCobertura(req, res, next) {
        const { pacienteId } = req.params;
        try {
            const resultado = await this.busquedaTurnoService.buscarTurnosConCobertura(pacienteId, req.validatedQuery);
            res.status(200).json(resultado);
        } catch (error) {
            next(error);
        }
    }
}
