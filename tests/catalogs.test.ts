import test from "node:test";
import assert from "node:assert/strict";
import { careerMissionCatalog } from "../src/lib/mission-catalog";
import { careerRoadmaps } from "../src/lib/roadmap-catalog";
import { mentorInstructions, resolveAiProvider } from "../src/lib/ai-mentor";

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

test("AI Mentor instructions include learner context and safety boundaries", () => {
  const instructions=mentorInstructions({name:"Test Learner",career:"Frontend Developer",level:3,xp:1250});
  assert.match(instructions,/Test Learner/);
  assert.match(instructions,/Frontend Developer/);
  assert.match(instructions,/do not invent/i);
  assert.match(instructions,/guarantee employment/i);
});

test("AI Mentor uses Groq when configured",()=>{
  const provider=resolveAiProvider({AI_PROVIDER:"groq",GROQ_API_KEY:"test-groq"});
  assert.equal(provider?.provider,"groq");
  assert.equal(provider?.model,"llama-3.3-70b-versatile");
  assert.equal(provider?.baseURL,"https://api.groq.com/openai/v1");
});

test("AI Mentor falls back to OpenAI",()=>{
  const provider=resolveAiProvider({OPENAI_API_KEY:"test-openai"});
  assert.equal(provider?.provider,"openai");
  assert.equal(provider?.model,"gpt-5-mini");
});

test("AI Mentor requires a configured provider",()=>{
  assert.equal(resolveAiProvider({}),null);
});
