import dayjs from 'dayjs';
import { TurnoRepository } from '../repositories/turno.repository.js';
import { Turno } from '../models/turno.model.js';
import { EstadoTurno } from '../enums/estadoTurno.enum.js';
import { DisponibilidadHoraria } from '../models/disponibilidadHoraria.model.js';
import { ConflictError } from '../error/appError.js';

const DIAS_SEMANA = ['DOMINGO', 'LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO'];
const HORIZONTE_DIAS = 30;

export class Agenda {
    constructor({ turnoRepository = TurnoRepository.instance() } = {}) {
        this.turnoRepository = turnoRepository;
    }

    static instance() {
        this._instance ||= new Agenda();
        return this._instance;
    }

    async crearAgenda(medico, servicio, sedeId, disponibilidad) {
        new DisponibilidadHoraria(disponibilidad.diaSemana, disponibilidad.horaInicio, disponibilidad.horaFin);
        return await this.generarTurnosPara(servicio, medico, sedeId, disponibilidad);
    }

    async generarTurnosPara(servicio, medico, sedeId, disponibilidad) {
        const esEspecialidad = 'costoConsulta' in servicio;
        const especialidadId = esEspecialidad ? servicio._id : null;
        const practicaId = esEspecialidad ? null : servicio._id;
        const costo = esEspecialidad ? (servicio.costoConsulta ?? 0) : (servicio.costo ?? 0);
        const duracion = servicio.duracionTurnoEnMins ?? 30;

        const slots = this.#generarSlots(disponibilidad, duracion);

        for (const slot of slots) {
            const existente = await this.turnoRepository.findDisponibleByMedicoAndFechaHora(medico._id, slot.toDate());
            if (existente) throw new ConflictError('Ya existe una agenda con horario solapado para ese médico');
        }

        const turnos = [];
        for (const slot of slots) {
            const turno = new Turno(
                medico._id, null, slot.toDate(),
                sedeId, especialidadId, practicaId,
                EstadoTurno.DISPONIBLE, [], costo
            );
            turnos.push(await this.turnoRepository.create(turno));
        }
        return turnos;
    }

    #generarSlots(disponibilidad, duracionMins) {
        const slots = [];
        const ahora = dayjs();
        const horizonte = disponibilidad.fechaFin
            ? dayjs(disponibilidad.fechaFin).endOf('day')
            : ahora.add(HORIZONTE_DIAS, 'day').endOf('day');
        let fecha = ahora.startOf('day');

        while (fecha.valueOf() <= horizonte.valueOf()) {
            if (DIAS_SEMANA[fecha.day()] === disponibilidad.diaSemana) {
                const [hInicio, mInicio] = disponibilidad.horaInicio.split(':').map(Number);
                const [hFin, mFin] = disponibilidad.horaFin.split(':').map(Number);
                let slot = fecha.hour(hInicio).minute(mInicio).second(0).millisecond(0);
                const fin = fecha.hour(hFin).minute(mFin).second(0).millisecond(0);
                while (slot.add(duracionMins, 'minute').valueOf() <= fin.valueOf()) {
                    if (slot.valueOf() > ahora.valueOf()) slots.push(slot);
                    slot = slot.add(duracionMins, 'minute');
                }
            }
            fecha = fecha.add(1, 'day');
        }
        return slots;
    }
}
