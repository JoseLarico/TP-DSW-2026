export class Medico {

    constructor(usuario, matricula, nombre, especialidades, practicas,
        sedes, disponibilidades) {
        this.usuario = usuario;
        this.matricula = matricula;
        this.nombre = nombre;
        this.especialidades = especialidades;
        this.practicas = practicas;
        this.sedes = sedes;
        this.disponibilidades = disponibilidades;
    }

    eliminarDisponibilidad (disponibilidadId) {
        this.disponibilidades = this.disponibilidades.filter(d => d._id.toString() !== disponibilidadId);
    }

}