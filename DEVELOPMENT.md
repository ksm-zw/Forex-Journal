# 🛠 Development Guide — Forex Journal

Welcome — this doc helps contributors get the project running locally, explains key developer workflows, and outlines testing and troubleshooting steps. Use this as your one-stop reference while working on features or fixes. 🚀

---

## 🧰 Prerequisites

- Node.js 18+ (recommended via nvm)
- npm (or yarn/pnpm)
- (Optional) `sqlite` / Postgres if you want a local DB
- Recommended editor: VS Code with TypeScript, ESLint, and Prettier extensions

---

## 🔁 Quick local setup

1. Clone the repo and install dependencies:

```bash
git clone <repo-url>
cd Forex-Journal
npm install
```

2. Copy environment template (create `.env.local`):

```bash
cp .env.example .env.local  # if .env.example exists
# or create .env.local manually
```

3. (Optional) Use a local SQLite DB for realistic data:

```env
# .env.local
DATABASE_URL="file:./dev.db"
# Optional OpenAI key for analysis feature
OPENAI_API_KEY=sk-xxx
```

4. Push Prisma schema and seed data (if using DB):

```bash
npx prisma db push
node prisma/seed.js
```

5. Start dev server:

```bash
npm run dev
```

Open http://localhost:3000

---

## 🔍 Key developer workflows

### Type-checking

```bash
npx tsc --noEmit
```

Run this often to keep TypeScript errors surfaced early.

### Build & production check

```bash
npm run build
# After build you can run the production server (if you have set envs)
npm start
```

### Lint & format

Use ESLint and Prettier (project configured):

```bash
npm run lint
npm run format
```

### Playwright (E2E / visual) tests

- Install browsers once:

```bash
npx playwright install
```

- Run tests:

```bash
npx playwright test
```

Note: Playwright can report `ERR_CONNECTION_REFUSED` if the dev server isn't running or not accessible to the test runner. Start the server in the same environment before running tests.

### Screenshots helper

A screenshot helper exists at `scripts/screenshot.js`. Useful for capturing pages for visual diffs or demos:

```bash
node scripts/screenshot.js
```

---

## ♻️ Demo data & safe DB handling

- The app supports a demo data fallback. If `DATABASE_URL` is missing or invalid, the server uses `data/demo-trades.json` (it also checks `src/data/` and `public/data/`).
- We added a safe Prisma wrapper at `src/lib/prisma.ts` which returns `null` if Prisma cannot be instantiated. API routes guard against `prisma === null` and either serve demo data or return a 503 when appropriate.

Troubleshooting: If you see an error like `the URL must start with the protocol file:`, ensure `DATABASE_URL` is set to `file:./dev.db` for SQLite.

---

## 🐛 Common issues & fixes

- Invalid time value in heatmap / charts:
  - Symptoms: runtime RangeError `Invalid time value` from `YearlyHeatmap`.
  - Root cause: `entryTime` or `exitTime` values are missing/invalid.
  - Fix: Validate or provide ISO date strings; the component now skips invalid entries safely.

- Playwright `ERR_CONNECTION_REFUSED`:
  - Make sure `npm run dev` is running (or start a server before tests).
  - If running in CI, ensure the test runner can access the server host/port.

- Prisma initialization errors:
  - Ensure `.env.local` has `DATABASE_URL` set correctly.
  - For SQLite: `DATABASE_URL="file:./dev.db"` and then run `npx prisma db push`.

---

## ✅ Adding a feature or fixing a bug (workflow)

1. Create a branch from `main`:

```bash
git checkout -b feat/my-new-feature
```

2. Implement the feature and include tests (unit / Playwright / accessibility) when possible.
3. Run type-checks & tests locally:

```bash
npx tsc --noEmit
npx playwright test
npm run lint
```

4. Commit with a concise message (conventional commits preferred):

```
feat: add heatmap smoothing
fix: handle invalid trade dates in heatmap
chore: update deps
```

5. Push and open a PR against `main`. Keep PRs small and focused.

---

## 🧪 Tests & coverage

- Unit tests: (Add if/when unit tests are added).
- E2E / visual: Playwright (see `tests/` and `scripts/screenshot.js`).
- Accessibility: `tests/a11y.spec.ts` demonstrates a11y checks.

---

## 🏷 Commit & PR guidelines

- Use short, meaningful commit titles and a descriptive body when needed.
- Reference issues in PR descriptions and list steps to reproduce bugs or test features.
- Keep code reviews respectful and actionable.

---

## 🧾 Release & deployment notes

- We recommend using Vercel for deployment (Next.js first-class support). For hosts without DB, demo fallback ensures the app is still usable.
- Ensure env vars are configured on the host (`OPENAI_API_KEY`, `DATABASE_URL`).

---

## 💬 Support & questions

- Open an issue for bugs, feature requests, or questions.
- For quick help, mention a maintainer or request a review in your PR.

---

*Thanks for contributing — happy hacking and profitable trading!* 🎯📈
