import { describe, expect, it } from 'vitest'
import snapshot from './rigtch-fm-commits.snapshot.json'
import snapshotText from './rigtch-fm-commits.snapshot.json?raw'

describe('rigtch.fm daily commits snapshot', () => {
	it('stores only an ISO generation timestamp and commit days without email addresses', () => {
		expect(Object.keys(snapshot).toSorted()).toEqual(['days', 'generatedAt'])
		expect(new Date(snapshot.generatedAt).toISOString()).toBe(
			snapshot.generatedAt
		)
		expect(snapshotText).not.toContain('@')
	})

	it('stores ISO dates no earlier than December 2024', () => {
		for (const date of Object.keys(snapshot.days)) {
			expect(date).toMatch(/^\d{4}-\d{2}-\d{2}$/u)
			expect(new Date(`${date}T00:00:00Z`).toISOString().slice(0, 10)).toBe(
				date
			)
			expect(date >= '2024-12-01').toBe(true)
		}
	})

	it('stores a positive integer count on every day', () => {
		for (const [date, count] of Object.entries(snapshot.days)) {
			expect(Number.isInteger(count), date).toBe(true)
			expect(count, date).toBeGreaterThan(0)
		}
	})
})
