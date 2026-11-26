import { assert, describe, expect, it } from 'vitest'
import { PROFILE } from '../../profile/content/profile.content'
import { usesPageSchema } from '../domain/uses.schemas'
import { USES_PAGE } from './uses-page.content'

const ACCEPTED_STACK_GAPS = ['Astro', 'Cloudflare Workers', 'Zod']
const TOOL_ENTRIES = [
	USES_PAGE.agents,
	USES_PAGE.desk,
	USES_PAGE.music,
].flatMap(section => section.entries)
const TOOLS = TOOL_ENTRIES.flatMap(entry => entry.tools)

describe('USES_PAGE', () => {
	it('keeps exactly the accepted gaps between defaults and the Work stack', () => {
		const stackNames = new Set(
			PROFILE.stack.flatMap(group =>
				group.entries.flatMap(entry =>
					entry.technology.split(',').map(name => name.trim())
				)
			)
		)
		const defaultNames = USES_PAGE.defaults.rows.flatMap(row =>
			row.items.flatMap(item => [...item.names, ...item.on])
		)
		const missingNames = [
			...new Set(defaultNames.filter(name => !stackNames.has(name))),
		].toSorted()

		expect(missingNames).toStrictEqual(ACCEPTED_STACK_GAPS)
	})

	it('attaches Data hosts only to PostgreSQL', () => {
		expect(
			USES_PAGE.defaults.rows.find(row => row.label === 'Data')
		).toStrictEqual({
			label: 'Data',
			items: [
				{ names: ['PostgreSQL'], on: ['Neon', 'Railway'] },
				{ names: ['Drizzle'], on: [] },
				{ names: ['Redis'], on: [] },
				{ names: ['BullMQ'], on: [] },
			],
		})
	})

	it('keeps Neon directly after PostgreSQL in the Data stack group', () => {
		const data = PROFILE.stack.find(group => group.title === 'Data')

		assert(data !== undefined)
		const postgresIndex = data.entries.findIndex(
			entry => entry.technology === 'PostgreSQL'
		)

		expect(postgresIndex).toBeGreaterThanOrEqual(0)
		expect(data.entries[postgresIndex + 1]).toStrictEqual({
			technology: 'Neon',
			usedAt: ['Ludus AI', 'own projects'],
		})
	})

	it('excludes unwanted tools and keeps hardware unlinked without a Storage row', () => {
		expect(JSON.stringify(USES_PAGE)).not.toMatch(
			/AmpliTube|Cursor|Todoist|Notion/u
		)
		for (const name of ['Mac mini', 'Phone', 'MacBook Pro 16"']) {
			expect(TOOLS.find(tool => tool.name === name)).toStrictEqual({ name })
		}
		expect(USES_PAGE.gamingPc.rows).toStrictEqual([
			{ label: 'Graphics', items: [{ names: ['GeForce RTX 4070'], on: [] }] },
			{ label: 'Processor', items: [{ names: ['AMD Ryzen 7 5800X'], on: [] }] },
			{
				label: 'Motherboard',
				items: [{ names: ['MSI MAG B550 TOMAHAWK'], on: [] }],
			},
			{
				label: 'Memory',
				items: [{ names: ['4 × Corsair Vengeance RGB Pro SL'], on: [] }],
			},
			{
				label: 'Cooling',
				items: [{ names: ['Fractal Design liquid cooler'], on: [] }],
			},
			{
				label: 'Keyboard',
				items: [{ names: ['Dark Project Terra Nostra'], on: [] }],
				note: 'ALU81A',
			},
		])
		expect(
			USES_PAGE.agents.entries.find(entry =>
				entry.tools.some(tool => tool.name === 'Phone')
			)?.text
		).toBe(
			"For running coding agents on the go, which happens far more often than I'd like to admit."
		)
	})

	it('uses https tool URLs and the approved Soonlane, Work and rigtch links', () => {
		for (const tool of TOOLS) {
			if (tool.url !== undefined) expect(tool.url).toMatch(/^https:\/\//u)
		}
		expect(TOOLS.find(tool => tool.name === 'Soonlane')).toStrictEqual({
			name: 'Soonlane',
			url: 'https://soonlane.com',
		})
		expect(USES_PAGE.defaults.intro).toStrictEqual({
			text: 'My defaults for a new project. Everything I have used, and where, is on Work.',
			link: { label: 'Work', url: '/work' },
		})
		expect(
			USES_PAGE.music.entries.find(entry =>
				entry.tools.some(tool => tool.name === 'Spotify')
			)?.link
		).toStrictEqual({ label: 'rigtch.fm', url: '/rigtch' })
	})

	it('accepts one link label occurrence and rejects missing or repeated labels', () => {
		for (const [text, success] of [
			['See Work for details.', true],
			['See the details.', false],
			['Work and more Work.', false],
		] as const) {
			const linkedText = { text, link: { label: 'Work', url: '/work' } }

			expect(
				usesPageSchema.shape.defaults.shape.intro.safeParse(linkedText).success
			).toBe(success)
			expect(
				usesPageSchema.shape.music.shape.entries.element.safeParse({
					...linkedText,
					tools: [{ name: 'Spotify', url: 'https://www.spotify.com' }],
				}).success
			).toBe(success)
		}
	})

	it('excludes forbidden punctuation from every page string', () => {
		expect(JSON.stringify(USES_PAGE)).not.toMatch(/[\u2013\u2014]/u)
	})
})
