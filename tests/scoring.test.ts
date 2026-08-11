import test from "node:test";
import assert from "node:assert/strict";
import { scoreSubmission } from "../src/lib/scoring";

test("complete beginner submission passes and earns bounded XP", () => {
  const result = scoreSubmission({ explanation:"A detailed explanation covering implementation decisions, testing, accessibility, and tradeoffs.", githubUrl:"https://github.com/example/project", liveUrl:"https://example.com", criteriaCompleted:4, criteriaTotal:4, difficulty:"BEGINNER" });
  assert.equal(result.status, "PASSED");
  assert.equal(result.score, 100);
  assert.equal(result.xpEarned, 100);
});

test("submission without optional live URL still receives deterministic feedback", () => {
  const result = scoreSubmission({ explanation:"A sufficiently detailed project explanation describing the implementation approach and important decisions.", githubUrl:"https://github.com/example/project", liveUrl:"", criteriaCompleted:1, criteriaTotal:4, difficulty:"INTERMEDIATE" });
  assert.ok(result.score <= 100);
  assert.ok(result.improvements.some(item => /live/i.test(item)));
});
