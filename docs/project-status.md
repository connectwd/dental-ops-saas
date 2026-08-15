# Project Status

current_slice: S00
current_task: foundation scaffold built; not yet gate-verified against a real Postgres instance
slice_status: ACTIVE

## completed_acceptance
- Next.js App Router + TypeScript + Tailwind scaffolded (`create-next-app`)
- domain/application/infrastructure separation established
  (`src/domain`, `src/application`, `src/infrastructure`)
- Prisma schema created: `Organisation`, `PracticeSite`, `User`, `Membership`
  (minimal tenancy only — no Asset/QR/Inspection models, as required)
- Auth baseline: NextAuth (Auth.js) JWT sessions, dev Credentials provider
  (email lookup against seeded Users). Structured so a real Auth0/OIDC
  provider can be swapped in via config, not architecture change.
- `resolveActor()` application service: server-side chokepoint resolving
  actor + tenant (organisationId, practiceSiteId, role) from session —
  required by S00 ("server can resolve actor+tenant for protected operations")
- Middleware protecting `/app/*` routes, redirecting unauthenticated users to `/login`
- Protected empty application shell at `/app` (demo target)
- Health/smoke endpoint at `/api/health` (checks DB connectivity)
- Global error boundary (`src/app/error.tsx`)
- Seed script (`prisma/seed.ts`) — one org, one site, one manager, one staff user
- `docker-compose.yml` for local Postgres
- `Dockerfile` (standalone Next.js build)
- GitHub Actions CI: postgres service, migrate, lint, typecheck, build
- `.env.example` (no secrets committed)

## remaining_acceptance (S00 gate not yet passed)
- [ ] Run `npx prisma migrate dev --name init` against a live Postgres to
      generate the first migration (blocked here: no persistent Postgres in
      this sandbox, and Prisma engine binary download is network-restricted
      in this environment — must be run in a real dev environment)
- [ ] Verify fresh-clone bootstrap: clone → `npm install` → configure `.env.local`
      → `docker compose up -d` → `npx prisma migrate dev` → `npm run dev`
- [ ] Manually verify: log in via `/login` (seeded email) → reach `/app` shell
- [ ] Confirm CI pipeline actually goes green (not just written)
- [ ] Choose and configure real deployment provider (still OPEN)
- [ ] Decide production auth provider (Auth0 vs alternative OIDC — still OPEN)
- [ ] `npm audit` / dependency review before calling S00 DONE

## blockers
- This sandbox cannot download the Prisma engine binaries (network policy),
  so the migration itself has not been executed or verified here. The schema
  is written and reviewed, but "DB migration fresh-install succeeds" (S00
  test) is **not yet proven**. This must be the first thing verified in a
  real dev environment before writing any S01 code.
- deployment_provider: still OPEN per transfer_memory — no infra chosen yet.

## decisions_made
- Auth: ship dev-only email Credentials provider for S00; defer real
  Auth0/OIDC wiring to when credentials/tenant exist (reversible, config-level).
- Tenancy naming: used `Organisation` / `PracticeSite` (per transfer_memory
  "safe_model_direction") rather than overloading "Practice".

## unresolved_product_questions
(unchanged from transfer_memory — none resolved or needed for S00)

## known_P0_P1
- None yet — no code has been exercised against a real database.

## known_P2_P3
- None logged yet.

## intentional_debt
- No automated tests written yet for S00 (health check exists but isn't
  asserted by a test runner). Should add before marking S00 DONE per
  pm_rules #21 ("tests are part of slice; not later cleanup").
- No `packages/` monorepo split — kept as a single `apps/web`-shaped app for
  now since S00 doesn't need the extraction yet (reversible).

## next_exact_task
1. In a real dev environment (or any sandbox with unrestricted network /
   local Postgres): run `docker compose up -d`, then
   `npx prisma migrate dev --name init`, then `npm run dev`, then confirm the
   five S00 tests pass (app boots, migration succeeds, auth boundary works,
   tenant context resolvable, CI clean).
2. Add minimal automated tests: (a) integration test hitting `/api/health`,
   (b) integration test proving `resolveActor()` throws `UnauthorizedError`
   with no session and returns correct tenant with a seeded session.
3. Only after gate_S00 passes: begin S01 (asset → QR → scan → inspect →
   history). Do not start S01 UI/data model before that.

## last_verified_deploy
None — not yet deployed anywhere.
