import { describe, expect, it } from 'vitest'
import { getCommitYears } from '../domain/commit-days.helper'
import { RIGTCH_FM_FIRST_WEEK } from '../domain/rigtch-fm-commits.constants'
import { getWeeklyTotals } from '../domain/weekly-totals.helper'
import snapshot from './rigtch-fm-archive-commits.snapshot.json'
import snapshotText from './rigtch-fm-archive-commits.snapshot.json?raw'

const dates = Object.keys(snapshot.days)
const entries = Object.entries(snapshot.days)

describe('rigtch.fm archive commits snapshot', () => {
	it('stores only its fetch date and commit days without email addresses', () => {
		expect(Object.keys(snapshot).toSorted()).toEqual(['days', 'fetchedAt'])
		expect(snapshot.fetchedAt).toBe('2026-11-25')
		expect(snapshotText).not.toContain('@')
	})

	it('stores unique ascending ISO dates from 2022-11-01 through 2025', () => {
		const sourceDates = [
			...snapshotText.matchAll(/"(\d{4}-\d{2}-\d{2})"\s*:/gu),
		].map(([, date]) => date)

		expect(sourceDates).toEqual(dates)
		expect(new Set(sourceDates).size).toBe(dates.length)
		expect(dates).toEqual([...dates].toSorted())
		expect(dates[0]).toBe('2022-11-01')
		for (const date of dates) {
			expect(date).toMatch(/^\d{4}-\d{2}-\d{2}$/u)
			expect(new Date(`${date}T00:00:00Z`).toISOString().slice(0, 10)).toBe(
				date
			)
			expect(date >= '2022-11-01' && date <= '2025-12-31').toBe(true)
		}
	})

	it('stores a positive integer count on every day', () => {
		for (const [date, count] of entries) {
			expect(Number.isInteger(count), date).toBe(true)
			expect(count, date).toBeGreaterThan(0)
		}
	})

	it.each([
		{ year: 2022, expected: 206 },
		{ year: 2023, expected: 507 },
		{ year: 2024, expected: 1116 },
		{ year: 2025, expected: 1 },
	])('adds up to $expected commits in $year', ({ year, expected }) => {
		expect(
			entries
				.filter(([date]) => date.startsWith(`${year}-`))
				.reduce((sum, [, count]) => sum + count, 0)
		).toBe(expected)
	})

	it('adds up to 1830 commits across all years', () => {
		expect(entries.reduce((sum, [, count]) => sum + count, 0)).toBe(1830)
	})

	it('preserves all 1830 commits in weekly buckets from the first date through 2025', () => {
		const weeks = getWeeklyTotals(getCommitYears([snapshot.days]), {
			from: RIGTCH_FM_FIRST_WEEK,
			to: '2025-12-31',
		})

		expect(weeks[0]?.weekStart).toBe('2022-11-01')
		expect(weeks.reduce((sum, { total }) => sum + total, 0)).toBe(1830)
	})
})
