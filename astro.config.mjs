// @ts-check

import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { defineConfig, fontProviders } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  site: 'https://example.com',
  
  // Enabled hosting for tunnel access
  server: {
    host: true,
    allowedHosts: [
      'localhost',
      '.ngrok-free.dev' // The dot prefix acts as a wildcard for all ngrok subdomains
    ],
  },

  integrations: [mdx(), sitemap()],

  fonts: [
      {
          provider: fontProviders.google(),
          name: 'Space Grotesk',
          cssVariable: '--font-space-grotesk',
          weights: [500, 700],
          styles: ['normal'],
          subsets: ['latin'],
          fallbacks: ['sans-serif'],
      },
      {
          provider: fontProviders.google(),
          name: 'JetBrains Mono',
          cssVariable: '--font-jetbrains-mono',
          weights: [400, 700],
          styles: ['normal'],
          subsets: ['latin'],
          fallbacks: ['monospace'],
      },
      {
          provider: fontProviders.google(),
          name: 'Inter',
          cssVariable: '--font-inter',
          weights: [400, 500],
          styles: ['normal'],
          subsets: ['latin'],
          fallbacks: ['sans-serif'],
      },
    ],

  vite: {
    plugins: [tailwindcss()],
  },
});