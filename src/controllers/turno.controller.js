import { TurnoService } from "../services/turno.service.js";
/*
req y res son objetos de Express:

req (request): contiene todo lo que manda el cliente: params de la URL, body, headers, etc.
res (response): es lo que usas para responderle al cliente, con un código HTTP y un body JSON
El flujo correcto es:
cliente → request → controller → llama al service → devuelve resultado → controller → response → cliente
*/
export class TurnoController {
    constructor({ turnoService = TurnoService.instance() } = {}) {
        this.turnoService = turnoService;
    }

    async altaTurno(req, res) {
        const { medicoId, pacienteId, fechaHora, sedeId, especialidadId, practicaId } = req.body;
        try {
            const turnoCreado = await this.turnoService.altaTurno(medicoId, pacienteId, fechaHora, sedeId, especialidadId, practicaId);
            res.status(201).json({ turno: turnoCreado });
        } catch (error) {
            if (error.message === "Médico no encontrado") {
                res.status(404).json({ error: error.message });
            } else {
                res.status(400).json({ error: error.message });
            }
        }
    }


    /*
    Para llamar al service con bajaTurno usamos try catch porque el service puede tirar errores con throw new Error(...):

    Si el turno no existe: throw new Error("Turno no encontrado")
    Si falta menos de 1 hora: throw new Error("No se puede cancelar...")

    Sin try catch esos errores harían caer la aplicación. Con try catch los atrapás y los convertís en respuestas HTTP con el código correspondiente.
    */
    async cancelarPorPaciente(req, res) {
        const { turnoId } = req.params;
        const { pacienteId, motivo } = req.body ?? {};
        try {
            const turno = await this.turnoService.cancelarPorPaciente(turnoId, pacienteId, motivo);
            res.status(200).json({ turno });
        } catch (error) {
            if (error.message === "Turno no encontrado") {
                res.status(404).json({ error: error.message });
            } else {
                res.status(400).json({ error: error.message });
            }
        }
    }

    async cancelarPorMedico(req, res) {
        const { turnoId } = req.params;
        const { medicoId, motivo } = req.body ?? {};
        try {
            const turno = await this.turnoService.cancelarPorMedico(turnoId, medicoId, motivo);
            res.status(200).json({ turno });
        } catch (error) {
            if (error.message === "Turno no encontrado") {
                res.status(404).json({ error: error.message });
            } else {
                res.status(400).json({ error: error.message });
            }
        }
    }

    async cambiarFechaPaciente(req, res) {
        const { turnoId } = req.params;
        const { pacienteId, nuevaFechaHora } = req.body;
        try {
            const turno = await this.turnoService.cambiarFechaPaciente(turnoId, pacienteId, nuevaFechaHora);
            res.status(200).json({ turno });
        } catch (error) {
            if (error.message === "Turno no encontrado") {
                res.status(404).json({ error: error.message });
            } else {
                res.status(400).json({ error: error.message });
            }
        }
    }

    async proponerCambioFechaMedico(req, res) {
        const { turnoId } = req.params;
        const { medicoId, nuevaFechaHora } = req.body;
        try {
            const turno = await this.turnoService.proponerCambioFechaMedico(turnoId, medicoId, nuevaFechaHora);
            res.status(200).json({ turno });
        } catch (error) {
            if (error.message === "Turno no encontrado") {
                res.status(404).json({ error: error.message });
            } else {
                res.status(400).json({ error: error.message });
            }
        }
    }

    async confirmarCambioFechaPaciente(req, res) {
        const { turnoId } = req.params;
        const { pacienteId } = req.body;
        try {
            const turno = await this.turnoService.confirmarCambioFechaPaciente(turnoId, pacienteId);
            res.status(200).json({ turno });
        } catch (error) {
            if (error.message === "Turno no encontrado") {
                res.status(404).json({ error: error.message });
            } else {
                res.status(400).json({ error: error.message });
            }
        }
    }

    async rechazarCambioFechaPaciente(req, res) {
        const { turnoId } = req.params;
        const { pacienteId } = req.body;
        try {
            const turno = await this.turnoService.rechazarCambioFechaPaciente(turnoId, pacienteId);
            res.status(200).json({ turno });
        } catch (error) {
            if (error.message === "Turno no encontrado") {
                res.status(404).json({ error: error.message });
            } else {
                res.status(400).json({ error: error.message });
            }
        }
    }
}
