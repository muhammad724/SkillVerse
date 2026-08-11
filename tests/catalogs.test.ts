import test from "node:test";
import assert from "node:assert/strict";
import { careerMissionCatalog } from "../src/lib/mission-catalog";
import { careerRoadmaps } from "../src/lib/roadmap-catalog";

test("every supported career has unique missions and a roadmap", () => {
  const careers = Object.keys(careerMissionCatalog);
  assert.ok(careers.includes("Frontend Developer"));
  assert.ok(careers.includes("Full-Stack Developer"));
  for (const career of careers) {
    assert.ok(careerMissionCatalog[career].length >= 4, `${career} needs four missions`);
    assert.ok(careerRoadmaps[career].length >= 4, `${career} needs a roadmap`);
    assert.equal(new Set(careerMissionCatalog[career].map(item => item.title)).size, careerMissionCatalog[career].length);
  }
});

test("Frontend and Full-Stack careers include CSS-oriented learning", () => {
  const frontendText = JSON.stringify(careerMissionCatalog["Frontend Developer"]).toLowerCase();
  const fullStackText = JSON.stringify(careerRoadmaps["Full-Stack Developer"]).toLowerCase();
  assert.match(frontendText, /css/);
  assert.match(fullStackText, /frontend|interface|ui/);
});
