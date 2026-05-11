/* 
Como el enunciado dice que no usen base de datos real, el repository guarda todo en un array en memoria que simula lo que sería una tabla en una base de datos. 

Por qué deberían haber métodos? 
Porque necesitás una forma de interactuar con esos datos, igual que lo harías con una base de datos real. En una base de datos harías queries como SELECT, UPDATE, DELETE. Acá los reemplazás con métodos como:

findById(id) → equivale a SELECT * WHERE id = ?
save(turno) → equivale a INSERT o UPDATE

Tu endpoint necesita buscar el turno y luego actualizarlo, entonces necesitás esos dos métodos como mínimo.
*/ 
import { Turno } from "../models/turno.model.js";
import { EstadoTurno } from "../enums/estadoTurno.enum.js";

export class TurnoRepository {
    constructor() {
        this.turnos = [];
        this.initializeTurnoMock();
    }

    initializeTurnoMock() {
        const turnoMock = new Turno(
            1,
            {id: 1, nombre: "Doctor 1"},
            {id: 1, nombre: "Paciente 1"},
            new Date('2026-04-14T19:30:00-03:00'),
            {id: 1, lugar: "Hospital 1"},
            {id: 1, nombre: "Practica 1"},
            EstadoTurno.CONFIRMADO,
            [],
            10000
        );

        this.turnos.push(turnoMock);
        return turnoMock;
    }

    create(turno) {
        const proximoId = this.turnos.length > 0
            ? Math.max(...this.turnos.map(t => t.id)) + 1
            : 1;
        turno.id = proximoId;
        this.turnos.push(turno);
        return turno;
    }

    save(turno) { // Recibe un turno que ya fue modificado (con estado CANCELADO) y tiene que actualizarlo en el array this.turnos.
        // 1°: Encontrar en qué posición del array está ese turno: el index
        const index = this.turnos.findIndex(t => t.id === turno.id); // Recorre el array y encuentra la posición del turno cuyo id coincida con el id del turno que me pasaron. === es igualdad estricta: 1 === '1' es false porque uno es number y el otro string
        // 2°: Reemplazar el elemento en esa posición con el turno modificado
        if(index !== -1){ // Desigualdad estricta, lo opuesto de ===. "Si el index es distinto de -1, es decir, si lo encontró"
            this.turnos[index] = turno;
        }
        return turno;
    }

    findByMedicoAndFechaHora(medicoId, fechaHora) {
        const fecha = new Date(fechaHora).getTime();
        return this.turnos.find(t =>
            t.medico?.id === Number(medicoId) &&
            new Date(t.fechaHora).getTime() === fecha &&
            t.estado !== EstadoTurno.CANCELADO
        );
    }

    static instance() {
        this._instance ||= new this();
        return this._instance;
    }

    findById(id) { //Recorre el array de turnos y busca coincidir el id del turno que se esta buscando.
        return this.turnos.find(t => t.id === Number(id)); //Number convierte el id que llega desde la URL como string ("1") y en el array es un numero (1). Para que === funcione correctamente.
    }
}

