#!/usr/bin/env bash
# ============================================================================
#  RS3 Skilling Guide — Local Launch Script
#  Builds the project (if needed) and serves the offline single-file app.
# ============================================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# ── Colours ──────────────────────────────────────────────────────────────────
CYAN='\033[0;36m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BOLD='\033[1m'
NC='\033[0m' # No Colour

banner() {
  echo ""
  echo -e "${CYAN}╔══════════════════════════════════════════════════╗${NC}"
  echo -e "${CYAN}║${NC}  ${BOLD}📜  RS3 Complete Guide — Skills, Money & Quests${NC}  ${CYAN}║${NC}"
  echo -e "${CYAN}╚══════════════════════════════════════════════════╝${NC}"
  echo ""
}

info()    { echo -e "${CYAN}[INFO]${NC}  $*"; }
success() { echo -e "${GREEN}[OK]${NC}    $*"; }
warn()    { echo -e "${YELLOW}[WARN]${NC}  $*"; }
fail()    { echo -e "${RED}[ERR]${NC}   $*"; exit 1; }

# ── Pre-flight checks ───────────────────────────────────────────────────────
banner

# Node.js
if ! command -v node &>/dev/null; then
  fail "Node.js is not installed. Please install Node.js 18+ from https://nodejs.org"
fi
NODE_VER=$(node -v | sed 's/v//' | cut -d. -f1)
if [ "$NODE_VER" -lt 18 ]; then
  fail "Node.js 18+ required (found v$(node -v)). Please upgrade."
fi
success "Node.js $(node -v) detected"

# npm
if ! command -v npm &>/dev/null; then
  fail "npm is not installed."
fi
success "npm $(npm -v) detected"

# ── Install dependencies (if needed) ────────────────────────────────────────
if [ ! -d "node_modules" ]; then
  info "Installing dependencies (first run)..."
  npm install --silent
  success "Dependencies installed"
else
  success "Dependencies already present"
fi

# ── Build ────────────────────────────────────────────────────────────────────
info "Building production bundle..."
npm run build --silent
success "Build complete → dist/index.html"

# ── Determine how to serve ───────────────────────────────────────────────────
PORT="${PORT:-4173}"

# Prefer the built-in Vite preview server
if grep -q '"preview"' package.json 2>/dev/null; then
  echo ""
  echo -e "${GREEN}${BOLD}✨ Launching RS3 Guide on http://localhost:${PORT}${NC}"
  echo -e "${CYAN}   Press Ctrl+C to stop the server.${NC}"
  echo ""
  npx vite preview --port "$PORT" --open 2>/dev/null || npx vite preview --port "$PORT"

# Fallback: python3 http server
elif command -v python3 &>/dev/null; then
  echo ""
  echo -e "${GREEN}${BOLD}✨ Serving RS3 Guide on http://localhost:${PORT}${NC}"
  echo -e "${CYAN}   Press Ctrl+C to stop the server.${NC}"
  echo ""
  cd dist
  python3 -m http.server "$PORT"

# Fallback: just open the file directly
else
  echo ""
  success "Build complete. Open this file in your browser:"
  echo ""
  echo -e "  ${BOLD}file://${SCRIPT_DIR}/dist/index.html${NC}"
  echo ""

  # Try to auto-open
  if command -v xdg-open &>/dev/null; then
    xdg-open "dist/index.html"
  elif command -v open &>/dev/null; then
    open "dist/index.html"
  fi
fi
