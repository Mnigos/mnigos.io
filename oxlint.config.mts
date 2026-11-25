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
	'typescript/no-confusing-void-expression':
		'concise void-returning arrow callbacks are allowed',
	'typescript/non-nullable-type-assertion-style':
		'pushes towards non-null assertions, which typescript/no-non-null-assertion bans',
	'typescript/prefer-nullish-coalescing':
		'|| is intentional where every falsy value needs the fallback',
	'typescript/strict-boolean-expressions':
		'truthiness checks and || fallbacks are intentional',
	'unicorn/import-style': 'named imports from Node builtins are the convention',
	'unicorn/no-array-reduce': 'reduce is accepted for aggregations',
	'unicorn/prefer-ternary': 'early returns read better than ternaries',
	'unicorn/switch-case-braces': 'single-statement cases need no braces',
} as const satisfies Record<string, string>

const CONVENTION_RULES = {
	'max-lines': ['error', { max: 400 }],
	'mnigos/declaration-group-spacing': 'error',
	'mnigos/declaration-jsdoc': 'error',
	'mnigos/no-inline-param-type': 'error',
	'mnigos/no-let': 'error',
	'mnigos/type-param-prefix': 'error',
} satisfies OxlintOverride['rules']

const PRESETS = [core, astro]

const SPEC_PLUGINS = [
	...new Set([
		...PRESETS.flatMap(preset => preset.plugins ?? []),
		'vitest',
	] satisfies OxlintOverride['plugins']),
]

export default defineConfig({
	extends: PRESETS,
	jsPlugins: ['./tooling/oxlint-plugin/mnigos.plugin.mts'],
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
		...CONVENTION_RULES,
	},
	overrides: [
		{
			// Their tool loads them only through the default export: Astro, commitlint, oxlint (config and plugin), oxfmt and Vitest.
			files: [
				'astro.config.mjs',
				'commitlint.config.ts',
				'oxlint.config.mts',
				'tooling/oxlint-plugin/mnigos.plugin.mts',
				'oxfmt.config.mts',
				'vitest.config.ts',
			],
			rules: { 'import/no-default-export': 'off' },
		},
		{
			files: ['src/**'],
			rules: {
				'mnigos/file-role-folder': 'error',
				'mnigos/file-role-suffix': 'error',
				'mnigos/module-layout': 'error',
			},
		},
		{
			// Astro injects Astro into every component.
			files: ['**/*.astro'],
			globals: { Astro: 'readonly' },
		},
		{
			files: ['**/*.spec.ts'],
			env: { vitest: true },
			plugins: SPEC_PLUGINS,
		},
	] satisfies OxlintOverride[],
})
