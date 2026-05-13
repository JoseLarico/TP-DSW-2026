import { describe, expect, test } from '@jest/globals';
import { DisponibilidadHoraria } from '../src/models/disponibilidadHoraria.model.js';
import { Turno } from '../src/models/turno.model.js';
import { Medico } from '../src/models/medico.model.js';
import { EstadoTurno } from '../src/enums/estadoTurno.enum.js';
import dayjs from 'dayjs';

// ── DisponibilidadHoraria ─────────────────────────────────────────────────────

describe('DisponibilidadHoraria', () => {

    describe('constructor', () => {
        test('Se crea correctamente con datos válidos', () => {
            const disp = new DisponibilidadHoraria('LUNES', '09:00', '13:00');
            expect(disp.diaSemana).toBe('LUNES');
        });

        test('Lanza error si horaInicio es igual a horaFin', () => {
            expect(() => new DisponibilidadHoraria('LUNES', '09:00', '09:00')).toThrow('Hora inicio debe ser menor a hora fin');
        });

        test('Lanza error si horaInicio es mayor a horaFin', () => {
            expect(() => new DisponibilidadHoraria('LUNES', '13:00', '09:00')).toThrow('Hora inicio debe ser menor a hora fin');
        });
    });


});

// ── Turno ─────────────────────────────────────────────────────────────────────

describe('Turno', () => {

    describe('puedeSerCancelado', () => {
        test('Devuelve true si faltan más de 60 minutos', () => {
            const turno = new Turno('med1', 'pac1', dayjs().add(90, 'minute').toDate(), null, null, null, EstadoTurno.RESERVADO, [], 0);
            expect(turno.puedeSerCancelado()).toBe(true);
        });

        test('Devuelve false si faltan exactamente 60 minutos', () => {
            const turno = new Turno('med1', 'pac1', dayjs().add(60, 'minute').toDate(), null, null, null, EstadoTurno.RESERVADO, [], 0);
            expect(turno.puedeSerCancelado()).toBe(false);
        });

        test('Devuelve false si faltan menos de 60 minutos', () => {
            const turno = new Turno('med1', 'pac1', dayjs().add(30, 'minute').toDate(), null, null, null, EstadoTurno.RESERVADO, [], 0);
            expect(turno.puedeSerCancelado()).toBe(false);
        });

        test('Devuelve false si el turno ya pasó', () => {
            const turno = new Turno('med1', 'pac1', dayjs().subtract(1, 'hour').toDate(), null, null, null, EstadoTurno.RESERVADO, [], 0);
            expect(turno.puedeSerCancelado()).toBe(false);
        });
    });

    describe('actualizarEstado', () => {
        test('Actualiza el estado correctamente', () => {
            const turno = new Turno('med1', 'pac1', new Date(), null, null, null, EstadoTurno.RESERVADO, [], 0);
            turno._id = 'turno1';
            turno.actualizarEstado(EstadoTurno.CANCELADO, 'pac1', 'No puedo asistir');
            expect(turno.estado).toBe(EstadoTurno.CANCELADO);
        });

        test('Agrega el cambio al historial de estados', () => {
            const turno = new Turno('med1', 'pac1', new Date(), null, null, null, EstadoTurno.RESERVADO, [], 0);
            turno._id = 'turno1';
            turno.actualizarEstado(EstadoTurno.CANCELADO, 'pac1', 'Motivo');
            expect(turno.historialEstados).toHaveLength(1);
            expect(turno.historialEstados[0].estado).toBe(EstadoTurno.CANCELADO);
            expect(turno.historialEstados[0].motivo).toBe('Motivo');
        });

        test('El motivo es opcional en el historial', () => {
            const turno = new Turno('med1', 'pac1', new Date(), null, null, null, EstadoTurno.RESERVADO, [], 0);
            turno._id = 'turno1';
            turno.actualizarEstado(EstadoTurno.REALIZADO, 'med1');
            expect(turno.historialEstados[0].motivo).toBeNull();
        });
    });
});

// ── Medico ────────────────────────────────────────────────────────────────────

describe('Medico', () => {
    test('Se crea correctamente con todos sus atributos', () => {
        const medico = new Medico('user1', 'MAT-001', 'Juan Pérez', ['esp1'], ['prac1'], ['sede1']);
        expect(medico.usuario).toBe('user1');
        expect(medico.matricula).toBe('MAT-001');
        expect(medico.nombre).toBe('Juan Pérez');
        expect(medico.especialidades).toContain('esp1');
        expect(medico.practicas).toContain('prac1');
        expect(medico.sedes).toContain('sede1');
    });

    test('Se puede crear con listas vacías', () => {
        const medico = new Medico('user1', 'MAT-001', 'Juan Pérez', [], [], []);
        expect(medico.especialidades).toHaveLength(0);
        expect(medico.practicas).toHaveLength(0);
        expect(medico.sedes).toHaveLength(0);
    });
});
