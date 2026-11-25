import { defineConfig } from 'oxfmt'
import ultracite from 'ultracite/oxfmt'

export default defineConfig({
	...ultracite,
	arrowParens: 'avoid',
	insertFinalNewline: true,
	proseWrap: 'preserve',
	semi: false,
	singleQuote: true,
	useTabs: true,
	sortImports: { newlinesBetween: false, partitionByNewline: true },
	sortTailwindcss: { stylesheet: './src/styles/global.css' },
	overrides: [{ files: ['**/*.json'], options: { useTabs: false } }],
	ignorePatterns: [
		...(ultracite.ignorePatterns ?? []),
		// Written by the contributions refresh script, one line per year.
		'src/modules/contributions/infrastructure/contributions.snapshot.json',
		// Written once by a conversion script, one line per day.
		'src/modules/contributions/infrastructure/gitlab-events.snapshot.json',
	],
})
