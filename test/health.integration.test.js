import { describe, test, expect } from '@jest/globals';
import request from 'supertest';
import app from '../app.js';

describe('Integración - Capa de Controladores', () => {
    describe('GET /health', () => {
        test('responde 200 con status ok y timestamp', async () => {
            const res = await request(app).get('/health');

            expect(res.status).toBe(200);
            expect(res.body.status).toBe('ok');
            expect(typeof res.body.timestamp).toBe('string');
            expect(new Date(res.body.timestamp).toString()).not.toBe('Invalid Date');
        });
    });

    describe('Ruta inexistente', () => {
        test('responde 404 con mensaje de error', async () => {
            const res = await request(app).get('/ruta-que-no-existe');

            expect(res.status).toBe(404);
            expect(res.body).toHaveProperty('message');
        });
    });
});
