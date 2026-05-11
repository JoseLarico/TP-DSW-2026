import { TurnoService } from "../src/services/turno.service.js"
import { TurnoRepository } from "../src/repositories/turno.repository.js"
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
        test('Si el médico no existe, devuelve error', async () => {
            turnoService.medicoRepository.findById = jest.fn().mockRejectedValue(new Error("Médico no encontrado")); // Mockear el repository para que findById del medico rechace con error
            await expect(turnoService.altaTurno(999, { id: 1, nombre: "Paciente 1" }, "2026-04-20T10:00:00", { id: 1 }, { id: 1 })).rejects.toThrow("Médico no encontrado"); // Verificar que al llamar a altaTurno tira el error esperado
        })

        test('Si el médico no está disponible en ese horario, devuelve error', async () => {
            const proximoMiercoles = dayjs().add(1, 'week').day(3).hour(14).minute(0).second(0); // Próximo miércoles a las 14:00 (fuera de disponibilidad del médico)
            const medicoSinDisponibilidad = {
                id: 1,
                especialidades: [],
                practicas: [],
                sedes: [],
                disponibilidades: [
                    { diaSemana: 'LUNES', horaInicio: '08:00', horaFin: '12:00' }
                ]
            };
            turnoService.medicoRepository.findById = jest.fn().mockResolvedValue(medicoSinDisponibilidad); // Mockear el repository para que findById del medico devuelva un medico sin esa disponibilidad
            await expect(turnoService.altaTurno(1, { id: 1, nombre: "Paciente 1" }, proximoMiercoles.toDate(), null, null)).rejects.toThrow("El médico no está disponible en ese horario"); // Verificar que al llamar a altaTurno tira el error esperado
        })

        test('Si ya existe un turno para ese médico en esa fecha/hora, devuelve error', async () => {
            const proximoLunes = dayjs().add(1, 'week').day(1).hour(10).minute(0).second(0); // Próximo lunes a las 10:00
            const medicoConDisponibilidad = {
                id: 1,
                especialidades: [],
                practicas: [],
                sedes: [],
                disponibilidades: [
                    { diaSemana: 'LUNES', horaInicio: '08:00', horaFin: '12:00' }
                ]
            };
            turnoService.medicoRepository.findById = jest.fn().mockResolvedValue(medicoConDisponibilidad); // Mockear el medico para que exista y tenga disponibilidad
            turnoService.turnoRepository.findByMedicoAndFechaHora = jest.fn().mockResolvedValue({ id: 1 }); // Mockear findByMedicoAndFechaHora para que devuelva un turno existente
            await expect(turnoService.altaTurno(1, { id: 1, nombre: "Paciente 1" }, proximoLunes.toDate(), null, null)).rejects.toThrow("El médico ya tiene un turno asignado en ese horario"); // Verificar que al llamar a altaTurno tira el error esperado
        })

        test('Si todo es válido, se crea el turno exitosamente', async () => {
            const proximoLunes = dayjs().add(1, 'week').day(1).hour(10).minute(0).second(0); // Próximo lunes a las 10:00
            const medicoConDisponibilidad = { // Mockear el medico para que exista y tenga disponibilidad
                id: 1,
                especialidades: [],
                practicas: [],
                sedes: [],
                disponibilidades: [
                    { diaSemana: 'LUNES', horaInicio: '08:00', horaFin: '12:00' }
                ]
            };
            turnoService.medicoRepository.findById = jest.fn().mockResolvedValue(medicoConDisponibilidad); // Mockear el medico para que exista y tenga disponibilidad
            turnoService.turnoRepository.findByMedicoAndFechaHora = jest.fn().mockResolvedValue(undefined); // Mockear findByMedicoAndFechaHora para que devuelva undefined (no existe turno)
            turnoService.turnoRepository.create = jest.fn().mockImplementation((turno) => { // Mockear create para que devuelva el turno creado
                turno.id = 2;
                return Promise.resolve(turno);
            });
            const turnoCreado = await turnoService.altaTurno(1, { id: 1, nombre: "Paciente 1" }, proximoLunes.toDate(), null, null);
            expect(turnoCreado.estado).toBe(EstadoTurno.RESERVADO); // Verificar que el turno creado tiene estado RESERVADO
        })
    })

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
