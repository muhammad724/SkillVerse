const swaggerJSDoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.3",
    info: {
      title: "SkillVerse Express API",
      version: "1.0.0",
      description: "REST API for reading and administering SkillVerse career missions. Protected operations use Supabase JWT bearer authentication.",
    },
    servers: [
      { url: `http://localhost:${process.env.EXPRESS_PORT || 5000}`, description: "Local development" },
      ...(process.env.EXPRESS_API_URL ? [{ url: process.env.EXPRESS_API_URL, description: "Deployed API" }] : []),
    ],
    tags: [
      { name: "System", description: "Service health and monitoring" },
      { name: "Missions", description: "Career mission CRUD operations" },
    ],
    components: {
      securitySchemes: { bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT", description: "Supabase access token: Bearer <token>" } },
      schemas: {
        Error: { type: "object", required: ["message"], properties: { message: { type: "string", example: "Mission not found." }, requestId: { type: "string", nullable: true } } },
        CareerSummary: { type: "object", properties: { id: { type: "string" }, name: { type: "string", example: "Figma Designer" } } },
        Mission: { type: "object", properties: { id: { type: "string" }, slug: { type: "string", example: "figma-designer-design-a-mobile-app-onboarding-in-figma" }, title: { type: "string" }, description: { type: "string" }, scenario: { type: "string" }, difficulty: { type: "string", enum: ["BEGINNER", "INTERMEDIATE", "ADVANCED", "BOSS"] }, xpReward: { type: "integer", example: 250 }, estimatedMinutes: { type: "integer", example: 240 }, boss: { type: "boolean" }, career: { $ref: "#/components/schemas/CareerSummary" } } },
        MissionInput: { type: "object", required: ["careerId", "title", "description", "scenario", "difficulty", "xpReward", "estimatedMinutes"], properties: { careerId: { type: "string" }, title: { type: "string", example: "Design a responsive portfolio" }, description: { type: "string", example: "Create a polished portfolio for a junior designer." }, scenario: { type: "string", example: "A designer needs a portfolio before applying for roles." }, difficulty: { type: "string", enum: ["BEGINNER", "INTERMEDIATE", "ADVANCED", "BOSS"] }, xpReward: { type: "integer", minimum: 25, maximum: 5000, example: 250 }, estimatedMinutes: { type: "integer", minimum: 15, example: 240 } } },
      },
    },
  },
  apis: ["./backend/routes/*.js"],
};

module.exports = swaggerJSDoc(options);
