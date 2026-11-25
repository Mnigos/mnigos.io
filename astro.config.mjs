// @ts-check
import { defineConfig, fontProviders } from 'astro/config'

import mdx from '@astrojs/mdx'
import sitemap from '@astrojs/sitemap'
import tailwindcss from '@tailwindcss/vite'
import {
	codeTheme,
	constructorTypes,
} from './src/modules/blog/presentation/code-theme.config'

// https://astro.build/config
export default defineConfig({
	site: 'https://mnigos.io',
	vite: {
		plugins: [tailwindcss()],
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
			options: { experimental: { variableAxis: { wdth: [['62', '125']] } } },
		},
		{
			provider: fontProviders.google(),
			name: 'Martian Mono',
			cssVariable: '--font-martian-mono',
			weights: ['100 800'],
			styles: ['normal'],
			stretch: '75% 112.5%',
			fallbacks: ['ui-monospace', 'monospace'],
			options: { experimental: { variableAxis: { wdth: [['75', '112.5']] } } },
		},
	],

	markdown: {
		shikiConfig: { theme: codeTheme, transformers: [constructorTypes] },
	},

	integrations: [mdx(), sitemap()],
})
