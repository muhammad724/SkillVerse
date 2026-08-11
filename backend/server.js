require("dotenv").config();
require("./instrument");
const app = require("./app");
const prisma = require("./config/database");

const port = Number(process.env.EXPRESS_PORT || 5000);
const server = app.listen(port, () => console.log(`SkillVerse Express API running at http://localhost:${port}`));
async function shutdown(signal) { console.log(`${signal} received; shutting down Express API.`); server.close(async () => { await prisma.$disconnect(); process.exit(0); }); }
process.on("SIGINT", () => void shutdown("SIGINT"));
process.on("SIGTERM", () => void shutdown("SIGTERM"));
