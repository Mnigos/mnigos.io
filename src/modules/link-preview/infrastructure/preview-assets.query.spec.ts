import { readFile } from 'node:fs/promises'
import { describe, expect, it } from 'vitest'
import { loadPreviewAssets } from './preview-assets.query'

describe('loadPreviewAssets', () => {
	it('loads both local fonts with the renderer names and weights', async () => {
		const { fonts } = await loadPreviewAssets()

		expect(fonts.map(({ name, weight }) => ({ name, weight }))).toStrictEqual([
			{ name: 'Martian Mono', weight: 800 },
			{ name: 'Archivo', weight: 400 },
		])
		for (const font of fonts) expect(font.data.byteLength).toBeGreaterThan(0)
	})

	it.each([
		['Martian Mono', 'MartianMono-CnxBd.ttf'],
		['Archivo', 'Archivo-Regular.ttf'],
	])('returns the actual %s font bytes', async (name, filename) => {
		const { fonts } = await loadPreviewAssets()
		const expected = await readFile(
			new URL(`fonts/${filename}`, import.meta.url)
		)

		expect(fonts.find(font => font.name === name)?.data).toStrictEqual(expected)
	})

	it.each(['bg', 'ink', 'dim', 'faint'] as const)(
		'uses the global.css hex value for %s',
		async name => {
			const { colors } = await loadPreviewAssets()
			const css = await readFile(
				new URL('../../../styles/global.css', import.meta.url),
				'utf-8'
			)
			const declarations = new Map(
				[...css.matchAll(/(--color-[\w-]+):\s*([^;]+);/gu)].map(match => [
					match[1],
					match[2].trim(),
				])
			)
			const expected = declarations.get(`--color-${name}`)

			expect(expected).toMatch(/^#[\da-f]{6}$/iu)
			expect(colors[name]).toBe(expected)
		}
	)

	it('embeds the favicon SVG as a self-contained data URL', async () => {
		const { logo } = await loadPreviewAssets()
		const expected = await readFile(
			new URL('../../../../public/favicon.svg', import.meta.url),
			'utf-8'
		)

		expect(logo).toMatch(/^data:image\/svg\+xml;base64,[\w+/]+=*$/u)
		const decoded = Buffer.from(logo.split(',')[1], 'base64').toString('utf-8')

		expect(decoded).toBe(expected)
		expect(decoded).toContain('<svg')
	})
})
