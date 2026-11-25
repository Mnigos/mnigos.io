import { describe, expect, test } from 'vitest'
import { RIGTCH_PAGE } from './rigtch-page.content'

describe('RIGTCH_PAGE', () => {
	test('keeps the six product features in their display order', () => {
		expect(
			RIGTCH_PAGE.whatItDoes.features.map(({ title }) => title)
		).toStrictEqual([
			'Top artists, tracks, albums and genres',
			'Full history import',
			'Listening reports',
			'Images to share',
			'Leaderboard',
			'Streak',
		])
		for (const feature of RIGTCH_PAGE.whatItDoes.features) {
			expect(feature.text.trim().length).toBeGreaterThan(0)
		}
	})

	test('keeps the six stack rows in their display order', () => {
		expect(RIGTCH_PAGE.stack.rows).toStrictEqual([
			{ label: 'Language', value: 'TypeScript' },
			{ label: 'API', value: 'NestJS on Bun, oRPC' },
			{ label: 'Data', value: 'PostgreSQL' },
			{ label: 'Jobs', value: 'BullMQ' },
			{ label: 'Web', value: 'TanStack Start' },
			{ label: 'Hosting', value: 'Railway' },
		])
	})

	test('keeps three screenshots with a wide crop only on the first', () => {
		expect(RIGTCH_PAGE.screenshots).toHaveLength(3)
		expect(RIGTCH_PAGE.screenshots[0].wide).toBeDefined()
		expect(RIGTCH_PAGE.screenshots[0].wide).not.toStrictEqual(
			RIGTCH_PAGE.screenshots[0].image
		)
		for (const screenshot of RIGTCH_PAGE.screenshots.slice(1)) {
			expect(screenshot).not.toHaveProperty('wide')
		}
		for (const screenshot of RIGTCH_PAGE.screenshots) {
			expect(screenshot.image).toBeDefined()
			expect(screenshot.alt.trim().length).toBeGreaterThan(0)
		}
	})

	test('lists posts tagged rigtch', () => {
		expect(RIGTCH_PAGE.posts.tag).toBe('rigtch')
	})

	test('excludes forbidden punctuation from every page string', () => {
		expect(JSON.stringify(RIGTCH_PAGE)).not.toMatch(/[\u2013\u2014]/u)
	})
})
