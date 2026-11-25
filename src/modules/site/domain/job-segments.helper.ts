import { splitYearIntoSegments } from '../../contributions/domain/contribution-weeks.helper'
import type { YearSegment } from '../../contributions/domain/contribution.types'
import type { Job, Month } from '../../profile/domain/profile.schemas'

const MIN_WEEKS_FOR_ROLE = 20

export interface JobLabel {
	company: string
	role?: string
}

/** `label` is absent when no job covers the segment's start. */
export interface JobSegment extends YearSegment {
	label?: JobLabel
}

function getNextMonthStart(month: Month) {
	const date = new Date(`${month}-01`)

	date.setUTCMonth(date.getUTCMonth() + 1)

	return date.toISOString().slice(0, 10)
}

function getBoundaries(year: number, jobs: readonly Job[]) {
	const dates = jobs.flatMap(({ period }) => [
		`${period.start}-01`,
		...(period.end ? [getNextMonthStart(period.end)] : []),
	])
	const inYear = dates.filter(
		date => date.startsWith(`${year}-`) && date !== `${year}-01-01`
	)

	return [...new Set(inYear)].toSorted()
}

function findJobAt(date: string, jobs: readonly Job[]) {
	const month = date.slice(0, 7)

	return jobs.find(
		({ period }) =>
			period.start <= month && (period.end === undefined || month <= period.end)
	)
}

/** Splits `year` where a job starts or the month after one ends, and labels each part with the job held at its start. */
export function getJobSegments(
	year: number,
	jobs: readonly Job[]
): JobSegment[] {
	return splitYearIntoSegments(year, getBoundaries(year, jobs)).map(segment => {
		const job = findJobAt(segment.start, jobs)

		if (!job) return segment

		const { company, role } = job

		return {
			...segment,
			label:
				segment.toWeek - segment.fromWeek < MIN_WEEKS_FOR_ROLE
					? { company }
					: { company, role },
		}
	})
}
