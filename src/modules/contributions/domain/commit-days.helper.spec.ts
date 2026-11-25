import { describe, expect, it } from 'vitest'
import { getCommitYears } from './commit-days.helper'
import type { CommitDays } from './contribution.types'

describe('getCommitYears', () => {
	it('adds sources on the same date without changing either source', () => {
		const sources: readonly CommitDays[] = [
			{ '2025-01-01': 3, '2025-01-03': 7 },
			{ '2025-01-01': 5, '2025-01-02': 11 },
		]
		const original = structuredClone(sources)
		const counts = Array.from({ length: 365 }, () => 0)
		counts[0] = 8
		counts[1] = 11
		counts[2] = 7

		expect(getCommitYears(sources)).toEqual([{ year: 2025, total: 26, counts }])
		expect(sources).toEqual(original)
	})

	it('sorts years and fills the calendar across year boundaries and leap day', () => {
		const counts2023 = Array.from({ length: 365 }, () => 0)
		counts2023[364] = 2
		const counts2024 = Array.from({ length: 366 }, () => 0)
		counts2024[0] = 3
		counts2024[58] = 5
		counts2024[59] = 7
		counts2024[60] = 11
		counts2024[365] = 13
		const counts2025 = Array.from({ length: 365 }, () => 0)
		counts2025[0] = 17

		expect(
			getCommitYears([
				{
					'2025-01-01': 17,
					'2024-12-31': 13,
					'2024-03-01': 11,
					'2024-02-29': 7,
					'2024-02-28': 5,
					'2024-01-01': 3,
					'2023-12-31': 2,
				},
			])
		).toEqual([
			{ year: 2023, total: 2, counts: counts2023 },
			{ year: 2024, total: 39, counts: counts2024 },
			{ year: 2025, total: 17, counts: counts2025 },
		])
	})

	it('omits years between sources when they have no commits', () => {
		expect(
			getCommitYears([{}, { '2025-06-01': 2 }, { '2022-11-01': 3 }]).map(
				({ year, total }) => ({ year, total })
			)
		).toEqual([
			{ year: 2022, total: 3 },
			{ year: 2025, total: 2 },
		])
	})

	it.each([{ sources: [] }, { sources: [{}] }, { sources: [{}, {}] }])(
		'returns no years for empty sources $sources',
		({ sources }) => {
			expect(getCommitYears(sources)).toEqual([])
		}
	)
})
