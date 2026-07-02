// POST a citizen sighting → stored as status='pending' for moderation.
// Optionally accepts a base64 photo (data URL), uploaded to the storage bucket.
import { createClient } from 'npm:@supabase/supabase-js@2';
import { cors, json } from '../_shared/cors.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  if (req.method !== 'POST') return json({ error: 'POST only' }, 405);

  try {
    const b = await req.json();
    const { location, lat, lon, year, shape, description, heading, tilt, photo } = b ?? {};
    if (!location || typeof lat !== 'number' || typeof lon !== 'number' || !description) {
      return json({ error: 'location, lat, lon and description are required' }, 400);
    }

    const admin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    // Optional photo upload (base64 data URL → storage)
    let photo_url: string | null = null;
    if (typeof photo === 'string' && photo.startsWith('data:image')) {
      const [meta, b64] = photo.split(',');
      const ext = meta.includes('png') ? 'png' : 'jpg';
      const bytes = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
      const path = `pending/${crypto.randomUUID()}.${ext}`;
      const up = await admin.storage.from('sighting-photos').upload(path, bytes, {
        contentType: ext === 'png' ? 'image/png' : 'image/jpeg',
        upsert: false,
      });
      if (!up.error) {
        photo_url = admin.storage.from('sighting-photos').getPublicUrl(path).data.publicUrl;
      }
    }

    const { data, error } = await admin.from('sightings').insert({
      location, lat, lon,
      year: year ?? null, shape: shape ?? null, description,
      heading: heading ?? null, tilt: tilt ?? null,
      photo_url, status: 'pending',
    }).select('id').single();

    if (error) return json({ error: error.message }, 400);
    return json({ ok: true, id: data.id, status: 'pending' });
  } catch (e) {
    return json({ error: String(e) }, 500);
  }
});
