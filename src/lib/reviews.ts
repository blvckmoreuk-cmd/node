// Server-only helpers for the review store, backed by Netlify Blobs.
//
// Blobs are auto-configured on the Netlify runtime (deploys + `netlify dev`).
// Plain `astro dev` has no Blobs context, so these throw there — test the
// review flow with `netlify dev`, not `astro dev`.
import { getStore } from '@netlify/blobs';

export interface Review {
  id: string;
  quote: string;
  author: string;
  source: string; // 'Direct' | 'Instagram' | ...
  rating: number; // 1-5
  approved: boolean;
  createdAt: string; // ISO
}

function store() {
  return getStore({ name: 'reviews', consistency: 'strong' });
}

// Public shape sent to the carousel — no internal fields leaked.
export interface PublicReview {
  quote: string;
  author: string;
  source: string;
  rating: number;
}

export async function addReview(input: {
  quote: string;
  author: string;
  source: string;
  rating: number;
}): Promise<Review> {
  const review: Review = {
    id: crypto.randomUUID(),
    quote: input.quote,
    author: input.author,
    source: input.source,
    rating: input.rating,
    approved: false,
    createdAt: new Date().toISOString(),
  };
  await store().setJSON(review.id, review);
  return review;
}

async function all(): Promise<Review[]> {
  const s = store();
  const { blobs } = await s.list();
  const items = await Promise.all(
    blobs.map((b) => s.get(b.key, { type: 'json' }) as Promise<Review | null>),
  );
  return items
    .filter((r): r is Review => r !== null)
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1)); // newest first
}

export async function listApproved(): Promise<PublicReview[]> {
  return (await all())
    .filter((r) => r.approved)
    .map(({ quote, author, source, rating }) => ({ quote, author, source, rating }));
}

export async function listPending(): Promise<Review[]> {
  return (await all()).filter((r) => !r.approved);
}

export async function approveReview(id: string): Promise<boolean> {
  const s = store();
  const r = (await s.get(id, { type: 'json' })) as Review | null;
  if (!r) return false;
  r.approved = true;
  await s.setJSON(id, r);
  return true;
}

export async function deleteReview(id: string): Promise<void> {
  await store().delete(id);
}
