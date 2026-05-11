import { CambioEstadoTurno } from "./cambioEstadoTurno.model.js";
import dayjs from "dayjs";

export class Turno {
    constructor(medico, paciente, fechaHora, sede, especialidad, practica, estado, historialEstados, costo) {
        this.medico = medico;
        this.paciente = paciente;
        this.fechaHora = fechaHora;
        this.sede = sede;
        this.especialidad = especialidad;
        this.practica = practica;
        this.estado = estado;
        this.historialEstados = historialEstados;
        this.costo = costo;
    }

    puedeSerCancelado(){
        return dayjs(this.fechaHora).diff(dayjs(), 'minute') > 60;
    }

    actualizarEstado(nuevoEstado, quien, motivo) {
        this.estado = nuevoEstado;
        this.historialEstados.push(new CambioEstadoTurno(new Date(), nuevoEstado, this, quien, motivo))      
    }
}