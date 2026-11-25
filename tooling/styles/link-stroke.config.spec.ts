import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const css = readFileSync(
	new URL('../../src/styles/global.css', import.meta.url),
	'utf-8'
)
const svg = readFileSync(
	new URL('../../src/styles/link-stroke.svg', import.meta.url),
	'utf-8'
)
const theme = /@theme\s*\{([^}]+)\}/u.exec(css)?.[1] ?? ''
const accent = /--color-accent:\s*([^;]+);/u.exec(theme)?.[1].trim()
const utility =
	/@utility inline-link\s*\{([\s\S]+?)(?=\n@utility)/u.exec(css)?.[1] ?? ''
const approvedPath =
	'M1.5 3.6 L 28 2.9 L 61 3.8 L 97 2.7 L 133 3.5 L 168 2.6 L 198.5 3.3 L 197.8 6.6 L 166 5.8 L 131 6.8 L 96 5.9 L 60 6.9 L 27 6.1 L 2.2 7.0 Z'

describe('inline-link stroke asset contract', () => {
	it('fills the SVG with the theme accent colour', () => {
		expect(accent).toMatch(/^#[\da-f]{6}$/iu)
		expect(/\bfill=['"]([^'"]+)['"]/u.exec(svg)?.[1]).toBe(accent)
	})

	it('keeps the approved stroke path', () => {
		expect([...svg.matchAll(/<path\b/gu)]).toHaveLength(1)
		expect(/<path\b[^>]*\bd=['"]([^'"]+)['"]/u.exec(svg)?.[1]).toBe(
			approvedPath
		)
	})

	it('uses the stroke asset in the inline-link utility', () => {
		expect(utility).toMatch(
			/background:\s*url\(['"]\.\/link-stroke\.svg['"]\)/u
		)
	})
})
