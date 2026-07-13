import type { APIRoute } from 'astro';
import { approveReview, deleteReview } from '../../lib/reviews';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  const adminToken = process.env.REVIEW_ADMIN_TOKEN;
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Invalid request.' }, 400);
  }

  if (!adminToken || body.token !== adminToken) {
    return json({ error: 'Not authorised.' }, 401);
  }

  const id = String(body.id ?? '');
  const action = String(body.action ?? '');
  if (!id) return json({ error: 'Missing id.' }, 422);

  if (action === 'approve') {
    const ok = await approveReview(id);
    return ok ? json({ ok: true }) : json({ error: 'Not found.' }, 404);
  }
  if (action === 'reject') {
    await deleteReview(id);
    return json({ ok: true });
  }
  return json({ error: 'Unknown action.' }, 422);
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}
