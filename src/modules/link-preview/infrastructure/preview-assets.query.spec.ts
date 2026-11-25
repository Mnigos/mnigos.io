import { readFile } from 'node:fs/promises'
import { describe, expect, it } from 'vitest'
import { loadPreviewAssets } from './preview-assets.query'

describe('loadPreviewAssets', () => {
	it('loads all three local fonts with the renderer names and weights', async () => {
		const { fonts } = await loadPreviewAssets()

		expect(fonts.map(({ name, weight }) => ({ name, weight }))).toStrictEqual([
			{ name: 'Martian Mono', weight: 800 },
			{ name: 'Martian Mono', weight: 400 },
			{ name: 'Archivo', weight: 400 },
		])
		for (const font of fonts) expect(font.data.byteLength).toBeGreaterThan(0)
	})

	it.each([
		['Martian Mono', 800, 'MartianMono-CnxBd.ttf'],
		['Martian Mono', 400, 'MartianMono-CnRg.ttf'],
		['Archivo', 400, 'Archivo-Regular.ttf'],
	] as const)(
		'returns the actual %s %i font bytes',
		async (name, weight, filename) => {
			const { fonts } = await loadPreviewAssets()
			const expected = await readFile(
				new URL(`fonts/${filename}`, import.meta.url)
			)

			expect(
				fonts.find(font => font.name === name && font.weight === weight)?.data
			).toStrictEqual(expected)
		}
	)

	it.each([
		['bg', 'bg'],
		['ink', 'ink'],
		['dim', 'dim'],
		['faint', 'faint'],
		['line', 'line-strong'],
	] as const)('uses the global.css hex value for %s', async (name, token) => {
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
		const expected = declarations.get(`--color-${token}`)

		expect(expected).toMatch(/^#[\da-f]{6}$/iu)
		expect(colors[name]).toBe(expected)
	})

	it('indexes contribution colors from cell through level 8 in global.css order', async () => {
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
		const expected = [
			'cell',
			'level-1',
			'level-2',
			'level-3',
			'level-4',
			'level-5',
			'level-6',
			'level-7',
			'level-8',
		].map(name => declarations.get(`--color-${name}`))

		for (const color of expected) expect(color).toMatch(/^#[\da-f]{6}$/iu)
		expect(colors.levels).toStrictEqual(expected)
	})

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
