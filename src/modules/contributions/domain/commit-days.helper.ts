import type { CommitDays, ContributionYear } from './contribution.types'
import { getDayOfYear, getDaysInYear } from './iso-date.helper'

/** Adds up the commit days of every source into full calendar years, only for years that have commits. */
export function getCommitYears(sources: readonly CommitDays[]) {
	const entries = sources.flatMap(days => Object.entries(days))
	const years = [
		...new Set(entries.map(([date]) => Number(date.slice(0, 4)))),
	].toSorted((first, second) => first - second)

	return years.map((year): ContributionYear => {
		const counts = Array.from({ length: getDaysInYear(year) }, () => 0)

		for (const [date, count] of entries)
			if (date.startsWith(`${year}-`)) counts[getDayOfYear(date)] += count

		return {
			year,
			total: counts.reduce((sum, count) => sum + count, 0),
			counts,
		}
	})
}
