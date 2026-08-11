const express = require("express");
const swaggerUi = require("swagger-ui-express");
const Sentry = require("./instrument");
const swaggerSpec = require("./config/swagger");
const missionRoutes = require("./routes/missions.routes");
const systemRoutes = require("./routes/system.routes");
const { notFound, errorHandler } = require("./middleware/error-handler");

const app = express();
app.disable("x-powered-by");
app.use((_request, response, next) => {
  response.set({
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
  });
  next();
});
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: false }));
app.get("/api-docs.json", (_req, res) => res.json(swaggerSpec));
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec, { explorer: true, customSiteTitle: "SkillVerse Express API" }));
app.use("/api", systemRoutes);
app.use("/api/missions", missionRoutes);
Sentry.setupExpressErrorHandler(app);
app.use(notFound);
app.use(errorHandler);

module.exports = app;
