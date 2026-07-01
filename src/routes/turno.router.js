import express from "express";
import { TurnoController } from "../controllers/turno.controller.js";
import { validarSchema } from "../middlewares/validarCampos.middleware.js";
import {
  turnoSchema,
  reservaMultipleSchema,
  solicitudCambioFechaPacienteSchema,
  solicitudCambioFechaMedicoSchema,
  respuestaSolicitudCambioFechaSchema,
} from "../schemas/validation/turno.schema.js";
import { busquedaTurnoSchema } from "../schemas/validation/busquedaTurno.schema.js";
import { verifyToken } from "../middlewares/verifyToken.middleware.js";

const router = express.Router();
const turnoController = new TurnoController();

/**
 * @openapi
 * /turnos/disponibles/{pacienteId}:
 *   get:
 *     summary: Turnos disponibles con cobertura de obra social del paciente
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
router.get("/disponibles/:pacienteId",
  verifyToken,
  validarSchema(busquedaTurnoSchema, 'query'),
  (req, res, next) => turnoController.buscarTurnosConCobertura(req, res, next)
);

/**
 * @openapi
 * /turnos/reservar-multiple:
 *   post:
 *     summary: Reservar múltiples turnos del carrito de preselección
 *     description: Intenta reservar cada turno de la lista. Devuelve resultado individual por turno (éxito o error). Usa HTTP 207 Multi-Status.
 *     tags: [Turnos]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [turnoIds, pacienteId]
 *             properties:
 *               turnoIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                 minItems: 1
 *                 description: Lista de IDs de turnos disponibles a reservar
 *                 example: ["664f1a2b3c4d5e6f7a8b9c0d", "664f1a2b3c4d5e6f7a8b9c0e"]
 *               pacienteId:
 *                 type: string
 *                 example: "664f1a2b3c4d5e6f7a8b9c0f"
 *     responses:
 *       207:
 *         description: Resultado por turno (algunos pueden haber fallado)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 reservados:
 *                   type: integer
 *                   description: Cantidad de turnos reservados exitosamente
 *                 fallidos:
 *                   type: integer
 *                   description: Cantidad de turnos que fallaron
 *                 resultados:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       turnoId:
 *                         type: string
 *                       ok:
 *                         type: boolean
 *                       turno:
 *                         type: object
 *                         description: Presente solo si ok es true
 *                       error:
 *                         type: string
 *                         description: Presente solo si ok es false
 *       400:
 *         description: Error de validación del body
 *       404:
 *         description: Paciente no encontrado
 */
router.post("/reservar-multiple",
  verifyToken,
  validarSchema(reservaMultipleSchema),
  (req, res, next) => turnoController.altaMultipleTurnos(req, res, next)
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
  verifyToken,
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
router.delete("/:turnoId/paciente", verifyToken, (req, res, next) => turnoController.cancelarPorPaciente(req, res, next));

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
router.delete("/:turnoId/medico", verifyToken, (req, res, next) => turnoController.cancelarPorMedico(req, res, next));

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
  verifyToken,
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
  verifyToken,
  validarSchema(solicitudCambioFechaMedicoSchema),
  (req, res, next) => turnoController.proponerCambioFechaMedico(req, res, next)
);


/**
 * @openapi
 * /turnos/{turnoId}/solicitud-cambio-fecha/paciente:
 *   patch:
 *     summary: El paciente responde la propuesta de cambio de fecha del médico
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
 *             required: [pacienteId, estado]
 *             properties:
 *               pacienteId:
 *                 type: string
 *                 example: "664f1a2b3c4d5e6f7a8b9c0e"
 *               estado:
 *                 type: string
 *                 enum: [confirmado, rechazado]
 *                 example: "confirmado"
 *     responses:
 *       200:
 *         description: Respuesta del paciente registrada
 *       400:
 *         description: No hay solicitud pendiente o error de validación
 *       404:
 *         description: Turno no encontrado
 */
router.patch("/:turnoId/solicitud-cambio-fecha/paciente",
  verifyToken,
  validarSchema(respuestaSolicitudCambioFechaSchema),
  (req, res, next) => turnoController.responderSolicitudCambioFecha(req, res, next)
);

/**
 * @openapi
 * /turnos/{turnoId}/realizacion:
 *   patch:
 *     summary: Registrar la realización de un turno (por el médico)
 *     tags: [Turnos]
 *     parameters:
 *       - in: path
 *         name: turnoId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Turno registrado como realizado
 *       400:
 *         description: Solo se puede registrar como realizado un turno reservado
 *       404:
 *         description: Turno no encontrado
 */
router.patch("/:turnoId/realizacion", verifyToken, (req, res, next) => turnoController.marcarRealizado(req, res, next));

export default router;
