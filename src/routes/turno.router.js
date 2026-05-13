import express from "express";
import { TurnoController } from "../controllers/turno.controller.js";
import { validarSchema } from "../middlewares/validarCampos.middleware.js";
import {
  turnoSchema,
  solicitudCambioFechaPacienteSchema,
  solicitudCambioFechaMedicoSchema,
  confirmarRechazarPacienteSchema,
} from "../schemas/validation/turno.schema.js";
import { busquedaTurnoSchema } from "../schemas/validation/busquedaTurno.schema.js";

const router = express.Router();
const turnoController = new TurnoController();

/**
 * @openapi
 * /turnos/buscar/{pacienteId}:
 *   get:
 *     summary: Buscar turnos disponibles con cobertura de obra social del paciente
 *     tags: [Turnos]
 *     parameters:
 *       - in: path
 *         name: pacienteId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: medicoId
 *         schema:
 *           type: string
 *       - in: query
 *         name: especialidadId
 *         schema:
 *           type: string
 *       - in: query
 *         name: practicaId
 *         schema:
 *           type: string
 *       - in: query
 *         name: sedeId
 *         schema:
 *           type: string
 *       - in: query
 *         name: fechaDesde
 *         schema:
 *           type: string
 *           format: date
 *         example: "2026-06-01"
 *       - in: query
 *         name: fechaHasta
 *         schema:
 *           type: string
 *           format: date
 *         example: "2026-06-30"
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [fechaHora, costo]
 *           default: fechaHora
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: asc
 *     responses:
 *       200:
 *         description: Lista paginada de turnos con cobertura calculada
 *       404:
 *         description: Paciente no encontrado
 */
router.get("/buscar/:pacienteId",
  validarSchema(busquedaTurnoSchema, 'query'),
  (req, res, next) => turnoController.buscarTurnosConCobertura(req, res, next)
);

/**
 * @openapi
 * /turnos:
 *   post:
 *     summary: Reservar un turno (alta de turno por el paciente)
 *     tags: [Turnos]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [turnoId, pacienteId]
 *             properties:
 *               turnoId:
 *                 type: string
 *                 description: ID del turno disponible obtenido del buscador
 *                 example: "664f1a2b3c4d5e6f7a8b9c0d"
 *               pacienteId:
 *                 type: string
 *                 example: "664f1a2b3c4d5e6f7a8b9c0e"
 *     responses:
 *       201:
 *         description: Turno reservado exitosamente
 *       400:
 *         description: El turno no está disponible
 *       404:
 *         description: Turno o paciente no encontrado
 */
router.post("/",
  validarSchema(turnoSchema),
  (req, res, next) => turnoController.altaTurno(req, res, next)
);

/**
 * @openapi
 * /turnos/{turnoId}/paciente:
 *   delete:
 *     summary: Cancelar un turno (por el paciente)
 *     tags: [Turnos]
 *     parameters:
 *       - in: path
 *         name: turnoId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [pacienteId]
 *             properties:
 *               pacienteId:
 *                 type: string
 *                 example: "664f1a2b3c4d5e6f7a8b9c0e"
 *               motivo:
 *                 type: string
 *                 example: "No puedo asistir"
 *     responses:
 *       200:
 *         description: Turno cancelado exitosamente
 *       400:
 *         description: Error de validación (turno ya cancelado, menos de 1 hora de anticipación, o paciente no pertenece al turno)
 *       404:
 *         description: Turno no encontrado
 */
router.delete("/:turnoId/paciente", (req, res, next) => turnoController.cancelarPorPaciente(req, res, next));

/**
 * @openapi
 * /turnos/{turnoId}/medico:
 *   delete:
 *     summary: Cancelar un turno (por el médico)
 *     tags: [Turnos]
 *     parameters:
 *       - in: path
 *         name: turnoId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [medicoId]
 *             properties:
 *               medicoId:
 *                 type: string
 *                 example: "664f1a2b3c4d5e6f7a8b9c0d"
 *               motivo:
 *                 type: string
 *                 example: "Emergencia médica"
 *     responses:
 *       200:
 *         description: Turno cancelado exitosamente
 *       400:
 *         description: Error de validación (turno ya cancelado, menos de 1 hora de anticipación, o médico no pertenece al turno)
 *       404:
 *         description: Turno no encontrado
 */
router.delete("/:turnoId/medico", (req, res, next) => turnoController.cancelarPorMedico(req, res, next));

/**
 * @openapi
 * /turnos/{turnoId}/cambio-fecha/paciente:
 *   patch:
 *     summary: Cambiar la fecha de un turno (por el paciente)
 *     tags: [Turnos]
 *     parameters:
 *       - in: path
 *         name: turnoId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [pacienteId, nuevoTurnoId]
 *             properties:
 *               pacienteId:
 *                 type: string
 *                 example: "664f1a2b3c4d5e6f7a8b9c0e"
 *               nuevoTurnoId:
 *                 type: string
 *                 description: ID del turno disponible al que se quiere cambiar
 *                 example: "664f1a2b3c4d5e6f7a8b9c0f"
 *     responses:
 *       200:
 *         description: Fecha del turno actualizada
 *       400:
 *         description: Error de validación o disponibilidad
 *       404:
 *         description: Turno no encontrado
 */
router.patch("/:turnoId/cambio-fecha/paciente",
  validarSchema(solicitudCambioFechaPacienteSchema),
  (req, res, next) => turnoController.cambiarFechaPaciente(req, res, next)
);

/**
 * @openapi
 * /turnos/{turnoId}/solicitud-cambio-fecha/medico:
 *   post:
 *     summary: El médico propone un cambio de fecha al paciente
 *     tags: [Turnos]
 *     parameters:
 *       - in: path
 *         name: turnoId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [nuevoTurnoId]
 *             properties:
 *               nuevoTurnoId:
 *                 type: string
 *                 description: ID del turno disponible propuesto
 *                 example: "664f1a2b3c4d5e6f7a8b9c0f"
 *     responses:
 *       200:
 *         description: Solicitud de cambio enviada al paciente
 *       400:
 *         description: Error de validación
 *       404:
 *         description: Turno no encontrado
 *       409:
 *         description: Ya existe una solicitud de cambio pendiente
 */
router.post("/:turnoId/solicitud-cambio-fecha/medico",
  validarSchema(solicitudCambioFechaMedicoSchema),
  (req, res, next) => turnoController.proponerCambioFechaMedico(req, res, next)
);

/**
 * @openapi
 * /turnos/{turnoId}/solicitud-cambio-fecha/confirmar/paciente:
 *   patch:
 *     summary: El paciente confirma la propuesta de cambio de fecha del médico
 *     tags: [Turnos]
 *     parameters:
 *       - in: path
 *         name: turnoId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [pacienteId]
 *             properties:
 *               pacienteId:
 *                 type: string
 *                 example: "664f1a2b3c4d5e6f7a8b9c0e"
 *     responses:
 *       200:
 *         description: Cambio de fecha confirmado
 *       400:
 *         description: No hay solicitud pendiente o error de validación
 *       404:
 *         description: Turno no encontrado
 */
router.patch("/:turnoId/solicitud-cambio-fecha/confirmar/paciente",
  validarSchema(confirmarRechazarPacienteSchema),
  (req, res, next) => turnoController.confirmarCambioFechaPaciente(req, res, next)
);

/**
 * @openapi
 * /turnos/{turnoId}/solicitud-cambio-fecha/rechazar/paciente:
 *   patch:
 *     summary: El paciente rechaza la propuesta de cambio de fecha del médico
 *     tags: [Turnos]
 *     parameters:
 *       - in: path
 *         name: turnoId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [pacienteId]
 *             properties:
 *               pacienteId:
 *                 type: string
 *                 example: "664f1a2b3c4d5e6f7a8b9c0e"
 *     responses:
 *       200:
 *         description: Cambio de fecha rechazado
 *       400:
 *         description: No hay solicitud pendiente
 *       404:
 *         description: Turno no encontrado
 */
router.patch("/:turnoId/solicitud-cambio-fecha/rechazar/paciente",
  validarSchema(confirmarRechazarPacienteSchema),
  (req, res, next) => turnoController.rechazarCambioFechaPaciente(req, res, next)
);

/**
 * @openapi
 * /turnos/{turnoId}/realizado:
 *   patch:
 *     summary: Marcar un turno como realizado (por el médico)
 *     tags: [Turnos]
 *     parameters:
 *       - in: path
 *         name: turnoId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Turno marcado como realizado
 *       400:
 *         description: Solo se puede marcar como realizado un turno reservado
 *       404:
 *         description: Turno no encontrado
 */
router.patch("/:turnoId/realizado", (req, res, next) => turnoController.marcarRealizado(req, res, next));

export default router;
