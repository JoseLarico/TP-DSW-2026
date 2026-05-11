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

    altaTurno(req, res) {
        const { medicoId, paciente, fechaHora, sede, practica } = req.body;
        try {
            const turnoCreado = this.turnoService.altaTurno(medicoId, paciente, fechaHora, sede, practica);
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
    bajaTurno(req, res) {
        const { id } = req.params;
        const { motivo } = req.body;

        try {
            const turnoActualizado = this.turnoService.bajaTurno(id, motivo);
            res.status(200).json({ turno: turnoActualizado });
        } catch (error) {
            if (error.message === "Turno no encontrado") {
                res.status(404).json({ error: error.message });
            } else {
                res.status(400).json({ error: error.message });
            }
        }
    }
}
