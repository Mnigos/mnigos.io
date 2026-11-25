import { defineConfig, type OxlintOverride } from 'oxlint'
import astro from 'ultracite/oxlint/astro'
import core from 'ultracite/oxlint/core'

const DISABLED_RULES = {
	'func-names': 'anonymous function expressions are fine as callbacks',
	'no-plusplus': 'increment operators are idiomatic in counters and loops',
	'prefer-named-capture-group':
		'positional groups are clearer in short regexes',
	'sort-keys':
		'key order carries meaning: Astro spreads attribute objects in declaration order and configs read top down',
	'require-await':
		'conflicts with typescript/promise-function-async on pass-through promise callbacks',
	'promise/prefer-await-to-then': 'fire-and-forget void promises',
	'typescript/no-confusing-void-expression':
		'concise void-returning arrow callbacks per AGENTS.md',
	'typescript/non-nullable-type-assertion-style':
		'pushes towards non-null assertions, banned by AGENTS.md',
	'typescript/prefer-nullish-coalescing':
		'AGENTS.md uses || for intentional all-falsy checks',
	'typescript/strict-boolean-expressions':
		'truthiness checks and || fallbacks are intentional',
	'unicorn/import-style': 'named imports from Node builtins are the convention',
	'unicorn/no-array-reduce': 'reduce is accepted for aggregations',
	'unicorn/no-useless-undefined':
		'AGENTS.md prefers explicit undefined at API boundaries',
	'unicorn/prefer-ternary': 'AGENTS.md prefers early returns over ternaries',
	'unicorn/switch-case-braces':
		'AGENTS.md skips braces for single-statement blocks',
} as const satisfies Record<string, string>

const PRESETS = [core, astro]

const SPEC_PLUGINS = [
	...new Set([
		...PRESETS.flatMap(preset => preset.plugins ?? []),
		'vitest',
	] satisfies OxlintOverride['plugins']),
]

export default defineConfig({
	extends: PRESETS,
	options: { typeAware: true },
	env: { browser: true, node: true, es2024: true },
	rules: {
		...Object.fromEntries(
			Object.keys(DISABLED_RULES).map(rule => [rule, 'off'])
		),
		curly: 'off',
		'func-style': ['error', 'declaration', { allowArrowFunctions: true }],
		'import/consistent-type-specifier-style': [
			'error',
			'prefer-top-level-if-only-type-imports',
		],
		'import/no-default-export': 'error',
		'import/no-duplicates': ['error', { preferInline: true }],
		'no-nested-ternary': 'off',
		'no-undef': 'error',
		'no-use-before-define': [
			'error',
			{
				classes: false,
				functions: false,
				ignoreTypeReferences: true,
				typedefs: false,
				variables: false,
			},
		],
		'no-void': 'off',
		'oxc/no-barrel-file': 'off',
		'prefer-arrow-callback': ['error', { allowNamedFunctions: true }],
		'typescript/consistent-type-imports': [
			'error',
			{ disallowTypeAnnotations: false, fixStyle: 'inline-type-imports' },
		],
		'typescript/no-misused-promises': [
			'error',
			{ checksVoidReturn: { attributes: false } },
		],
		'typescript/switch-exhaustiveness-check': [
			'error',
			{ considerDefaultExhaustiveForUnions: true },
		],
	},
	overrides: [
		{
			// Their tool loads them only through the default export: Astro, commitlint, oxlint, oxfmt and Vitest.
			files: [
				'astro.config.mjs',
				'commitlint.config.ts',
				'oxlint.config.mts',
				'oxfmt.config.mts',
				'vitest.config.ts',
			],
			rules: { 'import/no-default-export': 'off' },
		},
		{
			// Astro injects Astro into every component and names components in PascalCase.
			files: ['**/*.astro'],
			globals: { Astro: 'readonly' },
			rules: {
				'unicorn/filename-case': [
					'error',
					{ cases: { kebabCase: true, pascalCase: true } },
				],
			},
		},
		{
			files: ['**/*.spec.ts'],
			env: { vitest: true },
			plugins: SPEC_PLUGINS,
		},
	] satisfies OxlintOverride[],
})
