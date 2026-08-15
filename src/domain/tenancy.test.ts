import { describe, it, expect } from "vitest";
import { requireRole, UnauthorizedError, type ActorContext } from "./tenancy";

// Pragmatic-programmer framing: these tests exist to answer "does the
// authorization contract hold?", not "does the function's code look
// right?". Every case here maps to a real consequence if it breaks:
// a wrong answer here is a security boundary failure (P0 per the dev plan).

function actor(overrides: Partial<ActorContext> = {}): ActorContext {
  return {
    userId: "user-1",
    email: "test@example.com",
    practiceSiteId: "site-1",
    organisationId: "org-1",
    role: "STAFF",
    ...overrides,
  };
}

describe("requireRole", () => {
  it("allows an actor whose role is in the allowed list", () => {
    expect(() => requireRole(actor({ role: "MANAGER" }), ["MANAGER"])).not.toThrow();
  });

  it("allows an actor when the allowed list has multiple roles and actor matches one", () => {
    expect(() =>
      requireRole(actor({ role: "STAFF" }), ["MANAGER", "STAFF"])
    ).not.toThrow();
  });

  it("blocks an actor whose role is not in the allowed list", () => {
    expect(() => requireRole(actor({ role: "STAFF" }), ["MANAGER"])).toThrow(
      UnauthorizedError
    );
  });

  it("blocks every actor when the allowed list is empty", () => {
    // Regression guard: an empty allow-list must fail closed, not open.
    // A future refactor that changes `.includes` to something that treats
    // an empty array as "no restriction" would silently remove an
    // authorization boundary.
    expect(() => requireRole(actor({ role: "MANAGER" }), [])).toThrow(
      UnauthorizedError
    );
  });

  it("includes the allowed roles in the error so failures are debuggable", () => {
    expect(() => requireRole(actor({ role: "STAFF" }), ["MANAGER"])).toThrow(
      /MANAGER/
    );
  });
});
