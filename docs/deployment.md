# Deployment — Render (app) + Neon (Postgres), free tier

See `docs/adr/0001-deployment-provider.md` for why. This is the pre-income
testing setup: $0/month, single tester.

## 1. Create the Neon database
1. Sign up at neon.com (no card required for free tier).
2. Create a project — pick a region close to you (or `eu-central-1`
   Frankfurt to stay consistent with Render's region below).
3. Neon gives you a connection string immediately. Use the **pooled**
   connection string (has `-pooler` in the hostname) for `DATABASE_URL` —
   Next.js server functions open/close connections frequently, and Neon's
   pooler handles that better than a direct connection.
4. Keep this connection string handy for step 3.

## 2. Push this repo to GitHub (already done)
Render deploys from a connected GitHub repo. Already set up at
`https://github.com/connectwd/dental-ops-saas`.

## 3. Create the Render Blueprint
1. Sign up at render.com (no card required for free tier).
2. New → Blueprint → connect the `connectwd/dental-ops-saas` GitHub repo.
3. Render detects `render.yaml` and shows one service:
   `dental-ops-saas` (Docker, Frankfurt, free plan).
4. Before deploying, Render will prompt for the env vars marked
   `sync: false` in `render.yaml`:
   - `DATABASE_URL` → paste the Neon pooled connection string from step 1.
   - `AUTH_SECRET` → leave as-is; Render generates a strong random value
     (`generateValue: true` in the blueprint).
5. Approve and deploy.

## 4. What happens on deploy
1. Render builds the Docker image (`Dockerfile`).
2. **Pre-deploy command** runs inside that image: `npx prisma migrate
   deploy` — applies `prisma/migrations/` against the Neon database. If
   this fails, Render keeps the previous version live and does not switch
   traffic to the new (broken) deploy.
3. If migration succeeds, the new container starts and traffic switches
   to it.
4. Render hits `/api/health` (configured `healthCheckPath`) to confirm
   the new instance is actually up before considering the deploy healthy.

## 5. Seed data (manual, not automatic)
Seed data is deliberately **not** part of the pre-deploy command — the
plan's migration rules say seed data stays separate from production data,
and auto-seeding on every deploy would silently re-run against a database
that already has real records once real users exist.

To seed the first time, run it locally against the Neon database:

```bash
DATABASE_URL="<the same Neon pooled connection string>" npx tsx prisma/seed.ts
```

## 6. Verify
1. Visit the `.onrender.com` URL Render gives you.
2. It should redirect to `/login`.
3. Log in with `manager@example-dental.co.uk` (seeded user, dev
   Credentials provider — see `docs/adr/0002-auth-provider.md` for why
   there's no password yet).
4. You should land on the protected `/app` shell showing your seeded
   role/tenant.
5. Check `https://<your-app>.onrender.com/api/health` returns
   `{"status":"ok","db":"connected"}`.

## Known limitations of this setup (acceptable for pre-income testing only)
- Render free web service sleeps after 15 min idle; first request after
  that takes ~30-60s to wake.
- Neon free tier has no long-term automated backups beyond a 6-hour
  instant-restore window.
- Both must be revisited (see ADR 0001) before any real pilot practice
  uses this — this setup optimizes for $0 cost with one tester, not for
  reliability guarantees a real customer's data would need.
