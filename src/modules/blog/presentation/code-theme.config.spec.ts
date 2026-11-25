import { readFileSync } from 'node:fs'
import { codeToHtml, codeToTokens, type ThemedToken } from 'shiki'
import { describe, expect, it } from 'vitest'
import { codeTheme, constructorTypes } from './code-theme.config'

type CodeRole =
	| 'keyword'
	| 'string'
	| 'function'
	| 'constant'
	| 'type'
	| 'punctuation'
	| 'variable'
	| 'comment'

const css = readFileSync(
	new URL('../../../styles/global.css', import.meta.url),
	'utf-8'
)
const variables = new Map(
	[...css.matchAll(/(--color-[\w-]+):\s*([^;]+);/gu)].map(match => [
		match[1],
		match[2].trim(),
	])
)
const sample = [
	'// A comment',
	'export interface Printable { render(input: string): string }',
	'export class Example<T> implements Printable {',
	'  value: number = 42;',
	'  async render(input: string): Promise<string> {',
	'    const enabled = true;',
	'    const empty = null;',
	'    const copy = new Example<T>();',
	'    await copy.render(input);',
	'    const withCall = new Example(copy.render(input));',
	`    return \`\${this.value} hello \${input}\`;`,
	'  }',
	'}',
].join('\n')
const highlighted = codeToTokens(sample, {
	lang: 'ts',
	theme: getTheme(),
})
const renderedTokens: ThemedToken[][] = []
const rendered = codeToHtml(sample, {
	lang: 'ts',
	theme: getTheme(),
	transformers: [
		constructorTypes,
		{
			name: 'capture-rendered-tokens',
			tokens(lines) {
				renderedTokens.push(...lines)
			},
		},
	],
})
const roleScopes: [string, CodeRole][] = [
	['comment', 'comment'],
	['keyword', 'keyword'],
	['variable.language.this', 'keyword'],
	['punctuation.definition.template-expression', 'keyword'],
	['string', 'string'],
	['entity.name.function', 'function'],
	['support.function', 'function'],
	['constant.numeric', 'constant'],
	['constant.language', 'constant'],
	['support.type.primitive', 'type'],
	['entity.name.type', 'type'],
	['entity.name.class', 'type'],
	['punctuation', 'punctuation'],
	['keyword.operator', 'punctuation'],
	['variable.parameter', 'variable'],
	['variable.other.property', 'variable'],
]

function getTheme() {
	if (typeof codeTheme !== 'object' || codeTheme === null) {
		throw new TypeError('Expected a custom theme object')
	}

	return structuredClone(codeTheme)
}

function resolveColour(variable: string): string {
	const value = variables.get(variable)

	if (value === undefined) {
		throw new Error(`Missing CSS variable ${variable}`)
	}
	const reference = /^var\((--color-[\w-]+)\)$/u.exec(value)

	return reference ? resolveColour(reference[1]) : value
}

function luminance(hex: string): number {
	expect(hex).toMatch(/^#[\da-f]{6}$/iu)
	const channels = [1, 3, 5].map(offset => {
		const channel = Number.parseInt(hex.slice(offset, offset + 2), 16) / 255

		return channel <= 0.04045
			? channel / 12.92
			: ((channel + 0.055) / 1.055) ** 2.4
	})

	return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722
}

describe('codeTheme', () => {
	it('uses only declared code colour variables', () => {
		if (typeof codeTheme !== 'object' || codeTheme === null) {
			throw new TypeError('Expected a custom theme object')
		}
		const colours = [
			...Object.values(codeTheme.colors ?? {}),
			...(codeTheme.tokenColors ?? []).flatMap(({ settings }) =>
				[settings.foreground, settings.background].filter(
					colour => colour !== undefined
				)
			),
		]

		expect(colours.length).toBeGreaterThan(0)
		for (const colour of colours) {
			expect(colour).toMatch(/^var\(--color-code(?:-[a-z]+)?\)$/u)
			expect(variables.has(colour.slice(4, -1))).toBe(true)
		}
	})

	it('uses the code background and variable foreground', async () => {
		const result = await highlighted

		expect(result.bg).toBe('var(--color-code)')
		expect(result.fg).toBe('var(--color-code-variable)')
		expect(resolveColour('--color-code')).toBe('#111110')
	})

	it.each(roleScopes)('resolves scope %s to %s', (scope, role) => {
		if (typeof codeTheme !== 'object' || codeTheme === null) {
			throw new TypeError('Expected a custom theme object')
		}
		const rules = (codeTheme.tokenColors ?? []).flatMap(rule => {
			const scopes = Array.isArray(rule.scope) ? rule.scope : [rule.scope]

			return scopes
				.filter(
					candidate =>
						candidate &&
						(scope === candidate || scope.startsWith(`${candidate}.`))
				)
				.map(candidate => ({
					length: candidate?.length ?? 0,
					settings: rule.settings,
				}))
		})
		const [matched] = rules.toSorted((a, b) => b.length - a.length)

		expect(matched?.settings.foreground).toBe(`var(--color-code-${role})`)
		if (role === 'comment') {
			expect(matched?.settings.fontStyle).toBe('italic')
		}
	})

	it.each<[string, CodeRole]>([
		['// A comment', 'comment'],
		['export', 'keyword'],
		['interface', 'keyword'],
		['class', 'keyword'],
		['implements', 'keyword'],
		['this', 'keyword'],
		['new', 'keyword'],
		['return', 'keyword'],
		['await', 'keyword'],
		['${', 'keyword'],
		['hello', 'string'],
		['render', 'function'],
		['42', 'constant'],
		['true', 'constant'],
		['null', 'constant'],
		['number', 'type'],
		['Example', 'type'],
		['Printable', 'type'],
		['T', 'type'],
		['=', 'punctuation'],
		['input', 'variable'],
		['value', 'variable'],
	])('tokenizes %s with the %s role', async (text, role) => {
		await rendered
		const tokens = renderedTokens
		const matches = tokens
			.flat()
			.filter(
				token =>
					token.content.trim() === text ||
					(text === 'hello' && token.content.includes('hello'))
			)

		expect(matches.length).toBeGreaterThan(0)
		for (const token of matches) {
			expect(token.color).toBe(`var(--color-code-${role})`)
			if (role === 'comment') {
				expect((token.fontStyle ?? 0) % 2).toBe(1)
			}
		}
	})

	it('colours the closing interpolation brace as a keyword', async () => {
		await rendered
		const tokens = renderedTokens
		const line = tokens.find(tokensInLine =>
			tokensInLine.some(token => token.content.trim() === 'return')
		)
		const braces = line?.filter(token => token.content === '}')

		expect(braces).toHaveLength(2)
		expect(braces?.map(token => token.color)).toEqual([
			'var(--color-code-keyword)',
			'var(--color-code-keyword)',
		])
	})

	it('keeps every code role at WCAG AA contrast against the code background', () => {
		const roles = [...variables.keys()].filter(variable =>
			variable.startsWith('--color-code-')
		)
		const background = luminance(resolveColour('--color-code'))

		expect(roles).toHaveLength(8)
		for (const variable of roles) {
			const foreground = luminance(resolveColour(variable))
			const contrast =
				(Math.max(foreground, background) + 0.05) /
				(Math.min(foreground, background) + 0.05)

			expect(contrast, `${variable} contrast`).toBeGreaterThanOrEqual(4.5)
		}
	})
})
