import { describe, expect, test } from '@jest/globals';
import { Turno } from '../src/models/turno.model.js';
import { EstadoTurno } from '../src/enums/estadoTurno.enum.js';
import dayjs from 'dayjs';

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
