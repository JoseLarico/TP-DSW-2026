import { z } from 'zod';
import { DiaSemana } from '../../enums/diaSemana.enum.js';

export const agendaSchema = z.object({
    especialidadId: z.string().min(1).optional(),
    practicaId: z.string().min(1).optional(),
    sedeId: z.string().min(1, 'sedeId es requerido'),
    disponibilidad: z.object({
        diaSemana: z.enum(Object.values(DiaSemana)),
        horaInicio: z.string().regex(/^\d{2}:\d{2}$/, 'Formato de hora inválido, use HH:mm'),
        horaFin: z.string().regex(/^\d{2}:\d{2}$/, 'Formato de hora inválido, use HH:mm'),
        fechaFin: z.string()
            .datetime({ message: 'Formato de fecha inválido, use el formato: 2026-12-31T00:00:00.000Z' })
            .refine(f => new Date(f) > new Date(), { message: 'La fecha de fin debe ser futura' })
            .optional(),
    }),
}).refine(data => !!data.especialidadId !== !!data.practicaId, {
    message: 'Debe indicarse especialidadId o practicaId, pero no ambos',
});
