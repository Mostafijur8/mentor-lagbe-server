import test from "node:test";
import assert from "node:assert/strict";
import { ObjectId } from "mongodb";
import { toObjectId, serializeDocument, escapeRegex } from "../src/utils/helpers.js";

test("toObjectId accepts a valid MongoDB id", () => {
  const id = new ObjectId();
  assert.equal(toObjectId(id.toString()).toString(), id.toString());
});

test("toObjectId rejects malformed ids", () => {
  assert.equal(toObjectId("not-an-object-id"), null);
});

test("serializeDocument converts its MongoDB id to a string", () => {
  const id = new ObjectId();
  assert.equal(serializeDocument({ _id: id, name: "Tutor" })._id, id.toString());
});

test("escapeRegex neutralizes regular expression characters", () => {
  const escaped = escapeRegex("HSC (Physics) + Math?");
  assert.equal(escaped, "HSC \\(Physics\\) \\+ Math\\?");
  assert.equal(new RegExp(escaped, "i").test("hsc (physics) + math?"), true);
});
