import type { APIRoute } from 'astro';
import { addReview } from '../../lib/reviews';

export const prerender = false;

const MAX_QUOTE = 600;
const MAX_NAME = 80;

export const POST: APIRoute = async ({ request }) => {
  // Tie API access to knowing the private link. The submit form posts the
  // same token that gates its page.
  const linkToken = process.env.REVIEW_LINK_TOKEN;
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Invalid request.' }, 400);
  }

  if (!linkToken || body.token !== linkToken) {
    return json({ error: 'Not authorised.' }, 401);
  }

  const quote = String(body.quote ?? '').trim();
  const author = String(body.author ?? '').trim();
  const source = String(body.source ?? 'Direct').trim() || 'Direct';
  const rating = Number(body.rating);

  if (quote.length < 4 || quote.length > MAX_QUOTE) {
    return json({ error: 'Review must be 4–600 characters.' }, 422);
  }
  if (author.length < 1 || author.length > MAX_NAME) {
    return json({ error: 'Please add your name.' }, 422);
  }
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return json({ error: 'Rating must be 1–5.' }, 422);
  }

  await addReview({ quote, author, source: source.slice(0, 40), rating });
  return json({ ok: true }, 201);
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}
