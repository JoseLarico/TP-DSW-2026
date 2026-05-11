import { z } from "zod";

export const turnoSchema = z.object({
  medicoId: z.string().min(1),
  pacienteId: z.string().min(1),
  fechaHora: z.string().min(1),
  sedeId: z.string().min(1),
  especialidadId: z.string().min(1).optional(),
  practicaId: z.string().min(1).optional(),
}).refine(data => data.especialidadId || data.practicaId, {
  message: 'Debe indicarse al menos una especialidad o práctica',
  path: ['especialidadId']
});

export const solicitudCambioFechaPacienteSchema = z.object({
  pacienteId: z.string().min(1),
  nuevaFechaHora: z.string().min(1),
});

export const solicitudCambioFechaMedicoSchema = z.object({
  medicoId: z.string().min(1),
  nuevaFechaHora: z.string().min(1),
});

export const confirmarRechazarPacienteSchema = z.object({
  pacienteId: z.string().min(1),
});
