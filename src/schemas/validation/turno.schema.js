import { z } from "zod";

export const turnoSchema = z.object({
  turnoId: z.string().min(1),
  pacienteId: z.string().min(1),
});

export const solicitudCambioFechaPacienteSchema = z.object({
  pacienteId: z.string().min(1),
  nuevoTurnoId: z.string().min(1),
});

export const solicitudCambioFechaMedicoSchema = z.object({
  nuevoTurnoId: z.string().min(1),
});

export const confirmarRechazarPacienteSchema = z.object({
  pacienteId: z.string().min(1),
});
