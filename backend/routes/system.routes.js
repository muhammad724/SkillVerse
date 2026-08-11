const express = require("express");
const router = express.Router();

/**
 * @openapi
 * /api/health:
 *   get:
 *     summary: Check API health
 *     description: Confirms that the Express service is running.
 *     tags: [System]
 *     responses:
 *       200:
 *         description: Service is healthy
 *         content:
 *           application/json:
 *             example: { status: "ok", service: "skillverse-express-api" }
 */
router.get("/health", (_req, res) => res.json({ status: "ok", service: "skillverse-express-api", environment: process.env.NODE_ENV || "development" }));

if ((process.env.NODE_ENV || "development") === "development") {
  /**
   * @openapi
   * /api/sentry-test:
   *   get:
   *     summary: Generate a Sentry verification error
   *     description: Development-only route that throws an intentional error through the normal Sentry and Express error middleware pipeline. Remove before production if desired.
   *     tags: [System]
   *     responses:
   *       500:
   *         description: Intentional Sentry test error
   *         content:
   *           application/json:
   *             schema: { $ref: '#/components/schemas/Error' }
   *             example: { message: "Sentry test error" }
   */
  router.get("/sentry-test", () => { throw new Error("Sentry test error"); });
}

module.exports = router;
