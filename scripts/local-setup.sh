#!/usr/bin/env bash
set -euo pipefail

# local-setup.sh — bootstrap local dev environment (macOS / Linux)
# Usage:
#   ./scripts/local-setup.sh          # bootstrap and start dev server
#   ./scripts/local-setup.sh dev      # bootstrap (if needed) and start dev server
#   ./scripts/local-setup.sh prod     # bootstrap (if needed), build, and start production server
#   ./scripts/local-setup.sh bootstrap # only bootstrap (install, db push, seed)

ROOT_DIR=$(cd "$(dirname "$0")/.." && pwd)
cd "$ROOT_DIR"

ensure_env() {
  if [ ! -f .env.local ]; then
    echo "Creating .env.local from .env.local.example..."
    cp .env.local.example .env.local
    echo "You can edit .env.local to set OPENAI_API_KEY if desired."
  else
    echo ".env.local already exists — leaving it unchanged (backup .env.local.bak to recreate)"
  fi
}

bootstrap() {
  echo "Installing dependencies..."
  npm ci

  echo "Ensuring Prisma schema is pushed to local SQLite DB..."
  npx prisma db push

  echo "Seeding demo user & demo trades into local DB (prisma/seed.js)..."
  node prisma/seed.js

  echo "Bootstrap complete."
}

run_dev() {
  echo "Starting dev server (http://localhost:3000)"
  npm run dev
}

run_prod() {
  echo "Building production app..."
  npm run build
  echo "Starting production server..."
  npm run start
}

case "${1:-bootstrap}" in
  bootstrap)
    ensure_env
    bootstrap
    run_dev
    ;;
  dev)
    ensure_env
    bootstrap
    run_dev
    ;;
  prod)
    ensure_env
    bootstrap
    run_prod
    ;;
  *)
    echo "Usage: $0 [bootstrap|dev|prod]"
    exit 1
    ;;
esac
