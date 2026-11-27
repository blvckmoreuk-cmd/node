import type { APIRoute } from 'astro';
import {
  ALLOWED_EXTENSIONS, CHUNK_BYTES, MAX_FILE_BYTES, extensionOf, json, newId, safeName, uploadStore,
  type UploadManifest,
} from '../../../lib/uploads';

export const prerender = false;

// Step 1: register an upload and get back an unguessable id.
export const POST: APIRoute = async ({ request }) => {
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
  return json({ id: manifest.id, chunkSize: CHUNK_BYTES, chunks: manifest.chunks }, 201);
};
