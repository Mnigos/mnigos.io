import type { ShikiConfig } from 'astro'

type CodeRole =
	| 'keyword'
	| 'string'
	| 'function'
	| 'constant'
	| 'type'
	| 'punctuation'
	| 'variable'
	| 'comment'

type CodeTransformer = NonNullable<ShikiConfig['transformers']>[number]

const scriptLanguages = new Set([
	'js',
	'jsx',
	'mjs',
	'cjs',
	'ts',
	'tsx',
	'mts',
	'cts',
	'javascript',
	'typescript',
])

const roleColour = (role: string) => `var(--color-code-${role})`

const scopesByRole: Record<CodeRole, string[]> = {
	punctuation: [
		'punctuation',
		'meta.brace',
		'keyword.operator',
		'storage.type.function.arrow',
	],
	variable: [
		'variable',
		'meta.template.expression',
		'support.variable',
		'support.type.property-name',
		'meta.object-literal.key',
		'constant.other.database-name.sql',
		'constant.other.table-name.sql',
	],
	keyword: [
		'keyword',
		'storage',
		'keyword.operator.new',
		'keyword.operator.expression',
		'keyword.operator.logical.sql',
		'variable.language',
		'punctuation.definition.template-expression',
	],
	string: [
		'string',
		'punctuation.definition.string',
		'punctuation.support.type.property-name',
	],
	function: [
		'entity.name.function',
		'support.function',
		'variable.function',
		'entity.name.command',
		'meta.function-call.generic',
	],
	constant: [
		'constant',
		'support.constant',
		'keyword.other.unit',
		'variable.other.enummember',
	],
	type: [
		'entity.name.type',
		'entity.name.class',
		'entity.other.inherited-class',
		'support.type',
		'support.class',
		'storage.type.sql',
		'entity.name.tag',
		'entity.other.attribute-name',
	],
	comment: ['comment', 'punctuation.definition.comment'],
}

/** Colours are CSS variables, so code blocks follow the code tokens in global.css. */
export const codeTheme: ShikiConfig['theme'] = {
	name: 'mnigos',
	type: 'dark',
	colors: {
		'editor.background': 'var(--color-code)',
		'editor.foreground': 'var(--color-code-variable)',
	},
	tokenColors: Object.entries(scopesByRole).map(([role, scope]) => ({
		scope,
		settings: {
			foreground: roleColour(role),
			...(role === 'comment' && { fontStyle: 'italic' }),
		},
	})),
}

/** The grammar scopes `new Widget()` as a call, so the class name after `new` is recoloured as a type. */
export const constructorTypes: CodeTransformer = {
	name: 'constructor-types',
	tokens(lines) {
		if (!scriptLanguages.has(this.options.lang)) return

		for (const line of lines) {
			for (const [index, token] of line.entries()) {
				if (
					token.color !== roleColour('keyword') ||
					token.content.trim() !== 'new'
				)
					continue

				const rest = line.slice(index + 1)
				const end = rest.findIndex(
					next => !/^[\s\p{ID_Continue}$.]+$/u.test(next.content)
				)
				const name = rest
					.slice(0, end === -1 ? undefined : end)
					.findLast(next => next.color === roleColour('function'))

				if (name) name.color = roleColour('type')
			}
		}
	},
}
