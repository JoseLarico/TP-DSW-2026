import { describe, expect, test } from '@jest/globals';
import { Medico } from '../src/models/medico.model.js';

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
