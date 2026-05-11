export class CambioEstadoTurno {
    constructor(fechaHoraIngreso, estado, turno, usuario, motivo = null){ //Decidimos que el motivo de baja de turno sea opcional
        this.fechaHoraIngreso = fechaHoraIngreso;
        this.estado = estado;
        this.turnoId = turno.id;
        this.usuario = usuario;
        this.motivo = motivo;
    }
}