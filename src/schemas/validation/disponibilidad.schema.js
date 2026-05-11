import { z } from "zod";
import { DiaSemana } from "../../enums/diaSemana.enum.js";

export const disponibilidadSchema = z.object({
  nuevaDisponibilidad: z.object({
    diaSemana: z.enum(Object.values(DiaSemana)),
    horaInicio: z.string().regex(/^\d{2}:\d{2}$/, "Formato de hora inválido, use HH:mm"),
    horaFin: z.string().regex(/^\d{2}:\d{2}$/, "Formato de hora inválido, use HH:mm"),
  }),
});
