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
import { ValidationError, ConflictError } from "../error/appError.js";
import dayjs from "dayjs";

const fmtAR = (date) => {
    const d = new Date(date);
    const opts = { timeZone: 'America/Argentina/Buenos_Aires' };
    const fecha = d.toLocaleDateString('es-AR', { ...opts, day: '2-digit', month: '2-digit', year: 'numeric' });
    const hora  = d.toLocaleTimeString('es-AR', { ...opts, hour: '2-digit', minute: '2-digit', hour12: false });
    return `${fecha} ${hora}`;
};

export class TurnoService {
    constructor({
        turnoRepository = TurnoRepository.instance(),
        medicoRepository = MedicoRepository.instance(),
        pacienteRepository = PacienteRepository.instance(),
        notificacionRepository = NotificacionRepository.instance()
    } = {}) {
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

    async altaTurno(turnoId, pacienteId) {
        const turno = await this.turnoRepository.findById(turnoId);
        if (turno.estado !== EstadoTurno.DISPONIBLE) throw new ValidationError("El turno no está disponible");

        await this.pacienteRepository.findById(pacienteId);

        turno.paciente = pacienteId;
        turno.estado = EstadoTurno.RESERVADO;

        const turnoGuardado = await this.turnoRepository.save(turno);
        await this.turnoRepository.deleteDisponiblesByMedicoAndFechaHora(turno.medico, turno.fechaHora);

        await this.notificacionRepository.create({
            destinatario: await this.#usuarioIdDeMedico(turno.medico),
            remitente: await this.#usuarioIdDePaciente(pacienteId),
            mensaje: `El paciente reservó el turno del ${fmtAR(turno.fechaHora)}`,
            fechaHoraCreacion: new Date()
        });

        return turnoGuardado;
    }

    async altaMultipleTurnos(turnoIds, pacienteId) {
        const resultados = await Promise.allSettled(
            turnoIds.map(turnoId => this.altaTurno(turnoId, pacienteId))
        );

        return turnoIds.map((turnoId, i) => {
            const r = resultados[i];
            if (r.status === 'fulfilled') return { turnoId, ok: true, turno: r.value };
            return { turnoId, ok: false, error: r.reason.message };
        });
    }

    async cambiarFechaPaciente(turnoId, pacienteId, nuevoTurnoId) {
        const turno = await this.turnoRepository.findById(turnoId);
        if (turno.paciente.toString() !== pacienteId) throw new ValidationError("El paciente no pertenece a este turno");
        if (turno.estado !== EstadoTurno.RESERVADO) throw new ValidationError("Solo se puede cambiar un turno reservado");
        if (dayjs(turno.fechaHora).diff(dayjs(), 'minute') <= 60) throw new ValidationError("No se puede cambiar el turno con menos de 1 hora de anticipación");

        const turnoNuevo = await this.turnoRepository.findById(nuevoTurnoId);
        if (turnoNuevo.estado !== EstadoTurno.DISPONIBLE) throw new ValidationError("El turno seleccionado no está disponible");
        if (dayjs(turnoNuevo.fechaHora).isBefore(dayjs())) throw new ValidationError("La nueva fecha debe ser futura");

        const medico = await this.medicoRepository.findById(turno.medico);
        const fechaOriginal = turno.fechaHora;
        const turnoActualizado = await this.turnoRepository.saveFechaAndClearSolicitud(turnoId, turnoNuevo.fechaHora);
        await this.turnoRepository.deleteDisponiblesByMedicoAndFechaHora(turno.medico, turnoNuevo.fechaHora);

        // Restaurar el slot original como disponible
        await this.turnoRepository.create({
            medico: turno.medico,
            fechaHora: fechaOriginal,
            sede: turno.sede,
            especialidad: turno.especialidad,
            practica: turno.practica,
            costo: turno.costo,
            estado: EstadoTurno.DISPONIBLE,
            historialEstados: [{ fechaHoraIngreso: new Date(), estado: EstadoTurno.DISPONIBLE }]
        });

        await this.notificacionRepository.create({
            destinatario: medico.usuario._id,
            remitente: await this.#usuarioIdDePaciente(turno.paciente),
            mensaje: `El paciente cambió el turno del ${fmtAR(fechaOriginal)} al ${fmtAR(turnoNuevo.fechaHora)}`,
            fechaHoraCreacion: new Date()
        });

        return turnoActualizado;
    }

    async proponerCambioFechaMedico(turnoId, nuevoTurnoId) {
        const turno = await this.turnoRepository.findById(turnoId);
        if (turno.estado !== EstadoTurno.RESERVADO) throw new ValidationError("Solo se puede solicitar cambio en turnos reservados");
        if (turno.solicitudCambioFecha?.estado === EstadoSolicitudCambio.PENDIENTE) throw new ValidationError("Ya existe una solicitud de cambio pendiente");

        const turnoNuevo = await this.turnoRepository.findById(nuevoTurnoId);
        if (turnoNuevo.estado !== EstadoTurno.DISPONIBLE) throw new ValidationError("El turno seleccionado no está disponible");
        if (dayjs(turnoNuevo.fechaHora).isBefore(dayjs())) throw new ValidationError("La nueva fecha debe ser futura");

        const medico = await this.medicoRepository.findById(turno.medico);
        turno.solicitudCambioFecha = {
            nuevaFechaHora: turnoNuevo.fechaHora,
            solicitante: 'MEDICO',
            estado: EstadoSolicitudCambio.PENDIENTE
        };
        const turnoActualizado = await this.turnoRepository.save(turno);

        await this.notificacionRepository.create({
            destinatario: await this.#usuarioIdDePaciente(turno.paciente),
            remitente: medico.usuario._id,
            mensaje: `El médico propone cambiar el turno del ${fmtAR(turno.fechaHora)} al ${fmtAR(turnoNuevo.fechaHora)}`,
            fechaHoraCreacion: new Date()
        });

        return turnoActualizado;
    }

    async confirmarCambioFechaPaciente(turnoId, pacienteId) {
        const turno = await this.turnoRepository.findById(turnoId);
        if (!turno.solicitudCambioFecha || turno.solicitudCambioFecha.estado !== EstadoSolicitudCambio.PENDIENTE) {
            throw new ValidationError("No hay solicitud de cambio pendiente");
        }
        if (turno.paciente.toString() !== pacienteId) throw new ValidationError("El paciente no pertenece a este turno");
        if (turno.solicitudCambioFecha.solicitante !== 'MEDICO') throw new ValidationError("No hay propuesta del médico pendiente de confirmación");

        const nuevaFecha = dayjs(turno.solicitudCambioFecha.nuevaFechaHora);
        const nuevaFechaHora = turno.solicitudCambioFecha.nuevaFechaHora;

        const turnoDisponible = await this.turnoRepository.findDisponibleByMedicoAndFechaHora(turno.medico, nuevaFechaHora);
        if (!turnoDisponible) throw new ValidationError("El médico ya no está disponible en ese horario");

        const medico = await this.medicoRepository.findById(turno.medico);
        const fechaOriginal = turno.fechaHora;
        turno.fechaHora = nuevaFechaHora;
        turno.solicitudCambioFecha.estado = EstadoSolicitudCambio.CONFIRMADA;
        const turnoActualizado = await this.turnoRepository.save(turno);
        await this.turnoRepository.deleteDisponiblesByMedicoAndFechaHora(turno.medico, nuevaFechaHora);

        // Restaurar el slot original como disponible
        await this.turnoRepository.create({
            medico: turno.medico,
            fechaHora: fechaOriginal,
            sede: turno.sede,
            especialidad: turno.especialidad,
            practica: turno.practica,
            costo: turno.costo,
            estado: EstadoTurno.DISPONIBLE,
            historialEstados: [{ fechaHoraIngreso: new Date(), estado: EstadoTurno.DISPONIBLE }]
        });

        await this.notificacionRepository.create({
            destinatario: medico.usuario._id,
            remitente: await this.#usuarioIdDePaciente(turno.paciente),
            mensaje: `El paciente confirmó el cambio de fecha del turno del ${fmtAR(fechaOriginal)} al ${fmtAR(nuevaFecha.toDate())}`,
            fechaHoraCreacion: new Date()
        });

        return turnoActualizado;
    }

    async rechazarCambioFechaPaciente(turnoId, pacienteId) {
        const turno = await this.turnoRepository.findById(turnoId);
        if (!turno.solicitudCambioFecha || turno.solicitudCambioFecha.estado !== EstadoSolicitudCambio.PENDIENTE) {
            throw new ValidationError("No hay solicitud de cambio pendiente");
        }
        if (turno.paciente.toString() !== pacienteId) throw new ValidationError("El paciente no pertenece a este turno");
        if (turno.solicitudCambioFecha.solicitante !== 'MEDICO') throw new ValidationError("No hay propuesta del médico pendiente de confirmación");

        turno.solicitudCambioFecha.estado = EstadoSolicitudCambio.RECHAZADA;
        const turnoActualizado = await this.turnoRepository.save(turno);

        await this.notificacionRepository.create({
            destinatario: await this.#usuarioIdDeMedico(turno.medico),
            remitente: await this.#usuarioIdDePaciente(turno.paciente),
            mensaje: `El paciente rechazó la propuesta de cambio de fecha del turno del ${fmtAR(turno.fechaHora)}`,
            fechaHoraCreacion: new Date()
        });

        return turnoActualizado;
    }

    async consultarDisponibilidad(medicoId, { especialidadId, practicaId, fechaDesde, fechaHasta, page, limit }) {
        const medico = await this.medicoRepository.findById(medicoId);
        if (especialidadId && !medico.especialidades.some(e => e._id.toString() === especialidadId)) {
            throw new ValidationError('El médico no tiene esa especialidad');
        }
        if (practicaId && !medico.practicas.some(p => p._id.toString() === practicaId)) {
            throw new ValidationError('El médico no tiene esa práctica');
        }
        return await this.turnoRepository.buscarDisponibles({ medicoId, especialidadId, practicaId, fechaDesde, fechaHasta, page, limit });
    }

    async marcarRealizado(turnoId) {
        const turno = await this.turnoRepository.findById(turnoId);
        if (turno.estado !== EstadoTurno.RESERVADO) throw new ValidationError("Solo se puede marcar como realizado un turno reservado");
        turno.estado = EstadoTurno.REALIZADO;
        turno.historialEstados?.push({ fechaHoraIngreso: new Date(), estado: EstadoTurno.REALIZADO });
        return await this.turnoRepository.save(turno);
    }

    async historialPorPaciente(pacienteId, medicoId = null) {
        return await this.turnoRepository.findByPaciente(pacienteId, medicoId);
    }

    async historialPorMedico(medicoId) {
        return await this.turnoRepository.findByMedico(medicoId);
    }

    async cancelarPorPaciente(turnoId, pacienteId, motivo) {
        const turno = await this.turnoRepository.findById(turnoId);
        if (turno.paciente.toString() !== pacienteId) throw new ValidationError("El paciente no pertenece a este turno");
        await this.#cancelar(turno, motivo);
        await this.notificacionRepository.create({
            destinatario: await this.#usuarioIdDeMedico(turno.medico),
            remitente: await this.#usuarioIdDePaciente(pacienteId),
            mensaje: `El paciente canceló el turno del ${fmtAR(turno.fechaHora)}. Motivo: ${motivo ?? "sin motivo"}`,
            fechaHoraCreacion: new Date()
        });
        return turno;
    }

    async cancelarPorMedico(turnoId, medicoId, motivo) {
        const turno = await this.turnoRepository.findById(turnoId);
        if (turno.medico.toString() !== medicoId) throw new ValidationError("El médico no pertenece a este turno");
        await this.#cancelar(turno, motivo);
        await this.notificacionRepository.create({
            destinatario: await this.#usuarioIdDePaciente(turno.paciente),
            remitente: await this.#usuarioIdDeMedico(medicoId),
            mensaje: `El médico canceló el turno del ${fmtAR(turno.fechaHora)}. Motivo: ${motivo ?? "sin motivo"}`,
            fechaHoraCreacion: new Date()
        });
        return turno;
    }

    async #cancelar(turno, motivo) {
        if (turno.estado === EstadoTurno.CANCELADO) {
            throw new ValidationError("El turno ya se encuentra cancelado");
        }
        if (dayjs(turno.fechaHora).diff(dayjs(), 'minute') <= 60) {
            throw new ValidationError("No se puede cancelar el turno con menos de 1 hora de anticipación");
        }
        turno.estado = EstadoTurno.CANCELADO;
        turno.historialEstados?.push({ fechaHoraIngreso: new Date(), estado: EstadoTurno.CANCELADO, motivo });
        await this.turnoRepository.save(turno);
    }

}
