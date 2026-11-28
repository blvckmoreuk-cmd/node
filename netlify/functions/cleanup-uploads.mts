import type { Config } from '@netlify/functions';
import { getStore } from '@netlify/blobs';
import { cleanupStaleUploads } from '../../src/lib/upload-maintenance';

// Hourly: remove uploads that never completed (no "complete" call) and are over 24 hours old.
export default async () => {
  const result = await cleanupStaleUploads(
    getStore({ name: 'enquiry-uploads', consistency: 'strong' }),
    getStore({ name: 'enquiry-ratelimit', consistency: 'strong' }),
  );
  console.log('cleanup-uploads', JSON.stringify({ ...result, deletedUploads: result.deletedUploads.length }));
};

export const config: Config = { schedule: '@hourly' };
