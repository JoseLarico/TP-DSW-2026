import express from "express";
import { MedicoController } from "../controllers/medico.controller.js";
import { validarSchema } from "../middlewares/validarCampos.middleware.js";
import { agendaSchema } from "../schemas/validation/agenda.schema.js";
import { disponibilidadMedicoSchema } from "../schemas/validation/disponibilidadMedico.schema.js";
import { verifyToken } from "../middlewares/verifyToken.middleware.js";

const router = express.Router();
const medicoController = new MedicoController();

// ── CRUD Médicos ──────────────────────────────────────────────────────────────

/**
 * @openapi
 * /medicos:
 *   get:
 *     summary: Obtener todos los médicos
 *     tags: [Médicos]
 *     responses:
 *       200:
 *         description: Lista de médicos
 *   post:
 *     summary: Crear un médico
 *     tags: [Médicos]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [nombreUsuario, password, matricula, nombre]
 *             properties:
 *               nombreUsuario:
 *                 type: string
 *                 example: "dr.house"
 *               password:
 *                 type: string
 *                 example: "pass1234"
 *               matricula:
 *                 type: string
 *                 example: "MN12345"
 *               nombre:
 *                 type: string
 *                 example: "Gregory House"
 *     responses:
 *       201:
 *         description: Médico creado
 *       409:
 *         description: Nombre de usuario o matrícula ya en uso
 */
router.get("/", (req, res, next) =>
    medicoController.obtenerTodos(req, res, next)
);
router.post("/", (req, res, next) =>
    medicoController.crear(req, res, next)
);

/**
 * @openapi
 * /medicos/{medicoId}:
 *   get:
 *     summary: Obtener un médico por ID
 *     tags: [Médicos]
 *     parameters:
 *       - in: path
 *         name: medicoId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Datos del médico
 *       404:
 *         description: Médico no encontrado
 *   patch:
 *     summary: Actualizar datos de un médico
 *     tags: [Médicos]
 *     parameters:
 *       - in: path
 *         name: medicoId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *               matricula:
 *                 type: string
 *     responses:
 *       200:
 *         description: Médico actualizado
 *       404:
 *         description: Médico no encontrado
 *   delete:
 *     summary: Eliminar un médico
 *     tags: [Médicos]
 *     parameters:
 *       - in: path
 *         name: medicoId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Médico eliminado
 *       400:
 *         description: El médico tiene turnos futuros activos
 *       404:
 *         description: Médico no encontrado
 */
router.get("/:medicoId", (req, res, next) =>
    medicoController.obtenerPorId(req, res, next)
);
router.patch("/:medicoId", (req, res, next) =>
    medicoController.actualizar(req, res, next)
);
router.delete("/:medicoId", (req, res, next) =>
    medicoController.eliminar(req, res, next)
);

// ── Agenda ────────────────────────────────────────────────────────────────────

/**
 * @openapi
 * /medicos/{medicoId}/agenda:
 *   post:
 *     summary: Crear agenda (disponibilidad horaria y generación de turnos)
 *     tags: [Médicos]
 *     parameters:
 *       - in: path
 *         name: medicoId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [sedeId, disponibilidad]
 *             description: Se debe indicar exactamente uno de especialidadId o practicaId
 *             properties:
 *               especialidadId:
 *                 type: string
 *                 example: "664f1a2b3c4d5e6f7a8b9c10"
 *               practicaId:
 *                 type: string
 *                 example: "664f1a2b3c4d5e6f7a8b9c11"
 *               sedeId:
 *                 type: string
 *                 example: "664f1a2b3c4d5e6f7a8b9c0f"
 *               disponibilidad:
 *                 type: object
 *                 required: [diaSemana, horaInicio, horaFin]
 *                 properties:
 *                   diaSemana:
 *                     type: string
 *                     enum: [LUNES, MARTES, MIERCOLES, JUEVES, VIERNES, SABADO, DOMINGO]
 *                     example: "LUNES"
 *                   horaInicio:
 *                     type: string
 *                     example: "09:00"
 *                   horaFin:
 *                     type: string
 *                     example: "17:00"
 *                   fechaFin:
 *                     type: string
 *                     format: date-time
 *                     description: Fecha límite para generar turnos (ISO 8601). Si no se indica, se usan los próximos 30 días.
 *                     example: "2026-12-31T00:00:00.000Z"
 *     responses:
 *       201:
 *         description: Agenda creada y turnos generados
 *       400:
 *         description: Error de validación
 *       404:
 *         description: Médico no encontrado
 *       409:
 *         description: Solapamiento de horario con agenda existente
 */
router.post("/:medicoId/agenda",
  validarSchema(agendaSchema),
  (req, res, next) => medicoController.crearAgenda(req, res, next)
);

// ── Gestión de Servicios ──────────────────────────────────────────────────────

/**
 * @openapi
 * /medicos/{medicoId}/especialidades:
 *   post:
 *     summary: Agregar una especialidad al médico
 *     tags: [Médicos]
 *     parameters:
 *       - in: path
 *         name: medicoId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [especialidadId]
 *             properties:
 *               especialidadId:
 *                 type: string
 *                 example: "664f1a2b3c4d5e6f7a8b9c10"
 *     responses:
 *       200:
 *         description: Especialidad agregada
 *       409:
 *         description: El médico ya tiene esa especialidad
 */
router.post("/:medicoId/especialidades", (req, res, next) =>
  medicoController.agregarEspecialidad(req, res, next)
);

/**
 * @openapi
 * /medicos/{medicoId}/especialidades/{especialidadId}:
 *   delete:
 *     summary: Quitar una especialidad al médico
 *     tags: [Médicos]
 *     parameters:
 *       - in: path
 *         name: medicoId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: especialidadId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Especialidad eliminada
 *       400:
 *         description: El médico tiene turnos futuros con esa especialidad
 *       404:
 *         description: El médico no tiene esa especialidad
 */
router.delete("/:medicoId/especialidades/:especialidadId", (req, res, next) =>
  medicoController.eliminarEspecialidad(req, res, next)
);

/**
 * @openapi
 * /medicos/{medicoId}/practicas:
 *   post:
 *     summary: Agregar una práctica al médico
 *     tags: [Médicos]
 *     parameters:
 *       - in: path
 *         name: medicoId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [practicaId]
 *             properties:
 *               practicaId:
 *                 type: string
 *                 example: "664f1a2b3c4d5e6f7a8b9c11"
 *     responses:
 *       200:
 *         description: Práctica agregada
 *       409:
 *         description: El médico ya tiene esa práctica
 */
router.post("/:medicoId/practicas", (req, res, next) =>
  medicoController.agregarPractica(req, res, next)
);

/**
 * @openapi
 * /medicos/{medicoId}/practicas/{practicaId}:
 *   delete:
 *     summary: Quitar una práctica al médico
 *     tags: [Médicos]
 *     parameters:
 *       - in: path
 *         name: medicoId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: practicaId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Práctica eliminada
 *       400:
 *         description: El médico tiene turnos futuros con esa práctica
 *       404:
 *         description: El médico no tiene esa práctica
 */
router.delete("/:medicoId/practicas/:practicaId", (req, res, next) =>
  medicoController.eliminarPractica(req, res, next)
);

/**
 * @openapi
 * /medicos/{medicoId}/sedes:
 *   post:
 *     summary: Agregar una sede al médico
 *     tags: [Médicos]
 *     parameters:
 *       - in: path
 *         name: medicoId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [sedeId]
 *             properties:
 *               sedeId:
 *                 type: string
 *                 example: "664f1a2b3c4d5e6f7a8b9c0f"
 *     responses:
 *       200:
 *         description: Sede agregada
 *       409:
 *         description: El médico ya atiende en esa sede
 */
router.post("/:medicoId/sedes", (req, res, next) =>
  medicoController.agregarSede(req, res, next)
);

/**
 * @openapi
 * /medicos/{medicoId}/sedes/{sedeId}:
 *   delete:
 *     summary: Quitar una sede al médico
 *     tags: [Médicos]
 *     parameters:
 *       - in: path
 *         name: medicoId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: sedeId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Sede eliminada
 *       400:
 *         description: El médico tiene turnos futuros en esa sede
 *       404:
 *         description: El médico no tiene esa sede
 */
router.delete("/:medicoId/sedes/:sedeId", (req, res, next) =>
  medicoController.eliminarSede(req, res, next)
);

/**
 * @openapi
 * /medicos/{medicoId}/turnos:
 *   get:
 *     summary: Obtener historial de turnos de un médico
 *     tags: [Médicos]
 *     parameters:
 *       - in: path
 *         name: medicoId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lista de turnos del médico
 *       404:
 *         description: Médico no encontrado
 */
router.get("/:medicoId/turnos", verifyToken, (req, res, next) =>
  medicoController.obtenerHistorialTurnos(req, res, next)
);

/**
 * @openapi
 * /medicos/{medicoId}/disponibilidad:
 *   get:
 *     summary: Consultar turnos disponibles del médico para una especialidad o práctica
 *     description: Se debe indicar exactamente uno de especialidadId o practicaId
 *     tags: [Médicos]
 *     parameters:
 *       - in: path
 *         name: medicoId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: especialidadId
 *         schema:
 *           type: string
 *         description: ID de la especialidad (requerido si no se indica practicaId)
 *       - in: query
 *         name: practicaId
 *         schema:
 *           type: string
 *         description: ID de la práctica (requerido si no se indica especialidadId)
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
 *     responses:
 *       200:
 *         description: Lista paginada de turnos disponibles
 *       400:
 *         description: Error de validación (debe indicarse especialidadId o practicaId, no ambos)
 *       404:
 *         description: Médico no encontrado
 */
router.get("/:medicoId/disponibilidad",
  validarSchema(disponibilidadMedicoSchema, 'query'),
  (req, res, next) => medicoController.consultarDisponibilidad(req, res, next)
);

export default router;
