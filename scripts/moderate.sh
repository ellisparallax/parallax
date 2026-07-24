#!/usr/bin/env bash
# Approve or reject a pending sighting (sends push alerts on approve).
# usage: bash scripts/moderate.sh <sighting-id> approve|reject
set -euo pipefail
cd "$(dirname "$0")/.."
SECRET=$(cat supabase/.secrets/moderation_secret.txt)
curl -s -X POST "https://znuykgebbrdnwwasxebr.supabase.co/functions/v1/moderate" \
  -H "content-type: application/json" -H "x-admin-secret: $SECRET" \
  -d "{\"id\":\"$1\",\"action\":\"${2:-approve}\"}"; echo
