import type { ShikiConfig } from 'astro'

/** Colours are CSS variables so code blocks follow the site tokens in global.css. */
export const codeTheme: ShikiConfig['theme'] = {
	name: 'mnigos',
	type: 'dark',
	colors: {
		'editor.background': 'var(--color-code)',
		'editor.foreground': 'var(--color-ink)',
	},
	tokenColors: [
		{
			scope: ['comment', 'punctuation.definition.comment'],
			settings: { foreground: 'var(--color-faint)' },
		},
		{
			scope: ['keyword', 'keyword.operator.new', 'storage'],
			settings: { foreground: 'var(--color-accent)' },
		},
		{
			scope: ['string', 'punctuation.definition.string'],
			settings: { foreground: 'var(--color-level-5)' },
		},
		{
			scope: ['keyword.operator', 'meta.template.expression'],
			settings: { foreground: 'var(--color-ink)' },
		},
	],
}
