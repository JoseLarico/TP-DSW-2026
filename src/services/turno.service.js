/*
El service es la capa de lógica de negocio. Recibe pedidos del controller,
hace las validaciones necesarias y coordina las operaciones con el repository.

Para la baja de turno:
- Valida que el turno exista
- Valida que falte más de 60 minutos para el turno (usando dayjs)
- Llama al modelo para actualizar el estado
- Delega el guardado al repository
*/

import { EstadoTurno } from "../enums/estadoTurno.enum.js";
import { TurnoRepository } from "../repositories/turno.repository.js";
import { MedicoRepository } from "../repositories/medico.repository.js";
import { Turno } from "../models/turno.model.js";
import dayjs from "dayjs";

export class TurnoService {
    constructor({ turnoRepository = TurnoRepository.instance(), medicoRepository = MedicoRepository.instance() } = {}) {
        this.turnoRepository = turnoRepository;
        this.medicoRepository = medicoRepository;
    }

    /* 
    El patron singleton dice: de esta clase solo puede existir una única instancia del repository en toda la aplicación 
    El repository es como una base de datos. No querés tener dos bases de datos distintas con datos distintos, querés una sola. El singleton garantiza eso.
    1) this._instance → guarda la instancia creada
    2) ||= → si _instance no existe, la crea con new this(). Si ya existe, la devuelve tal cual
    3) return this._instance → devuelve siempre la misma instancia

    Sin singleton:
    const repo1 = new TurnoRepository() // array con el mock
    const repo2 = new TurnoRepository() // array nuevo, vacío
    // repo1 y repo2 son distintos

    Con singleton:
    const repo1 = TurnoRepository.instance() // array con el mock
    const repo2 = TurnoRepository.instance() // el mismo array
    // repo1 y repo2 son el mismo objeto

    Cuando el service y el controller ambos necesitan el repository. Sin singleton:
    El service hace new TurnoRepository() → crea un array con el mock
    El controller hace new TurnoRepository() → crea otro array diferente
    Entonces si cancelás un turno desde el service, el cambio queda en el array del service, pero el controller ve su propio array sin los cambios.
    */

    static instance() {
        this._instance ||= new TurnoService();
        return this._instance;
    }

    altaTurno(medicoId, paciente, fechaHora, sede, practica) {
        const medico = this.medicoRepository.findById(medicoId);
        if (!medico) throw new Error("Médico no encontrado");

        const fecha = dayjs(fechaHora);
        const diasSemana = ['DOMINGO', 'LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO'];
        const diaSemana = diasSemana[fecha.day()];
        const hora = fecha.format("HH:mm");

        const disponible = medico.disponibilidades.some(d =>
            d.diaSemana === diaSemana &&
            d.horaInicio <= hora &&
            d.horaFin > hora
        );

        if (!disponible) throw new Error("El médico no está disponible en ese horario");

        const turnoExistente = this.turnoRepository.findByMedicoAndFechaHora(medicoId, fechaHora);
        if (turnoExistente) throw new Error("El médico ya tiene un turno asignado en ese horario");

        const nuevoTurno = new Turno(null, medico, paciente, new Date(fechaHora), sede, practica, EstadoTurno.RESERVADO, [], 0);
        return this.turnoRepository.create(nuevoTurno);
    }

    bajaTurno(id, motivo) {
        const turno = this.turnoRepository.findById(id); //Es el id que viene del controller: /turnos/1 -> el controller extrae el id, se lo pasa al service y el service se lo pasa al repository para buscar el turno.
        if (!turno) { //No podemos hacer turno.id === -1 porque findById usa find y éste devuelve undefined si no encontró nada. A diferencia de findByIndex que usa findIndex y éste devuelve -1 si no encontró nada
            throw new Error("Turno no encontrado");
        }
        if (!turno.puedeSerCancelado()) {
            throw new Error("No se puede cancelar el turno con menos de 1 hora de anticipación");
        }

        turno.actualizarEstado(EstadoTurno.CANCELADO, null, motivo); //El motivo viene del controller. Especificamente en el body (json)

        this.turnoRepository.save(turno);
        return turno;
    }

}
