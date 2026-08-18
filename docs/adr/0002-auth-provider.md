# ADR 0002: Auth provider — self-hosted Auth.js (Auth.js/NextAuth), not a paid IdP

## Context
`auth provider` was OPEN in the transfer memory, which originally assumed
an Auth0/OIDC direction. S00 shipped a working Auth.js (NextAuth) setup
with a dev-only email Credentials provider on top of our own
`User`/`Membership` tables, with `resolveActor()` already tested against
it. The founder's overriding constraint during this phase is cost.

## Decision
Continue with self-hosted Auth.js, backed by our own Postgres tables — do
not adopt Auth0, Clerk, WorkOS, or Supabase Auth for the pilot MVP.

## Reason
- Paid identity vendors earn their cost primarily through enterprise
  SSO/SCIM. `MVP_OUT` explicitly excludes SSO — paying for that capability
  now would violate the plan's own dependency policy ("reject_if: solves
  hypothetical future issue").
- All major vendor options (Auth0, Clerk, WorkOS, Supabase) are
  US-headquartered, which adds a GDPR international-transfer question for
  UK dental staff data that self-hosting on our own EU-region Postgres
  avoids.
- Zero cost fits the pre-income constraint directly — no per-MAU pricing.
- The current implementation is already the right shape: `resolveActor()`
  resolves actor+tenant from the session, and that boundary is
  integration-tested. Swapping the credentials mechanism later (see
  Consequences) is a change inside `src/infrastructure/auth/auth.ts`, not
  an architecture change.

## Consequences
- The dev-only email-lookup Credentials provider (no password) still
  needs to become a real login mechanism before this is usable by anyone
  other than the founder testing locally. Candidates, not yet decided:
  passwordless email magic-links (fits the plan's "low-friction frontline
  UX" principle better than passwords for non-technical staff), or
  password + bcrypt. This is next-task work, not yet implemented.
- If a real customer later requires enterprise SSO, that's an explicit
  ICEBOX→candidate promotion per the plan's `feature_promotion_rule`
  ("only with user/customer evidence") — WorkOS is the likely candidate
  then, since its free tier covers basic auth up to 1M MAU and only
  charges per SSO connection, rather than Auth0/Clerk's per-MAU model.
- Revisit this ADR if/when SSO becomes a real requirement.

## Status
Decided (S00).
