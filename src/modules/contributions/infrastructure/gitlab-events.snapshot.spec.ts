import { describe, expect, it } from 'vitest'
import snapshot from './gitlab-events.snapshot.json'
import snapshotText from './gitlab-events.snapshot.json?raw'

const dates = Object.keys(snapshot.days)
const entries = Object.entries(snapshot.days)

describe('GitLab events snapshot', () => {
	it('records its fetch date and all ten columns in export order', () => {
		expect(Object.keys(snapshot).toSorted()).toEqual([
			'columns',
			'days',
			'fetchedAt',
		])
		expect(snapshot.fetchedAt).toBe('2026-11-25')
		expect(snapshot.columns).toEqual([
			'pushes',
			'commits',
			'mergeRequestsOpened',
			'mergeRequestsMerged',
			'approvals',
			'issuesOpened',
			'issuesClosed',
			'comments',
			'branchDeletions',
			'other',
		])
	})

	it('stores exactly 400 unique ascending dates from 2021-12-08 to 2024-01-16', () => {
		const sourceDates = [
			...snapshotText.matchAll(/"(\d{4}-\d{2}-\d{2})"\s*:/gu),
		].map(([, date]) => date)

		expect(sourceDates).toHaveLength(400)
		expect(new Set(sourceDates).size).toBe(400)
		expect(sourceDates).toEqual(dates)
		expect(dates).toEqual([...dates].toSorted())
		expect(dates[0]).toBe('2021-12-08')
		expect(dates.at(-1)).toBe('2024-01-16')
		for (const date of dates) {
			expect(date).toMatch(/^\d{4}-\d{2}-\d{2}$/u)
			expect(new Date(`${date}T00:00:00Z`).toISOString().slice(0, 10)).toBe(
				date
			)
			expect(date >= '2021-12-08' && date <= '2024-01-16').toBe(true)
		}
	})

	it('stores ten non-negative integer counts on every day', () => {
		for (const [date, counts] of entries) {
			expect(counts, date).toHaveLength(10)
			expect(
				counts.every(count => Number.isInteger(count) && count >= 0),
				date
			).toBe(true)
		}
	})

	it('preserves every export column sum', () => {
		expect(
			snapshot.columns.map((_, index) =>
				entries.reduce((sum, [, counts]) => sum + counts[index], 0)
			)
		).toEqual([2145, 9174, 427, 378, 137, 328, 305, 891, 402, 24])
	})

	it.each([
		{ year: 2021, expected: 719 },
		{ year: 2022, expected: 6675 },
		{ year: 2023, expected: 2649 },
		{ year: 2024, expected: 23 },
	])('adds up to $expected contributions in $year', ({ year, expected }) => {
		expect(
			entries
				.filter(([date]) => date.startsWith(`${year}-`))
				.reduce(
					(sum, [, counts]) =>
						sum + counts[1] + counts[2] + counts[4] + counts[5],
					0
				)
		).toBe(expected)
	})
})
