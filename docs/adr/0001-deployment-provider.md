# ADR 0001: Deployment provider — Render (app) + Neon (Postgres), free tiers

## Context
`deployment_provider` and `PostgreSQL hosting provider` were both explicitly
OPEN in the transfer memory. The business is pre-income: the only user
during this phase is the founder, verifying the product works end-to-end.
The overriding constraint right now is **cost**, not technical scale —
there are no real customers or real PII in the system yet.

Requirements considered:
- $0/month while there's no revenue
- No hard trap that silently deletes data mid-testing
- Docker-native (matches the containerized build already in the repo)
- No ToS conflict with eventually running this as a commercial product
- Straightforward path to a paid tier later without a rewrite

## Decision
- **App hosting: Render**, free web service plan, Frankfurt region.
- **Database: Neon**, free tier, external to Render.

## Reason
- **Vercel was ruled out** despite being the most obvious Next.js host:
  its Hobby (free) plan's ToS restricts it to personal, non-commercial
  use. This is a commercial product, even pre-revenue, so running it
  there is a real ToS risk, not just a style preference.
- **Render's own free Postgres was ruled out**: it auto-deletes the
  database (all data) 30 days after creation unless upgraded to paid. For
  a phase where test data accumulates over weeks of manual verification,
  that's a real risk of silent data loss, not an acceptable trade for
  saving money.
- **Neon's free tier** has no expiration, allows commercial use
  explicitly, and offers enough storage/compute (0.5GB, 100 CU-hours/mo,
  scale-to-zero) for a single tester. Pairing it with Render (rather than
  Render's own DB) avoids the expiry trap while keeping the app host free
  too.
- Both are portable: standard Postgres (Neon) and a standard Dockerfile
  (Render) mean moving to paid tiers, or a different provider entirely,
  later is a config change, not an architecture change.

## Consequences
- Render's free web service sleeps after 15 minutes of inactivity
  (~30-60s cold start on wake). Irrelevant for solo manual testing;
  revisit before any real user-facing demo or pilot.
- No automated backups on Neon's free tier beyond its 6-hour instant
  restore window. Acceptable for test data now; must be revisited before
  any real customer data exists (see S08 `pilot_security_review` /
  `reliability_review`, and the plan's `data_integrity_priority`).
- `render.yaml` intentionally has no `databases:` block since Postgres
  isn't Render-managed — `DATABASE_URL` is a manually-set env var pointing
  at Neon.
- This is a placeholder for the pilot/production deploy target, not the
  final answer — revisit deployment_provider again once there's a
  paying pilot practice and real uptime/backup requirements apply.

## Status
Decided (S00), pre-income/testing phase only.
