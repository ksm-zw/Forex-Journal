# 📘 Forex Journal — Trading Journal Web App

> A lightweight, beautiful trading journal built with Next.js, TypeScript, Prisma, Tailwind CSS, Framer Motion, and Recharts. Track trades, analyze performance, and build better trading habits. ✨

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm/yarn/pnpm
- (Optional) A database for persistence (SQLite / Postgres). If you don't provide one, the app will gracefully fall back to demo data.
- (Optional) OpenAI API key for the AI analysis feature: `OPENAI_API_KEY`

### Install & Run
```bash
# Install deps
npm install

# Run dev server
npm run dev

# Build for production
npm run build
npm start
```

Open: http://localhost:3000 ✨

---

## 🔧 Environment & Database

- To use a local SQLite DB, set in `.env.local`:
```env
DATABASE_URL="file:./dev.db"
```
- Initialize / push schema & seed:
```bash
npx prisma db push
node prisma/seed.js
```
- If `DATABASE_URL` is missing or invalid, the server will **not** crash — API routes fall back to demo JSON files in `data/`, `src/data/`, or `public/data/`.

> Tip: If you get Prisma errors that say the URL must start with `file:`, verify your `DATABASE_URL` value.

---

## 🧭 Project Structure

- `src/app/` — Next.js app routes & pages
- `src/components/` — Reusable UI components (e.g., `YearlyHeatmap`, `AnimatedCard`)
- `src/lib/prisma.ts` — safe Prisma wrapper (allows the app to run without a DB)
- `prisma/` — Prisma schema & migrations
- `data/` & `public/data/` — sample/demo trade data used when DB is unavailable
- `scripts/` — helpful scripts (e.g., `screenshot.js`, `seed.js`)

---

## ✨ Features

- Clean journal interface for adding trades ✅
- Visual performance charts (monthly, yearly heatmap) using Recharts ✅
- AI-driven periodic analysis (requires `OPENAI_API_KEY`) 🤖
- Framer Motion animations for polished UI ✅
- Safe DB fallback (demo data) so the app runs with no DB configured ✅

---

## 🧪 Testing & Automation

- Type-check:
```bash
npx tsc --noEmit
```
- Playwright (visual / E2E):
```bash
# install browsers once
npx playwright install

# run tests
npx playwright test
```
- Accessibility test (Playwright spec exists: `tests/a11y.spec.ts`)
- Screenshots helper: `node scripts/screenshot.js` (useful for CI visual diffs)

---

## 🛠️ Troubleshooting

- Invalid time value in `YearlyHeatmap` → ensure your trade objects have valid `entryTime` and `exitTime` values (ISO strings or numbers). The app now skips invalid dates gracefully.
- `Prisma` errors about `DATABASE_URL` → set `DATABASE_URL="file:./dev.db"` for sqlite and run `npx prisma db push`.
- Playwright connection errors (`ERR_CONNECTION_REFUSED`) → ensure dev server is running and accessible to Playwright (e.g., `npm run dev` in CI or start server before running tests).

---

## 🧩 Development Notes

- The app is designed to remain usable even when Prisma is unavailable. This helps for deployments to hosts that might not provide a DB by default.
- Demo trade data is stored at `data/demo-trades.json` (also mirrored in `src/data` / `public/data`).
- AI analysis results are persisted if Prisma is available; otherwise the analysis runs but is not saved.

---

## ❤️ Contributing

Contributions are welcome! Please:
1. Fork the repo
2. Create a branch: `git checkout -b feat/something`
3. Add tests (if applicable)
4. Open a pull request describing your change

Be sure to follow conventional commits and keep PRs focused.

---

## 📦 Deployment

- Deploy on Vercel, Netlify, or a container host. For Bytehost or other hosts without DB, the safe Prisma wrapper allows using demo data.
- Set required env vars in your host dashboard: `OPENAI_API_KEY` (optional), `DATABASE_URL` (optional for real data).

---

## ⚖️ License

This project is MIT licensed — feel free to reuse and adapt. 🎉

---

## 📬 Contact & Support

If you find bugs or want to request features, please open an issue in this repository. Thanks! 🙏

---

*Generated with care — happy trading!* 📈❤️
