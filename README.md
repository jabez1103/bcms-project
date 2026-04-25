# BCMS Project

A Next.js 16 web application for BCMS workflows (admin, signatory, and student modules) with API routes and MySQL-backed data.

## Local setup

1. Install dependencies:

```bash
npm install
```

2. Create your local environment file from the example:

```bash
# Linux/macOS
cp .env.example .env.local

# Windows PowerShell
Copy-Item .env.example .env.local
```

3. Fill in values in `.env.local`, especially database credentials and `JWT_SECRET`.

4. Start development:

```bash
npm run dev
```

## Required environment variables

The app reads these values at runtime:

- `DB_HOST`
- `DB_PORT`
- `DB_USER`
- `DB_PASSWORD`
- `DB_NAME`
- `JWT_SECRET` (must be 32+ chars in production)

## Optional environment variables

- `ALLOWED_ORIGINS` (comma-separated origins for auth/cors checks)
- `DB_SSL` (`true`/`false`)
- `DB_SSL_CA` (Aiven CA cert PEM text or base64 PEM)
- `DB_CONNECT_TIMEOUT_MS`
- `SYSTEM_LOG_MAX`
- `MAX_NOTIFICATIONS_PER_USER`
- `VAPID_PUBLIC_KEY`
- `VAPID_PRIVATE_KEY`
- `VAPID_SUBJECT`
- `ALLOW_LOCAL_UPLOADS_IN_PRODUCTION` (default `false`; keep disabled for cloud deployments)

## Required one-time migration

Before first production startup, ensure the session column exists:

```bash
npm run migrate:session-token
```

This app now verifies required schema at runtime and no longer performs `ALTER TABLE` automatically in request paths.

## Production readiness checks

Run these before every deployment:

```bash
npm run lint
npm run build
```

Both commands should pass without errors.

## Deployment

### Deploy to Vercel

1. Import this repository in Vercel.
2. Add the required environment variables in Project Settings -> Environment Variables.
3. Set build command to `npm run build` (default).
4. Set start command to `npm run start` if needed for custom runtime configuration.
5. Deploy.

### Vercel + Aiven MySQL checklist

1. In Aiven, create a MySQL service and allow inbound IPs:
   - For Vercel, allow `0.0.0.0/0` temporarily, then tighten to known egress addresses if available.
2. Download the Aiven CA certificate.
3. Add these Vercel environment variables:
   - `DB_HOST` = Aiven host
   - `DB_PORT` = Aiven port
   - `DB_USER` = Aiven username
   - `DB_PASSWORD` = Aiven password
   - `DB_NAME` = your database
   - `DB_SSL` = `true`
   - `DB_SSL_CA` = CA cert content (or base64-encoded cert)
   - `JWT_SECRET` = long random value (32+ chars)
   - `ALLOWED_ORIGINS` = your production domain(s), comma-separated
4. Run required schema setup before traffic:
   - `npm run migrate:session-token`
   - Use MySQL Workbench (or Aiven console) to apply your remaining SQL migrations/seeds.
5. Redeploy and verify:
   - Login works
   - `/api/me` returns authenticated user
   - CRUD + submission/review paths work

### Deploy to your own Node server

1. Build:

```bash
npm run build
```

2. Start production server:

```bash
npm run start
```

3. Ensure your reverse proxy routes traffic to the Next.js server and serves HTTPS.

## Notes

- Keep `.env.local` out of version control.
- Do not commit secrets.
- Build output under `.next/` should not be committed.
- Self-service forgot-password is intentionally disabled for security hardening; use admin-assisted resets.
