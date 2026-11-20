// Tests for the building search, the groups and the landmark suggestions
// Run from the project folder:  node --test "tests/module2/*.test.mjs"
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  CAMPUS_ZONES,
  LANDMARK_MAX_LENGTH,
  LANDMARK_SUGGESTIONS,
  ZONE_GROUPS,
  filterZoneGroups,
} from "../../src/lib/campusLocations.ts";

const flat = (groups) => groups.flatMap((g) => g.zones);

test("groups: 7 groups that together hold all 64 blocks", () => {
  assert.equal(ZONE_GROUPS.length, 7);
  assert.equal(flat(ZONE_GROUPS).length, 64);
});

test("groups: no block is repeated and none is missing", () => {
  const all = flat(ZONE_GROUPS);
  assert.equal(new Set(all).size, all.length);
  for (const zone of CAMPUS_ZONES) assert.ok(all.includes(zone), `${zone} is not in any group`);
  for (const zone of all) assert.ok(CAMPUS_ZONES.includes(zone), `${zone} is not a campus block`);
});

test("groups: every group has a name and at least one block", () => {
  for (const g of ZONE_GROUPS) {
    assert.ok(g.label.length > 0);
    assert.ok(g.zones.length > 0, g.label);
  }
});

test("search: empty or spaces-only search returns everything", () => {
  assert.equal(flat(filterZoneGroups("")).length, 64);
  assert.equal(flat(filterZoneGroups("    ")).length, 64);
});

test('search: "library" finds only the Centre Library', () => {
  assert.deepEqual(flat(filterZoneGroups("library")), ["37 - Centre Library"]);
});

test('search: "hostel" finds the 14 hostels (7 boys and 7 girls)', () => {
  const found = flat(filterZoneGroups("hostel"));
  assert.equal(found.length, 14);
  assert.equal(found.filter((z) => z.startsWith("BH-")).length, 7);
  assert.equal(found.filter((z) => z.startsWith("GH-")).length, 7);
});

test("search: upper or lower case gives the same result", () => {
  assert.deepEqual(filterZoneGroups("LIBRARY"), filterZoneGroups("library"));
});

test("search: the order of the words does not matter", () => {
  assert.deepEqual(filterZoneGroups("centre library"), filterZoneGroups("library centre"));
});

test('search: can find a block by its code ("34")', () => {
  assert.ok(flat(filterZoneGroups("34")).includes("34 - School of Computer Science & Engineering"));
});

test("search: a word that matches nothing gives an empty result", () => {
  assert.deepEqual(filterZoneGroups("zzzz"), []);
});

test("search: every word must match (a missing word gives no result)", () => {
  assert.deepEqual(filterZoneGroups("library hostel"), []);
});

test("search: groups with no match are left out", () => {
  for (const g of filterZoneGroups("hostel")) assert.ok(g.zones.length > 0);
});

test("search: does not change the original groups", () => {
  const before = flat(ZONE_GROUPS).length;
  filterZoneGroups("library");
  assert.equal(flat(ZONE_GROUPS).length, before);
});

test("suggestions: 8 different landmarks, all short enough", () => {
  assert.equal(LANDMARK_SUGGESTIONS.length, 8);
  const lower = LANDMARK_SUGGESTIONS.map((s) => s.toLowerCase());
  assert.equal(new Set(lower).size, 8);
  for (const s of LANDMARK_SUGGESTIONS) assert.ok(s.length > 0 && s.length <= LANDMARK_MAX_LENGTH, s);
});
