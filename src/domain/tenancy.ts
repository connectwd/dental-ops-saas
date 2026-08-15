// Domain types. No Prisma, no Next.js, no React here.
// This is the vocabulary S00-S08 build on. Keep it framework-independent.

export type MembershipRole = "MANAGER" | "STAFF";

export interface ActorContext {
  userId: string;
  email: string;
  practiceSiteId: string;
  organisationId: string;
  role: MembershipRole;
}

export class UnauthorizedError extends Error {
  constructor(message = "Not authorized") {
    super(message);
    this.name = "UnauthorizedError";
  }
}

export function requireRole(actor: ActorContext, allowed: MembershipRole[]): void {
  if (!allowed.includes(actor.role)) {
    throw new UnauthorizedError(`Requires role: ${allowed.join(" or ")}`);
  }
}
