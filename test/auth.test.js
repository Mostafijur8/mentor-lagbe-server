import test from "node:test";
import assert from "node:assert/strict";
import jwt from "jsonwebtoken";
import { ObjectId } from "mongodb";
import { verifyToken, verifyRole } from "../src/middleware/auth.js";

process.env.JWT_SECRET = "test-jwt-secret";

function mockRequest(token, user) {
  return {
    headers: { authorization: `Bearer ${token}` },
    app: { locals: { collections: { users: { findOne: async () => user } } } },
  };
}

function mockResponse() {
  const state = { status: 200, payload: null };
  return {
    state,
    status(code) {
      state.status = code;
      return this;
    },
    json(body) {
      state.payload = body;
      return this;
    },
  };
}

test("verifyToken accepts a valid Bearer JWT and refreshes the database role", async () => {
  const id = new ObjectId();
  const token = jwt.sign({ sub: id.toString(), role: "student" }, process.env.JWT_SECRET);
  const req = mockRequest(token, {
    _id: id,
    email: "tutor@example.com",
    name: "Tutor",
    role: "tutor",
    plan: "pro",
  });
  let called = false;

  await verifyToken(req, mockResponse(), () => {
    called = true;
  });

  assert.equal(called, true);
  assert.equal(req.user.role, "tutor");
  assert.equal(req.user.plan, "pro");
  assert.equal(req.user.email, "tutor@example.com");
});

test("verifyToken rejects a missing token", async () => {
  const res = mockResponse();
  await verifyToken({ headers: {} }, res, () => {});
  assert.equal(res.state.status, 401);
  assert.match(res.state.payload.message, /required/i);
});

test("verifyToken rejects an invalid token", async () => {
  const res = mockResponse();
  await verifyToken({ headers: { authorization: "Bearer not-a-jwt" } }, res, () => {});
  assert.equal(res.state.status, 401);
  assert.match(res.state.payload.message, /invalid or expired/i);
});

test("verifyToken rejects a token whose account was removed", async () => {
  const id = new ObjectId();
  const token = jwt.sign({ sub: id.toString() }, process.env.JWT_SECRET);
  const res = mockResponse();
  await verifyToken(mockRequest(token, null), res, () => {});
  assert.equal(res.state.status, 401);
  assert.match(res.state.payload.message, /no longer exists/i);
});

test("verifyRole blocks the wrong role and allows the expected role", () => {
  const guard = verifyRole("admin");
  const blocked = mockResponse();
  let nextCalled = false;
  guard({ user: { role: "student" } }, blocked, () => {
    nextCalled = true;
  });
  assert.equal(blocked.state.status, 403);
  assert.equal(nextCalled, false);

  guard({ user: { role: "admin" } }, mockResponse(), () => {
    nextCalled = true;
  });
  assert.equal(nextCalled, true);
});
