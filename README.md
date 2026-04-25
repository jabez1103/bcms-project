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
- `DB_USER`
- `DB_PASSWORD`
- `DB_NAME`
- `JWT_SECRET` (must be 32+ chars in production)

## Optional environment variables

- `ALLOWED_ORIGINS` (comma-separated origins for auth/cors checks)
- `SYSTEM_LOG_MAX`
- `MAX_NOTIFICATIONS_PER_USER`
- `VAPID_PUBLIC_KEY`
- `VAPID_PRIVATE_KEY`
- `VAPID_SUBJECT`

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
