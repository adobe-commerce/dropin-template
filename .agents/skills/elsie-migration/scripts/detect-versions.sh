#!/usr/bin/env bash
# Usage: detect-versions.sh [latest|beta|alpha]
# Omit the argument to show all channels.

set -euo pipefail

PACKAGE="@adobe-commerce/elsie"
CHANNEL="${1:-}"

installed_version() {
  local dir="$PWD"
  while [[ "$dir" != "/" ]]; do
    if [[ -f "$dir/package.json" ]]; then
      local v
      v=$(PKG_FILE="$dir/package.json" node -p "
        const p = require(process.env.PKG_FILE);
        const d = { ...(p.dependencies || {}), ...(p.devDependencies || {}) };
        d['$PACKAGE'] || ''
      " 2>/dev/null || true)
      [[ -n "$v" ]] && { echo "$v"; return; }
    fi
    dir="$(dirname "$dir")"
  done
  echo "(not found)"
}

npm_version() {
  npm view "$PACKAGE@$1" version 2>/dev/null || echo "n/a"
}

echo "Installed : $(installed_version)"
echo ""

if [[ -n "$CHANNEL" ]]; then
  echo "$CHANNEL : $(npm_version "$CHANNEL")"
else
  echo "latest : $(npm_version latest)"
  echo "beta   : $(npm_version beta)"
  echo "alpha  : $(npm_version alpha)"
fi
