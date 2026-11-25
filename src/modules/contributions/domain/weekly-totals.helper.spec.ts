import { describe, expect, it } from 'vitest'
import { getWeeklyTotals } from './weekly-totals.helper'

describe('getWeeklyTotals', () => {
	it('starts buckets at from and clips the last bucket at to', () => {
		const counts = Array.from({ length: 365 }, (_, index) => index + 1)

		expect(
			getWeeklyTotals([{ year: 2025, total: 0, counts }], {
				from: '2025-01-03',
				to: '2025-01-18',
			})
		).toEqual([
			{ weekStart: '2025-01-03', total: 42 },
			{ weekStart: '2025-01-10', total: 91 },
			{ weekStart: '2025-01-17', total: 35 },
		])
	})

	it('sums dates across a year boundary with the years in either order', () => {
		const counts2024 = Array.from({ length: 366 }, () => 0)
		counts2024[364] = 2
		counts2024[365] = 3
		const years = [
			{ year: 2025, total: 36, counts: [1, 2, 3, 4, 5, 6, 7, 8] },
			{ year: 2024, total: 5, counts: counts2024 },
		]

		expect(
			getWeeklyTotals(years, { from: '2024-12-30', to: '2025-01-08' })
		).toEqual([
			{ weekStart: '2024-12-30', total: 20 },
			{ weekStart: '2025-01-06', total: 21 },
		])
	})

	it('includes leap day in a seven-day bucket', () => {
		expect(
			getWeeklyTotals(
				[
					{
						year: 2024,
						total: 366,
						counts: Array.from({ length: 366 }, () => 1),
					},
				],
				{
					from: '2024-02-27',
					to: '2024-03-04',
				}
			)
		).toEqual([{ weekStart: '2024-02-27', total: 7 }])
	})

	it('counts missing days and a missing year as zero', () => {
		expect(
			getWeeklyTotals([{ year: 2025, total: 4, counts: [4] }], {
				from: '2024-12-30',
				to: '2025-01-08',
			})
		).toEqual([
			{ weekStart: '2024-12-30', total: 4 },
			{ weekStart: '2025-01-06', total: 0 },
		])
	})

	it('returns zero buckets for a period without any year data', () => {
		expect(
			getWeeklyTotals([], { from: '2025-01-01', to: '2025-01-08' })
		).toEqual([
			{ weekStart: '2025-01-01', total: 0 },
			{ weekStart: '2025-01-08', total: 0 },
		])
	})

	it('returns one bucket containing only the date when from equals to', () => {
		expect(
			getWeeklyTotals([{ year: 2025, total: 100, counts: [99, 1] }], {
				from: '2025-01-02',
				to: '2025-01-02',
			})
		).toEqual([{ weekStart: '2025-01-02', total: 1 }])
	})

	it('returns no buckets for a reversed period', () => {
		expect(
			getWeeklyTotals([], { from: '2025-01-02', to: '2025-01-01' })
		).toEqual([])
	})
})
