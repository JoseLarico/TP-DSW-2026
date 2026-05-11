export class Medico {

    constructor(id, usuario,matricula, nombre, especialidades, practicas, 
        sedes, disponibilidades) {
        this.id = id;
        this.usuario = usuario;
        this.matricula = matricula;
        this.nombre = nombre;
        this.especialidades = especialidades;
        this.practicas = practicas;
        this.sedes = sedes;
        this.disponibilidades = disponibilidades;
    }

    eliminarDisponibilidad (disponibilidadId) {
        this.disponibilidades = this.disponibilidades.filter(d => d.id !== disponibilidadId);
    }

}