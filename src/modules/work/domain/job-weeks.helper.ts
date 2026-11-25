import type {
	ContributionPeriod,
	ContributionLevelThresholds,
} from '../../contributions/domain/contribution.types'
import type { Job } from '../../profile/domain/profile.schemas'

export const WEEKLY_THRESHOLDS: ContributionLevelThresholds = [
	1, 16, 46, 101, 221,
]

export function getJobPeriodRange(
	{ start, end }: Job['period'],
	today: string
): ContributionPeriod {
	const from = `${start}-01`

	if (end === undefined) return { from, to: today }

	const lastDay = new Date(
		Date.UTC(Number(end.slice(0, 4)), Number(end.slice(5)), 0)
	)

	return { from, to: lastDay.toISOString().slice(0, 10) }
}
