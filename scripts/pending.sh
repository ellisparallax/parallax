#!/usr/bin/env bash
# List sightings awaiting moderation.
set -euo pipefail
cd "$(dirname "$0")/.."
SECRET=$(cat supabase/.secrets/moderation_secret.txt)
curl -s -X POST "https://znuykgebbrdnwwasxebr.supabase.co/functions/v1/moderate" \
  -H "content-type: application/json" -H "x-admin-secret: $SECRET" \
  -d '{"action":"list"}' | python3 -m json.tool
