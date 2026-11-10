#!/usr/bin/env bash
# Safe deploy for Rose Glow Ecom — does not touch laam-crm.
set -euo pipefail

APP_DIR="/opt/rose-glow-ecom"
APP_NAME="rose-glow-ecom"
BRANCH="main"
HEALTH_URL="http://127.0.0.1:3001"
LEGACY_ROSE="http://127.0.0.1:4000"
LAAM_WEB="http://127.0.0.1:3000"
LAAM_API="http://127.0.0.1:3333"

log() { printf '[rose-glow-deploy] %s\n' "$*"; }
fail() { printf '[rose-glow-deploy] ERROR: %s\n' "$*" >&2; exit 1; }

assert_neighbors_ok() {
  local web_code api_code legacy_code
  web_code="$(curl -s -o /dev/null -w '%{http_code}' --max-time 5 "$LAAM_WEB" || true)"
  api_code="$(curl -s -o /dev/null -w '%{http_code}' --max-time 5 "$LAAM_API" || true)"
  legacy_code="$(curl -s -o /dev/null -w '%{http_code}' --max-time 5 "$LEGACY_ROSE" || true)"
  # 2xx/3xx/404 all mean the process is answering (api may 404 on /)
  if [[ ! "$web_code" =~ ^(2|3)[0-9][0-9]$ ]]; then
    fail "laam-web health check failed (HTTP $web_code) — aborting deploy"
  fi
  if [[ -z "$api_code" || "$api_code" == "000" ]]; then
    fail "laam-api not responding — aborting deploy"
  fi
  if [[ ! "$legacy_code" =~ ^(2|3)[0-9][0-9]$ ]]; then
    fail "legacy rose-glow (:4000) health check failed (HTTP $legacy_code) — aborting deploy"
  fi
  log "neighbors OK (laam-web=$web_code laam-api=$api_code legacy-rose=$legacy_code)"
}

[[ "$(id -u)" -eq 0 ]] || fail "run as root"
[[ -d "$APP_DIR/.git" ]] || fail "missing $APP_DIR"
assert_neighbors_ok

export CI=true
export NODE_ENV=production
# Avoid nx/turbo TUI prompts on VPS
export NX_TUI=false
export NX_DAEMON=false

cd "$APP_DIR"
git config --global --add safe.directory "$APP_DIR" >/dev/null 2>&1 || true

log "fetching $BRANCH"
git fetch --prune origin "$BRANCH"
git reset --hard "origin/$BRANCH"

if [[ ! -f "$APP_DIR/.env" ]]; then
  fail "missing $APP_DIR/.env"
fi
# Next.js loads .env / .env.production / .env.local from apps/web
ln -sfn "$APP_DIR/.env" "$APP_DIR/apps/web/.env"
ln -sfn "$APP_DIR/.env" "$APP_DIR/apps/web/.env.production"

corepack enable >/dev/null 2>&1 || true
corepack prepare pnpm@11.9.0 --activate >/dev/null 2>&1 || true
hash -r || true

log "installing dependencies"
pnpm install --frozen-lockfile

log "prisma generate + migrate"
pnpm --filter web exec prisma generate
pnpm --filter web exec prisma migrate deploy

log "building"
pnpm --filter web build

log "reloading pm2 ($APP_NAME)"
if pm2 describe "$APP_NAME" >/dev/null 2>&1; then
  # If old express app still pointed elsewhere, replace it
  pm2 delete "$APP_NAME" >/dev/null 2>&1 || true
fi
pm2 start "$APP_DIR/deploy/ecosystem.config.cjs" --only "$APP_NAME"
pm2 save >/dev/null

# Wait for health
ok=0
for i in $(seq 1 30); do
  code="$(curl -s -o /dev/null -w '%{http_code}' --max-time 3 "$HEALTH_URL" || true)"
  if [[ "$code" =~ ^(2|3)[0-9][0-9]$ ]]; then
    ok=1
    break
  fi
  sleep 1
done
[[ "$ok" -eq 1 ]] || fail "app health check failed on $HEALTH_URL"

assert_neighbors_ok
log "deploy complete"
