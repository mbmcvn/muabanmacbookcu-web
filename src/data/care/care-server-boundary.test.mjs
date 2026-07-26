import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const page = readFileSync(
  new URL("../../app/care/[machine_id]/page.tsx", import.meta.url),
  "utf8",
);
const repository = readFileSync(
  new URL("./care-repository.server.ts", import.meta.url),
  "utf8",
);
const storyLoader = readFileSync(
  new URL("../handover/get-care-story.server.ts", import.meta.url),
  "utf8",
);
const verificationRoute = readFileSync(
  new URL("../../app/care/[machine_id]/verify/route.ts", import.meta.url),
  "utf8",
);
const careActions = readFileSync(
  new URL("../../app/care/[machine_id]/CareActions.tsx", import.meta.url),
  "utf8",
);
const accessStore = readFileSync(
  new URL("./care-access.server.ts", import.meta.url),
  "utf8",
);

test("protected Care loaders run only after current session validation", () => {
  const lifecycle = page.indexOf("resolvePublicCareState(machineCode)");
  const validation = page.indexOf("readCurrentCareAccess(machineCode)");
  const passport = page.indexOf("getPublicCarePassport(machineCode, access)");
  const story = page.indexOf("getCareStory(machineCode, access)");
  assert.ok(lifecycle > 0);
  assert.ok(validation > lifecycle);
  assert.ok(passport > validation);
  assert.ok(story > validation);
  assert.match(
    page,
    /lifecycle\.state === "activation_required"[\s\S]*<ActivationForm/,
  );
  assert.match(page, /if \(!access\)[\s\S]*<VerificationForm/);
  assert.match(repository, /access: CareAccessContext/);
  assert.match(repository, /ownership\.sale\.id !== access\.saleId/);
  assert.match(repository, /ownership\.owner\.id !== access\.ownershipId/);
  assert.match(storyLoader, /access: CareAccessContext/);
});

test("all Care authorization paths use the shared effective ownership resolver", () => {
  assert.match(accessStore, /findEffectiveCareOwnership/);
  assert.ok(
    (repository.match(/findEffectiveCareOwnership/g)?.length ?? 0) >= 3,
  );
  assert.match(repository, /findCareLifecycle/);
  assert.match(repository, /ownership\.owner\.id !== access\.ownershipId/);
});

test("verification and protected mutations expose no raw phone or specific failures", () => {
  assert.match(verificationRoute, /createCareSession\(result\.access\)/);
  assert.doesNotMatch(verificationRoute, /buyer_phone|owner_phone/);
  assert.match(
    verificationRoute,
    /process\.env\.NODE_ENV === "development"[\s\S]*console\.info/,
  );
  assert.match(careActions, /Báo vấn đề với máy/);
  assert.doesNotMatch(careActions, /readCurrentCareAccess|ownership|session/);
  assert.doesNotMatch(
    verificationRoute,
    /not_found|wrong_phone|previous_owner/,
  );
});

test("Homepage and People loaders are not part of the Care gate", () => {
  assert.doesNotMatch(
    page,
    /getHomepageStories|getPeopleStories|getPeopleStoryBySlug/,
  );
});
