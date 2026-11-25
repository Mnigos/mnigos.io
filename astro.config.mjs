// @ts-check
import { defineConfig, fontProviders } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://mnigos.io',
  vite: {
    plugins: [tailwindcss()]
  },

  fonts: [
    {
      provider: fontProviders.google(),
      name: 'Archivo',
      cssVariable: '--font-archivo',
      weights: ['100 900'],
      styles: ['normal'],
      stretch: '62% 125%',
      fallbacks: ['system-ui', 'sans-serif'],
      options: { experimental: { variableAxis: { wdth: [['62', '125']] } } }
    },
    {
      provider: fontProviders.google(),
      name: 'Martian Mono',
      cssVariable: '--font-martian-mono',
      weights: ['100 800'],
      styles: ['normal'],
      stretch: '75% 112.5%',
      fallbacks: ['ui-monospace', 'monospace'],
      options: { experimental: { variableAxis: { wdth: [['75', '112.5']] } } }
    }
  ],

  integrations: [mdx(), sitemap()]
});
