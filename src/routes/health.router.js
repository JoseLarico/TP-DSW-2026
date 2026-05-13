import express from "express";

const router = express.Router();

/**
 * @openapi
 * /health:
 *   get:
 *     summary: Health check del servidor
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: El servidor está funcionando correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 *                 timestamp:
 *                   type: string
 *                   example: "2026-05-11T17:00:00.000Z"
 */
router.get("/health", (req, res, next) => {
  res.status(200).json({
    status: "ok",
    timestamp: new Date().toISOString(),
  });
});

export default router;
