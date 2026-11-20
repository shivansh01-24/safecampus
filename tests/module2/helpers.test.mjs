// Tests for the Module 2 location helpers (src/lib/campusLocations.ts)
// Run from the project folder:  node --test "tests/module2/*.test.mjs"
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  CAMPUS_ZONES,
  DEFAULT_LOCATION,
  FLOOR_OPTIONS,
  LANDMARK_MAX_LENGTH,
  cleanLocation,
  formatLocation,
  isValidLocation,
} from "../../src/lib/campusLocations.ts";

const ZONE = "34 - School of Computer Science & Engineering";

test("data: 64 unique campus blocks", () => {
  assert.equal(CAMPUS_ZONES.length, 64);
  assert.equal(new Set(CAMPUS_ZONES).size, 64);
});

test("data: 8 floor options and landmark limit is 80", () => {
  assert.equal(FLOOR_OPTIONS.length, 8);
  assert.equal(LANDMARK_MAX_LENGTH, 80);
});

test("default location: no building selected, ground floor", () => {
  assert.equal(DEFAULT_LOCATION.zone, "");
  assert.equal(DEFAULT_LOCATION.floor, "Ground Floor");
  assert.equal(DEFAULT_LOCATION.landmark, "");
});

test("cleanLocation: removes extra spaces from the landmark", () => {
  const out = cleanLocation({ zone: ZONE, floor: "2nd Floor", landmark: "   Lab    204  " });
  assert.equal(out.landmark, "Lab 204");
});

test("cleanLocation: tabs and new lines become one space", () => {
  const out = cleanLocation({ zone: ZONE, floor: "2nd Floor", landmark: "Lab\n\t204" });
  assert.equal(out.landmark, "Lab 204");
});

test("cleanLocation: cuts a long landmark to 80 characters", () => {
  const out = cleanLocation({ zone: ZONE, floor: "2nd Floor", landmark: "a".repeat(120) });
  assert.equal(out.landmark.length, 80);
});

test("cleanLocation: keeps zone and floor, empty landmark stays empty", () => {
  const out = cleanLocation({ zone: ZONE, floor: "3rd Floor", landmark: "   " });
  assert.deepEqual(out, { zone: ZONE, floor: "3rd Floor", landmark: "" });
});

test("cleanLocation: does not change the object that was passed in", () => {
  const input = { zone: ZONE, floor: "2nd Floor", landmark: "  Lift  " };
  cleanLocation(input);
  assert.equal(input.landmark, "  Lift  ");
});

test("isValidLocation: a real building and floor is valid", () => {
  assert.equal(isValidLocation({ zone: ZONE, floor: "2nd Floor", landmark: "" }), true);
});

test("isValidLocation: every one of the 64 blocks is valid", () => {
  for (const zone of CAMPUS_ZONES) {
    assert.equal(isValidLocation({ zone, floor: "Ground Floor", landmark: "" }), true, zone);
  }
});

test("isValidLocation: unknown building is not valid", () => {
  assert.equal(isValidLocation({ zone: "Fake Block", floor: "Ground Floor", landmark: "" }), false);
});

test("isValidLocation: no building selected is not valid", () => {
  assert.equal(isValidLocation(DEFAULT_LOCATION), false);
});

test("isValidLocation: unknown floor is not valid", () => {
  assert.equal(isValidLocation({ zone: ZONE, floor: "99th Floor", landmark: "" }), false);
});

test("formatLocation: building | floor | landmark", () => {
  const line = formatLocation({ zone: ZONE, floor: "2nd Floor", landmark: "Lab 204" });
  assert.equal(line, `${ZONE} | 2nd Floor | Lab 204`);
});

test("formatLocation: leaves out an empty landmark", () => {
  assert.equal(formatLocation({ zone: ZONE, floor: "2nd Floor", landmark: "" }), `${ZONE} | 2nd Floor`);
  assert.equal(formatLocation({ zone: ZONE, floor: "2nd Floor", landmark: "   " }), `${ZONE} | 2nd Floor`);
});
