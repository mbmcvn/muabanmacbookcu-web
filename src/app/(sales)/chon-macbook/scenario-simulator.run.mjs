import { runRecommendationAuditHarness } from "./scenario-simulator.ts";

console.log(JSON.stringify({ generatedAt: "deterministic-fixture-v0", scenarios: runRecommendationAuditHarness() }, null, 2));
