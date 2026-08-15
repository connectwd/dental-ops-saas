import { describe, it, expect, beforeEach, afterAll, vi } from "vitest";
import { prisma } from "@/infrastructure/db/prisma";
import { UnauthorizedError } from "@/domain/tenancy";
import { resetDb, seedTenant } from "./testDb";

// Mock only the session boundary (auth()). resolveActor()'s real job is the
// DB lookup that turns a session into a verified tenant+role — that part
// must run for real, or the test proves nothing about the actual risk here
// (a user resolving into the wrong tenant/role).
vi.mock("@/infrastructure/auth/auth", () => ({
  auth: vi.fn(),
}));

import { auth } from "@/infrastructure/auth/auth";
import { resolveActor } from "@/application/resolveActor";

const mockAuth = vi.mocked(auth);

describe("resolveActor", () => {
  beforeEach(async () => {
    await resetDb();
    mockAuth.mockReset();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("throws UnauthorizedError when there is no session", async () => {
    mockAuth.mockResolvedValue(null as never);

    await expect(resolveActor()).rejects.toThrow(UnauthorizedError);
  });

  it("throws UnauthorizedError when the session's user has no membership", async () => {
    mockAuth.mockResolvedValue({
      user: { email: "nobody@test.local" },
    } as never);

    await expect(resolveActor()).rejects.toThrow(UnauthorizedError);
  });

  it("throws UnauthorizedError when the user's only membership is inactive", async () => {
    const { site } = await seedTenant();
    const removedUser = await prisma.user.create({
      data: { email: "removed@test.local" },
    });
    await prisma.membership.create({
      data: {
        userId: removedUser.id,
        practiceSiteId: site.id,
        role: "STAFF",
        active: false,
      },
    });

    mockAuth.mockResolvedValue({
      user: { email: "removed@test.local" },
    } as never);

    // This is the S02 "removed member loses access" invariant, already
    // load-bearing in S00's resolveActor implementation — worth locking in
    // now rather than waiting for S02 to discover it's untested.
    await expect(resolveActor()).rejects.toThrow(UnauthorizedError);
  });

  it("resolves the correct tenant and MANAGER role for a manager session", async () => {
    const { org, site, manager } = await seedTenant();
    mockAuth.mockResolvedValue({ user: { email: manager.email } } as never);

    const actor = await resolveActor();

    expect(actor).toEqual({
      userId: manager.id,
      email: manager.email,
      practiceSiteId: site.id,
      organisationId: org.id,
      role: "MANAGER",
    });
  });

  it("resolves STAFF role (not MANAGER) for a staff session at the same site", async () => {
    // Guards against a query bug that returns "a" membership for the site
    // instead of "the membership belonging to this specific user".
    const { staff } = await seedTenant();
    mockAuth.mockResolvedValue({ user: { email: staff.email } } as never);

    const actor = await resolveActor();

    expect(actor.role).toBe("STAFF");
  });
});
