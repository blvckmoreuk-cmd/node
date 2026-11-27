import type { APIRoute } from 'astro';
import { getManifest, isValidId, json, uploadStore } from '../../../../lib/uploads';

export const prerender = false;

// The link saved with each enquiry. The 128-bit random id is the access key,
// so only people who were given the link can download.
export const GET: APIRoute = async ({ params }) => {
  const id = params.id;
  if (!isValidId(id)) return json({ error: 'Not found.' }, 404);
  const manifest = await getManifest(id);
  if (!manifest || manifest.status !== 'complete') return json({ error: 'Not found.' }, 404);

  const store = uploadStore();
  let next = 0;
  const stream = new ReadableStream<Uint8Array>({
    async pull(controller) {
      if (next >= manifest.chunks) return controller.close();
      const buf = (await store.get(`${id}/${next++}`, { type: 'arrayBuffer' })) as ArrayBuffer | null;
      if (!buf) return controller.error(new Error('Missing chunk'));
      controller.enqueue(new Uint8Array(buf));
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'application/octet-stream',
      'Content-Length': String(manifest.size),
      'Content-Disposition': `attachment; filename*=UTF-8''${encodeURIComponent(manifest.name)}`,
      'Cache-Control': 'private, no-store',
      'X-Robots-Tag': 'noindex',
    },
  });
};
