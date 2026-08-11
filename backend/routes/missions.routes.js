const express = require("express");
const controller = require("../controllers/missions.controller");
const { requireAdmin } = require("../middleware/auth");
const router = express.Router();

/**
 * @openapi
 * /api/missions:
 *   get:
 *     summary: List career missions
 *     description: Returns existing SkillVerse missions with optional career, difficulty, and text filters.
 *     tags: [Missions]
 *     parameters:
 *       - in: query
 *         name: career
 *         schema: { type: string }
 *         description: Career slug, for example figma-designer.
 *       - in: query
 *         name: difficulty
 *         schema: { type: string, enum: [BEGINNER, INTERMEDIATE, ADVANCED, BOSS] }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Mission collection
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 count: { type: integer, example: 4 }
 *                 missions: { type: array, items: { $ref: '#/components/schemas/Mission' } }
 *       500: { description: Server error, content: { application/json: { schema: { $ref: '#/components/schemas/Error' } } } }
 *   post:
 *     summary: Create a mission
 *     description: Creates a mission for an existing career. Administrator bearer token required.
 *     tags: [Missions]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/MissionInput' }
 *           example: { careerId: "career_id", title: "Design a responsive portfolio", description: "Create a polished portfolio experience.", scenario: "A junior designer needs evidence before applying.", difficulty: "INTERMEDIATE", xpReward: 250, estimatedMinutes: 240 }
 *     responses:
 *       201: { description: Mission created, content: { application/json: { schema: { type: object, properties: { mission: { $ref: '#/components/schemas/Mission' } } } } } }
 *       400: { description: Validation error, content: { application/json: { schema: { $ref: '#/components/schemas/Error' } } } }
 *       401: { description: Missing or invalid JWT, content: { application/json: { schema: { $ref: '#/components/schemas/Error' } } } }
 *       403: { description: Administrator role required, content: { application/json: { schema: { $ref: '#/components/schemas/Error' } } } }
 */
router.get("/", controller.listMissions);
router.post("/", requireAdmin, controller.createMission);

/**
 * @openapi
 * /api/missions/{id}:
 *   get:
 *     summary: Get one mission
 *     description: Returns a mission, its career, and acceptance requirements.
 *     tags: [Missions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Mission found, content: { application/json: { schema: { type: object, properties: { mission: { $ref: '#/components/schemas/Mission' } } } } } }
 *       404: { description: Mission not found, content: { application/json: { schema: { $ref: '#/components/schemas/Error' } } } }
 *   patch:
 *     summary: Update a mission
 *     description: Partially updates an existing mission without changing unrelated fields.
 *     tags: [Missions]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/MissionInput' }
 *           example: { title: "Updated mission title", xpReward: 500 }
 *     responses:
 *       200: { description: Mission updated, content: { application/json: { schema: { type: object, properties: { mission: { $ref: '#/components/schemas/Mission' } } } } } }
 *       400: { description: Invalid update, content: { application/json: { schema: { $ref: '#/components/schemas/Error' } } } }
 *       401: { description: Missing or invalid JWT }
 *       403: { description: Administrator role required }
 *       404: { description: Mission not found }
 *   delete:
 *     summary: Delete an unused mission
 *     description: Deletes a mission only when it has no learner submissions, preserving existing learner work.
 *     tags: [Missions]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       204: { description: Mission deleted }
 *       401: { description: Missing or invalid JWT }
 *       403: { description: Administrator role required }
 *       404: { description: Mission not found }
 *       409: { description: Mission has learner submissions, content: { application/json: { schema: { $ref: '#/components/schemas/Error' } } } }
 */
router.get("/:id", controller.getMission);
router.patch("/:id", requireAdmin, controller.updateMission);
router.delete("/:id", requireAdmin, controller.deleteMission);

module.exports = router;
