const test = require("node:test");
const assert = require("node:assert/strict");

process.env.NODE_ENV = "test";
const app = require("../backend/app");
const swaggerSpec = require("../backend/config/swagger");

test("Swagger exposes documented health and mission CRUD operations", () => {
  assert.equal(swaggerSpec.openapi, "3.0.3");
  assert.ok(swaggerSpec.paths["/api/health"].get);
  assert.ok(swaggerSpec.paths["/api/missions"].get);
  assert.ok(swaggerSpec.paths["/api/missions"].post);
  assert.ok(swaggerSpec.paths["/api/missions/{id}"].patch);
  assert.ok(swaggerSpec.paths["/api/missions/{id}"].delete);
  assert.equal(swaggerSpec.components.securitySchemes.bearerAuth.scheme, "bearer");
});

test("Express health endpoint responds safely with security headers", async (t) => {
  const server = app.listen(0);
  t.after(() => new Promise(resolve => server.close(resolve)));
  await new Promise(resolve => server.once("listening", resolve));
  const { port } = server.address();
  const response = await fetch(`http://127.0.0.1:${port}/api/health`);
  const body = await response.json();
  assert.equal(response.status, 200);
  assert.equal(body.status, "ok");
  assert.equal(response.headers.get("x-content-type-options"), "nosniff");
  assert.equal(response.headers.get("x-powered-by"), null);
});

test("unknown Express routes return the existing JSON error shape", async (t) => {
  const server = app.listen(0);
  t.after(() => new Promise(resolve => server.close(resolve)));
  await new Promise(resolve => server.once("listening", resolve));
  const { port } = server.address();
  const response = await fetch(`http://127.0.0.1:${port}/api/not-real`);
  const body = await response.json();
  assert.equal(response.status, 404);
  assert.match(body.message, /not found/i);
});
