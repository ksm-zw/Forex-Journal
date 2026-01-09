# Windows Setup — Quick Guide (PowerShell)

This guide shows how to run and deploy the app on a Windows machine using PowerShell. It includes quick copy/paste commands and a helper script `scripts/win-setup.ps1` for common tasks.

> Requirements: Node.js LTS (>=18), npm, Git (optional). XAMPP (if you plan to use Apache). For full features, set `DATABASE_URL` (SQLite or Postgres) and `OPENAI_API_KEY`.


## 1) One-time setup

Open PowerShell in the repo root and run:

```powershell
# Install dependencies
npm ci

# Ensure local sqlite DB is configured for Prisma
$env:DATABASE_URL = 'file:./prisma/dev.db'

# Push Prisma schema to DB
npx prisma db push

# (Optional) create demo user and seed demo trades
node scripts/create-demo-user.js
node scripts/seed-demo-trades.js
```

## 2) Run dev server

```powershell
# Use environment for session
$env:OPENAI_API_KEY = 'sk-dummy'
npm run dev
# Open http://localhost:3000
```

## 3) Build & run production server

```powershell
$env:OPENAI_API_KEY = 'sk-dummy'
npm run build
npm run start
```

## 4) Using XAMPP / Apache as a reverse proxy (recommended)

- Start Apache via XAMPP Control Panel.
- Add a vhost that proxies to `http://127.0.0.1:3000/` (see `docs/DEPLOYMENT.md`).
- Add `127.0.0.1 example.local` to `C:\Windows\System32\drivers\etc\hosts` and restart Apache.

## 5) Use helper script

We've included a helper PowerShell script to simplify the commands: `scripts/win-setup.ps1`. See usage below.

---

### scripts/win-setup.ps1 — Available commands

- `.uild` — builds the project (`npm run build`)
- `.






















If you'd like, I can add an example NSSM or Windows Service wrapper to run the production server persistently. Let me know and I will add it.---(If you prefer, just run the commands directly from the guide.)```.\	ests\scripts\win-setup.ps1 -RunDev# Run dev server.\	ests\scripts\win-setup.ps1 -Bootstrap# Bootstrap the DB and seed demo dataSet-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned -Force# Trust the script if necessary (one-time):```powershellExample usage in PowerShell:- `.ull-seed` — runs `node scripts/create-demo-user.js` and `node scripts/seed-demo-trades.js`- `.ootstrap` — sets DATABASE_URL (session), runs `npx prisma db push`, creates demo user and seeds trades- `.
un-prod` — builds and starts production server (`npm run build; npm run start`)un-dev` — runs dev server (`npm run dev`)