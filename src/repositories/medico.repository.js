import { Medico } from "../models/medico.model.js";

export class MedicoRepository {
    constructor() {
        this.nextId = 1;
        this.medicos = [];
        this.initializeMedicoMock();
    }

initializeMedicoMock() {
    const disponibilidadMock = {
        id: 1,
        diaSemana: "LUNES",
        horaInicio: "08:00",
        horaFin: "12:00"
    };
    const disponibilidadMock2 = {
        id: 2,
        diaSemana: "MARTES",
        horaInicio: "10:00",
        horaFin: "15:00"
    };
    const medicoMock = new Medico(
        1,
        "user1",
        "123",
        "Juan",
        [],
        [],
        [],
        [disponibilidadMock, disponibilidadMock2]
    );

    this.medicos.push(medicoMock);

    if (this.nextId <= 1) {
        this.nextId = 2;
    }

    return medicoMock;
}

    save(medico) {
        if (!medico.id) {
            medico.id = this.nextId++;
            this.medicos.push(medico);
        } else {
            const index = this.medicos.findIndex(m => m.id === medico.id);
            if (index !== -1) {
                this.medicos[index] = medico;
            }
        }
        return medico;
    }

   static instance() {
        this._instance ||= new this();
        return this._instance;
    }

findById(id) {
    return this.medicos.find(m => m.id === Number(id));
}

}