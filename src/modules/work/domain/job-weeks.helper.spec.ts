import { assert, describe, expect, it } from 'vitest'
import { getContributionLevel } from '../../contributions/domain/contribution-level.helper'
import { getWeeklyTotals } from '../../contributions/domain/weekly-totals.helper'
import { PROFILE } from '../../profile/content/profile.content'
import { getJobPeriodRange, WEEKLY_THRESHOLDS } from './job-weeks.helper'

const TODAY = '2026-11-25'
const JOB_RANGES = [
	{
		company: 'Tenset',
		range: { from: '2021-08-01', to: '2024-03-31' },
		weeks: 140,
		lastWeek: { weekStart: '2024-03-31', total: 1 },
	},
	{
		company: 'Blazity',
		range: { from: '2024-10-01', to: '2025-05-31' },
		weeks: 35,
		lastWeek: { weekStart: '2025-05-27', total: 5 },
	},
	{
		company: 'Ludus AI',
		range: { from: '2025-06-01', to: TODAY },
		weeks: 78,
		lastWeek: { weekStart: '2026-11-22', total: 4 },
	},
]

describe('getJobPeriodRange', () => {
	it.each([
		['2025-04', '2025-04-30'],
		['2025-05', '2025-05-31'],
		['2024-02', '2024-02-29'],
		['2025-02', '2025-02-28'],
		['2025-12', '2025-12-31'],
	])('includes the first and last days of %s', (month, to) => {
		expect(
			getJobPeriodRange({ start: month, end: month }, TODAY)
		).toStrictEqual({ from: `${month}-01`, to })
	})

	it('ends a current job on the supplied date', () => {
		expect(getJobPeriodRange({ start: '2025-06' }, '2025-06-01')).toStrictEqual(
			{ from: '2025-06-01', to: '2025-06-01' }
		)
	})

	it.each(JOB_RANGES)('maps the real $company period', ({ company, range }) => {
		const job = PROFILE.jobs.find(candidate => candidate.company === company)

		assert(job !== undefined)
		expect(getJobPeriodRange(job.period, TODAY)).toStrictEqual(range)
	})

	it.each(JOB_RANGES)(
		'covers $weeks weeks for $company and clips the last week',
		({ company, range, weeks, lastWeek }) => {
			const job = PROFILE.jobs.find(candidate => candidate.company === company)
			const years = [2021, 2022, 2023, 2024, 2025, 2026].map(year => {
				const days = year === 2024 ? 366 : 365

				return {
					year,
					total: days,
					counts: Array.from({ length: days }, () => 1),
				}
			})

			assert(job !== undefined)

			const totals = getWeeklyTotals(
				years,
				getJobPeriodRange(job.period, TODAY)
			)

			expect(totals).toHaveLength(weeks)
			expect(totals[0]).toStrictEqual({ weekStart: range.from, total: 7 })
			expect(totals.slice(0, -1).every(({ total }) => total === 7)).toBe(true)
			expect(totals.at(-1)).toStrictEqual(lastWeek)
		}
	)
})

describe('WEEKLY_THRESHOLDS', () => {
	it.each([
		[0, 0],
		[1, 1],
		[15, 1],
		[16, 2],
		[45, 2],
		[46, 3],
		[100, 3],
		[101, 4],
		[170, 4],
		[171, 5],
		[250, 5],
		[251, 6],
		[400, 6],
		[401, 7],
		[600, 7],
		[601, 8],
		[1_000_000, 8],
	])('maps weekly total %i to level %i', (total, expected) => {
		expect(getContributionLevel(total, WEEKLY_THRESHOLDS)).toBe(expected)
	})
})
