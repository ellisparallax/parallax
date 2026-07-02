// Store a Web Push subscription and its watch zones.
// Body: { subscription: PushSubscription, zones: [{name,lat,lon,radiusKm}] }
import { createClient } from 'npm:@supabase/supabase-js@2';
import { cors, json } from '../_shared/cors.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  if (req.method !== 'POST') return json({ error: 'POST only' }, 405);

  try {
    const { subscription, zones } = await req.json();
    if (!subscription?.endpoint || !subscription?.keys?.p256dh || !subscription?.keys?.auth) {
      return json({ error: 'invalid subscription' }, 400);
    }

    const admin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    // upsert the subscription (endpoint is unique)
    const { data: sub, error } = await admin.from('push_subscriptions').upsert({
      endpoint: subscription.endpoint,
      p256dh: subscription.keys.p256dh,
      auth: subscription.keys.auth,
    }, { onConflict: 'endpoint' }).select('id').single();
    if (error) return json({ error: error.message }, 400);

    // replace this subscription's watch zones with the provided set
    await admin.from('watch_zones').delete().eq('subscription_id', sub.id);
    if (Array.isArray(zones) && zones.length) {
      const rows = zones
        .filter((z: any) => typeof z?.lat === 'number' && typeof z?.lon === 'number')
        .map((z: any) => ({
          subscription_id: sub.id,
          name: z.name ?? null,
          lat: z.lat, lon: z.lon,
          radius_km: z.radiusKm ?? z.radius_km ?? 80,
        }));
      if (rows.length) await admin.from('watch_zones').insert(rows);
    }

    return json({ ok: true, id: sub.id, zones: Array.isArray(zones) ? zones.length : 0 });
  } catch (e) {
    return json({ error: String(e) }, 500);
  }
});
