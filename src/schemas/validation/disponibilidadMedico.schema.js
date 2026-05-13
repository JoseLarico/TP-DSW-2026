import { z } from 'zod';

export const disponibilidadMedicoSchema = z.object({
    especialidadId: z.string().min(1).optional(),
    practicaId: z.string().min(1).optional(),
    fechaDesde: z.coerce.date().optional(),
    fechaHasta: z.coerce.date().optional(),
    page: z.coerce.number().int().positive().optional(),
    limit: z.coerce.number().int().positive().optional(),
}).refine(data => !!data.especialidadId !== !!data.practicaId, {
    message: 'Debe indicarse especialidadId o practicaId, pero no ambos',
});
