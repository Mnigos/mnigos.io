import { describe, expect, it } from 'vitest'
import {
	getWeekCount,
	getWeekOfYear,
	getYearWeeks,
	splitYearIntoSegments,
} from './contribution-weeks.helper'
import type { ContributionYear } from './contribution.types'

describe('getWeekOfYear', () => {
	it.each([
		['2023-01-01', 0],
		['2023-01-07', 0],
		['2023-01-08', 1],
		['2025-01-01', 0],
		['2025-01-04', 0],
		['2025-01-05', 1],
		['2021-01-01', 0],
		['2021-01-02', 0],
		['2021-01-03', 1],
		['2022-01-01', 0],
		['2022-01-02', 1],
		['2022-12-31', 52],
		['2024-02-29', 8],
		['2024-12-31', 52],
		['2028-12-31', 53],
	])('places %s in column %i', (date, expected) => {
		expect(getWeekOfYear(date)).toBe(expected)
	})
})

describe('getWeekCount', () => {
	it.each([
		[2021, 53],
		[2022, 53],
		[2023, 53],
		[2024, 53],
		[2025, 53],
		[2028, 54],
	])('allocates %i with %i Sunday-first columns', (year, expected) => {
		expect(getWeekCount(year)).toBe(expected)
	})
})

describe('splitYearIntoSegments', () => {
	it('covers a year without boundaries in one segment', () => {
		expect(splitYearIntoSegments(2023, [])).toEqual([
			{ start: '2023-01-01', fromWeek: 0, toWeek: 53 },
		])
	})

	it.each([
		{
			year: 2021,
			boundaries: ['2021-08-01'],
			ranges: [
				[0, 31],
				[31, 53],
			],
		},
		{
			year: 2024,
			boundaries: ['2024-04-01', '2024-10-01'],
			ranges: [
				[0, 13],
				[13, 39],
				[39, 53],
			],
		},
		{
			year: 2025,
			boundaries: ['2025-06-01'],
			ranges: [
				[0, 22],
				[22, 53],
			],
		},
	])(
		'splits $year at its given dates and covers each column once',
		({ year, boundaries, ranges }) => {
			const segments = splitYearIntoSegments(year, boundaries)

			expect(segments).toEqual(
				ranges.map(([fromWeek, toWeek], index) => ({
					start: [`${year}-01-01`, ...boundaries][index],
					fromWeek,
					toWeek,
				}))
			)
			const columns = segments.flatMap(({ fromWeek, toWeek }) =>
				Array.from(
					{ length: toWeek - fromWeek },
					(_, index) => fromWeek + index
				)
			)
			expect(columns).toEqual(Array.from({ length: 53 }, (_, index) => index))
		}
	)
})

describe('getYearWeeks', () => {
	it.each([
		{ year: 2021, days: 365, leading: 5, trailing: 1, columns: 53 },
		{ year: 2022, days: 365, leading: 6, trailing: 0, columns: 53 },
		{ year: 2023, days: 365, leading: 0, trailing: 6, columns: 53 },
		{ year: 2024, days: 366, leading: 1, trailing: 4, columns: 53 },
		{ year: 2025, days: 365, leading: 3, trailing: 3, columns: 53 },
		{ year: 2028, days: 366, leading: 6, trailing: 6, columns: 54 },
	])(
		'places every day of $year once between outside padding cells',
		({ year, days, leading, trailing, columns }) => {
			const weeks = getYearWeeks(
				{ year, total: 0, counts: Array.from({ length: days }, () => 0) },
				`${year}-12-31`
			)
			const cells = weeks.flat()

			expect(weeks).toHaveLength(columns)
			expect(weeks.every(week => week.length === 7)).toBe(true)
			expect(cells.slice(0, leading)).toEqual(
				Array.from({ length: leading }, () => ({ kind: 'outside' }))
			)
			expect(cells.slice(leading + days)).toEqual(
				Array.from({ length: trailing }, () => ({ kind: 'outside' }))
			)
			expect(cells.slice(leading, leading + days)).toEqual(
				Array.from({ length: days }, (_, index) => ({
					kind: 'day',
					date: new Date(Date.UTC(year, 0, index + 1))
						.toISOString()
						.slice(0, 10),
					count: 0,
					level: 0,
				}))
			)
		}
	)

	it('keeps today as a day and hides later counts as future cells', () => {
		const counts = Array.from({ length: 365 }, () => 0)
		counts[0] = 5
		counts[1] = 81
		counts[2] = 31
		const weeks = getYearWeeks({ year: 2025, total: 117, counts }, '2025-01-02')

		expect(weeks[0]).toEqual([
			{ kind: 'outside' },
			{ kind: 'outside' },
			{ kind: 'outside' },
			{ kind: 'day', date: '2025-01-01', count: 5, level: 2 },
			{ kind: 'day', date: '2025-01-02', count: 81, level: 5 },
			{ kind: 'future' },
			{ kind: 'future' },
		])
		expect(weeks.flat().filter(cell => cell.kind === 'future')).toHaveLength(
			363
		)
		expect(weeks.at(-1)?.slice(4)).toEqual(
			Array.from({ length: 3 }, () => ({ kind: 'outside' }))
		)
	})

	it('places leap day and Dec 31 on their UTC weekdays', () => {
		const counts = Array.from({ length: 366 }, () => 0)
		counts[59] = 13
		counts[365] = 31
		const year: ContributionYear = { year: 2024, total: 44, counts }
		const weeks = getYearWeeks(year, '2025-01-01')

		expect(weeks[8]?.[4]).toEqual({
			kind: 'day',
			date: '2024-02-29',
			count: 13,
			level: 3,
		})
		expect(weeks[52]?.[2]).toEqual({
			kind: 'day',
			date: '2024-12-31',
			count: 31,
			level: 4,
		})
	})

	it('marks the whole year future when today is before Jan 1', () => {
		const cells = getYearWeeks(
			{ year: 2024, total: 0, counts: Array.from({ length: 366 }, () => 0) },
			'2023-12-31'
		).flat()

		expect(cells.filter(cell => cell.kind === 'future')).toHaveLength(366)
		expect(cells.filter(cell => cell.kind === 'outside')).toHaveLength(5)
		expect(cells.some(cell => cell.kind === 'day')).toBe(false)
	})
})
