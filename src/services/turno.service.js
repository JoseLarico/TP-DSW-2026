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
import { EstadoSolicitudCambio } from "../enums/estadoSolicitudCambio.enum.js";
import { TurnoRepository } from "../repositories/turno.repository.js";
import { MedicoRepository } from "../repositories/medico.repository.js";
import { PacienteRepository } from "../repositories/paciente.repository.js";
import { NotificacionRepository } from "../repositories/notificacion.repository.js";
import { Turno } from "../models/turno.model.js";
import dayjs from "dayjs";

export class TurnoService {
    constructor({ turnoRepository = TurnoRepository.instance(), medicoRepository = MedicoRepository.instance(), pacienteRepository = PacienteRepository.instance(), notificacionRepository = NotificacionRepository.instance() } = {}) {
        this.turnoRepository = turnoRepository;
        this.medicoRepository = medicoRepository;
        this.pacienteRepository = pacienteRepository;
        this.notificacionRepository = notificacionRepository;
    }

    async #usuarioIdDeMedico(medicoId) {
        const medico = await this.medicoRepository.findById(medicoId.toString());
        return medico.usuario._id;
    }

    async #usuarioIdDePaciente(pacienteId) {
        const paciente = await this.pacienteRepository.findById(pacienteId.toString());
        return paciente.usuario._id;
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

    async altaTurno(medicoId, pacienteId, fechaHora, sedeId, especialidadId, practicaId) {
        const medico = await this.medicoRepository.findById(medicoId);

        if (especialidadId && !medico.especialidades.some(e => e._id.toString() === especialidadId)) {
            throw new Error("El médico no tiene esa especialidad");
        }
        if (practicaId && !medico.practicas.some(p => p._id.toString() === practicaId)) {
            throw new Error("El médico no tiene esa práctica");
        }
        if (sedeId && !medico.sedes.some(s => s._id.toString() === sedeId)) {
            throw new Error("El médico no atiende en esa sede");
        }

        const fecha = dayjs(fechaHora);
        if (fecha.isBefore(dayjs())) throw new Error("No se puede reservar un turno en una fecha pasada");

        if (!this.medicoEstaDisponible(medico, fecha)) throw new Error("El médico no está disponible en ese horario");

        const turnoExistente = await this.turnoRepository.findByMedicoAndFechaHora(medicoId, fechaHora);
        if (turnoExistente) throw new Error("El médico ya tiene un turno asignado en ese horario");

        const nuevoTurno = new Turno(medicoId, pacienteId, new Date(fechaHora), sedeId, especialidadId, practicaId, EstadoTurno.RESERVADO, [], 0);
        return await this.turnoRepository.create(nuevoTurno);
    }

    medicoEstaDisponible(medico, fecha) {
        const diasSemana = ['DOMINGO', 'LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO'];
        const diaSemana = diasSemana[fecha.day()];
        const hora = fecha.format("HH:mm");
        return medico.disponibilidades.some(d =>
            d.diaSemana === diaSemana &&
            d.horaInicio <= hora &&
            d.horaFin > hora
        );
    }

    async cambiarFechaPaciente(turnoId, pacienteId, nuevaFechaHora) {
        const turno = await this.turnoRepository.findById(turnoId);
        if (turno.paciente.toString() !== pacienteId) throw new Error("El paciente no pertenece a este turno");
        if (turno.estado !== EstadoTurno.RESERVADO) throw new Error("Solo se puede cambiar un turno reservado");
        if (dayjs(turno.fechaHora).diff(dayjs(), 'minute') <= 60) throw new Error("No se puede cambiar el turno con menos de 1 hora de anticipación");

        const fecha = dayjs(nuevaFechaHora);
        if (fecha.isBefore(dayjs())) throw new Error("La nueva fecha debe ser futura");

        const medico = await this.medicoRepository.findById(turno.medico);
        if (!this.medicoEstaDisponible(medico, fecha)) throw new Error("El médico no está disponible en ese horario");

        const turnoConflicto = await this.turnoRepository.findByMedicoAndFechaHora(turno.medico, nuevaFechaHora);
        if (turnoConflicto && turnoConflicto._id.toString() !== turnoId) throw new Error("El médico ya tiene un turno en ese horario");

        const fechaOriginal = turno.fechaHora;
        turno.fechaHora = new Date(nuevaFechaHora);
        const turnoActualizado = await this.turnoRepository.save(turno);

        await this.notificacionRepository.create({
            destinatario: medico.usuario._id,
            remitente: await this.#usuarioIdDePaciente(turno.paciente),
            mensaje: `El paciente cambió el turno del ${dayjs(fechaOriginal).format("DD/MM/YYYY HH:mm")} al ${fecha.format("DD/MM/YYYY HH:mm")}`,
            fechaHoraCreacion: new Date()
        });

        return turnoActualizado;
    }

    async proponerCambioFechaMedico(turnoId, medicoId, nuevaFechaHora) {
        const turno = await this.turnoRepository.findById(turnoId);
        if (turno.medico.toString() !== medicoId) throw new Error("El médico no pertenece a este turno");
        if (turno.estado !== EstadoTurno.RESERVADO) throw new Error("Solo se puede solicitar cambio en turnos reservados");
        if (turno.solicitudCambioFecha?.estado === EstadoSolicitudCambio.PENDIENTE) throw new Error("Ya existe una solicitud de cambio pendiente");

        const fecha = dayjs(nuevaFechaHora);
        if (fecha.isBefore(dayjs())) throw new Error("La nueva fecha debe ser futura");

        const medico = await this.medicoRepository.findById(medicoId);
        if (!this.medicoEstaDisponible(medico, fecha)) throw new Error("El médico no está disponible en ese horario");

        const turnoConflicto = await this.turnoRepository.findByMedicoAndFechaHora(medicoId, nuevaFechaHora);
        if (turnoConflicto && turnoConflicto._id.toString() !== turnoId) throw new Error("El médico ya tiene un turno en ese horario");

        turno.solicitudCambioFecha = {
            nuevaFechaHora: new Date(nuevaFechaHora),
            solicitante: 'MEDICO',
            estado: EstadoSolicitudCambio.PENDIENTE
        };
        const turnoActualizado = await this.turnoRepository.save(turno);

        await this.notificacionRepository.create({
            destinatario: await this.#usuarioIdDePaciente(turno.paciente),
            remitente: medico.usuario._id,
            mensaje: `El médico propone cambiar el turno del ${dayjs(turno.fechaHora).format("DD/MM/YYYY HH:mm")} al ${fecha.format("DD/MM/YYYY HH:mm")}`,
            fechaHoraCreacion: new Date()
        });

        return turnoActualizado;
    }

    async confirmarCambioFechaPaciente(turnoId, pacienteId) {
        const turno = await this.turnoRepository.findById(turnoId);
        if (!turno.solicitudCambioFecha || turno.solicitudCambioFecha.estado !== EstadoSolicitudCambio.PENDIENTE) {
            throw new Error("No hay solicitud de cambio pendiente");
        }
        if (turno.paciente.toString() !== pacienteId) throw new Error("El paciente no pertenece a este turno");
        if (turno.solicitudCambioFecha.solicitante !== 'MEDICO') throw new Error("No hay propuesta del médico pendiente de confirmación");

        const nuevaFecha = dayjs(turno.solicitudCambioFecha.nuevaFechaHora);
        const medico = await this.medicoRepository.findById(turno.medico);
        if (!this.medicoEstaDisponible(medico, nuevaFecha)) throw new Error("El médico ya no está disponible en ese horario");

        const turnoConflicto = await this.turnoRepository.findByMedicoAndFechaHora(turno.medico, turno.solicitudCambioFecha.nuevaFechaHora);
        if (turnoConflicto && turnoConflicto._id.toString() !== turnoId) throw new Error("El médico ya tiene un turno en ese horario");

        const fechaOriginal = turno.fechaHora;
        turno.fechaHora = turno.solicitudCambioFecha.nuevaFechaHora;
        turno.solicitudCambioFecha.estado = EstadoSolicitudCambio.CONFIRMADA;
        const turnoActualizado = await this.turnoRepository.save(turno);

        await this.notificacionRepository.create({
            destinatario: medico.usuario._id,
            remitente: await this.#usuarioIdDePaciente(turno.paciente),
            mensaje: `El paciente confirmó el cambio de fecha del turno del ${dayjs(fechaOriginal).format("DD/MM/YYYY HH:mm")} al ${nuevaFecha.format("DD/MM/YYYY HH:mm")}`,
            fechaHoraCreacion: new Date()
        });

        return turnoActualizado;
    }

    async rechazarCambioFechaPaciente(turnoId, pacienteId) {
        const turno = await this.turnoRepository.findById(turnoId);
        if (!turno.solicitudCambioFecha || turno.solicitudCambioFecha.estado !== EstadoSolicitudCambio.PENDIENTE) {
            throw new Error("No hay solicitud de cambio pendiente");
        }
        if (turno.paciente.toString() !== pacienteId) throw new Error("El paciente no pertenece a este turno");
        if (turno.solicitudCambioFecha.solicitante !== 'MEDICO') throw new Error("No hay propuesta del médico pendiente de confirmación");

        turno.solicitudCambioFecha.estado = EstadoSolicitudCambio.RECHAZADA;
        const turnoActualizado = await this.turnoRepository.save(turno);

        await this.notificacionRepository.create({
            destinatario: await this.#usuarioIdDeMedico(turno.medico),
            remitente: await this.#usuarioIdDePaciente(turno.paciente),
            mensaje: `El paciente rechazó la propuesta de cambio de fecha del turno del ${dayjs(turno.fechaHora).format("DD/MM/YYYY HH:mm")}`,
            fechaHoraCreacion: new Date()
        });

        return turnoActualizado;
    }

    async historialPorPaciente(pacienteId, medicoId = null) {
        return await this.turnoRepository.findByPaciente(pacienteId, medicoId);
    }

    async historialPorMedico(medicoId) {
        return await this.turnoRepository.findByMedico(medicoId);
    }

    async cancelarPorPaciente(turnoId, pacienteId, motivo) {
        const turno = await this.turnoRepository.findById(turnoId);
        if (turno.paciente.toString() !== pacienteId) throw new Error("El paciente no pertenece a este turno");
        await this.#cancelar(turno, motivo);
        await this.notificacionRepository.create({
            destinatario: await this.#usuarioIdDeMedico(turno.medico),
            remitente: await this.#usuarioIdDePaciente(pacienteId),
            mensaje: `El paciente canceló el turno del ${dayjs(turno.fechaHora).format("DD/MM/YYYY HH:mm")}. Motivo: ${motivo ?? "sin motivo"}`,
            fechaHoraCreacion: new Date()
        });
        return turno;
    }

    async cancelarPorMedico(turnoId, medicoId, motivo) {
        const turno = await this.turnoRepository.findById(turnoId);
        if (turno.medico.toString() !== medicoId) throw new Error("El médico no pertenece a este turno");
        await this.#cancelar(turno, motivo);
        await this.notificacionRepository.create({
            destinatario: await this.#usuarioIdDePaciente(turno.paciente),
            remitente: await this.#usuarioIdDeMedico(medicoId),
            mensaje: `El médico canceló el turno del ${dayjs(turno.fechaHora).format("DD/MM/YYYY HH:mm")}. Motivo: ${motivo ?? "sin motivo"}`,
            fechaHoraCreacion: new Date()
        });
        return turno;
    }

    async #cancelar(turno, motivo) {
        if (turno.estado === EstadoTurno.CANCELADO) {
            throw new Error("El turno ya se encuentra cancelado");
        }
        if (dayjs(turno.fechaHora).diff(dayjs(), 'minute') <= 60) {
            throw new Error("No se puede cancelar el turno con menos de 1 hora de anticipación");
        }
        turno.estado = EstadoTurno.CANCELADO;
        turno.historialEstados?.push({ fechaHoraIngreso: new Date(), estado: EstadoTurno.CANCELADO, motivo });
        await this.turnoRepository.save(turno);
    }

}
