# Local Setup Guide — Forex Journal

A complete step-by-step guide to set up and run the Forex Journal locally on macOS, Linux, or Windows.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Quick Start (5 minutes)](#quick-start-5-minutes)
3. [Full Setup with Database](#full-setup-with-database)
4. [Running the App](#running-the-app)
5. [Platform-Specific Notes](#platform-specific-notes)
6. [Troubleshooting](#troubleshooting)
7. [Optional: AI Features](#optional-ai-features)

---

## Prerequisites

- **Node.js 18+** and **npm** (or yarn/pnpm)
- **Git** (optional, but recommended)
- **OpenAI API key** (optional, for AI analysis features)

### Check installed versions:
```bash
node --version   # should be 18+
npm --version
```

---

## Quick Start (5 minutes)

### No database setup needed — app works with demo data out of the box.

```bash
# 1. Clone the repo (if you haven't already)
git clone https://github.com/ksm-zw/Forex-Journal.git
cd Forex-Journal

# 2. Install dependencies
npm install

# 3. Run dev server
npm run dev

# 4. Open in browser
# → http://localhost:3000
```

**That's it!** The app will run with demo trade data. No database configuration required.

---

## Full Setup with Database

If you want to persist data locally, configure a SQLite database.

### Step 1: Set Environment Variables

Create a `.env.local` file in the repo root:

```bash
# .env.local
DATABASE_URL="file:./prisma/dev.db"
OPENAI_API_KEY="sk-your-api-key-here"  # Optional, for AI analysis
```

### Step 2: Initialize Database

```bash
# Push Prisma schema to the database
npx prisma db push

# (Optional) Create and seed demo data
node scripts/create-demo-user.js
node scripts/seed-demo-trades.js
```

### Step 3: Run the App

```bash
npm run dev
# → Open http://localhost:3000
```

### Verify Data:

```bash
# Check that trades were seeded
curl -H "x-user-id: demo-user-id" http://localhost:3000/api/trades | jq length
```

---

## Running the App

### Development

```bash
npm run dev
```

- Runs on `http://localhost:3000` with hot reload
- Accessible from network: `http://<your-machine-ip>:3000`

### Production Build

```bash
# Build the app
npm run build

# Start production server
npm start
```

- Optimized bundle, served on `http://localhost:3000`
- No hot reload; restart to apply changes

### Type Checking

```bash
npx tsc --noEmit
```

### Testing

```bash
# Run Playwright tests
npx playwright install  # (one-time)
npx playwright test

# Run in UI mode (interactive)
npx playwright test --ui

# Debug mode
npx playwright test --debug
```

---

## Platform-Specific Notes

### macOS & Linux

No special steps required. Follow the Quick Start or Full Setup above.

#### Using Homebrew (macOS):

```bash
# Install Node.js
brew install node

# Verify
node --version && npm --version
```

### Windows

#### Option A: PowerShell (Recommended)

```powershell
# Set environment variables for the session
$env:DATABASE_URL = 'file:./prisma/dev.db'
$env:OPENAI_API_KEY = 'sk-your-key'

# Install and run
npm install
npx prisma db push
npm run dev
```

#### Option B: Batch / CMD

```batch
set DATABASE_URL=file:./prisma/dev.db
set OPENAI_API_KEY=sk-your-key
npm install
npx prisma db push
npm run dev
```

#### Option C: Helper Script (Recommended)

Use the included PowerShell helper script to simplify setup:

```powershell
# Navigate to repo root
cd C:\path\to\Forex-Journal

# Run the helper script (adjust ExecutionPolicy if needed)
powershell -ExecutionPolicy Bypass -File scripts/win-setup.ps1

# Choose from menu:
# 1 → Full setup (install, db push, seed)
# 2 → Dev server
# 3 → Production build
# 4 → Build only
```

---

## Troubleshooting

### "Cannot find module 'next'"

```bash
npm install
```

### Prisma: "DATABASE_URL is not set"

- Create `.env.local` with `DATABASE_URL="file:./prisma/dev.db"`
- Or export it: `export DATABASE_URL="file:./prisma/dev.db"`

### "Port 3000 is already in use"

```bash
# Find and kill the process (macOS/Linux)
lsof -i :3000
kill -9 <PID>

# Windows (PowerShell)
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### Playwright tests fail with "Connection refused"

- Ensure dev server is running: `npm run dev` (in another terminal)
- Or run before tests: `npm run build && npm start`

### "Invalid time value" in calendar/heatmap

- Ensure trade objects have valid `entryTime` and `exitTime` (ISO 8601 strings)
- Example: `"2024-01-15T10:30:00Z"`

### Database file not created

```bash
# Manually create if needed
mkdir -p prisma
touch prisma/dev.db

# Then push schema
npx prisma db push
```

---

## Optional: AI Features (app & CI-safe)

AI features are completely optional. The app and CI are designed to work without an OpenAI API key — builds and tests will succeed even when `OPENAI_API_KEY` is not set (we include a CI workflow that validates this).

If you'd like to enable AI-driven analysis and summaries, follow these steps:

### 1. Get a key

- Sign up at [openai.com](https://platform.openai.com/account/api-keys)
- Copy your API key

### 2. Add to `.env.local`

```env
OPENAI_API_KEY="sk-xxx..."
```

### 3. Use in app

- Go to **Insights**, **Summaries**, or **Analytics** pages
- Click "Analyze with AI" or similar buttons
- Features require an active, funded OpenAI account

Note: If `OPENAI_API_KEY` is missing, the AI API routes return a friendly error and other app functionality continues to work as normal.

---

## Next Steps

- **Read**: [README.md](README.md) for features and architecture
- **Deploy**: [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for Docker/XAMPP/Apache setup
- **Windows users**: See [docs/WINDOWS_SETUP.md](docs/WINDOWS_SETUP.md) for advanced XAMPP/Apache reverse proxy guide
- **Contribute**: See [DEVELOPMENT.md](DEVELOPMENT.md) for code structure and best practices

---

## Project Structure

```
Forex-Journal/
├── src/
│   ├── app/              # Next.js App Router (pages & API routes)
│   ├── components/       # Reusable UI components
│   └── lib/              # Utilities (Prisma wrapper, analytics, etc.)
├── prisma/
│   ├── schema.prisma     # Database schema
│   ├── migrations/       # Prisma migrations
│   ├── seed.js           # Base seeding script
│   └── dev.db            # Local SQLite database (created after db push)
├── public/               # Static files
├── tests/                # Playwright tests
├── scripts/              # Utility scripts (seeding, screenshots, etc.)
├── .env.local            # Local environment (create this file)
├── package.json          # Dependencies & scripts
├── tsconfig.json         # TypeScript config
├── next.config.js        # Next.js config
└── SETUP.md              # This file
```

---

## Common Commands Cheat Sheet

| Command | What it does |
|---------|-------------|
| `npm install` | Install dependencies |
| `npm run dev` | Start dev server (hot reload) |
| `npm run build` | Build for production |
| `npm start` | Run production server |
| `npx prisma db push` | Push schema to database |
| `npx prisma db seed` | Run seed scripts |
| `npx playwright test` | Run all tests |
| `npx playwright test --ui` | Run tests interactively |
| `npx tsc --noEmit` | Type-check TypeScript |

---

## Support

- **Issues**: Open a [GitHub issue](https://github.com/ksm-zw/Forex-Journal/issues)
- **Discussions**: Start a [GitHub discussion](https://github.com/ksm-zw/Forex-Journal/discussions)

Happy trading! 📊✨
