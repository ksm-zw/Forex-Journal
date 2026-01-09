<#
PowerShell helper for Windows development & local production tasks.
Usage:
  .\win-setup.ps1 -Bootstrap
  .\win-setup.ps1 -RunDev
  .\win-setup.ps1 -RunProd
  .\win-setup.ps1 -FullSeed
#>

param(
  [switch]$Bootstrap,
  [switch]$RunDev,
  [switch]$RunProd,
  [switch]$FullSeed
)

function Set-EnvVars {
  Write-Host "Setting session env vars..." -ForegroundColor Cyan
  $ENV:DATABASE_URL = 'file:./prisma/dev.db'
  if (-not $ENV:OPENAI_API_KEY) {
    $ENV:OPENAI_API_KEY = 'sk-dummy'
  }
  Write-Host "DATABASE_URL=$ENV:DATABASE_URL" -ForegroundColor Green
  Write-Host "OPENAI_API_KEY=(set)" -ForegroundColor Green
}

function Bootstrap-DB {
  Write-Host "Pushing Prisma schema to DB..." -ForegroundColor Cyan
  npx prisma db push
  if ($LASTEXITCODE -ne 0) { throw 'Prisma db push failed' }
}

function Create-DemoUser {
  Write-Host "Creating demo user (if missing)..." -ForegroundColor Cyan
  node scripts/create-demo-user.js
}

function Seed-DemoTrades {
  Write-Host "Seeding demo trades..." -ForegroundColor Cyan
  node scripts/seed-demo-trades.js
}

function Run-Dev {
  Write-Host "Starting dev server..." -ForegroundColor Cyan
  npm run dev
}

function Run-Prod {
  Write-Host "Building production app..." -ForegroundColor Cyan
  npm run build
  if ($LASTEXITCODE -ne 0) { throw 'Build failed' }
  Write-Host "Starting production server..." -ForegroundColor Cyan
  npm run start
}

# Main
if ($Bootstrap) {
  Set-EnvVars
  Bootstrap-DB
  Create-DemoUser
  Seed-DemoTrades
  Write-Host "Bootstrap complete." -ForegroundColor Green
  exit 0
}

if ($FullSeed) {
  Set-EnvVars
  Create-DemoUser
  Seed-DemoTrades
  Write-Host "Seeding complete." -ForegroundColor Green
  exit 0
}

if ($RunDev) {
  Set-EnvVars
  Run-Dev
  exit 0
}

if ($RunProd) {
  Set-EnvVars
  Run-Prod
  exit 0
}

Write-Host "No switch passed. Available switches: -Bootstrap, -FullSeed, -RunDev, -RunProd" -ForegroundColor Yellow