import type { APIRoute } from 'astro';
import { listApproved } from '../../lib/reviews';

export const prerender = false;

export const GET: APIRoute = async () => {
  try {
    const reviews = await listApproved();
    return new Response(JSON.stringify({ reviews }), {
      status: 200,
      headers: {
        'content-type': 'application/json',
        // Short edge cache so approved reviews appear quickly without
        // hammering the store on every page load.
        'cache-control': 'public, max-age=60',
      },
    });
  } catch {
    // If the store is unavailable, degrade to the hardcoded seed reviews.
    return new Response(JSON.stringify({ reviews: [] }), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    });
  }
};
