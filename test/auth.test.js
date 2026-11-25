import test from "node:test";
import assert from "node:assert/strict";
import jwt from "jsonwebtoken";
import { verifyToken } from "../src/middleware/auth.js";

process.env.JWT_SECRET = "test-jwt-secret";

test("verifyToken accepts a valid Bearer JWT", () => {
  const token = jwt.sign({ sub: "123", role: "student" }, process.env.JWT_SECRET);
  const req = { headers: { authorization: `Bearer ${token}` } };
  const res = {};
  let called = false;
  verifyToken(req, res, () => { called = true; });
  assert.equal(called, true);
  assert.equal(req.user.role, "student");
});

test("verifyToken rejects a missing token", () => {
  let status;
  let payload;
  verifyToken({ headers: {} }, {
    status(code) { status = code; return this; },
    json(body) { payload = body; return this; },
  }, () => {});
  assert.equal(status, 401);
  assert.match(payload.message, /required/i);
});
