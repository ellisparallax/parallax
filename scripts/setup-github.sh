#!/usr/bin/env bash
# One-shot GitHub push for Project Parallax.
#
# Step A — create an EMPTY repo on github.com (no README/license/gitignore):
#            https://github.com/new   →  name it e.g. "parallax"  →  Create
# Step B — copy its URL and run this from the project root, e.g.:
#            ./scripts/setup-github.sh https://github.com/<you>/parallax.git
#
# Then enable hosting:  repo → Settings → Pages → Source: "GitHub Actions".
# Your live app: https://<you>.github.io/parallax/
set -euo pipefail

REPO_URL="${1:-}"
if [ -z "$REPO_URL" ]; then
  echo "Usage: ./scripts/setup-github.sh <repo-git-url>"
  echo "Example: ./scripts/setup-github.sh https://github.com/yourname/parallax.git"
  exit 1
fi

cd "$(dirname "$0")/.."
git add -A
git commit -m "Sync before first push" --quiet || echo "(nothing new to commit)"
git branch -M main
git remote remove origin 2>/dev/null || true
git remote add origin "$REPO_URL"
echo "Pushing to $REPO_URL ..."
git push -u origin main
echo
echo "✅ Pushed. Final step: repo → Settings → Pages → Source: 'GitHub Actions'."
echo "   The deploy workflow (.github/workflows/deploy.yml) publishes automatically."
