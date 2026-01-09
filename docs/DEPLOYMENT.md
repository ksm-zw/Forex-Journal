# Deployment — Docker (production) & XAMPP (Apache) quick guides

This document provides quick, copy/paste-ready instructions to deploy the app using Docker (recommended) and using XAMPP/Apache as a reverse proxy or static host.

---

## A — Docker + Traefik (recommended)

Files added:
- `docker/docker-compose.prod.yml` — production compose with Traefik, app, and Postgres
- `docker/traefik/traefik.yml` — Traefik static config
- `docker/traefik/dynamic.yml` — Traefik dynamic routing (HTTPS redirect)
- `docker/traefik/acme.json` — empty ACME storage file (set mode 600)
- `.env.production.example` — sample env vars

Quick steps:
1. Copy example env: `cp .env.production.example .env.production` and fill values, especially `LETSENCRYPT_EMAIL` and DB credentials.
2. Create the ACME file and secure it:
   - `touch docker/traefik/acme.json && chmod 600 docker/traefik/acme.json`
3. Build and start (detached):
   - `docker compose -f docker/docker-compose.prod.yml up -d --build`
4. Initialize DB and run migrations inside the app container:
   - `docker compose exec app npx prisma db push`
   - `docker compose exec app node scripts/seed-demo-trades.js` (optional)
5. Visit your site at the domain configured in labels (replace `example.com`).

Notes & best practices:
- Use a real domain and update `traefik` labels in `docker-compose.prod.yml` (Host(`yourdomain.com`)).
- Keep secret values in a secure secret store; avoid committing secrets to repo.
- Use Traefik dashboard at `https://<your-host>/dashboard/` (if enabled and secure).

---

## B — XAMPP / Apache

Use Apache as a reverse proxy to a Node process (recommended), or as a static host for a `next export` static build (limited).

Example Apache vhost for reverse proxy (add to `httpd-vhosts.conf` or a site-enabled file):

<VirtualHost *:80>
  ServerName example.com
  ProxyPreserveHost On
  ProxyPass / http://127.0.0.1:3000/
  ProxyPassReverse / http://127.0.0.1:3000/
  ErrorLog "/path/to/apache/logs/forex-error.log"
  CustomLog "/path/to/apache/logs/forex-access.log" common
</VirtualHost>

Steps:
1. Build and run the Next.js production server:
   - `npm ci`
   - `OPENAI_API_KEY=sk-... npm run build`
   - `npm run start` (serves on port 3000)
2. Enable Apache proxy modules (if not enabled): `a2enmod proxy proxy_http` or enable via XAMPP config.
3. Add the vhost and restart Apache.

Static export (if you don't need API/SSR):
- `npm run build && npm run export`
- Copy `out/` to XAMPP's `htdocs` and serve; dynamic features will not work.

---

If you want, I can open a PR with these files and a short README change — or I can push them onto a dedicated branch and open the PR for you. Let me know your preference.
