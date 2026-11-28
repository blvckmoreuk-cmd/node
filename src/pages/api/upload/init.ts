import type { APIRoute } from 'astro';
import {
  ALLOWED_EXTENSIONS, CHUNK_BYTES, MAX_FILE_BYTES, extensionOf, json, newId, safeName, uploadStore,
  type UploadManifest,
} from '../../../lib/uploads';
import { checkInitRateLimit } from '../../../lib/upload-maintenance';

export const prerender = false;

// Step 1: register an upload and get back an unguessable id.
// Limited to 10 per IP per hour (see lib/upload-maintenance.ts).
// Note: download links are plain random ids (128-bit, unguessable). Signed, expiring links
// are an option later if links need to lapse or be revoked.
export const POST: APIRoute = async ({ request }) => {
  const limit = await checkInitRateLimit(request);
  if (!limit.allowed) {
    return new Response(
      JSON.stringify({ error: 'Too many uploads from your connection. Please try again in an hour, or paste a link instead.' }),
      { status: 429, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', 'Retry-After': String(limit.retryAfterSeconds) } },
    );
  }
  let body: { name?: unknown; size?: unknown };
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Invalid request.' }, 400);
  }
  const name = safeName(String(body.name ?? ''));
  const size = Number(body.size);
  if (!ALLOWED_EXTENSIONS.includes(extensionOf(name))) {
    return json({ error: 'Please choose a WAV, AIFF, FLAC, MP3 or ZIP file.' }, 415);
  }
  if (!Number.isInteger(size) || size <= 0) return json({ error: 'That file looks empty.' }, 422);
  if (size > MAX_FILE_BYTES) return json({ error: 'That file is over the 500 MB limit.' }, 413);

  const manifest: UploadManifest = {
    id: newId(),
    name,
    size,
    chunks: Math.ceil(size / CHUNK_BYTES),
    status: 'pending',
    createdAt: new Date().toISOString(),
  };
  await uploadStore().setJSON(`${manifest.id}/manifest`, manifest);
  return json({ dbg: (limit as any).dbg, id: manifest.id, chunkSize: CHUNK_BYTES, chunks: manifest.chunks }, 201);
};
