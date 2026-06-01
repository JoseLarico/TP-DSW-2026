import { describe, expect, test } from '@jest/globals';
import { DisponibilidadHoraria } from '../src/models/disponibilidadHoraria.model.js';

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
