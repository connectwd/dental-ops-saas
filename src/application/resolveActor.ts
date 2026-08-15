import { prisma } from "@/infrastructure/db/prisma";
import { auth } from "@/infrastructure/auth/auth";
import { ActorContext, UnauthorizedError } from "@/domain/tenancy";

// S00 requirement: "server can resolve actor+tenant for protected operations".
// Every protected server action/route MUST call this instead of trusting
// any client-supplied tenant/user id.
export async function resolveActor(): Promise<ActorContext> {
  const session = await auth();
  if (!session?.user?.email) {
    throw new UnauthorizedError("No authenticated session");
  }

  const membership = await prisma.membership.findFirst({
    where: { user: { email: session.user.email }, active: true },
    include: { user: true, practiceSite: true },
  });

  if (!membership) {
    throw new UnauthorizedError("Authenticated user has no active practice membership");
  }

  return {
    userId: membership.userId,
    email: membership.user.email,
    practiceSiteId: membership.practiceSiteId,
    organisationId: membership.practiceSite.organisationId,
    role: membership.role,
  };
}
