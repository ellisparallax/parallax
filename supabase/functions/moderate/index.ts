// Approve or reject a pending sighting. On approve, send a Web Push to every
// subscriber whose watch zone contains the sighting (the "Firewatch" alert).
// Admin-gated by a shared secret header — replace with real role auth for prod.
import { createClient } from 'npm:@supabase/supabase-js@2';
import webpush from 'npm:web-push@3.6.7';
import { cors, json } from '../_shared/cors.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  if (req.method !== 'POST') return json({ error: 'POST only' }, 405);
  if (req.headers.get('x-admin-secret') !== Deno.env.get('MODERATION_SECRET')) {
    return json({ error: 'unauthorized' }, 401);
  }

  try {
    const { id, action } = await req.json(); // action: 'approve' | 'reject' | 'list'
    const admin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    if (action === 'list') {
      const { data, error } = await admin.from('sightings')
        .select('id,location,lat,lon,shape,year,description,status,created_at')
        .eq('status', 'pending').order('created_at', { ascending: false }).limit(50);
      if (error) return json({ error: error.message }, 400);
      return json({ ok: true, pending: data });
    }

    const status = action === 'approve' ? 'approved' : 'rejected';

    const { data: s, error } = await admin.from('sightings')
      .update({ status, moderated_at: new Date().toISOString() })
      .eq('id', id).select('*').single();
    if (error) return json({ error: error.message }, 400);
    if (status !== 'approved') return json({ ok: true, status });

    // Find subscribers whose watch zone contains this sighting
    const { data: targets, error: rpcErr } = await admin.rpc('subscribers_near', {
      p_lat: s.lat, p_lon: s.lon,
    });
    if (rpcErr) return json({ error: rpcErr.message }, 400);

    webpush.setVapidDetails(
      'mailto:' + (Deno.env.get('VAPID_SUBJECT') ?? 'admin@example.com'),
      Deno.env.get('VAPID_PUBLIC_KEY')!,
      Deno.env.get('VAPID_PRIVATE_KEY')!,
    );

    const payload = JSON.stringify({
      title: 'New sighting near ' + (s.location ?? 'your area'),
      body: `${s.location ?? ''} — ${s.shape ?? 'unidentified'}`,
      id: s.id, lat: s.lat, lon: s.lon,
    });

    let sent = 0;
    const dead: string[] = [];
    for (const t of targets ?? []) {
      try {
        await webpush.sendNotification(
          { endpoint: t.endpoint, keys: { p256dh: t.p256dh, auth: t.auth } },
          payload,
        );
        sent++;
      } catch (err: any) {
        if (err?.statusCode === 404 || err?.statusCode === 410) dead.push(t.endpoint); // gone
      }
    }
    if (dead.length) await admin.from('push_subscriptions').delete().in('endpoint', dead);

    return json({ ok: true, status, notified: sent, pruned: dead.length });
  } catch (e) {
    return json({ error: String(e) }, 500);
  }
});
