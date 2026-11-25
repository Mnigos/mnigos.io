import type { ContributionLevelThresholds } from './contribution.types'

const DAILY_THRESHOLDS: ContributionLevelThresholds = [1, 5, 13, 31, 81]

export function getContributionLevel(
	count: number,
	thresholds = DAILY_THRESHOLDS
) {
	return thresholds.filter(threshold => count >= threshold).length
}
