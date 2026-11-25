import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const css = read('src/styles/global.css').replaceAll(/\/\*.*?\*\/|\s+/gsu, '')
const layout = read('src/modules/site/presentation/layout.astro')
const header = block(css, '@utility sticky-header')
const brand = block(css, '@utility header-brand')
const progress = block(block(header, '@variant scroll-driven'), '&::after')

function read(path: string): string {
	return readFileSync(new URL(`../../${path}`, import.meta.url), 'utf-8')
}

function block(source: string, selector: string): string {
	const start = source.indexOf(`${selector.replaceAll(/\s+/gu, '')}{`)
	if (start === -1) throw new Error(`Missing CSS block ${selector}`)
	const stack = []
	for (let end = source.indexOf('{', start); end < source.length; end++) {
		if (source[end] === '{') stack.push(end)
		if (source[end] === '}') stack.pop()
		if (stack.length === 0) return source.slice(start, end + 1)
	}
	throw new Error(`Unclosed CSS block ${selector}`)
}

function endpoint(rule: string): string {
	const name = /animation-name:([^;]+);/u.exec(rule)?.[1]
	return block(block(css, `@keyframes ${name}`), 'to')
}

describe('sticky header contract', () => {
	it('attaches the utilities to the shared header and home link', () => {
		const tag = /<header\b[^>]*>/u.exec(layout)?.[0] ?? ''
		expect(tag).toMatch(/class\s*=\s*['"][^'"]*\bsticky-header\b/u)
		expect(tag).toMatch(/class\s*=\s*['"][^'"]*\bpy-header\b/u)
		expect(layout).toMatch(
			/<a\b(?=[^>]*\bhref\s*=\s*['"]\/['"])[^>]*\bclass\s*=\s*['"][^'"]*\bheader-brand\b/u
		)
	})

	it('gates stickiness and scroll effects on screen and timeline support', () => {
		const sticky = block(header, '@media screen')
		expect(sticky).toContain('position:sticky;')
		expect(sticky).toMatch(/background(?:-color)?:var\(--color-bg\)/u)
		expect(header.replace(sticky, '')).not.toContain('position:sticky;')
		const variant = block(css, '@custom-variant scroll-driven')
		const screen = block(variant, '@media screen')
		const support = block(screen, '@supports (animation-timeline: scroll())')
		expect(support).toContain('@slot;')
		expect(variant.match(/@slot;/gu)).toHaveLength(1)
	})

	it.each([header, brand])('gates shrink and avoids shorthand', utility => {
		const driven = block(utility, '@variant scroll-driven')
		const motion = block(driven, '@variant motion-safe')
		const outside =
			utility.replace(driven, '') +
			driven.replace(motion, '').replace(progress, '')
		expect(endpoint(motion)).toMatch(/(?:padding-block|font-size):/u)
		expect(motion).toContain('animation-timeline:scroll(root);')
		expect(outside).not.toMatch(/animation[\w-]*:|::after/u)
		expect(motion).not.toContain('::after')
		expect(utility).not.toMatch(/\banimation:/u)
	})

	it('animates the hexagon and compensates padding with shared spacing', () => {
		expect(endpoint(block(brand, '& svg'))).toMatch(/height:/u)
		const margin = /margin-bottom:([^;]+);/u.exec(endpoint(header))?.[1] ?? ''
		expect(margin).toMatch(/^calc\(/u)
		for (const token of ['--spacing-header', '--spacing-header-compact'])
			expect(margin).toContain(`var(${token})`)
	})

	it('reveals the stroke over the full root scroll even with reduced motion', () => {
		const urls = (header + brand).matchAll(/url\(['"]?([^'"()]+)['"]?\)/gu)
		expect([...urls].map(match => match[1])).toEqual(['./link-stroke.svg'])
		expect(progress).toContain('./link-stroke.svg')
		expect(header + brand).not.toMatch(
			/data:|<svg\b|image(?:-set)?\(|gradient\(/u
		)
		expect(progress).not.toMatch(/@variant|animation-range[\w-]*:/u)
		expect(progress).toContain('clip-path:inset(0100%00);')
		expect(progress).toContain('animation-timeline:scroll(root);')
		expect(endpoint(progress)).toMatch(/clip-path:inset\(0(?:000)?\);/u)
	})

	it('reserves greater root anchor clearance below xs', () => {
		const html = block(block(css, '@layer base'), 'html')
		const xs = block(html, '@variant xs')
		const clearance = /scroll-padding-top:[^;]*?([\d.]+)/u
		const narrow = Number(clearance.exec(html.replace(xs, ''))?.[1])
		const wide = Number(clearance.exec(xs)?.[1])
		expect(wide).toBeGreaterThan(0)
		expect(narrow).toBeGreaterThan(wide)
	})
})
