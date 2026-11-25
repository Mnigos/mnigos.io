import type { ContributionLevelThresholds } from './contribution.types'

export const RIGTCH_FM_FIRST_WEEK = '2022-11-01'

/** Weekly commit sums, far below the contribution sums that `WEEKLY_THRESHOLDS` scale. */
export const RIGTCH_FM_WEEKLY_THRESHOLDS: ContributionLevelThresholds = [
	1, 5, 10, 20, 35, 60, 100, 150,
]
