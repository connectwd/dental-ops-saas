import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import type { Provider } from "next-auth/providers";
import { prisma } from "@/infrastructure/db/prisma";

// AUTH DIRECTION (transfer_memory: auth.provider = Auth0/OIDC, status P).
// For S00 we ship a dev Credentials provider (email lookup against seeded
// Users only — no password, no self-signup) so the protected-route flow can
// be built and tested without external OIDC credentials.
// Swapping to a real Auth0/OIDC provider is a config-only change here, not an
// architecture change: whichever provider runs, it must resolve to a User
// row that resolveActor() can find a Membership for.
//
// ADR needed before pilot: confirm Auth0 vs alternative OIDC provider
// (transfer_memory critical_open_technical_questions: "final auth provider").

const providers: Provider[] = [
  Credentials({
    name: "Dev Login (email only)",
    credentials: {
      email: { label: "Email", type: "email" },
    },
    async authorize(credentials) {
      const email = credentials?.email as string | undefined;
      if (!email) return null;
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) return null;
      return { id: user.id, email: user.email, name: user.displayName ?? undefined };
    },
  }),
];

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers,
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
});
