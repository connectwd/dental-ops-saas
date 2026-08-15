import { describe, it, expect, afterAll } from "vitest";
import { GET } from "@/app/api/health/route";
import { prisma } from "@/infrastructure/db/prisma";

// This is the test CI/an operator relies on to answer "is the deployed
// service actually able to reach its database?" — a wrong answer here means
// the health check is lying, which is worse than not having one.

describe("GET /api/health", () => {
  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("reports ok and confirms DB connectivity when the database is reachable", async () => {
    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({ status: "ok", db: "connected" });
  });
});
