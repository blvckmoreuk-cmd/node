// Rate limiting for the upload init endpoint and cleanup of abandoned uploads.
// Both use Netlify Blobs, so no extra service is needed.
import { getStore } from '@netlify/blobs';
import type { UploadManifest } from './uploads';

export const INIT_LIMIT_PER_HOUR = 10;
export const STALE_AFTER_MS = 24 * 60 * 60 * 1000;
const HOUR_MS = 60 * 60 * 1000;

type Store = ReturnType<typeof getStore>;

export const rateLimitStore = () => getStore({ name: 'enquiry-ratelimit', consistency: 'strong' });

export function clientIp(request: Request) {
  const h = request.headers;
  return h.get('x-nf-client-connection-ip') || h.get('x-forwarded-for')?.split(',')[0].trim() || 'unknown';
}

async function sha256Hex(text: string) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf), (b) => b.toString(16).padStart(2, '0')).join('');
}

// Fixed one-hour window per IP. The IP is stored only as a hash. The read-then-write is not
// atomic, so a burst of truly simultaneous requests could slip a few extra through; that is
// fine for abuse protection (it is not a security boundary).
export async function checkInitRateLimit(request: Request, store: Store = rateLimitStore(), now = Date.now()) {
  const window = Math.floor(now / HOUR_MS);
  const key = `init/${window}/${(await sha256Hex(clientIp(request))).slice(0, 32)}`;
  const entry = (await store.get(key, { type: 'json' })) as { count: number } | null;
  const count = entry?.count ?? 0;
  if (count >= INIT_LIMIT_PER_HOUR) {
    return { allowed: false, retryAfterSeconds: Math.max(1, Math.ceil(((window + 1) * HOUR_MS - now) / 1000)) };
  }
  await store.setJSON(key, { count: count + 1 });
  return { allowed: true, retryAfterSeconds: 0, dbg: `${key.slice(0, 18)} was=${JSON.stringify(entry)} ip=${clientIp(request)} hdrs=${[...request.headers.keys()].join(',')}` };
}

// Deletes uploads that were started but never completed and are older than 24 hours
// (manifest + all chunks), and expired rate-limit counters. Completed uploads are never touched.
export async function cleanupStaleUploads(uploads: Store, limits: Store, now = Date.now(), dryRun = false) {
  const result = { deletedUploads: [] as string[], deletedBlobs: 0, keptComplete: 0, keptRecent: 0, deletedCounters: 0 };
  const { blobs } = await uploads.list();
  const byId = new Map<string, string[]>();
  for (const { key } of blobs) {
    const id = key.split('/')[0];
    byId.set(id, [...(byId.get(id) ?? []), key]);
  }
  for (const [id, keys] of byId) {
    const manifest = (await uploads.get(`${id}/manifest`, { type: 'json' }).catch(() => null)) as UploadManifest | null;
    if (!manifest) continue; // no manifest: leave alone, cannot tell its age
    if (manifest.status === 'complete') {
      result.keptComplete++;
      continue;
    }
    if (now - new Date(manifest.createdAt).getTime() < STALE_AFTER_MS) {
      result.keptRecent++;
      continue;
    }
    if (!dryRun) await Promise.all(keys.map((k) => uploads.delete(k)));
    result.deletedUploads.push(id);
    result.deletedBlobs += keys.length;
  }
  const currentWindow = Math.floor(now / HOUR_MS);
  const { blobs: counters } = await limits.list({ prefix: 'init/' });
  for (const { key } of counters) {
    if (Number(key.split('/')[1]) < currentWindow) {
      if (!dryRun) await limits.delete(key);
      result.deletedCounters++;
    }
  }
  return result;
}
