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

    Caso 1: le decís al repository que devuelva undefined → simulás que el turno no existe
    Caso 2: le decís que devuelva un turno con fecha en menos de 1 hora → simulás que no se puede cancelar
    Caso 3: le decís que devuelva un turno válido → simulás el caso exitoso
    */
    describe('altaTurno', () => {
        test('Si el médico no existe, devuelve error', () => {
            turnoService.medicoRepository.findById = jest.fn().mockReturnValue(undefined); // Mockear el repository para que findById del medico devuelva undefined
            expect(() => turnoService.altaTurno(999, { id: 1, nombre: "Paciente 1" }, "2026-04-20T10:00:00", { id: 1 }, { id: 1 })).toThrow("Médico no encontrado"); // Verificar que al llamar a altaTurno tira el error esperado
        })

        test('Si el médico no está disponible en ese horario, devuelve error', () => {
            const medicoSinDisponibilidad = {
                id: 1,
                disponibilidades: [
                    { diaSemana: 'LUNES', horaInicio: '08:00', horaFin: '12:00' }
                ]
            };
            turnoService.medicoRepository.findById = jest.fn().mockReturnValue(medicoSinDisponibilidad); // Mockear el repository para que findById del medico devuelva un medico sin esa disponibilidad
            expect(() => turnoService.altaTurno(1, { id: 1, nombre: "Paciente 1" }, "2026-04-15T14:00:00", { id: 1 }, { id: 1 })).toThrow("El médico no está disponible en ese horario"); // Verificar que al llamar a altaTurno tira el error esperado
        })

        test('Si ya existe un turno para ese médico en esa fecha/hora, devuelve error', () => {
            const proximoLunes = dayjs().day(1).hour(10).minute(0).second(0); // Próximo lunes a las 10:00
            const medicoConDisponibilidad = {
                id: 1,
                disponibilidades: [
                    { diaSemana: 'LUNES', horaInicio: '08:00', horaFin: '12:00' }
                ]
            };
            turnoService.medicoRepository.findById = jest.fn().mockReturnValue(medicoConDisponibilidad); // Mockear el medico para que exista y tenga disponibilidad
            turnoService.turnoRepository.findByMedicoAndFechaHora = jest.fn().mockReturnValue({ id: 1 }); // Mockear findByMedicoAndFechaHora para que devuelva un turno existente
            expect(() => turnoService.altaTurno(1, { id: 1, nombre: "Paciente 1" }, proximoLunes.toDate(), { id: 1 }, { id: 1 })).toThrow("El médico ya tiene un turno asignado en ese horario"); // Verificar que al llamar a altaTurno tira el error esperado
        })

        test('Si todo es válido, se crea el turno exitosamente', () => {
            const proximoLunes = dayjs().day(1).hour(10).minute(0).second(0); // Próximo lunes a las 10:00
            const medicoConDisponibilidad = { // Mockear el medico para que exista y tenga disponibilidad
                id: 1,
                disponibilidades: [
                    { diaSemana: 'LUNES', horaInicio: '08:00', horaFin: '12:00' }
                ]
            };
            turnoService.medicoRepository.findById = jest.fn().mockReturnValue(medicoConDisponibilidad); // Mockear el medico para que exista y tenga disponibilidad
            turnoService.turnoRepository.findByMedicoAndFechaHora = jest.fn().mockReturnValue(undefined); // Mockear findByMedicoAndFechaHora para que devuelva undefined (no existe turno)
            turnoService.turnoRepository.create = jest.fn().mockImplementation((turno) => { // Mockear create para que devuelva el turno creado
                turno.id = 2;
                return turno;
            });
            const turnoCreado = turnoService.altaTurno(1, { id: 1, nombre: "Paciente 1" }, proximoLunes.toDate(), { id: 1 }, { id: 1 });
            expect(turnoCreado.estado).toBe(EstadoTurno.RESERVADO); // Verificar que el turno creado tiene estado RESERVADO
        })
    })

    describe('bajaTurno', () => {
        test('Si el turno no existe entonces devuelve error', () => {
            /*
            1°: Mockear el repository para que findById devuelva undefined
            2°: Verificar que al llamar a bajaTurno tira el error esperado
            */
            turnoService.turnoRepository.findById = jest.fn().mockReturnValue(undefined);
            expect(() => turnoService.bajaTurno(1, "No llego al turno")).toThrow("Turno no encontrado"); //El mensaje de error debe coincidir con el del service: turno.service.js
        })
        test('Turno con fecha en menos de anticipación entonces no se puede cancelar', () => {
            const fechaHora = dayjs().add(30, 'minute').toDate(); // Fecha dentro de 30 minutos (menos de 1 hora)
            turnoService.turnoRepository.findById = jest.fn().mockReturnValue(new Turno(1, null, null, fechaHora, null, null, EstadoTurno.CONFIRMADO, [], 0)); // Mockear un turno con esa fecha
            expect(() => turnoService.bajaTurno(1, "No llego al turno")).toThrow("No se puede cancelar el turno con menos de 1 hora de anticipación"); //El mensaje de error debe coincidir con el del service: turno.service.js
        })
        test('Turno con mas de una hora de anticipación entonces se puede cancelar', () => {
            const fechaHora = dayjs().add(90, 'minute').toDate();
            turnoService.turnoRepository.findById = jest.fn().mockReturnValue(new Turno(1, null, null, fechaHora, null, null, EstadoTurno.CONFIRMADO, [], 0));
            const turno = turnoService.bajaTurno(1, "No llego al turno");
            expect(turno.estado).toBe(EstadoTurno.CANCELADO);
        })
    })
})