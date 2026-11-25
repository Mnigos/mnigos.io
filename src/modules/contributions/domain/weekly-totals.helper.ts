import type {
	ContributionPeriod,
	ContributionYear,
	WeeklyTotal,
} from './contribution.types'
import { addDays } from './iso-date.helper'

/** Consecutive 7-day buckets from `from`, the last one clipped at `to`; days without data count as 0. */
export function getWeeklyTotals(
	years: readonly ContributionYear[],
	{ from, to }: ContributionPeriod
) {
	const countByDate = new Map(
		years.flatMap(({ year, counts }) =>
			counts.map(
				(count, index) => [addDays(`${year}-01-01`, index), count] as const
			)
		)
	)
	const totals: WeeklyTotal[] = []

	for (
		let weekStart = from;
		weekStart <= to;
		weekStart = addDays(weekStart, 7)
	) {
		const dates = Array.from({ length: 7 }, (_, day) =>
			addDays(weekStart, day)
		).filter(date => date <= to)

		totals.push({
			weekStart,
			total: dates.reduce((sum, date) => sum + (countByDate.get(date) ?? 0), 0),
		})
	}

	return totals
}
