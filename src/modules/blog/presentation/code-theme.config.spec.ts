import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { codeTheme } from './code-theme.config'

describe('codeTheme', () => {
	it('uses only site colour variables that exist in global.css', () => {
		if (typeof codeTheme !== 'object' || codeTheme === null) {
			throw new TypeError('Expected a custom theme object')
		}

		const css = readFileSync(
			new URL('../../../styles/global.css', import.meta.url),
			'utf-8'
		)
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
			expect(colour).toMatch(/^var\(--color-[a-z0-9-]+\)$/u)
			const variable = colour.slice(4, -1)

			expect(css).toContain(`${variable}:`)
		}
	})

	it('uses the agreed background and foreground', () => {
		expect(codeTheme).toMatchObject({
			colors: {
				'editor.background': 'var(--color-code)',
				'editor.foreground': 'var(--color-ink)',
			},
		})
	})

	it.each([
		['comment', 'var(--color-faint)'],
		['keyword', 'var(--color-accent)'],
		['string', 'var(--color-level-5)'],
	])('colours %s with %s', (scope, foreground) => {
		if (typeof codeTheme !== 'object' || codeTheme === null) {
			throw new TypeError('Expected a custom theme object')
		}

		const rule = codeTheme.tokenColors?.find(token =>
			Array.isArray(token.scope)
				? token.scope.includes(scope)
				: token.scope === scope
		)

		expect(rule?.settings.foreground).toBe(foreground)
	})
})
