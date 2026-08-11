const prisma = require("../config/database");
const difficulties = new Set(["BEGINNER", "INTERMEDIATE", "ADVANCED", "BOSS"]);
const slugify = value => value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

async function listMissions(req, res, next) { try { const { career, difficulty, search } = req.query; const missions = await prisma.mission.findMany({ where: { ...(career ? { career: { slug: career } } : {}), ...(difficulty ? { difficulty: String(difficulty).toUpperCase() } : {}), ...(search ? { OR: [{ title: { contains: search, mode: "insensitive" } }, { description: { contains: search, mode: "insensitive" } }] } : {}) }, include: { career: { select: { id: true, name: true, slug: true } } }, orderBy: [{ career: { name: "asc" } }, { xpReward: "asc" }] }); res.json({ count: missions.length, missions }); } catch (error) { next(error); } }
async function getMission(req, res, next) {
  try {
    const mission = await prisma.mission.findUnique({
      where: { id: req.params.id },
      include: {
        career: { select: { id: true, name: true, slug: true } },
        requirements: { orderBy: { position: "asc" } },
      },
    });
    if (!mission) return res.status(404).json({ message: "Mission not found." });
    res.json({ mission });
  } catch (error) { next(error); }
}
function validate(body, partial = false) { const required = ["careerId", "title", "description", "scenario", "difficulty", "xpReward", "estimatedMinutes"]; if (!partial && required.some(key => body[key] === undefined || body[key] === "")) return "Every mission field is required."; if (body.difficulty && !difficulties.has(body.difficulty)) return "Difficulty is invalid."; if (body.xpReward !== undefined && (!Number.isInteger(body.xpReward) || body.xpReward < 25 || body.xpReward > 5000)) return "XP reward must be an integer from 25 to 5000."; if (body.estimatedMinutes !== undefined && (!Number.isInteger(body.estimatedMinutes) || body.estimatedMinutes < 15)) return "Estimated minutes must be at least 15."; return null; }
async function createMission(req, res, next) { try { const validation = validate(req.body); if (validation) return res.status(400).json({ message: validation }); const base = slugify(req.body.title); const exists = await prisma.mission.findUnique({ where: { slug: base } }); const mission = await prisma.mission.create({ data: { ...req.body, slug: exists ? `${base}-${Date.now().toString(36)}` : base, boss: req.body.difficulty === "BOSS" }, include: { career: { select: { id: true, name: true } } } }); res.status(201).json({ mission }); } catch (error) { next(error); } }
async function updateMission(req, res, next) { try { const validation = validate(req.body, true); if (validation) return res.status(400).json({ message: validation }); const allowed = ["careerId", "title", "description", "scenario", "difficulty", "xpReward", "estimatedMinutes"]; const data = Object.fromEntries(Object.entries(req.body).filter(([key]) => allowed.includes(key))); if (!Object.keys(data).length) return res.status(400).json({ message: "Provide at least one editable mission field." }); if (data.title) data.slug = slugify(data.title); if (data.difficulty) data.boss = data.difficulty === "BOSS"; const mission = await prisma.mission.update({ where: { id: req.params.id }, data, include: { career: { select: { id: true, name: true } } } }); res.json({ mission }); } catch (error) { if (error.code === "P2025") return res.status(404).json({ message: "Mission not found." }); next(error); } }
async function deleteMission(req, res, next) { try { const submissionCount = await prisma.submission.count({ where: { missionId: req.params.id } }); if (submissionCount) return res.status(409).json({ message: "A mission with learner submissions cannot be deleted." }); await prisma.mission.delete({ where: { id: req.params.id } }); res.status(204).end(); } catch (error) { if (error.code === "P2025") return res.status(404).json({ message: "Mission not found." }); next(error); } }

module.exports = { listMissions, getMission, createMission, updateMission, deleteMission };
