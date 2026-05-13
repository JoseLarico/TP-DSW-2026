import { TurnoService } from "../src/services/turno.service.js"
import { describe, expect, test, beforeEach, jest } from '@jest/globals';
import { Turno } from "../src/models/turno.model.js";
import { EstadoTurno } from "../src/enums/estadoTurno.enum.js";
import dayjs from "dayjs";
/*
describe: agrupa tests relacionados. Es como una carpeta. Por ejemplo describe("TurnoService") agrupa todos los tests del service.
test: es un caso de prueba específico. Por ejemplo test("si el turno no existe tira error 404").
expect: es la aserción, lo que verificás. Por ejemplo expect(res.status).toBe(404) dice "espero que el status sea 404".
beforeEach: se ejecuta antes de cada test. Se usa para preparar el estado inicial, por ejemplo crear una nueva instancia del service antes de cada test para que no se pisen entre sí.
*/

describe("Turno Service", () => {

    let turnoService;

    beforeEach(() => {
        turnoService = new TurnoService();
    })

    /*
    En un test unitario del service, vos simulás lo que haría el repository. En lugar de usar el repository real con sus datos mockeados, le decís a Jest "cuando alguien llame a findById, devolvé esto".
    El flujo es:

    Vos llamás a turnoService.bajaTurno(id, motivo) en el test
    Adentro del service, ese método llama a turnoRepository.findById(id)
    En lugar de ejecutar el repository real, Jest intercepta esa llamada y devuelve lo que vos le dijiste

    Entonces los tres casos son tres escenarios distintos que vos controlás:

    Caso 1: le decís al repository que rechace la Promise → simulás que el turno no existe
    Caso 2: le decís que devuelva un turno con fecha en menos de 1 hora → simulás que no se puede cancelar
    Caso 3: le decís que devuelva un turno válido → simulás el caso exitoso
    */
    describe('altaTurno', () => {
        test('Si el turno no existe entonces devuelve error', async () => {
            turnoService.turnoRepository.findById = jest.fn().mockRejectedValue(new Error("Turno no encontrado"));
            await expect(turnoService.altaTurno("turnoId", "pacienteId")).rejects.toThrow("Turno no encontrado");
        })

        test('Si el turno no está disponible entonces devuelve error', async () => {
            const turnoReservado = { medico: "medicoId", fechaHora: new Date("2026-04-20T10:00:00"), estado: EstadoTurno.RESERVADO };
            turnoService.turnoRepository.findById = jest.fn().mockResolvedValue(turnoReservado);
            await expect(turnoService.altaTurno("turnoId", "pacienteId")).rejects.toThrow("El turno no está disponible");
        })

        test('Si el turno está disponible se reserva exitosamente', async () => {
            const turnoDisponible = { medico: "medicoId", fechaHora: new Date("2026-04-20T10:00:00"), estado: EstadoTurno.DISPONIBLE };
            turnoService.turnoRepository.findById = jest.fn().mockResolvedValue(turnoDisponible);
            turnoService.turnoRepository.save = jest.fn().mockImplementation(t => Promise.resolve(t));
            turnoService.turnoRepository.deleteDisponiblesByMedicoAndFechaHora = jest.fn().mockResolvedValue();
            turnoService.pacienteRepository.findById = jest.fn().mockResolvedValue({ _id: "pacienteId" });
            const resultado = await turnoService.altaTurno("turnoId", "pacienteId");
            expect(resultado.estado).toBe(EstadoTurno.RESERVADO);
            expect(resultado.paciente).toBe("pacienteId");
        })
    })

    describe('marcarRealizado', () => {
        test('Si el turno no existe entonces devuelve error', async () => {
            turnoService.turnoRepository.findById = jest.fn().mockRejectedValue(new Error("Turno no encontrado"));
            await expect(turnoService.marcarRealizado("turnoId")).rejects.toThrow("Turno no encontrado");
        });

        test('Si el turno no está reservado entonces devuelve error', async () => {
            const turno = { estado: EstadoTurno.CANCELADO, historialEstados: [] };
            turnoService.turnoRepository.findById = jest.fn().mockResolvedValue(turno);
            await expect(turnoService.marcarRealizado("turnoId")).rejects.toThrow("Solo se puede marcar como realizado un turno reservado");
        });

        test('Si el turno está reservado lo marca como realizado', async () => {
            const turno = { estado: EstadoTurno.RESERVADO, historialEstados: [] };
            turnoService.turnoRepository.findById = jest.fn().mockResolvedValue(turno);
            turnoService.turnoRepository.save = jest.fn().mockImplementation(t => Promise.resolve(t));
            const resultado = await turnoService.marcarRealizado("turnoId");
            expect(resultado.estado).toBe(EstadoTurno.REALIZADO);
        });
    });

    describe('cambiarFechaPaciente', () => {
        test('Si el paciente no pertenece al turno entonces devuelve error', async () => {
            const turno = { paciente: { toString: () => "otroPaciente" }, estado: EstadoTurno.RESERVADO, fechaHora: dayjs().add(90, 'minute').toDate() };
            turnoService.turnoRepository.findById = jest.fn().mockResolvedValue(turno);
            await expect(turnoService.cambiarFechaPaciente("turnoId", "pacienteId", "nuevoTurnoId")).rejects.toThrow("El paciente no pertenece a este turno");
        });

        test('Si el turno no está reservado entonces devuelve error', async () => {
            const turno = { paciente: { toString: () => "pacienteId" }, estado: EstadoTurno.CANCELADO, fechaHora: dayjs().add(90, 'minute').toDate() };
            turnoService.turnoRepository.findById = jest.fn().mockResolvedValue(turno);
            await expect(turnoService.cambiarFechaPaciente("turnoId", "pacienteId", "nuevoTurnoId")).rejects.toThrow("Solo se puede cambiar un turno reservado");
        });

        test('Si faltan menos de 60 minutos entonces devuelve error', async () => {
            const turno = { paciente: { toString: () => "pacienteId" }, estado: EstadoTurno.RESERVADO, fechaHora: dayjs().add(30, 'minute').toDate() };
            turnoService.turnoRepository.findById = jest.fn().mockResolvedValue(turno);
            await expect(turnoService.cambiarFechaPaciente("turnoId", "pacienteId", "nuevoTurnoId")).rejects.toThrow("No se puede cambiar el turno con menos de 1 hora de anticipación");
        });

        test('Si el nuevo turno no está disponible entonces devuelve error', async () => {
            const turno = { paciente: { toString: () => "pacienteId" }, estado: EstadoTurno.RESERVADO, fechaHora: dayjs().add(90, 'minute').toDate(), medico: "medicoId" };
            const turnoNuevo = { estado: EstadoTurno.RESERVADO, fechaHora: dayjs().add(2, 'day').toDate() };
            turnoService.turnoRepository.findById = jest.fn()
                .mockResolvedValueOnce(turno)
                .mockResolvedValueOnce(turnoNuevo);
            await expect(turnoService.cambiarFechaPaciente("turnoId", "pacienteId", "nuevoTurnoId")).rejects.toThrow("El turno seleccionado no está disponible");
        });

        test('Si los datos son válidos cambia la fecha y notifica al médico', async () => {
            const turno = { paciente: { toString: () => "pacienteId" }, estado: EstadoTurno.RESERVADO, fechaHora: dayjs().add(90, 'minute').toDate(), medico: "medicoId" };
            const turnoNuevo = { estado: EstadoTurno.DISPONIBLE, fechaHora: dayjs().add(2, 'day').toDate() };
            turnoService.turnoRepository.findById = jest.fn()
                .mockResolvedValueOnce(turno)
                .mockResolvedValueOnce(turnoNuevo);
            turnoService.turnoRepository.save = jest.fn().mockImplementation(t => Promise.resolve(t));
            turnoService.turnoRepository.deleteDisponiblesByMedicoAndFechaHora = jest.fn().mockResolvedValue();
            turnoService.medicoRepository.findById = jest.fn().mockResolvedValue({ usuario: { _id: "usuarioMedicoId" } });
            turnoService.pacienteRepository.findById = jest.fn().mockResolvedValue({ usuario: { _id: "usuarioPacienteId" } });
            turnoService.notificacionRepository.create = jest.fn().mockResolvedValue({});
            await turnoService.cambiarFechaPaciente("turnoId", "pacienteId", "nuevoTurnoId");
            expect(turnoService.notificacionRepository.create).toHaveBeenCalledWith(expect.objectContaining({ destinatario: "usuarioMedicoId" }));
        });
    });

    describe('proponerCambioFechaMedico', () => {
        test('Si el turno no está reservado entonces devuelve error', async () => {
            const turno = { medico: { toString: () => "medicoId" }, estado: EstadoTurno.CANCELADO, solicitudCambioFecha: null };
            turnoService.turnoRepository.findById = jest.fn().mockResolvedValue(turno);
            await expect(turnoService.proponerCambioFechaMedico("turnoId", "nuevoTurnoId")).rejects.toThrow("Solo se puede solicitar cambio en turnos reservados");
        });

        test('Si ya existe una solicitud pendiente entonces devuelve error', async () => {
            const turno = { medico: { toString: () => "medicoId" }, estado: EstadoTurno.RESERVADO, solicitudCambioFecha: { estado: 'PENDIENTE' } };
            turnoService.turnoRepository.findById = jest.fn().mockResolvedValue(turno);
            await expect(turnoService.proponerCambioFechaMedico("turnoId", "nuevoTurnoId")).rejects.toThrow("Ya existe una solicitud de cambio pendiente");
        });

        test('Si el nuevo turno no está disponible entonces devuelve error', async () => {
            const turno = { medico: { toString: () => "medicoId" }, estado: EstadoTurno.RESERVADO, solicitudCambioFecha: null, paciente: "pacienteId" };
            const turnoNuevo = { estado: EstadoTurno.RESERVADO, fechaHora: dayjs().add(2, 'day').toDate() };
            turnoService.turnoRepository.findById = jest.fn()
                .mockResolvedValueOnce(turno)
                .mockResolvedValueOnce(turnoNuevo);
            await expect(turnoService.proponerCambioFechaMedico("turnoId", "nuevoTurnoId")).rejects.toThrow("El turno seleccionado no está disponible");
        });

        test('Si los datos son válidos crea la solicitud y notifica al paciente', async () => {
            const turno = { medico: { toString: () => "medicoId" }, estado: EstadoTurno.RESERVADO, solicitudCambioFecha: null, paciente: "pacienteId", fechaHora: dayjs().add(1, 'day').toDate() };
            const turnoNuevo = { estado: EstadoTurno.DISPONIBLE, fechaHora: dayjs().add(2, 'day').toDate() };
            turnoService.turnoRepository.findById = jest.fn()
                .mockResolvedValueOnce(turno)
                .mockResolvedValueOnce(turnoNuevo);
            turnoService.turnoRepository.save = jest.fn().mockImplementation(t => Promise.resolve(t));
            turnoService.medicoRepository.findById = jest.fn().mockResolvedValue({ usuario: { _id: "usuarioMedicoId" } });
            turnoService.pacienteRepository.findById = jest.fn().mockResolvedValue({ usuario: { _id: "usuarioPacienteId" } });
            turnoService.notificacionRepository.create = jest.fn().mockResolvedValue({});
            await turnoService.proponerCambioFechaMedico("turnoId", "nuevoTurnoId");
            expect(turnoService.notificacionRepository.create).toHaveBeenCalledWith(expect.objectContaining({ destinatario: "usuarioPacienteId" }));
        });
    });

    describe('confirmarCambioFechaPaciente', () => {
        test('Si no hay solicitud pendiente entonces devuelve error', async () => {
            const turno = { solicitudCambioFecha: null, paciente: { toString: () => "pacienteId" } };
            turnoService.turnoRepository.findById = jest.fn().mockResolvedValue(turno);
            await expect(turnoService.confirmarCambioFechaPaciente("turnoId", "pacienteId")).rejects.toThrow("No hay solicitud de cambio pendiente");
        });

        test('Si el paciente no pertenece al turno entonces devuelve error', async () => {
            const turno = { solicitudCambioFecha: { estado: 'PENDIENTE', solicitante: 'MEDICO' }, paciente: { toString: () => "otroPaciente" } };
            turnoService.turnoRepository.findById = jest.fn().mockResolvedValue(turno);
            await expect(turnoService.confirmarCambioFechaPaciente("turnoId", "pacienteId")).rejects.toThrow("El paciente no pertenece a este turno");
        });

        test('Si el nuevo slot ya no está disponible entonces devuelve error', async () => {
            const nuevaFechaHora = dayjs().add(2, 'day').toDate();
            const turno = { solicitudCambioFecha: { estado: 'PENDIENTE', solicitante: 'MEDICO', nuevaFechaHora }, paciente: { toString: () => "pacienteId" }, medico: "medicoId", fechaHora: dayjs().add(1, 'day').toDate() };
            turnoService.turnoRepository.findById = jest.fn().mockResolvedValue(turno);
            turnoService.turnoRepository.findDisponibleByMedicoAndFechaHora = jest.fn().mockResolvedValue(null);
            turnoService.medicoRepository.findById = jest.fn().mockResolvedValue({ usuario: { _id: "usuarioMedicoId" } });
            await expect(turnoService.confirmarCambioFechaPaciente("turnoId", "pacienteId")).rejects.toThrow("El médico ya no está disponible en ese horario");
        });
    });

    describe('rechazarCambioFechaPaciente', () => {
        test('Si no hay solicitud pendiente entonces devuelve error', async () => {
            const turno = { solicitudCambioFecha: null, paciente: { toString: () => "pacienteId" } };
            turnoService.turnoRepository.findById = jest.fn().mockResolvedValue(turno);
            await expect(turnoService.rechazarCambioFechaPaciente("turnoId", "pacienteId")).rejects.toThrow("No hay solicitud de cambio pendiente");
        });

        test('Si el paciente no pertenece al turno entonces devuelve error', async () => {
            const turno = { solicitudCambioFecha: { estado: 'PENDIENTE', solicitante: 'MEDICO' }, paciente: { toString: () => "otroPaciente" } };
            turnoService.turnoRepository.findById = jest.fn().mockResolvedValue(turno);
            await expect(turnoService.rechazarCambioFechaPaciente("turnoId", "pacienteId")).rejects.toThrow("El paciente no pertenece a este turno");
        });

        test('Si los datos son válidos rechaza la solicitud y notifica al médico', async () => {
            const turno = { solicitudCambioFecha: { estado: 'PENDIENTE', solicitante: 'MEDICO' }, paciente: { toString: () => "pacienteId" }, medico: "medicoId", fechaHora: dayjs().add(1, 'day').toDate() };
            turnoService.turnoRepository.findById = jest.fn().mockResolvedValue(turno);
            turnoService.turnoRepository.save = jest.fn().mockImplementation(t => Promise.resolve(t));
            turnoService.medicoRepository.findById = jest.fn().mockResolvedValue({ usuario: { _id: "usuarioMedicoId" } });
            turnoService.pacienteRepository.findById = jest.fn().mockResolvedValue({ usuario: { _id: "usuarioPacienteId" } });
            turnoService.notificacionRepository.create = jest.fn().mockResolvedValue({});
            await turnoService.rechazarCambioFechaPaciente("turnoId", "pacienteId");
            expect(turnoService.notificacionRepository.create).toHaveBeenCalledWith(expect.objectContaining({ destinatario: "usuarioMedicoId" }));
        });
    });

    describe('cancelarPorPaciente', () => {
        test('Si el turno no existe entonces devuelve error', async () => {
            turnoService.turnoRepository.findById = jest.fn().mockRejectedValue(new Error("Turno no encontrado"));
            await expect(turnoService.cancelarPorPaciente("turnoId", "pacienteId", "motivo")).rejects.toThrow("Turno no encontrado");
        })
        test('Si el paciente no pertenece al turno entonces devuelve error', async () => {
            const turno = { medico: "medicoId", paciente: "pacienteId", fechaHora: dayjs().add(90, 'minute').toDate(), estado: EstadoTurno.CONFIRMADO, historialEstados: [] };
            turnoService.turnoRepository.findById = jest.fn().mockResolvedValue(turno);
            await expect(turnoService.cancelarPorPaciente("turnoId", "otroId", "motivo")).rejects.toThrow("El paciente no pertenece a este turno");
        })
        test('Turno con menos de 1 hora de anticipación no se puede cancelar', async () => {
            const turno = { medico: "medicoId", paciente: "pacienteId", fechaHora: dayjs().add(30, 'minute').toDate(), estado: EstadoTurno.CONFIRMADO, historialEstados: [] };
            turnoService.turnoRepository.findById = jest.fn().mockResolvedValue(turno);
            await expect(turnoService.cancelarPorPaciente("turnoId", "pacienteId", "motivo")).rejects.toThrow("No se puede cancelar el turno con menos de 1 hora de anticipación");
        })
        test('Cancelación exitosa notifica al médico', async () => {
            const turno = { medico: "medicoId", paciente: "pacienteId", fechaHora: dayjs().add(90, 'minute').toDate(), estado: EstadoTurno.CONFIRMADO, historialEstados: [] };
            turnoService.turnoRepository.findById = jest.fn().mockResolvedValue(turno);
            turnoService.turnoRepository.save = jest.fn().mockResolvedValue({});
            turnoService.medicoRepository.findById = jest.fn().mockResolvedValue({ usuario: { _id: "usuarioMedicoId" } });
            turnoService.pacienteRepository.findById = jest.fn().mockResolvedValue({ usuario: { _id: "usuarioPacienteId" } });
            turnoService.notificacionRepository.create = jest.fn().mockResolvedValue({});
            const result = await turnoService.cancelarPorPaciente("turnoId", "pacienteId", "motivo");
            expect(result.estado).toBe(EstadoTurno.CANCELADO);
            expect(turnoService.notificacionRepository.create).toHaveBeenCalledWith(expect.objectContaining({ destinatario: "usuarioMedicoId" }));
        })
    })

    describe('cancelarPorMedico', () => {
        test('Si el turno no existe entonces devuelve error', async () => {
            turnoService.turnoRepository.findById = jest.fn().mockRejectedValue(new Error("Turno no encontrado"));
            await expect(turnoService.cancelarPorMedico("turnoId", "medicoId", "motivo")).rejects.toThrow("Turno no encontrado");
        })
        test('Si el médico no pertenece al turno entonces devuelve error', async () => {
            const turno = { medico: "medicoId", paciente: "pacienteId", fechaHora: dayjs().add(90, 'minute').toDate(), estado: EstadoTurno.CONFIRMADO, historialEstados: [] };
            turnoService.turnoRepository.findById = jest.fn().mockResolvedValue(turno);
            await expect(turnoService.cancelarPorMedico("turnoId", "otroId", "motivo")).rejects.toThrow("El médico no pertenece a este turno");
        })
        test('Turno con menos de 1 hora de anticipación no se puede cancelar', async () => {
            const turno = { medico: "medicoId", paciente: "pacienteId", fechaHora: dayjs().add(30, 'minute').toDate(), estado: EstadoTurno.CONFIRMADO, historialEstados: [] };
            turnoService.turnoRepository.findById = jest.fn().mockResolvedValue(turno);
            await expect(turnoService.cancelarPorMedico("turnoId", "medicoId", "motivo")).rejects.toThrow("No se puede cancelar el turno con menos de 1 hora de anticipación");
        })
        test('Cancelación exitosa notifica al paciente', async () => {
            const turno = { medico: "medicoId", paciente: "pacienteId", fechaHora: dayjs().add(90, 'minute').toDate(), estado: EstadoTurno.CONFIRMADO, historialEstados: [] };
            turnoService.turnoRepository.findById = jest.fn().mockResolvedValue(turno);
            turnoService.turnoRepository.save = jest.fn().mockResolvedValue({});
            turnoService.medicoRepository.findById = jest.fn().mockResolvedValue({ usuario: { _id: "usuarioMedicoId" } });
            turnoService.pacienteRepository.findById = jest.fn().mockResolvedValue({ usuario: { _id: "usuarioPacienteId" } });
            turnoService.notificacionRepository.create = jest.fn().mockResolvedValue({});
            const result = await turnoService.cancelarPorMedico("turnoId", "medicoId", "motivo");
            expect(result.estado).toBe(EstadoTurno.CANCELADO);
            expect(turnoService.notificacionRepository.create).toHaveBeenCalledWith(expect.objectContaining({ destinatario: "usuarioPacienteId" }));
        })
    })
})
