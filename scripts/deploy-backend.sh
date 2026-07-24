#!/usr/bin/env bash
# One-shot backend deploy: secrets + all three Edge Functions.
# Run:  bash scripts/deploy-backend.sh
set -euo pipefail
cd "$(dirname "$0")/.."
SB="$HOME/.local/bin/supabase"
REF="znuykgebbrdnwwasxebr"
S="supabase/.secrets"
$SB projects list >/dev/null 2>&1 || $SB login
echo "→ setting function secrets…"
$SB secrets set --project-ref "$REF" \
  VAPID_PUBLIC_KEY="$(cat $S/vapid_public.txt)" \
  VAPID_PRIVATE_KEY="$(cat $S/vapid_private.txt)" \
  VAPID_SUBJECT="mailto:benmoxley1@gmail.com" \
  MODERATION_SECRET="$(cat $S/moderation_secret.txt)"
echo "→ deploying functions…"
$SB functions deploy submit-sighting --project-ref "$REF" --no-verify-jwt --use-api
$SB functions deploy subscribe       --project-ref "$REF" --no-verify-jwt --use-api
$SB functions deploy moderate        --project-ref "$REF" --no-verify-jwt --use-api
echo "✅ BACKEND DEPLOYED — tell Claude 'deployed'"
