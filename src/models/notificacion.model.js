export class Notificacion {
    constructor(destinatario, remitente, mensaje, fechaHoraCreacion, fechaHoraLeida, leida){
        this.destinatario = destinatario;
        this.remitente = remitente;
        this.mensaje = mensaje;
        this.fechaHoraCreacion = fechaHoraCreacion;
        this.fechaHoraLeida = fechaHoraLeida;
        this.leida = leida;
    }
}