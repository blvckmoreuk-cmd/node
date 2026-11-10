// @ts-check

import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import netlify from '@astrojs/netlify';
import { defineConfig, fontProviders } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  site: 'https://nodeproduction.co.uk',

  // Static by default; individual routes opt into on-demand rendering with
  // `export const prerender = false` (the review pages + /api endpoints).
  adapter: netlify(),
  
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
          name: 'Archivo',
          cssVariable: '--font-archivo',
          weights: [700, 800],
          styles: ['normal'],
          subsets: ['latin'],
          fallbacks: ['Helvetica Neue', 'Arial', 'sans-serif'],
      },
      {
          provider: fontProviders.google(),
          name: 'IBM Plex Mono',
          cssVariable: '--font-plex-mono',
          weights: [400, 500, 600],
          styles: ['normal'],
          subsets: ['latin'],
          fallbacks: ['monospace'],
      },
      {
          provider: fontProviders.google(),
          name: 'IBM Plex Sans',
          cssVariable: '--font-plex-sans',
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