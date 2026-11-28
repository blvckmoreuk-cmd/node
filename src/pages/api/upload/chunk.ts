import type { APIRoute } from 'astro';
import { CHUNK_BYTES, getManifest, isValidId, json, uploadStore } from '../../../lib/uploads';

export const prerender = false;

// Step 2: send one chunk as the raw request body. /api/upload/chunk?id=...&i=0
export const POST: APIRoute = async ({ request, url }) => {
  const id = url.searchParams.get('id');
  const index = Number(url.searchParams.get('i'));
  if (!isValidId(id) || !Number.isInteger(index) || index < 0) return json({ error: 'Invalid request.' }, 400);

  const manifest = await getManifest(id);
  if (!manifest || manifest.status !== 'pending') return json({ error: 'Unknown upload.' }, 404);
  if (index >= manifest.chunks) return json({ error: 'Chunk out of range.' }, 422);

  const data = await request.arrayBuffer();
  const expected = index === manifest.chunks - 1 ? manifest.size - CHUNK_BYTES * index : CHUNK_BYTES;
  if (data.byteLength !== expected) return json({ error: 'Chunk size mismatch.' }, 422);

  await uploadStore().set(`${id}/${index}`, data);
  return json({ ok: true });
};
