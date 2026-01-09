#!/usr/bin/env bash
# Wrapper to run the PowerShell helper in Git Bash / MSYS environments
# Usage: ./scripts/win-setup.sh -Bootstrap
set -euo pipefail

echo "Invoking PowerShell helper with arguments: $@"
if command -v pwsh >/dev/null 2>&1; then
  pwsh -NoProfile -ExecutionPolicy Bypass -File "$(pwd)/scripts/win-setup.ps1" "$@"
elif command -v powershell.exe >/dev/null 2>&1; then
  powershell.exe -NoProfile -ExecutionPolicy Bypass -File "$(pwd)/scripts/win-setup.ps1" "$@"
else
  echo "PowerShell not found. Please run the script from PowerShell or install PowerShell Core (pwsh)."
  exit 1
fi
