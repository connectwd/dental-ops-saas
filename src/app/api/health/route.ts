import { NextResponse } from "next/server";
import { prisma } from "@/infrastructure/db/prisma";

export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({ status: "ok", db: "connected" });
  } catch (err) {
    return NextResponse.json(
      { status: "degraded", db: "unreachable", error: (err as Error).message },
      { status: 503 }
    );
  }
}
