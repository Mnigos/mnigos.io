import { getContributionLevel } from './contribution-level.helper'
import type {
	ContributionCell,
	ContributionYear,
	YearSegment,
} from './contribution.types'
import { addDays, getDayOfYear, getDaysInYear } from './iso-date.helper'

function getJan1Weekday(year: number) {
	return new Date(Date.UTC(year, 0, 1)).getUTCDay()
}

/** Weeks start on Sunday, so week 0 is the one holding Jan 1. */
export function getWeekOfYear(date: string) {
	const jan1Weekday = getJan1Weekday(new Date(date).getUTCFullYear())

	return Math.floor((getDayOfYear(date) + jan1Weekday) / 7)
}

export function getWeekCount(year: number) {
	return Math.ceil((getJan1Weekday(year) + getDaysInYear(year)) / 7)
}

/** `boundaries` are ascending ISO dates after Jan 1 inside `year`; the first segment starts on Jan 1. */
export function splitYearIntoSegments(
	year: number,
	boundaries: readonly string[]
): YearSegment[] {
	const starts = [`${year}-01-01`, ...boundaries]

	return starts.map((start, index) => {
		const next = starts[index + 1]

		return {
			start,
			fromWeek: getWeekOfYear(start),
			toWeek: next ? getWeekOfYear(next) : getWeekCount(year),
		}
	})
}

/** Week columns of seven weekday cells (Sunday first); days after `today` are `future`. */
export function getYearWeeks(
	{ year, counts }: ContributionYear,
	today: string
): ContributionCell[][] {
	const jan1Weekday = getJan1Weekday(year)

	return Array.from({ length: getWeekCount(year) }, (_, week) =>
		Array.from({ length: 7 }, (_day, weekday): ContributionCell => {
			const dayOfYear = week * 7 + weekday - jan1Weekday
			const count = counts[dayOfYear]

			if (count === undefined) return { kind: 'outside' }

			const date = addDays(`${year}-01-01`, dayOfYear)

			if (date > today) return { kind: 'future' }

			return { kind: 'day', date, count, level: getContributionLevel(count) }
		})
	)
}
