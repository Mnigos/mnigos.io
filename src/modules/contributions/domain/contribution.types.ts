/** `counts[i]` is the count on Jan 1 + `i` days (UTC) and covers the whole year, future days as 0. */
export interface ContributionYear {
	year: number
	total: number
	counts: number[]
}

/** Lower bounds of levels 1 to 8; a count below the first is level 0. */
export type ContributionLevelThresholds = readonly [
	number,
	number,
	number,
	number,
	number,
	number,
	number,
	number,
]

/** Week columns `[fromWeek, toWeek)` of the segment that starts on `start`. */
export interface YearSegment {
	start: string
	fromWeek: number
	toWeek: number
}

export type ContributionCell =
	| { kind: 'outside' }
	| { kind: 'future' }
	| { kind: 'day'; date: string; count: number; level: number }

/** Inclusive ISO dates, may span years. */
export interface ContributionPeriod {
	from: string
	to: string
}

export interface WeeklyTotal {
	weekStart: string
	total: number
}

/** Pushes, commits, merge requests opened, merge requests merged, approvals, issues opened, issues closed, comments, branch deletions, other. */
export type GitLabEventCounts = readonly number[]

/** GitLab event counts by ISO date, only for days with events. */
export type GitLabEventDays = Readonly<Record<string, GitLabEventCounts>>
