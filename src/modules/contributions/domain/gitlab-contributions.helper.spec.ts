import { describe, expect, it } from 'vitest'
import type { ContributionYear, GitLabEventDays } from './contribution.types'
import {
	addGitLabContributions,
	getGitLabContributionCount,
} from './gitlab-contributions.helper'

describe('getGitLabContributionCount', () => {
	it.each([
		{ column: 'pushes', index: 0, expected: 7 },
		{ column: 'commits', index: 1, expected: 0 },
		{ column: 'merge requests opened', index: 2, expected: 7 },
		{ column: 'merge requests merged', index: 3, expected: 7 },
		{ column: 'approvals', index: 4, expected: 7 },
		{ column: 'issues opened', index: 5, expected: 7 },
		{ column: 'issues closed', index: 6, expected: 7 },
		{ column: 'comments', index: 7, expected: 7 },
		{ column: 'branch deletions', index: 8, expected: 0 },
		{ column: 'other', index: 9, expected: 7 },
	])('counts $column as $expected', ({ index, expected }) => {
		const events = Array.from({ length: 10 }, () => 0)
		events[index] = 7

		expect(getGitLabContributionCount(events)).toBe(expected)
	})

	it('adds the eight included columns on a day with every event type', () => {
		expect(
			getGitLabContributionCount([2, 101, 3, 5, 7, 11, 13, 17, 103, 19])
		).toBe(77)
	})

	it('returns zero for a day without events', () => {
		expect(
			getGitLabContributionCount(Array.from({ length: 10 }, () => 0))
		).toBe(0)
	})
})

describe('addGitLabContributions', () => {
	it('adds to the exact dates across year boundaries and leap day, preserving other days and years', () => {
		const years: ContributionYear[] = [
			{ year: 2025, total: 1825, counts: Array.from({ length: 365 }, () => 5) },
			{ year: 2024, total: 1098, counts: Array.from({ length: 366 }, () => 3) },
			{ year: 2023, total: 730, counts: Array.from({ length: 365 }, () => 2) },
			{ year: 2026, total: 2555, counts: Array.from({ length: 365 }, () => 7) },
		]
		const days: GitLabEventDays = {
			'2023-12-31': [1, 7, 2, 4, 3, 5, 6, 7, 8, 9],
			'2024-01-01': [11, 110, 0, 0, 0, 0, 0, 0, 1100, 0],
			'2024-02-28': [13, 130, 0, 0, 0, 0, 0, 0, 1300, 0],
			'2024-02-29': [19, 190, 0, 0, 0, 0, 0, 0, 1900, 0],
			'2024-03-01': [23, 230, 0, 0, 0, 0, 0, 0, 2300, 0],
			'2024-12-31': [29, 290, 0, 0, 0, 0, 0, 0, 2900, 0],
			'2025-01-01': [31, 310, 0, 0, 0, 0, 0, 0, 3100, 0],
		}
		const originalYears = structuredClone(years)
		const originalDays = structuredClone(days)
		const counts2023 = Array.from({ length: 365 }, () => 2)
		counts2023[364] = 39
		const counts2024 = Array.from({ length: 366 }, () => 3)
		counts2024[0] = 14
		counts2024[58] = 16
		counts2024[59] = 22
		counts2024[60] = 26
		counts2024[365] = 32
		const counts2025 = Array.from({ length: 365 }, () => 5)
		counts2025[0] = 36

		const combined = addGitLabContributions(years, days)

		expect(combined).toEqual([
			{ year: 2025, total: 1856, counts: counts2025 },
			{ year: 2024, total: 1193, counts: counts2024 },
			{ year: 2023, total: 767, counts: counts2023 },
			years[3],
		])
		expect(years).toEqual(originalYears)
		expect(days).toEqual(originalDays)
		expect(combined).not.toBe(years)
		for (const [index, year] of combined.entries()) {
			expect(year).not.toBe(years[index])
			expect(year.counts).not.toBe(years[index]?.counts)
		}
	})

	it('preserves the GitHub total when it differs from the sum of daily counts', () => {
		expect(
			addGitLabContributions([{ year: 2024, total: 100, counts: [4] }], {
				'2024-01-01': [7, 70, 0, 0, 0, 0, 0, 0, 700, 0],
			})
		).toEqual([{ year: 2024, total: 107, counts: [11] }])
	})

	it('ignores days containing only commits and branch deletions', () => {
		const years = [{ year: 2024, total: 100, counts: [4, 6] }]

		expect(
			addGitLabContributions(years, {
				'2024-01-01': [0, 243, 0, 0, 0, 0, 0, 0, 6, 0],
				'2024-01-02': [0, 7, 0, 0, 0, 0, 0, 0, 8, 0],
			})
		).toEqual(years)
	})

	it('leaves every count and total unchanged when there are no GitLab days', () => {
		const years = [{ year: 2025, total: 10, counts: [4, 6] }]

		expect(addGitLabContributions(years, {})).toEqual(years)
	})

	it('returns no years when there are no GitHub years', () => {
		expect(addGitLabContributions([], {})).toEqual([])
	})
})
