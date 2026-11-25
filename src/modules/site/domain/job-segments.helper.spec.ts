import { afterEach, describe, expect, it, vi } from 'vitest'
import * as contributionWeeks from '../../contributions/domain/contribution-weeks.helper'
import { PROFILE } from '../../profile/content/profile.content'
import type { Job } from '../../profile/domain/profile.schemas'
import { getJobSegments } from './job-segments.helper'

function makeJob(period: Job['period'], company = 'Example'): Job {
	return {
		company,
		role: 'Engineer',
		period,
		description: 'Fixture job',
		groups: [],
	}
}

afterEach(() => {
	vi.restoreAllMocks()
})

describe('getJobSegments', () => {
	it('leaves a year without jobs as one unlabeled segment', () => {
		expect(getJobSegments(2024, [])).toStrictEqual([
			{ start: '2024-01-01', fromWeek: 0, toWeek: 53 },
		])
	})

	it('splits at the start month and after the inclusive end month', () => {
		const jobs: Job[] = [makeJob({ start: '2024-03', end: '2024-07' })]

		expect(getJobSegments(2024, jobs)).toStrictEqual([
			{ start: '2024-01-01', fromWeek: 0, toWeek: 8 },
			{
				start: '2024-03-01',
				fromWeek: 8,
				toWeek: 30,
				label: { company: 'Example', role: 'Engineer' },
			},
			{ start: '2024-08-01', fromWeek: 30, toWeek: 53 },
		])
	})

	it('deduplicates and sorts boundaries regardless of job order and ignores other years', () => {
		const jobs: Job[] = [
			makeJob({ start: '2024-10', end: '2024-12' }),
			makeJob({ start: '2025-03', end: '2025-06' }),
			makeJob({ start: '2024-05', end: '2024-09' }),
			makeJob({ start: '2022-07', end: '2023-08' }),
			makeJob({ start: '2024-02', end: '2024-04' }),
		]

		expect(getJobSegments(2024, jobs).map(({ start }) => start)).toEqual([
			'2024-01-01',
			'2024-02-01',
			'2024-05-01',
			'2024-10-01',
		])
	})

	it('does not add a boundary for a job starting in January', () => {
		const jobs: Job[] = [makeJob({ start: '2024-01' })]

		expect(getJobSegments(2024, jobs)).toStrictEqual([
			{
				start: '2024-01-01',
				fromWeek: 0,
				toWeek: 53,
				label: { company: 'Example', role: 'Engineer' },
			},
		])
	})

	it.each([
		{ year: 2024, label: { company: 'Example', role: 'Engineer' } },
		{ year: 2025, label: undefined },
	])('does not split $year for a December 2024 end', ({ year, label }) => {
		const jobs: Job[] = [makeJob({ start: '2020-01', end: '2024-12' })]
		const segments = getJobSegments(year, jobs)

		expect(segments).toHaveLength(1)
		expect(segments[0]).toMatchObject({
			start: `${year}-01-01`,
			fromWeek: 0,
			toWeek: 53,
		})
		expect(segments[0]?.label).toStrictEqual(label)
	})

	it('labels the job covering each start and leaves the gap between jobs unlabeled', () => {
		const jobs: Job[] = [
			makeJob({ start: '2024-10' }, 'Later'),
			makeJob({ start: '2023-01', end: '2024-03' }, 'Earlier'),
		]

		expect(getJobSegments(2024, jobs)).toStrictEqual([
			{
				start: '2024-01-01',
				fromWeek: 0,
				toWeek: 13,
				label: { company: 'Earlier' },
			},
			{ start: '2024-04-01', fromWeek: 13, toWeek: 39 },
			{
				start: '2024-10-01',
				fromWeek: 39,
				toWeek: 53,
				label: { company: 'Later' },
			},
		])
	})

	it.each([2025, 2026, 2035])(
		'keeps a current job covering the whole of %i',
		year => {
			const jobs: Job[] = [makeJob({ start: '2024-10' })]

			expect(getJobSegments(year, jobs)).toStrictEqual([
				{
					start: `${year}-01-01`,
					fromWeek: 0,
					toWeek: contributionWeeks.getWeekCount(year),
					label: { company: 'Example', role: 'Engineer' },
				},
			])
		}
	)

	it('drops the role when a job segment spans exactly 19 columns', () => {
		const jobs: Job[] = [makeJob({ start: '2023-09' })]

		expect(getJobSegments(2023, jobs)).toStrictEqual([
			{ start: '2023-01-01', fromWeek: 0, toWeek: 34 },
			{
				start: '2023-09-01',
				fromWeek: 34,
				toWeek: 53,
				label: { company: 'Example' },
			},
		])
	})

	it('retains the role when the splitter returns exactly 20 columns', () => {
		const jobs: Job[] = [makeJob({ start: '2024-01' })]
		// Month boundaries cannot produce exactly 20 columns in a calendar year.
		vi.spyOn(contributionWeeks, 'splitYearIntoSegments').mockReturnValueOnce([
			{ start: '2024-01-01', fromWeek: 0, toWeek: 20 },
		])

		expect(getJobSegments(2024, jobs)).toStrictEqual([
			{
				start: '2024-01-01',
				fromWeek: 0,
				toWeek: 20,
				label: { company: 'Example', role: 'Engineer' },
			},
		])
	})

	it.each([
		{
			year: 2021,
			expected: [
				{ start: '2021-01-01', fromWeek: 0, toWeek: 31 },
				{
					start: '2021-08-01',
					fromWeek: 31,
					toWeek: 53,
					label: { company: 'Tenset', role: 'Software Engineer' },
				},
			],
		},
		{
			year: 2022,
			expected: [
				{
					start: '2022-01-01',
					fromWeek: 0,
					toWeek: 53,
					label: { company: 'Tenset', role: 'Software Engineer' },
				},
			],
		},
		{
			year: 2023,
			expected: [
				{
					start: '2023-01-01',
					fromWeek: 0,
					toWeek: 53,
					label: { company: 'Tenset', role: 'Software Engineer' },
				},
			],
		},
		{
			year: 2024,
			expected: [
				{
					start: '2024-01-01',
					fromWeek: 0,
					toWeek: 13,
					label: { company: 'Tenset' },
				},
				{ start: '2024-04-01', fromWeek: 13, toWeek: 39 },
				{
					start: '2024-10-01',
					fromWeek: 39,
					toWeek: 53,
					label: { company: 'Blazity' },
				},
			],
		},
		{
			year: 2025,
			expected: [
				{
					start: '2025-01-01',
					fromWeek: 0,
					toWeek: 22,
					label: { company: 'Blazity', role: 'Frontend Developer' },
				},
				{
					start: '2025-06-01',
					fromWeek: 22,
					toWeek: 53,
					label: { company: 'Ludus AI', role: 'Fullstack Developer' },
				},
			],
		},
		{
			year: 2026,
			expected: [
				{
					start: '2026-01-01',
					fromWeek: 0,
					toWeek: 53,
					label: { company: 'Ludus AI', role: 'Fullstack Developer' },
				},
			],
		},
	])(
		'pins PROFILE jobs and covers every column in $year',
		({ year, expected }) => {
			const segments = getJobSegments(year, PROFILE.jobs)

			expect(segments).toStrictEqual(expected)
			expect(segments[0]?.fromWeek).toBe(0)
			for (const [index, segment] of segments.slice(0, -1).entries()) {
				expect(segment.toWeek).toBe(segments[index + 1]?.fromWeek)
			}
			expect(segments.at(-1)?.toWeek).toBe(contributionWeeks.getWeekCount(year))
		}
	)
})
