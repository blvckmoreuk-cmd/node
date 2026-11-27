import type { APIRoute } from 'astro';
import { getManifest, isValidId, json, uploadStore } from '../../../lib/uploads';

export const prerender = false;

// Step 3: check every chunk arrived, then mark the upload complete and return the link.
export const POST: APIRoute = async ({ request, url }) => {
  let body: { id?: unknown };
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Invalid request.' }, 400);
  }
  const id = body.id;
  if (!isValidId(id)) return json({ error: 'Invalid request.' }, 400);

  const manifest = await getManifest(id);
  if (!manifest) return json({ error: 'Unknown upload.' }, 404);

  const store = uploadStore();
  if (manifest.status !== 'complete') {
    const { blobs } = await store.list({ prefix: `${id}/` });
    const have = new Set(blobs.map((b) => b.key));
    for (let i = 0; i < manifest.chunks; i++) {
      if (!have.has(`${id}/${i}`)) return json({ error: 'Some of the file did not arrive. Please try again.' }, 422);
    }
    await store.setJSON(`${id}/manifest`, { ...manifest, status: 'complete', completedAt: new Date().toISOString() });
  }
  return json({ link: `${url.origin}/api/upload/file/${id}`, name: manifest.name, size: manifest.size });
};
