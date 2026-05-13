import { z } from "zod";

export const busquedaTurnoSchema = z.object({
    medicoId: z.string().trim().optional(),
    especialidadId: z.string().trim().optional(),
    practicaId: z.string().trim().optional(),
    sedeId: z.string().trim().optional(),
    fechaDesde: z.coerce.date().optional(),
    fechaHasta: z.coerce.date().optional(),
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().min(1).max(100).default(10),
    sortBy: z.enum(['fechaHora', 'costo']).default('fechaHora'),
    sortOrder: z.enum(['asc', 'desc']).default('asc'),
}).refine(data => {
    if (!data.fechaDesde || !data.fechaHasta) return true;
    return data.fechaDesde <= data.fechaHasta;
}, {
    message: 'fechaDesde debe ser menor o igual a fechaHasta',
    path: ['fechaDesde']
});
