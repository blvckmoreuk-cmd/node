// Server-only helpers for large audio uploads, backed by Netlify Blobs.
//
// Netlify functions cap a request body at about 6 MB, so the browser slices the
// file into 4 MB chunks and sends them one at a time. Each chunk is its own blob
// (`<id>/<index>`); a manifest blob (`<id>/manifest`) describes the whole file.
// Downloads stream the chunks back in order, so no function ever holds the whole
// file in memory. Blobs are auto-configured on the Netlify runtime; plain
// `astro dev` has no Blobs context, so test uploads on a deploy or `netlify dev`.
import { getStore } from '@netlify/blobs';

export const CHUNK_BYTES = 4 * 1024 * 1024;
export const MAX_FILE_BYTES = 500 * 1024 * 1024;
export const ALLOWED_EXTENSIONS = ['wav', 'aif', 'aiff', 'flac', 'mp3', 'zip'];

export interface UploadManifest {
  id: string;
  name: string;
  size: number;
  chunks: number;
  status: 'pending' | 'complete';
  createdAt: string;
  completedAt?: string;
}

export function uploadStore() {
  return getStore({ name: 'enquiry-uploads', consistency: 'strong' });
}

export const isValidId = (id: unknown): id is string => typeof id === 'string' && /^[a-f0-9]{32}$/.test(id);

export function newId() {
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}

// Keep the stored filename safe for headers and URLs.
export function safeName(name: string) {
  const cleaned = name.replace(/[\\/\x00-\x1f"]/g, '_').trim().slice(0, 150);
  return cleaned || 'upload';
}

export function extensionOf(name: string) {
  const i = name.lastIndexOf('.');
  return i < 0 ? '' : name.slice(i + 1).toLowerCase();
}

export async function getManifest(id: string): Promise<UploadManifest | null> {
  return (await uploadStore().get(`${id}/manifest`, { type: 'json' })) as UploadManifest | null;
}

export function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  });
}
